/**
 * DIVINI exo — Menus
 *
 * Dropdown (ancré à un déclencheur) et ContextMenu (ancré au pointeur).
 * Les deux partagent la même base : une primitive dupliquée est une régression.
 *
 * Clavier (LOT 01 §5) :
 *   - flèches haut/bas pour naviguer, Home/End pour les extrémités ;
 *   - `Escape` ferme et rend le focus au déclencheur ;
 *   - `Tab` ferme : un menu n'est pas une modale, il ne piège pas le focus.
 *
 * Responsive (LOT 01 §7) : sous 720 px, si l'ancrage est impossible, le menu
 * devient une feuille en bas d'écran.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { moveFocus, useReturnFocus } from './focus';
import { Icon, type IconName } from './Icon';

import styles from './ui.module.css';

export type MenuItem = {
  id: string;
  label: string;
  icon?: IconName;
  onSelect: () => void;
  /** Rend l'entrée non disponible plutôt que de la masquer. */
  disabled?: boolean;
  /** Opération critique : rendu en couleur négative, confirmation attendue. */
  destructive?: boolean;
};

type MenuBaseProps = {
  items: MenuItem[];
  /** Libellé accessible du groupe. */
  label: string;
  onClose: () => void;
};

/** Positionne le panneau en restant dans le viewport. */
function computePosition(
  anchor: { x: number; y: number } | null,
  panel: HTMLElement | null
): { top: number; left: number; sheet: boolean } {
  if (!panel) return { top: 0, left: 0, sheet: false };
  const rect = panel.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Sous 720 px : feuille en bas d'écran (LOT 01 §7).
  if (vw <= 720) return { top: 0, left: 0, sheet: true };

  const x = anchor?.x ?? 0;
  const y = anchor?.y ?? 0;
  const left = Math.min(Math.max(8, x), Math.max(8, vw - rect.width - 8));
  const flip = y + rect.height > vh - 8;
  const top = flip ? Math.max(8, y - rect.height) : y;
  return { top, left, sheet: false };
}

function MenuPanel({ items, label, onClose }: MenuBaseProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useReturnFocus();
  const [pos, setPos] = useState<{ top: number; left: number; sheet: boolean }>({
    top: 0,
    left: 0,
    sheet: false
  });

  useLayoutEffect(() => {
    returnFocus.save();
  }, [returnFocus]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const anchor = panel.dataset.anchor
      ? (JSON.parse(panel.dataset.anchor) as { x: number; y: number })
      : null;
    setPos(computePosition(anchor, panel));

    const items = Array.from(panel.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    const first = items.find((el) => !el.hasAttribute('aria-disabled')) ?? items[0];
    first?.focus();

    /**
     * `Escape` doit fermer le menu quel que soit l'élément focusé.
     *
     * Le gestionnaire `onKeyDown` du panneau ne reçoit l'événement que si la
     * touche part de l'intérieur du menu (les événements remontent, ils ne
     * descendent pas). Dès que le focus était sorti — clic ailleurs, focus sur
     * le corps — `Escape` ne faisait plus rien. Démontré par
     * `tests/components.test.mjs`. On écoute donc au niveau du document, comme
     * le fait déjà `OverlayBase`.
     */
    const onDocumentKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      returnFocus.restore();
      onClose();
    };
    document.addEventListener('keydown', onDocumentKeydown);

    return () => document.removeEventListener('keydown', onDocumentKeydown);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        returnFocus.restore();
        onClose();
        return;
      }
      if (event.key === 'Tab') {
        returnFocus.restore();
        onClose();
        return;
      }
      if (event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        const panel = panelRef.current;
        if (!panel) return;
        const items = Array.from(panel.querySelectorAll<HTMLElement>('[role="menuitem"]'));
        moveFocus(items, document.activeElement as HTMLElement, event.key);
      }
    },
    [onClose, returnFocus]
  );

  return (
    <div
      ref={panelRef}
      role="menu"
      aria-label={label}
      className={`${styles.menu} ${pos.sheet ? styles.menuSheet : ''}`}
      style={pos.sheet ? undefined : { top: `${pos.top}px`, left: `${pos.left}px` }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          className={[
            styles.menuItem,
            item.destructive ? styles.menuItemDestructive : '',
            item.disabled ? styles.menuItemDisabled : ''
          ]
            .filter(Boolean)
            .join(' ')}
          aria-disabled={item.disabled || undefined}
          onClick={() => {
            if (item.disabled) return;
            returnFocus.restore();
            item.onSelect();
            onClose();
          }}
        >
          {item.icon ? <Icon name={item.icon} size="var(--ctl-icon-sm)" /> : null}
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------- Dropdown -------------------------------- */

type DropdownProps = {
  /** Contenu du déclencheur. */
  trigger: ReactNode;
  items: MenuItem[];
  label: string;
};

export function Dropdown({ trigger, items, label }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev && wrapRef.current) {
        const rect = wrapRef.current.getBoundingClientRect();
        setAnchor({ x: rect.left, y: rect.bottom + 4 });
      }
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <span ref={wrapRef} className={styles.dropdownWrap}>
      <span onClick={toggle} onKeyDown={(e) => e.key === 'Enter' && toggle()} role="presentation">
        {trigger}
      </span>
      {open ? (
        <div data-anchor={JSON.stringify(anchor)} className={styles.menuAnchor}>
          <MenuPanel items={items} label={label} onClose={() => setOpen(false)} />
        </div>
      ) : null}
    </span>
  );
}

/* ------------------------------ ContextMenu ------------------------------- */

type ContextMenuProps = {
  items: MenuItem[];
  label: string;
  children: ReactNode;
};

/**
 * Menu contextuel.
 *
 * Il complète le clavier, il ne le remplace pas : toute action disponible ici
 * doit l'être aussi par un moyen accessible. C'est pourquoi la galerie expose
 * les mêmes actions dans un Dropdown voisin.
 */
export function ContextMenu({ items, label, children }: ContextMenuProps) {
  const [state, setState] = useState<{ x: number; y: number } | null>(null);

  return (
    <>
      <span
        onContextMenu={(event) => {
          event.preventDefault();
          setState({ x: event.clientX, y: event.clientY });
        }}
        className={styles.contextTarget}
      >
        {children}
      </span>
      {state ? (
        <div data-anchor={JSON.stringify(state)} className={styles.menuAnchor}>
          <MenuPanel items={items} label={label} onClose={() => setState(null)} />
        </div>
      ) : null}
    </>
  );
}
