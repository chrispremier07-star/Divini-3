/**
 * DIVINI exo — Topbar
 *
 * Corpus l. 7873-7880 : compacte, `border-bottom`, recherche type control,
 * raccourci clavier en IBM Plex Mono, actions à droite, CTA primaire ambre.
 *
 * Le déclencheur de recherche est un BOUTON, pas un champ : le Command Center
 * arrive au LOT 04 (LOT 02 §2.2). D'ici là il ouvre un état explicite qui le
 * dit, jamais un champ inerte ni un panneau vide.
 */

'use client';

import { Icon } from '../ui/Icon';
import { Button, IconButton } from '../ui/Button';

import { ConnectionStatus } from './ConnectionStatus';
import { ScopeSwitcher } from './ScopeSwitcher';
import { ThemeToggle } from './ThemeToggle';

import { useShellState } from '../../lib/shell-state';
import { useCommandCenter } from '../command';
import { NotificationBell } from '../notifications';

import styles from './shell.module.css';

/* ----------------------------- SearchTrigger ------------------------------ */

/**
 * LOT 04 : le déclencheur ouvre désormais le Command Center réel. Le raccourci
 * (résolu après montage côté provider, pour éviter toute divergence SSR) est
 * affiché en IBM Plex Mono ; il ouvre effectivement la palette.
 */
export function SearchTrigger() {
  const { openPalette, shortcut } = useCommandCenter();

  return (
    <button
      type="button"
      className={styles.searchTrigger}
      onClick={openPalette}
      aria-haspopup="dialog"
    >
      <Icon name="search" size="var(--ctl-icon-sm)" />
      <span className={styles.searchHint}>Rechercher…</span>
      {shortcut ? <span className={styles.kbd}>{shortcut}</span> : null}
    </button>
  );
}

/* --------------------------------- Topbar --------------------------------- */

type TopbarProps = {
  /** CTA primaire ambre — doit correspondre à une action réelle du contexte. */
  primaryAction?: { label: string; onClick: () => void };
};

export function Topbar({ primaryAction }: TopbarProps) {
  const { setMobileNavOpen, connection } = useShellState();

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <IconButton
          icon="menu"
          label="Ouvrir la navigation"
          size="sm"
          variant="ghost"
          onClick={() => setMobileNavOpen(true)}
          className={styles.mobileNavButton}
        />

        <ScopeSwitcher />
        <SearchTrigger />
      </div>

      <div className={styles.topbarActions}>
        <ConnectionStatus state={connection} />
        <NotificationBell />
        <ThemeToggle />
        {primaryAction ? (
          <Button variant="primary" size="sm" onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
