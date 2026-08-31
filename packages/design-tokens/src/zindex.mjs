/**
 * DIVINI exo — Échelle de z-index
 *
 * Échelle fermée et ordonnée : aucune valeur hors de cette liste.
 * L'ordre est contractuel — un toast doit toujours rester lisible au-dessus
 * d'une modale, et une confirmation critique au-dessus de tout.
 */

export const zIndex = {
  /** Contenu courant, aucun empilement. */
  base: 0,
  /** Élément positionné dans le flux (cellule en édition, poignée). */
  raised: 10,
  /** En-tête de tableau collant, barre d'onglets collante. */
  sticky: 100,
  /** Sidebar dépliée (au-dessus du contenu, sous les overlays). */
  sidebar: 200,
  /** Topbar. */
  topbar: 300,
  /** Menus déroulants, popovers, sélecteurs. */
  dropdown: 500,
  /** Voile de fond. */
  backdrop: 800,
  /** Tiroir latéral. */
  drawer: 900,
  /** Modale standard. */
  modal: 1000,
  /** Palette de commandes. */
  palette: 1100,
  /** Confirmation critique — toujours au-dessus d'une modale. */
  confirm: 1200,
  /** Notifications. */
  toast: 1400,
  /** Infobulles — couche la plus haute. */
  tooltip: 1500,
  /** Voile global (chargement bloquant, écran de suspension). */
  global: 1600
};

/** Valeur maximale autorisée : garde-fou contractuel. */
export const maxZIndex = 1600;
