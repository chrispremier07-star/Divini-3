/**
 * DIVINI exo — Zone de travail générique
 *
 * LOT 02 §3 : sur `/app`, la zone de travail est un **EmptyState assumé** qui
 * annonce ce qui arrivera, lot par lot. Aucun faux dashboard, aucune donnée
 * inventée.
 *
 * LOT 02 §9 : états loading (skeleton), empty, error, permission denied.
 *
 * Le comportement d'un module sélectionné est dicté par son statut dans le
 * manifeste — jamais par ce composant :
 *   - `planifie`  → « en construction — LOT nn », AUCUN écran fictif ;
 *   - `nonActive` → renvoi explicite vers Abonnement → Modules (l. 451) ;
 *   - `disponible`→ l'écran réel du module (aucun à ce stade du projet).
 */

'use client';

import { EmptyState, ErrorState, PermissionDenied } from '../ui/Feedback';
import { Skeleton, SkeletonBlock } from '../ui/Feedback';
import { Title, Subtitle, Body } from '../ui/Typography';
import { Icon } from '../ui/Icon';

import { findModule, resolveModuleAction } from '../../lib/modules';
import { useShellState } from '../../lib/shell-state';

import styles from './shell.module.css';

type WorkspaceLayoutProps = {
  /** Contenu réel d'un module disponible. */
  children?: React.ReactNode;
};

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  // L'état vient du shell : il est partagé entre la barre de contexte, la
  // topbar et la zone de travail, et pilotable depuis `/dev/shell`.
  const { activeModuleId, setActiveModuleId, workspaceState: state } = useShellState();

  if (state === 'loading') {
    return (
      <main className={styles.workspace}>
        <Skeleton width="38%" height="var(--fs-3xl)" />
        <SkeletonBlock lines={4} />
      </main>
    );
  }

  if (state === 'error') {
    return (
      <main className={styles.workspace}>
        <ErrorState
          title="La zone de travail n’a pas pu s’afficher"
          description="Nous n’arrivons pas à charger cette page. Vous pouvez réessayer, ou revenir à l’accueil si le problème persiste."
          onRetry={() => window.location.reload()}
        />
      </main>
    );
  }

  if (state === 'denied') {
    return (
      <main className={styles.workspace}>
        <PermissionDenied
          resource="cette zone de travail"
          missingPermission="Le rôle de cette session de démonstration n’inclut pas ce droit."
          contact="Demandez l’accès à l’administrateur de votre espace."
        />
      </main>
    );
  }

  /* ------------------------- module sélectionné --------------------------- */

  const module = activeModuleId ? findModule(activeModuleId) : undefined;

  if (module) {
    const action = resolveModuleAction(module);

    if (action.kind === 'planned') {
      return (
        <main className={styles.workspace}>
          <EmptyState
            icon={module.icon}
            title={`${module.label} — en construction`}
            description={`${module.summary ?? ''} Cet écran sera livré au LOT ${String(action.lot).padStart(2, '0')}. Rien n’est simulé ici : il n’existe encore aucune donnée à afficher.`}
          />
        </main>
      );
    }

    if (action.kind === 'subscribe') {
      return (
        <main className={styles.workspace}>
          <EmptyState
            icon="lock"
            title={`${module.label} — module non activé`}
            description="Ce module n’est pas inclus dans la formule actuelle. Il reste visible ici plutôt que masqué : vous pouvez voir ce qu’il apporte avant de l’activer."
            action={{
              label: 'Voir dans Abonnement → Modules',
              // Action réelle : ouvre le module Abonnement, qui existe au
              // manifeste et annonce lui-même sa construction au LOT 19.
              // Aucun écran n'est fabriqué, aucun bouton n'est mort.
              onClick: () => setActiveModuleId(action.target)
            }}
          />
        </main>
      );
    }

    // Module disponible : l'écran réel, fourni par le lot concerné.
    return <main className={styles.workspace}>{children}</main>;
  }

  /* ------------------------- aucun module : accueil ------------------------ */

  return (
    <main className={styles.workspace}>
      <Title>Interface Marchand</Title>
      <Subtitle>
        La coquille applicative est en place. Les écrans métier arrivent lot par lot —
        le premier est le LOT 05 (Cockpit), puis LOT 06 (Ventes) et LOT 07 (Stocks).
      </Subtitle>
      <Body>
        Choisissez un module dans la navigation : chacun annonce explicitement le lot qui le
        livrera. Aucun écran n’est simulé et aucune donnée n’est inventée — tant qu’un module
        n’est pas construit, il le dit.
      </Body>

      <div style={{ marginTop: 'var(--d-section-gap)' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--ctl-gap-sm)',
            color: 'var(--text-warning)'
          }}
        >
          <Icon name="info" size="var(--ctl-icon-sm)" />
          Session de démonstration — aucun backend, aucune donnée réelle.
        </span>
      </div>

      {/*
        Contenu fourni par la route. Il doit être rendu ici aussi : l'accueil
        est l'état par défaut du shell, et c'est celui qu'utilisent `/app` et
        `/dev/shell`. L'omettre rendrait le contenu des routes invisible.
      */}
      {children}
    </main>
  );
}
