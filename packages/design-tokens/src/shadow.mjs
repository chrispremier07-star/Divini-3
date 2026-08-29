/**
 * DIVINI exo — Élévation
 *
 * Le corpus est explicite (l. 7824-7844, V2.3) : « ombres très subtiles » et
 * « pas de surbrillance ». L'élévation repose d'abord sur la différence de surface
 * (--bg < --panel < --panel-2), l'ombre ne venant qu'en renfort.
 *
 * Les valeurs utilisent --shadow-color (variable de thème) pour rester correctes
 * en thème clair comme en thème sombre.
 */

export const shadow = {
  none: 'none',
  /** Contrôle au repos (bouton, champ) — quasi imperceptible */
  xs: '0 1px 1px rgb(var(--shadow-color) / 0.04)',
  /** Carte, panneau au repos */
  sm: '0 1px 2px rgb(var(--shadow-color) / 0.06), 0 1px 1px rgb(var(--shadow-color) / 0.04)',
  /** Élément survolé, menu déroulant */
  md: '0 4px 12px rgb(var(--shadow-color) / 0.10), 0 1px 3px rgb(var(--shadow-color) / 0.06)',
  /** Modale, tiroir, palette de commandes */
  lg: '0 12px 32px rgb(var(--shadow-color) / 0.16), 0 2px 8px rgb(var(--shadow-color) / 0.08)',
  /** Toast, élément porté au-dessus de tout */
  xl: '0 20px 48px rgb(var(--shadow-color) / 0.22), 0 4px 12px rgb(var(--shadow-color) / 0.10)',
  /** Anneau de focus — jamais supprimé, couleur d'accent */
  focus: '0 0 0 2px var(--surface-page), 0 0 0 4px var(--accent)',
  focusCritical: '0 0 0 2px var(--surface-page), 0 0 0 4px var(--state-critical)',
  /** Ombre intérieure pour les zones en creux (champs, puits) */
  inset: 'inset 0 1px 2px rgb(var(--shadow-color) / 0.08)'
};

/** Élévation par rôle. */
export const shadowRole = {
  card: 'sm',
  cardHover: 'md',
  control: 'xs',
  controlHover: 'sm',
  menu: 'md',
  tooltip: 'md',
  modal: 'lg',
  drawer: 'lg',
  palette: 'lg',
  toast: 'xl',
  popover: 'md',
  insetField: 'inset'
};
