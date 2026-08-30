/**
 * DIVINI exo — Stocks · modèle de données de démonstration (LOT 07)
 *
 * FRONTEND ONLY. Données mockées, signalées comme telles.
 *
 * Règle de cohérence (§10, §13) : le stock affiché d'un produit EST la somme
 * algébrique de ses mouvements de démonstration. `stockOf` est la source de
 * vérité ; un test assertit `stockOf(p) === PRODUCTS[LOT06].stock` pour les 8
 * produits du catalogue partagé. Aucun stock figé divergent.
 *
 * Gouvernance (corpus l. 1838-1841, 4446) : la création de produits et de
 * catégories est réservée au tenant central (`scope.kind === 'tenant'`). Un
 * établissement (`site`) voit ces actions en `permission denied` — jamais
 * masquées. C'est l'interface qui le rend lisible, pas une simple déclaration.
 *
 * Suggestion de catégories : génération LOCALE par lexique (`suggestCategories`).
 * Aucun appel d'IA réel, aucun service externe (interdit §11). Présentée comme
 * assistance de démonstration ; rien n'est créé sans validation explicite.
 */

import { PRODUCTS, formatFcfa } from '../sales/mock';
import type { Product } from '../sales/mock';

export { PRODUCTS, formatFcfa };
export type { Product };

/* --------------------------------- seuils --------------------------------- */

export type StockLevel = 'ok' | 'warning' | 'critical';

/** Métadonnées de stock greffées sur le produit du catalogue partagé. */
export type StockProduct = Product & {
  categoryId: string;
  warehouseId: string;
  /** Seuil d'alerte (ATTENTION). */
  alertThreshold: number;
  /** Seuil critique (CRITIQUE / rupture). */
  criticalThreshold: number;
  archived?: boolean;
};

/**
 * Catalogue de stock : mêmes références et prix que le LOT 06, enrichi des
 * seuils, catégorie et entrepôt. Le `stock` du LOT 06 reste la valeur cible que
 * les mouvements doivent reconstituer (vérifié par test).
 */
export const STOCK_PRODUCTS: StockProduct[] = [
  { ...PRODUCTS[0]!, categoryId: 'cat-01a', warehouseId: 'wh-01', alertThreshold: 10, criticalThreshold: 5 },
  { ...PRODUCTS[1]!, categoryId: 'cat-01b', warehouseId: 'wh-01', alertThreshold: 12, criticalThreshold: 6 },
  { ...PRODUCTS[2]!, categoryId: 'cat-02a', warehouseId: 'wh-01', alertThreshold: 12, criticalThreshold: 5 },
  { ...PRODUCTS[3]!, categoryId: 'cat-03b', warehouseId: 'wh-01', alertThreshold: 10, criticalThreshold: 5 },
  { ...PRODUCTS[4]!, categoryId: 'cat-03a', warehouseId: 'wh-02', alertThreshold: 10, criticalThreshold: 5 },
  { ...PRODUCTS[5]!, categoryId: 'cat-02b', warehouseId: 'wh-02', alertThreshold: 20, criticalThreshold: 10 },
  { ...PRODUCTS[6]!, categoryId: 'cat-02b', warehouseId: 'wh-02', alertThreshold: 10, criticalThreshold: 5 },
  { ...PRODUCTS[7]!, categoryId: 'cat-01b', warehouseId: 'wh-02', alertThreshold: 15, criticalThreshold: 8 }
];

export function findProduct(id: string): StockProduct | undefined {
  return STOCK_PRODUCTS.find((p) => p.id === id);
}

/* ------------------------------- mouvements ------------------------------- */

export type MovementType = 'entree' | 'sortie' | 'correction' | 'transfert';

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  entree: 'Entrée',
  sortie: 'Sortie',
  correction: 'Correction',
  transfert: 'Transfert'
};

export type Movement = {
  id: string;
  ref: string;
  productId: string;
  warehouseId: string;
  type: MovementType;
  /** Quantité algébrique : la somme par produit reconstitue le stock. */
  delta: number;
  /** Motif — obligatoire ; un mouvement sans motif est refusé côté interface. */
  reason: string;
  actor: string;
  date: string;
  /** Justificatif (référence de document), le cas échéant. */
  justification?: string;
};

const M = (day: number, h = 9) => new Date(Date.UTC(2026, 7, day, h, 0, 0)).toISOString();

