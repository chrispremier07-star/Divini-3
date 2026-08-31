/**
 * DIVINI exo — Primitives d'identité et de sémantique visuelle
 *
 * Sémantique stricte — corpus l. 7951-7963 (V2.6), quatre canaux :
 *   INFO · SUCCESS · ATTENTION · CRITIQUE
 *
 * Les valeurs ne sont pas recopiées ici : elles vivent dans le contrat de tokens
 * (--state-info, --state-success, --state-warning, --state-critical) et sont
 * résolues par thème. Les écrire en commentaire créerait une seconde source
 * susceptible de diverger.
 *
 * Deux règles non négociables :
 *   1. CRITIQUE n'est jamais décoratif — il signale une gravité réelle.
 *   2. La couleur n'est jamais le seul vecteur : chaque indicateur porte aussi
 *      un libellé, une icône ou une forme. Un daltonien doit pouvoir lire l'état.
 */

import type { ReactNode } from 'react';

import { Icon, type IconName } from './Icon';

import styles from './ui.module.css';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'critical';

/** Gravité croissante — toute comparaison de sévérité passe par cet ordre. */
export const TONE_SEVERITY: Record<Tone, number> = {
  neutral: 0,
  info: 1,
  success: 2,
  warning: 3,
  critical: 4
};

const TONE_ICON: Record<Exclude<Tone, 'neutral'>, IconName> = {
  info: 'info',
  success: 'checkCircle',
  warning: 'alertTriangle',
  critical: 'alertCircle'
};

/* ------------------------------- StatusDot -------------------------------- */

type StatusDotProps = {
  tone: Tone;
  /** Libellé rendu en texte accessible — la couleur seule ne suffit pas. */
  label: string;
  /** Masque le libellé visuellement mais le conserve pour les lecteurs d'écran. */
  labelHidden?: boolean;
};

export function StatusDot({ tone, label, labelHidden = false }: StatusDotProps) {
  return (
    <span className={styles.statusDotWrap}>
      <span
        className={`${styles.statusDot} ${styles[`tone${tone}`]}`}
        aria-hidden="true"
      />
      <span className={labelHidden ? styles.srOnly : styles.statusDotLabel}>{label}</span>
    </span>
  );
}

/* --------------------------------- Badge ---------------------------------- */

type BadgeProps = {
  tone?: Tone;
  children: ReactNode;
  /** Affiche l'icône sémantique — renforce la couleur par une forme. */
  withIcon?: boolean;
};

export function Badge({ tone = 'neutral', children, withIcon = true }: BadgeProps) {
  const icon = tone === 'neutral' ? null : TONE_ICON[tone];
  return (
    <span className={`${styles.badge} ${styles[`tone${tone}`]}`}>
      {withIcon && icon ? <Icon name={icon} size="var(--ctl-icon-sm)" /> : null}
      {children}
    </span>
  );
}

/* --------------------------- SeverityIndicator ---------------------------- */

type SeverityIndicatorProps = {
  tone: Tone;
  /** Libellé explicite : « critique », « à surveiller »… Jamais la couleur seule. */
  label: string;
  /**
   * Niveau 1 à 4. Rendu par une échelle de barres ET une couleur : deux vecteurs,
   * jamais un seul.
   */
  level: 1 | 2 | 3 | 4;
};

export function SeverityIndicator({ tone, label, level }: SeverityIndicatorProps) {
  return (
    <span
      className={styles.severity}
      title={`${label} — niveau ${level} sur 4`}
    >
      <span className={styles.severityBars} aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`${styles.severityBar} ${
              n <= level ? styles[`tone${tone}`] : styles.severityBarOff
            }`}
          />
        ))}
      </span>
      <span className={styles.severityLabel}>{label}</span>
    </span>
  );
}

/* --------------------------------- Avatar --------------------------------- */

type AvatarProps = {
  /** Initiales affichées — deux caractères maximum. */
  initials: string;
  /** Nom complet, lu par les technologies d'assistance. */
  name: string;
  size?: 'sm' | 'md' | 'lg';
  /** État non disponible : l'avatar ne ment pas sur une identité absente. */
  unavailable?: boolean;
};

export function Avatar({ initials, name, size = 'md', unavailable = false }: AvatarProps) {
  return (
    <span
      className={`${styles.avatar} ${styles[`avatar${size}`]} ${
        unavailable ? styles.avatarUnavailable : ''
      }`}
      role="img"
      aria-label={unavailable ? 'Identité non disponible' : name}
      title={unavailable ? 'Identité non disponible' : name}
    >
      {unavailable ? <Icon name="user" size="var(--ctl-icon-sm)" /> : initials.slice(0, 2)}
    </span>
  );
}
