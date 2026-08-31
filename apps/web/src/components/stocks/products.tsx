/**
 * DIVINI exo — Stocks · produits (LOT 07)
 *
 * Liste, fiche à onglets (informations, variantes, mouvements, fournisseurs,
 * historique), création / modification / duplication / archivage.
 *
 * Gouvernance (corpus l. 1838-1841) : la création est réservée au tenant central.
 * Pour un établissement (`scope.kind === 'site'`), l'action est affichée en
 * `permission denied` explicite — jamais masquée.
 *
 * Honnêteté : stock affiché = somme des mouvements (`stockOf`) ; formulaire et
 * upload de démonstration, aucune écriture réelle (phase backend) ; seuils avec
 * icône + libellé, jamais la couleur seule.
 */

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { DataTable, type DataColumnType, Timeline } from '../data';
import {
  Badge,
  Button,
  EmptyState,
  FileUpload,
  Icon,
  IconButton,
  Input,
  PermissionDenied,
  Select,
  SeverityIndicator
} from '../ui';
import { ConfirmDialog } from '../ui/Overlay';
import { FieldGroup } from '../ui/Field';
import { useToast } from '../ui/Toast';

import { useShellState } from '../../lib/shell-state';

import {
  STOCK_PRODUCTS,
  CATEGORIES,
  VARIANTS,
  findProduct,
  findCategory,
  categoryLabel,
  movementsOf,
  stockOf,
  stockLevel,
  STOCK_LEVEL_META,
  MOVEMENT_TYPE_LABELS,
  variantsOf,
  formatFcfa,
  canCreate,
  CREATE_PERMISSION,
  CREATE_CONTACT,
  type StockProduct
} from './mock';

import styles from './stocks.module.css';

/* --------------------------------- liste --------------------------------- */

function levelBadge(product: StockProduct) {
  const level = stockLevel(product);
  const meta = STOCK_LEVEL_META[level];
  return (
    <Badge tone={meta.tone} withIcon={false}>
      {meta.label}
    </Badge>
  );
}

const COLUMNS: DataColumnType<StockProduct>[] = [
  {
    id: 'label',
    header: 'Produit',
    width: '2 1 0',
    priority: 'high',
    sortable: true,
    sortValue: (p) => p.label,
    render: (p) => (
      <Link href={`/app/stocks/produits/${p.id}`} style={{ color: 'var(--text-primary)' }}>
        {p.label}
      </Link>
    ),
    value: (p) => p.label
  },
  {
    id: 'ref',
    header: 'Référence',
    width: '0 0 110px',
    mono: true,
    priority: 'normal',
    value: (p) => p.ref
  },
  {
    id: 'category',
    header: 'Catégorie',
    width: '1 1 0',
    priority: 'low',
    value: (p) => categoryLabel(p.categoryId)
  },
  {
    id: 'stock',
    header: 'Stock',
    width: '0 0 90px',
    mono: true,
    sortable: true,
    sortValue: (p) => stockOf(p.id),
    render: (p) => <span className={styles.mono}>{stockOf(p.id)}</span>
  },
  {
    id: 'level',
    header: 'État',
    width: '0 0 170px',
    priority: 'normal',
    render: (p) => levelBadge(p)
  },
  {
    id: 'price',
    header: 'Prix HT',
    width: '0 0 120px',
    mono: true,
    priority: 'low',
    sortable: true,
    sortValue: (p) => p.price,
    render: (p) => <span className={styles.mono}>{formatFcfa(p.price)}</span>
  }
];

