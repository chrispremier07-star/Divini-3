/**
 * DIVINI exo — Tests des composants de données (LOT 03)
 *
 * Couvre la checklist §13 sur ce que jsdom peut réellement vérifier :
 * tri, filtres, sérialisation URL, pagination, virtualisation (50 000 lignes),
 * sélection multiple, états distincts, KPI, kanban, chart.
 *
 * Ce qui relève du rendu réel (fluidité visuelle, breakpoints, reduced-motion)
 * est assumé et reporté dans LOT-03-VALIDATION.md.
 */

import { after, afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DataTable,
  KpiCard,
  KpiGrid,
  Chart,
  Kanban,
  filterRows,
  sortRows,
  makeRows,
  paramsToQuery,
  queryToParams,
  hasActiveFilters,
  DEFAULT_QUERY
} from '../apps/web/src/components/data/index.ts';

import { createDom } from './helpers/dom.mjs';
import { click, h, render, unmountAll } from './helpers/react.mjs';

let dom;

before(() => {
  dom = createDom();
});

afterEach(async () => {
  await unmountAll();
  dom.window.document.body.innerHTML = '';
});

after(() => {
  dom.window.close();
});

const q = (sel) => dom.window.document.querySelector(sel);
const qAll = (sel) => Array.from(dom.window.document.querySelectorAll(sel));

const COLUMNS = [
  { id: 'id', header: 'Réf', mono: true, sortable: true, sortValue: (r) => r.id },
  { id: 'label', header: 'Document', sortable: true, sortValue: (r) => r.label },
  { id: 'amount', header: 'Montant', sortable: true, sortValue: (r) => r.amount, value: (r) => String(r.amount) },
  { id: 'status', header: 'Statut', value: (r) => r.status }
];
const ACCESSORS = {
  searchText: (r) => `${r.id} ${r.label} ${r.customer}`,
  status: (r) => r.status,
  date: (r) => r.date
};

/* ------------------------------- urlstate -------------------------------- */

describe('urlstate — sérialisation', () => {
  it('aller-retour query ⇄ params', () => {
    const query = {
      ...DEFAULT_QUERY,
      search: 'facture',
      statuses: ['paid', 'late'],
      from: '2026-01-01',
      to: '2026-06-30',
      sortKey: 'amount',
      sortDir: 'desc',
      page: 3
    };
    const round = paramsToQuery(queryToParams(query));
    assert.deepEqual(round, query);
  });

  it('l\'état par défaut produit une URL vide', () => {
    assert.equal(queryToParams(DEFAULT_QUERY).toString(), '');
    assert.equal(hasActiveFilters(DEFAULT_QUERY), false);
  });

  it('hasActiveFilters détecte chaque facette', () => {
    assert.equal(hasActiveFilters({ ...DEFAULT_QUERY, search: 'x' }), true);
    assert.equal(hasActiveFilters({ ...DEFAULT_QUERY, statuses: ['paid'] }), true);
    assert.equal(hasActiveFilters({ ...DEFAULT_QUERY, from: '2026-01-01' }), true);
  });
});

/* --------------------------- filtrage / tri purs -------------------------- */

describe('filterRows / sortRows', () => {
  const rows = makeRows(50);

  it('la recherche est insensible à la casse', () => {
    const upper = filterRows(rows, { ...DEFAULT_QUERY, search: 'REF-' }, ACCESSORS);
    assert.equal(upper.length, 50);
    const none = filterRows(rows, { ...DEFAULT_QUERY, search: 'zzz-inexistant' }, ACCESSORS);
    assert.equal(none.length, 0);
  });

  it('le filtre par statut ne garde que les lignes correspondantes', () => {
    const paid = filterRows(rows, { ...DEFAULT_QUERY, statuses: ['paid'] }, ACCESSORS);
    assert.ok(paid.length > 0);
    assert.ok(paid.every((r) => r.status === 'paid'));
  });

  it('le tri asc puis desc inverse l\'ordre, neutre conserve', () => {
    const asc = sortRows(rows, COLUMNS, 'amount', 'asc');
    const desc = sortRows(rows, COLUMNS, 'amount', 'desc');
    const neutral = sortRows(rows, COLUMNS, null, null);
    assert.equal(neutral, rows);
    for (let i = 1; i < asc.length; i += 1) {
      assert.ok(asc[i - 1].amount <= asc[i].amount, 'asc non trié');
      assert.ok(desc[i - 1].amount >= desc[i].amount, 'desc non trié');
    }
  });
});

/* ------------------------------- DataTable -------------------------------- */

