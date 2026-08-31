/**
 * DIVINI exo — Stocks · vue d'ensemble (LOT 07)
 *
 * Ouvre sur le risque, pas sur un tableau exhaustif (§5) : produits sous seuil,
 * stock dormant, derniers mouvements, écarts d'inventaire, répartition par
 * entrepôt. Valorisation en IBM Plex Mono.
 *
 * Honnêteté : données de démonstration signalées ; seuils avec icône + libellé,
 * jamais la couleur seule ; saturation d'entrepôt en ATTENTION / CRITIQUE.
 */

'use client';

import Link from 'next/link';

import { Badge, Icon, SeverityIndicator } from '../ui';
import { KpiCard, KpiGrid, DataPanel, ProgressBar, Timeline } from '../data';

import {
  STOCK_PRODUCTS,
  MOVEMENTS,
  INVENTORIES,
  WAREHOUSES,
  stockOf,
  stockLevel,
  STOCK_LEVEL_META,
  stockValuation,
  atRiskProducts,
  dormantProducts,
  lastMovement,
  daysSince,
  warehouseUsed,
  warehouseSaturation,
  hasVariance,
  formatFcfa,
  categoryLabel,
  findWarehouse,
  findProduct,
  MOVEMENT_TYPE_LABELS,
  DORMANT_DAYS
} from './mock';

import styles from './stocks.module.css';

function DemoBanner() {
  return (
    <div className={styles.demoBanner}>
      <Icon name="info" size="var(--ctl-icon-sm)" />
      <span>
        Données de démonstration — valorisation, mouvements et inventaires mockés.
        Aucun mouvement de stock réel n'est écrit (phase backend).
      </span>
    </div>
  );
}

/** Cartes de synthèse : valorisation, produits à risque, stock dormant. */
function StockOverviewCards() {
  const valuation = stockValuation();
  const atRisk = atRiskProducts();
  const dormant = dormantProducts();
  const criticalCount = atRisk.filter((p) => stockLevel(p) === 'critical').length;

  return (
    <KpiGrid>
      <KpiCard
        label="Valorisation du stock"
        value={valuation}
        format={formatFcfa}
        period="Stock actuel"
        note="Somme des quantités × prix HT"
      />
      <KpiCard
        label="Produits sous seuil"
        value={atRisk.length}
        format={(v) => String(v)}
        period="Seuils d'alerte et critique"
        note={criticalCount > 0 ? `dont ${criticalCount} en seuil critique` : 'aucun seuil critique'}
        delta={{ value: 0, direction: 'flat' }}
      />
      <KpiCard
        label="Stock dormant"
        value={dormant.length}
        format={(v) => String(v)}
        period={`Sans mouvement depuis ${DORMANT_DAYS} j`}
        note="À écouler ou à déprécier"
      />
    </KpiGrid>
  );
}

