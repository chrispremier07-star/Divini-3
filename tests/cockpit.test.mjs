/**
 * DIVINI exo — Tests Cockpit (LOT 05)
 *
 * Vérifie la cohérence obligatoire des données (KPI ⇄ graphique), la non-opacité
 * des signaux (cause + source + action), les missions avec impact estimé, et les
 * familles d'états d'écran. Le rendu réel (breakpoints, thèmes, reduced-motion)
 * est reporté dans LOT-05-VALIDATION.md.
 */

import { afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  revenueFor,
  revenueSeries,
  cockpitKpis,
  WATCH_SIGNALS,
  GOOD_SIGNALS,
  MISSIONS
} from '../apps/web/src/components/cockpit/index.ts';

import { Cockpit } from '../apps/web/src/components/cockpit/Cockpit.tsx';

import { ShellStateProvider } from '../apps/web/src/lib/shell-state.tsx';
import { ToastProvider } from '../apps/web/src/components/ui/Toast.tsx';
import { CommandCenterProvider } from '../apps/web/src/components/command/CommandCenter.tsx';

import { createDom } from './helpers/dom.mjs';
import { h, render, unmountAll, act } from './helpers/react.mjs';

before(() => createDom());
afterEach(() => unmountAll());

function inCockpit(element) {
  return h(
    ShellStateProvider,
    null,
    h(ToastProvider, null, h(CommandCenterProvider, null, element))
  );
}

async function flush(delay = 450) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, delay));
  });
}

describe('Cockpit — cohérence des données', () => {
  it('le CA annoncé est la somme de la série affichée (chaque période)', () => {
    for (const period of ['today', '7d', '30d']) {
      const { values } = revenueSeries(period);
      const sum = values.reduce((a, b) => a + b, 0);
      assert.equal(revenueFor(period), sum, `incohérence CA ⇄ série sur ${period}`);
      const kpiCa = cockpitKpis(period).find((k) => k.id === 'kpi-ca');
      assert.equal(kpiCa.value, sum, `le KPI CA ne correspond pas à la série (${period})`);
    }
  });

  it('les séries ont la bonne granularité', () => {
    assert.equal(revenueSeries('today').values.length, 8);
    assert.equal(revenueSeries('7d').values.length, 7);
    assert.equal(revenueSeries('30d').values.length, 30);
  });

  it('les séries sont déterministes (SSR stable)', () => {
    assert.deepEqual(revenueSeries('7d').values, revenueSeries('7d').values);
  });
});

describe('Cockpit — signaux non opaques et actionnables', () => {
  const all = [...WATCH_SIGNALS, ...GOOD_SIGNALS];

  it('chaque signal explique sa cause et cite sa donnée source', () => {
    for (const s of all) {
      assert.ok(s.cause.length > 0, `${s.id} sans cause`);
      assert.ok(s.source.length > 0, `${s.id} sans source`);
    }
  });

  it('chaque signal mène à une route réelle ou à un LOT annoncé', () => {
    for (const s of all) {
      assert.ok(
        s.action.route || typeof s.action.lot === 'number',
        `${s.id} : action sans destination ni lot`
      );
    }
  });

  it('le nombre de signaux affichés est borné (« tout voir » pour le reste)', () => {
    assert.ok(WATCH_SIGNALS.length <= 6, 'trop de signaux à surveiller affichés');
    assert.ok(GOOD_SIGNALS.length <= 6, 'trop de bonnes nouvelles affichées');
  });
});

describe('Cockpit — missions du jour', () => {
  it('chaque mission porte un impact financier présenté comme estimation', () => {
    for (const m of MISSIONS) {
      assert.match(m.impact, /≈/, `${m.id} : impact non présenté comme estimation`);
      assert.ok(m.action.label.length > 0, `${m.id} sans action`);
    }
  });
});

describe('Cockpit — rendu & états', () => {
  it('prêt : hiérarchie À surveiller → Mission → KPI → graphe + bandeau démo', async () => {
    const view = await render(inCockpit(h(Cockpit, null)));
    await flush();

    const text = document.body.textContent ?? '';
    assert.ok(text.includes('données de démonstration') || text.includes('démonstration'), 'bandeau démo absent');
    assert.ok(text.includes('À surveiller'), 'section À surveiller absente');
    assert.ok(text.includes('Mission du jour'), 'Mission du jour absente');
    assert.ok(text.includes('Indicateurs essentiels'), 'KPI absents');
    assert.ok(text.includes('chiffre d’affaires'), 'graphique absent');
    assert.ok(text.includes('Demander à l’IA'), 'entrée IA absente');

    const order = ['À surveiller', 'Mission du jour', 'Indicateurs essentiels'].map((t) =>
      text.indexOf(t)
    );
    assert.ok(order[0] < order[1] && order[1] < order[2], 'hiérarchie de lecture non respectée');
    await view.unmount();
  });

  it('vide : EmptyState utile', async () => {
    const view = await render(inCockpit(h(Cockpit, { demoState: 'empty' })));
    await flush();
    assert.ok((document.body.textContent ?? '').includes('Aucune activité'), 'EmptyState absent');
    await view.unmount();
  });

  it('erreur : ErrorState avec reprise', async () => {
    const view = await render(inCockpit(h(Cockpit, { demoState: 'error' })));
    await flush();
    assert.ok((document.body.textContent ?? '').includes('Impossible de charger'), 'ErrorState absent');
    await view.unmount();
  });

  it('permission refusée : droit manquant nommé', async () => {
    const view = await render(inCockpit(h(Cockpit, { demoState: 'denied' })));
    await flush();
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('Accès refusé'), 'PermissionDenied absent');
    assert.ok(text.includes('cockpit.view'), 'droit manquant non nommé');
    await view.unmount();
  });

  it('cocher une mission met à jour la progression sans rechargement', async () => {
    const view = await render(inCockpit(h(Cockpit, null)));
    await flush();
    const before = (document.body.textContent ?? '').match(/(\d+)\/(\d+) faites/);
    const checks = Array.from(document.querySelectorAll('button[aria-pressed]')).filter((b) =>
      (b.getAttribute('aria-label') ?? '').includes('Marquer')
    );
    assert.ok(checks.length > 0, 'aucune case de mission');
    const { click } = await import('./helpers/react.mjs');
    await click(checks[0]);
    const after = (document.body.textContent ?? '').match(/(\d+)\/(\d+) faites/);
    assert.notEqual(before?.[1], after?.[1], 'la progression n’a pas changé');
    await view.unmount();
  });
});
