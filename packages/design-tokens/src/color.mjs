/**
 * DIVINI exo — Tokens de couleur
 *
 * THÈME SOMBRE : valeurs canoniques du corpus verrouillé
 *   MASTER_PROMPT_V3_VERROUILLE_DIVINI_EXO_SILO.txt, lignes 7785-7799 (V2.2)
 *   et couleurs sémantiques lignes 7951-7963 (V2.6).
 *   Ces valeurs sont IMMUABLES : aucune interprétation, aucun arrondi.
 *
 * THÈME CLAIR : DÉRIVÉ. Le corpus impose un thème clair (l. 7824-7844, V2.3) mais
 *   n'en fournit AUCUNE valeur hexadécimale. Les valeurs ci-dessous sont donc une
 *   traduction « DARK SYSTEM -> LIGHT SURFACE » vérifiée par calcul de contraste
 *   (scripts/check-contrast.mjs). Elles sont soumises à validation.
 *
 * Règle : aucune palette indigo / violette / ivoire (0 occurrence dans le corpus).
 */

/** Thème sombre — canonique, ne pas modifier. */
export const dark = {
  // Surfaces
  bg: '#1C2126',
  bg2: '#171B1F',
  panel: '#22282E',
  panel2: '#262D34',

  // Bordures
  border: '#333B43',
  borderSoft: '#2A3038',

  // Texte
  text: '#E7EBEE',
  muted: '#93A0AB',

  // Accent
  accent: '#F2A93B',
  accentSoft: 'rgba(242,169,59,0.14)',
  onAccent: '#1C1400',

  // Sémantique (identique dans les deux thèmes — l. 7951-7963)
  info: '#4FC7B9',
  positive: '#6FCF97',
  negative: '#E0785F',
  attention: '#F2A93B',
  critical: '#E0785F',

  // Sémantique sur fond plein
  onInfo: '#0C1E1B',
  onPositive: '#0C1E1B',
  onNegative: '#1C1400',

  // Voile et ombres
  overlay: 'rgba(9,11,13,0.62)',
  shadowColor: '0,0,0'
};

/**
 * Thème clair — DÉRIVÉ (à valider).
 *
 * Justification mesurée (voir scripts/check-contrast.mjs) :
 *  - les couleurs sémantiques canoniques (#4FC7B9 / #6FCF97 / #E0785F) tombent
 *    entre 1,74:1 et 2,99:1 sur fond blanc : inutilisables en texte ;
 *  - les variantes *-Text ci-dessous conservent la même teinte avec une luminance
 *    réduite, et atteignent >= 4,61:1 sur les quatre surfaces (seuil WCAG AA 4,5) ;
 *  - la hiérarchie de surfaces reproduit celle du canon : écart inter-surfaces
 *    1,06-1,23 ici contre 1,07-1,24 pour le thème sombre.
 */
export const light = {
  // Surfaces
  bg: '#F5F6F8',
  bg2: '#E4E8EC',
  panel: '#FFFFFF',
  panel2: '#EDF0F3',

  // Bordures — contraste équivalent ou supérieur au canon sombre
  border: '#C3CAD2',
  borderSoft: '#DCE1E7',

  // Texte
  text: '#1A1F24',
  muted: '#5A6470',

  // Accent — teinte canonique conservée pour les surfaces et le bouton primaire
  accent: '#F2A93B',
  accentSoft: 'rgba(242,169,59,0.18)',
  onAccent: '#1C1400',

  // Sémantique — teintes canoniques conservées (indicateurs, pastilles, tracés)
  info: '#4FC7B9',
  positive: '#6FCF97',
  negative: '#E0785F',
  attention: '#F2A93B',
  critical: '#E0785F',

  // Sémantique « texte-safe » — même teinte, luminance réduite, >= 4,6:1
  infoText: '#1D7168',
  positiveText: '#2B7449',
  negativeText: '#A04E3A',
  attentionText: '#8C5B14',
  criticalText: '#A04E3A',

  // Sémantique sur fond plein
  onInfo: '#0C1E1B',
  onPositive: '#0C1E1B',
  onNegative: '#FFFFFF',

  // Voile et ombres
  overlay: 'rgba(26,31,36,0.42)',
  shadowColor: '26,31,36'
};

