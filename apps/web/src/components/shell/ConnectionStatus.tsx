/**
 * DIVINI exo — Indicateur de connexion / synchronisation
 *
 * LOT 02 §2.1 : présent en permanence, l'application est offline-first.
 * LOT 02 §9 : `online` · `offline` · `syncing` · `conflit` · `erreur`.
 *
 * **Honnêteté (socle commun §6.3)** : il n'y a aucun backend. Cet indicateur
 * est une SIMULATION D'INTERFACE pilotée par `/dev/shell`. Il n'interroge pas
 * `navigator.onLine` : un indicateur « synchronisé » qui ne vérifie rien serait
 * une fausse promesse. Le libellé le dit explicitement.
 */

import { Icon, type IconName } from '../ui/Icon';

import { CONNECTION_LABELS, type ConnectionState } from '../../lib/shell-state';

import styles from './shell.module.css';

/**
 * `switch` plutôt qu'une table indexée : avec `noUncheckedIndexedAccess`, un
 * `Record<K, V>` lu par clé donne `V | undefined`, ce qui n'est pas assignable
 * aux props attendues. Le `switch` exhaustif garantit une valeur définie et
 * fait échouer la compilation si un état est ajouté sans être traité.
 */
function iconFor(state: ConnectionState): IconName {
  switch (state) {
    case 'online':
      return 'checkCircle';
    case 'offline':
      return 'wifiOff';
    case 'syncing':
      return 'refresh';
    case 'conflict':
      return 'alertTriangle';
    case 'syncError':
      return 'alertCircle';
  }
}

function toneClassFor(state: ConnectionState): string {
  switch (state) {
    case 'online':
      return styles.connectionOnline ?? '';
    case 'offline':
      return styles.connectionOffline ?? '';
    case 'syncing':
      return styles.connectionSyncing ?? '';
    case 'conflict':
      return styles.connectionConflict ?? '';
    case 'syncError':
      return styles.connectionError ?? '';
  }
}

type ConnectionStatusProps = {
  state: ConnectionState;
  /** Libellé court pour les écrans contraints. */
  compact?: boolean;
};

export function ConnectionStatus({ state, compact = false }: ConnectionStatusProps) {
  const label = CONNECTION_LABELS[state];

  return (
    <span
      className={`${styles.connection} ${toneClassFor(state)}`}
      // `status` et non `alert` : un changement de synchronisation ne doit pas
      // interrompre la lecture. Les états critiques ont leur propre canal.
      role="status"
      title="État de synchronisation — simulation d'interface, aucun serveur réel"
    >
      <Icon
        name={iconFor(state)}
        size="var(--ctl-icon-sm)"
        className={state === 'syncing' ? styles.spin : undefined}
      />
      {compact ? null : <span>{label}</span>}
    </span>
  );
}