/**
 * Mouvements de démonstration. La somme des `delta` par produit reconstitue
 * exactement le stock du catalogue LOT 06 :
 *   prd-01 +50 −8 −5 +5 = 42 · prd-02 +40 −10 = 30 · prd-03 +30 −25 +3 = 8
 *   prd-04 +20 −5 = 15 · prd-05 +25 −25 = 0 · prd-06 +70 −10 = 60
 *   prd-07 +30 −8 = 22 · prd-08 +40 −5 = 35
 */
export const MOVEMENTS: Movement[] = [
  { id: 'mv-001', ref: 'MVT-2026-0001', productId: 'prd-01', warehouseId: 'wh-01', type: 'entree', delta: 50, reason: 'Réception fournisseur', actor: 'A. Diallo', date: M(2), justification: 'BR-2026-114' },
  { id: 'mv-002', ref: 'MVT-2026-0002', productId: 'prd-01', warehouseId: 'wh-01', type: 'sortie', delta: -8, reason: 'Vente comptoir', actor: 'M. Sow', date: M(12) },
  { id: 'mv-003', ref: 'MVT-2026-0003', productId: 'prd-01', warehouseId: 'wh-01', type: 'transfert', delta: -5, reason: 'Transfert vers Dépôt Est', actor: 'A. Diallo', date: M(20) },
  { id: 'mv-004', ref: 'MVT-2026-0004', productId: 'prd-01', warehouseId: 'wh-01', type: 'transfert', delta: 5, reason: 'Retour transfert Dépôt Est', actor: 'A. Diallo', date: M(21) },

  { id: 'mv-005', ref: 'MVT-2026-0005', productId: 'prd-02', warehouseId: 'wh-01', type: 'entree', delta: 40, reason: 'Réception fournisseur', actor: 'A. Diallo', date: M(3), justification: 'BR-2026-118' },
  { id: 'mv-006', ref: 'MVT-2026-0006', productId: 'prd-02', warehouseId: 'wh-01', type: 'sortie', delta: -10, reason: 'Vente comptoir', actor: 'M. Sow', date: M(14) },

  { id: 'mv-007', ref: 'MVT-2026-0007', productId: 'prd-03', warehouseId: 'wh-01', type: 'entree', delta: 30, reason: 'Réception fournisseur', actor: 'A. Diallo', date: M(4) },
  { id: 'mv-008', ref: 'MVT-2026-0008', productId: 'prd-03', warehouseId: 'wh-01', type: 'sortie', delta: -25, reason: 'Vente comptoir', actor: 'M. Sow', date: M(18) },
  { id: 'mv-009', ref: 'MVT-2026-0009', productId: 'prd-03', warehouseId: 'wh-01', type: 'correction', delta: 3, reason: 'Régularisation inventaire', actor: 'A. Diallo', date: M(22), justification: 'INV-2026-002' },

  { id: 'mv-010', ref: 'MVT-2026-0010', productId: 'prd-04', warehouseId: 'wh-01', type: 'entree', delta: 20, reason: 'Réception fournisseur', actor: 'A. Diallo', date: M(5) },
  { id: 'mv-011', ref: 'MVT-2026-0011', productId: 'prd-04', warehouseId: 'wh-01', type: 'sortie', delta: -5, reason: 'Vente comptoir', actor: 'M. Sow', date: M(16) },

  { id: 'mv-012', ref: 'MVT-2026-0012', productId: 'prd-05', warehouseId: 'wh-02', type: 'entree', delta: 25, reason: 'Réception fournisseur', actor: 'K. Ndiaye', date: M(6) },
  { id: 'mv-013', ref: 'MVT-2026-0013', productId: 'prd-05', warehouseId: 'wh-02', type: 'sortie', delta: -25, reason: 'Vente comptoir', actor: 'K. Ndiaye', date: M(19) },

  { id: 'mv-014', ref: 'MVT-2026-0014', productId: 'prd-06', warehouseId: 'wh-02', type: 'entree', delta: 70, reason: 'Réception fournisseur', actor: 'K. Ndiaye', date: M(7) },
  { id: 'mv-015', ref: 'MVT-2026-0015', productId: 'prd-06', warehouseId: 'wh-02', type: 'sortie', delta: -10, reason: 'Vente comptoir', actor: 'K. Ndiaye', date: M(15) },

  { id: 'mv-016', ref: 'MVT-2026-0016', productId: 'prd-07', warehouseId: 'wh-02', type: 'entree', delta: 30, reason: 'Réception fournisseur', actor: 'K. Ndiaye', date: M(1) },
  { id: 'mv-017', ref: 'MVT-2026-0017', productId: 'prd-07', warehouseId: 'wh-02', type: 'sortie', delta: -8, reason: 'Vente comptoir', actor: 'K. Ndiaye', date: M(8) },

  { id: 'mv-018', ref: 'MVT-2026-0018', productId: 'prd-08', warehouseId: 'wh-02', type: 'entree', delta: 40, reason: 'Réception fournisseur', actor: 'K. Ndiaye', date: M(9) },
  { id: 'mv-019', ref: 'MVT-2026-0019', productId: 'prd-08', warehouseId: 'wh-02', type: 'sortie', delta: -5, reason: 'Vente comptoir', actor: 'K. Ndiaye', date: M(17) }
];

