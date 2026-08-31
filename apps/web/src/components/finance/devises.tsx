/**
 * DIVINI exo — Finance · devises (LOT 09)
 *
 * Conversion, distinction devise de transaction / du tenant / d'affichage,
 * taux utilisé avec **date** et **source** toujours affichées (interdit §11 :
 * aucun taux sans date ni source). Une conversion n'est jamais présentée comme
 * une valeur comptable historique : un changement de taux ne rétro-modifie pas
 * une valeur passée (l. 532).
 *
 * Honnêteté : taux de démonstration, aucune conversion adossée à un service
 * externe.
 */

'use client';

import { useState } from 'react';

import { Badge, Button, Icon, Input, Select } from '../ui';
import { FieldGroup } from '../ui/Field';

import {
  EXCHANGE_RATES,
  CURRENCY_ROLES,
  findRate,
  convert,
  isRateStale,
  formatFcfa,
  type ExchangeRate
} from './mock';

import styles from './finance.module.css';

/** Mention de date + source d'un taux — toujours visible. */
function RateSourceNote({ rate }: { rate: ExchangeRate | undefined }) {
  if (!rate) {
    return (
      <p className={styles.rateNote} style={{ color: 'var(--text-critical)' }}>
        <Icon name="alertCircle" size="var(--ctl-icon-sm)" /> Taux indisponible pour ce couple de
        devises — conversion impossible.
      </p>
    );
  }
  const stale = isRateStale(rate);
  return (
    <p className={styles.rateNote}>
      <Icon name="info" size="var(--ctl-icon-sm)" /> Taux {rate.rate} · date{' '}
      {new Date(rate.date).toLocaleDateString('fr-FR')} · source : {rate.source}
      {stale ? (
        <span style={{ color: 'var(--text-warning)' }}>
          {' '}
          · taux ancien (&gt; 7 j) — à vérifier
        </span>
      ) : null}
    </p>
  );
}

export function CurrencyScreen() {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('EUR');
  const [to, setTo] = useState('XOF');

  const rate = findRate(from, to);
  const result = convert(Number(amount) || 0, rate);

  const currencyOptions = ['EUR', 'USD', 'XOF'].map((c) => ({ value: c, label: c }));

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Devises</h1>
          <p className={styles.hint}>
            Conversion de démonstration — taux avec date et source, aucun service externe.
          </p>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Rôles de devise</span>
        </div>
        <div className={styles.infoGrid}>
          {Object.entries(CURRENCY_ROLES).map(([role, info]) => (
            <div key={role} className={styles.infoItem}>
              <span className={styles.infoLabel}>{info.label}</span>
              <span className={`${styles.infoValue} ${styles.mono}`}>{info.code}</span>
            </div>
          ))}
        </div>
        <p className={styles.hint}>
          La devise de transaction (celle d'une opération), la devise du tenant (celle de
          l'entreprise) et la devise d'affichage sont distinctes et jamais confondues.
        </p>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Convertisseur</span>
        </div>
        <div className={styles.converterGrid}>
          <FieldGroup label="Montant">
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </FieldGroup>
          <div className={styles.infoGrid}>
            <FieldGroup label="De">
              <Select options={currencyOptions} value={from} onChange={setFrom} />
            </FieldGroup>
            <FieldGroup label="Vers">
              <Select options={currencyOptions} value={to} onChange={setTo} />
            </FieldGroup>
          </div>
        </div>

        <RateSourceNote rate={rate} />

        {result !== null ? (
          <div className={styles.answer}>
            <Icon name="refresh" size="var(--ctl-icon-md)" />
            <span className={styles.answerText}>
              {amount} {from} ≈ <strong>{formatFcfa(result)}</strong> {to}
            </span>
          </div>
        ) : null}

        <p className={styles.hint}>
          Conversion de démonstration — jamais une valeur comptable historique. Un
          changement de taux ne rétro-modifie pas les valeurs passées.
        </p>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Taux de démonstration</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Couple</th>
              <th className={styles.num}>Taux</th>
              <th>Date</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {EXCHANGE_RATES.map((r) => (
              <tr key={`${r.from}-${r.to}`}>
                <td>
                  {r.from} → {r.to}
                </td>
                <td className={styles.num}>{r.rate}</td>
                <td>{new Date(r.date).toLocaleDateString('fr-FR')}</td>
                <td>
                  {r.source}
                  {isRateStale(r) ? <Badge tone="warning" withIcon={false}>ancien</Badge> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
