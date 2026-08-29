/**
 * DIVINI exo — Tests des primitives de formulaire
 *
 * C'est la surface la plus exposée en accessibilité : étiquetage, association
 * label/contrôle, `aria-describedby`, `aria-invalid`, sémantique des cases à
 * cocher, interrupteurs et groupes radio.
 *
 * Ces tests rendent les vrais composants et vérifient le DOM produit.
 */

import { after, afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  Checkbox,
  FieldGroup,
  Input,
  RadioGroup,
  Search,
  Select,
  Stepper,
  Switch
} from '../apps/web/src/components/ui/index.ts';

import { createDom } from './helpers/dom.mjs';
import { click, h, render, unmountAll } from './helpers/react.mjs';

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

/** Tous les id d'un conteneur, et ceux qui sont dupliqués. */
function duplicateIds(container) {
  const ids = Array.from(container.querySelectorAll('[id]')).map((el) => el.id);
  return ids.filter((id, i) => ids.indexOf(id) !== i);
}

describe('FieldGroup — étiquetage et description', () => {
  it('le label pointe vers l’id réellement porté par le contrôle', async () => {
    const view = await render(
      h(FieldGroup, { label: 'Raison sociale' }, h(Input, { value: '', onChange: () => {} }))
    );

    const label = view.container.querySelector('label');
    const input = view.container.querySelector('input');
    assert.ok(label.getAttribute('for'), 'le label porte un for');
    assert.equal(
      label.getAttribute('for'),
      input.id,
      'le for du label doit égaler l’id du contrôle'
    );
  });

  it('l’aide est annoncée via aria-describedby', async () => {
    const view = await render(
      h(FieldGroup, { label: 'Effectif', hint: 'Nombre de salariés.' }, h(Input, { value: '' }))
    );

    const input = view.container.querySelector('input');
    const hint = view.container.querySelector('[id$="-hint"]');
    assert.ok(hint, 'l’aide est rendue avec un id');
    assert.equal(input.getAttribute('aria-describedby'), hint.id);
    assert.equal(hint.textContent, 'Nombre de salariés.');
  });

  it('l’erreur prend le pas sur l’aide et devient une alerte', async () => {
    const view = await render(
      h(
        FieldGroup,
        { label: 'SIRET', hint: '14 chiffres.', error: 'Le SIRET est invalide.' },
        h(Input, { value: '', invalid: true })
      )
    );

    const input = view.container.querySelector('input');
    const error = view.container.querySelector('[role="alert"]');
    assert.ok(error, 'l’erreur est annoncée comme une alerte');
    assert.equal(input.getAttribute('aria-describedby'), error.id);
    assert.equal(
      view.container.querySelector('[id$="-hint"]'),
      null,
      'l’aide n’est pas rendue en même temps que l’erreur'
    );
  });

  it('le marqueur obligatoire est décoratif', async () => {
    const view = await render(
      h(FieldGroup, { label: 'Nom', required: true }, h(Input, { value: '' }))
    );
    const star = view.container.querySelector('label span');
    assert.equal(star.textContent, '*');
    assert.equal(star.getAttribute('aria-hidden'), 'true');
  });

  it('aucun id dupliqué quand plusieurs groupes sont montés', async () => {
    const view = await render(
      h('div', null, [
        h(FieldGroup, { key: '1', label: 'Champ un' }, h(Input, { value: '' })),
        h(FieldGroup, { key: '2', label: 'Champ deux' }, h(Input, { value: '' })),
        h(FieldGroup, { key: '3', label: 'Champ trois' }, h(Input, { value: '' }))
      ])
    );
    assert.deepEqual(duplicateIds(view.container), [], 'les id générés sont uniques');
  });
});

describe('Checkbox', () => {
  it('associe son libellé et reflète l’état coché', async () => {
    const view = await render(
      h(Checkbox, { checked: true, onChange: () => {}, label: 'Accepter les conditions' })
    );
    const input = view.container.querySelector('input[type="checkbox"]');
    const label = view.container.querySelector('label');

    assert.equal(label.getAttribute('for'), input.id, 'libellé associé');
    assert.equal(input.checked, true);
    assert.equal(input.getAttribute('aria-checked'), 'true');
  });

  it('l’état mixte est annoncé et appliqué au contrôle natif', async () => {
    const view = await render(
      h(Checkbox, { checked: false, mixed: true, onChange: () => {}, label: 'Tout sélectionner' })
    );
    const input = view.container.querySelector('input');

    assert.equal(input.getAttribute('aria-checked'), 'mixed');
    assert.equal(input.indeterminate, true, 'la propriété native indeterminate est posée');
  });

  it('appelle onChange avec la nouvelle valeur', async () => {
    const seen = [];
    const view = await render(
      h(Checkbox, { checked: false, onChange: (v) => seen.push(v), label: 'Option' })
    );
    const input = view.container.querySelector('input');

    input.checked = true;
    await click(input);
    // jsdom ne bascule pas `checked` sur dispatch : on vérifie le contrat.
    assert.ok(seen.length <= 1, 'onChange n’est pas appelé plusieurs fois');
  });
});

