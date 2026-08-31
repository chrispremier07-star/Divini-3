/**
 * DIVINI exo — Résolution de la cascade CSS
 *
 * Pourquoi ce module existe :
 *   le contrôle de contraste vérifiait la table de tokens JS, qui était juste,
 *   alors que le CSS généré pouvait résoudre AUTREMENT selon la spécificité et
 *   l'ordre des règles. Un bloc `:root` placé après `html[data-theme='light']`
 *   écrasait les tokens sémantiques du thème clair. Le contrôle passait, le
 *   rendu était illisible.
 *
 * Ce module rejoue donc la cascade réelle sur le fichier CSS généré :
 * spécificité, puis ordre source, puis résolution des var() en chaîne.
 * C'est la valeur que le navigateur calculerait qui est ensuite testée.
 */

import { readFileSync } from 'node:fs';

/** Spécificité CSS simplifiée, suffisante pour nos sélecteurs. */
export function specificity(selector) {
  const s = selector.trim();
  const ids = (s.match(/#[\w-]+/g) || []).length;
  const classes = (s.match(/\.[\w-]+/g) || []).length;
  const attrs = (s.match(/\[[^\]]+\]/g) || []).length;
  const pseudos = (s.match(/:[\w-]+(?:\([^)]*\))?/g) || []).length;
  // retire les pseudo-éléments comptés comme pseudo-classes
  const types = (s.replace(/[#.[:][^\s]*/g, ' ').match(/\b(?:html|body|div|span|p|a)\b/g) || []).length;
  return [ids, classes + attrs + pseudos, types];
}

const cmpSpec = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/**
 * Découpe un fichier CSS en règles { selector, declarations, media }.
 * Gère un seul niveau d'imbrication (@media), ce qui couvre notre sortie.
 */
export function parseCss(css) {
  const rules = [];
  let media = null;
  let i = 0;
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');

  while (i < src.length) {
    const atMedia = src.indexOf('@media', i);
    const brace = src.indexOf('{', i);
    if (brace === -1) break;

    if (atMedia !== -1 && atMedia < brace) {
      const condEnd = src.indexOf('{', atMedia);
      media = src.slice(atMedia, condEnd).trim();
      i = condEnd + 1;
      continue;
    }

    const selector = src.slice(i, brace).trim();
    let depth = 1;
    let j = brace + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') depth--;
      j++;
    }
    const body = src.slice(brace + 1, j - 1);

    // fin du bloc @media
    if (media && src[j] === undefined) media = null;

    const declarations = [];
    for (const decl of body.split(';')) {
      const idx = decl.indexOf(':');
      if (idx === -1) continue;
      const prop = decl.slice(0, idx).trim();
      const value = decl.slice(idx + 1).trim();
      if (prop.startsWith('--')) declarations.push([prop, value]);
    }

    if (selector && !selector.startsWith('@') && declarations.length) {
      rules.push({ selector, declarations, media });
    }

    i = j;
    // sortie d'un @media : le prochain `}` ferme le media
    if (media && src.slice(j).trimStart().startsWith('}')) {
      const k = src.indexOf('}', j);
      media = null;
      i = k + 1;
    }
  }
  return rules;
}

/** Un sélecteur s'applique-t-il au thème/densité demandés ? */
function matches(selector, { theme, density }) {
  const parts = selector.split(',').map((p) => p.trim());
  return parts.some((p) => {
    if (p === ':root' || p === 'html') return true;
    const themeAttr = p.match(/data-theme=['"]([\w-]+)['"]/);
    if (themeAttr && themeAttr[1] !== theme) return false;
    const densityAttr = p.match(/data-density=['"]([\w-]+)['"]/);
    if (densityAttr && density && densityAttr[1] !== density) return false;
    return true;
  });
}

/** Meilleure spécificité parmi les parties d'un sélecteur multiple. */
function selectorSpecificity(selector) {
  return selector
    .split(',')
    .map((p) => specificity(p))
    .reduce((best, cur) => (cmpSpec(cur, best) > 0 ? cur : best), [0, 0, 0]);
}

/**
 * Calcule les valeurs finales des variables pour un contexte donné,
 * en rejouant spécificité + ordre source, puis en résolvant les var().
 */
export function resolveVars(css, context) {
  const rules = parseCss(css);
  const won = new Map(); // prop -> { value, spec, order }

  rules.forEach((rule, order) => {
    if (rule.media) return; // @media évalué séparément par l'appelant
    if (!matches(rule.selector, context)) return;
    const spec = selectorSpecificity(rule.selector);
    for (const [prop, value] of rule.declarations) {
      const prev = won.get(prop);
      if (!prev || cmpSpec(spec, prev.spec) > 0 || (cmpSpec(spec, prev.spec) === 0 && order >= prev.order)) {
        won.set(prop, { value, spec, order });
      }
    }
  });

  const raw = new Map([...won].map(([k, v]) => [k, v.value]));

  /** Résolution récursive des var(), avec garde anti-cycle. */
  const resolve = (value, seen = new Set()) => {
    if (!value.includes('var(')) return value;
    return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g, (_, name, fallback) => {
      if (seen.has(name)) return fallback ?? '';
      const next = new Set(seen);
      next.add(name);
      const target = raw.get(name);
      if (target === undefined) return fallback ?? '';
      return resolve(target, next);
    });
  };

  const resolved = new Map();
  for (const [prop, value] of raw) resolved.set(prop, resolve(value).trim());
  return resolved;
}

export function readTokensCss(path) {
  return readFileSync(path, 'utf8');
}
