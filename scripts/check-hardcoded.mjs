/**
 * DIVINI exo — Contrôle « aucune valeur en dur »
 *
 * Règle du contrat : hors du paquet @divini/design-tokens, aucune couleur,
 * rayon, ombre, z-index, durée ou easing ne peut être écrit en littéral.
 * Toute valeur doit passer par une variable de token.
 *
 * Usage : npm run check:hardcoded
 *
 * Le script échoue (exit 1) sur toute violation. Il n'y a pas de liste
 * d'exceptions silencieuse : si une valeur est légitime, elle doit devenir
 * un token dans packages/design-tokens/src/.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

const SCAN_DIRS = ['apps', 'packages'];
const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '.arena'
]);
/** Source de vérité : les littéraux y sont par définition autorisés. */
const TOKENS_SRC = join(ROOT, 'packages', 'design-tokens', 'src');
const SCAN_EXT = new Set(['.css', '.scss', '.tsx', '.ts', '.jsx', '.js', '.mjs']);

const violations = [];
/** Fichiers effectivement analysés — prouve que le contrôle n'est pas vide. */
const scanned = [];

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (SKIP_DIRS.has(entry)) continue;
    const st = statSync(full);
    if (st.isDirectory()) {
      if (full.startsWith(TOKENS_SRC)) continue;
      walk(full);
    } else if (SCAN_EXT.has(extname(entry))) {
      scan(full);
    }
  }
}

function scan(file) {
  const rel = relative(ROOT, file);
  scanned.push(rel);
  const lines = readFileSync(file, 'utf8').split('\n');
  const isStyle = extname(file) === '.css' || extname(file) === '.scss';

  lines.forEach((line, i) => {
    const n = i + 1;
    const code = stripComment(line);
    if (!code.trim()) return;

    const push = (rule, match, why) =>
      violations.push({ file: rel, line: n, rule, match, why, text: line.trim() });

    // 1. Couleur hexadécimale
    for (const m of code.matchAll(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)) {
      if (isSvgUri(code)) continue;
      push('couleur-hex', m[0], 'utiliser var(--…) du contrat de tokens');
    }

    // 2. rgb() / rgba() / hsl() / hsla() littéraux
    for (const m of code.matchAll(/\b(?:rgba?|hsla?)\s*\([^)]*\)/g)) {
      // var() à l'intérieur : autorisé (ex. rgb(var(--shadow-color) / .1))
      if (/var\(--/.test(m[0])) continue;
      push('couleur-fonction', m[0], 'utiliser var(--…) du contrat de tokens');
    }

    // 3. hsl / nom de couleur CSS courant dans une déclaration de couleur
    if (/(?:^|[\s;{])(?:color|background|background-color|border-color|fill|stroke|outline-color)\s*:\s*(transparent|white|black|red|green|blue|gray|grey|currentColor)\b/i.test(code)) {
      if (!/\btransparent\b|\bcurrentColor\b/i.test(code)) {
        push('couleur-nommée', code.trim(), 'utiliser var(--…) du contrat de tokens');
      }
    }

    // 4. border-radius littéral
    for (const m of code.matchAll(/\bborder-radius\s*:\s*([^;]+)/g)) {
      if (!usesVar(m[1]) && /[0-9]/.test(m[1])) {
        push('rayon-littéral', m[0], 'utiliser var(--r-…)');
      }
    }

    // 5. z-index littéral
    for (const m of code.matchAll(/\bz-index\s*:\s*([^;]+)/g)) {
      const v = m[1].trim();
      if (!usesVar(v) && v !== 'auto' && v !== 'inherit' && v !== 'initial' && v !== 'unset') {
        push('z-index-littéral', m[0], 'utiliser var(--z-…)');
      }
    }

    // 6. box-shadow littéral
    for (const m of code.matchAll(/\bbox-shadow\s*:\s*([^;]+)/g)) {
      if (!usesVar(m[1]) && m[1].trim() !== 'none') {
        push('ombre-littérale', m[0], 'utiliser var(--sh-…)');
      }
    }

    // 7. Durée littérale dans transition / animation
    for (const m of code.matchAll(/\b(?:transition|animation)\s*:\s*([^;]+)/g)) {
      if (/var\(--dur-/.test(m[1])) continue;
      const raw = m[1].match(/(?:^|\s)(\d+(?:\.\d+)?m?s)(?=\s|$|,)/g);
      if (raw) {
        push('durée-littérale', m[0], 'utiliser var(--dur-…)');
      }
    }
    for (const m of code.matchAll(/\b(?:transition-duration|animation-duration)\s*:\s*([^;]+)/g)) {
      if (!usesVar(m[1]) && /\d/.test(m[1])) {
        push('durée-littérale', m[0], 'utiliser var(--dur-…)');
      }
    }

    // 8. Easing interdit (jamais linear / ease brut)
    for (const m of code.matchAll(/\b(?:transition-timing-function|animation-timing-function)\s*:\s*([^;]+)/g)) {
      if (!usesVar(m[1]) && /^(linear|ease|ease-in|ease-out|ease-in-out)$/i.test(m[1].trim())) {
        push('easing-interdit', m[0], 'utiliser var(--ease-standard)');
      }
    }
    for (const m of code.matchAll(/\bcubic-bezier\([^)]*\)/g)) {
      if (m[0].replace(/\s/g, '') !== 'cubic-bezier(.2,.8,.2,1)' &&
          m[0].replace(/\s/g, '') !== 'cubic-bezier(.16,.84,.24,1)' &&
          m[0].replace(/\s/g, '') !== 'cubic-bezier(.4,0,.6,1)') {
        push('easing-hors-contrat', m[0], 'seuls les trois easings du contrat sont admis');
      }
    }

    // 9. Espacement littéral (padding / margin / gap)
    for (const m of code.matchAll(/\b(?:padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|inline|block))?\s*:\s*([^;]+)/g)) {
      const value = m[1].trim();
      if (usesVar(value)) continue;
      if (value === '0' || value === 'auto' || value === 'inherit') continue;
      if (/^\d+(?:\.\d+)?(?:px|rem|em)$/.test(value) && !/^0(px|rem|em)?$/.test(value)) {
        push('espacement-littéral', m[0], 'utiliser var(--sp-…) ou var(--d-…)');
      }
    }

    // 10. Police hors contrat
    for (const m of code.matchAll(/\bfont-family\s*:\s*([^;]+)/g)) {
      if (!usesVar(m[1])) {
        push('police-littérale', m[0], 'utiliser var(--font-display|body|mono)');
      }
    }

    // 11. Taille de police littérale
    for (const m of code.matchAll(/\bfont-size\s*:\s*([^;]+)/g)) {
      if (!usesVar(m[1])) {
        push('taille-littérale', m[0], 'utiliser var(--fs-…)');
      }
    }

    // 12. Garde-fou direction artistique : palette indigo/violette/ivoire proscrite
    if (/\b(?:indigo|violet|purple|ivory|ivoire)\b/i.test(code)) {
      push('palette-proscrite', code.trim(), 'aucune occurrence dans le corpus — interdit');
    }

    // 13. En CSS, toute couleur non passée par var() est suspecte
    if (isStyle) {
      for (const m of code.matchAll(/\b(?:color|background-color|border-color|outline-color)\s*:\s*([^;]+)/g)) {
        const v = m[1].trim();
        if (!usesVar(v) && v !== 'transparent' && v !== 'inherit' && v !== 'currentColor' && v !== 'none') {
          if (!violations.some((x) => x.file === rel && x.line === n && x.rule.startsWith('couleur'))) {
            push('couleur-littérale', m[0], 'utiliser var(--…) du contrat de tokens');
          }
        }
      }
    }
  });
}

