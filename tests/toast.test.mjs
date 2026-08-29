/**
 * DIVINI exo — Tests du système de notifications
 *
 * Vérifie le comportement imposé par le corpus (l. 7940-7950) :
 *   - icône sémantique selon le ton ;
 *   - barre de progression fine, linéaire, absente quand le toast persiste ;
 *   - `critical` ne se ferme pas tout seul ;
 *   - sortie vers la droite : l'élément reste monté le temps de l'animation.
 *
 * Vérifie aussi le contrat d'accessibilité : région vivante, `role="alert"`
 * pour le critique et `role="status"` sinon.
 */

import { after, afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { ToastProvider, useToast } from '../apps/web/src/components/ui/index.ts';

import { createDom } from './helpers/dom.mjs';
import { act, click, h, render, unmountAll } from './helpers/react.mjs';

let dom;

before(() => {
  dom = createDom();
});

afterEach(async () => {
  await unmountAll();
});

after(() => {
  dom.window.close();
});

/** Attend un temps réel à l'intérieur d'un `act`, pour laisser les timers agir. */
async function wait(ms) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

/** Monte un fournisseur et expose `push` via un composant enfant. */
async function mountToasts() {
  let api = null;
  function Grab() {
    api = useToast();
    return null;
  }
  const view = await render(h(ToastProvider, null, h(Grab)));
  assert.ok(api, 'useToast expose push/dismiss dans un ToastProvider');
  return { view, push: (t) => api.push(t), dismiss: (id) => api.dismiss(id) };
}

/** Rôle ARIA attendu selon le ton. */
function toastEl(view) {
  return view.container.querySelector('[role="status"], [role="alert"]');
}

describe('Toast — contrat d’accessibilité', () => {
  it('le conteneur est une région vivante', async () => {
    const { view, push } = await mountToasts();
    push({ tone: 'info', title: 'Notification' });
    await wait(0);

    const viewport = view.container.querySelector('[aria-live]');
    assert.ok(viewport, 'une région aria-live est rendue');
    assert.equal(viewport.getAttribute('aria-live'), 'polite');
    assert.equal(viewport.getAttribute('aria-relevant'), 'additions text');
  });

  it('critical est annoncé en alert, les autres tons en status', async () => {
    const { view, push } = await mountToasts();
    push({ tone: 'critical', title: 'Incident critique' });
    await wait(0);

    assert.equal(toastEl(view).getAttribute('role'), 'alert', 'critical => role="alert"');

    await view.unmount();
    const second = await mountToasts();
    for (const tone of ['info', 'success', 'warning']) {
      second.push({ tone, title: `Ton ${tone}` });
    }
    await wait(0);

    const roles = Array.from(second.view.container.querySelectorAll('[role]'))
      .map((el) => el.getAttribute('role'))
      .filter((r) => r === 'status' || r === 'alert');
    assert.deepEqual(roles, ['status', 'status', 'status'], 'info/success/warning => status');
  });

  it('le bouton de fermeture est étiqueté', async () => {
    const { view, push } = await mountToasts();
    push({ tone: 'info', title: 'Notification' });
    await wait(0);

    const close = view.container.querySelector('button[aria-label="Fermer la notification"]');
    assert.ok(close, 'un bouton de fermeture étiqueté existe');
  });
});

describe('Toast — icône sémantique', () => {
  const cases = [
    ['info', 'M12 8'], // cercle + point : icône info
    ['success', null],
    ['warning', null],
    ['critical', null]
  ];

  it('chaque ton porte une icône distincte', async () => {
    const seen = {};
    for (const [tone] of cases) {
      const { view, push } = await mountToasts();
      push({ tone, title: `Ton ${tone}` });
      await wait(0);

      const svg = toastEl(view).querySelector('svg');
      assert.ok(svg, `le ton « ${tone} » affiche une icône`);
      seen[tone] = svg.innerHTML;

      await view.unmount();
    }

    const distinct = new Set(Object.values(seen));
    assert.equal(distinct.size, 4, `4 tons doivent donner 4 icônes distinctes, or ${distinct.size}`);
  });
});

describe('Toast — durée et barre de progression', () => {
  it('un toast ordinaire porte une barre calée sur sa durée', async () => {
    const { view, push } = await mountToasts();
    push({ tone: 'info', title: 'Info', duration: 3000 });
    await wait(0);

    const progress = view.container.querySelector('[style*="animation-duration"]');
    assert.ok(progress, 'une barre de progression est rendue');
    assert.match(
      progress.getAttribute('style'),
      /animation-duration:\s*3000ms/,
      'la durée de l’animation correspond à la durée du toast'
    );
    assert.equal(progress.getAttribute('aria-hidden'), 'true', 'barre décorative');
  });

  it('critical n’a pas de barre et ne se ferme pas tout seul', async () => {
    const { view, push } = await mountToasts();
    push({ tone: 'critical', title: 'Incident', duration: 50 });
    await wait(0);

    assert.equal(
      view.container.querySelector('[style*="animation-duration"]'),
      null,
      'un toast persistant n’affiche pas de compte à rebours'
    );

    await wait(200);
    assert.ok(toastEl(view), 'critical reste affiché bien au-delà de la durée demandée');
  });

  it('un toast ordinaire disparaît après sa durée', async () => {
    const { view, push } = await mountToasts();
    push({ tone: 'success', title: 'Enregistré', duration: 60 });
    await wait(0);
    assert.ok(toastEl(view), 'présent au départ');

    // 60 ms d'affichage + 220 ms d'animation de sortie.
    await wait(500);
    assert.equal(toastEl(view), null, 'disparu après sa durée');
  });
});

describe('Toast — sortie et action', () => {
  it('l’élément reste monté le temps de l’animation de sortie', async () => {
    const { view, push, dismiss } = await mountToasts();
    const id = push({ tone: 'info', title: 'Info', duration: 0 });
    await wait(0);

    dismiss(id);
    // Immédiatement après dismiss : encore dans le DOM, marqué comme sortant.
    const leaving = view.container.querySelector('[role="status"], [role="alert"]');
    assert.ok(leaving, 'encore monté juste après dismiss, pour jouer la sortie');

    await wait(400);
    assert.equal(toastEl(view), null, 'retiré une fois l’animation terminée');
  });

  it('l’action est exécutée puis le toast se ferme', async () => {
    const calls = [];
    const { view, push } = await mountToasts();
    push({
      tone: 'warning',
      title: 'Brouillon non envoyé',
      duration: 0,
      action: { label: 'Réessayer', onClick: () => calls.push('retry') }
    });
    await wait(0);

    const action = Array.from(view.container.querySelectorAll('button')).find(
      (b) => b.textContent.trim() === 'Réessayer'
    );
    assert.ok(action, 'le bouton d’action porte le libellé demandé');

    await click(action);
    assert.deepEqual(calls, ['retry'], 'l’action est exécutée');

    await wait(400);
    assert.equal(toastEl(view), null, 'le toast se ferme après l’action');
  });
});

describe('useToast — hors contexte', () => {
  it('refuse de fonctionner sans ToastProvider', async () => {
    function Orphan() {
      useToast();
      return null;
    }
    await assert.rejects(
      async () => render(h(Orphan)),
      /ToastProvider/,
      'une erreur explicite doit nommer le fournisseur manquant'
    );
  });
});
