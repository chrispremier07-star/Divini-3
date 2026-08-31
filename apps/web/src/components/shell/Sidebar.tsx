/**
 * DIVINI exo — Sidebar
 *
 * Générée intégralement depuis le manifeste (`lib/modules.ts`). Aucun item de
 * navigation n'est écrit ici (interdit, LOT 02 §11) : ce composant ne sait pas
 * quels modules existent, il sait les afficher.
 *
 * Design (corpus l. 7861-7872) : fond panel, border-right 1 px, icônes
 * linéaires, labels mutés, actif accent-soft + accent, hover panel-2 + text.
 *
 * Les trois statuts ont des rendus distincts et explicites — jamais un simple
 * grisé, jamais un écran fictif.
 */

'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/Button';
import { Avatar } from '../ui/Identity';

import {
  detachedModules,
  modulesByGroup,
  resolveModuleAction,
  type ModuleDescriptor
} from '../../lib/modules';
import { scopeShortLabel, type Scope } from '../../lib/scope';
import { useShellState } from '../../lib/shell-state';

import styles from './shell.module.css';

/* ------------------------------- SidebarItem ------------------------------ */

type SidebarItemProps = {
  module: ModuleDescriptor;
  active: boolean;
  compact: boolean;
  onSelect: (module: ModuleDescriptor) => void;
};

export function SidebarItem({ module, active, compact, onSelect }: SidebarItemProps) {
  const action = resolveModuleAction(module);

  /**
   * Le marqueur d'état n'est pas décoratif : il dit à l'utilisateur ce que le
   * clic produira. Un module `planifie` annonce son lot, un module `nonActive`
   * annonce l'abonnement — aucun des deux ne fait croire à un écran existant.
   */
  const statusLabel =
    action.kind === 'planned'
      ? `LOT ${String(action.lot).padStart(2, '0')}`
      : action.kind === 'subscribe'
        ? 'non activé'
        : null;

  // En mode compacte le libellé disparaît : le `title` prend le relais, sinon
  // l'information serait perdue (LOT 02 §5).
  const tooltip = compact
    ? statusLabel
      ? `${module.label} — ${statusLabel}`
      : module.label
    : undefined;

  return (
    <button
      type="button"
      className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
      onClick={() => onSelect(module)}
      aria-current={active ? 'page' : undefined}
      title={tooltip}
      aria-label={tooltip}
    >
      <Icon name={module.icon} size="var(--sidebar-icon-size)" className={styles.navIcon} />
      <span className={styles.navLabel}>{module.label}</span>
      {statusLabel ? (
        <span
          className={`${styles.navStatus} ${action.kind === 'subscribe' ? styles.navStatusLocked : ''}`}
        >
          {statusLabel}
        </span>
      ) : null}
    </button>
  );
}

/* ------------------------------- SidebarGroup ----------------------------- */

type SidebarGroupProps = {
  label: string;
  items: ModuleDescriptor[];
  activeModuleId: string | null;
  compact: boolean;
  onSelect: (module: ModuleDescriptor) => void;
};

export function SidebarGroup({
  label,
  items,
  activeModuleId,
  compact,
  onSelect
}: SidebarGroupProps) {
  return (
    <div className={styles.navGroup} role="group" aria-label={label}>
      <span className={styles.navGroupLabel} aria-hidden={compact || undefined}>
        {label}
      </span>
      {items.map((module) => (
        <SidebarItem
          key={module.id}
          module={module}
          active={module.id === activeModuleId}
          compact={compact}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

/* -------------------------------- UserFooter ------------------------------ */

export type DemoSession = {
  name: string;
  initials: string;
  role: string;
};

type UserFooterProps = {
  session: DemoSession;
  scope: Scope;
  compact: boolean;
};

export function UserFooter({ session, scope, compact }: UserFooterProps) {
  return (
    <>
      <div className={styles.userFooter}>
        <Avatar initials={session.initials} name={session.name} size="sm" />
        <span className={styles.userFooterText}>
          <span className={styles.userFooterName}>{session.name}</span>
          <span className={styles.userFooterRole}>
            {session.role} · {scopeShortLabel(scope)}
          </span>
        </span>
      </div>

      {/*
        Mention obligatoire (socle commun §6.3) : aucune authentification réelle
        n'existe. Le dire ici, à l'endroit où l'utilisateur cherche son compte,
        évite toute ambiguïté sur la nature de la session.
      */}
      {compact ? null : (
        <p className={styles.demoNotice}>Session de démonstration — aucune authentification réelle.</p>
      )}
    </>
  );
}

/* --------------------------------- Sidebar -------------------------------- */

type SidebarProps = {
  /** Rendu dans le tiroir mobile : pas de bouton de collapse. */
  variant?: 'docked' | 'drawer';
};

export function Sidebar({ variant = 'docked' }: SidebarProps) {
  const { collapsed, toggleCollapsed, activeModuleId, setActiveModuleId, setMobileNavOpen, scope } =
    useShellState();
  const router = useRouter();

  const compact = variant === 'docked' ? collapsed : false;

  const handleSelect = useCallback(
    (module: ModuleDescriptor) => {
      const action = resolveModuleAction(module);
      setActiveModuleId(module.id);

      // Un module disponible mène à sa route réelle : sans cela la barre
      // latérale ne ferait que changer un libellé et l'utilisateur resterait
      // bloqué sur l'écran courant (défaut constaté).
      if (action.kind === 'navigate' && action.route) {
        if (router) router.push(action.route);
        else window.location.assign(action.route);
      }
      // `planned` / `subscribe` : pas de navigation — la zone de travail affiche
      // l'état honnête « en construction — LOT n » ou le renvoi Abonnement.

      // Sur mobile, choisir un module referme le tiroir.
      setMobileNavOpen(false);
    },
    [router, setActiveModuleId, setMobileNavOpen]
  );

  const groups = modulesByGroup();
  const detached = detachedModules();

  return (
    <nav aria-label="Navigation principale" className={variant === 'drawer' ? styles.drawerNav : undefined}>
      <div className={styles.nav}>
        {groups.map((group) => (
          <SidebarGroup
            key={group.group}
            label={group.label}
            items={group.items}
            activeModuleId={activeModuleId}
            compact={compact}
            onSelect={handleSelect}
          />
        ))}

        {detached.length > 0 ? (
          <div className={styles.navDetached}>
            {detached.map((module) => (
              <SidebarItem
                key={module.id}
                module={module}
                active={module.id === activeModuleId}
                compact={compact}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  );
}

/** En-tête de sidebar : marque, nom, bouton de collapse. */
export function SidebarBrand() {
  const { collapsed, toggleCollapsed } = useShellState();

  return (
    <div className={styles.brand}>
      <span className={styles.brandMark} aria-hidden="true">
        <Icon name="layers" size="var(--ctl-icon-sm)" />
      </span>
      <span className={styles.brandName}>DIVINI exo</span>
      <IconButton
        icon={collapsed ? 'chevronRight' : 'panelLeft'}
        label={collapsed ? 'Déplier la navigation' : 'Replier la navigation'}
        size="sm"
        variant="ghost"
        onClick={toggleCollapsed}
        className={styles.collapseButton}
      />
    </div>
  );
}
