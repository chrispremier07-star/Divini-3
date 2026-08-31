/**
 * DIVINI exo — /app/parametres/notifications · Préférences (LOT 04 §2.2.4, N2)
 *
 * Réglage par canal, par catégorie. Persisté **localement** (interdit n°4).
 *
 * Honnêteté : seul le canal in-app est réel dans ce lot ; email / push /
 * WhatsApp / SMS sont des réglages d'interface dont l'ouverture effective est
 * reportée (LOT 12 / backend) — c'est signalé, jamais présenté comme actif.
 */

'use client';

import { AppShell } from '@/components/shell';
import { Switch } from '@/components/ui';

import {
  CHANNEL_LABELS,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  CATEGORY_LABELS,
  useNotificationPrefs
} from '@/components/notifications';

import styles from './prefs.module.css';

const REAL_CHANNELS = new Set(['in-app']);

export default function NotificationPreferencesPage() {
  const { prefs, status, setChannel, setCategory, reset } = useNotificationPrefs();

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>Préférences de notification</h1>
            <p className={styles.subtitle}>
              Réglage local, non sensible. Aucun canal réel n’est ouvert dans ce lot.
            </p>
          </div>
          <p className={styles.status} data-status={status} aria-live="polite">
            {status === 'saving'
              ? 'Enregistrement…'
              : status === 'saved'
                ? 'Enregistré'
                : status === 'error'
                  ? 'Échec de l’enregistrement local'
                  : 'À jour'}
          </p>
        </header>

        <div className={styles.grid}>
          <section className={styles.col} aria-label="Canaux">
            <h2 className={styles.colTitle}>Canaux</h2>
            {NOTIFICATION_CHANNELS.map((channel) => (
              <div key={channel} className={styles.row}>
                <Switch
                  checked={prefs.channels[channel]}
                  onChange={(v) => setChannel(channel, v)}
                  label={CHANNEL_LABELS[channel]}
                />
                {!REAL_CHANNELS.has(channel) ? (
                  <span className={styles.rowNote}>reporté — LOT 12 / backend</span>
                ) : null}
              </div>
            ))}
          </section>

          <section className={styles.col} aria-label="Catégories">
            <h2 className={styles.colTitle}>Catégories (in-app)</h2>
            {NOTIFICATION_CATEGORIES.map((category) => (
              <div key={category} className={styles.row}>
                <Switch
                  checked={prefs.categories[category]}
                  onChange={(v) => setCategory(category, v)}
                  label={CATEGORY_LABELS[category]}
                />
              </div>
            ))}
          </section>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.reset} onClick={reset}>
            Réinitialiser les préférences
          </button>
        </div>
      </div>
    </AppShell>
  );
}
