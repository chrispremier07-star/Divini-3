/**
 * DIVINI exo — Utilitaires de focus
 *
 * LOT 01 §5 : tout overlay se ferme à `Escape`, tout menu se navigue aux flèches,
 * le focus est piégé dans les modales et rendu à l'élément déclencheur.
 *
 * Ces fonctions sont partagées par Menu, Modal, Drawer, ConfirmDialog et Toast
 * pour qu'aucun overlay n'invente son propre comportement clavier.
 */

import { useMemo, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Éléments focusables et visibles d'un conteneur.
 *
 * La version précédente utilisait `el.offsetParent !== null` comme critère de
 * visibilité. C'était doublement faux :
 *   - `offsetParent` vaut aussi `null` pour tout élément en `position: fixed`,
 *     qui n'est pas invisible pour autant — or le tiroir et le voile de fond
 *     SONT en position fixe ;
 *   - le critère dépend du layout, donc inutilisable hors navigateur.
 *
 * On teste maintenant ce qui signifie réellement « non focusable » : attributs
 * `hidden` / `inert`, `aria-hidden="true"`, et display/visibility calculés.
 */
export function getFocusable(container: HTMLElement): HTMLElement[] {
  const view = container.ownerDocument.defaultView;
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
    // `hidden` et `inert` s'appliquent au sous-arbre : on remonte les ancêtres.
    if (el.closest('[hidden], [inert]') !== null) return false;
    // Un élément sous un sous-arbre aria-hidden ne doit pas recevoir le focus.
    if (el.closest('[aria-hidden="true"]') !== null) return false;

    const style = view?.getComputedStyle(el);
    if (style && (style.display === 'none' || style.visibility === 'hidden')) return false;

    return true;
  });
}

/**
 * Piège le focus dans un conteneur.
 * Retourne la fonction de nettoyage.
 */
export function trapFocus(container: HTMLElement): () => void {
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const items = getFocusable(container);
    if (items.length === 0) {
      event.preventDefault();
      container.focus();
      return;
    }
    const first = items[0] as HTMLElement;
    const last = items[items.length - 1] as HTMLElement;
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && (active === first || active === container)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', onKeydown);
  return () => container.removeEventListener('keydown', onKeydown);
}

/** Déplace le focus dans une liste d'éléments avec les flèches. */
export function moveFocus(items: HTMLElement[], current: HTMLElement, key: string): void {
  const index = items.indexOf(current);
  if (index === -1) return;
  let next = index;
  if (key === 'ArrowDown' || key === 'ArrowRight') next = (index + 1) % items.length;
  else if (key === 'ArrowUp' || key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
  else if (key === 'Home') next = 0;
  else if (key === 'End') next = items.length - 1;
  else return;
  (items[next] as HTMLElement).focus();
}

/** Renvoie le focus à l'élément qui avait ouvert l'overlay. */
export function useReturnFocus(): { save: () => void; restore: () => void } {
  /**
   * Deux défauts corrigés ici, tous deux révélés par `tests/components.test.mjs` :
   *
   * 1. `saved` était une variable locale : recréée à CHAQUE rendu, donc la
   *    référence au déclencheur était perdue dès que le composant re-rendait.
   *    Elle vit maintenant dans une ref, qui survit aux rendus.
   *
   * 2. L'objet retourné était neuf à chaque rendu. Comme il figure dans les
   *    dépendances des effets de `OverlayBase` et `MenuPanel`, ces effets se
   *    re-déclenchaient à chaque rendu du parent — et remettaient le focus sur
   *    le premier élément du panneau, volant le focus de l'utilisateur.
   *    `useMemo` sans dépendance garantit une identité stable.
   */
  const saved = useRef<HTMLElement | null>(null);

  return useMemo(
    () => ({
      save: () => {
        saved.current = document.activeElement as HTMLElement | null;
      },
      restore: () => {
        const element = saved.current;
        if (element && document.contains(element)) element.focus();
        saved.current = null;
      }
    }),
    []
  );
}