export function ProductList() {
  const { scope } = useShellState();
  const { push } = useToast();
  const allowed = canCreate(scope.kind);

  return (
    <div className={styles.listWrap}>
      <div className={styles.detailHead}>
        <div>
          <h1 className={styles.detailTitle}>Produits</h1>
          <p className={styles.panelHint}>
            {STOCK_PRODUCTS.length} produits · stock dérivé des mouvements de démonstration.
          </p>
        </div>
        {allowed ? (
          <Link href="/app/stocks/produits/nouveau">
            <Button variant="primary" size="sm" onClick={() => undefined}>
              <Icon name="plus" size="var(--ctl-icon-sm)" /> Nouveau produit
            </Button>
          </Link>
        ) : (
          <Button
            variant="subtil"
            size="sm"
            onClick={() =>
              push({
                tone: 'warning',
                title: 'Création réservée au tenant central',
                description: `Droit manquant : ${CREATE_PERMISSION}.`
              })
            }
          >
            <Icon name="lock" size="var(--ctl-icon-sm)" /> Nouveau produit
          </Button>
        )}
      </div>

      <DataTable
        rows={STOCK_PRODUCTS}
        columns={COLUMNS}
        rowId={(p) => p.id}
        accessors={{ searchText: (p) => `${p.label} ${p.ref} ${categoryLabel(p.categoryId)}` }}
        statusOptions={[
          { id: 'ok', label: 'Stock sain' },
          { id: 'warning', label: 'Sous seuil' },
          { id: 'critical', label: 'Seuil critique' }
        ]}
        emptyTitle="Aucun produit"
        emptyDescription="Le catalogue de démonstration est vide pour ce filtre."
      />

      {!allowed ? (
        <PermissionDenied
          resource="créer ou modifier un produit"
          missingPermission={CREATE_PERMISSION}
          contact={CREATE_CONTACT}
        />
      ) : null}
    </div>
  );
}

/* ------------------------------ seuils (éditeur) ------------------------- */

function ThresholdEditor({ product }: { product: StockProduct }) {
  const [alert, setAlert] = useState(product.alertThreshold);
  const [critical, setCritical] = useState(product.criticalThreshold);
  const { push } = useToast();

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Seuils de réapprovisionnement</span>
      </div>
      <div className={styles.infoGrid}>
        <FieldGroup label="Seuil d'alerte (ATTENTION)">
          <Input
            type="number"
            min={0}
            value={alert}
            onChange={(e) => setAlert(Number(e.target.value))}
          />
        </FieldGroup>
        <FieldGroup label="Seuil critique (CRITIQUE)">
          <Input
            type="number"
            min={0}
            value={critical}
            onChange={(e) => setCritical(Number(e.target.value))}
          />
        </FieldGroup>
      </div>
      <p className={styles.panelHint}>
        Stock actuel : <span className={styles.mono}>{stockOf(product.id)}</span>. Les seuils
        déterminent le niveau sémantique affiché dans la liste et la vue d'ensemble.
      </p>
      <div className={styles.actions}>
        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            push({
              tone: 'success',
              title: 'Seuils mis à jour (démo)',
              description: `Alerte ${alert} · critique ${critical}. Aucune écriture réelle.`
            })
          }
        >
          Enregistrer les seuils
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------- variantes ------------------------------ */

