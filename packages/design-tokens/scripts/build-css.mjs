/**
 * DIVINI exo — Génération du CSS de tokens
 *
 * `src/*.mjs` est la source unique de vérité ; ce script en dérive
 * `dist/divini-tokens.css` (variables custom, deux thèmes, deux densités)
 * et `dist/index.d.ts` (types pour la consommation TS).
 *
 * Aucune valeur n'est écrite à la main dans le CSS généré : le fichier est
 * écrasé à chaque build (`npm run tokens`). Ne pas éditer dist/ à la main.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { dark, light } from '../src/color.mjs';
import {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  typeRole
} from '../src/typography.mjs';
import { space, density, control, defaultDensity } from '../src/spacing.mjs';
import { radius, borderWidth } from '../src/radius.mjs';
import { shadow } from '../src/shadow.mjs';
import {
  easing,
  duration,
  translate,
  scale,
  opacity,
  stagger,
  reducedMotion
} from '../src/motion.mjs';
import {
  sidebar,
  topbar,
  tabs,
  overlay,
  grid,
  breakpoint,
  mediaQuery,
  target
} from '../src/structure.mjs';
import { zIndex } from '../src/zindex.mjs';
import { defaultTheme, themeStatus } from '../src/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const distDir = join(pkgRoot, 'dist');

/** camelCase -> kebab-case */
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** Émet un bloc de déclarations alignées. */
function block(selector, entries, indent = '  ') {
  const width = Math.max(...entries.map(([k]) => k.length));
  const body = entries
    .map(([k, v]) => `${indent}${k.padEnd(width)} : ${v};`)
    .join('\n');
  return `${selector} {\n${body}\n}`;
}

const toVars = (obj, prefix) =>
  Object.entries(obj).map(([k, v]) => [`--${prefix}-${kebab(k)}`, String(v)]);

/**
 * Couches primitives, par thème.
 * Le thème sombre reprend `dark` tel quel (canonique) ; le clair `light`.
 */
const primitives = (c) => toVars(c, 'c');

/**
 * Couche sémantique — noms stables, indépendants du thème.
 * C'est elle que consomment les composants.
 *
 * En thème clair, les textes colorés basculent sur les variantes *-Text
 * (même teinte, luminance réduite) : les teintes canoniques tombent sous
 * 3:1 sur fond blanc et seraient illisibles.
 */
const semanticCommon = [
  ['--surface-page', 'var(--c-bg)'],
  ['--surface-recessed', 'var(--c-bg2)'],
  ['--surface-card', 'var(--c-panel)'],
  ['--surface-raised', 'var(--c-panel2)'],
  ['--surface-overlay', 'var(--c-overlay)'],

  ['--border-default', 'var(--c-border)'],
  ['--border-soft', 'var(--c-border-soft)'],

  ['--text-primary', 'var(--c-text)'],
  ['--text-secondary', 'var(--c-muted)'],
  ['--text-inverse', 'var(--c-on-accent)'],

  ['--accent', 'var(--c-accent)'],
  ['--accent-soft', 'var(--c-accent-soft)'],
  ['--on-accent', 'var(--c-on-accent)'],

  ['--state-success', 'var(--c-positive)'],
  ['--state-info', 'var(--c-info)'],
  ['--state-warning', 'var(--c-attention)'],
  ['--state-error', 'var(--c-negative)'],
  ['--state-critical', 'var(--c-critical)'],

  ['--on-success', 'var(--c-on-positive)'],
  ['--on-info', 'var(--c-on-info)'],
  ['--on-error', 'var(--c-on-negative)'],

  ['--shadow-color', 'var(--c-shadow-color)']
];

/** Texte coloré : teinte canonique en sombre, variante texte-safe en clair. */
const semanticDark = [
  ['--text-accent', 'var(--c-accent)'],
  ['--text-success', 'var(--c-positive)'],
  ['--text-info', 'var(--c-info)'],
  ['--text-warning', 'var(--c-attention)'],
  ['--text-error', 'var(--c-negative)'],
  ['--text-critical', 'var(--c-critical)'],
  ['--border-success', 'var(--c-positive)'],
  ['--border-info', 'var(--c-info)'],
  ['--border-warning', 'var(--c-attention)'],
  ['--border-error', 'var(--c-negative)'],
  ['--border-critical', 'var(--c-critical)']
];