/**
 * Paires de contraste obligatoires, vérifiées par scripts/check-contrast.mjs.
 * `min` est le ratio WCAG minimal attendu.
 */
export const contrastRequirements = [
  // Thème sombre — texte
  { theme: 'dark', fg: 'text', bg: 'bg', min: 4.5 },
  { theme: 'dark', fg: 'text', bg: 'bg2', min: 4.5 },
  { theme: 'dark', fg: 'text', bg: 'panel', min: 4.5 },
  { theme: 'dark', fg: 'text', bg: 'panel2', min: 4.5 },
  { theme: 'dark', fg: 'muted', bg: 'bg', min: 4.5 },
  { theme: 'dark', fg: 'muted', bg: 'bg2', min: 4.5 },
  { theme: 'dark', fg: 'muted', bg: 'panel', min: 4.5 },
  { theme: 'dark', fg: 'muted', bg: 'panel2', min: 4.5 },
  { theme: 'dark', fg: 'accent', bg: 'bg', min: 4.5 },
  { theme: 'dark', fg: 'accent', bg: 'panel', min: 4.5 },
  { theme: 'dark', fg: 'accent', bg: 'panel2', min: 4.5 },
  { theme: 'dark', fg: 'info', bg: 'bg', min: 4.5 },
  { theme: 'dark', fg: 'info', bg: 'panel', min: 4.5 },
  { theme: 'dark', fg: 'info', bg: 'panel2', min: 4.5 },
  { theme: 'dark', fg: 'positive', bg: 'bg', min: 4.5 },
  { theme: 'dark', fg: 'positive', bg: 'panel', min: 4.5 },
  { theme: 'dark', fg: 'positive', bg: 'panel2', min: 4.5 },
  { theme: 'dark', fg: 'negative', bg: 'bg', min: 4.5 },
  { theme: 'dark', fg: 'negative', bg: 'panel', min: 4.5 },
  { theme: 'dark', fg: 'negative', bg: 'panel2', min: 4.5 },
  { theme: 'dark', fg: 'onAccent', bg: 'accent', min: 4.5 },

  // Thème clair — texte (variantes *-Text)
  { theme: 'light', fg: 'text', bg: 'bg', min: 4.5 },
  { theme: 'light', fg: 'text', bg: 'bg2', min: 4.5 },
  { theme: 'light', fg: 'text', bg: 'panel', min: 4.5 },
  { theme: 'light', fg: 'text', bg: 'panel2', min: 4.5 },
  { theme: 'light', fg: 'muted', bg: 'bg', min: 4.5 },
  { theme: 'light', fg: 'muted', bg: 'bg2', min: 4.5 },
  { theme: 'light', fg: 'muted', bg: 'panel', min: 4.5 },
  { theme: 'light', fg: 'muted', bg: 'panel2', min: 4.5 },
  { theme: 'light', fg: 'attentionText', bg: 'bg', min: 4.5 },
  { theme: 'light', fg: 'attentionText', bg: 'bg2', min: 4.5 },
  { theme: 'light', fg: 'attentionText', bg: 'panel', min: 4.5 },
  { theme: 'light', fg: 'attentionText', bg: 'panel2', min: 4.5 },
  { theme: 'light', fg: 'infoText', bg: 'bg', min: 4.5 },
  { theme: 'light', fg: 'infoText', bg: 'bg2', min: 4.5 },
  { theme: 'light', fg: 'infoText', bg: 'panel', min: 4.5 },
  { theme: 'light', fg: 'infoText', bg: 'panel2', min: 4.5 },
  { theme: 'light', fg: 'positiveText', bg: 'bg', min: 4.5 },
  { theme: 'light', fg: 'positiveText', bg: 'bg2', min: 4.5 },
  { theme: 'light', fg: 'positiveText', bg: 'panel', min: 4.5 },
  { theme: 'light', fg: 'positiveText', bg: 'panel2', min: 4.5 },
  { theme: 'light', fg: 'negativeText', bg: 'bg', min: 4.5 },
  { theme: 'light', fg: 'negativeText', bg: 'bg2', min: 4.5 },
  { theme: 'light', fg: 'negativeText', bg: 'panel', min: 4.5 },
  { theme: 'light', fg: 'negativeText', bg: 'panel2', min: 4.5 },
  { theme: 'light', fg: 'onAccent', bg: 'accent', min: 4.5 }
];