function VariantEditor({ product }: { product: StockProduct }) {
  const variants = variantsOf(product.id);
  const { push } = useToast();

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Variantes</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            push({
              tone: 'info',
              title: 'Variante ajoutée (démo)',
              description: 'Aucune persistance réelle — phase backend.'
            })
          }
        >
          <Icon name="plus" size="var(--ctl-icon-sm)" /> Ajouter
        </Button>
      </div>
      {variants.length === 0 ? (
        <p className={styles.panelHint}>Aucune variante pour ce produit.</p>
      ) : (
        <div className={styles.variantList}>
          {variants.map((v) => (
            <div key={v.id} className={styles.variantRow}>
              <div>
                <div className={styles.variantLabel}>{v.label}</div>
                <div className={styles.variantAttr}>{v.attribute}</div>
              </div>
              <span className={styles.variantStock}>{v.stock}</span>
              <span className={styles.variantDelta}>
                {v.priceDelta === 0 ? '—' : `+${formatFcfa(v.priceDelta)}`}
              </span>
              <IconButton icon="trash" label="Supprimer la variante" onClick={() => push({ tone: 'info', title: 'Variante retirée (démo)' })} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------- images -------------------------------- */

function ImageUploader() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string | undefined>();
  const { push } = useToast();

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Images</span>
      </div>
      <div className={styles.imageGrid}>
        <div className={styles.imageTile}>
          <Icon name="file" size="var(--ctl-icon-lg)" />
        </div>
      </div>
      <FileUpload
        accept="image/*"
        status={status}
        fileName={fileName}
        onFiles={(files) => {
          const file = files[0];
          if (!file) return;
          if (!file.type.startsWith('image/')) {
            setStatus('error');
            push({ tone: 'critical', title: 'Format non supporté', description: 'Images uniquement.' });
            return;
          }
          setFileName(file.name);
          setStatus('uploading');
          // Progression simulée localement et signalée (§8) — jamais de boucle.
          window.setTimeout(() => {
            setStatus('success');
            push({ tone: 'success', title: 'Image ajoutée (démo)', description: 'Aucun stockage réel.' });
          }, 700);
        }}
      />
      <p className={styles.uploadStatus}>
        {status === 'idle' && 'Glissez-déposez une image, ou parcourez. Démonstration : aucun stockage réel.'}
        {status === 'uploading' && 'Téléversement en cours (simulé localement)…'}
        {status === 'success' && 'Image prête (démonstration).'}
        {status === 'error' && 'Format non supporté — images uniquement.'}
      </p>
    </div>
  );
}

/* ------------------------------ fiche produit ---------------------------- */

type TabId = 'infos' | 'variantes' | 'mouvements' | 'fournisseurs' | 'historique';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'infos', label: 'Informations' },
  { id: 'variantes', label: 'Variantes' },
  { id: 'mouvements', label: 'Mouvements' },
  { id: 'fournisseurs', label: 'Fournisseurs' },
  { id: 'historique', label: 'Historique' }
];

export function ProductDetail({ id }: { id: string }) {
  const product = findProduct(id);
  const [tab, setTab] = useState<TabId>('infos');
  const [confirmArchive, setConfirmArchive] = useState(false);
  const { push } = useToast();

  if (!product) {
    return (
      <EmptyState
        title="Produit introuvable"
        description="Cette référence n'existe pas dans le catalogue de démonstration."
        icon="package"
        action={{ label: 'Retour aux produits', onClick: () => undefined }}
      />
    );
  }

  const level = stockLevel(product);
  const meta = STOCK_LEVEL_META[level];
  const movements = movementsOf(product.id);

  return (
    <div className={styles.listWrap}>
      <div className={styles.detailHead}>
        <div>
          <div className={styles.detailRef}>{product.ref}</div>
          <h1 className={styles.detailTitle}>{product.label}</h1>
          <div className={styles.detailMeta}>
            <span>{categoryLabel(product.categoryId)}</span>
            <span>·</span>
            <span>Stock : <span className={styles.mono}>{stockOf(product.id)}</span></span>
            <SeverityIndicator tone={meta.tone} label={meta.label} level={level === 'critical' ? 4 : level === 'warning' ? 2 : 1} />
          </div>
        </div>
        <div className={styles.actions}>
          <Link href={`/app/stocks/produits/${product.id}/modifier`}>
            <Button variant="subtil" size="sm" onClick={() => undefined}>Modifier</Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => push({ tone: 'info', title: 'Produit dupliqué (démo)', description: 'Aucune écriture réelle.' })}
          >
            Dupliquer
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmArchive(true)}>
            Archiver
          </Button>
        </div>
      </div>

      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={styles.tab}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'infos' ? (
        <div className={styles.productGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>Informations</span>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Référence</span>
                <span className={`${styles.infoValue} ${styles.infoValueMono}`}>{product.ref}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Prix HT</span>
                <span className={`${styles.infoValue} ${styles.infoValueMono}`}>{formatFcfa(product.price)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>TVA</span>
                <span className={styles.infoValue}>{product.tva} %</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Catégorie</span>
                <span className={styles.infoValue}>{categoryLabel(product.categoryId)}</span>
              </div>
            </div>
          </div>
          <ThresholdEditor product={product} />
        </div>
      ) : null}

      {tab === 'variantes' ? <VariantEditor product={product} /> : null}

      {tab === 'mouvements' ? (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Mouvements</span>
            <span className={styles.panelHint}>Somme = {stockOf(product.id)}</span>
          </div>
          <Timeline
            items={movements.map((m) => ({
              date: m.date,
              actor: m.actor,
              title: `${MOVEMENT_TYPE_LABELS[m.type]} · ${m.delta >= 0 ? '+' : ''}${m.delta}`,
              result: m.reason,
              tone: m.type === 'sortie' ? 'warning' : m.type === 'correction' ? 'info' : 'success'
            }))}
          />
        </div>
      ) : null}

      {tab === 'fournisseurs' ? (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Fournisseurs</span>
          </div>
          <p className={styles.panelHint}>
            Fournisseur de démonstration rattaché. La gestion complète des fournisseurs et
            commandes d'achat arrive au LOT 11.
          </p>
          <div className={styles.riskRow}>
            <div className={styles.riskInfo}>
              <span className={styles.riskLabel}>Approvisionnement principal</span>
              <span className={styles.riskMeta}>Fournisseur fictif · délai 5 j</span>
            </div>
            <Badge tone="neutral" withIcon={false}>LOT 11</Badge>
          </div>
        </div>
      ) : null}

      {tab === 'historique' ? (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Historique</span>
            <span className={styles.panelHint}>Journal de démonstration</span>
          </div>
          <Timeline
            items={[
              { date: movements[0]?.date ?? '', actor: 'Système', title: 'Produit créé', result: 'Catalogue de démonstration', tone: 'info' },
              ...movements.slice(0, 3).map((m) => ({
                date: m.date,
                actor: m.actor,
                title: MOVEMENT_TYPE_LABELS[m.type],
                result: m.reason,
                tone: 'success' as const
              }))
            ]}
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmArchive}
        onCancel={() => setConfirmArchive(false)}
        title="Archiver ce produit ?"
        description="Le produit sera retiré du catalogue actif. Les mouvements passés restent consultables. Action de démonstration, aucune écriture réelle."
        confirmLabel="Archiver le produit"
        destructive
        onConfirm={() => {
          setConfirmArchive(false);
          push({ tone: 'success', title: 'Produit archivé (démo)', description: 'Aucune écriture réelle.' });
        }}
      />
    </div>
  );
}

/* ------------------------------ formulaire ------------------------------- */

export function ProductForm({ mode }: { mode: 'create' | 'edit' }) {
  const { scope } = useShellState();
  const { push } = useToast();
  const allowed = canCreate(scope.kind);

  const [label, setLabel] = useState('');
  const [ref, setRef] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState(CATEGORIES[0]?.id ?? '');
  const [touched, setTouched] = useState(false);

  const labelError = touched && label.trim().length === 0 ? 'Le libellé est obligatoire.' : undefined;
  const priceError =
    touched && (price === '' || Number(price) <= 0) ? 'Un prix HT positif est obligatoire.' : undefined;

  const categoryOptions = useMemo(
    () => CATEGORIES.map((c) => ({ value: c.id, label: c.parentId ? `  ${c.label}` : c.label })),
    []
  );

  if (mode === 'create' && !allowed) {
    return (
      <PermissionDenied
        resource="créer un produit"
        missingPermission={CREATE_PERMISSION}
        contact={CREATE_CONTACT}
      />
    );
  }

  return (
    <div className={styles.listWrap}>
      <div className={styles.detailHead}>
        <h1 className={styles.detailTitle}>
          {mode === 'create' ? 'Nouveau produit' : 'Modifier le produit'}
        </h1>
      </div>

      <form
        className={styles.panel}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (label.trim().length === 0 || price === '' || Number(price) <= 0) return;
          push({
            tone: 'success',
            title: mode === 'create' ? 'Produit créé (démo)' : 'Produit enregistré (démo)',
            description: 'Aucune écriture réelle — phase backend.'
          });
        }}
      >
        <div className={styles.infoGrid}>
          <FieldGroup label="Libellé" required error={labelError}>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} invalid={!!labelError} />
          </FieldGroup>
          <FieldGroup label="Référence">
            <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="auto si vide" />
          </FieldGroup>
          <FieldGroup label="Prix HT (FCFA)" required error={priceError}>
            <Input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              invalid={!!priceError}
            />
          </FieldGroup>
          <FieldGroup label="Catégorie">
            <Select options={categoryOptions} value={categoryId} onChange={setCategoryId} />
          </FieldGroup>
        </div>
        <div className={styles.actions}>
          <Button type="submit" variant="primary" size="sm" onClick={() => undefined}>
            {mode === 'create' ? 'Créer le produit' : 'Enregistrer'}
          </Button>
          <Link href="/app/stocks/produits">
            <Button type="button" variant="ghost" size="sm" onClick={() => undefined}>Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
