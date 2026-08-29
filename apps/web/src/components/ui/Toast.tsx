/**
 * DIVINI exo — Notifications
 *
 * Corpus l. 7940-7950 :
 *   fixe · panel · border · shadow douce · entrée depuis la droite ·
 *   sortie vers la droite · progress bar fine · icône sémantique.
 *
 * La progress bar n'est pas décorative : elle indique le temps restant avant
 * fermeture automatique. Elle est donc doublée d'un attribut `aria-hidden` et
 * la durée est annoncée par le rôle `status`.
 *
 * `critical` ne ferme pas automatiquement : une notification critique attend
 * d'avoir été lue.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';

import { Icon, type IconName } from './Icon';

import styles from './ui.module.css';

export type ToastTone = 'info' | 'success' | 'warning' | 'critical';

const TOAST_ICON: Record<ToastTone, IconName> = {
  info: 'info',
  success: 'checkCircle',
  warning: 'alertTriangle',
  critical: 'alertCircle'
};

export type ToastInput = {
  id?: string;
  tone: ToastTone;
  title: string;
  description?: string;
  /** Millisecondes. `critical` ignore cette valeur et reste affiché. */
  duration?: number;
  action?: { label: string; onClick: () => void };
};

type ToastRecord = ToastInput & { id: string; leaving: boolean };

type ToastContextValue = {
  push: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION: Record<ToastTone, number> = {
  info: 5000,
  success: 4000,
  warning: 6000,
  critical: 0
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: string) => {
    // Sortie vers la droite : l'élément reste monté le temps de l'animation.
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 220);
  }, []);

  const push = useCallback(
    (toast: ToastInput) => {
      seq.current += 1;
      const id = toast.id ?? `toast-${seq.current}`;
      setToasts((prev) => [...prev, { ...toast, id, leaving: false }]);
      return id;
    },
    []
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans <ToastProvider>.');
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss
}: {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className={styles.toastViewport} aria-live="polite" aria-relevant="additions text">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: (id: string) => void }) {
  const duration = toast.duration ?? DEFAULT_DURATION[toast.tone];

  useEffect(() => {
    if (duration <= 0) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), duration);
    return () => window.clearTimeout(timer);
  }, [duration, toast.id, onDismiss]);

  return (
    <div
      className={`${styles.toast} ${styles[`toast${toast.tone}`]} ${
        toast.leaving ? styles.toastLeaving : ''
      }`}
      role={toast.tone === 'critical' ? 'alert' : 'status'}
    >
      <Icon
        name={TOAST_ICON[toast.tone]}
        size="var(--ctl-icon-md)"
        className={styles.toastIcon}
      />
      <div className={styles.toastBody}>
        <p className={styles.toastTitle}>{toast.title}</p>
        {toast.description ? <p className={styles.toastText}>{toast.description}</p> : null}
        {toast.action ? (
          <button
            type="button"
            className={styles.toastAction}
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer la notification"
      >
        <Icon name="close" size="var(--ctl-icon-sm)" />
      </button>
      {duration > 0 ? (
        <span
          className={styles.toastProgress}
          style={{ animationDuration: `${duration}ms` }}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
