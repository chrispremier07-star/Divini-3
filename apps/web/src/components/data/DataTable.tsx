/**
 * DIVINI exo — DataTable (LOT 03, corpus l. 7902-7910)
 *
 * Header compact en capitales, bordures discrètes, hover de ligne, identifiants
 * en mono, actions secondaires révélées au survol, badges compacts.
 *
 * Fonctions transverses : tri (asc/desc/neutre), filtres en jetons supprimables
 * (état sérialisable dans l'URL via `TableQuery`), pagination OU virtualisation,
 * sélection multiple + barre d'actions, mode carte sur mobile, et permission
 * refusée EXPLICITE (ligne marquée, jamais masquée).
 *
 * La virtualisation ne monte qu'une fenêtre de lignes : 50 000 lignes restent
 * fluides car le DOM n'en contient jamais plus qu'une écran + overscan.
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button, IconButton } from '../ui/Button';
import { Checkbox } from '../ui/Field';
import { Search } from '../ui/Field';
import { EmptyState, ErrorState, SkeletonBlock } from '../ui/Feedback';
import { Dropdown, type MenuItem } from '../ui/Menu';
import { Icon } from '../ui/Icon';

import type { TableQuery } from './urlstate';
import { DEFAULT_QUERY, hasActiveFilters } from './urlstate';

import styles from './data.module.css';

/* --------------------------------- colonnes ------------------------------- */

export type DataColumnType<Row> = {
  id: string;
  header: string;
  /** base flex CSS, ex. « 2 1 0 » ou « 0 0 96px ». */
  width?: string;
  mono?: boolean;
  secondary?: boolean;
  /** `low` = masquée sous 1280 px, gérée par CSS. */
  priority?: 'high' | 'normal' | 'low';
  sortable?: boolean;
  sortValue?: (row: Row) => string | number;
  render?: (row: Row) => React.ReactNode;
  value?: (row: Row) => string;
};

/* ----------------------------- filtrage / tri ----------------------------- */

export type RowAccessors<Row> = {
  searchText?: (row: Row) => string;
  status?: (row: Row) => string;
  date?: (row: Row) => string;
};

export function filterRows<Row>(rows: Row[], query: TableQuery, acc: RowAccessors<Row>): Row[] {
  const q = query.search.trim().toLowerCase();
  return rows.filter((row) => {
    if (q && acc.searchText && !acc.searchText(row).toLowerCase().includes(q)) return false;
    if (query.statuses.length > 0 && acc.status && !query.statuses.includes(acc.status(row)))
      return false;
    if (query.from && acc.date && (acc.date(row) ?? '') < query.from) return false;
    if (query.to && acc.date && (acc.date(row) ?? '') > query.to) return false;
    return true;
  });
}

export function sortRows<Row>(
  rows: Row[],
  columns: Array<DataColumnType<Row>>,
  sortKey: string | null,
  sortDir: 'asc' | 'desc' | null
): Row[] {
  if (!sortKey || !sortDir) return rows;
  const col = columns.find((c) => c.id === sortKey);
  if (!col?.sortValue) return rows;
  const dir = sortDir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = col.sortValue!(a);
    const vb = col.sortValue!(b);
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
    return String(va).localeCompare(String(vb)) * dir;
  });
}

/* ------------------------------ virtualisation ---------------------------- */

