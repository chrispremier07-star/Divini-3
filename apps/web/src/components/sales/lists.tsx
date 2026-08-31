/**
 * DIVINI exo — Ventes & Commandes · listes, détails, statuts (LOT 06)
 *
 * Motif d'écran métier posé par le LOT 05 : liste → détail → action → historique.
 * Réutilise la `DataTable` du LOT 03 (tri, filtres, pagination, mode carte) et les
 * primitives du LOT 01. Montants / quantités / références en IBM Plex Mono, alignés
 * à droite pour les montants.
 *
 * Honnêteté : données mockées signalées ; annulations sous `ConfirmDialog` avec
 * conséquence explicite ; « en retard » jamais par la seule couleur ; historique
 * présenté comme journal de démonstration ; génération de numéros reportée backend.
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { DataTable, type DataColumnType } from '../data';
import { Badge, EmptyState, Button } from '../ui';
import { Icon } from '../ui/Icon';
import { ConfirmDialog } from '../ui/Overlay';
import { Timeline } from '../data';
import { useToast } from '../ui/Toast';

import { useShellState } from '../../lib/shell-state';

import {
  PAYMENT_MEAN_LABELS,
  STATUS_META,
  docTotal,
  docsOf,
  findDoc,
  formatFcfa,
  paidAmount,
  remainingAmount,
  type DocKind,
  type SalesDoc
} from './mock';

import styles from './sales.module.css';

export const KIND_LABELS: Record<DocKind, string> = {
  vente: 'Ventes',
  commande: 'Commandes',
  devis: 'Devis',
  facture: 'Factures',
  avoir: 'Avoirs',
  paiement: 'Paiements'
};

export const KIND_ROUTES: Record<DocKind, string> = {
  vente: '/app/ventes',
  commande: '/app/commandes',
  devis: '/app/devis',
  facture: '/app/factures',
  avoir: '/app/avoirs',
  paiement: '/app/paiements'
};

export function DocStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, tone: 'neutral' as const };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

/* ------------------------------ File hors ligne --------------------------- */

export function OfflineQueueBar() {
  const { connection } = useShellState();
  const pending = docsOf('vente').filter((d) => !d.synced).length;
  if (connection === 'offline') {
    return (
      <p className={styles.offlineBar} data-state="offline" role="status">
        <Icon name="wifiOff" size="var(--ctl-icon-sm)" />
        Hors ligne — {pending} opération(s) en file locale, aucune saisie perdue.
      </p>
    );
  }
  if (connection === 'syncing') {
    return (
      <p className={styles.offlineBar} data-state="syncing" role="status">
        <Icon name="refresh" size="var(--ctl-icon-sm)" />
        Synchronisation de la file locale…
      </p>
    );
  }
  return null;
}

/* ---------------------------------- Liste --------------------------------- */

function columnsFor(kind: DocKind): DataColumnType<SalesDoc>[] {
  const base: DataColumnType<SalesDoc>[] = [
    {
      id: 'ref',
      header: 'Référence',
      mono: true,
      sortable: true,
      sortValue: (d) => d.ref,
      render: (d) => (
        <Link className={styles.refLink} href={`${KIND_ROUTES[kind]}/${d.id}`}>
          {d.ref}
        </Link>
      )
    },
    { id: 'date', header: 'Date', priority: 'normal', sortable: true, sortValue: (d) => d.date, render: (d) => new Date(d.date).toISOString().slice(5, 16).replace('T', ' ') },
    { id: 'customer', header: 'Client', priority: 'normal', render: (d) => d.customer }
  ];

  if (kind === 'paiement') {
    base.push(
      { id: 'mean', header: 'Moyen', priority: 'low', render: (d) => PAYMENT_MEAN_LABELS[d.means?.[0] ?? 'especes'] },
      { id: 'amount', header: 'Montant', mono: true, priority: 'low', sortable: true, sortValue: (d) => d.amount ?? 0, render: (d) => formatFcfa(d.amount ?? 0) }
    );
  } else {
    base.push({
      id: 'total',
      header: 'Total',
      mono: true,
      sortable: true,
      sortValue: (d) => docTotal(d),
      render: (d) => <span className={styles.amount}>{formatFcfa(docTotal(d))}</span>
    });
  }

  base.push({ id: 'status', header: 'Statut', render: (d) => <DocStatusBadge status={d.status} /> });
  return base;
}

export function SalesList({ kind }: { kind: DocKind }) {
  const rows = useMemo(() => docsOf(kind), [kind]);

  return (
    <div className={styles.listWrap}>
      <p className={styles.demoBanner} role="note">
        Données de démonstration — aucune transaction réelle.
      </p>
      <OfflineQueueBar />
      <DataTable
        rows={rows}
        columns={columnsFor(kind)}
        rowId={(d) => d.id}
        accessors={{ searchText: (d) => `${d.ref} ${d.customer} ${d.status}`, date: (d) => d.date }}
        mode="pagination"
        pageSize={8}
        emptyTitle={`Aucune ${KIND_LABELS[kind].toLowerCase()}`}
        emptyDescription="Aucun document dans cette portée pour l'instant."
      />
    </div>
  );
}

/* ---------------------------------- Détail -------------------------------- */

