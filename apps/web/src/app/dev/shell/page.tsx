/**
 * DIVINI exo — /dev/shell : route technique du shell
 *
 * LOT 02 §3 : cette route exerce ce que `/app` ne montre pas encore —
 *   - sidebar ouverte / compacte ;
 *   - les cinq états de connexion ;
 *   - les états de zone de travail (chargement, erreur, droit refusé) ;
 *   - les trois statuts de module, dont `non activé` → Abonnement → Modules.
 *
 * C'est un banc de vérification, pas un écran produit. Rien ici n'est une
 * fonctionnalité métier : le shell n'a pas de backend.
 */

'use client';

import { Button } from '@/components/ui';
import { AppShell } from '@/components/shell';
import { SectionLabel } from '@/components/ui';

import { DEV_VARIATION_MODULES } from '@/lib/modules';
import {
  useShellState,
  type ConnectionState
} from '@/lib/shell-state';
import type { WorkspaceState } from '@/lib/shell-state';

import styles from './dev-shell.module.css';

const CONNECTIONS: ConnectionState[] = [
  'online',
  'offline',
  'syncing',
  'conflict',
  'syncError'
];

const WORKSPACES: { id: WorkspaceState; label: string }[] = [
  { id: 'empty', label: 'Vide (accueil)' },
  { id: 'loading', label: 'Chargement' },
  { id: 'error', label: 'Erreur' },
  { id: 'denied', label: 'Droit refusé' }
];

/**
 * Contrôles du banc.
 *
 * Rendu DANS le shell (en enfant d'`AppShell`) pour accéder au contexte : il
 * pilote l'état réel du shell, il ne simule pas un affichage parallèle.
 */
function ShellDevControls() {
  const {
    connection,
    setConnection,
    workspaceState,
    setWorkspaceState,
    activeModuleId,
    setActiveModuleId
  } = useShellState();

  return (
    <div className={styles.controls}>
      <SectionLabel>États de connexion (simulation)</SectionLabel>
      <div className={styles.row}>
        {CONNECTIONS.map((state) => (
          <Button
            key={state}
            size="sm"
            variant={connection === state ? 'primary' : 'ghost'}
            onClick={() => setConnection(state)}
            aria-pressed={connection === state}
          >
            {state}
          </Button>
        ))}
      </div>

      <SectionLabel>États de la zone de travail</SectionLabel>
      <div className={styles.row}>
        {WORKSPACES.map((entry) => (
          <Button
            key={entry.id}
            size="sm"
            variant={workspaceState === entry.id ? 'primary' : 'ghost'}
            onClick={() => setWorkspaceState(entry.id)}
            aria-pressed={workspaceState === entry.id}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      {activeModuleId ? (
        <Button size="sm" variant="subtil" onClick={() => setWorkspaceState('empty')}>
          Réafficher l’état du module actif
        </Button>
      ) : null}

      <SectionLabel>Statuts de module</SectionLabel>
      <div className={styles.row}>
        {DEV_VARIATION_MODULES.map((m) => (
          <Button
            key={m.id}
            size="sm"
            variant={activeModuleId === m.id ? 'primary' : 'ghost'}
            onClick={() => setActiveModuleId(m.id)}
            aria-pressed={activeModuleId === m.id}
          >
            {m.label}
          </Button>
        ))}
        {activeModuleId ? (
          <Button size="sm" variant="subtil" onClick={() => setActiveModuleId(null)}>
            Revenir à l’accueil
          </Button>
        ) : null}
      </div>

      <p className={styles.note}>
        Le statut « non activé » ouvre l’état Abonnement → Modules : le module
        reste visible, rien n’est masqué. Aucun module du manifeste réel ne
        porte ce statut — aucun écran n’existe encore, et un module « non
        activé » laisserait croire qu’il est construit mais non souscrit.
      </p>
    </div>
  );
}

export default function DevShellPage() {
  return (
    <AppShell>
      <ShellDevControls />
    </AppShell>
  );
}
