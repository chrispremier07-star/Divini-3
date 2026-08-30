/**
 * DIVINI exo — Tests Command Center + Notification Center (LOT 04)
 *
 * Couvre ce que jsdom peut vérifier : construction de l'index, filtrage tolérant,
 * surlignage, garde-fous (planifié / non activé / relais LOT 14), règle de
 * destination des notifications, portée tenant ⇄ établissement, préférences.
 *
 * Le rendu réel (palette 560 px, blur, breakpoints, reduced-motion) est assumé
 * et reporté dans LOT-04-VALIDATION.md.
 */

import { afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCommandIndex,
  searchCommands,
  highlightSegments,
  normalize,
  scoreCommand
} from '../apps/web/src/components/command/search.ts';

import {
  makeNotifications,
  formatNotificationTime,
  NOTIFICATION_CATEGORIES,
  CATEGORY_LABELS
} from '../apps/web/src/components/notifications/index.ts';

import { DEFAULT_PREFS } from '../apps/web/src/components/notifications/prefs.ts';

import { ShellStateProvider } from '../apps/web/src/lib/shell-state.tsx';
import { siteScope } from '../apps/web/src/lib/scope.ts';

import { NotificationProvider, useNotifications } from '../apps/web/src/components/notifications/NotificationCenter.tsx';

import { createDom } from './helpers/dom.mjs';
import { h, render, unmountAll, act } from './helpers/react.mjs';

before(() => createDom());
afterEach(() => unmountAll());

/* ------------------------- Index & recherche (palette) -------------------- */

describe('Command Center — index & recherche', () => {
  const index = buildCommandIndex();

  it('expose les cinq sections du corpus', () => {
    const sections = new Set(index.map((i) => i.section));
    for (const s of ['navigation', 'entites', 'actions', 'analyse', 'taches']) {
      assert.ok(sections.has(s), `section manquante : ${s}`);
    }
  });

  it('normalise casse et diacritiques', () => {
    assert.equal(normalize('Établissements'), 'etablissements');
    assert.equal(normalize('  Nouvelle   Vente !'), 'nouvelle vente');
  });

  it('retrouve « facture » malgré la faute de frappe « factre »', () => {
    const groups = searchCommands(index, 'factre');
    const labels = groups.flatMap((g) => g.items.map((i) => i.label)).join(' ');
    assert.ok(labels.includes('Facture'), `tolérance en échec : ${labels}`);
  });

  it('« stok » ramène le stock (tolérance) et « notification » la navigation', () => {
    assert.ok(searchCommands(index, 'stok').length > 0);
    const notif = searchCommands(index, 'notification');
    assert.ok(notif.some((g) => g.section === 'navigation'));
  });

  it('le surlignage isole la correspondance', () => {
    const segs = highlightSegments('Nouvelle vente', 'vente');
    assert.deepEqual(
      segs.map((s) => [s.text, s.match]),
      [['Nouvelle ', false], ['vente', true]]
    );
  });

  it('garde-fou : les actions métier sont planifiées, jamais exécutables', () => {
    for (const item of index.filter((i) => i.section === 'actions' && i.kind === 'planned')) {
      assert.ok(item.lot > 0, 'action planifiée sans LOT');
      assert.ok(item.permission, 'action sensible sans permission affichée');
    }
  });

  it('garde-fou : COPILOT / AUTOPILOT relayés LOT 14, non simulés', () => {
    const copilot = index.filter((i) => i.kind === 'copilot');
    const autopilot = index.filter((i) => i.kind === 'autopilot');
    assert.ok(copilot.length > 0 && autopilot.length > 0);
    for (const item of [...copilot, ...autopilot]) {
      assert.match(item.hint ?? '', /LOT 14/);
    }
  });

  it('toute commande « navigate » porte une route réelle', () => {
    for (const item of index.filter((i) => i.kind === 'navigate')) {
      assert.ok(item.route && item.route.startsWith('/'), `route morte : ${item.id}`);
    }
  });

  it('le score discrimine une correspondance exacte d’une absence', () => {
    const item = index.find((i) => i.label === 'Nouvelle vente');
    assert.ok(scoreCommand(item, 'vente') > 0);
    assert.equal(scoreCommand(item, 'zzzz'), 0);
  });
});

/* ----------------------- Notification Center : contrat -------------------- */

describe('Notification Center — contrat de données', () => {
  const REAL_ROUTES = new Set([
    '/',
    '/app',
    '/app/notifications',
    '/app/parametres/notifications',
    '/dev/tokens',
    '/dev/ui',
    '/dev/shell',
    '/dev/data'
  ]);

  it('chaque notification a une destination réelle et actionnable', () => {
    for (const n of makeNotifications()) {
      assert.ok(REAL_ROUTES.has(n.destination.route), `destination morte : ${n.id} → ${n.destination.route}`);
      assert.ok(n.destination.label.length > 0, 'action sans libellé');
    }
  });

  it('les douze catégories du corpus existent', () => {
    assert.equal(NOTIFICATION_CATEGORIES.length, 12);
    for (const c of NOTIFICATION_CATEGORIES) assert.ok(CATEGORY_LABELS[c]);
  });

  it('le flux est déterministe (SSR stable)', () => {
    const a = makeNotifications();
    const b = makeNotifications();
    assert.deepEqual(a.map((n) => n.id), b.map((n) => n.id));
    assert.equal(formatNotificationTime(a[0].at), formatNotificationTime(b[0].at));
  });

  it('préférences par défaut : seul in-app actif, toutes catégories', () => {
    assert.equal(DEFAULT_PREFS.channels['in-app'], true);
    assert.equal(DEFAULT_PREFS.channels.email, false);
    assert.equal(DEFAULT_PREFS.channels.whatsapp, false);
    assert.ok(NOTIFICATION_CATEGORIES.every((c) => DEFAULT_PREFS.categories[c]));
  });
});

/* ----------------------- Notification Center : portée --------------------- */

import { useEffect } from 'react';
import { useShellState } from '../apps/web/src/lib/shell-state.tsx';

let notifApi = null;
function Probe() {
  notifApi = useNotifications();
  return null;
}

function SetSiteEffect({ children }) {
  const { setScope } = useShellState();
  useEffect(() => {
    setScope(siteScope('siege'));
  }, [setScope]);
  return children;
}

describe('Notification Center — portée & lecture', () => {
  it('le tenant voit tout ; un établissement ne voit que le sien', async () => {
    const tenant = await render(
      h(ShellStateProvider, null, h(NotificationProvider, null, h(Probe)))
    );
    const all = notifApi.visible.length;
    assert.ok(all > 0);
    await tenant.unmount();

    const site = await render(
      h(ShellStateProvider, null, h(SetSiteEffect, null, h(NotificationProvider, null, h(Probe))))
    );
    assert.ok(notifApi.visible.length < all, 'la portée site doit réduire le flux');
    assert.ok(notifApi.visible.every((n) => n.siteId === 'siege'));
    await site.unmount();
  });

  it('marquer tout comme lu met le compteur à zéro', async () => {
    const view = await render(
      h(ShellStateProvider, null, h(NotificationProvider, null, h(Probe)))
    );
    assert.ok(notifApi.unreadCount > 0);
    await act(async () => notifApi.markAllRead());
    assert.equal(notifApi.unreadCount, 0);
    await view.unmount();
  });
});
