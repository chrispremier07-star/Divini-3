/**
 * DIVINI exo — Cockpit (LOT 05, présentation simplifiée)
 *
 * Premier écran du produit : « que se passe-t-il aujourd'hui et que dois-je faire ? ».
 *
 * Présentation volontairement calme et lisible : un bandeau d'honnêteté, un
 * en-tête avec la période, une unique entrée « Demander à l'IA », puis un ordre
 * de lecture fixe et aéré — À surveiller / Bonnes nouvelles, Mission du jour,
 * Indicateurs essentiels, graphique. Aucun épinglage, aucune rangée d'actions
 * superflue : l'écran répond à une seule question par section.
 *
 * Honnêteté : données mockées signalées ; l'impact estimé est présenté comme une
 * estimation ; une carte vers un module non livré annonce « LOT n » au lieu
 * d'ouvrir une page fictive.
 */

'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { KpiCard, KpiGrid, Chart, ProgressBar } from '../data';
import {
  Button,
  Badge,
  EmptyState,
  ErrorState,
  OfflineState,
  PermissionDenied,
  SkeletonBlock
} from '../ui';
import { Icon, type IconName } from '../ui/Icon';
import { useToast } from '../ui/Toast';

import { useShellState } from '../../lib/shell-state';
import { useCommandCenter } from '../command';

import {
  GOOD_SIGNALS,
  MISSIONS,
  PERIOD_LABELS,
  WATCH_SIGNALS,
  cockpitKpis,
  formatFcfa,
  revenueSeries,
  type CockpitPeriod,
  type CockpitSignal,
  type Mission,
  type MissionStatus
} from './mock';

import styles from './cockpit.module.css';

export type CockpitState = 'auto' | 'loading' | 'empty' | 'error' | 'offline' | 'denied';

type CockpitProps = {
  /** `auto` : état dérivé de la connexion. Autres : démonstration technique. */
  demoState?: CockpitState;
};

const TONE_ICON_COLOR: Record<CockpitSignal['tone'], string> = {
  critical: 'var(--text-critical)',
  warning: 'var(--text-warning)',
  info: 'var(--text-info)',
  success: 'var(--text-success)'
};

/* ------------------------------ Section simple ---------------------------- */

