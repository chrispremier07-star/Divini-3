/**
 * DIVINI exo — Fidélité · programme, règles, ledger (LOT 10)
 *
 * Programme (points, niveaux, récompenses, expiration), règles d'attribution
 * (2 modes) et d'exclusion **configurables**, ledger historisé, correction
 * tracée.
 *
 * Honnêteté : données mockées signalées ; presets configurables (jamais codés
 * en dur) ; exclusion des frais de livraison visible ; une annulation produit
 * une correction **tracée**, jamais une disparition silencieuse (interdit §11).
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

import { DataPanel, KpiCard, KpiGrid, ProgressBar } from '../data';
import { Badge, Button, Icon, Select, Switch } from '../ui';
import { FieldGroup } from '../ui/Field';
import { ConfirmDialog } from '../ui/Overlay';
import { useToast } from '../ui/Toast';

import {
  CLIENTS,
  LOYALTY_PRESETS,
  LOYALTY_LEVELS,
  REWARDS,
  POINTS_OPERATIONS,
  EXPIRING_BATCHES,
  ATTRIBUTION_MODE_LABELS,
  POINTS_VALIDITY_DAYS,
  findPreset,
  operationsOf,
  levelFor,
  nextLevel,
  levelProgress,
  loyaltyStats,
  pointsFromAmount,
  formatFcfa,
  type AttributionMode,
  type LoyaltyPreset
} from './mock';

import styles from './loyalty.module.css';

/* ------------------------------- synthèse -------------------------------- */