export function DocDetail({ kind, id }: { kind: DocKind; id: string }) {
  const doc = findDoc(kind, id);
  const { push } = useToast();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!doc) {
    return (
      <EmptyState
        icon="file"
        title="Document introuvable"
        description={`Aucun document « ${id} » dans ce journal de démonstration.`}
      />
    );
  }

  const total = docTotal(doc);
  const isInvoice = kind === 'facture';

  return (
    <div className={styles.detail}>
      <p className={styles.demoBanner} role="note">
        Données de démonstration — numérotation réelle reportée au backend.
      </p>

      <header className={styles.detailHead}>
        <div>
          <p className={styles.detailRef}>{doc.ref}</p>
          <h1 className={styles.detailTitle}>{KIND_LABELS[kind].slice(0, -1)} — {doc.customer}</h1>
          <div className={styles.detailMeta}>
            <DocStatusBadge status={doc.status} />
            <span className={styles.detailDate}>{new Date(doc.date).toISOString().slice(0, 16).replace('T', ' ')}</span>
            {!doc.synced ? <Badge tone="warning">non synchronisé</Badge> : null}
          </div>
        </div>
        <div className={styles.detailActions}>
          {kind === 'vente' || kind === 'facture' || kind === 'devis' ? (
            <Button variant="ghost" size="sm" onClick={() => setConfirmCancel(true)}>
              Annuler
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => push({ tone: 'info', title: 'Dupliqué (démo)', description: `Copie locale de ${doc.ref}, sans écriture réelle.` })}
          >
            Dupliquer
          </Button>
        </div>
      </header>

      {doc.lines.length > 0 ? (
        <table className={styles.linesTable}>
          <thead>
            <tr>
              <th className="t-table-header">Article</th>
              <th className={`t-table-header ${styles.num}`}>Qté</th>
              <th className={`t-table-header ${styles.num}`}>PU</th>
              <th className={`t-table-header ${styles.num}`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {doc.lines.map((l) => (
              <tr key={l.productId}>
                <td>{l.label}</td>
                <td className={styles.num}>{l.qty}</td>
                <td className={styles.num}>{formatFcfa(l.unitPrice)}</td>
                <td className={styles.num}>{formatFcfa(l.qty * l.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {doc.discount > 0 ? (
              <tr>
                <td colSpan={3}>Remise</td>
                <td className={styles.num}>−{formatFcfa(doc.discount)}</td>
              </tr>
            ) : null}
            <tr>
              <td colSpan={3} className={styles.totalLabel}>Total</td>
              <td className={`${styles.num} ${styles.total}`}>{formatFcfa(total)}</td>
            </tr>
            {isInvoice ? (
              <tr>
                <td colSpan={3}>Payé / reste à payer</td>
                <td className={styles.num}>
                  {formatFcfa(paidAmount(doc))} / <strong>{formatFcfa(remainingAmount(doc))}</strong>
                </td>
              </tr>
            ) : null}
          </tfoot>
        </table>
      ) : (
        <p className={styles.noLines}>Ce document ne porte pas de lignes (paiement).</p>
      )}

      {isInvoice && (doc.payments?.length ?? 0) > 0 ? (
        <section className={styles.paySection} aria-label="Paiements rattachés">
          <h2 className={styles.payTitle}>Paiements</h2>
          <ul className={styles.payList}>
            {(doc.payments ?? []).map((p) => (
              <li key={p.id} className={styles.payItem}>
                <span>{PAYMENT_MEAN_LABELS[p.mean]}</span>
                <span className={styles.num}>{formatFcfa(p.amount)}</span>
                <DocStatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(doc.invoiceRef || doc.saleRef) ? (
        <p className={styles.related}>
          {doc.saleRef ? <Link href={`${KIND_ROUTES.vente}/${doc.saleRef}`}>Vente {doc.saleRef}</Link> : null}
          {doc.invoiceRef ? <Link href={`${KIND_ROUTES.facture}/${doc.invoiceRef}`}>Facture {doc.invoiceRef}</Link> : null}
        </p>
      ) : null}

      <ConfirmDialog
        open={confirmCancel}
        title={`Annuler ${doc.ref}`}
        description={`Permission requise : ${kind}.cancel. L'annulation est définitive dans ce journal de démonstration ; aucune écriture réelle n'est passée.`}
        confirmLabel={`Annuler ${doc.ref}`}
        cancelLabel="Conserver"
        destructive
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => {
          setConfirmCancel(false);
          push({ tone: 'warning', title: `${doc.ref} annulé (démo)`, description: 'Opération locale, sans effet réel.' });
        }}
      />
    </div>
  );
}

/* -------------------------------- Historique ------------------------------ */

export function SaleHistory({ id }: { id: string }) {
  const doc = findDoc('vente', id);
  if (!doc) {
    return <EmptyState icon="file" title="Vente introuvable" description={`Aucune vente « ${id} ».`} />;
  }
  return (
    <div className={styles.detail}>
      <p className={styles.demoBanner} role="note">
        Journal de démonstration — l'audit réel arrive avec le backend.
      </p>
      <h1 className={styles.detailTitle}>Historique — {doc.ref}</h1>
      <Timeline
        items={[
          { date: doc.date, actor: 'Camille Roux', title: 'Vente créée', result: `${doc.lines.length} ligne(s)`, tone: 'info' },
          { date: doc.date, actor: 'Camille Roux', title: 'Encaissement', result: (doc.means ?? []).map((m) => PAYMENT_MEAN_LABELS[m]).join(', ') || '—', tone: 'success' },
          { date: doc.date, actor: 'Système', title: doc.synced ? 'Synchronisé' : 'En file locale', result: doc.synced ? 'OK' : 'en attente', tone: doc.synced ? 'success' : 'warning' }
        ]}
      />
    </div>
  );
}
