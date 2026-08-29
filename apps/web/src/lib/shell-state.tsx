/**
 * DIVINI exo — État global du shell
 *
 * LOT 02 §2.1 : thème, portée, manifeste, statut de connexion, densité.
 * Le thème et la densité viennent d'`useAppearance()` (LOT 00) — on ne les
 * duplique pas ici.
 *
 * **Honnêteté (socle commun §6.3)** : il n'y a aucun backend. Le statut de
 * connexion est une SIMULATION D'INTERFACE, clairement présentée comme telle
 * dans l'UI. Il ne prétend pas refléter un état réseau réel, et `navigator.onLine`
 * n'est pas interrogé : un indicateur « en ligne » qui ne vérifie rien serait
 * une fausse promesse.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';

import {
  resolveScope,
  TENANT_SCOPE,
  type Scope
} from './scope';

/** États de connexion exigés par LOT 02 §9. */
export type ConnectionState =
  | 'online'
  | 'offline'
  | 'syncing'
  | 'conflict'
  | 'syncError';

export const CONNECTION_LABELS: Record<ConnectionState, string> = {
  online: 'Synchronisé',
  offline: 'Hors ligne',
  syncing: 'Synchronisation…',
  conflict: 'Conflit à résoudre',
  syncError: 'Échec de synchronisation'
};

/* ------------------------- État de la zone de travail ---------------------- */

/**
 * État de la zone de travail (LOT 02 §9).
 *
 * Il vit dans le shell et non dans chaque écran : le chargement, l'échec et le
 * refus de droit sont des états de la coquille, pas des états métier.
 */
export type WorkspaceState = 'empty' | 'loading' | 'error' | 'denied';

type ShellStateValue = {
  /** Portée active — décision C.2 : globale, portée par la session. */
  scope: Scope;
  setScope: (scope: Scope) => void;

  /** Sidebar repliée (desktop) et tiroir mobile. */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;

  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  /** Module actif — `null` sur la zone de travail vide. */
  activeModuleId: string | null;
  setActiveModuleId: (id: string | null) => void;

  /** État de la zone de travail. */
  workspaceState: WorkspaceState;
  setWorkspaceState: (state: WorkspaceState) => void;

  /** Simulation d'interface : aucun état réseau réel n'est mesuré. */
  connection: ConnectionState;
  setConnection: (state: ConnectionState) => void;
};

const ShellStateContext = createContext<ShellStateValue | null>(null);

export function ShellStateProvider({ children }: { children: ReactNode }) {
  const [scope, setScopeRaw] = useState<Scope>(TENANT_SCOPE);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionState>('online');
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>('empty');

  /** La portée est toujours résolue à l'écriture, jamais à la lecture. */
  const setScope = useCallback((next: Scope) => setScopeRaw(resolveScope(next)), []);
  const toggleCollapsed = useCallback(() => setCollapsed((prev) => !prev), []);

  const value = useMemo<ShellStateValue>(
    () => ({
      scope,
      setScope,
      collapsed,
      setCollapsed,
      toggleCollapsed,
      mobileNavOpen,
      setMobileNavOpen,
      activeModuleId,
      setActiveModuleId,
      workspaceState,
      setWorkspaceState,
      connection,
      setConnection
    }),
    [
      scope,
      setScope,
      collapsed,
      toggleCollapsed,
      mobileNavOpen,
      activeModuleId,
      workspaceState,
      connection
    ]
  );

  return <ShellStateContext.Provider value={value}>{children}</ShellStateContext.Provider>;
}

export function useShellState(): ShellStateValue {
  const ctx = useContext(ShellStateContext);
  if (!ctx) {
    throw new Error('useShellState doit être utilisé dans <ShellStateProvider>.');
  }
  return ctx;
}
