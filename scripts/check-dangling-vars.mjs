/**
 * DIVINI exo — Contrôle « aucune var() suspendue »
 *
 * Une `var(--x)` dont la variable n'existe pas ne produit aucune erreur de
 * build : le navigateur ignore simplement la déclaration. Le style disparaît
 * en silence — exactement le défaut qui a laissé passer trois `padding` inertes
 * dans le LOT 01.
 *
 * Le garde-fou intégré à `build-css.mjs` ne couvre que le CSS GÉNÉRÉ. Celui-ci
 * couvre le CSS CONSOMMATEUR : tout ce que les applications écrivent.
 *
 * Usage : npm run check:vars
 *
 * Le script échoue (exit 1) sur toute variable non définie. Il n'y a pas
 * d'exception silencieuse : si une variable manque, c'est soit une faute de
 * frappe, soit un token à ajouter dans packages/design-tokens/src/.
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
const SCAN_EXT = new Set(['.css', '.scss']);

/**
 * Source de vérité des variables : le CSS généré par le contrat de tokens.
 *
 * On lit le fichier généré et non `src/*.mjs` : c'est ce que le navigateur
 * reçoit réellement. Une variable absente de `dist/` est absente du produit,
 * quelle que soit son origine.
 */
const TOKENS_CSS = join(ROOT, 'packages', 'design-tokens', 'dist', 'divini-tokens.css');

/* ------------------------------ collecte ------------------------------ */

function walk(dir, out) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry) || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (SCAN_EXT.has(extname(entry))) out.push(full);
  }
  return out;
}

const files = [];
for (const dir of SCAN_DIRS) walk(join(ROOT, dir), files);
files.sort();

// Le CSS généré est analysé comme les autres : il peut lui aussi référencer
// une variable qu'il ne définit pas.
if (existsSync(TOKENS_CSS)) files.push(TOKENS_CSS);

/* --------------------------- variables définies ------------------------ */

const DECLARED = /(--[\w-]+)\s*:/g;
const USED = /var\(\s*(--[\w-]+)/g;

/** Variables définies par le contrat de tokens, globalement disponibles. */
const globalDefined = new Set();
{
  const css = readFileSync(TOKENS_CSS, 'utf8');
  for (const m of css.matchAll(DECLARED)) globalDefined.add(m[1]);
}

/* ------------------------------- analyse ------------------------------- */

const violations = [];
let totalUsed = 0;

for (const file of files) {
  const css = readFileSync(file, 'utf8');
  const rel = relative(ROOT, file);

  // Un fichier peut définir ses propres variables (scope local, cascade).
  const locallyDefined = new Set();
  for (const m of css.matchAll(DECLARED)) locallyDefined.add(m[1]);

  const lines = css.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const m of line.matchAll(USED)) {
      const name = m[1];
      totalUsed += 1;
      if (globalDefined.has(name) || locallyDefined.has(name)) continue;
      violations.push({ file: rel, line: i + 1, name, text: line.trim() });
    }
  }
}

/* -------------------------------- rapport ------------------------------ */

console.log('Contrôle « aucune var() suspendue » — CSS consommateur');
console.log(`  fichiers analysés : ${files.length}`);
console.log(`  références var()  : ${totalUsed}`);
console.log(`  variables définies par le contrat : ${globalDefined.size}`);

if (violations.length === 0) {
  console.log('');
  console.log('  Aucune var() suspendue. Chaque référence résout vers un token réel.');
  process.exit(0);
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
    console.log(`    l.${String(v.line).padStart(4)}  ${v.name}`);
    console.log(`            ${v.text.slice(0, 96)}`);
  }
  if (list.length > 12) console.log(`    … et ${list.length - 12} autre(s)`);
  console.log('');
}

console.error(
  `CONTRAT VIOLÉ — ${violations.length} var() suspendue(s) dans ${byFile.size} fichier(s).\n` +
    `  Ces déclarations sont ignorées par le navigateur : le style attendu ne s'applique pas.\n`
);
process.exit(1);
