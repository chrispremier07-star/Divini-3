/**
 * DIVINI exo — Stocks · mouvements (LOT 07)
 *
 * Entrées, sorties, corrections, transferts ; liste filtrable, détail,
 * justificatif, motif obligatoire. Un mouvement sans motif est refusé côté
 * interface (interdit §11) — le formulaire ne l'enregistre pas.
 *
 * Honnêteté : données de démonstration ; la somme des mouvements reconstitue le
 * stock affiché (`stockOf`) ; aucune écriture réelle (phase backend).
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

import { DataTable, type DataColumnType } from '../data';
import { Badge, Button, EmptyState, Icon, Input, Select } from '../ui';
import { FieldGroup } from '../ui/Field';
import { useToast } from '../ui/Toast';

import {
  MOVEMENTS,
  STOCK_PRODUCTS,
  WAREHOUSES,
  findMovement,
  findProduct,
  findWarehouse,
  movementsOf,
  stockOf,
  MOVEMENT_TYPE_LABELS,
  formatFcfa,
  type Movement,
  type MovementType
} from './mock';

import styles from './stocks.module.css';

const TYPE_TONE: Record<MovementType, 'success' | 'warning' | 'info' | 'neutral'> = {
  entree: 'success',
  sortie: 'warning',
  correction: 'info',
  transfert: 'neutral'
};

/* --------------------------------- liste --------------------------------- */

const COLUMNS: DataColumnType<Movement>[] = [
  {
    id: 'ref',
    header: 'Référence',
    width: '0 0 140px',
    mono: true,
    priority: 'high',
    render: (m) => (
      <Link href={`/app/stocks/mouvements/${m.id}`} style={{ color: 'var(--text-primary)' }}>
        {m.ref}
      </Link>
    ),
    value: (m) => m.ref
  },
  {
    id: 'type',
    header: 'Type',
    width: '0 0 130px',
    priority: 'normal',
    render: (m) => (
      <Badge tone={TYPE_TONE[m.type]} withIcon={false}>
        {MOVEMENT_TYPE_LABELS[m.type]}
      </Badge>
    ),
    value: (m) => MOVEMENT_TYPE_LABELS[m.type]
  },
  {
    id: 'product',
    header: 'Produit',
    width: '2 1 0',
    priority: 'high',
    value: (m) => findProduct(m.productId)?.label ?? m.productId
  },
  {
    id: 'delta',
    header: 'Quantité',
    width: '0 0 100px',
    mono: true,
    sortable: true,
    sortValue: (m) => m.delta,
    render: (m) => (
      <span className={styles.mono}>
        {m.delta >= 0 ? '+' : ''}
        {m.delta}
      </span>
    )
  },
  {
    id: 'reason',
    header: 'Motif',
    width: '2 1 0',
    priority: 'low',
    value: (m) => m.reason
  },
  {
    id: 'date',
    header: 'Date',
    width: '0 0 120px',
    priority: 'low',
    sortable: true,
    sortValue: (m) => m.date,
    value: (m) => new Date(m.date).toLocaleDateString('fr-FR')
  }
];

export function MovementList() {
  return (
    <div className={styles.listWrap}>
      <div className={styles.detailHead}>
        <div>
          <h1 className={styles.detailTitle}>Mouvements</h1>
          <p className={styles.panelHint}>
            {MOVEMENTS.length} mouvements de démonstration · la somme par produit reconstitue le stock.
          </p>
        </div>
        <Link href="/app/stocks/mouvements/nouveau">
          <Button variant="primary" size="sm" onClick={() => undefined}>
            <Icon name="plus" size="var(--ctl-icon-sm)" /> Nouveau mouvement
          </Button>
        </Link>
      </div>

      <DataTable
        rows={MOVEMENTS}
        columns={COLUMNS}
        rowId={(m) => m.id}
        accessors={{
          searchText: (m) => `${m.ref} ${findProduct(m.productId)?.label ?? ''} ${m.reason}`,
          date: (m) => m.date
        }}
        statusOptions={[
          { id: 'entree', label: 'Entrée' },
          { id: 'sortie', label: 'Sortie' },
          { id: 'correction', label: 'Correction' },
          { id: 'transfert', label: 'Transfert' }
        ]}
        emptyTitle="Aucun mouvement"
        emptyDescription="Aucun mouvement ne correspond à ce filtre."
      />
    </div>
  );
}

/* -------------------------------- détail --------------------------------- */

