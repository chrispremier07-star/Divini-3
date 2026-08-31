/**
 * DIVINI exo — /app/notifications · vue étendue (LOT 04 §2.2.2, niveau N4)
 *
 * Historique complet : filtres par catégorie, par établissement, par période et
 * recherche. La liste RÉUTILISE la `DataTable` du LOT 03 (tri, pagination, mode
 * carte mobile) — aucune table n'est réécrite.
 *
 * Données de démonstration signalées ; chaque ligne porte une destination réelle.
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { AppShell } from '@/components/shell';
import { DataTable, type DataColumnType } from '@/components/data';
import { Badge, StatusDot } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';

import { useNotifications } from '@/components/notifications';
import {
  CATEGORY_LABELS,
  NOTIFICATION_CATEGORIES,
  type AppNotification,
  type NotificationSeverity
} from '@/components/notifications';

import { DEMO_SITES } from '@/lib/scope';

import styles from './notifications-page.module.css';

type Row = AppNotification & { siteLabel: string };

const SEVERITY_LABEL: Record<NotificationSeverity, string> = {
  info: 'Info',
  success: 'Succès',
  warning: 'Attention',
  critical: 'Critique'
};

const COLUMNS: DataColumnType<Row>[] = [
  {
    id: 'category',
    header: 'Catégorie',
    sortable: true,
    sortValue: (r) => CATEGORY_LABELS[r.category],
    render: (r) => (
      <span className={styles.cat}>
        <Icon name="bell" size="var(--ctl-icon-sm)" />
        {CATEGORY_LABELS[r.category]}
      </span>
    )
  },
  {
    id: 'title',
    header: 'Notification',
    sortable: true,
    sortValue: (r) => r.title,
    render: (r) => (
      <span className={styles.cellMain}>
        <span className={styles.cellTitle}>{r.title}</span>
        <span className={styles.cellSub}>{r.body}</span>
      </span>
    )
  },
  { id: 'site', header: 'Établissement', priority: 'normal', render: (r) => r.siteLabel },
  {
    id: 'severity',
    header: 'Gravité',
    priority: 'low',
    sortable: true,
    sortValue: (r) => r.severity,
    render: (r) => (
      <span className={styles.sev}>
        <StatusDot tone={r.severity === 'info' ? 'info' : r.severity} label={SEVERITY_LABEL[r.severity]} />
      </span>
    )
  },
  {
    id: 'at',
    header: 'Horodatage',
    mono: true,
    priority: 'low',
    sortable: true,
    sortValue: (r) => r.at,
    render: (r) => new Date(r.at).toISOString().slice(11, 16)
  },
  {
    id: 'read',
    header: 'Statut',
    priority: 'low',
    render: (r) => (r.read ? <Badge tone="neutral">Lue</Badge> : <Badge tone="info">Non lue</Badge>)
  },
  {
    id: 'action',
    header: 'Action',
    render: (r) => (
      <Link className={styles.rowLink} href={r.destination.route}>
        {r.destination.label}
      </Link>
    )
  }
];

type Period = 'all' | '24h' | '7d';

export default function NotificationsPage() {
  // Le contenu consomme le contexte de notifications : il doit être rendu DANS
  // <AppShell> (qui fournit <NotificationProvider>), pas au niveau de la page.
  return (
    <AppShell>
      <NotificationsContent />
    </AppShell>
  );
}

function NotificationsContent() {
  const { visible, markAllRead, unreadCount } = useNotifications();
  const [category, setCategory] = useState<string>('all');
  const [site, setSite] = useState<string>('all');
  const [period, setPeriod] = useState<Period>('all');

  const rows = useMemo<Row[]>(() => {
    const latest = visible.reduce((max, n) => (n.at > max ? n.at : max), visible[0]?.at ?? '');
    const cutoff =
      period === 'all' ? 0 : period === '24h' ? 24 * 3600_000 : 7 * 24 * 3600_000;
    const minTime = cutoff ? new Date(new Date(latest).getTime() - cutoff).toISOString() : '';

    return visible
      .filter((n) => (category === 'all' ? true : n.category === category))
      .filter((n) => (site === 'all' ? true : n.siteId === site))
      .filter((n) => (minTime ? n.at >= minTime : true))
      .map((n) => ({
        ...n,
        siteLabel: DEMO_SITES.find((s) => s.id === n.siteId)?.label ?? n.siteId
      }));
  }, [visible, category, site, period]);

  return (
    <div className={styles.page}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>Centre de notifications</h1>
            <p className={styles.subtitle}>
              Historique complet — flux local simulé et signalé, aucune donnée réelle.
            </p>
          </div>
          <button type="button" className={styles.markAll} onClick={markAllRead} disabled={unreadCount === 0}>
            Tout marquer comme lu
          </button>
        </header>

        <div className={styles.filters} role="group" aria-label="Filtres de l’historique">
          <label className={styles.filter}>
            <span className="t-label">Catégorie</span>
            <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">Toutes</option>
              {NOTIFICATION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filter}>
            <span className="t-label">Établissement</span>
            <select className={styles.select} value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="all">Tous</option>
              {DEMO_SITES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filter}>
            <span className="t-label">Période</span>
            <select className={styles.select} value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
              <option value="all">Toute période</option>
              <option value="24h">Dernières 24 h</option>
              <option value="7d">7 derniers jours</option>
            </select>
          </label>
        </div>

        <DataTable
          rows={rows}
          columns={COLUMNS}
          rowId={(r) => r.id}
          accessors={{
            searchText: (r) => `${r.title} ${r.body} ${CATEGORY_LABELS[r.category]} ${r.siteLabel}`,
            date: (r) => r.at
          }}
          mode="pagination"
          pageSize={8}
          emptyTitle="Aucune notification"
          emptyDescription="Aucune notification ne correspond à ces filtres dans cette portée."
        />
    </div>
  );
}
