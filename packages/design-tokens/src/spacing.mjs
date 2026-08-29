/**
 * DIVINI exo — Espacement
 *
 * Densité retenue : CONFORTABLE par défaut + bascule compacte (décision C.4).
 * Justification : « dense mais aéré » (l. 7764) + « zéro formation » (l. 3184)
 * + « hiérarchie visuelle très claire » (l. 7753).
 *
 * Échelle en multiples de 4 px. Toute valeur d'espacement dans le code
 * applicatif doit provenir de cette échelle.
 */

export const space = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px'
};

/**
 * Rythme par mode de densité.
 * Les composants consomment ces alias, jamais les valeurs brutes : c'est ce qui
 * permet à la bascule confort <-> compact de fonctionner sans réécrire les écrans.
 */
export const density = {
  comfortable: {
    /** Ligne de tableau */
    row: '44px',
    rowCompactTable: '40px',
    /** Cellule de tableau */
    cellX: '16px',
    cellY: '12px',
    /** Carte : padding intérieur */
    card: '20px',
    cardHeader: '16px',
    /** Section */
    section: '32px',
    sectionGap: '24px',
    /** Champ de formulaire */
    fieldHeight: '40px',
    fieldPadX: '12px',
    fieldGap: '16px',
    /** Bouton */
    buttonHeight: '38px',
    buttonPadX: '16px',
    buttonGap: '8px',
    /** Éléments de liste */
    listItem: '44px',
    /** Gouttière de grille */
    gutter: '20px',
    /** Marge latérale du contenu applicatif */
    pagePadX: '28px',
    pagePadY: '24px'
  },
  compact: {
    row: '34px',
    rowCompactTable: '30px',
    cellX: '12px',
    cellY: '7px',
    card: '14px',
    cardHeader: '12px',
    section: '24px',
    sectionGap: '16px',
    fieldHeight: '32px',
    fieldPadX: '10px',
    fieldGap: '12px',
    buttonHeight: '32px',
    buttonPadX: '12px',
    buttonGap: '6px',
    listItem: '34px',
    gutter: '14px',
    pagePadX: '20px',
    pagePadY: '16px'
  }
};

export const defaultDensity = 'comfortable';

/**
 * Tailles de contrôle — ajout LOT 01, justifié par §2.1 du lot
 * (« Button primary / ghost / danger / subtil, tailles sm–md–lg »).
 *
 * Un composant ne choisit pas sa hauteur : il reçoit `size` et consomme l'alias.
 * La bascule de densité reste donc transparente pour lui.
 */
export const control = {
  comfortable: {
    heightSm: '30px',
    heightMd: '38px',
    heightLg: '46px',
    padXSm: '10px',
    padXMd: '16px',
    padXLg: '22px',
    iconSm: '16px',
    iconMd: '18px',
    iconLg: '20px',
    gapSm: '6px',
    gapMd: '8px',
    gapLg: '10px',
    fieldSm: '32px',
    fieldMd: '40px',
    fieldLg: '46px'
  },
  compact: {
    heightSm: '26px',
    heightMd: '32px',
    heightLg: '40px',
    padXSm: '8px',
    padXMd: '12px',
    padXLg: '16px',
    iconSm: '14px',
    iconMd: '16px',
    iconLg: '18px',
    gapSm: '4px',
    gapMd: '6px',
    gapLg: '8px',
    fieldSm: '28px',
    fieldMd: '32px',
    fieldLg: '40px'
  }
};

/** Tailles de contrôle admises — garde-fou contractuel. */
export const controlSizes = ['sm', 'md', 'lg'];

/**
 * Libellés d'interface — métadonnée d'affichage, volontairement HORS de l'objet
 * `density` pour ne pas être émise en variable CSS.
 */
export const densityLabels = {
  comfortable: 'Confortable',
  compact: 'Compact'
};
