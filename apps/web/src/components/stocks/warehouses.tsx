/**
 * DIVINI exo — Stocks · entrepôts & emplacements (LOT 07)
 *
 * Liste, fiche, capacités, rattachement aux établissements. Saturation en
 * ATTENTION / CRITIQUE avec libellé, jamais la couleur seule.
 *
 * Honnêteté : données de démonstration ; capacités et emplacements mockés.
 */

'use client';

import Link from 'next/link';

import { Badge, EmptyState, SeverityIndicator } from '../ui';
import { ProgressBar } from '../data';

import {
  WAREHOUSES,
  STOCK_PRODUCTS,
  findWarehouse,
  warehouseUsed,
  warehouseSaturation,
  categoryLabel,
  stockOf,
  type Warehouse
} from './mock';

import styles from './stocks.module.css';

const SATURATION_META = {
  ok: { label: 'Capacité disponible', tone: 'success' as const, level: 1 as const },
  warning: { label: 'Capacité tendue', tone: 'warning' as const, level: 2 as const },
  critical: { label: 'Capacité saturée', tone: 'critical' as const, level: 4 as const }
};

function WarehouseCard({ warehouse }: { warehouse: Warehouse }) {
  const used = warehouseUsed(warehouse.id);
  const ratio = warehouse.capacity > 0 ? Math.round((used / warehouse.capacity) * 100) : 0;
  const sat = warehouseSaturation(warehouse.id);
  const meta = SATURATION_META[sat];
  const products = STOCK_PRODUCTS.filter((p) => p.warehouseId === warehouse.id);

  return (
    <div className={styles.warehouseCard}>
      <div className={styles.warehouseHead}>
        <div>
          <div className={styles.warehouseName}>
            <Link href={`/app/stocks/entrepots/${warehouse.id}`} style={{ color: 'var(--text-primary)' }}>
              {warehouse.label}
            </Link>
          </div>
          <div className={styles.warehouseSub}>{warehouse.establishment}</div>
        </div>
        <SeverityIndicator tone={meta.tone} label={meta.label} level={meta.level} />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
          <span className={styles.infoLabel}>Occupation</span>
          <span className={styles.capacityValue}>
            {used} / {warehouse.capacity}
          </span>
        </div>
        <ProgressBar value={ratio} tone={meta.tone} thresholds={{ warning: 75, critical: 90 }} />
      </div>

      <div>
        <div className={styles.infoLabel} style={{ marginBottom: 'var(--sp-2)' }}>Emplacements</div>
        <div className={styles.locations}>
          {warehouse.locations.map((loc) => (
            <span key={loc} className={styles.locationChip}>
              {loc}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.riskMeta}>{products.length} produit(s) stocké(s)</div>
    </div>
  );
}

export function WarehouseList() {
  return (
    <div className={styles.listWrap}>
      <div className={styles.detailHead}>
        <div>
          <h1 className={styles.detailTitle}>Entrepôts & emplacements</h1>
          <p className={styles.panelHint}>
            {WAREHOUSES.length} entrepôt(s) de démonstration · capacités et saturation.
          </p>
        </div>
      </div>
      <div className={styles.warehouseGrid}>
        {WAREHOUSES.map((w) => (
          <WarehouseCard key={w.id} warehouse={w} />
        ))}
      </div>
    </div>
  );
}

export function WarehouseDetail({ id }: { id: string }) {
  const warehouse = findWarehouse(id);

  if (!warehouse) {
    return (
      <EmptyState
        title="Entrepôt introuvable"
        description="Cet entrepôt n'existe pas dans les données de démonstration."
        icon="building"
      />
    );
  }

  const used = warehouseUsed(warehouse.id);
  const ratio = warehouse.capacity > 0 ? Math.round((used / warehouse.capacity) * 100) : 0;
  const sat = warehouseSaturation(warehouse.id);
  const meta = SATURATION_META[sat];
  const products = STOCK_PRODUCTS.filter((p) => p.warehouseId === warehouse.id);

  return (
    <div className={styles.listWrap}>
      <div className={styles.detailHead}>
        <div>
          <h1 className={styles.detailTitle}>{warehouse.label}</h1>
          <div className={styles.detailMeta}>
            <span>{warehouse.establishment}</span>
            <SeverityIndicator tone={meta.tone} label={meta.label} level={meta.level} />
          </div>
        </div>
        <Badge tone={meta.tone} withIcon={false}>
          {used} / {warehouse.capacity}
        </Badge>
      </div>

      <div className={styles.panel}>
        <ProgressBar value={ratio} tone={meta.tone} thresholds={{ warning: 75, critical: 90 }} />
        <div>
          <div className={styles.infoLabel} style={{ marginBottom: 'var(--sp-2)' }}>Emplacements</div>
          <div className={styles.locations}>
            {warehouse.locations.map((loc) => (
              <span key={loc} className={styles.locationChip}>
                {loc}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Produits stockés</span>
          <span className={styles.panelHint}>{products.length} produit(s)</span>
        </div>
        {products.map((p) => (
          <div key={p.id} className={styles.dormantRow}>
            <div className={styles.riskInfo}>
              <span className={styles.riskLabel}>
                <Link href={`/app/stocks/produits/${p.id}`} style={{ color: 'var(--text-primary)' }}>
                  {p.label}
                </Link>
              </span>
              <span className={styles.riskMeta}>
                {p.ref} · {categoryLabel(p.categoryId)}
              </span>
            </div>
            <span className={styles.mono}>{stockOf(p.id)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
