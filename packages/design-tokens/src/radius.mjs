/**
 * DIVINI exo — Rayons de bordure
 * Corpus l. 7813-7815 (V2.2) : « Bordures 1px, radius 6-12px (léger, net) ».
 * Le corpus admet jusqu'à 16-18px pour les grands conteneurs (cartes, modales).
 * Au-delà de 22px : interdit (rien de « pillule » dans l'identité DIVINI).
 */

export const radius = {
  none: '0px',
  xs: '6px',
  sm: '8px',
  md: '10px',
  lg: '12px',
  xl: '14px',
  '2xl': '16px',
  '3xl': '18px',
  max: '22px'
};

/** Rayon maximal autorisé : garde-fou contractuel. */
export const maxRadius = '22px';

/** Affectation par rôle — évite que chaque composant choisisse son rayon. */
export const radiusRole = {
  control: 'sm',
  field: 'sm',
  chip: 'sm',
  badge: 'xs',
  card: 'lg',
  panel: 'xl',
  menu: 'md',
  modal: 'xl',
  drawer: 'lg',
  toast: 'md',
  tooltip: 'sm',
  avatar: 'max'
};

/** Épaisseur de bordure — le corpus impose 1px (l. 7813). */
export const borderWidth = {
  none: '0px',
  hairline: '1px',
  thin: '1.5px',
  accent: '2px',
  thick: '3px'
};

/** Épaisseur par rôle. */
export const borderRole = {
  card: 'hairline',
  field: 'hairline',
  divider: 'hairline',
  tabUnderline: 'accent',
  navActive: 'accent',
  focusRing: 'thin',
  criticalEdge: 'thick'
};
