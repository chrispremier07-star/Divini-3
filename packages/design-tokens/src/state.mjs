/**
 * DIVINI exo — États visuels obligatoires
 * Corpus l. 7964-7984 (V2.7) : les quinze états, exhaustifs.
 *
 *   default · hover · active · focus-visible · disabled · loading · success ·
 *   info · warning · error · critical · empty · offline · syncing · permission-denied
 *
 * Règle absolue : « le visuel ne doit jamais mentir sur l'état réel du système ».
 * Un état n'est donc jamais simulé — s'il n'est pas branché, il est affiché comme
 * non disponible (voir docs/CONVENTIONS.md §7).
 *
 * La couleur exprime la gravité réelle ; CRITIQUE n'est jamais décoratif.
 */

/**
 * Pour chaque état : le jeu de variables CSS à consommer.
 * `role` indique le canal sémantique ; `tone` la couleur de référence.
 */
export const state = {
  default: { role: 'neutre', tone: 'text', surface: 'panel', border: 'border' },
  hover: { role: 'interaction', tone: 'text', surface: 'panel2', border: 'border' },
  active: { role: 'interaction', tone: 'attention', surface: 'accentSoft', border: 'accent' },
  'focus-visible': { role: 'accessibilité', tone: 'accent', surface: 'panel', border: 'accent', ring: 'focus' },
  disabled: { role: 'indisponibilité', tone: 'muted', surface: 'bg2', border: 'borderSoft', opacity: 'disabled' },
  loading: { role: 'attente', tone: 'muted', surface: 'panel', border: 'borderSoft' },
  success: { role: 'confirmation', tone: 'positive', surface: 'panel', border: 'positive' },
  info: { role: 'information', tone: 'info', surface: 'panel', border: 'info' },
  warning: { role: 'vigilance', tone: 'attention', surface: 'panel', border: 'attention' },
  error: { role: 'échec', tone: 'negative', surface: 'panel', border: 'negative' },
  critical: { role: 'gravité maximale', tone: 'critical', surface: 'panel', border: 'critical' },
  empty: { role: 'absence de donnée', tone: 'muted', surface: 'panel', border: 'borderSoft' },
  offline: { role: 'connectivité', tone: 'muted', surface: 'bg2', border: 'borderSoft' },
  syncing: { role: 'synchronisation', tone: 'info', surface: 'panel', border: 'info' },
  'permission-denied': { role: 'droit insuffisant', tone: 'muted', surface: 'bg2', border: 'borderSoft', lock: true }
};

/** Liste ordonnée — sert de référence aux contrôles automatiques. */
export const stateNames = Object.keys(state);

/**
 * États qui ne peuvent PAS être simulés par l'interface.
 * S'ils ne sont pas branchés sur du réel, ils doivent être rendus comme
 * « non disponible » plutôt que joués en démonstration.
 */
export const statesThatMustNotBeFaked = [
  'offline',
  'syncing',
  'permission-denied',
  'critical'
];

/**
 * Gravité — ordre croissant. Toute comparaison de sévérité passe par cet index.
 * Empêche qu'un état « info » soit rendu avec la couleur critique.
 */
export const severityOrder = [
  'default',
  'empty',
  'info',
  'loading',
  'syncing',
  'success',
  'warning',
  'error',
  'critical'
];

/**
 * Correspondance état -> couleur sémantique canonique (V2.6).
 * Un état ne peut emprunter qu'à cette table.
 */
export const stateToSemantic = {
  default: null,
  hover: null,
  active: 'attention',
  'focus-visible': 'accent',
  disabled: null,
  loading: null,
  success: 'positive',
  info: 'info',
  warning: 'attention',
  error: 'negative',
  critical: 'critical',
  empty: null,
  offline: null,
  syncing: 'info',
  'permission-denied': null
};