export function movementsOf(productId: string): Movement[] {
  return MOVEMENTS.filter((m) => m.productId === productId);
}

/** Source de vérité : stock = somme algébrique des mouvements. */
export function stockOf(productId: string): number {
  return movementsOf(productId).reduce((sum, m) => sum + m.delta, 0);
}

export function findMovement(id: string): Movement | undefined {
  return MOVEMENTS.find((m) => m.id === id);
}

/* --------------------------------- seuils --------------------------------- */

/** Niveau sémantique d'un produit au vu de son stock courant. */
export function stockLevel(product: StockProduct): StockLevel {
  const qty = stockOf(product.id);
  if (qty <= product.criticalThreshold) return 'critical';
  if (qty <= product.alertThreshold) return 'warning';
  return 'ok';
}

export const STOCK_LEVEL_META: Record<StockLevel, { label: string; tone: 'success' | 'warning' | 'critical' }> = {
  ok: { label: 'Stock sain', tone: 'success' },
  warning: { label: 'Sous seuil d’alerte', tone: 'warning' },
  critical: { label: 'Seuil critique', tone: 'critical' }
};

/** Produits sous seuil (alerte ou critique), triés par gravité puis quantité. */
export function atRiskProducts(): StockProduct[] {
  return STOCK_PRODUCTS.filter((p) => stockLevel(p) !== 'ok').sort((a, b) => {
    const rank = { critical: 0, warning: 1, ok: 2 } as const;
    const d = rank[stockLevel(a)] - rank[stockLevel(b)];
    return d !== 0 ? d : stockOf(a.id) - stockOf(b.id);
  });
}

/** Valorisation du stock (somme des quantités × prix HT), en FCFA. */
export function stockValuation(): number {
  return STOCK_PRODUCTS.reduce((sum, p) => sum + stockOf(p.id) * p.price, 0);
}

/* --------------------------- stock dormant ------------------------------- */

/** Référence « aujourd'hui » de démonstration (cohérente avec les mouvements). */
export const STOCK_TODAY = new Date(Date.UTC(2026, 7, 28)).toISOString();

/** Nombre de jours sans mouvement au-delà duquel un produit est dormant. */
export const DORMANT_DAYS = 60;

export function daysSince(iso: string): number {
  return Math.floor((Date.parse(STOCK_TODAY) - Date.parse(iso)) / 86_400_000);
}

/** Dernier mouvement d'un produit, ou null. */
export function lastMovement(productId: string): Movement | null {
  const ms = movementsOf(productId);
  if (ms.length === 0) return null;
  return ms.reduce((latest, m) => (m.date > latest.date ? m : latest));
}

/** Produits dormants : du stock, mais aucun mouvement récent. */
export function dormantProducts(): StockProduct[] {
  return STOCK_PRODUCTS.filter((p) => {
    if (stockOf(p.id) <= 0) return false;
    const last = lastMovement(p.id);
    return last === null || daysSince(last.date) >= DORMANT_DAYS;
  });
}

/* ------------------------------ catégories ------------------------------- */

export type Category = {
  id: string;
  label: string;
  parentId: string | null;
};

