/**
 * Stub de test pour `next/navigation`.
 *
 * Fournit le minimum utilisé par les composants (router, pathname, searchParams)
 * sans serveur Next. `push`/`replace` enregistrent l'appel pour assertion.
 */

export const __routerCalls = [];

export function useRouter() {
  return {
    push: (to) => __routerCalls.push(['push', to]),
    replace: (to) => __routerCalls.push(['replace', to]),
    back: () => __routerCalls.push(['back']),
    prefetch: () => {}
  };
}

export function usePathname() {
  return '/';
}

export function useSearchParams() {
  return new URLSearchParams();
}