export function LoyaltyOverview() {
  const stats = loyaltyStats();
  const [presetId, setPresetId] = useState('standard');
  const preset = findPreset(presetId) ?? LOYALTY_PRESETS[0]!;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Fidélité</h1>
          <p className={styles.hint}>Programme de démonstration — points, niveaux, récompenses, expiration.</p>
        </div>
        <Link href="/app/fidelite/regles">
          <Button variant="subtil" size="sm" onClick={() => undefined}>
            <Icon name="sliders" size="var(--ctl-icon-sm)" /> Règles d'attribution
          </Button>
        </Link>
      </div>

      <div className={styles.demoBanner}>
        <Icon name="info" size="var(--ctl-icon-sm)" />
        <span>
          Données de démonstration — aucun point réel attribué. Preset actif :{' '}
          <strong>{preset.label}</strong> (configurable).
        </span>
      </div>

      <KpiGrid>
        <KpiCard label="Membres" value={stats.members} format={(v) => String(v)} period="Clients LOT 08" />
        <KpiCard label="Points en circulation" value={stats.pointsInCirculation} format={(v) => String(v)} period="Solde cumulé" />
        <KpiCard label="Points émis" value={stats.pointsIssued} format={(v) => String(v)} period="Opérations +" />
        <KpiCard label="Points expirés" value={stats.pointsExpired} format={(v) => String(v)} period="Opérations −" />
      </KpiGrid>

      <div className={styles.split}>
        <DataPanel title="Niveaux du programme" subtitle="Seuils de démonstration">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Niveau</th>
                <th className={styles.num}>Points requis</th>
              </tr>
            </thead>
            <tbody>
              {LOYALTY_LEVELS.map((l) => (
                <tr key={l.id}>
                  <td>{l.label}</td>
                  <td className={styles.num}>{l.minPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataPanel>

        <DataPanel title="Récompenses" subtitle="Coût en points">
          {REWARDS.map((r) => (
            <div key={r.id} className={styles.expiryRow}>
              <span className={styles.infoValue}>{r.label}</span>
              <span className={styles.mono}>{r.cost} pts</span>
            </div>
          ))}
        </DataPanel>
      </div>
    </div>
  );
}

/* ---------------------------- règles & exclusions ------------------------ */

export function LoyaltyRulesScreen() {
  const { push } = useToast();
  const [presetId, setPresetId] = useState('standard');
  const [mode, setMode] = useState<AttributionMode>('prorata');
  const [excludeFees, setExcludeFees] = useState(true);
  const preset = findPreset(presetId) ?? LOYALTY_PRESETS[0]!;

  const exampleAmount = 10_000;
  const exampleFee = 1500;
  const examplePoints = pointsFromAmount(exampleAmount, preset, {
    deliveryFee: exampleFee,
    excludeDeliveryFees: excludeFees
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Règles d'attribution</h1>
          <p className={styles.hint}>Presets configurables, modes d'attribution, exclusion des frais de livraison.</p>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Preset</span>
          <span className={styles.hint}>Configurable — jamais codé en dur</span>
        </div>
        {LOYALTY_PRESETS.map((p) => (
          <div key={p.id} className={styles.presetRow} data-active={presetId === p.id}>
            <div>
              <div className={styles.infoValue}>{p.label}</div>
              <div className={styles.hint}>
                {p.signupBonus} pts à l'inscription · 1 pt / {formatFcfa(p.currencyStep)}
              </div>
            </div>
            <Button variant={presetId === p.id ? 'primary' : 'ghost'} size="sm" onClick={() => setPresetId(p.id)}>
              {presetId === p.id ? 'Actif' : 'Choisir'}
            </Button>
          </div>
        ))}
      </div>

      <div className={styles.split}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Mode d'attribution</span>
          </div>
          <FieldGroup label="Mode">
            <Select
              options={Object.entries(ATTRIBUTION_MODE_LABELS).map(([value, label]) => ({ value, label }))}
              value={mode}
              onChange={(v) => setMode(v as AttributionMode)}
            />
          </FieldGroup>
          <p className={styles.hint}>
            {mode === 'prorata'
              ? 'Chaque paiement génère des points au prorata de son montant.'
              : 'Les points sont générés uniquement quand la facture est intégralement payée.'}
          </p>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Exclusion des frais de livraison</span>
          </div>
          <Switch
            checked={excludeFees}
            onChange={setExcludeFees}
            label="Exclure les frais de livraison du calcul des points"
          />
          <p className={styles.hint}>
            {excludeFees
              ? 'Les frais de livraison ne génèrent PAS de points (règle active).'
              : 'Les frais de livraison sont inclus dans le calcul des points.'}
          </p>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Exemple — paiement {formatFcfa(exampleAmount)} (dont {formatFcfa(exampleFee)} de livraison)</span>
            <span className={`${styles.infoValue} ${styles.mono}`}>{examplePoints} pts</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            push({
              tone: 'success',
              title: 'Règles enregistrées (démo)',
              description: `${preset.label} · ${ATTRIBUTION_MODE_LABELS[mode]} · exclusion ${excludeFees ? 'active' : 'inactive'}.`
            })
          }
        >
          Enregistrer les règles
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------- ledger --------------------------------- */

export function PointsLedgerScreen() {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Historique des opérations de points</h1>
          <p className={styles.hint}>
            Toute opération est historisée et consultable — jamais de disparition silencieuse.
          </p>
        </div>
      </div>

      <DataPanel title="Opérations" subtitle="Rattachées aux paiements LOT 06 et clients LOT 08">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Type</th>
              <th>Mode</th>
              <th className={styles.num}>Points</th>
              <th>Motif</th>
            </tr>
          </thead>
          <tbody>
            {POINTS_OPERATIONS.map((o) => {
              const client = CLIENTS.find((c) => c.id === o.clientId);
              return (
                <tr key={o.id}>
                  <td>{new Date(o.date).toLocaleDateString('fr-FR')}</td>
                  <td>{client?.name ?? o.clientId}</td>
                  <td>
                    <Badge
                      tone={o.type === 'gain' ? 'success' : o.type === 'correction' ? 'warning' : o.type === 'expiration' ? 'critical' : 'neutral'}
                      withIcon={false}
                    >
                      {o.type === 'gain' ? 'Gain' : o.type === 'correction' ? 'Correction' : o.type === 'expiration' ? 'Expiration' : 'Échange'}
                    </Badge>
                  </td>
                  <td>{o.mode ? ATTRIBUTION_MODE_LABELS[o.mode] : '—'}</td>
                  <td className={styles.num} style={{ color: o.points >= 0 ? 'var(--text-success)' : 'var(--text-critical)' }}>
                    {o.points >= 0 ? '+' : ''}
                    {o.points}
                  </td>
                  <td>{o.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataPanel>
    </div>
  );
}

/* ------------------------- fiche client (fidélité) ----------------------- */

/** Panneau de fidélité intégrable à la fiche client (LOT 08). */
export function ClientLoyaltyPanel({ clientId }: { clientId: string }) {
  const client = CLIENTS.find((c) => c.id === clientId);
  const { push } = useToast();
  const [confirmCorrection, setConfirmCorrection] = useState(false);

  if (!client) return null;

  const ops = operationsOf(clientId);
  const level = levelFor(client.points);
  const next = nextLevel(client.points);
  const progress = levelProgress(client.points);
  const expiring = EXPIRING_BATCHES.filter((b) => b.clientId === clientId);

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Fidélité</span>
          <span className={styles.hint}>Niveau {level.label}</span>
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Solde de points</span>
            <span className={`${styles.infoValue} ${styles.mono}`}>{client.points}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Prochain niveau</span>
            <span className={styles.infoValue}>{next ? `${next.label} (${next.minPoints} pts)` : 'Niveau maximal'}</span>
          </div>
        </div>
        <ProgressBar value={progress} label={`Progression vers ${next?.label ?? 'niveau maximal'}`} />
      </div>

      {expiring.length > 0 ? (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Points à expiration proche</span>
          </div>
          {expiring.map((b) => (
            <div key={b.expiresAt} className={styles.expiryRow}>
              <span className={styles.mono}>{b.points} pts</span>
              <Badge tone="warning" withIcon={false}>
                expire le {new Date(b.expiresAt).toLocaleDateString('fr-FR')}
              </Badge>
            </div>
          ))}
        </div>
      ) : null}

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Opérations récentes</span>
          <Button variant="ghost" size="sm" onClick={() => setConfirmCorrection(true)}>
            Corriger
          </Button>
        </div>
        {ops.length === 0 ? (
          <p className={styles.hint}>Aucune opération de points.</p>
        ) : (
          ops.map((o) => (
            <div key={o.id} className={styles.expiryRow}>
              <div>
                <div className={styles.infoValue}>{o.reason}</div>
                <div className={styles.hint}>
                  {new Date(o.date).toLocaleDateString('fr-FR')}
                  {o.mode ? ` · ${ATTRIBUTION_MODE_LABELS[o.mode]}` : ''}
                </div>
              </div>
              <span className={styles.mono} style={{ color: o.points >= 0 ? 'var(--text-success)' : 'var(--text-critical)' }}>
                {o.points >= 0 ? '+' : ''}
                {o.points}
              </span>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={confirmCorrection}
        onCancel={() => setConfirmCorrection(false)}
        title="Corriger les points ?"
        description="Une correction crée une opération tracée dans l'historique — les points ne disparaissent jamais silencieusement. Action de démonstration."
        confirmLabel="Créer la correction"
        onConfirm={() => {
          setConfirmCorrection(false);
          push({ tone: 'success', title: 'Correction tracée (démo)', description: 'Opération ajoutée à l’historique.' });
        }}
      />
    </div>
  );
}
