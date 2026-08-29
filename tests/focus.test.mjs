/**
 * DIVINI exo — Tests du système de focus
 *
 * Ces tests exercent le VRAI module `apps/web/src/components/ui/focus.ts`,
 * pas une réimplémentation. Node importe le .ts nativement (type stripping).
 *
 * Ils couvrent ce que le LOT 01 affirmait sans l'avoir exercé :
 *   - piège à focus (Tab / Shift+Tab cyclent dans le conteneur) ;
 *   - navigation fléchée des menus, avec Home et End ;
 *   - retour du focus à l'élément déclencheur.
 *
 * Portée : logique DOM uniquement. Aucun rendu, aucun pixel.
 */

import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getFocusable,
  moveFocus,
  trapFocus,
  useReturnFocus
} from '../apps/web/src/components/ui/focus.ts';

import { createDom, makeFocusable, press } from './helpers/dom.mjs';

let dom;

before(() => {
  dom = createDom('<div id="root"></div>');
});

after(() => {
  dom.window.close();
});

function container() {
  const root = dom.window.document.getElementById('root');
  root.innerHTML = '';
  return root;
}

describe('getFocusable', () => {
  it('ne retient que les éléments réellement focusables', () => {
    const c = container();
    c.innerHTML = `
      <button id="ok1">ok</button>
      <button id="no1" disabled>disabled</button>
      <a id="ok2" href="/x">lien</a>
      <a id="no2">ancre sans href</a>
      <input id="ok3" />
      <input id="no3" disabled />
      <div id="ok4" tabindex="0">div focusable</div>
      <div id="no4" tabindex="-1">div exclue</div>
      <span id="no5">texte seul</span>
    `;
    const found = getFocusable(c).map((el) => el.id);
    assert.deepEqual(found, ['ok1', 'ok2', 'ok3', 'ok4']);
  });

  it('écarte hidden, inert et aria-hidden', () => {
    const c = container();
    c.innerHTML = `
      <button id="ok">atteignable</button>
      <button id="noHidden" hidden>hidden</button>
      <button id="noInert" inert>inert</button>
      <button id="noAria" aria-hidden="true">aria-hidden</button>
    `;
    const found = getFocusable(c).map((el) => el.id);
    assert.deepEqual(found, ['ok']);
  });

  it('écarte tout un sous-arbre aria-hidden, hidden ou inert', () => {
    const c = container();
    c.innerHTML = `
      <div aria-hidden="true"><button id="no1">masqué</button></div>
      <div hidden><button id="no2">caché</button></div>
      <div inert><button id="no3">inerte</button></div>
      <button id="ok">visible</button>
    `;
    const found = getFocusable(c).map((el) => el.id);
    assert.deepEqual(found, ['ok'], 'les attributs de sous-arbre doivent porter');
  });

  /**
   * Régression gardée : l'ancien critère `offsetParent !== null` excluait tout
   * élément en position fixe. Le tiroir et le voile de fond SONT en position
   * fixe — un focusable directement en fixed disparaissait donc du piège.
   */
  it('retient un élément en position fixe (régression offsetParent)', () => {
    const c = container();
    c.innerHTML = `<button id="fixed" style="position:fixed">fixe</button>`;
    const el = c.querySelector('#fixed');

    // Précondition : offsetParent est bien nul ici — c'est ce qui cassait avant.
    assert.equal(el.offsetParent, null);

    const found = getFocusable(c).map((e) => e.id);
    assert.deepEqual(found, ['fixed'], 'un élément fixe est focusable, il doit rester');
  });
});

