/**
 * DIVINI exo — Finance · comptabilité (LOT 09)
 *
 * Revenus, dépenses, catégories, périodes (ouverture / clôture), rapports
 * (résultat, grands postes), créances âgées. Une période clôturée est
 * **verrouillée à l'écran** avec explication — jamais modifiable, même
 * visuellement (interdit §11).
 *
 * Honnêteté : données mockées signalées ; aucune écriture comptable réelle,
 * aucune clôture effective (phase backend).
 */

'use client';

import { Badge, Button, Icon } from '../ui';
import { DataPanel, KpiCard, KpiGrid } from '../data';
import { useToast } from '../ui/Toast';

import {
  LEDGER_LINES,
  PERIODS,
  AGING_RECEIVABLES,
  netResult,
  isPeriodLocked,
  findPeriod,
  formatFcfa
} from './mock';

import styles from './finance.module.css';

function DemoBanner() {
  return (
    <div className={styles.demoBanner}>
      <Icon name="info" size="var(--ctl-icon-sm)" />
      <span>
        Données de démonstration — aucune écriture comptable réelle, aucune clôture
        effective (phase backend).
      </span>
    </div>
  );
}

/** Grands postes du mois courant. */
function LedgerSummary() {
  const revenus = LEDGER_LINES.filter((l) => l.kind === 'revenu');
  const depenses = LEDGER_LINES.filter((l) => l.kind === 'depense');

  return (
    <DataPanel title="Grands postes — août 2026" subtitle="Période ouverte">
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Poste</th>
            <th>Type</th>
            <th className={styles.num}>Montant</th>
          </tr>
        </thead>
        <tbody>
          {LEDGER_LINES.map((l) => (
            <tr key={l.label}>
              <td>{l.label}</td>
              <td>{l.kind === 'revenu' ? 'Revenu' : 'Dépense'}</td>
              <td className={styles.num} style={{ color: l.kind === 'revenu' ? 'var(--text-success)' : 'var(--text-critical)' }}>
                {l.kind === 'revenu' ? '+' : '−'}
                {formatFcfa(l.amount)}
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={2}>
              <strong>Résultat net</strong>
            </td>
            <td className={styles.num}>
              <strong>{formatFcfa(netResult())}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <p className={styles.hint}>
        Revenus {formatFcfa(revenus.reduce((s, l) => s + l.amount, 0))} · Dépenses{' '}
        {formatFcfa(depenses.reduce((s, l) => s + l.amount, 0))}
      </p>
    </DataPanel>
  );
}

/** Liste des périodes ; clôturée = verrouillée. */
function PeriodList() {
  const { push } = useToast();

  return (
    <DataPanel title="Périodes comptables" subtitle="Ouverture et clôture">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        {PERIODS.map((p) => {
          const locked = isPeriodLocked(p);
          return (
            <div key={p.id} className={styles.periodRow} data-locked={locked}>
              <div>
                <div className={styles.infoValue}>{p.label}</div>
                <div className={styles.hint}>
                  {new Date(p.start).toLocaleDateString('fr-FR')} → {new Date(p.end).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                {locked ? (
                  <Badge tone="neutral" withIcon={false}>
                    <Icon name="lock" size="var(--ctl-icon-sm)" /> Clôturée
                  </Badge>
                ) : (
                  <Badge tone="success" withIcon={false}>
                    Ouverte
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={locked}
                  onClick={() =>
                    push({
                      tone: 'info',
                      title: 'Clôture de période (démo)',
                      description: 'Aucune clôture effective — phase backend.'
                    })
                  }
                >
                  Clôturer
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <p className={styles.hint}>
        Une période clôturée est verrouillée : ses valeurs ne sont plus modifiables, même
        visuellement.
      </p>
    </DataPanel>
  );
}

export function ComptabiliteScreen() {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Comptabilité</h1>
          <p className={styles.hint}>Revenus, dépenses, périodes, rapports, créances âgées.</p>
        </div>
      </div>

      <DemoBanner />

      <KpiGrid>
        <KpiCard label="Revenus du mois" value={LEDGER_LINES.filter((l) => l.kind === 'revenu').reduce((s, l) => s + l.amount, 0)} format={formatFcfa} period="Août 2026" />
        <KpiCard label="Dépenses du mois" value={LEDGER_LINES.filter((l) => l.kind === 'depense').reduce((s, l) => s + l.amount, 0)} format={formatFcfa} period="Août 2026" />
        <KpiCard label="Résultat net" value={netResult()} format={formatFcfa} period="Août 2026" note="Estimation de démonstration" />
      </KpiGrid>

      <div className={styles.split}>
        <LedgerSummary />
        <PeriodList />
      </div>

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
    </div>
  );
}

/** Détail d'une période (verrouillée si clôturée). */
export function PeriodDetail({ id }: { id: string }) {
  const period = findPeriod(id);

  if (!period) {
    return (
      <div className={styles.wrap}>
        <p className={styles.hint}>Période introuvable dans les données de démonstration.</p>
      </div>
    );
  }

  const locked = isPeriodLocked(period);

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>{period.label}</h1>
          <p className={styles.hint}>
            {new Date(period.start).toLocaleDateString('fr-FR')} → {new Date(period.end).toLocaleDateString('fr-FR')}
          </p>
        </div>
        {locked ? (
          <Badge tone="neutral" withIcon={false}>
            <Icon name="lock" size="var(--ctl-icon-sm)" /> Clôturée — verrouillée
          </Badge>
        ) : (
          <Badge tone="success" withIcon={false}>Ouverte</Badge>
        )}
      </div>

      {locked ? (
        <div className={styles.answer}>
          <Icon name="lock" size="var(--ctl-icon-md)" />
          <span className={styles.answerText}>
            Cette période est clôturée. Ses valeurs comptables sont figées et ne peuvent
            plus être modifiées — y compris par un changement de taux de change.
          </span>
        </div>
      ) : null}

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Grand livre</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Poste</th>
              <th className={styles.num}>Montant</th>
            </tr>
          </thead>
          <tbody>
            {LEDGER_LINES.map((l) => (
              <tr key={l.label}>
                <td>{l.label}</td>
                <td className={styles.num}>{formatFcfa(l.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
