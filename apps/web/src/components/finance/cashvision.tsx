/**
 * DIVINI exo — Finance · CASH VISION (LOT 09)
 *
 * Signature produit : « sachez où est votre argent ». Ouvre sur la RÉPONSE
 * (« trésorerie suffisante jusqu'au… » / « bascule négative prévue le… »), puis
 * sur la courbe : passé plein, futur pointillé, frontière présent/futur
 * explicite, bascule négative marquée (CRITIQUE + libellé), marqueur temporel.
 *
 * Honnêteté : projection calculée localement, présentée comme **projection de
 * démonstration** — jamais une prévision garantie ni un résultat (interdit §11).
 * Aucune animation en boucle sur le graphique financier.
 */

'use client';

import { useMemo, useState } from 'react';

import { Badge, Button, Icon } from '../ui';

import {
  CASH_FLOWS,
  ACCOUNTS,
  FINANCE_TODAY,
  signedAmount,
  buildProjection,
  negativeCrossoverDate,
  projectedMinimum,
  totalCash,
  formatFcfa,
  type CashFlow
} from './mock';

import styles from './finance.module.css';

/* ------------------------------ série complète --------------------------- */

type Point = { t: number; balance: number; projected: boolean };

const OPENING_TOTAL = ACCOUNTS.reduce((s, a) => s + a.openingBalance, 0);

