/**
 * DIVINI exo — Overlays : Modal, Drawer, ConfirmDialog
 *
 * Règle de non-duplication (l. 3423-3439) : `ConfirmDialog` et `Modal` partagent
 * la même base d'overlay. Il n'y a pas deux implémentations de voile, de piège à
 * focus ou de fermeture `Escape`.
 *
 * Design (l. 7933-7938) : overlay translucide, blur léger, apparition
 * `scale + translateY`, rayon 12–14 px.
 *
 * Clavier (LOT 01 §5) : `Escape` ferme, le focus est piégé, il est rendu à
 * l'élément déclencheur à la fermeture.
 *
 * ConfirmDialog (l. 3237-3252) : les opérations critiques demandent confirmation —
 * suppression, annulation, gros export, campagne importante, modification
 * critique, réactivation, changement de permissions.
 */

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

import { trapFocus, useReturnFocus } from './focus';
import { Icon } from './Icon';

import styles from './ui.module.css';

/* ------------------------------ Base partagée ----------------------------- */

type OverlayBaseProps = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  /** `dialog` pour une modale, `dialog` + région pour un tiroir. */
  variant: 'modal' | 'drawer';
  children: ReactNode;
};

function OverlayBase({ open, onClose, labelledBy, describedBy, variant, children }: OverlayBaseProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useReturnFocus();

  /**
   * `onClose` est passé par ref pour ne PAS figurer dans les dépendances de
   * l'effet ci-dessous.
   *
   * Sans ça, tout parent qui transmet une fonction inline (`onClose={() => …}`)
   * re-déclenchait l'effet à chaque rendu. L'effet remet le focus sur le premier
   * élément du panneau : le focus de l'utilisateur était donc volé dès que le
   * parent re-rendait. Démontré par `tests/components.test.mjs`.
   */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    returnFocus.save();

    const panel = panelRef.current;
    if (!panel) return;

    // Le focus entre dans le panneau ; à défaut, sur le premier élément focusable.
    const first = panel.querySelector<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    (first ?? panel).focus();

    const release = trapFocus(panel);
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener('keydown', onKeydown);

    // Le défilement de l'arrière-plan est suspendu pendant l'overlay.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      release();
      document.removeEventListener('keydown', onKeydown);
      document.body.style.overflow = previousOverflow;
      returnFocus.restore();
    };
  }, [open, returnFocus]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={variant === 'modal' ? styles.modal : styles.drawer}
      >
        {children}
      </div>
    </div>
  );
}

/* --------------------------------- Modal ---------------------------------- */

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Pied de page : actions réelles. Sans action, aucun pied n'est rendu. */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  // `useId` et non un id codé en dur : deux overlays ouverts en même temps
  // (une confirmation lancée depuis une modale) produisaient des ids DOM
  // dupliqués, et `aria-labelledby` résolvait vers le mauvais titre.
  const titleId = useId();

  return (
    <OverlayBase open={open} onClose={onClose} labelledBy={titleId} variant="modal">
      <div className={`${styles.overlayInner} ${styles[`overlaySize${size}`]}`}>
        <header className={styles.overlayHeader}>
          <h2 id={titleId} className={styles.overlayTitle}>
            {title}
          </h2>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Fermer">
            <Icon name="close" size="var(--ctl-icon-sm)" />
          </button>
        </header>
        <div className={styles.overlayBody}>{children}</div>
        {footer ? <footer className={styles.overlayFooter}>{footer}</footer> : null}
      </div>
    </OverlayBase>
  );
}

/* --------------------------------- Drawer --------------------------------- */

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

export function Drawer({ open, onClose, title, children, footer, size = 'md' }: DrawerProps) {
  const titleId = useId();

  return (
    <OverlayBase open={open} onClose={onClose} labelledBy={titleId} variant="drawer">
      <div className={`${styles.overlayInner} ${styles[`drawerSize${size}`]}`}>
        <header className={styles.overlayHeader}>
          <h2 id={titleId} className={styles.overlayTitle}>
            {title}
          </h2>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Fermer">
            <Icon name="close" size="var(--ctl-icon-sm)" />
          </button>
        </header>
        <div className={styles.overlayBody}>{children}</div>
        {footer ? <footer className={styles.overlayFooter}>{footer}</footer> : null}
      </div>
    </OverlayBase>
  );
}

/* ------------------------------ ConfirmDialog ----------------------------- */

/**
 * Confirmation d'opération critique (l. 3237-3252).
 *
 * Le libellé de l'action de confirmation nomme l'opération : « Supprimer »,
 * jamais « OK ». Un « OK » ne dit pas ce qui va se passer.
 */
type ConfirmDialogProps = {
  open: boolean;
  onCancel: () => void;
  title: string;
  /** Ce qui va se produire, en clair. */
  description: string;
  /** Libellé explicite : « Supprimer le devis », pas « Confirmer ». */
  confirmLabel: string;
  /** Libellé de l'annulation. « Annuler » par défaut, ajustable au contexte. */
  cancelLabel?: string;
  onConfirm: () => void;
  /** L'opération est-elle destructive ? Détermine la couleur de l'action. */
  destructive?: boolean;
  /** L'action de confirmation est en cours. */
  pending?: boolean;
};

export function ConfirmDialog({
  open,
  onCancel,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Annuler',
  onConfirm,
  destructive = false,
  pending = false
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();

  return (
    <OverlayBase open={open} onClose={onCancel} labelledBy={titleId} describedBy={descId} variant="modal">
      <div className={`${styles.overlayInner} ${styles.overlaySizeSm}`}>
        <header className={styles.overlayHeader}>
          <h2 id={titleId} className={styles.overlayTitle}>
            {title}
          </h2>
        </header>
        <div className={styles.overlayBody}>
          <p id={descId} className={styles.overlayText}>
            {description}
          </p>
        </div>
        <footer className={styles.overlayFooter}>
          <button type="button" className={styles.buttonGhost} onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={destructive ? styles.buttonDanger : styles.buttonPrimary}
            onClick={onConfirm}
            disabled={pending}
            aria-busy={pending || undefined}
          >
            {pending ? <span className={styles.spinner} aria-hidden="true" /> : null}
            {confirmLabel}
          </button>
        </footer>
      </div>
    </OverlayBase>
  );
}