describe('trapFocus — le focus ne sort pas de l’overlay', () => {
  it('Tab sur le dernier élément revient au premier', () => {
    const c = container();
    const items = makeFocusable(3, c);
    const release = trapFocus(c);

    items[2].focus();
    assert.equal(dom.window.document.activeElement, items[2]);

    const prevented = press(items[2], 'Tab');
    assert.equal(prevented, true, 'le Tab sortant doit être intercepté');
    assert.equal(dom.window.document.activeElement, items[0], 'retour au premier');

    release();
  });

  it('Shift+Tab sur le premier élément revient au dernier', () => {
    const c = container();
    const items = makeFocusable(3, c);
    const release = trapFocus(c);

    items[0].focus();
    const prevented = press(items[0], 'Tab', { shiftKey: true });
    assert.equal(prevented, true);
    assert.equal(dom.window.document.activeElement, items[2], 'retour au dernier');

    release();
  });

  it('Tab interne n’est pas intercepté', () => {
    const c = container();
    const items = makeFocusable(3, c);
    const release = trapFocus(c);

    items[0].focus();
    const prevented = press(items[0], 'Tab');
    assert.equal(prevented, false, 'un Tab entre deux éléments internes reste natif');

    release();
  });

  it('Shift+Tab depuis le conteneur lui-même revient au dernier', () => {
    const c = container();
    c.tabIndex = -1;
    const items = makeFocusable(2, c);
    const release = trapFocus(c);

    c.focus();
    press(c, 'Tab', { shiftKey: true });
    assert.equal(dom.window.document.activeElement, items[1]);

    release();
  });

  it('conteneur vide : Tab est absorbé sans exception', () => {
    const c = container();
    c.tabIndex = -1;
    const release = trapFocus(c);

    c.focus();
    const prevented = press(c, 'Tab');
    assert.equal(prevented, true);
    assert.equal(dom.window.document.activeElement, c);

    release();
  });

  it('le nettoyage supprime bien l’écouteur', () => {
    const c = container();
    const items = makeFocusable(2, c);
    const release = trapFocus(c);
    release();

    items[1].focus();
    const prevented = press(items[1], 'Tab');
    assert.equal(prevented, false, 'après release, plus aucune interception');
  });
});

describe('moveFocus — navigation clavier des menus', () => {
  it('ArrowDown avance et boucle en fin de liste', () => {
    const c = container();
    const items = makeFocusable(3, c);

    items[0].focus();
    moveFocus(items, items[0], 'ArrowDown');
    assert.equal(dom.window.document.activeElement, items[1]);

    moveFocus(items, items[1], 'ArrowDown');
    assert.equal(dom.window.document.activeElement, items[2]);

    moveFocus(items, items[2], 'ArrowDown');
    assert.equal(dom.window.document.activeElement, items[0], 'boucle vers le premier');
  });

  it('ArrowUp recule et boucle en début de liste', () => {
    const c = container();
    const items = makeFocusable(3, c);

    items[0].focus();
    moveFocus(items, items[0], 'ArrowUp');
    assert.equal(dom.window.document.activeElement, items[2], 'boucle vers le dernier');

    moveFocus(items, items[2], 'ArrowUp');
    assert.equal(dom.window.document.activeElement, items[1]);
  });

  it('Home et End atteignent les extrémités', () => {
    const c = container();
    const items = makeFocusable(4, c);

    items[2].focus();
    moveFocus(items, items[2], 'End');
    assert.equal(dom.window.document.activeElement, items[3]);

    moveFocus(items, items[3], 'Home');
    assert.equal(dom.window.document.activeElement, items[0]);
  });

  it('une touche non reconnue ne déplace pas le focus', () => {
    const c = container();
    const items = makeFocusable(3, c);

    items[1].focus();
    moveFocus(items, items[1], 'a');
    assert.equal(dom.window.document.activeElement, items[1], 'focus inchangé');
  });

  it('un élément absent de la liste ne provoque rien', () => {
    const c = container();
    const items = makeFocusable(3, c);
    const outside = dom.window.document.createElement('button');

    items[0].focus();
    moveFocus(items, outside, 'ArrowDown');
    assert.equal(dom.window.document.activeElement, items[0], 'aucun déplacement');
  });
});

describe('useReturnFocus — le focus revient au déclencheur', () => {
  it('restaure l’élément qui avait ouvert l’overlay', () => {
    const c = container();
    const trigger = dom.window.document.createElement('button');
    trigger.textContent = 'déclencheur';
    c.appendChild(trigger);
    const inner = makeFocusable(2, c);

    trigger.focus();
    assert.equal(dom.window.document.activeElement, trigger);

    const rf = useReturnFocus();
    rf.save();

    // L'overlay prend le focus.
    inner[0].focus();
    assert.equal(dom.window.document.activeElement, inner[0]);

    rf.restore();
    assert.equal(dom.window.document.activeElement, trigger, 'focus rendu au déclencheur');
  });

  it('restore ne lance rien si l’élément a disparu du DOM', () => {
    const c = container();
    const trigger = dom.window.document.createElement('button');
    c.appendChild(trigger);
    trigger.focus();

    const rf = useReturnFocus();
    rf.save();
    trigger.remove();

    assert.doesNotThrow(() => rf.restore());
  });

  it('un second restore sans save ne vole pas le focus', () => {
    const c = container();
    const items = makeFocusable(2, c);
    items[1].focus();

    const rf = useReturnFocus();
    rf.restore();
    assert.equal(dom.window.document.activeElement, items[1], 'focus inchangé');
  });
});
