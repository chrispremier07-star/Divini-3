/**
 * DIVINI exo — état de table ⇄ URL (LOT 03)
 *
 * Fonctions PURES, sans dépendance à Next : l'état des filtres, du tri et de la
 * page est sérialisé dans une `URLSearchParams`, donc partageable et
 * restaurable (§5). Le branchement réel sur `useSearchParams` se fait dans la
 * galerie ; ici on teste la sérialisation elle-même.
 */

export type SortDirection = 'asc' | 'desc' | null;

export type TableQuery = {
  search: string;
  statuses: string[];
  from: string | null;
  to: string | null;
  sortKey: string | null;
  sortDir: SortDirection;
  page: number;
};

export const DEFAULT_QUERY: TableQuery = {
  search: '',
  statuses: [],
  from: null,
  to: null,
  sortKey: null,
  sortDir: null,
  page: 1
};

export function queryToParams(query: TableQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search) params.set('q', query.search);
  if (query.statuses.length > 0) params.set('st', query.statuses.join(','));
  if (query.from) params.set('du', query.from);
  if (query.to) params.set('au', query.to);
  if (query.sortKey && query.sortDir) params.set('tri', `${query.sortKey}:${query.sortDir}`);
  if (query.page > 1) params.set('p', String(query.page));
  return params;
}

export function paramsToQuery(params: URLSearchParams): TableQuery {
  const tri = params.get('tri');
  const [sortKey, sortDir] = tri ? tri.split(':') : [null, null];

  return {
    search: params.get('q') ?? '',
    statuses: (params.get('st') ?? '').split(',').filter(Boolean),
    from: params.get('du'),
    to: params.get('au'),
    sortKey: sortDir === 'asc' || sortDir === 'desc' ? sortKey : null,
    sortDir: sortDir === 'asc' || sortDir === 'desc' ? sortDir : null,
    page: Math.max(1, Number.parseInt(params.get('p') ?? '1', 10) || 1)
  };
}

/** Une requête est « filtrée » si elle s'écarte de l'état par défaut. */
export function hasActiveFilters(query: TableQuery): boolean {
  return (
    query.search !== '' ||
    query.statuses.length > 0 ||
    query.from !== null ||
    query.to !== null
  );
}
