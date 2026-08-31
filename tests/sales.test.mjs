/**
 * DIVINI exo — Tests Ventes & Commandes (LOT 06)
 *
 * Cohérence des données (facture payée ⇄ paiement, avoir ⇄ facture, reste à payer
 * exact), statuts & transitions, listes/détails rendus, parcours POS de base.
 * Le rendu réel (breakpoints, thèmes, tactile) est reporté dans LOT-06-VALIDATION.md.
 */

import { afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  docTotal,
  paidAmount,
  remainingAmount,
  docsOf,
  findDoc,
  STATUS_TRANSITIONS,
  STATUS_META,
  PRODUCTS,
  searchProducts,
  SalesList,
  DocDetail,
  Pos
} from '../apps/web/src/components/sales/index.ts';

import { ShellStateProvider } from '../apps/web/src/lib/shell-state.tsx';
import { ToastProvider } from '../apps/web/src/components/ui/Toast.tsx';

import { createDom } from './helpers/dom.mjs';
import { h, render, unmountAll, click } from './helpers/react.mjs';

before(() => createDom());
afterEach(() => unmountAll());

function inSales(element) {
  return h(ShellStateProvider, null, h(ToastProvider, null, element));
}

describe('Ventes — cohérence des données', () => {
  it('une facture payée a son paiement et un reste à payer nul', () => {
    const fac = findDoc('facture', 'fac-001');
    assert.equal(fac.status, 'payee');
    assert.equal(paidAmount(fac), docTotal(fac));
    assert.equal(remainingAmount(fac), 0);
  });

  it('une facture partiellement payée a un reste à payer exact et positif', () => {
    const fac = findDoc('facture', 'fac-002');
    assert.equal(fac.status, 'partiellement_payee');
    const reste = remainingAmount(fac);
    assert.ok(reste > 0, 'reste à payer doit être positif');
    assert.equal(reste, docTotal(fac) - paidAmount(fac));
  });

  it('un avoir référence une facture existante', () => {
    for (const av of docsOf('avoir')) {
      assert.ok(findDoc('facture', av.invoiceRef), `avoir ${av.id} → facture inexistante`);
    }
  });

  it('un paiement référence une facture existante', () => {
    for (const p of docsOf('paiement')) {
      assert.ok(findDoc('facture', p.invoiceRef), `paiement ${p.id} → facture inexistante`);
    }
  });

  it('les totaux de lignes sont justes', () => {
    const fac = findDoc('facture', 'fac-001');
    const attendu = 2 * 2500 + 1 * 1000; // 2× café + 1× arachides
    assert.equal(docTotal(fac), attendu);
  });
});

describe('Ventes — statuts & transitions', () => {
  it('« payée » et « annulée » sont des états terminaux', () => {
    assert.equal(STATUS_TRANSITIONS.facture.payee.length, 0);
    assert.equal(STATUS_TRANSITIONS.facture.annulee.length, 0);
  });

  it('un brouillon de facture peut être émis, pas payé directement', () => {
    assert.ok(STATUS_TRANSITIONS.facture.brouillon.includes('emise'));
    assert.ok(!STATUS_TRANSITIONS.facture.brouillon.includes('payee'));
  });

  it('chaque document a un statut connu du référentiel', () => {
    for (const d of [...docsOf('facture'), ...docsOf('vente')]) {
      assert.ok(STATUS_META[d.status], `${d.ref} statut inconnu « ${d.status} »`);
    }
  });
});

describe('Ventes — listes & détails rendus', () => {
  it('la liste des factures affiche références et statuts libellés', async () => {
    const view = await render(inSales(h(SalesList, { kind: 'facture' })));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('FAC-2026-0001'), 'référence absente');
    assert.ok(text.includes('Payée'), 'statut « Payée » non libellé');
    assert.ok(text.includes('En retard'), 'statut « En retard » non libellé');
    await view.unmount();
  });

  it('le détail d’une facture partielle montre le reste à payer en mono', async () => {
    const view = await render(inSales(h(DocDetail, { kind: 'facture', id: 'fac-002' })));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('reste à payer'), 'reste à payer absent');
    assert.ok(text.includes('FAC-2026-0002'), 'référence absente');
    await view.unmount();
  });

  it('un document introuvable affiche un EmptyState, pas un écran vide', async () => {
    const view = await render(inSales(h(DocDetail, { kind: 'facture', id: 'inexistant' })));
    assert.ok((document.body.textContent ?? '').includes('introuvable'), 'EmptyState absent');
    await view.unmount();
  });
});

describe('POS — parcours de base', () => {
  it('rend le catalogue et un panier vide', async () => {
    const view = await render(inSales(h(Pos, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes(PRODUCTS[0].label), 'catalogue absent');
    assert.ok(text.includes('Panier vide'), 'panier vide non annoncé');
    await view.unmount();
  });

  it('toucher un produit l’ajoute au panier ; la rupture est refusée', async () => {
    const view = await render(inSales(h(Pos, null)));
    const tiles = Array.from(document.querySelectorAll('button')).filter((b) =>
      b.textContent.includes(PRODUCTS[0].label)
    );
    await click(tiles[0]);
    assert.ok(!(document.body.textContent ?? '').includes('Panier vide'), 'le panier n’a pas reçu la ligne');

    const ruptures = Array.from(document.querySelectorAll('button[disabled]'));
    assert.ok(ruptures.some((b) => b.textContent.includes('Bissap')), 'la rupture doit être désactivée');
    await view.unmount();
  });

  it('la recherche filtre le catalogue (fonction pure)', () => {
    assert.equal(searchProducts('miel').length, 1);
    assert.ok(searchProducts('miel')[0].label.includes('Miel'));
    assert.ok(!searchProducts('miel').some((p) => p.label.includes('Arachides')));
    assert.equal(searchProducts('').length, PRODUCTS.length);
    assert.ok(searchProducts('0004').some((p) => p.ref === '000415'), 'recherche par référence');
  });

});