/** Construit la série passé (réel) + futur (projeté) pour le tracé. */
function buildSeries(shifts: Record<string, number> = {}): Point[] {
  const past = CASH_FLOWS.filter((f) => !f.projected).sort((a, b) => (a.date < b.date ? -1 : 1));
  const points: Point[] = [];
  let running = OPENING_TOTAL;
  // Point d'ouverture.
  points.push({ t: Date.parse(past[0]?.date ?? FINANCE_TODAY), balance: running, projected: false });
  for (const f of past) {
    running += signedAmount(f);
    points.push({ t: Date.parse(f.date), balance: running, projected: false });
  }
  // Frontière présent.
  const nowBalance = totalCash();
  points.push({ t: Date.parse(FINANCE_TODAY), balance: nowBalance, projected: false });
  // Futur projeté (avec décalages de scénario éventuels).
  let projectedRunning = nowBalance;
  const future = CASH_FLOWS.filter((f) => f.projected)
    .map((f) => ({ ...f, date: shiftDate(f.date, shifts[f.id] ?? 0) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  for (const f of future) {
    projectedRunning += signedAmount(f);
    points.push({ t: Date.parse(f.date), balance: projectedRunning, projected: true });
  }
  return points;
}

function shiftDate(iso: string, days: number): string {
  if (days === 0) return iso;
  return new Date(Date.parse(iso) + days * 86_400_000).toISOString();
}

/* --------------------------------- chart --------------------------------- */

const W = 800;
const H = 300;
const PAD = { top: 20, right: 24, bottom: 32, left: 64 };

function CashVisionChart({ points }: { points: Point[] }) {
  const ts = points.map((p) => p.t);
  const balances = points.map((p) => p.balance);
  const minT = Math.min(...ts);
  const maxT = Math.max(...ts);
  const minB = Math.min(0, ...balances);
  const maxB = Math.max(...balances);
  const spanB = maxB - minB || 1;

  const x = (t: number) => PAD.left + ((t - minT) / (maxT - minT || 1)) * (W - PAD.left - PAD.right);
  const y = (b: number) => PAD.top + (1 - (b - minB) / spanB) * (H - PAD.top - PAD.bottom);

  const pastPts = points.filter((p) => !p.projected);
  const futurePts = points.filter((p) => p.projected);
  const boundary = points.find((p) => p.t === Date.parse(FINANCE_TODAY)) ?? pastPts[pastPts.length - 1];

  const line = (pts: Point[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.balance).toFixed(1)}`).join(' ');
  // La projection démarre à la frontière pour être continue.
  const futurePath = boundary && futurePts.length > 0 ? line([boundary, ...futurePts]) : '';

  const crossover = futurePts.find((p) => p.balance < 0);
  const nowX = boundary ? x(boundary.t) : 0;
  const zeroY = y(0);

  return (
    <div className={styles.chartBox}>
      <svg className={styles.chartSvg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Courbe de trésorerie : passé réel et projection">
        {/* Ligne zéro */}
        {minB < 0 ? (
          <line x1={PAD.left} y1={zeroY} x2={W - PAD.right} y2={zeroY} stroke="var(--border-default)" strokeWidth={1} />
        ) : null}

        {/* Frontière présent / futur */}
        <line x1={nowX} y1={PAD.top} x2={nowX} y2={H - PAD.bottom} stroke="var(--border-default)" strokeWidth={1} strokeDasharray="3 3" />
        <text x={nowX + 4} y={PAD.top + 10} fill="var(--text-secondary)" fontSize="11">
          aujourd'hui
        </text>

        {/* Passé — trait plein */}
        <path d={line(pastPts)} fill="none" stroke="var(--text-primary)" strokeWidth={2} />

        {/* Futur — pointillé */}
        {futurePath ? <path d={futurePath} fill="none" stroke="var(--accent)" strokeWidth={2} strokeDasharray="5 4" /> : null}

        {/* Bascule négative — marqueur + libellé */}
        {crossover ? (
          <g>
            <circle cx={x(crossover.t)} cy={y(crossover.balance)} r={5} fill="var(--state-critical)" />
            <text x={x(crossover.t)} y={y(crossover.balance) - 10} fill="var(--text-critical)" fontSize="11" textAnchor="middle">
              bascule négative
            </text>
          </g>
        ) : null}

        {/* Marqueur temporel (pulse unique via CSS) */}
        <circle className={styles.timeMarker} cx={nowX} cy={boundary ? y(boundary.balance) : 0} r={4} fill="var(--accent)" />
      </svg>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} /> Passé (réel)
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} data-dashed="true" /> Projection (démonstration)
        </span>
        {crossover ? (
          <span className={styles.legendItem} style={{ color: 'var(--text-critical)' }}>
            ● Bascule négative
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------- scénarios ------------------------------- */

type ScenarioDef = { id: string; label: string; shifts: Record<string, number> };

const SCENARIOS: ScenarioDef[] = [
  { id: 'base', label: 'Situation actuelle', shifts: {} },
  { id: 'encaisser-tot', label: 'Encaisser FAC-2026-0002 plus tôt (−7 j)', shifts: { 'fl-101': -7 } },
  { id: 'reporter-depense', label: 'Reporter la dépense stock (+10 j)', shifts: { 'fl-102': 10 } }
];

function ScenarioComparator() {
  const [active, setActive] = useState('base');
  const scenario = SCENARIOS.find((s) => s.id === active) ?? SCENARIOS[0]!;
  const points = useMemo(() => buildSeries(scenario.shifts), [scenario]);
  const min = points.reduce((m, p) => (p.balance < m.balance ? p : m), points[0]!);
  const crossover = points.find((p) => p.projected && p.balance < 0);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Scénarios comparés</span>
        <Badge tone="neutral" withIcon={false}>estimation</Badge>
      </div>
      <div className={styles.actions}>
        {SCENARIOS.map((s) => (
          <Button key={s.id} variant={active === s.id ? 'primary' : 'ghost'} size="sm" onClick={() => setActive(s.id)}>
            {s.label}
          </Button>
        ))}
      </div>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Solde projeté minimum</span>
          <span className={`${styles.infoValue} ${styles.mono}`}>{formatFcfa(min.balance)}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Bascule négative</span>
          <span className={styles.infoValue}>
            {crossover ? new Date(crossover.t).toLocaleDateString('fr-FR') : 'aucune sur la période'}
          </span>
        </div>
      </div>
      <p className={styles.hint}>
        Comparaison présentée comme une estimation de démonstration — aucune prévision
        garantie, aucune écriture réelle.
      </p>
    </div>
  );
}

/* -------------------------------- écran ---------------------------------- */

export function CashVisionScreen() {
  const points = useMemo(() => buildSeries(), []);
  const crossover = negativeCrossoverDate();
  const min = projectedMinimum();

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>CASH VISION</h1>
          <p className={styles.hint}>Passé réel, projection de démonstration, bascule négative.</p>
        </div>
      </div>

      {/* La réponse d'abord, la courbe ensuite. */}
      <div className={styles.answer} data-negative={crossover ? 'true' : 'false'}>
        <Icon name={crossover ? 'alertTriangle' : 'checkCircle'} size="var(--ctl-icon-md)" />
        <span className={styles.answerText}>
          {crossover ? (
            <>
              Bascule négative prévue le{' '}
              <strong>{new Date(crossover).toLocaleDateString('fr-FR')}</strong> (solde projeté{' '}
              <strong>{formatFcfa(min.balance)}</strong>).
            </>
          ) : (
            <>
              Trésorerie suffisante sur la période projetée (minimum{' '}
              <strong>{formatFcfa(min.balance)}</strong>).
            </>
          )}
        </span>
      </div>

      <div className={styles.panel}>
        <CashVisionChart points={points} />
        <p className={styles.hint}>
          Projection de démonstration calculée localement à partir des flux — aucune
          prévision garantie, aucun modèle prédictif.
        </p>
      </div>

      <ScenarioComparator />
    </div>
  );
}
