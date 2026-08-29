/**
 * DIVINI exo — Progression (LOT 03)
 *
 * Barre et anneau. Valeur toujours en mono, exprimée en texte : la couleur
 * n'est jamais le seul vecteur (§5, §11). Seuils sémantiques optionnels.
 */

'use client';

import type { Tone } from '../ui/Identity';

import styles from './data.module.css';

export const TONE_COLOR: Record<Tone, string> = {
  neutral: 'var(--text-secondary)',
  info: 'var(--text-info)',
  success: 'var(--text-success)',
  warning: 'var(--text-warning)',
  critical: 'var(--text-critical)'
};

function toneForValue(value: number, thresholds?: { warning: number; critical: number }): Tone {
  if (!thresholds) return 'info';
  if (value >= thresholds.critical) return 'critical';
  if (value >= thresholds.warning) return 'warning';
  return 'success';
}

export type ProgressBarProps = {
  /** 0 à 100. */
  value: number;
  label?: string;
  /** Forcer un ton ; sinon dérivé des seuils. */
  tone?: Tone;
  /** Seuils au-delà desquels la situation se dégrade. */
  thresholds?: { warning: number; critical: number };
};

export function ProgressBar({ value, label, tone, thresholds }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const resolved = tone ?? toneForValue(clamped, thresholds);
  const color = TONE_COLOR[resolved];

  return (
    <div>
      {label ? (
        <span className={styles.progressLabel}>
          <span>{label}</span>
          <span className={styles.progressValue} style={{ color }}>
            {Math.round(clamped)} %
          </span>
        </span>
      ) : (
        <span className={styles.progressValue} style={{ color }}>
          {Math.round(clamped)} %
        </span>
      )}
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progression'}
      >
        <div
          className={styles.progressFill}
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export type ProgressRingProps = {
  value: number;
  size?: number;
  label?: string;
  tone?: Tone;
  thresholds?: { warning: number; critical: number };
};

export function ProgressRing({ value, size = 64, label, tone, thresholds }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const resolved = tone ?? toneForValue(clamped, thresholds);
  const color = TONE_COLOR[resolved];

  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <span
      className={styles.progressRing}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progression'}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-recessed)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        className={styles.progressValue}
      >
        {Math.round(clamped)}
      </span>
    </span>
  );
}
