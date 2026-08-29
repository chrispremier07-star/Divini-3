/**
 * DIVINI exo — Tests de Input, FileUpload et DatePicker
 *
 * Dernière zone nommée comme non testée dans le rapport du LOT 01. On y vérifie
 * l'étiquetage, les états réels (pas de progression inventée) et le clavier du
 * calendrier.
 */

import { after, afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DatePicker, FieldGroup, FileUpload, Input } from '../apps/web/src/components/ui/index.ts';

import { createDom } from './helpers/dom.mjs';
import { click, h, pressKey, render, unmountAll } from './helpers/react.mjs';

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

describe('Input', () => {
  it('signale l’invalidité aux technologies d’assistance', async () => {
    const view = await render(h(Input, { value: 'x', invalid: true }));
    const input = view.container.querySelector('input');
    assert.equal(input.getAttribute('aria-invalid'), 'true');
  });

  it('n’émet pas aria-invalid quand le champ est valide', async () => {
    const view = await render(h(Input, { value: 'x' }));
    assert.equal(view.container.querySelector('input').getAttribute('aria-invalid'), null);
  });

  it('l’icône et le chargeur sont décoratifs', async () => {
    const view = await render(h(Input, { value: '', icon: 'search', loading: true }));
    const svgs = Array.from(view.container.querySelectorAll('svg'));
    assert.ok(svgs.length >= 1, 'une icône est rendue');
    for (const svg of svgs) {
      assert.equal(svg.getAttribute('aria-hidden'), 'true', 'aucune icône n’est annoncée');
    }
    const spinner = view.container.querySelector('[class*="spinner"]');
    assert.equal(spinner?.getAttribute('aria-hidden'), 'true', 'le chargeur est décoratif');
  });

  it('un champ désactivé l’est vraiment', async () => {
    const view = await render(h(Input, { value: '', disabled: true }));
    assert.equal(view.container.querySelector('input').disabled, true);
  });

  it('hors groupe, le champ reste étiquetable via son id', async () => {
    const view = await render(h(Input, { value: '', id: 'mon-champ' }));
    assert.equal(view.container.querySelector('input').id, 'mon-champ');
  });

  it('dans un groupe, il hérite de l’id et de la description', async () => {
    const view = await render(
      h(FieldGroup, { label: 'Champ', hint: 'Une aide.' }, h(Input, { value: '' }))
    );
    const input = view.container.querySelector('input');
    const hint = view.container.querySelector('[id$="-hint"]');
    assert.equal(view.container.querySelector('label').getAttribute('for'), input.id);
    assert.equal(input.getAttribute('aria-describedby'), hint.id);
  });
});

describe('FileUpload', () => {
  it('à l’état idle, propose un bouton Parcourir réel', async () => {
    const seen = [];
    const view = await render(h(FileUpload, { onFiles: (f) => seen.push(f.length) }));

    const browse = Array.from(view.container.querySelectorAll('button')).find(
      (b) => b.textContent.trim() === 'Parcourir'
    );
    assert.ok(browse, 'un bouton Parcourir existe à l’état idle');
    assert.equal(browse.disabled, false);

    const fileInput = view.container.querySelector('input[type="file"]');
    assert.ok(fileInput, 'une vraie entrée fichier est présente');
  });

  it('chaque état annonce un intitulé différent, sans progression inventée', async () => {
    const titles = {};
    for (const status of ['idle', 'uploading', 'success', 'error']) {
      const view = await render(h(FileUpload, { onFiles: () => {}, status }));
      titles[status] = view.container.querySelector('[class*="dropzoneTitle"]').textContent;
      await view.unmount();
    }

    assert.equal(titles.idle, 'Déposer un fichier ici');
    assert.equal(titles.uploading, 'Téléversement en cours');
    assert.equal(titles.success, 'Fichier reçu');
    assert.equal(titles.error, 'Téléversement échoué');
    assert.equal(new Set(Object.values(titles)).size, 4, '4 états, 4 intitulés distincts');
  });

  it('le bouton Parcourir disparaît pendant et après l’opération', async () => {
    for (const status of ['uploading', 'success', 'error']) {
      const view = await render(h(FileUpload, { onFiles: () => {}, status }));
      const browse = Array.from(view.container.querySelectorAll('button')).find(
        (b) => b.textContent.trim() === 'Parcourir'
      );
      assert.equal(browse, undefined, `pas de Parcourir à l’état « ${status} »`);
      await view.unmount();
    }
  });

  it('affiche le nom de fichier reçu', async () => {
    const view = await render(
      h(FileUpload, { onFiles: () => {}, status: 'success', fileName: 'devis-2026-001.pdf' })
    );
    assert.match(view.container.textContent, /devis-2026-001\.pdf/);
  });

  it('désactivé, il n’ouvre pas le sélecteur', async () => {
    const view = await render(h(FileUpload, { onFiles: () => {}, disabled: true }));
    const browse = Array.from(view.container.querySelectorAll('button')).find(
      (b) => b.textContent.trim() === 'Parcourir'
    );
    assert.equal(browse.disabled, true);
    assert.equal(view.container.querySelector('input[type="file"]').disabled, true);
  });
});