function Section({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {subtitle ? <p className={styles.sectionSubtitle}>{subtitle}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

/* --------------------------------- Signaux -------------------------------- */

function SignalItem({ signal, onNavigate }: { signal: CockpitSignal; onNavigate: (s: CockpitSignal) => void }) {
  return (
    <li className={styles.signal}>
      <span className={styles.signalIcon} style={{ color: TONE_ICON_COLOR[signal.tone] }}>
        <Icon name={signal.icon} size="var(--ctl-icon-sm)" />
      </span>
      <div className={styles.signalBody}>
        <p className={styles.signalTitle}>{signal.title}</p>
        <p className={styles.signalCause}>{signal.cause}</p>
        <button type="button" className={styles.signalAction} onClick={() => onNavigate(signal)}>
          {signal.action.label}
          <Icon name="arrowRight" size="var(--ctl-icon-sm)" />
        </button>
      </div>
    </li>
  );
}

/* --------------------------------- Missions ------------------------------- */

const MISSION_STATUS_LABEL: Record<MissionStatus, string> = {
  todo: 'À faire',
  doing: 'En cours',
  done: 'Fait',
  na: 'Non applicable'
};

function MissionRow({
  mission,
  onToggle,
  onNavigate
}: {
  mission: Mission;
  onToggle: (id: string) => void;
  onNavigate: (m: Mission) => void;
}) {
  const done = mission.status === 'done';
  return (
    <li className={styles.mission}>
      <button
        type="button"
        className={styles.missionCheck}
        onClick={() => onToggle(mission.id)}
        aria-pressed={done}
        aria-label={done ? `Marquer « ${mission.label} » à faire` : `Marquer « ${mission.label} » fait`}
      >
        {done ? <Icon name="check" size="var(--ctl-icon-sm)" /> : null}
      </button>
      <div className={styles.missionBody}>
        <p className={`${styles.missionLabel} ${done ? styles.missionDone : ''}`}>{mission.label}</p>
        <p className={styles.missionDetail}>{mission.detail}</p>
        <p className={styles.missionImpact}>
          <Badge tone="neutral">estimation</Badge> {mission.impact}
        </p>
      </div>
      <div className={styles.missionSide}>
        <Badge tone={done ? 'success' : mission.status === 'doing' ? 'info' : 'warning'}>
          {MISSION_STATUS_LABEL[mission.status]}
        </Badge>
        <button type="button" className={styles.signalAction} onClick={() => onNavigate(mission)}>
          {mission.action.label}
        </button>
      </div>
    </li>
  );
}

/* --------------------------------- Cockpit -------------------------------- */

export function Cockpit({ demoState = 'auto' }: CockpitProps) {
  const { connection, scope } = useShellState();
  const { openPalette } = useCommandCenter();
  const { push } = useToast();
  const router = useRouter();

  const [period, setPeriod] = useState<CockpitPeriod>('today');
  const [missions, setMissions] = useState(MISSIONS);

  const effective: CockpitState | 'ready' =
    demoState !== 'auto' ? demoState : connection === 'offline' ? 'offline' : 'ready';

  const series = useMemo(() => revenueSeries(period), [period]);
  const kpis = useMemo(() => cockpitKpis(period), [period]);

  const navigate = (action: { route?: string; lot?: number; label: string }) => {
    if (action.route) {
      router.push(action.route);
      return;
    }
    push({
      tone: 'info',
      title: `${action.label} — module en construction`,
      description: `Cet écran arrive au LOT ${action.lot ?? '—'}. Aucune page fictive n’est ouverte.`
    });
  };

  const toggleMission = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: m.status === 'done' ? 'todo' : 'done' } : m))
    );
  };

  const doneCount = missions.filter((m) => m.status === 'done').length;
  const missionProgress = Math.round((doneCount / missions.length) * 100);

  const watch = WATCH_SIGNALS.slice(0, 3);
  const good = GOOD_SIGNALS.slice(0, 3);

  return (
    <div className={styles.cockpit}>
      <p className={styles.demoBanner} role="note">
        Données de démonstration — aucune entreprise réelle, aucun paiement réel.
      </p>

      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Cockpit</h1>
          <p className={styles.subtitle}>Que se passe-t-il aujourd’hui, et que devez-vous faire ?</p>
        </div>
        <div className={styles.headActions}>
          <div className={styles.periods} role="group" aria-label="Période du cockpit">
            {(Object.keys(PERIOD_LABELS) as CockpitPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                className={`${styles.periodBtn} ${p === period ? styles.periodActive : ''}`}
                onClick={() => setPeriod(p)}
                aria-pressed={p === period}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={openPalette}>
            <Icon name="sparkles" size="var(--ctl-icon-sm)" />
            Demander à l’IA
          </Button>
        </div>
      </header>

      {effective === 'offline' ? (
        <div className={styles.offlineNote}>
          <OfflineState lastSyncLabel="il y a 12 min" />
        </div>
      ) : null}

      {effective === 'error' ? (
        <ErrorState
          title="Impossible de charger le cockpit"
          description="Une erreur est survenue pendant la lecture des données de démonstration."
          onRetry={() => setPeriod(period)}
        />
      ) : effective === 'empty' ? (
        <EmptyState
          icon="gauge"
          title="Aucune activité sur la période"
          description="Aucun signal, aucune mission ni vente sur cette période pour cette portée."
        />
      ) : effective === 'denied' ? (
        <PermissionDenied
          resource="certaines sections du cockpit"
          missingPermission="cockpit.view"
          contact="un administrateur"
        />
      ) : effective === 'loading' ? (
        <div className={styles.skeletons}>
          <SkeletonBlock lines={4} />
          <SkeletonBlock lines={3} />
        </div>
      ) : (
        <div className={styles.grid}>
          <Section
            title="Aujourd’hui dans votre entreprise"
            subtitle="À surveiller d’abord, puis les bonnes nouvelles"
          >
            <div className={styles.signalGrid}>
              <div>
                <h3 className={styles.signalGroup}>À surveiller</h3>
                <ul className={styles.signalList}>
                  {watch.map((s) => (
                    <SignalItem key={s.id} signal={s} onNavigate={(sig) => navigate(sig.action)} />
                  ))}
                </ul>
              </div>
              <div>
                <h3 className={styles.signalGroup}>Bonnes nouvelles</h3>
                <ul className={styles.signalList}>
                  {good.map((s) => (
                    <SignalItem key={s.id} signal={s} onNavigate={(sig) => navigate(sig.action)} />
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Mission du jour" subtitle="Ce que vous devez faire, et ce que cela rapporte">
            <div className={styles.missionProgress}>
              <ProgressBar value={missionProgress} label={`Progression — ${doneCount}/${missions.length} faites`} />
            </div>
            <ul className={styles.missionList}>
              {missions.map((m) => (
                <MissionRow key={m.id} mission={m} onToggle={toggleMission} onNavigate={(mi) => navigate(mi.action)} />
              ))}
            </ul>
          </Section>

          <Section
            title="Indicateurs essentiels"
            subtitle={`Portée : ${scope.kind === 'tenant' ? 'tous les établissements' : 'établissement'} · valeurs en FCFA`}
          >
            <KpiGrid>
              {kpis.map((k) => (
                <KpiCard
                  key={k.id}
                  label={k.label}
                  value={k.value}
                  format={k.format === 'fcfa' ? formatFcfa : (v: number) => String(v)}
                  delta={k.delta}
                  period={PERIOD_LABELS[period]}
                  note={k.note}
                />
              ))}
            </KpiGrid>
          </Section>

          <Section title="Évolution du chiffre d’affaires" subtitle="La somme de la série correspond au KPI « CA »">
            <Chart
              kind="area"
              labels={series.labels}
              series={[{ id: 'ca', label: 'CA (F)', values: series.values, color: 'var(--accent)' }]}
              formatValue={formatFcfa}
            />
          </Section>
        </div>
      )}
    </div>
  );
}
