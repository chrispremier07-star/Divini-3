/**
 * DIVINI exo — CRM · prospects (LOT 08)
 *
 * Pipeline en entonnoir (Kanban LOT 03), niveaux d'intérêt 1 à 5 explicites
 * (jamais réduits à une couleur), sources, indicateurs, conversion en client.
 *
 * Honnêteté : données mockées ; taux de conversion présenté comme valeur de
 * démonstration, jamais une mesure réelle (interdit §11) ; conversion sans
 * écriture réelle.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Kanban, type KanbanColumnData, KpiCard, KpiGrid } from '../data';
import { Badge, Button, EmptyState, Icon } from '../ui';
import { ConfirmDialog } from '../ui/Overlay';
import { useToast } from '../ui/Toast';

import {
  PROSPECTS,
  PROSPECT_STATUS_META,
  INTEREST_LABELS,
  SOURCE_LABELS,
  findProspect,
  prospectMetrics,
  formatFcfa,
  type InterestLevel,
  type Prospect,
  type ProspectStatus
} from './mock';

import styles from './crm.module.css';

/** Échelle d'intérêt 1–5 en points, avec libellé — jamais la couleur seule. */
function InterestScale({ level }: { level: InterestLevel }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
      <span className={styles.interestScale} aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={styles.interestDot} data-on={n <= level} />
        ))}
      </span>
      <span className={styles.hint}>
        {level}/5 · {INTEREST_LABELS[level]}
      </span>
    </span>
  );
}

function SourceBadge({ source }: { source: Prospect['source'] }) {
  return (
    <Badge tone="neutral" withIcon={false}>
      {SOURCE_LABELS[source]}
    </Badge>
  );
}

/** Indicateurs prospects. */
function ProspectMetrics() {
  const m = prospectMetrics();
  return (
    <KpiGrid>
      <KpiCard label="Prospects" value={m.total} format={(v) => String(v)} period="Total" />
      <KpiCard label="Nouveaux ce mois" value={m.nouveaux} format={(v) => String(v)} period="Mois courant" />
      <KpiCard label="Intérêt élevé" value={m.interetEleve} format={(v) => String(v)} period="Niveau 4–5" />
      <KpiCard label="À recontacter" value={m.aRecontacter} format={(v) => String(v)} period="Statut" />
      <KpiCard label="Convertis" value={m.convertis} format={(v) => String(v)} period="Statut" />
      <KpiCard
        label="Taux de conversion"
        value={m.tauxConversion}
        format={(v) => `${v} %`}
        period="Démonstration"
        note="Valeur mockée, non une mesure réelle"
      />
    </KpiGrid>
  );
}

/** Pipeline en colonnes par statut. */
function ProspectPipeline() {
  const statuses = Object.keys(PROSPECT_STATUS_META) as ProspectStatus[];

  const columns: KanbanColumnData[] = statuses.map((status) => ({
    id: status,
    title: `${PROSPECT_STATUS_META[status].label} (${PROSPECTS.filter((p) => p.status === status).length})`,
    cards: PROSPECTS.filter((p) => p.status === status).map((p) => ({
      id: p.id,
      title: p.name,
      meta: `${SOURCE_LABELS[p.source]} · intérêt ${p.interest}/5`,
      tone: PROSPECT_STATUS_META[status].tone === 'neutral' ? undefined : PROSPECT_STATUS_META[status].tone
    }))
  }));

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Pipeline</span>
        <span className={styles.hint}>Entonnoir de démonstration — aucun envoi réel</span>
      </div>
      <Kanban columns={columns} />
    </div>
  );
}

export function ProspectList() {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Prospects</h1>
          <p className={styles.hint}>
            {PROSPECTS.length} prospects de démonstration · niveaux d'intérêt 1 à 5, sources, pipeline.
          </p>
        </div>
        <Link href="/app/prospects/nouveau">
          <Button variant="primary" size="sm" onClick={() => undefined}>
            <Icon name="plus" size="var(--ctl-icon-sm)" /> Nouveau prospect
          </Button>
        </Link>
      </div>

      <ProspectMetrics />
      <ProspectPipeline />
    </div>
  );
}

/* ------------------------------ fiche prospect --------------------------- */

export function ProspectDetail({ id }: { id: string }) {
  const prospect = findProspect(id);
  const { push } = useToast();
  const [confirmConvert, setConfirmConvert] = useState(false);

  if (!prospect) {
    return (
      <EmptyState
        title="Prospect introuvable"
        description="Ce prospect n'existe pas dans les données de démonstration."
        icon="users"
      />
    );
  }

  const status = PROSPECT_STATUS_META[prospect.status];

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>{prospect.name}</h1>
          <div className={styles.profileMeta}>
            <Badge tone={status.tone === 'neutral' ? 'neutral' : status.tone} withIcon={false}>
              {status.label}
            </Badge>
            <SourceBadge source={prospect.source} />
            <span>{prospect.contact}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" size="sm" onClick={() => setConfirmConvert(true)}>
            <Icon name="userCheck" size="var(--ctl-icon-sm)" /> Convertir en client
          </Button>
        </div>
      </div>

      <div className={styles.split}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Qualification</span>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Niveau d'intérêt</span>
              <span className={styles.infoValue}>
                <InterestScale level={prospect.interest} />
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Source</span>
              <span className={styles.infoValue}>{SOURCE_LABELS[prospect.source]}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Créé le</span>
              <span className={styles.infoValue}>
                {new Date(prospect.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Contact</span>
              <span className={`${styles.infoValue} ${styles.mono}`}>{prospect.contact}</span>
            </div>
          </div>
          {prospect.note ? <p className={styles.hint}>{prospect.note}</p> : null}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Conversion</span>
          </div>
          <p className={styles.hint}>
            La conversion crée un client et rattache l'historique. Démonstration : aucune
            écriture réelle, aucun envoi.
          </p>
          <Button variant="subtil" size="sm" onClick={() => push({ tone: 'info', title: 'Relance planifiée (démo)', description: 'Aucun envoi réel.' })}>
            Planifier une relance
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmConvert}
        onCancel={() => setConfirmConvert(false)}
        title="Convertir ce prospect en client ?"
        description="Un client sera créé à partir de ce prospect et son historique rattaché. Action de démonstration, aucune écriture réelle."
        confirmLabel="Convertir en client"
        onConfirm={() => {
          setConfirmConvert(false);
          push({ tone: 'success', title: 'Prospect converti (démo)', description: 'Aucune écriture réelle.' });
        }}
      />
    </div>
  );
}

/* ------------------------------ formulaire ------------------------------- */

export function ProspectForm() {
  const { push } = useToast();
  const [level, setLevel] = useState<InterestLevel>(3);

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.title}>Nouveau prospect</h1>
      </div>
      <form
        className={styles.panel}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          push({ tone: 'success', title: 'Prospect créé (démo)', description: 'Aucune écriture réelle.' });
        }}
      >
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Niveau d'intérêt (1 à 5)</span>
          <div className={styles.actions} role="group" aria-label="Niveau d'intérêt">
            {([1, 2, 3, 4, 5] as InterestLevel[]).map((n) => (
              <Button
                key={n}
                type="button"
                variant={level === n ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setLevel(n)}
              >
                {n} — {INTEREST_LABELS[n]}
              </Button>
            ))}
          </div>
        </div>
        <div className={styles.actions}>
          <Button type="submit" variant="primary" size="sm" onClick={() => undefined}>
            Créer le prospect
          </Button>
          <Link href="/app/prospects">
            <Button type="button" variant="ghost" size="sm" onClick={() => undefined}>
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