export const CATEGORIES: Category[] = [
  { id: 'cat-01', label: 'Boissons chaudes', parentId: null },
  { id: 'cat-01a', label: 'Café', parentId: 'cat-01' },
  { id: 'cat-01b', label: 'Thé & infusions', parentId: 'cat-01' },
  { id: 'cat-02', label: 'Épicerie sèche', parentId: null },
  { id: 'cat-02a', label: 'Sucres & édulcorants', parentId: 'cat-02' },
  { id: 'cat-02b', label: 'Céréales & graines', parentId: 'cat-02' },
  { id: 'cat-03', label: 'Produits locaux', parentId: null },
  { id: 'cat-03a', label: 'Bissap & hibiscus', parentId: 'cat-03' },
  { id: 'cat-03b', label: 'Miel & confitures', parentId: 'cat-03' }
];

export function findCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function categoryLabel(id: string): string {
  return findCategory(id)?.label ?? 'Sans catégorie';
}

export function childrenOf(parentId: string | null): Category[] {
  return CATEGORIES.filter((c) => c.parentId === parentId);
}

/**
 * Suggestion de catégories — génération LOCALE par lexique.
 *
 * Aucun modèle d'IA, aucun appel réseau : une table de correspondance
 * mots-clés → libellés, plus un repli déterministe. Présentée dans l'interface
 * comme une assistance de démonstration ; l'utilisateur supprime, modifie,
 * valide. Rien n'est créé sans validation explicite (interdit §11).
 */
const CATEGORY_LEXICON: Array<[RegExp, string]> = [
  [/caf|torr|espresso/i, 'Café & torréfaction'],
  [/thé|the\b|infus|tisane/i, 'Thés & infusions'],
  [/sucr|édulcor|miel|confiture/i, 'Sucres, miels & confitures'],
  [/céréale|graine|arachide|noix|légumineuse/i, 'Céréales, graines & oléagineux'],
  [/bissap|hibiscus|local|terroir/i, 'Produits locaux & terroir'],
  [/chocolat|cacao|confiserie/i, 'Chocolaterie & confiserie'],
  [/bio|nature|organic/i, 'Produits bio & naturels'],
  [/boisson|jus|sirop/i, 'Boissons & sirops']
];

/** Dé-duplique en préservant l'ordre, insensible à la casse. */
function uniq(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(v);
    }
  }
  return out;
}

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * À partir de mots-clés saisis, propose une liste de catégories.
 * Retourne `[]` si aucun mot-clé exploitable — l'interface affiche alors
 * l'état « suggestion vide », jamais une liste inventée.
 */
export function suggestCategories(keywords: string): string[] {
  const tokens = keywords
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) return [];

  const matched: string[] = [];
  for (const token of tokens) {
    for (const [pattern, label] of CATEGORY_LEXICON) {
      if (pattern.test(token)) matched.push(label);
    }
  }
  // Repli déterministe : un mot-clé non reconnu devient une catégorie éponyme.
  const fallback = tokens.filter((t) => t.length > 2).map((t) => titleCase(t));
  return uniq([...matched, ...fallback]);
}

/* ------------------------------ entrepôts -------------------------------- */

export type Warehouse = {
  id: string;
  label: string;
  /** Établissement de rattachement (libellé de démonstration). */
  establishment: string;
  capacity: number;
  /** Emplacements (allées / zones). */
  locations: string[];
};

export const WAREHOUSES: Warehouse[] = [
  { id: 'wh-01', label: 'Entrepôt central', establishment: 'Siège', capacity: 200, locations: ['A1', 'A2', 'B1', 'B2'] },
  { id: 'wh-02', label: 'Dépôt Est', establishment: 'Dépôt Est', capacity: 120, locations: ['Z1', 'Z2'] }
];

export function findWarehouse(id: string): Warehouse | undefined {
  return WAREHOUSES.find((w) => w.id === id);
}

/** Quantité totale présente dans un entrepôt. */
export function warehouseUsed(warehouseId: string): number {
  return STOCK_PRODUCTS.filter((p) => p.warehouseId === warehouseId).reduce(
    (sum, p) => sum + Math.max(0, stockOf(p.id)),
    0
  );
}

export type Saturation = 'ok' | 'warning' | 'critical';

/** Saturation d'un entrepôt : ≥ 90 % critique, ≥ 75 % attention. */
export function warehouseSaturation(warehouseId: string): Saturation {
  const w = findWarehouse(warehouseId);
  if (!w || w.capacity <= 0) return 'ok';
  const ratio = warehouseUsed(warehouseId) / w.capacity;
  if (ratio >= 0.9) return 'critical';
  if (ratio >= 0.75) return 'warning';
  return 'ok';
}