describe('DataTable — pagination & états', () => {
  const rows = makeRows(12);

  it('pagine et affiche le compteur', async () => {
    await render(
      h(DataTable, { rows, columns: COLUMNS, rowId: (r) => r.id, mode: 'pagination', pageSize: 5 })
    );
    const bodyRows = qAll('[data-state] [role="row"]').filter((el) => el.getAttribute('role') === 'row');
    // 5 lignes + 1 entête
    assert.ok(bodyRows.length <= 6, `trop de lignes rendues : ${bodyRows.length}`);
    assert.ok(q('.table')?.getAttribute('data-state') === 'default');
    const info = q('.pagination')?.textContent ?? '';
    assert.ok(info.includes('sur 12'), `compteur absent : ${info}`);
  });

  it('sans donnée : EmptyState « aucune donnée »', async () => {
    await render(h(DataTable, { rows: [], columns: COLUMNS, rowId: (r) => r.id }));
    assert.equal(q('.table')?.getAttribute('data-state'), 'empty');
    assert.ok(q('.table')?.textContent.includes('Aucune'));
  });

  it('avec filtre sans résultat : état distinct « vide après filtre »', async () => {
    await render(
      h(DataTable, {
        rows,
        columns: COLUMNS,
        rowId: (r) => r.id,
        accessors: ACCESSORS,
        query: { ...DEFAULT_QUERY, search: 'zzz-inexistant' }
      })
    );
    assert.equal(q('.table')?.getAttribute('data-state'), 'empty-filter');
    assert.ok(q('.table')?.textContent.includes('aucun résultat') || q('.table')?.textContent.includes('Aucun résultat'));
  });

  it('loading : skeleton, pas de lignes', async () => {
    await render(h(DataTable, { rows, columns: COLUMNS, rowId: (r) => r.id, loading: true }));
    assert.equal(q('.table')?.getAttribute('data-state'), 'loading');
    assert.equal(qAll('[role="row"]').length, 0);
  });

  it('error : message non technique + reprise', async () => {
    await render(
      h(DataTable, { rows, columns: COLUMNS, rowId: (r) => r.id, error: 'La source n’a pas répondu.', onRetry: () => {} })
    );
    assert.equal(q('.table')?.getAttribute('data-state'), 'error');
  });

  it('sélection multiple : la barre d’actions apparaît', async () => {
    await render(
      h(DataTable, {
        rows,
        columns: COLUMNS,
        rowId: (r) => r.id,
        selectable: true,
        pageSize: 12
      })
    );
    // case « tout sélectionner » de l’entête
    const headerCheck = q('.tableHead input[type="checkbox"]');
    assert.ok(headerCheck, 'case de sélection globale absente');
    await click(headerCheck);
    const bulk = q('.bulkBar');
    assert.ok(bulk, 'la barre d’actions groupées n’apparaît pas');
    assert.ok(bulk.textContent.includes('12'), `compte de sélection inattendu : ${bulk.textContent}`);
  });

  it('permission refusée : la ligne est marquée, pas masquée', async () => {
    const locked = makeRows(40).map((r, i) => ({ ...r, locked: i === 0 }));
    await render(
      h(DataTable, { rows: locked, columns: COLUMNS, rowId: (r) => r.id, isLocked: (r) => r.locked === true, pageSize: 40 })
    );
    assert.ok(q('.cellLocked'), 'la valeur restreinte n’est pas marquée');
    assert.ok(q('.table')?.textContent.includes('Accès restreint'));
  });
});

describe('DataTable — virtualisation à 50 000 lignes', () => {
  it('ne monte qu’une fenêtre de lignes', async () => {
    const huge = makeRows(50000);
    await render(
      h(DataTable, { rows: huge, columns: COLUMNS, rowId: (r) => r.id, mode: 'virtual', rowHeight: 44, height: 360 })
    );
    const bodyRows = qAll('.tableBody [role="row"]');
    assert.ok(bodyRows.length > 0, 'aucune ligne rendue');
    assert.ok(bodyRows.length < 100, `virtualisation inefficace : ${bodyRows.length} lignes montées`);
    const info = q('.pagination')?.textContent ?? '';
    assert.ok(info.includes('50000') || info.includes('50 000'), `total absent : ${info}`);
  });
});

/* --------------------------------- KPI ------------------------------------ */

describe('KPI', () => {
  it('rend la valeur finale (pas de rAF en jsdom) et le delta fléché', async () => {
    await render(
      h(KpiGrid, null,
        h(KpiCard, { label: 'Ventes', value: 1200, delta: { value: 8, direction: 'up' }, period: '30 j' }))
    );
    const raw = q('.kpiCard')?.textContent ?? '';
    const text = raw.replace(/[\s\u202F\u00A0]/g, '');
    assert.ok(text.includes('1200'), `valeur absente : ${raw}`);
    assert.ok(text.includes('+'), 'le delta montant n’a pas de signe');
    assert.ok(raw.includes('30 j'), `la période n’est pas indiquée : ${raw}`);
  });
});

/* -------------------------------- Chart ----------------------------------- */

describe('Chart', () => {
  it('rend un svg avec un tracé par série et une légende', async () => {
    await render(
      h(Chart, {
        kind: 'area',
        labels: ['a', 'b', 'c'],
        series: [
          { id: 's1', label: 'Ventes', values: [1, 2, 3] },
          { id: 's2', label: 'Objectif', values: [2, 2, 2] }
        ]
      })
    );
    assert.ok(q('svg'), 'aucun svg rendu');
    assert.ok(qAll('path').length >= 2, 'tracés manquants');
    assert.ok(q('.chartLegend'), 'légende absente');
  });
});

/* -------------------------------- Kanban ---------------------------------- */

describe('Kanban', () => {
  it('rend colonnes et cartes', async () => {
    await render(
      h(Kanban, {
        columns: [
          { id: 'a', title: 'À faire', cards: [{ id: 'c1', title: 'Tâche 1' }] },
          { id: 'b', title: 'Terminé', cards: [] }
        ]
      })
    );
    assert.equal(qAll('.kanbanColumn').length, 2);
    assert.equal(qAll('.kanbanCard').length, 1);
  });
});
