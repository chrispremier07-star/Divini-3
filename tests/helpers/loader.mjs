/**
 * DIVINI exo — Loader de test
 *
 * Permet à `node --test` d'importer directement les composants React du projet :
 *   - `.tsx` / `.ts` → transformés par esbuild (JSX → `react/jsx-runtime`) ;
 *   - `.css` (et donc les CSS Modules) → remplacés par un objet dont chaque clé
 *     renvoie son propre nom, exactement comme le fait Next en développement.
 *
 * Sans ça, `import styles from './ui.module.css'` ferait échouer l'import.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const CSS_STUB =
  'export default new Proxy({}, { get: (_t, key) => (typeof key === "string" ? key : undefined) });';

/**
 * Les sources du projet utilisent des imports sans extension (`./Icon`), ce que
 * TypeScript autorise et Node refuse. On complète l'extension à la résolution.
 */
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    const relative = specifier.startsWith('.') || specifier.startsWith('/');
    if (error.code !== 'ERR_MODULE_NOT_FOUND' || !relative) throw error;

    for (const suffix of ['.tsx', '.ts', '.mjs', '.js', '/index.tsx', '/index.ts']) {
      try {
        return await nextResolve(specifier + suffix, context);
      } catch {
        // on essaie le suffixe suivant
      }
    }
    throw error;
  }
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    return { format: 'module', shortCircuit: true, source: CSS_STUB };
  }

  if (url.endsWith('.tsx') || url.endsWith('.ts')) {
    const source = await readFile(fileURLToPath(url), 'utf8');
    const { code } = transformSync(source, {
      loader: url.endsWith('.tsx') ? 'tsx' : 'ts',
      jsx: 'automatic',
      target: 'node22',
      format: 'esm',
      sourcemap: 'inline'
    });
    return { format: 'module', shortCircuit: true, source: code };
  }

  return nextLoad(url, context);
}
