/**
 * DIVINI exo — Boutons
 *
 * Corpus l. 7925-7931 :
 *   primary = accent · ghost = transparent + border · hover subtil ·
 *   active scale ~0.96–0.97 · pas de bouton décoratif.
 *
 * « Pas de bouton décoratif » est pris au sérieux : `onClick` est obligatoire.
 * Un bouton sans action ne compile pas — c'est la règle, pas une convention.
 *
 * L'état `loading` bloque l'action et annonce l'attente aux lecteurs d'écran.
 * Un bouton `loading` n'est jamais un bouton qui fait semblant.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { Icon, type IconName } from './Icon';

import styles from './ui.module.css';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'subtil';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  /** Icône à droite — pour les actions de navigation. */
  trailingIcon?: IconName;
  loading?: boolean;
  /** Pleine largeur sous 720 px dans un formulaire (LOT 01 §7). */
  fullWidth?: boolean;
  children: ReactNode;
  /** Obligatoire : aucun bouton décoratif. */
  onClick: () => void;
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  loading = false,
  fullWidth = false,
  children,
  onClick,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const busy = loading || disabled;

  return (
    <button
      type="button"
      className={[
        styles.button,
        styles[`button${variant}`],
        styles[`size${size}`],
        fullWidth ? styles.buttonFull : '',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      disabled={busy}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : icon ? (
        <Icon name={icon} size={`var(--ctl-icon-${size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'})`} />
      ) : null}
      <span>{children}</span>
      {trailingIcon && !loading ? (
        <Icon name={trailingIcon} size="var(--ctl-icon-sm)" />
      ) : null}
    </button>
  );
}

/* ------------------------------- IconButton ------------------------------- */

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: IconName;
  /** Obligatoire : le libellé accessible remplace le texte absent. */
  label: string;
  variant?: 'ghost' | 'danger' | 'subtil';
  size?: ButtonSize;
  onClick: () => void;
};

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  onClick,
  disabled,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={[styles.iconButton, styles[`icon${variant}`], styles[`size${size}`], className ?? '']
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      {...rest}
    >
      <Icon name={icon} size={`var(--ctl-icon-${size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'})`} />
    </button>
  );
}
