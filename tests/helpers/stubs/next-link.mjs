/**
 * Stub de test pour `next/link`.
 *
 * Next n'est pas importable directement par Node ESM (résolution webpack). Pour
 * tester les composants qui rendent des liens, on fournit un `<a>` équivalent :
 * même contrat d'attributs usuels, aucune navigation réelle.
 */

import { createElement } from 'react';

export default function Link({ href, children, ...rest }) {
  return createElement('a', { href, ...rest }, children);
}