describe('DatePicker', () => {
  it('est un bouton déclencheur annonçant l’ouverture d’un dialogue', async () => {
    const view = await render(
      h(FieldGroup, { label: 'Date' }, h(DatePicker, { value: '', onChange: () => {} }))
    );
    const trigger = view.container.querySelector('button[aria-haspopup="dialog"]');
    assert.ok(trigger, 'le déclencheur annonce aria-haspopup="dialog"');
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(
      view.container.querySelector('label').getAttribute('for'),
      trigger.id,
      'le déclencheur est étiqueté par le groupe'
    );
  });

  it('s’ouvre au clic et reflète aria-expanded', async () => {
    const view = await render(h(DatePicker, { value: '', onChange: () => {} }));
    const trigger = view.container.querySelector('button[aria-haspopup="dialog"]');

    assert.equal(view.container.querySelector('[role="dialog"]'), null, 'fermé au départ');

    await click(trigger);
    assert.ok(view.container.querySelector('[role="dialog"]'), 'le calendrier s’ouvre');
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  });

  it('sélectionner un jour renvoie une date ISO et referme', async () => {
    const seen = [];
    const view = await render(
      h(DatePicker, { value: '2026-03-15', onChange: (v) => seen.push(v) })
    );
    await click(view.container.querySelector('button[aria-haspopup="dialog"]'));

    const day = Array.from(view.container.querySelectorAll('[role="gridcell"]')).find(
      (b) => b.textContent.trim() === '20'
    );
    assert.ok(day, 'le jour 20 est proposé');

    await click(day);
    assert.deepEqual(seen, ['2026-03-20'], 'la date est renvoyée au format ISO');
    assert.equal(view.container.querySelector('[role="dialog"]'), null, 'le panneau se referme');
  });

  it('navigue de mois en mois, y compris le passage d’année', async () => {
    const view = await render(h(DatePicker, { value: '2026-01-10', onChange: () => {} }));
    await click(view.container.querySelector('button[aria-haspopup="dialog"]'));

    const title = () => view.container.querySelector('[class*="calendarTitle"]').textContent;
    const first = title();

    await click(view.container.querySelector('button[aria-label="Mois suivant"]'));
    assert.notEqual(title(), first, 'le mois suivant est affiché');

    // Revenir en arrière jusqu'à passer en décembre de l'année précédente.
    await click(view.container.querySelector('button[aria-label="Mois précédent"]'));
    await click(view.container.querySelector('button[aria-label="Mois précédent"]'));
    assert.match(title(), /décembre 2025/, 'le passage d’année est géré');
  });

  /**
   * Même famille que le défaut corrigé dans MenuPanel : le calendrier est un
   * FRÈRE du bouton déclencheur, pas un descendant. Le `onKeyDown` posé sur le
   * bouton ne reçoit donc pas les touches qui partent de l'intérieur du
   * panneau — alors que le commentaire du composant annonce précisément que
   * « `Escape` ferme le panneau et rend le focus au champ ».
   */
  it('Escape ferme le panneau quand le focus est dans le calendrier', async () => {
    const view = await render(h(DatePicker, { value: '2026-03-15', onChange: () => {} }));
    const trigger = view.container.querySelector('button[aria-haspopup="dialog"]');
    await click(trigger);

    const day = view.container.querySelector('[role="gridcell"]');
    day.focus();
    assert.ok(
      view.container.querySelector('[role="dialog"]').contains(dom.window.document.activeElement),
      'précondition : le focus est dans le calendrier'
    );

    await pressKey('Escape', dom.window.document.activeElement);
    assert.equal(
      view.container.querySelector('[role="dialog"]'),
      null,
      'Escape doit fermer le calendrier depuis l’intérieur'
    );
  });

  it('Escape depuis le déclencheur ferme aussi', async () => {
    const view = await render(h(DatePicker, { value: '', onChange: () => {} }));
    const trigger = view.container.querySelector('button[aria-haspopup="dialog"]');
    await click(trigger);
    assert.ok(view.container.querySelector('[role="dialog"]'));

    trigger.focus();
    await pressKey('Escape', trigger);
    assert.equal(view.container.querySelector('[role="dialog"]'), null);
  });
});
