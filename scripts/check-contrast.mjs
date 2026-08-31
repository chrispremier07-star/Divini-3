/**
 * DIVINI exo — Contrôle de contraste (WCAG 2.1)
 *
 * Ce contrôle porte sur le CSS GÉNÉRÉ, pas sur la table de tokens JS.
 *
 * Raison : la table JS peut être parfaitement juste alors que la cascade CSS
 * résout autre chose (spécificité, ordre des règles). C'est précisément ce qui
 * s'est produit : un bloc `:root` placé après `html[data-theme='light']`
 * écrasait les tokens sémantiques du thème clair, qui retombait sur des teintes
 * à 2,00:1 sur fond blanc — pendant que ce contrôle, alors branché sur la table
 * JS, affichait « valide ».
 *
 * On rejoue donc la cascade (scripts/lib/resolve-css.mjs) puis on mesure les
 * paires réellement consommées par les composants.
 *
 * Usage : npm run check:tokens
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { resolveVars } from './lib/resolve-css.mjs';
import {
  contrastRequirements,
  dark,
  light,
  themeStatus
} from '../packages/design-tokens/src/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = join(here, '..', 'packages', 'design-tokens', 'dist', 'divini-tokens.css');

if (!existsSync(cssPath)) {
  console.error('CSS de tokens introuvable. Lancez `npm run tokens` avant le contrôle.\n');
  process.exit(1);
}
const css = readFileSync(cssPath, 'utf8');

/* ------------------------------- WCAG 2.1 -------------------------------- */

function luminance(hex) {
  const h = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const chan = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * chan[0] + 0.7152 * chan[1] + 0.0722 * chan[2];
}

function ratio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  if (a === null || b === null) return null;
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/* ------------------- paires réellement consommées ------------------------- */

const TEXT_TOKENS = [
  '--text-primary',
  '--text-secondary',
  '--text-accent',
  '--text-success',
  '--text-info',
  '--text-warning',
  '--text-error',
  '--text-critical'
];

const SURFACE_TOKENS = [
  '--surface-page',
  '--surface-recessed',
  '--surface-card',
  '--surface-raised'
];

const THRESHOLD = 4.5;

const failures = [];
let checked = 0;
let worst = Infinity;
let worstLabel = '';

console.log('DIVINI exo — contrôle de contraste WCAG 2.1 (cascade CSS résolue)\n');
console.log(`  source : packages/design-tokens/dist/divini-tokens.css`);
console.log(`  thème sombre : ${themeStatus.dark.canonical ? 'canonique' : 'dérivé'} — ${themeStatus.dark.origin}`);
console.log(`  thème clair  : ${themeStatus.light.canonical ? 'canonique' : 'DÉRIVÉ, à valider'} — ${themeStatus.light.origin}\n`);

for (const theme of ['dark', 'light']) {
  const vars = resolveVars(css, { theme, density: 'comfortable' });
  const rows = [];

  for (const fgToken of TEXT_TOKENS) {
    const fg = vars.get(fgToken);
    if (!fg) {
      failures.push({ theme, pair: `${fgToken} / *`, detail: 'token absent du CSS résolu' });
      continue;
    }
    for (const bgToken of SURFACE_TOKENS) {
      const bg = vars.get(bgToken);
      if (!bg) {
        failures.push({ theme, pair: `${fgToken} / ${bgToken}`, detail: 'surface absente du CSS résolu' });
        continue;
      }
      const r = ratio(fg, bg);
      checked++;
      if (r === null) {
        failures.push({ theme, pair: `${fgToken} / ${bgToken}`, detail: `non calculable (${fg} sur ${bg})` });
        continue;
      }
      if (r < worst) {
        worst = r;
        worstLabel = `${theme} ${fgToken} sur ${bgToken}`;
      }
      rows.push({ fgToken, bgToken, fg, bg, r, ok: r >= THRESHOLD });
      if (r < THRESHOLD) {
        failures.push({
          theme,
          pair: `${fgToken} / ${bgToken}`,
          detail: `${r.toFixed(2)}:1 < ${THRESHOLD}:1  (${fg} sur ${bg})`
        });
      }
    }
  }

  // Texte sur accent (bouton primaire)
  const onAccent = vars.get('--on-accent');
  const accent = vars.get('--accent');
  if (onAccent && accent) {
    const r = ratio(onAccent, accent);
    checked++;
    if (r !== null) {
      rows.push({ fgToken: '--on-accent', bgToken: '--accent', fg: onAccent, bg: accent, r, ok: r >= THRESHOLD });
      if (r < worst) {
        worst = r;
        worstLabel = `${theme} --on-accent sur --accent`;
      }
      if (r < THRESHOLD) {
        failures.push({ theme, pair: '--on-accent / --accent', detail: `${r.toFixed(2)}:1 < ${THRESHOLD}:1` });
      }
    }
  }

  console.log(`  THÈME ${theme.toUpperCase()} — valeurs résolues depuis le CSS`);
  console.log('  ' + '-'.repeat(78));
  console.log(`  ${'token texte'.padEnd(20)}${'surface'.padEnd(22)}${'résolu'.padEnd(26)}ratio`);
  for (const r of rows) {
    const mark = r.ok ? 'OK   ' : 'ÉCHEC';
    console.log(
      `  ${mark} ${r.fgToken.padEnd(15)}${r.bgToken.padEnd(22)}` +
        `${(r.fg + ' / ' + r.bg).padEnd(26)}${r.r.toFixed(2)}:1`
    );
  }
  const ok = rows.filter((r) => r.ok).length;
  console.log(`  -> ${ok}/${rows.length} conformes\n`);
}

/* --------- couche secondaire : table de tokens (détection de régression) -- */

console.log('  Couche secondaire — table de tokens (contrat déclaré)');
console.log('  ' + '-'.repeat(78));
let tableFailures = 0;
for (const req of contrastRequirements) {
  const palette = req.theme === 'dark' ? dark : light;
  const fg = palette[req.fg];
  const bg = palette[req.bg];
  if (!fg || !bg) {
    tableFailures++;
    failures.push({ theme: req.theme, pair: `${req.fg}/${req.bg}`, detail: 'clé absente de la table' });
    continue;
  }
  const r = ratio(fg, bg);
  checked++;
  if (r === null || r < req.min) {
    tableFailures++;
    failures.push({
      theme: req.theme,
      pair: `${req.fg}/${req.bg}`,
      detail: r === null ? 'non calculable' : `${r.toFixed(2)}:1 < ${req.min}:1`
    });
  }
}
console.log(`  ${contrastRequirements.length - tableFailures}/${contrastRequirements.length} paires déclarées conformes\n`);

console.log('  ' + '='.repeat(78));
console.log(`  paires vérifiées : ${checked}`);
console.log(`  pire contraste   : ${worst.toFixed(2)}:1  (${worstLabel})`);
console.log(`  échecs           : ${failures.length}`);

if (failures.length > 0) {
  console.error('\nÉCHECS :');
  for (const f of failures) console.error(`  [${f.theme}] ${f.pair} — ${f.detail}`);
  console.error('\nCONTRAT DE TOKENS INVALIDE.\n');
  process.exit(1);
}

console.log('\nCONTRAT VALIDE — la cascade CSS résolue respecte le seuil AA (4,5:1) dans les deux thèmes.\n');
