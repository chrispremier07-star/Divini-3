/**
 * DIVINI exo — Structure et layout
 * Corpus l. 7845-7889 (V2.4) pour le shell applicatif,
 *          l. 8359-8382 (V2.19) pour les points de rupture.
 */

/** Barre latérale : 220 px dépliée, 72 px repliée, transition 320 ms. */
export const sidebar = {
  width: '220px',
  widthCollapsed: '72px',
  itemHeight: '38px',
  /**
   * Référence le token de rayon, pas son nom symbolique.
   *
   * La valeur précédente était `'sm'` : émise telle quelle, elle donnait
   * `--sidebar-item-radius: sm`, et `sm` n'est pas une longueur CSS — toute
   * déclaration `border-radius: var(--sidebar-item-radius)` aurait été ignorée
   * par le navigateur. Le garde-fou ajouté dans `build-css.mjs` bloque
   * désormais ce cas à la génération.
   */
  itemRadius: 'var(--r-sm)',
  groupGap: '4px',
  sectionGap: '20px',
  padX: '12px',
  padY: '14px',
  iconSize: '18px',
  /** Sous 980 px : hors écran, révélée en tiroir. */
  drawerWidth: '264px'
};

/** Barre supérieure : compacte, raccourci clavier en mono. */
export const topbar = {
  height: '56px',
  heightCompact: '48px',
  padX: '16px',
  searchWidth: '360px',
  searchWidthCompact: '200px',
  iconSize: '18px'
};

/** Onglets de contexte : soulignement 2 px, glissement ~280 ms. */
export const tabs = {
  height: '42px',
  underline: '2px',
  itemPadX: '14px',
  gap: '4px'
};

/** Palette de commandes (~560 px), toasts depuis la droite. */
export const overlay = {
  paletteWidth: '560px',
  paletteTop: '14vh',
  paletteMaxHeight: '60vh',
  toastWidth: '360px',
  toastGap: '12px',
  toastInset: '20px',
  toastProgressHeight: '2px',
  modalWidthSm: '420px',
  modalWidthMd: '560px',
  modalWidthLg: '760px',
  drawerWidthSm: '380px',
  drawerWidthMd: '520px',
  drawerWidthLg: '720px'
};

/** Grille de contenu — dense mais aéré. */
export const grid = {
  columns: '12',
  gutter: '20px',
  gutterCompact: '14px',
  maxWidth: '1560px',
  maxWidthNarrow: '1120px',
  marginX: '28px',
  marginXCompact: '20px'
};

/**
 * Points de rupture — corpus l. 8359-8382 (V2.19).
 *
 *   > 980 px  : sidebar dépliée, grilles multi-colonnes
 *   <= 980 px : sidebar repliée puis tiroir, grilles réduites
 *   <= 720 px : une colonne, tableaux -> cartes empilées
 *   <= 560 px : landing uniquement
 */
export const breakpoint = {
  /** En dessous : mobile applicatif. */
  sm: '560px',
  /** En dessous : tablette / sidebar en tiroir. */
  md: '720px',
  /** En dessous : sidebar dépliée impossible. */
  lg: '980px',
  /** Au-dessus : pleine largeur de travail. */
  xl: '1280px',
  '2xl': '1560px'
};

/** Media queries prêtes à l'emploi (mobile-first). */
export const mediaQuery = {
  upSm: '(min-width: 560px)',
  upMd: '(min-width: 720px)',
  upLg: '(min-width: 980px)',
  upXl: '(min-width: 1280px)',
  up2xl: '(min-width: 1560px)',
  downSm: '(max-width: 559.98px)',
  downMd: '(max-width: 719.98px)',
  downLg: '(max-width: 979.98px)'
};

/** Cibles tactiles — jamais sous 40 px, y compris en densité compacte. */
export const target = {
  min: '40px',
  minCompact: '32px',
  comfortable: '44px',
  iconButton: '36px',
  iconButtonCompact: '32px'
};
