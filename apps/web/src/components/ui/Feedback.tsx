/**
 * DIVINI exo — Primitives de retour d'état
 *
 * Corpus l. 3204-3219 (états vides), l. 3221-3235 (erreurs), l. 7964-7984 (états obligatoires).
 *
 * Règles appliquées ici :
 *   - une erreur est compréhensible, contextualisée, non technique et exploitable ;
 *     jamais de stack trace à l'utilisateur, les détails restent dans les logs ;
 *   - un EmptyState donne toujours un chemin : titre + explication + action ;
 *   - `offline`, `syncing`, `permission-denied` et `critical` ne sont jamais joués
 *     en démonstration : sans branchement réel, ils s'affichent comme non disponibles ;
 *   - un bouton « Réessayer » n'est rendu que si un rappel réel est fourni.
 *     Sans rappel, la primitive explique au lieu de proposer une action morte.
 */

import type { ReactNode } from 'react';

import { Icon, type IconName } from './Icon';

import styles from './ui.module.css';

type Tone = 'info' | 'success' | 'warning' | 'critical';

/* --------------------------------- Alert ---------------------------------- */

const ALERT_ICON: Record<Tone, IconName> = {
  info: 'info',
  success: 'checkCircle',
  warning: 'alertTriangle',
  critical: 'alertCircle'
};

type AlertProps = {
  tone: Tone;
  title: string;
  children?: ReactNode;
  /** Action réelle. Sans action, aucun bouton n'est rendu — pas de bouton mort. */
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
};