export function MovementDetail({ id }: { id: string }) {
  const movement = findMovement(id);

  if (!movement) {
    return (
      <EmptyState
        title="Mouvement introuvable"
        description="Cette référence de mouvement n'existe pas dans les données de démonstration."
        icon="package"
      />
    );
  }

  const product = findProduct(movement.productId);
  const warehouse = findWarehouse(movement.warehouseId);

  return (
    <div className={styles.listWrap}>
      <div className={styles.detailHead}>
        <div>
          <div className={styles.detailRef}>{movement.ref}</div>
          <h1 className={styles.detailTitle}>{MOVEMENT_TYPE_LABELS[movement.type]}</h1>
          <div className={styles.detailMeta}>
            <span>{new Date(movement.date).toLocaleString('fr-FR')}</span>
            <span>·</span>
            <span>{movement.actor}</span>
          </div>
        </div>
        <Badge tone={TYPE_TONE[movement.type]} withIcon={false}>
          {movement.delta >= 0 ? '+' : ''}
          {movement.delta}
        </Badge>
      </div>

      <div className={styles.movementGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Détail</span>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Produit</span>
              <span className={styles.infoValue}>
                <Link href={`/app/stocks/produits/${movement.productId}`}>
                  {product?.label ?? movement.productId}
                </Link>
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Entrepôt</span>
              <span className={styles.infoValue}>{warehouse?.label ?? movement.warehouseId}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Motif</span>
              <span className={styles.infoValue}>{movement.reason}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Justificatif</span>
              <span className={`${styles.infoValue} ${styles.infoValueMono}`}>
                {movement.justification ?? '—'}
              </span>
            </div>
          </div>
          <p className={styles.panelHint}>
            Stock du produit après mouvements :{' '}
            <span className={styles.mono}>{stockOf(movement.productId)}</span>
          </p>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Autres mouvements du produit</span>
          </div>
          {movementsOf(movement.productId)
            .filter((m) => m.id !== movement.id)
            .map((m) => (
              <div key={m.id} className={styles.dormantRow}>
                <div className={styles.riskInfo}>
                  <span className={styles.riskLabel}>{MOVEMENT_TYPE_LABELS[m.type]}</span>
                  <span className={styles.riskMeta}>{m.reason}</span>
                </div>
                <span className={styles.mono}>
                  {m.delta >= 0 ? '+' : ''}
                  {m.delta}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ formulaire ------------------------------- */

function MovementTypeSelector({
  value,
  onChange
}: {
  value: MovementType;
  onChange: (t: MovementType) => void;
}) {
  const types = Object.keys(MOVEMENT_TYPE_LABELS) as MovementType[];
  return (
    <div className={styles.typeSelector} role="group" aria-label="Type de mouvement">
      {types.map((t) => (
        <button
          key={t}
          type="button"
          className={styles.typeOption}
          aria-pressed={value === t}
          onClick={() => onChange(t)}
        >
          {MOVEMENT_TYPE_LABELS[t]}
        </button>
      ))}
    </div>
  );
}

export function MovementForm() {
  const { push } = useToast();
  const [type, setType] = useState<MovementType>('entree');
  const [productId, setProductId] = useState(STOCK_PRODUCTS[0]?.id ?? '');
  const [warehouseId, setWarehouseId] = useState(WAREHOUSES[0]?.id ?? '');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const reasonError = touched && reason.trim().length === 0 ? 'Le motif est obligatoire.' : undefined;
  const qtyError =
    touched && (qty === '' || Number(qty) <= 0) ? 'Une quantité positive est obligatoire.' : undefined;

  const productOptions = STOCK_PRODUCTS.map((p) => ({ value: p.id, label: `${p.label} (${p.ref})` }));
  const warehouseOptions = WAREHOUSES.map((w) => ({ value: w.id, label: w.label }));

  return (
    <div className={styles.listWrap}>
      <div className={styles.detailHead}>
        <h1 className={styles.detailTitle}>Nouveau mouvement</h1>
      </div>

      <form
        className={styles.panel}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          // Un mouvement sans motif est refusé (interdit §11).
          if (reason.trim().length === 0 || qty === '' || Number(qty) <= 0) return;
          push({
            tone: 'success',
            title: 'Mouvement enregistré (démo)',
            description: `${MOVEMENT_TYPE_LABELS[type]} · ${qty} · aucune écriture réelle.`
          });
        }}
      >
        <div className={styles.formField}>
          <span className={styles.infoLabel}>Type</span>
          <MovementTypeSelector value={type} onChange={setType} />
        </div>

        <div className={styles.infoGrid}>
          <FieldGroup label="Produit" required>
            <Select options={productOptions} value={productId} onChange={setProductId} />
          </FieldGroup>
          <FieldGroup label="Entrepôt" required>
            <Select options={warehouseOptions} value={warehouseId} onChange={setWarehouseId} />
          </FieldGroup>
          <FieldGroup label="Quantité" required error={qtyError}>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              invalid={!!qtyError}
            />
          </FieldGroup>
          <FieldGroup
            label="Motif"
            required
            error={reasonError}
            hint="Obligatoire — un mouvement sans motif est refusé."
          >
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              invalid={!!reasonError}
              placeholder="Réception, vente, casse, régularisation…"
            />
          </FieldGroup>
        </div>

        <div className={styles.actions}>
          <Button type="submit" variant="primary" size="sm" onClick={() => undefined}>
            Enregistrer le mouvement
          </Button>
          <Link href="/app/stocks/mouvements">
            <Button type="button" variant="ghost" size="sm" onClick={() => undefined}>
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
