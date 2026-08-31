/**
 * DIVINI exo — Banc de test : environnement DOM
 *
 * jsdom fournit un vrai DOM : focus, activeElement, KeyboardEvent, querySelector.
 * Ce n'est PAS un navigateur : ni rendu, ni layout, ni getComputedStyle avec
 * résolution de var(). Les vérifications visuelles restent hors de portée ici
 * et sont signalées comme telles dans les rapports de lot.
 */

import { JSDOM } from 'jsdom';

export function createDom(html = '') {
  const dom = new JSDOM(
    `<!doctype html><html data-theme="dark" data-density="comfortable"><body>${html}</body></html>`,
    { pretendToBeVisual: true, url: 'http://localhost/' }
  );

  const { window } = dom;

  // Les primitives consultent les globaux du navigateur.
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.Element = window.Element;
  globalThis.Node = window.Node;
  globalThis.KeyboardEvent = window.KeyboardEvent;
  globalThis.MouseEvent = window.MouseEvent;
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);

  return dom;
}

/** Pose le focus sur un élément et vérifie qu'il l'a réellement pris. */
export function focus(el) {
  el.focus();
  return el.ownerDocument.activeElement === el;
}

/** Envoie une touche à un élément et retourne true si l'événement a été annulé. */
export function press(el, key, init = {}) {
  const event = new el.ownerDocument.defaultView.KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init
  });
  el.dispatchEvent(event);
  return event.defaultPrevented;
}

/** Construit une liste de boutons focusables et les renvoie. */
export function makeFocusable(count, container) {
  const doc = container.ownerDocument;
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const b = doc.createElement('button');
    b.type = 'button';
    b.textContent = `item-${i + 1}`;
    b.setAttribute('data-i', String(i));
    container.appendChild(b);
    items.push(b);
  }
  return items;
}
