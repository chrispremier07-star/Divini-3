/**
 * DIVINI exo — Stocks · inventaires (LOT 07)
 *
 * Campagne d'inventaire : saisie comptée vs théorique, écart immédiatement
 * visible, validation confirmée, historique. Utilisable debout sur tablette :
 * cibles larges, mode carte par article sous 720 px, aucun survol requis.
 *
 * Honnêteté : données de démonstration ; écart en badge sémantique, jamais un
 * simple chiffre coloré ; validation sans écriture réelle (phase backend).
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Badge, Button, EmptyState, Icon, Input } from '../ui';
import { ConfirmDialog } from '../ui/Overlay';
import { useToast } from '../ui/Toast';

import {
  INVENTORIES,
  findInventory,
  findProduct,
  findWarehouse,
  lineVariance,
  hasVariance,
  countProgress,
  INVENTORY_STATUS_META,
  type InventoryLine,
  type InventorySession
} from './mock';

import styles from './stocks.module.css';

/** Badge d'écart sémantique (jamais un simple chiffre coloré). */
function VarianceBadge({ line }: { line: InventoryLine }) {
  if (line.counted === null) {
    return (
      <Badge tone="neutral" withIcon={false}>
        Non comptée
      </Badge>
    );
  }
  const variance = lineVariance(line);
  if (variance === 0) {
    return (
      <Badge tone="success" withIcon={false}>
        Conforme
      </Badge>
    );
  }
  const tone = variance < 0 ? 'critical' : 'warning';
  return (
    <Badge tone={tone} withIcon={false}>
      Écart {variance > 0 ? '+' : ''}
      {variance}
    </Badge>
  );
}

/* --------------------------------- liste --------------------------------- */

