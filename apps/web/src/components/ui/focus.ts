/**
 * DIVINI exo — Utilitaires de focus
 *
 * LOT 01 §5 : tout overlay se ferme à `Escape`, tout menu se navigue aux flèches,
 * le focus est piégé dans les modales et rendu à l'élément déclencheur.
 *
 * Ces fonctions sont partagées par Menu, Modal, Drawer, ConfirmDialog et Toast
 * pour qu'aucun overlay n'invente son propre comportement clavier.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
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
  let saved: HTMLElement | null = null;
  return {
    save: () => {
      saved = document.activeElement as HTMLElement | null;
    },
    restore: () => {
      if (saved && document.contains(saved)) saved.focus();
      saved = null;
    }
  };
}