/** Retire les commentaires de fin de ligne (// et /* *\/) sans toucher aux URLs. */
function stripComment(line) {
  return line
    .replace(/\/\*.*?\*\//g, '')
    .replace(/(?<![:'"])\/\/.*$/g, '');
}

const usesVar = (s) => /var\(--/.test(s);
const isSvgUri = (s) => /url\(["']?data:image\/svg/.test(s);

for (const d of SCAN_DIRS) walk(join(ROOT, d));

if (violations.length === 0) {
  console.log('DIVINI exo — contrôle « aucune valeur en dur »\n');
  console.log(`  fichiers analysés : ${scanned.length}`);
  for (const f of scanned) console.log(`    ${f}`);
  if (scanned.length === 0) {
    console.error('\n  Aucun fichier analysé : le contrôle serait vide. Vérifiez les chemins.\n');
    process.exit(1);
  }
  console.log('\n  Aucune violation. Tout passe par le contrat de tokens.\n');
  process.exit(0);
}

const byRule = new Map();
for (const v of violations) {
  byRule.set(v.rule, (byRule.get(v.rule) ?? 0) + 1);
}

console.log('DIVINI exo — contrôle « aucune valeur en dur »\n');
console.log(`  fichiers analysés : ${scanned.length}\n`);
console.log('  Répartition :');
for (const [rule, count] of [...byRule].sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(count).padStart(4)}  ${rule}`);
}
console.log('');

const byFile = new Map();
for (const v of violations) {
  if (!byFile.has(v.file)) byFile.set(v.file, []);
  byFile.get(v.file).push(v);
}
for (const [file, list] of byFile) {
  console.log(`  ${file}`);
  for (const v of list.slice(0, 12)) {
    console.log(`    l.${String(v.line).padStart(4)}  [${v.rule}] ${v.match}`);
    console.log(`            ${v.text.slice(0, 96)}`);
    console.log(`            -> ${v.why}`);
  }
  if (list.length > 12) console.log(`    … et ${list.length - 12} autre(s)`);
  console.log('');
}

console.error(`CONTRAT VIOLÉ — ${violations.length} valeur(s) en dur dans ${byFile.size} fichier(s).\n`);
process.exit(1);