export function InventoryList() {
  return (
    <div className={styles.listWrap}>
      <div className={styles.detailHead}>
        <div>
          <h1 className={styles.detailTitle}>Inventaires</h1>
          <p className={styles.panelHint}>
            {INVENTORIES.length} campagne(s) de démonstration · compté vs théorique, écart, validation.
          </p>
        </div>
      </div>

      <div className={styles.riskList}>
        {INVENTORIES.map((session) => {
          const status = INVENTORY_STATUS_META[session.status];
          const progress = countProgress(session);
          const warehouse = findWarehouse(session.warehouseId);
          return (
            <div key={session.id} className={styles.riskRow}>
              <div className={styles.riskInfo}>
                <span className={styles.riskLabel}>
                  <Link href={`/app/stocks/inventaires/${session.id}`} style={{ color: 'var(--text-primary)' }}>
                    {session.label}
                  </Link>
                </span>
                <span className={styles.riskMeta}>
                  {session.ref} · {warehouse?.label} · {progress.counted}/{progress.total} comptées
                  {hasVariance(session) ? ' · écart détecté' : ''}
                </span>
              </div>
              <Badge tone={status.tone} withIcon={false}>
                {status.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ table de comptage ------------------------ */

function CountTable({
  session,
  counts,
  onCount
}: {
  session: InventorySession;
  counts: Record<string, number | null>;
  onCount: (productId: string, value: number | null) => void;
}) {
  return (
    <>
      {/* Desktop / tablette : table comptée / théorique / écart. */}
      <div className={styles.countTableWrap}>
        <table className={styles.countTable}>
          <thead>
            <tr>
              <th>Article</th>
              <th>Théorique</th>
              <th>Comptée</th>
              <th>Écart</th>
            </tr>
          </thead>
          <tbody>
            {session.lines.map((line) => {
              const product = findProduct(line.productId);
              const counted = counts[line.productId] ?? line.counted;
              const effective: InventoryLine = { ...line, counted };
              return (
                <tr key={line.productId}>
                  <td>
                    {product?.label ?? line.productId}
                    <div className={styles.riskMeta}>{product?.ref}</div>
                  </td>
                  <td className={styles.countNum}>{line.theoretical}</td>
                  <td>
                    <Input
                      type="number"
                      min={0}
                      className={styles.countInput}
                      value={counted ?? ''}
                      onChange={(e) =>
                        onCount(line.productId, e.target.value === '' ? null : Number(e.target.value))
                      }
                    />
                  </td>
                  <td>
                    <VarianceBadge line={effective} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile : mode carte par article, cibles larges. */}
      <div className={styles.countCards}>
        {session.lines.map((line) => {
          const product = findProduct(line.productId);
          const counted = counts[line.productId] ?? line.counted;
          const effective: InventoryLine = { ...line, counted };
          return (
            <div key={line.productId} className={styles.countCard}>
              <div>
                <div className={styles.variantLabel}>{product?.label ?? line.productId}</div>
                <div className={styles.riskMeta}>{product?.ref}</div>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Théorique</span>
                  <span className={`${styles.infoValue} ${styles.mono}`}>{line.theoretical}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Comptée</span>
                  <Input
                    type="number"
                    min={0}
                    value={counted ?? ''}
                    onChange={(e) =>
                      onCount(line.productId, e.target.value === '' ? null : Number(e.target.value))
                    }
                  />
                </div>
              </div>
              <VarianceBadge line={effective} />
            </div>
          );
        })}
      </div>
    </>
  );
}

/* -------------------------------- détail --------------------------------- */

export function InventoryDetail({ id }: { id: string }) {
  const session = findInventory(id);
  const { push } = useToast();
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [confirmValidate, setConfirmValidate] = useState(false);

  if (!session) {
    return (
      <EmptyState
        title="Inventaire introuvable"
        description="Cette campagne n'existe pas dans les données de démonstration."
        icon="package"
      />
    );
  }

  const warehouse = findWarehouse(session.warehouseId);
  const status = INVENTORY_STATUS_META[session.status];
  const validated = session.status === 'validee';

  function onCount(productId: string, value: number | null) {
    setCounts((prev) => ({ ...prev, [productId]: value }));
  }

  // Écart global après saisie locale.
  const totalVariance = session.lines.reduce((sum, line) => {
    const counted = counts[line.productId] ?? line.counted;
    if (counted === null) return sum;
    return sum + (counted - line.theoretical);
  }, 0);

  return (
    <div className={styles.listWrap}>
      <div className={styles.detailHead}>
        <div>
          <div className={styles.detailRef}>{session.ref}</div>
          <h1 className={styles.detailTitle}>{session.label}</h1>
          <div className={styles.detailMeta}>
            <span>{warehouse?.label}</span>
            <span>·</span>
            <span>{new Date(session.date).toLocaleString('fr-FR')}</span>
            <Badge tone={status.tone} withIcon={false}>
              {status.label}
            </Badge>
          </div>
        </div>
        {!validated ? (
          <Button variant="primary" size="sm" onClick={() => setConfirmValidate(true)}>
            <Icon name="check" size="var(--ctl-icon-sm)" /> Valider l'inventaire
          </Button>
        ) : null}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Comptage</span>
          <span className={styles.panelHint}>
            Écart total : <span className={styles.mono}>{totalVariance >= 0 ? '+' : ''}{totalVariance}</span>
          </span>
        </div>
        <CountTable session={session} counts={counts} onCount={onCount} />
      </div>

      {validated ? (
        <p className={styles.panelHint}>
          Session validée — historique figé. Les écarts constatés sont conservés à titre de
          démonstration ; aucune écriture comptable réelle.
        </p>
      ) : null}

      <ConfirmDialog
        open={confirmValidate}
        onCancel={() => setConfirmValidate(false)}
        title="Valider cet inventaire ?"
        description="Le comptage sera figé et les écarts enregistrés comme historique. Action de démonstration, aucune écriture réelle."
        confirmLabel="Valider l'inventaire"
        onConfirm={() => {
          setConfirmValidate(false);
          push({
            tone: 'success',
            title: 'Inventaire validé (démo)',
            description: `Écart total ${totalVariance >= 0 ? '+' : ''}${totalVariance}. Aucune écriture réelle.`
          });
        }}
      />
    </div>
  );
}