const semanticLight = [
  ['--text-accent', 'var(--c-attention-text)'],
  ['--text-success', 'var(--c-positive-text)'],
  ['--text-info', 'var(--c-info-text)'],
  ['--text-warning', 'var(--c-attention-text)'],
  ['--text-error', 'var(--c-negative-text)'],
  ['--text-critical', 'var(--c-critical-text)'],
  ['--border-success', 'var(--c-positive-text)'],
  ['--border-info', 'var(--c-info-text)'],
  ['--border-warning', 'var(--c-attention-text)'],
  ['--border-error', 'var(--c-negative-text)'],
  ['--border-critical', 'var(--c-critical-text)']
];

/** Couche neutre : identique quel que soit le thème. */
const neutral = [
  ...toVars(fontFamily, 'font'),
  ...toVars(fontSize, 'fs'),
  ...toVars(lineHeight, 'lh'),
  ...toVars(fontWeight, 'fw'),
  ...toVars(letterSpacing, 'ls'),
  ...toVars(space, 'sp'),
  ...toVars(radius, 'r'),
  ...toVars(borderWidth, 'bw'),
  ...toVars(shadow, 'sh'),
  ...toVars(duration, 'dur'),
  ...toVars(translate, 'tr'),
  ...toVars(scale, 'sc'),
  ...toVars(opacity, 'op'),
  ...toVars(stagger, 'stagger'),
  ['--ease-standard', easing.standard],
  ['--ease-enter', easing.enter],
  ['--ease-exit', easing.exit],
  ['--ease-linear', easing.linear],
  ...toVars(sidebar, 'sidebar'),
  ...toVars(topbar, 'topbar'),
  ...toVars(tabs, 'tabs'),
  ...toVars(overlay, 'ov'),
  ...toVars(grid, 'grid'),
  ...toVars(breakpoint, 'bp'),
  ...toVars(target, 'tgt'),
  ...toVars(zIndex, 'z'),
  ['--theme-default', defaultTheme]
];

/** Rôles typographiques -> variables composées. */
const typeRoleVars = Object.entries(typeRole).flatMap(([role, r]) => [
  [`--t-${kebab(role)}-family`, `var(--font-${r.family})`],
  [`--t-${kebab(role)}-size`, `var(--fs-${r.size})`],
  [`--t-${kebab(role)}-weight`, `var(--fw-${r.weight})`],
  [`--t-${kebab(role)}-lh`, `var(--lh-${r.lineHeight})`],
  [`--t-${kebab(role)}-ls`, `var(--ls-${r.letterSpacing})`]
]);

/** Densité : les composants consomment ces alias, jamais les valeurs brutes. */
const densityVars = (d) => toVars(density[d], 'd').concat(toVars(control[d], 'ctl'));

const header = `/**
 * DIVINI exo — Feuille de tokens GÉNÉRÉE. Ne pas éditer.
 * Source : packages/design-tokens/src/*.mjs
 * Build  : npm run tokens
 *
 * Thème sombre : canonique (${themeStatus.dark.origin})
 * Thème clair  : dérivé, à valider (${themeStatus.light.origin})
 */
`;

