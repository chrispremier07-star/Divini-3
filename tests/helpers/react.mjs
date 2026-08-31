/**
 * DIVINI exo — Harnais de rendu React pour les tests
 *
 * Rend de vrais composants React 19 dans jsdom et permet de les piloter
 * (clics, touches, re-rendus). Aucun composant n'est réimplémenté ici :
 * les tests importent les modules du projet.
 */

import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Roots encore montés.
 *
 * Sans ce suivi, une assertion qui échoue avant `unmount()` laisse un root
 * React vivant : son scheduler garde une poignée ouverte et le processus de
 * test ne se termine jamais. `unmountAll()` est appelé en nettoyage de test.
 */
const active = new Set();

/** Rend `element` dans un conteneur attaché au document. */
export async function render(element) {
  const container = document.createElement('div');
  container.id = 'test-root';
  document.body.appendChild(container);

  const root = createRoot(container);
  await act(async () => {
    root.render(element);
  });

  const view = {
    container,
    root,
    async rerender(next) {
      await act(async () => {
        root.render(next);
      });
    },
    async unmount() {
      if (!active.has(root)) return;
      active.delete(root);
      await act(async () => {
        root.unmount();
      });
      container.remove();
    }
  };

  active.add(root);
  return view;
}

/** Démonte tout ce qui est encore monté — à appeler en `afterEach`. */
export async function unmountAll() {
  for (const root of Array.from(active)) {
    await act(async () => {
      root.unmount();
    });
  }
  active.clear();
  document.body.innerHTML = '';
}

/** Clic réel (pointer + mouse) sur un élément. */
export async function click(el) {
  await act(async () => {
    el.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

/**
 * Appuie sur une touche, comme le ferait l'utilisateur.
 *
 * `target` peut être un élément ou le document. On remonte toujours au
 * `defaultView` du document porteur pour construire l'événement dans le bon
 * royaume jsdom.
 */
export async function pressKey(key, target = document, init = {}) {
  const doc = target.ownerDocument ?? target;
  const view = doc.defaultView;
  let prevented = false;

  await act(async () => {
    const event = new view.KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...init
    });
    target.dispatchEvent(event);
    prevented = event.defaultPrevented;
  });

  return prevented;
}

export { act, createElement as h };
