/**
 * DIVINI exo — Timeline (LOT 03)
 *
 * Événements datés, acteur, nature, résultat ; lecture verticale dense mais
 * aérée. Le point est coloré par la sémantique, mais le libellé de nature reste
 * en texte : jamais la couleur seule.
 */

'use client';

import type { Tone } from '../ui/Identity';

import { TONE_COLOR } from './Progress';

import styles from './data.module.css';

export type TimelineItemProps = {
  date: string;
  actor: string;
  /** Nature de l'événement, en texte. */
  title: string;
  /** Résultat constaté. */
  result: string;
  tone?: Tone;
};

export function TimelineItem({ date, actor, title, result, tone = 'info' }: TimelineItemProps) {
  return (
    <div className={styles.timelineItem}>
      <span className={styles.timelineDot} style={{ backgroundColor: TONE_COLOR[tone] }} aria-hidden="true" />
      <div className={styles.timelineContent}>
        <p className={styles.timelineTitle}>{title}</p>
        <p className={styles.timelineMeta}>
          {date} · {actor} · {result}
        </p>
      </div>
    </div>
  );
}

export function Timeline({ items }: { items: TimelineItemProps[] }) {
  return (
    <div className={styles.timeline}>
      {items.map((item, i) => (
        <TimelineItem key={`${item.date}-${i}`} {...item} />
      ))}
    </div>
  );
}
