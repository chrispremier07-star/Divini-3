/**
 * DIVINI exo — Tokens typographiques
 * Corpus l. 7801-7811 (V2.2) : trois polices, rôles exclusifs, aucune autre.
 *
 *   --font-display : Space Grotesk -> titres, identité, headings, grands chiffres structurants
 *   --font-body    : Inter         -> interface, textes, formulaires, tableaux, navigation
 *   --font-mono    : IBM Plex Mono -> KPI, valeurs, identifiants, références, données techniques
 *
 * Livraison : auto-hébergée (paquets @fontsource), aucune dépendance réseau au
 * démarrage — cohérent avec l'offline-first stratégique (l. 2292).
 */

/**
 * Noms de famille RÉELS déclarés par les paquets auto-hébergés (vérifié) :
 *   @fontsource-variable/space-grotesk -> 'Space Grotesk Variable'
 *   @fontsource-variable/inter         -> 'Inter Variable'
 *   @fontsource/ibm-plex-mono          -> 'IBM Plex Mono'
 * Les noms sans suffixe sont conservés en repli au cas où une variante statique
 * serait introduite plus tard.
 */
export const fontFamily = {
  display:
    '"Space Grotesk Variable", "Space Grotesk", system-ui, -apple-system, sans-serif',
  body: '"Inter Variable", "Inter", system-ui, -apple-system, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace'
};

/**
 * Échelle modulaire — base 16 px, ratio ~1,20 (tierce mineure), arrondi au demi-pixel.
 * Densité retenue : CONFORTABLE (décision C.4), ligne de tableau 44 px.
 */
export const fontSize = {
  micro: '10.5px',
  xs: '11.5px',
  sm: '12.5px',
  base: '13.5px',
  md: '15px',
  lg: '17px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '38px',
  '5xl': '48px'
};

export const lineHeight = {
  none: '1',
  tight: '1.15',
  snug: '1.3',
  normal: '1.5',
  relaxed: '1.65',
  loose: '1.8'
};

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700'
};

export const letterSpacing = {
  tighter: '-0.02em',
  tight: '-0.01em',
  normal: '0',
  wide: '0.02em',
  wider: '0.06em',
  widest: '0.1em'
};

/**
 * Rôles typographiques — contrat consommé par les primitives (LOT 01).
 * Chaque rôle fixe famille, taille, graisse, hauteur de ligne et tracking.
 */
export const typeRole = {
  pageTitle: { family: 'display', size: '2xl', weight: 'semibold', lineHeight: 'tight', letterSpacing: 'tight' },
  sectionTitle: { family: 'display', size: 'lg', weight: 'semibold', lineHeight: 'snug', letterSpacing: 'tight' },
  cardTitle: { family: 'display', size: 'md', weight: 'semibold', lineHeight: 'snug', letterSpacing: 'normal' },
  subtitle: { family: 'body', size: 'md', weight: 'medium', lineHeight: 'normal', letterSpacing: 'normal' },
  body: { family: 'body', size: 'base', weight: 'regular', lineHeight: 'normal', letterSpacing: 'normal' },
  bodySmall: { family: 'body', size: 'sm', weight: 'regular', lineHeight: 'normal', letterSpacing: 'normal' },
  caption: { family: 'body', size: 'xs', weight: 'regular', lineHeight: 'normal', letterSpacing: 'wide' },
  label: { family: 'body', size: 'sm', weight: 'medium', lineHeight: 'tight', letterSpacing: 'wide' },
  tableHeader: { family: 'body', size: 'xs', weight: 'semibold', lineHeight: 'tight', letterSpacing: 'wider' },
  sectionLabel: { family: 'body', size: 'micro', weight: 'semibold', lineHeight: 'tight', letterSpacing: 'widest' },
  kpiValue: { family: 'mono', size: '3xl', weight: 'semibold', lineHeight: 'none', letterSpacing: 'tighter' },
  kpiValueSmall: { family: 'mono', size: 'xl', weight: 'semibold', lineHeight: 'none', letterSpacing: 'tight' },
  monoValue: { family: 'mono', size: 'base', weight: 'medium', lineHeight: 'normal', letterSpacing: 'normal' },
  monoValueSmall: { family: 'mono', size: 'sm', weight: 'regular', lineHeight: 'normal', letterSpacing: 'normal' },
  monoId: { family: 'mono', size: 'sm', weight: 'regular', lineHeight: 'normal', letterSpacing: 'wide' },
  kbd: { family: 'mono', size: 'xs', weight: 'medium', lineHeight: 'none', letterSpacing: 'wide' }
};

/** Garde-fou : toute police hors de ces trois familles est interdite. */
export const allowedFontFamilies = [
  'Space Grotesk Variable',
  'Inter Variable',
  'IBM Plex Mono'
];
