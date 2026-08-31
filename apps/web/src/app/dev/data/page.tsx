/**
 * DIVINI exo — /dev/data : galerie technique (LOT 03)
 *
 * Chaque composant de données dans ses états, sur jeux de données de tailles
 * variées (0, 1, 12, 500, 50 000 lignes simulées). Un bandeau permanent rappelle
 * que ces données sont simulées (§10).
 *
 * Route interne, pas un écran produit.
 */

'use client';

import { Suspense, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/Identity';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

import {
  ActivityFeed,
  Chart,
  DataTable,
  DataPanel,
  KpiCard,
  KpiGrid,
  Kanban,
  ProgressBar,
  ProgressRing,
  Timeline,
  STATUS_LABEL,
  STATUS_TONE,
  EMPTY_ROWS,
  FEW_ROWS,
  MEDIUM_ROWS,
  HUGE_COUNT,
  formatFcfa,
  makeRows,
  paramsToQuery,
  queryToParams,
  type DataColumnType,
  type KanbanColumnData,
  type MockRow,
  type TableQuery
} from '@/components/data';

import { AppShell } from '@/components/shell';

import styles from './dev-data.module.css';

const COLUMNS: Array<DataColumnType<MockRow>> = [
  { id: 'id', header: 'Référence', mono: true, sortable: true, sortValue: (r) => r.id, width: '0 0 120px' },
  { id: 'label', header: 'Document', sortable: true, sortValue: (r) => r.label, width: '2 1 0' },
  { id: 'customer', header: 'Client', secondary: true, priority: 'low', value: (r) => r.customer },
  { id: 'amount', header: 'Montant', mono: true, sortable: true, sortValue: (r) => r.amount, value: (r) => formatFcfa(r.amount) },
  { id: 'date', header: 'Date', sortable: true, sortValue: (r) => r.date, value: (r) => r.date },
  {
    id: 'status',
    header: 'Statut',
    render: (r) => <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
  }
];

const STATUS_OPTIONS = [
  { id: 'paid', label: 'Payé' },
  { id: 'pending', label: 'En attente' },
  { id: 'late', label: 'En retard' }
];

/** Seule la table paginée lit l'URL ; isolée dans un Suspense pour ne pas
 *  suspendre le rendu serveur du reste de la galerie. */
function UrlPaginatedTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState<TableQuery>(() => paramsToQuery(searchParams));
  const updateQuery = (q: TableQuery) => {
    setQuery(q);
    router.replace(`${pathname}?${queryToParams(q).toString()}`);
  };

  return (
    <DataTable
      rows={FEW_ROWS}
      columns={COLUMNS}
      rowId={(r) => r.id}
      accessors={{ searchText: (r) => `${r.id} ${r.label} ${r.customer}`, status: (r) => r.status, date: (r) => r.date }}
      mode="pagination"
      pageSize={5}
      selectable
      statusOptions={STATUS_OPTIONS}
      isLocked={(r) => r.locked === true}
      query={query}
      onQueryChange={updateQuery}
      rowActions={() => [{ id: 'open', label: 'Ouvrir', onSelect: () => {} }]}
    />
  );
}

