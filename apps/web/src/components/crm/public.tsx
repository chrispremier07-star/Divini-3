/**
 * DIVINI exo — CRM · page publique de préférences (LOT 08)
 *
 * `/c/{token}` : préférences de communication du client, accessible par lien.
 * N'expose AUCUNE donnée privée (interdit §11) : uniquement les choix par
 * catégorie. Token valide / expiré / révoqué gérés explicitement.
 *
 * Aucun jargon, choix simples et réversibles. Aucune chrome produit.
 */

'use client';

import { useState } from 'react';

import { Button, Icon } from '../ui';
import { Switch } from '../ui/Field';

import {
  resolveToken,
  consentsOf,
  CONSENT_CATEGORY_LABELS,
  isGranted,
  type ConsentCategory
} from './mock';

import styles from './crm.module.css';

const CATEGORIES = Object.keys(CONSENT_CATEGORY_LABELS) as ConsentCategory[];

function Toggle({ label, initial }: { label: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <div className={styles.prefRow}>
      <div>
        <div className={styles.prefLabel}>{label}</div>
        <div className={styles.prefHint}>
          {on ? 'Vous acceptez de recevoir nos messages.' : 'Vous ne recevrez rien sur ce canal.'}
        </div>
      </div>
      <Switch checked={on} onChange={setOn} label={label} />
    </div>
  );
}

export function PublicPreferencePage({ token }: { token: string }) {
  const resolved = resolveToken(token);
  const [saved, setSaved] = useState(false);

  // Token inconnu, expiré ou révoqué : aucun accès aux préférences.
  if (!resolved || resolved.status !== 'valid') {
    const reason =
      resolved?.status === 'expired'
        ? 'Ce lien a expiré.'
        : resolved?.status === 'revoked'
          ? 'Ce lien a été révoqué.'
          : 'Ce lien est invalide.';
    return (
      <div className={styles.publicPage}>
        <div className={styles.publicCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--text-critical)' }}>
            <Icon name="alertCircle" size="var(--ctl-icon-md)" />
            <h1 className={styles.publicTitle}>Lien indisponible</h1>
          </div>
          <p className={styles.publicText}>
            {reason} Aucune donnée n'est affichée. Demandez un nouveau lien si besoin.
          </p>
        </div>
      </div>
    );
  }

  const consents = consentsOf(resolved.clientId);

  return (
    <div className={styles.publicPage}>
      <div className={styles.publicCard}>
        <div>
          <h1 className={styles.publicTitle}>Vos préférences de communication</h1>
          <p className={styles.publicText}>
            Choisissez les canaux par lesquels vous acceptez d'être contacté. Vos choix sont
            réversibles à tout moment. Aucune autre information vous concernant n'est affichée.
          </p>
        </div>

        {CATEGORIES.map((cat) => {
          const consent = consents.find((c) => c.category === cat);
          return (
            <Toggle
              key={cat}
              label={CONSENT_CATEGORY_LABELS[cat]}
              initial={isGranted(consent)}
            />
          );
        })}

        <div className={styles.actions}>
          <Button variant="primary" size="sm" onClick={() => setSaved(true)}>
            Enregistrer mes préférences
          </Button>
        </div>

        {saved ? (
          <p className={styles.publicText} role="status">
            Vos préférences ont été enregistrées (démonstration).
          </p>
        ) : null}

        <p className={styles.prefHint}>
          Page de démonstration — aucun consentement réel n'est collecté ni stocké.
        </p>
      </div>
    </div>
  );
}