function useVirtualRange(total: number, rowHeight: number, viewportRef: React.RefObject<HTMLElement | null>, overscan = 6) {
  const [range, setRange] = useState({ start: 0, end: 0 });

  const recompute = useCallback(() => {
    const el = viewportRef.current;
    // Sans layout (SSR / jsdom), on rend une fenêtre minimale raisonnable.
    const viewport = el && el.clientHeight > 0 ? el.clientHeight : 25 * rowHeight;
    const scrollTop = el ? el.scrollTop : 0;
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visible = Math.ceil(viewport / rowHeight);
    const end = Math.min(total, start + visible + overscan * 2);
    setRange((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, [total, rowHeight, overscan, viewportRef]);

  useEffect(() => {
    recompute();
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener('scroll', recompute, { passive: true });
    return () => el.removeEventListener('scroll', recompute);
  }, [recompute, viewportRef]);

  return range;
}

/* --------------------------------- props ---------------------------------- */

export type DataTableProps<Row> = {
  rows: Row[];
  columns: Array<DataColumnType<Row>>;
  rowId: (row: Row) => string;
  accessors?: RowAccessors<Row>;
  mode?: 'pagination' | 'virtual';
  pageSize?: number;
  rowHeight?: number;
  height?: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;

  /** État contrôlé (pour l'URL) ; interne sinon. */
  query?: TableQuery;
  onQueryChange?: (query: TableQuery) => void;

  selectable?: boolean;
  bulkActions?: (ids: string[]) => MenuItem[];
  rowActions?: (row: Row) => MenuItem[];
  /** Ligne dont une valeur est inaccessible pour ce rôle. */
  isLocked?: (row: Row) => boolean;

  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  /** Facettes de statut proposées dans les filtres. */
  statusOptions?: Array<{ id: string; label: string }>;
};

/* --------------------------------- composant ------------------------------ */

export function DataTable<Row>({
  rows,
  columns,
  rowId,
  accessors = {},
  mode = 'pagination',
  pageSize = 10,
  rowHeight = 44,
  height = 440,
  loading = false,
  error = null,
  onRetry,
  query: controlledQuery,
  onQueryChange,
  selectable = false,
  bulkActions,
  rowActions,
  isLocked,
  emptyTitle = 'Aucune donnée',
  emptyDescription = 'Il n’y a encore rien à afficher ici.',
  emptyAction,
  statusOptions = []
}: DataTableProps<Row>) {
  const [internalQuery, setInternalQuery] = useState<TableQuery>(DEFAULT_QUERY);
  const query = controlledQuery ?? internalQuery;
  const setQuery = useCallback(
    (next: TableQuery) => {
      if (controlledQuery === undefined) setInternalQuery(next);
      onQueryChange?.(next);
    },
    [controlledQuery, onQueryChange]
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const viewportRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => sortRows(filterRows(rows, query, accessors), columns, query.sortKey, query.sortDir),
    [rows, query, accessors, columns]
  );

  const isVirtual = mode === 'virtual';
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(query.page, pageCount);
  const pageRows = isVirtual ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize);

  const virtual = useVirtualRange(isVirtual ? filtered.length : 0, rowHeight, viewportRef);
  const virtualRows = isVirtual ? filtered.slice(virtual.start, virtual.end) : [];

  const toggleSort = (col: DataColumnType<Row>) => {
    if (!col.sortable) return;
    let dir: 'asc' | 'desc' | null;
    if (query.sortKey !== col.id) dir = 'asc';
    else if (query.sortDir === 'asc') dir = 'desc';
    else if (query.sortDir === 'desc') dir = null;
    else dir = 'asc';
    setQuery({ ...query, sortKey: dir ? col.id : null, sortDir: dir });
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const allVisibleSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(rowId(r)));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allVisibleSelected) pageRows.forEach((r) => next.delete(rowId(r)));
    else pageRows.forEach((r) => next.add(rowId(r)));
    setSelected(next);
  };

  const removeStatus = (id: string) =>
    setQuery({ ...query, statuses: query.statuses.filter((s) => s !== id), page: 1 });

  /* ------------------------------- états globaux --------------------------- */

  if (loading) {
    return (
      <div className={styles.table} data-state="loading">
        <div className={styles.tableState}>
          <SkeletonBlock lines={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.table} data-state="error">
        <div className={styles.tableState}>
          <ErrorState title="Impossible d’afficher ces données" description={error} onRetry={onRetry} />
        </div>
      </div>
    );
  }

  const noDataAtAll = rows.length === 0;
  const noResultAfterFilter = !noDataAtAll && filtered.length === 0;

  if (noDataAtAll) {
    return (
      <div className={styles.table} data-state="empty">
        <div className={styles.tableState}>
          <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
        </div>
      </div>
    );
  }

  if (noResultAfterFilter) {
    return (
      <div className={styles.table} data-state="empty-filter">
        <div className={styles.tableState}>
          <EmptyState
            icon="search"
            title="Aucun résultat avec ces filtres"
            description="Les données existent, mais aucune ne correspond aux critères actuels."
            action={{ label: 'Réinitialiser les filtres', onClick: () => setQuery({ ...DEFAULT_QUERY }) }}
          />
        </div>
      </div>
    );
  }

  const visibleRows = isVirtual ? virtualRows : pageRows;

  return (
    <div className={styles.table} data-state="default">
      {/* ------------------------------ filtres ------------------------------ */}
      <div className={styles.filterBar}>
        <Search
          value={query.search}
          onValueChange={(v) => setQuery({ ...query, search: v, page: 1 })}
          onClear={() => setQuery({ ...query, search: '', page: 1 })}
          placeholder="Rechercher…"
          aria-label="Rechercher dans la table"
        />

        {statusOptions.map((opt) => (
          <Button
            key={opt.id}
            size="sm"
            variant={query.statuses.includes(opt.id) ? 'primary' : 'ghost'}
            onClick={() =>
              setQuery({
                ...query,
                statuses: query.statuses.includes(opt.id)
                  ? query.statuses.filter((s) => s !== opt.id)
                  : [...query.statuses, opt.id],
                page: 1
              })
            }
            aria-pressed={query.statuses.includes(opt.id)}
          >
            {opt.label}
          </Button>
        ))}

        {hasActiveFilters(query) ? (
          <Button size="sm" variant="subtil" onClick={() => setQuery({ ...DEFAULT_QUERY })}>
            Tout effacer
          </Button>
        ) : null}
      </div>

      {/* jetons de filtres actifs, supprimables */}
      {query.statuses.length > 0 || query.from || query.to ? (
        <div className={styles.filterTokens}>
          {query.statuses.map((id) => (
            <span key={id} className={styles.filterToken}>
              {statusOptions.find((o) => o.id === id)?.label ?? id}
              <button type="button" onClick={() => removeStatus(id)} aria-label={`Retirer le filtre ${id}`}>
                <Icon name="close" size="var(--ctl-icon-sm)" />
              </button>
            </span>
          ))}
          {query.from ? (
            <span className={styles.filterToken}>
              du {query.from}
              <button type="button" onClick={() => setQuery({ ...query, from: null })} aria-label="Retirer la date de début">
                <Icon name="close" size="var(--ctl-icon-sm)" />
              </button>
            </span>
          ) : null}
          {query.to ? (
            <span className={styles.filterToken}>
              au {query.to}
              <button type="button" onClick={() => setQuery({ ...query, to: null })} aria-label="Retirer la date de fin">
                <Icon name="close" size="var(--ctl-icon-sm)" />
              </button>
            </span>
          ) : null}
        </div>
      ) : null}

      {/* --------------------------- barre d'actions ------------------------- */}
      {selectable && selected.size > 0 ? (
        <div className={styles.bulkBar} role="region" aria-label="Actions groupées">
          <span className={styles.bulkCount}>{selected.size} sélectionnée(s)</span>
          {bulkActions ? (
            <Dropdown
              label="Actions groupées"
              items={bulkActions([...selected])}
              trigger={<Button size="sm" variant="ghost" onClick={() => {}}>Actions</Button>}
            />
          ) : null}
          <Button size="sm" variant="subtil" onClick={() => setSelected(new Set())}>
            Annuler la sélection
          </Button>
        </div>
      ) : null}

      {/* ------------------------------- entête ------------------------------ */}
      <div className={styles.tableHead} role="row">
        {selectable ? (
          <span className={styles.cellCheck}>
            <Checkbox checked={allVisibleSelected} onChange={toggleAll} label="Tout sélectionner" />
          </span>
        ) : null}
        {columns.map((col) => (
          <button
            key={col.id}
            type="button"
            className={styles.tableHeaderCell}
            style={{ flex: col.width ?? '1 1 0' }}
            onClick={() => toggleSort(col)}
            aria-sort={
              query.sortKey === col.id
                ? query.sortDir === 'asc'
                  ? 'ascending'
                  : 'descending'
                : undefined
            }
            disabled={!col.sortable}
          >
            {col.header}
            {query.sortKey === col.id ? (
              <Icon name={query.sortDir === 'asc' ? 'chevronUp' : 'chevronDown'} size="var(--ctl-icon-sm)" />
            ) : col.sortable ? (
              <Icon name="sliders" size="var(--ctl-icon-sm)" />
            ) : null}
          </button>
        ))}
      </div>

      {/* -------------------------------- corps ------------------------------ */}
      <div
        className={styles.tableBody}
        ref={viewportRef}
        style={isVirtual ? { height: `${height}px` } : undefined}
      >
        {isVirtual ? (
          <div className={styles.tableSpacer} style={{ height: `${virtual.start * rowHeight}px` }} />
        ) : null}

        {visibleRows.map((row) => {
          const id = rowId(row);
          const locked = isLocked?.(row) ?? false;
          return (
            <div
              key={id}
              className={`${styles.tableRow} ${selected.has(id) ? styles.tableRowSelected : ''}`}
              role="row"
              style={isVirtual ? { height: `${rowHeight}px` } : undefined}
            >
              {selectable ? (
                <span className={styles.cellCheck}>
                  <Checkbox checked={selected.has(id)} onChange={() => toggleRow(id)} label={`Sélectionner ${id}`} />
                </span>
              ) : null}

              {columns.map((col) => (
                <span
                  key={col.id}
                  role="cell"
                  className={`${styles.tableCell} ${col.mono ? styles.cellMono : ''} ${
                    col.secondary ? styles.cellSecondary : ''
                  }`}
                  style={{ flex: col.width ?? '1 1 0' }}
                >
                  {locked ? (
                    <span className={styles.cellLocked} title="Valeur inaccessible pour votre rôle">
                      <Icon name="lock" size="var(--ctl-icon-sm)" /> Accès restreint
                    </span>
                  ) : col.render ? (
                    col.render(row)
                  ) : (
                    col.value?.(row) ?? ''
                  )}
                </span>
              ))}

              {rowActions ? (
                <span className={styles.rowActions}>
                  <Dropdown
                    label={`Actions pour ${id}`}
                    items={rowActions(row)}
                    trigger={<IconButton icon="moreHorizontal" label={`Actions pour ${id}`} size="sm" variant="ghost" onClick={() => {}} />}
                  />
                </span>
              ) : null}
            </div>
          );
        })}

        {isVirtual ? (
          <div className={styles.tableSpacer} style={{ height: `${(filtered.length - virtual.end) * rowHeight}px` }} />
        ) : null}
      </div>

      {/* ------------------------------ pagination --------------------------- */}
      {!isVirtual ? (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} sur {filtered.length}
          </span>
          <span className={styles.paginationControls}>
            <IconButton icon="chevronLeft" label="Page précédente" size="sm" variant="ghost" onClick={() => setQuery({ ...query, page: Math.max(1, page - 1) })} disabled={page <= 1} />
            <span className={styles.paginationInfo}>{page} / {pageCount}</span>
            <IconButton icon="chevronRight" label="Page suivante" size="sm" variant="ghost" onClick={() => setQuery({ ...query, page: Math.min(pageCount, page + 1) })} disabled={page >= pageCount} />
          </span>
        </div>
      ) : (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>{filtered.length} lignes · virtualisées</span>
        </div>
      )}

    </div>
  );
}

export type TableFiltersProps = { query: TableQuery; onQueryChange: (q: TableQuery) => void };
export type TablePaginationProps = { page: number; pageCount: number; onPage: (p: number) => void };
export type TableColumn = DataColumnType<unknown>;
export type TableBulkBarProps = { count: number };