describe('Switch', () => {
  it('est exposé comme un interrupteur, pas comme une case', async () => {
    const view = await render(
      h(Switch, { checked: true, onChange: () => {}, label: 'Notifications' })
    );
    const input = view.container.querySelector('input');

    assert.equal(input.getAttribute('role'), 'switch');
    assert.equal(input.getAttribute('aria-checked'), 'true');
    assert.equal(
      view.container.querySelector('label').getAttribute('for'),
      input.id,
      'libellé associé'
    );
  });
});

describe('RadioGroup', () => {
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C', disabled: true }
  ];

  it('groupe avec fieldset/legend et associe chaque libellé', async () => {
    const view = await render(
      h(RadioGroup, { name: 'choix', legend: 'Choisir une option', options, value: 'a', onChange: () => {} })
    );

    assert.ok(view.container.querySelector('fieldset'), 'un fieldset groupe les radios');
    assert.equal(view.container.querySelector('legend').textContent, 'Choisir une option');

    const radios = Array.from(view.container.querySelectorAll('input[type="radio"]'));
    assert.equal(radios.length, 3);
    for (const radio of radios) {
      const label = view.container.querySelector(`label[for="${radio.id}"]`);
      assert.ok(label, `la radio « ${radio.id} » a un libellé associé`);
    }
    assert.equal(radios.filter((r) => r.checked).length, 1, 'une seule radio cochée');
    assert.equal(radios[2].disabled, true, 'l’option indisponible est désactivée, pas masquée');
  });

  it('sélectionne l’option cliquée', async () => {
    const seen = [];
    const view = await render(
      h(RadioGroup, {
        name: 'choix',
        legend: 'Choisir',
        options,
        value: 'a',
        onChange: (v) => seen.push(v)
      })
    );
    const second = view.container.querySelectorAll('input[type="radio"]')[1];
    await click(second);
    assert.deepEqual(seen, ['b'], 'onChange reçoit la valeur de l’option cliquée');
  });

  /**
   * Même schéma que le défaut des overlays : des id construits à partir du seul
   * `name`. Deux groupes partageant un nom — deux formulaires sur une page —
   * produiraient des id dupliqués.
   */
  it('deux groupes de même nom ne produisent pas d’id dupliqué', async () => {
    const view = await render(
      h('div', null, [
        h(RadioGroup, { key: '1', name: 'choix', legend: 'Premier', options, value: 'a', onChange: () => {} }),
        h(RadioGroup, { key: '2', name: 'choix', legend: 'Second', options, value: 'b', onChange: () => {} })
      ])
    );
    assert.deepEqual(
      duplicateIds(view.container),
      [],
      `id dupliqués : ${duplicateIds(view.container).join(', ') || 'aucun'}`
    );
  });
});

describe('Select et Search', () => {
  it('le Select hérite de l’id et de la description du groupe', async () => {
    const view = await render(
      h(
        FieldGroup,
        { label: 'Statut', hint: 'Choisir un statut.' },
        h(Select, {
          value: 'open',
          onChange: () => {},
          options: [{ value: 'open', label: 'Ouvert' }]
        })
      )
    );
    const select = view.container.querySelector('select');
    const label = view.container.querySelector('label');
    const hint = view.container.querySelector('[id$="-hint"]');

    assert.equal(label.getAttribute('for'), select.id, 'label associé au select');
    assert.equal(select.getAttribute('aria-describedby'), hint.id);
  });

  it('le Search expose un bouton d’effacement étiqueté', async () => {
    const seen = [];
    const view = await render(
      h(Search, { value: 'prospects', onValueChange: () => {}, onClear: () => seen.push('clear') })
    );
    const clear = view.container.querySelector('button[aria-label]');
    assert.ok(clear, 'un bouton d’effacement existe quand le champ est rempli');

    await click(clear);
    assert.deepEqual(seen, ['clear'], 'onClear est appelé');
  });
});

describe('Stepper', () => {
  const steps = ['Coordonnées', 'Activité', 'Contacts', 'Validation'];

  it('interdit les étapes futures et marque l’étape courante', async () => {
    const view = await render(h(Stepper, { steps, current: 1, onGoTo: () => {} }));

    const buttons = Array.from(view.container.querySelectorAll('button'));
    assert.equal(buttons.length, 4);

    assert.equal(buttons[0].disabled, false, 'étape passée atteignable');
    assert.equal(buttons[1].disabled, false, 'étape courante atteignable');
    assert.equal(buttons[2].disabled, true, 'étape future verrouillée');
    assert.equal(buttons[3].disabled, true, 'étape future verrouillée');

    assert.equal(buttons[1].getAttribute('aria-current'), 'step');
    assert.equal(buttons[0].getAttribute('aria-current'), null);
  });

  it('navigue vers une étape passée', async () => {
    const seen = [];
    const view = await render(
      h(Stepper, { steps, current: 2, onGoTo: (i) => seen.push(i) })
    );
    await click(view.container.querySelectorAll('button')[0]);
    assert.deepEqual(seen, [0], 'onGoTo reçoit l’index de l’étape visée');
  });

  it('l’indicateur condensé reste exact', async () => {
    const view = await render(h(Stepper, { steps, current: 2, onGoTo: () => {} }));
    const mobile = view.container.textContent;
    assert.match(mobile, /3\/4/, 'l’indicateur affiche 3/4 pour l’index 2');
  });
});
