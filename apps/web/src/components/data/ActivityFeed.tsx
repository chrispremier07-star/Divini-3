/**
 * DIVINI exo — ActivityFeed (LOT 03)
 *
 * Flux temps réel, regroupement par type (séparateur quand le type change),
 * horodatage relatif + absolu. L'icône du type est accompagnée du libellé :
 * jamais l'icône ou la couleur seule.
 */

'use client';

import { Icon, type IconName } from '../ui/Icon';

import styles from './data.module.css';

export type ActivityType =
  | 'creation'
  | 'update'
  | 'deletion'
  | 'sync'
  | 'alert'
  | 'sale'
  | 'user';

const TYPE_META: Record<ActivityType, { icon: IconName; label: string; bg: string }> = {
  creation: { icon: 'plus', label: 'Création', bg: 'var(--state-success)' },
  update: { icon: 'check', label: 'Mise à jour', bg: 'var(--state-info)' },
  deletion: { icon: 'trash', label: 'Suppression', bg: 'var(--state-critical)' },
  sync: { icon: 'refresh', label: 'Synchronisation', bg: 'var(--state-info)' },
  alert: { icon: 'alertCircle', label: 'Alerte', bg: 'var(--state-warning)' },
  sale: { icon: 'cart', label: 'Vente', bg: 'var(--state-success)' },
  user: { icon: 'user', label: 'Utilisateur', bg: 'var(--state-info)' }
};

/** Horodatage relatif déterministe si `now` est fourni. */
export function formatRelative(timestamp: number, now: number): string {
  const diff = Math.max(0, now - timestamp);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'à l’instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

export type ActivityItemProps = {
  type: ActivityType;
  text: string;
  /** Horodatage absolu affiché tel quel. */
  absolute: string;
  /** Horodatage relatif ; calculé sinon. */
  relative?: string;
};

export function ActivityItem({ type, text, absolute, relative }: ActivityItemProps) {
  const meta = TYPE_META[type];
  return (
    <div className={styles.activityItem}>
      <span className={styles.activityIcon} style={{ backgroundColor: meta.bg }} aria-hidden="true">
        <Icon name={meta.icon} size="var(--ctl-icon-sm)" />
      </span>
      <span className={styles.activityText}>
        {meta.label} — {text}
      </span>
      <time className={styles.activityTime} title={absolute}>
        {relative ?? absolute}
      </time>
    </div>
  );
}

export function ActivityFeed({ items }: { items: ActivityItemProps[] }) {
  return (
    <div className={styles.activity}>
      {items.map((item, i) => {
        const prev = items[i - 1];
        const showSeparator = i === 0 || prev?.type !== item.type;

        return (
          <div key={`${item.type}-${i}`} style={{ display: 'contents' }}>
            {showSeparator ? (
              <span className={styles.kpiLabel} style={{ marginTop: 'var(--d-field-gap)' }}>
                {TYPE_META[item.type].label}
              </span>
            ) : null}
            <ActivityItem {...item} />
          </div>
        );
      })}
    </div>
  );
}