function Gallery() {
  const { push } = useToast();

  const huge = useMemo(() => makeRows(HUGE_COUNT), []);
  const [loadingDemo, setLoadingDemo] = useState(true);
  const [kanban, setKanban] = useState<KanbanColumnData[]>([
    { id: 'todo', title: 'À faire', cards: [{ id: 'k1', title: 'Relance client A', tone: 'warning' }, { id: 'k2', title: 'Devis à éditer' }] },
    { id: 'doing', title: 'En cours', cards: [{ id: 'k3', title: 'Commande B', tone: 'info' }] },
    { id: 'done', title: 'Terminé', cards: [{ id: 'k4', title: 'Facture C', tone: 'success' }] }
  ]);

  /** Déplace une carte sans effet de bord — utilisée aussi par « Annuler ». */
  const relocate = (cardId: string, toId: string) => {
    setKanban((prev) => {
      const from = prev.find((c) => c.cards.some((k) => k.id === cardId));
      const card = from?.cards.find((k) => k.id === cardId);
      if (!from || !card) return prev;
      return prev.map((c) => ({
        ...c,
        cards:
          c.id === toId
            ? [...c.cards.filter((k) => k.id !== cardId), card]
            : c.cards.filter((k) => k.id !== cardId)
      }));
    });
  };

  const moveCard = (cardId: string, toId: string) => {
    const fromId = kanban.find((c) => c.cards.some((k) => k.id === cardId))?.id;
    const fromTitle = kanban.find((c) => c.id === fromId)?.title ?? '';
    const toTitle = kanban.find((c) => c.id === toId)?.title ?? '';
    relocate(cardId, toId);
    push({
      tone: 'info',
      title: 'Carte déplacée',
      description: `${fromTitle} → ${toTitle}`,
      action: { label: 'Annuler', onClick: () => fromId && relocate(cardId, fromId) }
    });
  };

  return (
    <div className={styles.gallery}>
      <p className={styles.banner} role="status">
        Données simulées — aucun backend. Volumes générés de façon déterministe pour
        prouver pagination et virtualisation ; rien ici n'est une donnée réelle d'entreprise.
      </p>

      {/* ------------------------------- KPI -------------------------------- */}
      <DataPanel title="Indicateurs" subtitle="Valeur mono, delta non chromatique, count-up">
        <KpiGrid>
          <KpiCard label="Chiffre d'affaires" value={12500000} format={formatFcfa} delta={{ value: 8, direction: 'up' }} period="30 derniers jours" note="vs période précédente" />
          <KpiCard label="Commandes" value={342} delta={{ value: 4, direction: 'down' }} period="30 derniers jours" />
          <KpiCard label="Panier moyen" value={36500} format={formatFcfa} delta={{ value: 0, direction: 'flat' }} period="7 jours" />
          <KpiCard label="Clients actifs" value={98} delta={{ value: 12, direction: 'up' }} period="90 jours" />
        </KpiGrid>
      </DataPanel>

      {/* ------------------------------ Charts ------------------------------ */}
      <DataPanel title="Graphiques" subtitle="Grille subtile, trait fin, reveal progressif">
        <Chart
          kind="area"
          labels={['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7']}
          series={[
            { id: 'a', label: 'Ventes', values: [12, 18, 15, 22, 26, 24, 30] },
            { id: 'b', label: 'Objectif', values: [15, 16, 17, 18, 20, 22, 24] }
          ]}
        />
        <Chart
          kind="bar"
          labels={['Lun', 'Mar', 'Mer', 'Jeu', 'Ven']}
          series={[{ id: 'c', label: 'Encaissements', values: [40, 65, 52, 78, 60] }]}
        />
        <Chart kind="spark" labels={['1', '2', '3', '4', '5', '6', '7', '8']} series={[{ id: 'd', label: 'Tendance', values: [3, 5, 4, 7, 6, 9, 8, 11] }]} />
      </DataPanel>

      {/* ------------------------- Table paginée + URL ---------------------- */}
      <DataPanel title="Table paginée (12 lignes)" subtitle="Tri, filtres en jetons, sélection, état dans l'URL">
        <Suspense fallback={null}>
          <UrlPaginatedTable />
        </Suspense>
      </DataPanel>

      {/* --------------------- Table virtualisée 50 000 --------------------- */}
      <DataPanel title="Table virtualisée (50 000 lignes)" subtitle="Le DOM ne monte qu'une fenêtre">
        <DataTable rows={huge} columns={COLUMNS} rowId={(r) => r.id} mode="virtual" rowHeight={44} height={360} isLocked={(r) => r.locked === true} />
      </DataPanel>

      {/* ------------------------------ États ------------------------------- */}
      <DataPanel title="États de table" subtitle="loading · error · vide · vide après filtre">
        <div className={styles.stateRow}>
          <DataTable rows={MEDIUM_ROWS} columns={COLUMNS} rowId={(r) => r.id} loading={loadingDemo} />
          <Button size="sm" variant="ghost" onClick={() => setLoadingDemo((v) => !v)}>
            {loadingDemo ? 'Charger les données' : 'Repasser en chargement'}
          </Button>
        </div>
        <DataTable rows={MEDIUM_ROWS} columns={COLUMNS} rowId={(r) => r.id} error="La source de données n'a pas répondu." onRetry={() => {}} />
        <DataTable rows={EMPTY_ROWS} columns={COLUMNS} rowId={(r) => r.id} emptyTitle="Aucune facture" emptyDescription="Commencez par créer votre première facture." emptyAction={{ label: 'Créer une facture', onClick: () => {} }} />
      </DataPanel>

      {/* ------------------------------ Kanban ------------------------------ */}
      <DataPanel title="Kanban" subtitle="Drag-over accent-soft, annulation par Toast">
        <Kanban columns={kanban} onMove={moveCard} />
      </DataPanel>

      {/* -------------------------- Timeline / flux ------------------------- */}
      <DataPanel title="Timeline & flux d'activité">
        <Timeline
          items={[
            { date: '2026-08-01', actor: 'Camille', title: 'Facture créée', result: 'brouillon', tone: 'info' },
            { date: '2026-08-03', actor: 'Système', title: 'Synchronisation', result: 'ok', tone: 'success' },
            { date: '2026-08-05', actor: 'Camille', title: 'Paiement reçu', result: 'payé', tone: 'success' }
          ]}
        />
        <ActivityFeed
          items={[
            { type: 'sale', text: 'Commande n° 000312 encaissée', absolute: '2026-08-29 09:12', relative: 'il y a 5 min' },
            { type: 'sale', text: 'Devis n° 000313 envoyé', absolute: '2026-08-29 09:02', relative: 'il y a 15 min' },
            { type: 'alert', text: 'Stock bas sur l’article X', absolute: '2026-08-29 08:40', relative: 'il y a 37 min' },
            { type: 'sync', text: 'Synchronisation terminée', absolute: '2026-08-29 08:00', relative: 'il y a 1 h' }
          ]}
        />
      </DataPanel>

      {/* ----------------------------- Progress ----------------------------- */}
      <DataPanel title="Progression" subtitle="Barre et anneau, seuils sémantiques">
        <ProgressBar label="Objectif mensuel" value={64} />
        <ProgressBar label="Capacité d'entreposage" value={82} thresholds={{ warning: 70, critical: 90 }} />
        <div className={styles.stateRow}>
          <ProgressRing value={45} label="Santé du portefeuille" />
          <ProgressRing value={88} thresholds={{ warning: 70, critical: 85 }} label="Utilisation du crédit" />
        </div>
      </DataPanel>
    </div>
  );
}

export default function DevDataPage() {
  return (
    <AppShell>
      <Gallery />
    </AppShell>
  );
}
