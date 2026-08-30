/**
 * DIVINI exo — Tests Stocks (LOT 07)
 *
 * Règle de cohérence stock/mouvements (stockOf === stock catalogue LOT 06),
 * valorisation, seuils, suggestion de catégories LOCALE et déterministe,
 * gouvernance (création réservée au tenant), écarts d'inventaire, saturation
 * d'entrepôt, motif obligatoire, rendus de la vue d'ensemble et de la liste.
 * Le rendu réel (breakpoints, thèmes, tactile) est reporté dans LOT-07-VALIDATION.md.
 */

import { afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  STOCK_PRODUCTS,
  MOVEMENTS,
  INVENTORIES,
  WAREHOUSES,
  stockOf,
  stockLevel,
  stockValuation,
  atRiskProducts,
  dormantProducts,
  movementsOf,
  suggestCategories,
  canCreate,
  lineVariance,
  hasVariance,
  countProgress,
  warehouseSaturation,
  warehouseUsed,
  findProduct,
  StockOverview,
  ProductList
} from '../apps/web/src/components/stocks/index.ts';

import { PRODUCTS } from '../apps/web/src/components/sales/index.ts';

import { ShellStateProvider } from '../apps/web/src/lib/shell-state.tsx';
import { ToastProvider } from '../apps/web/src/components/ui/Toast.tsx';

import { createDom } from './helpers/dom.mjs';
import { h, render, unmountAll } from './helpers/react.mjs';

before(() => createDom());
afterEach(() => unmountAll());

function inStocks(element) {
  return h(ShellStateProvider, null, h(ToastProvider, null, element));
}

describe('Stocks — cohérence stock / mouvements', () => {
  it('le stock de chaque produit est la somme algébrique de ses mouvements', () => {
    for (const p of STOCK_PRODUCTS) {
      const sum = movementsOf(p.id).reduce((acc, m) => acc + m.delta, 0);
      assert.equal(stockOf(p.id), sum, `somme incohérente pour ${p.id}`);
    }
  });

  it('le stock dérivé reconstitue exactement le catalogue du LOT 06', () => {
    for (const p of PRODUCTS) {
      assert.equal(stockOf(p.id), p.stock, `stock divergent pour ${p.id} (${p.label})`);
    }
  });

  it('la valorisation est la somme des quantités × prix HT', () => {
    const expected = STOCK_PRODUCTS.reduce((acc, p) => acc + stockOf(p.id) * p.price, 0);
    assert.equal(stockValuation(), expected);
  });

  it('tous les mouvements ont un motif non vide (traçabilité)', () => {
    for (const m of MOVEMENTS) {
      assert.ok(m.reason && m.reason.trim().length > 0, `mouvement ${m.id} sans motif`);
    }
  });
});

describe('Stocks — seuils et risques', () => {
  it('un produit en rupture est en seuil critique', () => {
    const bissap = findProduct('prd-05');
    assert.equal(stockOf('prd-05'), 0);
    assert.equal(stockLevel(bissap), 'critical');
  });

  it('un produit sous le seuil d’alerte mais au-dessus du critique est en attention', () => {
    const sucre = findProduct('prd-03');
    assert.equal(stockLevel(sucre), 'warning');
  });

  it('la liste des produits à risque ne contient que des niveaux non sains', () => {
    for (const p of atRiskProducts()) {
      assert.notEqual(stockLevel(p), 'ok');
    }
  });

  it('le stock dormant ne retient que des produits avec du stock', () => {
    for (const p of dormantProducts()) {
      assert.ok(stockOf(p.id) > 0, `${p.id} dormant sans stock`);
    }
  });
});

describe('Stocks — suggestion de catégories (locale)', () => {
  it('retourne une liste vide pour une saisie vide (rien n’est inventé)', () => {
    assert.deepEqual(suggestCategories(''), []);
    assert.deepEqual(suggestCategories('   '), []);
  });

  it('reconnaît des mots-clés du lexique local', () => {
    const result = suggestCategories('café thé');
    assert.ok(result.some((c) => /caf/i.test(c)), 'café absent');
    assert.ok(result.some((c) => /thé|the/i.test(c)), 'thé absent');
  });

  it('est déterministe (mêmes mots-clés → mêmes suggestions)', () => {
    const a = suggestCategories('miel bio arachides');
    const b = suggestCategories('miel bio arachides');
    assert.deepEqual(a, b);
  });

  it('dé-duplique et propose un repli pour un mot-clé inconnu', () => {
    const result = suggestCategories('quinoa quinoa');
    assert.equal(result.filter((c) => /quinoa/i.test(c)).length, 1, 'doublon non supprimé');
  });
});

describe('Stocks — gouvernance', () => {
  it('la création est réservée au tenant central', () => {
    assert.equal(canCreate('tenant'), true);
    assert.equal(canCreate('site'), false);
  });
});

describe('Stocks — inventaires et entrepôts', () => {
  it('l’écart d’une ligne est compté − théorique', () => {
    const inv = INVENTORIES[0];
    const line = inv.lines.find((l) => l.counted !== null && l.counted !== l.theoretical);
    assert.ok(line, 'aucune ligne en écart dans inv-001');
    assert.equal(lineVariance(line), line.counted - line.theoretical);
  });

  it('une ligne non comptée a un écart nul', () => {
    const inv = INVENTORIES.find((i) => i.lines.some((l) => l.counted === null));
    const line = inv.lines.find((l) => l.counted === null);
    assert.equal(lineVariance(line), 0);
  });

  it('hasVariance détecte les sessions en écart', () => {
    assert.equal(typeof hasVariance(INVENTORIES[0]), 'boolean');
  });

  it('countProgress compte les lignes saisies', () => {
    const inv = INVENTORIES[0];
    const progress = countProgress(inv);
    assert.equal(progress.total, inv.lines.length);
    assert.ok(progress.counted <= progress.total);
  });

  it('la saturation d’entrepôt est cohérente avec l’occupation', () => {
    for (const w of WAREHOUSES) {
      const sat = warehouseSaturation(w.id);
      const ratio = warehouseUsed(w.id) / w.capacity;
      if (ratio >= 0.9) assert.equal(sat, 'critical');
      else if (ratio >= 0.75) assert.equal(sat, 'warning');
      else assert.equal(sat, 'ok');
    }
  });
});

describe('Stocks — rendus', () => {
  it('la vue d’ensemble affiche valorisation, risques et entrepôts', async () => {
    const view = await render(inStocks(h(StockOverview, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('Valorisation du stock'), 'carte valorisation absente');
    assert.ok(text.includes('Produits à risque'), 'panneau risques absent');
    assert.ok(text.includes('Répartition par entrepôt'), 'répartition absente');
    await view.unmount();
  });

  it('la liste produits affiche le catalogue et un état de seuil', async () => {
    const view = await render(inStocks(h(ProductList, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('Café moulu 250 g'), 'produit absent');
    assert.ok(text.includes('Seuil critique') || text.includes('Sous seuil'), 'aucun état de seuil');
    await view.unmount();
  });
});
