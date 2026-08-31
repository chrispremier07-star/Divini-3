/**
 * DIVINI exo — KPI (LOT 03, corpus l. 7893-7900)
 *
 * Valeur forte en mono, label muté, delta sémantique, count-up, hover minimal,
 * aucune carte criarde (pas d'ombre colorée, pas de gradient).
 *
 * Le delta n'est JAMAIS exprimé par la couleur seule : flèche + signe + valeur.
 * Le count-up (1 100–1 200 ms, token `--dur-count-up` = 1 150 ms) est déclenché
 * à l'entrée dans le viewport ; avec `prefers-reduced-motion` la valeur finale
 * est affichée directement.
 */

'use client';

import { useEffect, useRef, useState } from 'react';

import { Icon } from '../ui/Icon';

import styles from './data.module.css';

/* --------------------------------- hooks ---------------------------------- */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !('matchMedia' in window)) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Count-up vers `target`. Sans `requestAnimationFrame` (SSR/jsdom) ou avec
 * reduced-motion, la valeur finale est posée dès le premier effet.
 *
 * L'état initial vaut TOUJOURS 0 : lire `prefersReducedMotion()` dans
 * l'initialiseur produirait une divergence serveur/client (le serveur n'a pas
 * `matchMedia`) et donc une erreur d'hydratation. La branche média se décide
 * uniquement dans l'effet, côté client, après l'hydratation.
 */
export function useCountUp(target: number, durationMs = 1150): number {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion() || typeof requestAnimationFrame === 'undefined') {
      setDisplay(target);
      return;
    }
    if (started.current) return;
    started.current = true;

    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      // easing canonique approché (ease-out) — pas de bounce.
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return display;
}

/* --------------------------------- types ---------------------------------- */

export type KpiDelta = {
  value: number;
  direction: 'up' | 'down' | 'flat';
};

export type KpiCardProps = {
  label: string;
  value: number;
  /** Formatage de la valeur (monnaie, pourcentage…). Défaut : fr-FR. */
  format?: (value: number) => string;
  delta?: KpiDelta;
  /** Période couverte — obligatoire pour « comprendre avant d'agir » (§5). */
  period?: string;
  /** Portée ou sens de variation, si pertinent. */
  note?: string;
};

const formatDefault = (value: number) => value.toLocaleString('fr-FR');

/* ------------------------------- composants ------------------------------- */

export function KpiCard({ label, value, format = formatDefault, delta, period, note }: KpiCardProps) {
  const display = useCountUp(value);

  return (
    <div className={styles.kpiCard}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiValue}>{format(display)}</span>

      <span className={styles.kpiMeta}>
        {delta ? (
          <span
            className={`${styles.kpiDelta} ${
              delta.direction === 'up'
                ? styles.kpiDeltaUp
                : delta.direction === 'down'
                  ? styles.kpiDeltaDown
                  : styles.kpiDeltaFlat
            }`}
          >
            <Icon
              name={
                delta.direction === 'up'
                  ? 'trendingUp'
                  : delta.direction === 'down'
                    ? 'trendingDown'
                    : 'minus'
              }
              size="var(--ctl-icon-sm)"
            />
            {delta.direction === 'up' ? '+' : delta.direction === 'down' ? '−' : '±'}
            {format(delta.value)}
          </span>
        ) : null}

        {period ? <span className={styles.kpiPeriod}>{period}</span> : null}
      </span>

      {note ? <span className={styles.kpiPeriod}>{note}</span> : null}
    </div>
  );
}

type KpiGridProps = {
  children: React.ReactNode;
};

export function KpiGrid({ children }: KpiGridProps) {
  return <div className={styles.kpiGrid}>{children}</div>;
}
