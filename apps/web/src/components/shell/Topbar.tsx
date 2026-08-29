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

import { useEffect, useState } from 'react';

import { Icon } from '../ui/Icon';
import { Button, IconButton } from '../ui/Button';
import { Modal } from '../ui/Overlay';

import { ConnectionStatus } from './ConnectionStatus';
import { ScopeSwitcher } from './ScopeSwitcher';
import { ThemeToggle } from './ThemeToggle';

import { useShellState } from '../../lib/shell-state';

import styles from './shell.module.css';

/* ----------------------------- SearchTrigger ------------------------------ */

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  /**
   * Le raccourci dépend de la plateforme. Il est résolu après le montage :
   * le calculer pendant le rendu produirait une divergence d'hydratation entre
   * le serveur et le client.
   */
  const [shortcut, setShortcut] = useState<string | null>(null);

  useEffect(() => {
    const isMac =
      typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform ?? '');
    setShortcut(isMac ? '⌘K' : 'Ctrl K');
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeydown = (event: KeyboardEvent) => {
      // Le raccourci est annoncé : il doit réellement ouvrir le panneau.
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.searchTrigger}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <Icon name="search" size="var(--ctl-icon-sm)" />
        <span className={styles.searchHint}>Rechercher…</span>
        {shortcut ? <span className={styles.kbd}>{shortcut}</span> : null}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Command Center"
        size="sm"
      >
        <p>
          La recherche globale n’est pas encore construite : elle arrive au{' '}
          <strong>LOT 04 — Command Center</strong>.
        </p>
        <p>
          Ce déclencheur est volontairement un bouton et non un champ de saisie :
          un champ qui ne chercherait rien serait une fausse promesse.
        </p>
      </Modal>
    </>
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
