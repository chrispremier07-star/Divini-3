/**
 * DIVINI exo — Contrat de tokens
 *
 * Source unique de vérité visuelle. Rien dans l'application ne définit de couleur,
 * d'espacement, de rayon, d'ombre, de durée ou de z-index en dehors de ce paquet.
 *
 * Consommation :
 *   - CSS  : import '@divini/design-tokens/css'   (variables custom, 2 thèmes)
 *   - JS/TS: import { dark, light, space } from '@divini/design-tokens'
 */

export { dark, light, contrastRequirements } from './color.mjs';
export {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  typeRole,
  allowedFontFamilies
} from './typography.mjs';
export { space, density, densityLabels, defaultDensity } from './spacing.mjs';
export { radius, radiusRole, borderWidth, borderRole, maxRadius } from './radius.mjs';
export { shadow, shadowRole } from './shadow.mjs';
export {
  easing,
  duration,
  motionRole,
  translate,
  scale,
  opacity,
  stagger,
  reducedMotion
} from './motion.mjs';
export {
  sidebar,
  topbar,
  tabs,
  overlay,
  grid,
  breakpoint,
  mediaQuery,
  target
} from './structure.mjs';
export { zIndex, maxZIndex } from './zindex.mjs';
export {
  state,
  stateNames,
  stateToSemantic,
  severityOrder,
  statesThatMustNotBeFaked
} from './state.mjs';

/** Thème appliqué au premier chargement — décision 2026-08-28. */
export const defaultTheme = 'dark';

/** Les deux thèmes disponibles. */
export const themeNames = ['dark', 'light'];

/**
 * Statut de chaque thème — affiché tel quel dans la galerie technique.
 * Le thème clair n'a AUCUNE valeur canonique dans le corpus : il est dérivé.
 */
export const themeStatus = {
  dark: {
    canonical: true,
    origin: 'corpus l. 7785-7799 (V2.2) et l. 7951-7963 (V2.6)',
    note: 'Valeurs verrouillées. Aucune interprétation autorisée.'
  },
  light: {
    canonical: false,
    origin: 'dérivé — DARK SYSTEM vers LIGHT SURFACE',
    note:
      'Le corpus impose un thème clair (l. 7824-7844) sans fournir de valeur. ' +
      'Ces couleurs sont calculées et vérifiées par scripts/check-contrast.mjs. ' +
      'À valider avant usage en production.'
  }
};
