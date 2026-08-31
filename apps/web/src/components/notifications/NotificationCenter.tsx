/**
 * DIVINI exo — Notification Center (LOT 04 §2.2)
 *
 * Couche proactive : cloche + panneau latéral + flux filtré par portée.
 *
 * Non-duplication : le panneau RÉUTILISE le `Drawer` du LOT 01 (Escape, piège à
 * focus, retour de focus, translation 320 ms déjà couverts) et les toasts du
 * LOT 01 pour l'immédiat. Aucun voile ni tiroir n'est réécrit ici.
 *
 * Portée (LOT 04 §2.2.7) : le tenant voit les événements de ses établissements
 * selon la portée active ; un utilisateur d'établissement ne voit que les siens.
 * La portée vient de `useShellState()` (LOT 02), jamais d'un état parallèle.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import Link from 'next/link';

import { Icon } from '../ui/Icon';
import { IconButton, Button } from '../ui/Button';
import { Drawer } from '../ui/Overlay';
import { EmptyState } from '../ui/Feedback';
import { StatusDot } from '../ui/Identity';

import { useShellState } from '../../lib/shell-state';

import { formatNotificationTime, makeNotifications } from './mock';
import {
  CATEGORY_ICON,
  CATEGORY_LABELS,
  NOTIFICATION_CATEGORIES,
  type AppNotification,
  type NotificationCategory,
  type NotificationFeedState,
  type NotificationSeverity
} from './types';

import styles from './notifications.module.css';

const SEVERITY_TONE: Record<NotificationSeverity, 'info' | 'success' | 'warning' | 'critical'> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  critical: 'critical'
};

type NotificationContextValue = {
  notifications: AppNotification[];
  /** Flux déjà filtré par portée. */
  visible: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  feedState: NotificationFeedState;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { scope, connection } = useShellState();
  const [notifications, setNotifications] = useState<AppNotification[]>(() => makeNotifications());
  const [panelOpen, setPanelOpen] = useState(false);

  const feedState: NotificationFeedState =
    connection === 'offline' ? 'offline' : connection === 'syncing' ? 'syncing' : 'ready';

  const visible = useMemo(
    () =>
      scope.kind === 'site'
        ? notifications.filter((n) => n.siteId === scope.siteId)
        : notifications,
    [notifications, scope]
  );

  const unreadCount = useMemo(() => visible.filter((n) => !n.read).length, [visible]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  const value = useMemo(
    () => ({
      notifications,
      visible,
      unreadCount,
      markRead,
      markAllRead,
      feedState,
      panelOpen,
      openPanel,
      closePanel
    }),
    [notifications, visible, unreadCount, markRead, markAllRead, feedState, panelOpen, openPanel, closePanel]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationPanel />
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications doit être utilisé dans <NotificationProvider>.');
  return ctx;
}

/* --------------------------------- Cloche --------------------------------- */

export function NotificationBell() {
  const { unreadCount, openPanel } = useNotifications();

  return (
    <span className={styles.bell}>
      <IconButton
        icon="bell"
        label={unreadCount > 0 ? `Notifications : ${unreadCount} non lues` : 'Notifications'}
        size="sm"
        variant="ghost"
        onClick={openPanel}
        aria-haspopup="dialog"
      />
      {unreadCount > 0 ? (
        <span className={styles.bellCount} aria-hidden="true">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      ) : null}
    </span>
  );
}

/* --------------------------------- Item ----------------------------------- */

export function NotificationItem({ notification }: { notification: AppNotification }) {
  const { markRead } = useNotifications();

  return (
    <li className={`${styles.item} ${notification.read ? '' : styles.itemUnread}`}>
      <span className={styles.itemIcon} data-severity={notification.severity}>
        <Icon name={CATEGORY_ICON[notification.category]} size="var(--ctl-icon-sm)" />
      </span>

      <div className={styles.itemBody}>
        <div className={styles.itemHead}>
          <p className={styles.itemTitle}>{notification.title}</p>
          {!notification.read ? (
            <StatusDot tone={SEVERITY_TONE[notification.severity]} label="Non lu" labelHidden />
          ) : null}
        </div>
        <p className={styles.itemText}>{notification.body}</p>
        <div className={styles.itemMeta}>
          <span className={styles.itemCategory}>{CATEGORY_LABELS[notification.category]}</span>
          <span className={styles.itemTime}>{formatNotificationTime(notification.at)}</span>
          {notification.demo ? <span className={styles.itemDemo}>démo</span> : null}
        </div>
        <Link
          className={styles.itemAction}
          href={notification.destination.route}
          onClick={() => markRead(notification.id)}
        >
          {notification.destination.label}
          <Icon name="arrowRight" size="var(--ctl-icon-sm)" />
        </Link>
      </div>
    </li>
  );
}

/* -------------------------------- Panneau --------------------------------- */

type PanelFilter = 'unread' | 'all';

export function NotificationPanel() {
  const { visible, unreadCount, markAllRead, feedState, panelOpen, closePanel } =
    useNotifications();
  const [filter, setFilter] = useState<PanelFilter>('unread');
  const [category, setCategory] = useState<NotificationCategory | 'all'>('all');

  const filtered = useMemo(() => {
    let list = visible;
    if (filter === 'unread') list = list.filter((n) => !n.read);
    if (category !== 'all') list = list.filter((n) => n.category === category);
    return list;
  }, [visible, filter, category]);

  return (
    <Drawer open={panelOpen} onClose={closePanel} title="Notifications" size="sm">
      <div className={styles.panelToolbar}>
        <div className={styles.segmented} role="tablist" aria-label="Filtrer les notifications">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'unread'}
            className={`${styles.segmentedBtn} ${filter === 'unread' ? styles.segmentedActive : ''}`}
            onClick={() => setFilter('unread')}
          >
            Non lues ({unreadCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            className={`${styles.segmentedBtn} ${filter === 'all' ? styles.segmentedActive : ''}`}
            onClick={() => setFilter('all')}
          >
            Toutes
          </button>
        </div>
        <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
          Tout marquer comme lu
        </Button>
      </div>

      <label className={styles.panelSelect}>
        <span className="t-label">Catégorie</span>
        <select
          className={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value as NotificationCategory | 'all')}
        >
          <option value="all">Toutes les catégories</option>
          {NOTIFICATION_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>

      {feedState === 'offline' ? (
        <p className={styles.panelNote}>
          Hors ligne — les notifications non synchronisées seront reprises à la reconnexion.
        </p>
      ) : null}
      {feedState === 'syncing' ? (
        <p className={styles.panelNote}>Synchronisation en cours…</p>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          icon="bell"
          title="Aucune notification"
          description={
            filter === 'unread'
              ? 'Vous êtes à jour : aucune notification non lue dans cette portée.'
              : 'Aucune notification dans cette portée pour ce filtre.'
          }
        />
      ) : (
        <ul className={styles.list}>
          {filtered.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </ul>
      )}

      <div className={styles.panelFooter}>
        <Link className={styles.panelFooterLink} href="/app/notifications" onClick={closePanel}>
          Ouvrir l’historique complet
          <Icon name="arrowRight" size="var(--ctl-icon-sm)" />
        </Link>
      </div>
    </Drawer>
  );
}