/* ------------------------------ inventaires ------------------------------ */

export type InventoryStatus = 'en_cours' | 'validee';

export const INVENTORY_STATUS_META: Record<InventoryStatus, { label: string; tone: 'info' | 'success' }> = {
  en_cours: { label: 'En cours', tone: 'info' },
  validee: { label: 'Validée', tone: 'success' }
};

export type InventoryLine = {
  productId: string;
  /** Quantité théorique (stock système au lancement). */
  theoretical: number;
  /** Quantité comptée ; `null` = pas encore comptée (comptage partiel). */
  counted: number | null;
};

export type InventorySession = {
  id: string;
  ref: string;
  label: string;
  warehouseId: string;
  status: InventoryStatus;
  date: string;
  lines: InventoryLine[];
};

export const INVENTORIES: InventorySession[] = [
  {
    id: 'inv-001',
    ref: 'INV-2026-001',
    label: 'Inventaire tournant — Entrepôt central',
    warehouseId: 'wh-01',
    status: 'validee',
    date: M(22, 14),
    lines: [
      { productId: 'prd-01', theoretical: 42, counted: 42 },
      { productId: 'prd-02', theoretical: 30, counted: 29 },
      { productId: 'prd-03', theoretical: 5, counted: 8 },
      { productId: 'prd-04', theoretical: 15, counted: 15 }
    ]
  },
  {
    id: 'inv-002',
    ref: 'INV-2026-002',
    label: 'Inventaire annuel — Dépôt Est',
    warehouseId: 'wh-02',
    status: 'en_cours',
    date: M(26, 8),
    lines: [
      { productId: 'prd-05', theoretical: 0, counted: 0 },
      { productId: 'prd-06', theoretical: 60, counted: 58 },
      { productId: 'prd-07', theoretical: 22, counted: null },
      { productId: 'prd-08', theoretical: 35, counted: null }
    ]
  }
];

export function findInventory(id: string): InventorySession | undefined {
  return INVENTORIES.find((i) => i.id === id);
}

/** Écart d'une ligne : compté − théorique (0 si non comptée). */
export function lineVariance(line: InventoryLine): number {
  if (line.counted === null) return 0;
  return line.counted - line.theoretical;
}

/** Une session présente-t-elle au moins un écart non nul ? */
export function hasVariance(session: InventorySession): boolean {
  return session.lines.some((l) => lineVariance(l) !== 0);
}

/** Progression du comptage : lignes comptées / total. */
export function countProgress(session: InventorySession): { counted: number; total: number } {
  const counted = session.lines.filter((l) => l.counted !== null).length;
  return { counted, total: session.lines.length };
}

/* ------------------------------- variantes ------------------------------- */

export type Variant = {
  id: string;
  productId: string;
  /** Axe de déclinaison : taille, couleur, modèle… */
  attribute: string;
  label: string;
  /** Stock propre à la variante (démonstration). */
  stock: number;
  priceDelta: number;
};

export const VARIANTS: Variant[] = [
  { id: 'var-01', productId: 'prd-01', attribute: 'Format', label: '250 g', stock: 30, priceDelta: 0 },
  { id: 'var-02', productId: 'prd-01', attribute: 'Format', label: '500 g', stock: 12, priceDelta: 2200 },
  { id: 'var-03', productId: 'prd-07', attribute: 'Teneur', label: '70 %', stock: 14, priceDelta: 0 },
  { id: 'var-04', productId: 'prd-07', attribute: 'Teneur', label: '85 %', stock: 8, priceDelta: 400 }
];

export function variantsOf(productId: string): Variant[] {
  return VARIANTS.filter((v) => v.productId === productId);
}

/* ------------------------------- gouvernance ----------------------------- */

/**
 * Droit de création (produits, catégories) réservé au tenant central.
 * Un établissement (`site`) reçoit `false` → l'interface affiche un état
 * `permission denied` explicite, jamais une action masquée.
 */
export function canCreate(scopeKind: 'tenant' | 'site'): boolean {
  return scopeKind === 'tenant';
}

export const CREATE_PERMISSION = 'inventory.product.create';
export const CREATE_CONTACT = 'administrateur du tenant central';