/** Produits sous seuil, triés par gravité. */
function RiskList() {
  const atRisk = atRiskProducts();

  if (atRisk.length === 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Produits à risque</span>
        </div>
        <p className={styles.panelHint}>Aucun produit sous seuil. Le stock est sain.</p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Produits à risque</span>
        <span className={styles.panelHint}>{atRisk.length} produit(s)</span>
      </div>
      <div className={styles.riskList}>
        {atRisk.map((p) => {
          const level = stockLevel(p);
          const meta = STOCK_LEVEL_META[level];
          const qty = stockOf(p.id);
          return (
            <div key={p.id} className={styles.riskRow} data-level={level}>
              <div className={styles.riskInfo}>
                <span className={styles.riskLabel}>{p.label}</span>
                <span className={styles.riskMeta}>
                  {p.ref} · {categoryLabel(p.categoryId)} · seuil {p.criticalThreshold}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <SeverityIndicator
                  tone={meta.tone}
                  label={meta.label}
                  level={level === 'critical' ? 4 : 2}
                />
                <span className={styles.riskQty}>{qty}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Stock dormant : du stock, mais aucun mouvement récent. */
function DormantStockPanel() {
  const dormant = dormantProducts();

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Stock dormant</span>
        <span className={styles.panelHint}>{dormant.length} produit(s)</span>
      </div>
      {dormant.length === 0 ? (
        <p className={styles.panelHint}>Aucun stock dormant détecté.</p>
      ) : (
        dormant.map((p) => {
          const last = lastMovement(p.id);
          const days = last ? daysSince(last.date) : null;
          return (
            <div key={p.id} className={styles.dormantRow}>
              <div className={styles.riskInfo}>
                <span className={styles.riskLabel}>{p.label}</span>
                <span className={styles.riskMeta}>
                  {p.ref} · {stockOf(p.id)} en stock
                </span>
              </div>
              <span className={styles.dormantDays}>
                {days === null ? 'aucun mouvement' : `${days} j`}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}

/** Derniers mouvements, tous produits confondus. */
function RecentMovements() {
  const recent = [...MOVEMENTS].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);

  return (
    <DataPanel title="Derniers mouvements" subtitle="Journal de démonstration">
      <Timeline
        items={recent.map((m) => {
          const product = findProduct(m.productId);
          const sign = m.delta >= 0 ? '+' : '';
          return {
            date: m.date,
            actor: m.actor,
            title: `${MOVEMENT_TYPE_LABELS[m.type]} — ${product?.label ?? m.productId}`,
            result: `${sign}${m.delta} · ${m.reason}`,
            tone: m.type === 'sortie' ? 'warning' : m.type === 'correction' ? 'info' : 'success'
          };
        })}
      />
    </DataPanel>
  );
}

/** Écarts d'inventaire détectés sur les sessions. */
function InventoryVariances() {
  const withVariance = INVENTORIES.filter(hasVariance);

  return (
    <DataPanel title="Écarts d'inventaire" subtitle="Sessions présentant un écart">
      {withVariance.length === 0 ? (
        <p className={styles.panelHint}>Aucun écart détecté.</p>
      ) : (
        <div className={styles.riskList}>
          {withVariance.map((session) => {
            const lines = session.lines.filter((l) => l.counted !== null && l.counted !== l.theoretical);
            return (
              <div key={session.id} className={styles.riskRow}>
                <div className={styles.riskInfo}>
                  <span className={styles.riskLabel}>{session.label}</span>
                  <span className={styles.riskMeta}>
                    {session.ref} · {lines.length} ligne(s) en écart
                  </span>
                </div>
                <Link href={`/app/stocks/inventaires/${session.id}`}>
                  <Badge tone="warning" withIcon={false}>
                    Voir
                  </Badge>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </DataPanel>
  );
}

/** Répartition du stock par entrepôt, avec saturation. */
function WarehouseDistribution() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Répartition par entrepôt</span>
      </div>
      {WAREHOUSES.map((w) => {
        const used = warehouseUsed(w.id);
        const ratio = w.capacity > 0 ? Math.round((used / w.capacity) * 100) : 0;
        const sat = warehouseSaturation(w.id);
        const tone = sat === 'critical' ? 'critical' : sat === 'warning' ? 'warning' : 'success';
        return (
          <div key={w.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
              <span className={styles.riskLabel}>{w.label}</span>
              <span className={styles.capacityValue}>
                {used} / {w.capacity}
              </span>
            </div>
            <ProgressBar value={ratio} tone={tone} thresholds={{ warning: 75, critical: 90 }} />
          </div>
        );
      })}
    </div>
  );
}

/** Écran complet de la vue d'ensemble. */
export function StockOverview() {
  return (
    <div className={styles.overview}>
      <DemoBanner />
      <StockOverviewCards />
      <div className={styles.split}>
        <RiskList />
        <DormantStockPanel />
      </div>
      <div className={styles.split}>
        <RecentMovements />
        <InventoryVariances />
      </div>
      <WarehouseDistribution />
      <p className={styles.panelHint}>
        {STOCK_PRODUCTS.length} produits suivis · seuils d'alerte et critique par produit.
      </p>
    </div>
  );
}
