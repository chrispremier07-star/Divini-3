/**
 * DIVINI exo — Motion
 * Corpus l. 7987-8010 (V2.8) + l. 7845-7889 (V2.4).
 *
 * Lois non négociables :
 *  - easing unique : cubic-bezier(.2,.8,.2,1) — jamais `linear`, jamais `ease-in-out` brut ;
 *  - aucun rebond, aucun élastique, aucun overshoot ;
 *  - `prefers-reduced-motion: reduce` -> fondu d'opacité uniquement, jamais de déplacement ;
 *  - aucune animation décorative : le mouvement signale toujours quelque chose.
 *
 * Le confetti Lottie (l. 393-397) est réservé et INACTIF : il sera branché au LOT 18.
 */

export const easing = {
  /** Easing canonique unique — toute transition passe par lui. */
  standard: 'cubic-bezier(.2,.8,.2,1)',
  /** Entrée d'élément : démarre plus franchement. */
  enter: 'cubic-bezier(.16,.84,.24,1)',
  /** Sortie d'élément : plus sobre, sans accélération finale. */
  exit: 'cubic-bezier(.4,0,.6,1)',
  /**
   * Réservé aux animations PROPORTIONNELLES AU TEMPS : barre de progression qui
   * décompte, indicateur de chargement en rotation.
   *
   * Ce n'est pas un easing de transition. Un décompte non linéaire mentirait sur
   * le temps restant : à mi-parcours visuel, il ne resterait pas la moitié du temps.
   * Interdit partout ailleurs — voir `forbidden`.
   */
  linear: 'linear',
  /** Interdit — présent uniquement pour être détecté par le contrôle automatique. */
  forbidden: ['ease', 'ease-in', 'ease-out', 'ease-in-out']
};

/** Durées canoniques, par registre d'usage. */
export const duration = {
  /** Micro-interaction : hover, press, focus, bascule de case (140-220 ms). */
  instant: '0ms',
  microFast: '140ms',
  micro: '180ms',
  microSlow: '220ms',
  /** Transition d'état : validation, erreur, bascule de statut (220-320 ms). */
  stateFast: '220ms',
  state: '280ms',
  stateSlow: '320ms',
  /** Panneau latéral, sidebar (320 ms). */
  panel: '320ms',
  /** Animation narrative : mission du jour, révélation guidée (420 ms). */
  narrative: '420ms',
  /** Révélation de page (700 ms). */
  reveal: '700ms',
  /** Count-up des KPI (1100-1200 ms). */
  countUp: '1150ms',
  /** Progression indéterminée (barre de chargement). */
  progress: '1400ms',
  /** Respiration du gardien — boucle lente et discrète. */
  breathe: '4200ms'
};

/** Durée par rôle — contrat consommé par les primitives. */
export const motionRole = {
  hover: { duration: 'microFast', easing: 'standard' },
  press: { duration: 'instant', easing: 'standard' },
  focusRing: { duration: 'microFast', easing: 'standard' },
  stateChange: { duration: 'state', easing: 'standard' },
  sidebarCollapse: { duration: 'panel', easing: 'standard' },
  tabUnderline: { duration: 'state', easing: 'standard' },
  drawer: { duration: 'panel', easing: 'enter' },
  modal: { duration: 'stateSlow', easing: 'enter' },
  toast: { duration: 'stateSlow', easing: 'enter' },
  tooltip: { duration: 'micro', easing: 'standard' },
  menu: { duration: 'stateFast', easing: 'enter' },
  pageReveal: { duration: 'reveal', easing: 'standard' },
  narrative: { duration: 'narrative', easing: 'standard' },
  countUp: { duration: 'countUp', easing: 'standard' },
  skeleton: { duration: 'progress', easing: 'standard' }
};

/** Amplitudes de déplacement — volontairement faibles (l. 7824-7844 : sobriété). */
export const translate = {
  none: '0px',
  micro: '1px',
  sm: '2px',
  md: '4px',
  lg: '8px',
  panel: '24px',
  offscreen: '100%'
};

/** Échelles de transformation — aucun dépassement au-delà de 1. */
export const scale = {
  pressed: '0.98',
  rest: '1',
  lift: '1.01',
  pop: '1.03'
};

/** Opacités normalisées. */
export const opacity = {
  disabled: '0.45',
  faint: '0.6',
  soft: '0.78',
  raised: '0.92',
  full: '1'
};

/** Délais d'apparition en cascade — jamais plus de 5 éléments décalés. */
export const stagger = {
  none: '0ms',
  step: '40ms',
  max: '200ms'
};

/**
 * Comportement en `prefers-reduced-motion: reduce`.
 * Toute durée devient quasi nulle ; seuls les fondus subsistent.
 */
export const reducedMotion = {
  duration: '0ms',
  fadeDuration: '120ms',
  translate: '0px',
  scale: '1'
};
