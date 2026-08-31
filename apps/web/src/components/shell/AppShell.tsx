/**
 * DIVINI exo — App Shell
 *
 * Composition canonique (corpus l. 7845-7889, blueprint §8.1) :
 *   sidebar · topbar · barre de contexte · zone de travail.
 *
 * Le tiroir de navigation mobile réutilise le `Drawer` du LOT 01 au lieu d'en
 * écrire un second : son `Escape`, son piège à focus et son retour de focus
 * sont déjà couverts par `tests/components.test.mjs`. Une primitive dupliquée
 * est une régression (règle du corpus).
 */

'use client';

import { Drawer } from '../ui/Overlay';
import { ToastProvider } from '../ui/Toast';

import { CommandCenterProvider } from '../command';
import { NotificationProvider } from '../notifications';

import { ShellStateProvider, useShellState } from '../../lib/shell-state';
import { scopeLabel } from '../../lib/scope';
import { findModule } from '../../lib/modules';

import { ContextBar, type BreadcrumbSegment, type ModuleTab } from './ContextBar';
import { Sidebar, SidebarBrand, UserFooter, type DemoSession } from './Sidebar';
import { Topbar } from './Topbar';
import { WorkspaceLayout } from './WorkspaceLayout';

import styles from './shell.module.css';

/**
 * Identité de session de démonstration.
 *
 * Aucune authentification réelle n'existe (socle commun §6.3). Cette identité
 * est affichée comme telle par `UserFooter`.
 */
export const DEMO_SESSION: DemoSession = {
  name: 'Camille Roux',
  initials: 'CR',
  role: 'Gérant',
};

type AppShellProps = {
  /** Onglets du module actif, le cas échéant. */
  tabs?: ModuleTab[];
  activeTabId?: string | null;
  onTabSelect?: (id: string) => void;
  filters?: string[];
  /** CTA primaire de la topbar — doit correspondre à une action réelle. */
  primaryAction?: { label: string; onClick: () => void };
  children?: React.ReactNode;
};

/** Corps du shell — doit être dans `ShellStateProvider`. */
function ShellBody({
  tabs,
  activeTabId,
  onTabSelect,
  filters,
  primaryAction,
  children
}: AppShellProps) {
  const { collapsed, mobileNavOpen, setMobileNavOpen, activeModuleId, scope, workspaceState } =
    useShellState();

  const activeModule = activeModuleId ? findModule(activeModuleId) : undefined;
  const pageTitle = activeModule?.label ?? 'Accueil';

  // Breadcrumb : Accueil → groupe → module. Obligatoire dès le troisième niveau
  // (LOT 02 §2.1).
  const breadcrumb: BreadcrumbSegment[] = [
    { id: 'home', label: 'Accueil' },
    ...(activeModule
      ? [
          { id: 'group', label: activeModule.group },
          { id: 'module', label: activeModule.label }
        ]
      : [])
  ];

  return (
    <div className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ''}`}>
      {/* ---------------------------- sidebar dockée --------------------------- */}
      <aside className={styles.sidebar} aria-label="Barre latérale">
        <SidebarBrand />
        <Sidebar />
        <UserFooter session={DEMO_SESSION} scope={scope} compact={collapsed} />
      </aside>

      {/* ------------------------------ colonne ------------------------------- */}
      <div className={styles.main}>
        <Topbar primaryAction={primaryAction} />

        <ContextBar
          title={pageTitle}
          breadcrumb={breadcrumb}
          tabs={tabs}
          activeTabId={activeTabId}
          onTabSelect={onTabSelect}
          filters={filters}
        />

        <WorkspaceLayout>{children}</WorkspaceLayout>
      </div>

      {/* --------------------------- tiroir mobile ---------------------------- */}
      <Drawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        title="Navigation"
        size="sm"
      >
        {/* La portée et l'utilisateur passent en haut du tiroir sur mobile
            (LOT 02 §7) : la sidebar dockée y est masquée. */}
        <p className={styles.userFooterRole}>Portée : {scopeLabel(scope)}</p>
        <Sidebar variant="drawer" />
        <UserFooter session={DEMO_SESSION} scope={scope} compact={false} />
      </Drawer>
    </div>
  );
}

/**
 * `AppearanceProvider` n'est PAS posé ici : le layout racine
 * (`app/layout.tsx`) le fournit déjà pour toute l'application. Un second
 * provider imbriqué créerait un état de thème parallèle, en désaccord avec
 * celui posé avant le premier paint par `ANTI_FLASH_SCRIPT`.
 */
export function AppShell(props: AppShellProps) {
  return (
    <ShellStateProvider>
      <ToastProvider>
        <NotificationProvider>
          <CommandCenterProvider>
            <ShellBody {...props} />
          </CommandCenterProvider>
        </NotificationProvider>
      </ToastProvider>
    </ShellStateProvider>
  );
}