const css = [
  header.trim(),
  '',
  '/* 1. Primitives — thème sombre (défaut au premier chargement) */',
  block("html[data-theme='dark']", primitives(dark)),
  '',
  '/* 2. Primitives — thème clair (DÉRIVÉ, à valider) */',
  block("html[data-theme='light']", primitives(light)),
  '',
  '/* 3. Couche sémantique — noms stables consommés par les composants */',
  block("html[data-theme='dark']", semanticCommon.concat(semanticDark)),
  block("html[data-theme='light']", semanticCommon.concat(semanticLight)),
  '',
  /*
   * 4. Repli quand aucun attribut data-theme n’est posé.
   *
   * Les blocs de thème ci-dessus utilisent `html[data-theme=…]`
   * (spécificité 0,1,1) et non `[data-theme=…]` (0,1,0) : à spécificité égale
   * avec `:root`, ce repli — placé après — aurait gagné la cascade et écrasé
   * les tokens sémantiques du thème clair. Le thème clair serait alors retombé
   * sur les teintes sombres, illisibles sur fond blanc (2,00:1).
   */
  block(':root', [
    ...semanticCommon,
    ...semanticDark,
    ['color-scheme', 'dark']
  ]),
  block("html[data-theme='light']", [['color-scheme', 'light']]),
  '',
  '/* 5. Rôles typographiques */',
  block(':root', typeRoleVars),
  '',
  '/* 6. Couche neutre : typographie, espacement, rayons, ombres, motion, structure, z-index */',
  block(':root', neutral),
  '',
  '/* 7. Densité — confortable par défaut, bascule compacte (décision C.4) */',
  block(`:root, html[data-density='${defaultDensity}']`, densityVars(defaultDensity)),
  block("html[data-density='compact']", densityVars('compact')),
  '',
  '/* 8. Mouvement réduit — fondu uniquement, jamais de déplacement */',
  '@media (prefers-reduced-motion: reduce) {',
  block(
    '  :root',
    [
      ['--dur-micro-fast', reducedMotion.duration],
      ['--dur-micro', reducedMotion.duration],
      ['--dur-micro-slow', reducedMotion.duration],
      ['--dur-state-fast', reducedMotion.duration],
      ['--dur-state', reducedMotion.duration],
      ['--dur-state-slow', reducedMotion.duration],
      ['--dur-panel', reducedMotion.duration],
      ['--dur-narrative', reducedMotion.duration],
      ['--dur-reveal', reducedMotion.fadeDuration],
      ['--dur-count-up', reducedMotion.duration],
      ['--dur-skeleton', reducedMotion.fadeDuration],
      ['--tr-micro', reducedMotion.translate],
      ['--tr-sm', reducedMotion.translate],
      ['--tr-md', reducedMotion.translate],
      ['--tr-lg', reducedMotion.translate],
      ['--tr-panel', reducedMotion.translate],
      ['--sc-pressed', reducedMotion.scale],
      ['--sc-lift', reducedMotion.scale],
      ['--sc-pop', reducedMotion.scale],
      ['--stagger-step', reducedMotion.duration],
      ['--stagger-max', reducedMotion.duration]
    ],
    '    '
  ),
  '}',
  ''
].join('\n');

mkdirSync(distDir, { recursive: true });

/**
 * Garde-fou : aucune variable ne peut être référencée sans être définie.
 *
 * Un `var(--inexistant)` ne provoque aucune erreur de build : la propriété est
 * simplement invalidée par le navigateur. Deux défauts de ce type sont passés
 * inaperçus (--surface-recessed / --surface-raised vides, et l'anneau de focus
 * cassé). Le build échoue désormais au lieu d'émettre un CSS silencieux.
 */
const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
const referenced = new Set([...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]));
const dangling = [...referenced].filter((v) => !defined.has(v));
if (dangling.length > 0) {
  console.error('\nCSS de tokens invalide — variables référencées mais jamais définies :');
  for (const v of dangling) console.error(`  ${v}`);
  console.error('\nCorrigez packages/design-tokens/src/ avant de régénérer.\n');
  process.exit(1);
}

writeFileSync(join(distDir, 'divini-tokens.css'), css, 'utf8');

