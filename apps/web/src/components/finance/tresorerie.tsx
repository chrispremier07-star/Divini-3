/**
 * DIVINI exo — Finance · trésorerie (LOT 09)
 *
 * Soldes par compte/caisse, flux (entrées / sorties), échéances à venir,
 * créances, dettes. Montants en IBM Plex Mono, devise explicite (FCFA).
 *
 * Honnêteté : données mockées signalées ; encaissements cohérents avec les
 * paiements LOT 06 ; export en état « à venir » explicite.
 */

'use client';

import Link from 'next/link';

import { KpiCard, KpiGrid, DataPanel } from '../data';
import { Badge, Button, Icon } from '../ui';

import {
  ACCOUNTS,
  CASH_FLOWS,
  DUES,
  AGING_RECEIVABLES,
  accountBalance,
  totalCash,
  signedAmount,
  formatFcfa
} from './mock';

import styles from './finance.module.css';

function DemoBanner() {
  return (
    <div className={styles.demoBanner}>
      <Icon name="info" size="var(--ctl-icon-sm)" />
      <span>
        Données de démonstration — soldes et flux mockés, cohérents avec les paiements du
        LOT 06. Aucun mouvement bancaire réel.
      </span>
    </div>
  );
}

/** Cartes de soldes par compte. */
function CashBalanceCards() {
  return (
    <KpiGrid>
      {ACCOUNTS.map((acc) => (
        <KpiCard
          key={acc.id}
          label={acc.label}
          value={accountBalance(acc.id)}
          format={formatFcfa}
          period="Solde actuel"
          note={`Initial ${formatFcfa(acc.openingBalance)}`}
        />
      ))}
      <KpiCard
        label="Trésorerie totale"
        value={totalCash()}
        format={formatFcfa}
        period="Tous comptes"
        note="Somme des soldes"
      />
    </KpiGrid>
  );
}

/** Table des flux (entrées / sorties). */
function CashFlowTable() {
  const flows = [...CASH_FLOWS].filter((f) => !f.projected).sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <DataPanel title="Flux de trésorerie" subtitle="Entrées et sorties réelles">
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Libellé</th>
            <th>Catégorie</th>
            <th className={styles.num}>Montant</th>
          </tr>
        </thead>
        <tbody>
          {flows.map((f) => (
            <tr key={f.id}>
              <td>{new Date(f.date).toLocaleDateString('fr-FR')}</td>
              <td>
                {f.label}
                {f.ref ? <span className={styles.hint}> · {f.ref}</span> : null}
              </td>
              <td>{f.category}</td>
              <td className={styles.num} style={{ color: f.direction === 'in' ? 'var(--text-success)' : 'var(--text-critical)' }}>
                {f.direction === 'in' ? '+' : '−'}
                {formatFcfa(f.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataPanel>
  );
}

/** Échéances à venir (créances / dettes). */
function UpcomingDuePanel() {
  const creances = DUES.filter((d) => d.kind === 'creance');
  const dettes = DUES.filter((d) => d.kind === 'dette');

  return (
    <DataPanel title="Échéances à venir" subtitle="Créances et dettes">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        {DUES.map((d) => (
          <div key={d.id} className={styles.periodRow}>
            <div>
              <div className={styles.infoValue}>{d.label}</div>
              <div className={styles.hint}>
                {d.kind === 'creance' ? 'Créance' : 'Dette'} · échéance{' '}
                {new Date(d.dueDate).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <span className={styles.amount} style={{ color: d.kind === 'creance' ? 'var(--text-success)' : 'var(--text-critical)' }}>
              {d.kind === 'creance' ? '+' : '−'}
              {formatFcfa(d.amount)}
            </span>
          </div>
        ))}
      </div>
      <p className={styles.hint}>
        Créances : {formatFcfa(creances.reduce((s, d) => s + d.amount, 0))} · Dettes :{' '}
        {formatFcfa(dettes.reduce((s, d) => s + d.amount, 0))}
      </p>
    </DataPanel>
  );
}

/** Créances âgées. */
function AgingPanel() {
  return (
    <DataPanel title="Créances âgées" subtitle="Par ancienneté">
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tranche</th>
            <th className={styles.num}>Montant</th>
          </tr>
        </thead>
        <tbody>
          {AGING_RECEIVABLES.map((b) => (
            <tr key={b.label}>
              <td>{b.label}</td>
              <td className={styles.num}>{formatFcfa(b.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataPanel>
  );
}

export function TresorerieScreen() {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Trésorerie</h1>
          <p className={styles.hint}>Soldes, flux, échéances, créances et dettes.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/app/tresorerie/cash-vision">
            <Button variant="primary" size="sm" onClick={() => undefined}>
              <Icon name="trendingUp" size="var(--ctl-icon-sm)" /> CASH VISION
            </Button>
          </Link>
          <Button variant="subtil" size="sm" onClick={() => undefined} disabled>
            Export (à venir)
          </Button>
        </div>
      </div>

      <DemoBanner />
      <CashBalanceCards />
      <div className={styles.split}>
        <CashFlowTable />
        <UpcomingDuePanel />
      </div>
      <AgingPanel />
    </div>
  );
}
