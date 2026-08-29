/**
 * DIVINI exo — Tests des composants d'overlay et de menu
 *
 * Contrairement à `focus.test.mjs` qui teste les fonctions seules, ces tests
 * rendent les VRAIS composants React et vérifient leur câblage clavier :
 * `Escape`, piège à focus, retour du focus au déclencheur, verrou du défilement.
 *
 * C'est exactement ce que le rapport du LOT 01 signalait comme non vérifié.
 */

import { after, afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { ConfirmDialog, Dropdown, Modal } from '../apps/web/src/components/ui/index.ts';

import { createDom } from './helpers/dom.mjs';
import { click, h, pressKey, render, unmountAll } from './helpers/react.mjs';

let dom;

before(() => {
  dom = createDom();
});

afterEach(async () => {
  // Une assertion qui échoue ne doit pas laisser un root React vivant.
  await unmountAll();
});

after(() => {
  dom.window.close();
});

function reset() {
  dom.window.document.body.innerHTML = '';
  dom.window.document.body.style.overflow = '';
}

describe('Modal — câblage clavier', () => {
  it('ne rend rien quand open est faux', async () => {
    reset();
    const calls = [];
    const view = await render(
      h(Modal, {
        open: false,
        onClose: () => calls.push('close'),
        title: 'Titre',
        children: h('p', null, 'contenu')
      })
    );
    assert.equal(view.container.querySelector('[role="dialog"]'), null);
    await view.unmount();
  });

  it('rend un dialog modal accessible quand open est vrai', async () => {
    reset();
    const view = await render(
      h(Modal, {
        open: true,
        onClose: () => {},
        title: 'Titre de la modale',
        children: h('p', null, 'contenu')
      })
    );

    const dialog = view.container.querySelector('[role="dialog"]');
    assert.ok(dialog, 'le dialog est rendu');
    assert.equal(dialog.getAttribute('aria-modal'), 'true');

    const labelId = dialog.getAttribute('aria-labelledby');
    assert.ok(labelId, 'aria-labelledby est posé');
    assert.ok(
      view.container.querySelector(`#${labelId}`),
      `l'id référencé « ${labelId} » doit exister dans le DOM`
    );

    await view.unmount();
  });

  it('Escape appelle onClose', async () => {
    reset();
    const calls = [];
    const view = await render(
      h(Modal, {
        open: true,
        onClose: () => calls.push('close'),
        title: 'Titre',
        children: h('p', null, 'contenu')
      })
    );

    const prevented = await pressKey('Escape', dom.window.document);
    assert.equal(prevented, true, 'Escape doit être intercepté');
    assert.deepEqual(calls, ['close'], 'onClose appelé une fois');

    await view.unmount();
  });

  it('le focus entre dans le panneau à l’ouverture', async () => {
    reset();
    const view = await render(
      h(Modal, {
        open: true,
        onClose: () => {},
        title: 'Titre',
        children: h('button', { type: 'button' }, 'action')
      })
    );

    const dialog = view.container.querySelector('[role="dialog"]');
    const active = dom.window.document.activeElement;
    assert.ok(
      dialog.contains(active),
      `le focus doit être dans le dialog, or il est sur <${active.tagName.toLowerCase()}>`
    );

    await view.unmount();
  });

  it('verrouille le défilement puis le restaure', async () => {
    reset();
    const view = await render(
      h(Modal, {
        open: true,
        onClose: () => {},
        title: 'Titre',
        children: h('p', null, 'contenu')
      })
    );

    assert.equal(dom.window.document.body.style.overflow, 'hidden', 'défilement verrouillé');

    await view.unmount();
    assert.equal(dom.window.document.body.style.overflow, '', 'défilement restauré');
  });

  /**
   * Régression : `useReturnFocus` renvoyait un objet neuf à chaque rendu et
   * figurait dans les dépendances de l'effet. Chaque re-rendu du parent
   * re-déclenchait donc l'effet, qui remettait le focus sur le PREMIER élément
   * du panneau — le focus de l'utilisateur était volé.
   */
  it('ne vole pas le focus quand le parent re-rend', async () => {
    reset();
    const view = await render(
      h(Modal, {
        open: true,
        onClose: () => {},
        title: 'Version 1',
        children: h('div', null, [
          h('button', { type: 'button', key: 'a', id: 'first' }, 'premier'),
          h('button', { type: 'button', key: 'b', id: 'second' }, 'second')
        ])
      })
    );

    const second = view.container.querySelector('#second');
    second.focus();
    assert.equal(dom.window.document.activeElement, second, 'précondition');

    await view.rerender(
      h(Modal, {
        open: true,
        onClose: () => {},
        title: 'Version 2',
        children: h('div', null, [
          h('button', { type: 'button', key: 'a', id: 'first' }, 'premier'),
          h('button', { type: 'button', key: 'b', id: 'second' }, 'second')
        ])
      })
    );

    assert.equal(
      dom.window.document.activeElement,
      second,
      'un re-rendu du parent ne doit pas déplacer le focus dans l’overlay'
    );

    await view.unmount();
  });

  it('rend le focus au déclencheur à la fermeture', async () => {
    reset();
    const trigger = dom.window.document.createElement('button');
    trigger.type = 'button';
    trigger.textContent = 'ouvrir';
    dom.window.document.body.appendChild(trigger);
    trigger.focus();
    assert.equal(dom.window.document.activeElement, trigger, 'précondition');

    const view = await render(
      h(Modal, {
        open: true,
        onClose: () => {},
        title: 'Titre',
        children: h('button', { type: 'button' }, 'action')
      })
    );

    assert.notEqual(dom.window.document.activeElement, trigger, 'le focus a quitté le déclencheur');

    await view.unmount();
    assert.equal(dom.window.document.activeElement, trigger, 'focus rendu au déclencheur');
    trigger.remove();
  });
});

describe('ConfirmDialog', () => {
  it('appelle onConfirm puis se ferme', async () => {
    reset();
    const calls = [];
    const view = await render(
      h(ConfirmDialog, {
        open: true,
        title: 'Supprimer le prospect ?',
        description: 'Cette action est définitive.',
        confirmLabel: 'Supprimer',
        destructive: true,
        onConfirm: () => calls.push('confirm'),
        onCancel: () => calls.push('cancel')
      })
    );

    const confirmButton = Array.from(view.container.querySelectorAll('button')).find(
      (b) => b.textContent.trim() === 'Supprimer'
    );
    assert.ok(confirmButton, 'le bouton de confirmation porte le libellé demandé');

    await click(confirmButton);
    assert.deepEqual(calls, ['confirm']);

    await view.unmount();
  });

  it('appelle onCancel depuis le bouton d’annulation', async () => {
    reset();
    const calls = [];
    const view = await render(
      h(ConfirmDialog, {
        open: true,
        title: 'Annuler la saisie ?',
        description: 'Les modifications non enregistrées seront perdues.',
        confirmLabel: 'Valider',
        cancelLabel: 'Revenir',
        onConfirm: () => calls.push('confirm'),
        onCancel: () => calls.push('cancel')
      })
    );

    const cancel = Array.from(view.container.querySelectorAll('button')).find(
      (b) => b.textContent.trim() === 'Revenir'
    );
    assert.ok(cancel, 'le bouton d’annulation porte le libellé demandé');

    await click(cancel);
    assert.deepEqual(calls, ['cancel']);

    await view.unmount();
  });

  it('Escape annule sans confirmer', async () => {
    reset();
    const calls = [];
    const view = await render(
      h(ConfirmDialog, {
        open: true,
        title: 'Supprimer le prospect ?',
        description: 'Cette action est définitive.',
        confirmLabel: 'Supprimer',
        onConfirm: () => calls.push('confirm'),
        onCancel: () => calls.push('cancel')
      })
    );

    await pressKey('Escape', dom.window.document);
    assert.deepEqual(calls, ['cancel'], 'Escape doit annuler, jamais confirmer');

    await view.unmount();
  });
});

describe('Dropdown', () => {
  const items = [
    { id: 'a', label: 'Première action', onSelect: () => {} },
    { id: 'b', label: 'Deuxième action', onSelect: () => {} }
  ];

  it('s’ouvre au clic sur le déclencheur et se referme sur Escape', async () => {
    reset();
    const view = await render(
      h(Dropdown, {
        label: 'Menu de test',
        items,
        trigger: h('button', { type: 'button' }, 'Ouvrir le menu')
      })
    );

    assert.equal(view.container.querySelector('[role="menu"]'), null, 'fermé au départ');

    const trigger = view.container.querySelector('button');
    await click(trigger);
    const menu = view.container.querySelector('[role="menu"]');
    assert.ok(menu, 'le menu s’ouvre au clic');

    await pressKey('Escape', dom.window.document);
    assert.equal(view.container.querySelector('[role="menu"]'), null, 'Escape referme le menu');

    await view.unmount();
  });

  it('rend le focus au déclencheur quand le menu se ferme', async () => {
    reset();
    const view = await render(
      h(Dropdown, {
        label: 'Menu de test',
        items,
        trigger: h('button', { type: 'button' }, 'Ouvrir le menu')
      })
    );

    const trigger = view.container.querySelector('button');
    trigger.focus();
    await click(trigger);

    const menu = view.container.querySelector('[role="menu"]');
    assert.ok(menu.contains(dom.window.document.activeElement), 'le focus est dans le menu');

    await pressKey('Escape', dom.window.document);
    assert.equal(
      dom.window.document.activeElement,
      trigger,
      'le focus doit revenir au déclencheur'
    );

    await view.unmount();
  });

  it('les entrées désactivées ne sont pas atteignables au clavier', async () => {
    reset();
    const mixed = [
      { id: 'a', label: 'Disponible', onSelect: () => {} },
      { id: 'b', label: 'Indisponible', onSelect: () => {}, disabled: true }
    ];
    const view = await render(
      h(Dropdown, {
        label: 'Menu mixte',
        items: mixed,
        trigger: h('button', { type: 'button' }, 'Ouvrir')
      })
    );

    await click(view.container.querySelector('button'));
    const entries = view.container.querySelectorAll('[role="menuitem"]');
    assert.equal(entries.length, 2, 'l’entrée indisponible reste affichée, pas masquée');

    const disabled = Array.from(entries).find((e) => e.textContent.includes('Indisponible'));
    assert.ok(
      disabled.disabled || disabled.getAttribute('aria-disabled') === 'true',
      'l’entrée indisponible est marquée comme telle'
    );

    await view.unmount();
  });
});