export function Alert({ tone, title, children, action, onDismiss }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[`alert${tone}`]}`} role={tone === 'critical' ? 'alert' : 'status'}>
      <Icon name={ALERT_ICON[tone]} size="var(--ctl-icon-md)" className={styles.alertIcon} />
      <div className={styles.alertBody}>
        <p className={styles.alertTitle}>{title}</p>
        {children ? <p className={styles.alertText}>{children}</p> : null}
      </div>
      <div className={styles.alertActions}>
        {action ? (
          <button type="button" className={styles.alertAction} onClick={action.onClick}>
            {action.label}
          </button>
        ) : null}
        {onDismiss ? (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onDismiss}
            aria-label="Fermer le message"
          >
            <Icon name="close" size="var(--ctl-icon-sm)" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------- Skeleton -------------------------------- */

/**
 * Squelette de chargement.
 *
 * Pulsation d'opacité, pas de balayage lumineux : le corpus interdit
 * l'animation décorative constante (l. 8002-8010). Une pulsation lente suffit
 * à indiquer l'attente sans capter l'attention.
 */
export function Skeleton({
  width = '100%',
  height = 'var(--sp-4)',
  radius = 'var(--r-xs)'
}: {
  width?: string;
  height?: string;
  radius?: string;
}) {
  return (
    <span
      className={styles.skeleton}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

/** Bloc de squelette prêt à l'emploi pour une carte de contenu. */
export function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div className={styles.skeletonBlock} role="status" aria-label="Chargement en cours">
      <Skeleton width="38%" height="var(--sp-5)" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '62%' : '100%'} />
      ))}
      <span className={styles.srOnly}>Chargement en cours</span>
    </div>
  );
}

/* ------------------------------ EmptyState -------------------------------- */

/**
 * État vide — modèle canonique du corpus (l. 3204-3219) :
 *   titre court → explication qui dit quoi faire → action réelle.
 *
 * Exemple canonique : « Aucun prospect. » → « Commencez par ajouter votre premier
 * prospect pour suivre vos opportunités commerciales. » → `Ajouter un prospect`.
 */
type EmptyStateProps = {
  title: string;
  description: string;
  icon?: IconName;
  action?: { label: string; onClick: () => void };
};

export function EmptyState({ title, description, icon = 'package', action }: EmptyStateProps) {
  return (
    <div className={styles.stateBlock}>
      <span className={styles.stateIcon} aria-hidden="true">
        <Icon name={icon} size="var(--ctl-icon-lg)" />
      </span>
      <p className={styles.stateTitle}>{title}</p>
      <p className={styles.stateDescription}>{description}</p>
      {action ? (
        <button type="button" className={styles.stateAction} onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------ ErrorState -------------------------------- */

type ErrorStateProps = {
  title: string;
  /** Message exploitable. Jamais de détail technique : il reste dans les logs. */
  description: string;
  /**
   * Rappel réel de nouvelle tentative. Sans rappel, aucun bouton n'est rendu :
   * on explique au lieu d'afficher une action qui ne ferait rien.
   */
  onRetry?: () => void;
  /** Référence de suivi affichée en mono — permet de retrouver l'entrée de log. */
  reference?: string;
};

export function ErrorState({ title, description, onRetry, reference }: ErrorStateProps) {
  return (
    <div className={`${styles.stateBlock} ${styles.stateBlockError}`}>
      <span className={`${styles.stateIcon} ${styles.stateIconError}`} aria-hidden="true">
        <Icon name="alertCircle" size="var(--ctl-icon-lg)" />
      </span>
      <p className={styles.stateTitle}>{title}</p>
      <p className={styles.stateDescription}>{description}</p>
      {reference ? (
        <p className={styles.stateReference}>
          Référence <span className={styles.monoValue}>{reference}</span>
        </p>
      ) : null}
      {onRetry ? (
        <button type="button" className={styles.stateAction} onClick={onRetry}>
          Réessayer
        </button>
      ) : null}
    </div>
  );
}

/* --------------------------- PermissionDenied ----------------------------- */

/**
 * Droit insuffisant.
 *
 * Explique ce qui manque et vers qui se tourner. Ne simule aucune permission :
 * l'état décrit une absence de droit constatée, jamais un droit inventé.
 */
type PermissionDeniedProps = {
  /** Ce qui est refusé, en langage utilisateur. */
  resource: string;
  /** Le droit manquant, nommé explicitement. */
  missingPermission: string;
  /** Vers qui se tourner. */
  contact: string;
};

export function PermissionDenied({ resource, missingPermission, contact }: PermissionDeniedProps) {
  return (
    <div className={styles.stateBlock}>
      <span className={styles.stateIcon} aria-hidden="true">
        <Icon name="lock" size="var(--ctl-icon-lg)" />
      </span>
      <p className={styles.stateTitle}>Accès refusé à {resource}</p>
      <p className={styles.stateDescription}>
        Votre compte ne dispose pas du droit <span className={styles.monoValue}>{missingPermission}</span>.
      </p>
      <p className={styles.stateHint}>Contactez {contact} pour obtenir ce droit.</p>
    </div>
  );
}

/* ----------------------------- OfflineState ------------------------------- */

/**
 * Hors ligne.
 *
 * Cet état ne peut pas être simulé : il décrit une connectivité réellement
 * perdue. En galerie, il est rendu en démonstration statique et signalé comme tel.
 */
export function OfflineState({
  lastSyncLabel,
  onRetry,
  demonstration = false
}: {
  lastSyncLabel?: string;
  onRetry?: () => void;
  /** Marque explicitement que l'état est affiché à des fins de démonstration. */
  demonstration?: boolean;
}) {
  return (
    <div className={styles.stateBlock}>
      <span className={styles.stateIcon} aria-hidden="true">
        <Icon name="wifiOff" size="var(--ctl-icon-lg)" />
      </span>
      <p className={styles.stateTitle}>Connexion interrompue</p>
      <p className={styles.stateDescription}>
        Les données affichées sont celles de la dernière synchronisation.
        {lastSyncLabel ? ` Dernière synchronisation : ${lastSyncLabel}.` : ''}
      </p>
      {demonstration ? <p className={styles.stateDemoFlag}>État affiché en démonstration</p> : null}
      {onRetry ? (
        <button type="button" className={styles.stateAction} onClick={onRetry}>
          <Icon name="refresh" size="var(--ctl-icon-sm)" />
          Rechercher la connexion
        </button>
      ) : null}
    </div>
  );
}

/* ----------------------------- SyncingState ------------------------------- */

/**
 * Synchronisation en cours.
 *
 * Même règle que OfflineState : l'état décrit une opération réelle. En galerie,
 * il est signalé comme démonstration.
 */
export function SyncingState({
  label = 'Synchronisation en cours',
  demonstration = false
}: {
  label?: string;
  demonstration?: boolean;
}) {
  return (
    <div className={styles.syncing} role="status">
      <Icon name="refresh" size="var(--ctl-icon-sm)" className={styles.syncingIcon} />
      <span>{label}</span>
      {demonstration ? <span className={styles.stateDemoFlag}>démonstration</span> : null}
    </div>
  );
}

/* --------------------------- ModuleUnavailable ---------------------------- */

/**
 * Module non activé (corpus l. 451).
 *
 * Le module existe dans le produit mais n'est pas actif pour ce compte.
 * On l'affiche comme non disponible — jamais comme un bouton mort.
 */
export function ModuleUnavailable({
  module,
  reason,
  onLearnMore
}: {
  module: string;
  reason: string;
  onLearnMore?: () => void;
}) {
  return (
    <div className={styles.stateBlock}>
      <span className={styles.stateIcon} aria-hidden="true">
        <Icon name="package" size="var(--ctl-icon-lg)" />
      </span>
      <p className={styles.stateTitle}>{module} — non disponible</p>
      <p className={styles.stateDescription}>{reason}</p>
      {onLearnMore ? (
        <button type="button" className={styles.stateAction} onClick={onLearnMore}>
          Voir les conditions d'activation
        </button>
      ) : null}
    </div>
  );
}