/** Types TS dérivés des mêmes objets — pas de duplication manuelle. */
const dts = `/** DIVINI exo — types du contrat de tokens. GÉNÉRÉ, ne pas éditer. */

declare const dark: ${JSON.stringify(dark, null, 2)};
declare const light: ${JSON.stringify(light, null, 2)};

export type ThemeName = 'dark' | 'light';
export type DensityName = 'comfortable' | 'compact';

export type TokenColor = keyof typeof dark;
export type TokenSpace = keyof typeof space;
export type TokenRadius = keyof typeof radius;
export type TokenShadow = keyof typeof shadow;
export type TokenDuration = keyof typeof duration;
export type TokenZIndex = keyof typeof zIndex;

export declare const fontFamily: ${JSON.stringify(fontFamily)};
export declare const fontSize: ${JSON.stringify(fontSize)};
export declare const lineHeight: ${JSON.stringify(lineHeight)};
export declare const fontWeight: ${JSON.stringify(fontWeight)};
export declare const letterSpacing: ${JSON.stringify(letterSpacing)};
export declare const typeRole: Record<string, {
  family: 'display' | 'body' | 'mono';
  size: TokenSpace | string;
  weight: string;
  lineHeight: string;
  letterSpacing: string;
}>;
export declare const space: ${JSON.stringify(space)};
export declare const density: Record<DensityName, Record<string, string>>;
export declare const densityLabels: Record<DensityName, string>;
export declare const control: Record<DensityName, Record<string, string>>;
export declare const controlSizes: ['sm', 'md', 'lg'];
export type ControlSize = 'sm' | 'md' | 'lg';
export declare const defaultDensity: DensityName;
export declare const radius: ${JSON.stringify(radius)};
export declare const radiusRole: Record<string, keyof typeof radius>;
export declare const borderWidth: ${JSON.stringify(borderWidth)};
export declare const borderRole: Record<string, keyof typeof borderWidth>;
export declare const shadow: ${JSON.stringify(shadow)};
export declare const shadowRole: Record<string, keyof typeof shadow>;
export declare const easing: {
  standard: string;
  enter: string;
  exit: string;
  /** Réservé aux animations proportionnelles au temps (décompte, rotation de chargement). */
  linear: string;
  forbidden: string[];
};
export declare const duration: ${JSON.stringify(duration)};
export declare const motionRole: Record<string, { duration: keyof typeof duration; easing: string }>;
export declare const translate: ${JSON.stringify(translate)};
export declare const scale: ${JSON.stringify(scale)};
export declare const opacity: ${JSON.stringify(opacity)};
export declare const stagger: ${JSON.stringify(stagger)};
export declare const reducedMotion: ${JSON.stringify(reducedMotion)};
export declare const sidebar: ${JSON.stringify(sidebar)};
export declare const topbar: ${JSON.stringify(topbar)};
export declare const tabs: ${JSON.stringify(tabs)};
export declare const overlay: ${JSON.stringify(overlay)};
export declare const grid: ${JSON.stringify(grid)};
export declare const breakpoint: ${JSON.stringify(breakpoint)};
export declare const mediaQuery: ${JSON.stringify(mediaQuery)};
export declare const target: ${JSON.stringify(target)};
export declare const zIndex: ${JSON.stringify(zIndex)};
export declare const maxZIndex: number;
export declare const maxRadius: string;
export declare const state: Record<string, Record<string, string | boolean>>;
export declare const stateNames: string[];
export declare const stateToSemantic: Record<string, string | null>;
export declare const severityOrder: string[];
export declare const statesThatMustNotBeFaked: string[];
export declare const contrastRequirements: Array<{
  theme: ThemeName;
  fg: string;
  bg: string;
  min: number;
}>;
export declare const defaultTheme: ThemeName;
export declare const themeNames: ThemeName[];
export declare const themeStatus: Record<ThemeName, {
  canonical: boolean;
  origin: string;
  note: string;
}>;
export declare const allowedFontFamilies: string[];

export { dark, light };
`;

writeFileSync(join(distDir, 'index.d.ts'), dts, 'utf8');

/** Ré-export ESM : les objets sources sont eux-mêmes en ESM, aucun build TS requis. */
writeFileSync(
  join(distDir, 'index.mjs'),
  `/** GÉNÉRÉ — ré-export du contrat de tokens. */\nexport * from '../src/index.mjs';\n`,
  'utf8'
);

const vars = (css.match(/^\s+--[\w-]+\s*:/gm) || []).length;
console.log(
  `tokens  ->  dist/divini-tokens.css  (${css.split('\n').length} lignes, ` +
    `${new Set(css.match(/--[\w-]+(?=\s*:)/g)).size} variables distinctes, ${vars} déclarations)`
);
console.log('types   ->  dist/index.d.ts');
console.log('export  ->  dist/index.mjs');
