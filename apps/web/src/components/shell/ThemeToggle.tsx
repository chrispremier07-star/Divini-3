/**
 * DIVINI exo — Bascule de thème
 *
 * Décision C.5 : sombre par défaut à la première connexion, clair disponible.
 * La préférence est mémorisée et posée avant le premier paint par
 * `ANTI_FLASH_SCRIPT` (LOT 00) — la bascule ne provoque donc aucun flash.
 *
 * C'est un vrai interrupteur (`role="switch"`), pas deux boutons : l'état doit
 * être annoncé, pas déduit de l'icône.
 */

'use client';

import { Icon } from '../ui/Icon';
import { useAppearance } from '../../lib/appearance';

import styles from './shell.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppearance();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!isDark}
      onClick={toggleTheme}
      className={styles.scopeButton}
      title={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
    >
      <Icon name={isDark ? 'moon' : 'sun'} size="var(--ctl-icon-sm)" />
      <span className={styles.scopeText}>{isDark ? 'Sombre' : 'Clair'}</span>
    </button>
  );
}
