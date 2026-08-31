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
 * Next n'est pas importable par Node ESM (résolution webpack). On redirige ses
 * deux primitives utilisées par les composants vers des stubs de test, pour que
 * le shell, le Command Center et le Notification Center restent testables.
 */
const NEXT_STUBS = {
  'next/link': new URL('./stubs/next-link.mjs', import.meta.url).href,
  'next/navigation': new URL('./stubs/next-navigation.mjs', import.meta.url).href
};

/**
 * Les sources du projet utilisent des imports sans extension (`./Icon`), ce que
 * TypeScript autorise et Node refuse. On complète l'extension à la résolution.
 */
export async function resolve(specifier, context, nextResolve) {
  const stub = NEXT_STUBS[specifier];
  if (stub) return { url: stub, shortCircuit: true };

  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    const relative = specifier.startsWith('.') || specifier.startsWith('/');
    const recoverable =
      error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'ERR_UNSUPPORTED_DIR_IMPORT';
    if (!recoverable || !relative) throw error;

    for (const suffix of ['.tsx', '.ts', '.mjs', '.js', '/index.tsx', '/index.ts', '/index.mjs']) {
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
