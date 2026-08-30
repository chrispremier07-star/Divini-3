/**
 * DIVINI exo — Ventes & Commandes · modèle de données mocké (LOT 06 §10)
 *
 * Catalogue + documents (ventes, commandes, devis, factures, avoirs, paiements)
 * **cohérents entre eux** : une facture payée a son paiement ; un avoir référence sa
 * facture ; une vente référence sa facture et ses paiements. Partagé avec le LOT 07.
 *
 * Paiements : couche **abstraite** (l. 499-516) — des moyens génériques (espèces,
 * mobile, carte, banque), jamais un fournisseur réel codé en dur. Aucune transaction
 * réelle ; simulation locale explicitement signalée.
 *
 * Numérotation : le FORMAT de référence est affiché ; la génération réelle est
 * reportée au backend (LOT 20). Déterministe (LCG) → SSR stable.
 */

export type PaymentMean = 'especes' | 'mobile' | 'carte' | 'banque';

export const PAYMENT_MEAN_LABELS: Record<PaymentMean, string> = {
  especes: 'Espèces',
  mobile: 'Paiement mobile',
  carte: 'Carte',
  banque: 'Virement bancaire'
};

export type Product = {
  id: string;
  ref: string;
  label: string;
  price: number; // FCFA HT
  tva: number; // taux
  stock: number;
};

export type SaleLine = {
  productId: string;
  label: string;
  qty: number;
  unitPrice: number; // FCFA HT
  tva: number;
};

export type DocKind = 'vente' | 'commande' | 'devis' | 'facture' | 'avoir' | 'paiement';

export type InvoiceStatus =
  | 'brouillon'
  | 'emise'
  | 'partiellement_payee'
  | 'payee'
  | 'en_retard'
  | 'annulee';

export type SaleStatus = 'encaissee' | 'en_attente' | 'annulee' | 'offline';
export type OrderStatus = 'a_preparer' | 'en_preparation' | 'prete' | 'convertie';
export type QuoteStatus = 'brouillon' | 'envoye' | 'accepte' | 'converti' | 'expire';
export type CreditStatus = 'emis' | 'rembourse' | 'annule';
export type PaymentStatus = 'valide' | 'en_attente' | 'echoue' | 'partiel';

export type SalesDoc = {
  id: string;
  kind: DocKind;
  ref: string;
  date: string; // ISO
  customer: string;
  lines: SaleLine[];
  discount: number; // FCFA
  status: string;
  /** Moyens de paiement (abstraits) — jamais un prestataire réel. */
  means?: PaymentMean[];
  /** Références croisées (cohérence). */
  invoiceRef?: string;
  saleRef?: string;
  /** Montant propre aux documents de type paiement. */
  amount?: number;
  /** Paiements rattachés (facture) — pour reste à payer exact. */
  payments?: Array<{ id: string; mean: PaymentMean; amount: number; status: PaymentStatus; date: string }>;
  siteId: string;
  synced: boolean;
};

export function lineTotal(line: SaleLine): number {
  return line.qty * line.unitPrice;
}

export function docTotal(doc: Pick<SalesDoc, 'lines' | 'discount'>): number {
  const ht = doc.lines.reduce((sum, l) => sum + lineTotal(l), 0);
  return Math.max(0, ht - doc.discount);
}

export function paidAmount(doc: SalesDoc): number {
  return (doc.payments ?? [])
    .filter((p) => p.status === 'valide' || p.status === 'partiel')
    .reduce((s, p) => s + p.amount, 0);
}

export function remainingAmount(doc: SalesDoc): number {
  return Math.max(0, docTotal(doc) - paidAmount(doc));
}

export function formatFcfa(value: number): string {
  return `${value.toLocaleString('fr-FR')} F`;
}

/* -------------------------------- Catalogue ------------------------------- */

export const PRODUCTS: Product[] = [
  { id: 'prd-01', ref: '000312', label: 'Café moulu 250 g', price: 2500, tva: 18, stock: 42 },
  { id: 'prd-02', ref: '000415', label: 'Thé vert 100 g', price: 1800, tva: 18, stock: 30 },
  { id: 'prd-03', ref: '000528', label: 'Sucre de canne 1 kg', price: 1200, tva: 18, stock: 8 },
  { id: 'prd-04', ref: '000633', label: 'Miel 500 g', price: 4500, tva: 18, stock: 15 },
  { id: 'prd-05', ref: '000741', label: 'Bissap séché 200 g', price: 1500, tva: 18, stock: 0 },
  { id: 'prd-06', ref: '000856', label: 'Arachides grillées 250 g', price: 1000, tva: 18, stock: 60 },
  { id: 'prd-07', ref: '000962', label: 'Chocolat 70 % 100 g', price: 3200, tva: 18, stock: 22 },
  { id: 'prd-08', ref: '001074', label: 'Infusion menthe 50 g', price: 900, tva: 18, stock: 35 }
];

/** Filtrage du catalogue par libellé ou référence (testé en pur). */
export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter((p) => p.label.toLowerCase().includes(q) || p.ref.includes(q));
}

/* -------------------------------- Documents ------------------------------- */

const D = (day: number, h = 10) => new Date(Date.UTC(2026, 7, day, h, 0, 0)).toISOString();

function lines(pairs: Array<[string, number]>): SaleLine[] {
  return pairs.map(([id, qty]) => {
    const p = PRODUCTS.find((x) => x.id === id) ?? (PRODUCTS[0] as Product);
    return { productId: p.id, label: p.label, qty, unitPrice: p.price, tva: p.tva };
  });
}

export const SALES_DOCS: SalesDoc[] = [
  /* ------------------------------- Ventes ------------------------------- */
  {
    id: 'vnt-001', kind: 'vente', ref: 'VNT-2026-0001', date: D(29, 9), customer: 'Vente anonyme',
    lines: lines([['prd-01', 2], ['prd-06', 1]]), discount: 0, status: 'encaissee',
    means: ['especes'], invoiceRef: 'FAC-2026-0001', siteId: 'siege', synced: true
  },
  {
    id: 'vnt-002', kind: 'vente', ref: 'VNT-2026-0002', date: D(29, 11), customer: 'Client — Awa Diop',
    lines: lines([['prd-04', 1], ['prd-07', 2]]), discount: 500, status: 'encaissee',
    means: ['mobile'], invoiceRef: 'FAC-2026-0002', siteId: 'atelier-centre', synced: true
  },
  {
    id: 'vnt-003', kind: 'vente', ref: 'VNT-2026-0003', date: D(28, 16), customer: 'Vente anonyme',
    lines: lines([['prd-03', 3]]), discount: 0, status: 'offline',
    means: ['especes'], siteId: 'depot-est', synced: false
  },
  {
    id: 'vnt-004', kind: 'vente', ref: 'VNT-2026-0004', date: D(27, 12), customer: 'Client — Moussa Traoré',
    lines: lines([['prd-02', 2], ['prd-08', 2]]), discount: 0, status: 'annulee',
    means: ['carte'], siteId: 'siege', synced: true
  },

  /* ------------------------------ Commandes ----------------------------- */
  {
    id: 'cmd-001', kind: 'commande', ref: 'CMD-2026-0001', date: D(29, 8), customer: 'Client — Awa Diop',
    lines: lines([['prd-01', 5], ['prd-04', 2]]), discount: 0, status: 'a_preparer', siteId: 'siege', synced: true
  },
  {
    id: 'cmd-002', kind: 'commande', ref: 'CMD-2026-0002', date: D(28, 9), customer: 'Client — Moussa Traoré',
    lines: lines([['prd-07', 3]]), discount: 0, status: 'en_preparation', siteId: 'atelier-centre', synced: true
  },
  {
    id: 'cmd-003', kind: 'commande', ref: 'CMD-2026-0003', date: D(26, 15), customer: 'Client — Awa Diop',
    lines: lines([['prd-06', 10]]), discount: 1000, status: 'convertie', invoiceRef: 'FAC-2026-0003', siteId: 'siege', synced: true
  },

  /* -------------------------------- Devis ------------------------------- */
  {
    id: 'dev-001', kind: 'devis', ref: 'DEV-2026-0001', date: D(29, 10), customer: 'Client — Moussa Traoré',
    lines: lines([['prd-04', 4], ['prd-07', 4]]), discount: 0, status: 'envoye', siteId: 'siege', synced: true
  },
  {
    id: 'dev-002', kind: 'devis', ref: 'DEV-2026-0002', date: D(25, 14), customer: 'Client — Awa Diop',
    lines: lines([['prd-01', 10]]), discount: 0, status: 'accepte', siteId: 'atelier-centre', synced: true
  },

  /* ------------------------------- Factures ----------------------------- */
  {
    id: 'fac-001', kind: 'facture', ref: 'FAC-2026-0001', date: D(29, 9), customer: 'Vente anonyme',
    lines: lines([['prd-01', 2], ['prd-06', 1]]), discount: 0, status: 'payee', saleRef: 'VNT-2026-0001',
    payments: [{ id: 'pay-001', mean: 'especes', amount: docTotal({ lines: lines([['prd-01', 2], ['prd-06', 1]]), discount: 0 }), status: 'valide', date: D(29, 9) }],
    siteId: 'siege', synced: true
  },
  {
    id: 'fac-002', kind: 'facture', ref: 'FAC-2026-0002', date: D(29, 11), customer: 'Client — Awa Diop',
    lines: lines([['prd-04', 1], ['prd-07', 2]]), discount: 500, status: 'partiellement_payee', saleRef: 'VNT-2026-0002',
    payments: [{ id: 'pay-002', mean: 'mobile', amount: 5000, status: 'partiel', date: D(29, 12) }],
    siteId: 'atelier-centre', synced: true
  },
  {
    id: 'fac-003', kind: 'facture', ref: 'FAC-2026-0003', date: D(26, 15), customer: 'Client — Awa Diop',
    lines: lines([['prd-06', 10]]), discount: 1000, status: 'en_retard', saleRef: 'CMD-2026-0003',
    payments: [], siteId: 'siege', synced: true
  },
  {
    id: 'fac-004', kind: 'facture', ref: 'FAC-2026-0004', date: D(24, 10), customer: 'Client — Moussa Traoré',
    lines: lines([['prd-02', 4]]), discount: 0, status: 'emise', payments: [], siteId: 'depot-est', synced: true
  },

  /* -------------------------------- Avoirs ------------------------------ */
  {
    id: 'avr-001', kind: 'avoir', ref: 'AVR-2026-0001', date: D(28, 17), customer: 'Client — Moussa Traoré',
    lines: lines([['prd-07', 1]]), discount: 0, status: 'emis', invoiceRef: 'FAC-2026-0002', siteId: 'atelier-centre', synced: true
  },

  /* ------------------------------- Paiements ---------------------------- */
  {
    id: 'pay-001', kind: 'paiement', ref: 'PAY-2026-0001', date: D(29, 9), customer: 'Vente anonyme',
    lines: [], discount: 0, status: 'valide', means: ['especes'], invoiceRef: 'FAC-2026-0001', amount: 6000, siteId: 'siege', synced: true
  },
  {
    id: 'pay-002', kind: 'paiement', ref: 'PAY-2026-0002', date: D(29, 12), customer: 'Client — Awa Diop',
    lines: [], discount: 0, status: 'partiel', means: ['mobile'], invoiceRef: 'FAC-2026-0002', amount: 5000, siteId: 'atelier-centre', synced: true
  },
  {
    id: 'pay-003', kind: 'paiement', ref: 'PAY-2026-0003', date: D(27, 12), customer: 'Client — Moussa Traoré',
    lines: [], discount: 0, status: 'echoue', means: ['carte'], invoiceRef: 'FAC-2026-0004', amount: 7200, siteId: 'siege', synced: true
  }
];

export function docsOf(kind: DocKind): SalesDoc[] {
  return SALES_DOCS.filter((d) => d.kind === kind);
}

export function findDoc(kind: DocKind, id: string): SalesDoc | undefined {
  return SALES_DOCS.find((d) => d.kind === kind && (d.id === id || d.ref === id));
}

/* ----------------------------- Statuts & tons ----------------------------- */

export type StatusMeta = { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'critical' };

export const STATUS_META: Record<string, StatusMeta> = {
  /* factures */
  brouillon: { label: 'Brouillon', tone: 'neutral' },
  emise: { label: 'Émise', tone: 'info' },
  partiellement_payee: { label: 'Partiellement payée', tone: 'warning' },
  payee: { label: 'Payée', tone: 'success' },
  en_retard: { label: 'En retard', tone: 'critical' },
  annulee: { label: 'Annulée', tone: 'neutral' },
  /* ventes */
  encaissee: { label: 'Encaissée', tone: 'success' },
  en_attente: { label: 'En attente', tone: 'warning' },
  offline: { label: 'Hors ligne', tone: 'warning' },
  /* commandes */
  a_preparer: { label: 'À préparer', tone: 'info' },
  en_preparation: { label: 'En préparation', tone: 'warning' },
  prete: { label: 'Prête', tone: 'success' },
  convertie: { label: 'Convertie', tone: 'success' },
  /* devis */
  envoye: { label: 'Envoyé', tone: 'info' },
  accepte: { label: 'Accepté', tone: 'success' },
  converti: { label: 'Converti', tone: 'success' },
  expire: { label: 'Expiré', tone: 'neutral' },
  /* avoirs */
  emis: { label: 'Émis', tone: 'info' },
  rembourse: { label: 'Remboursé', tone: 'success' },
  annule: { label: 'Annulé', tone: 'neutral' },
  /* paiements */
  valide: { label: 'Validé', tone: 'success' },
  echoue: { label: 'Échoué', tone: 'critical' },
  partiel: { label: 'Partiel', tone: 'warning' }
};

/** Transitions de statut autorisées (UI) — la vérité reste backend (LOT 20). */
export const STATUS_TRANSITIONS: Record<DocKind, Record<string, string[]>> = {
  vente: { en_attente: ['encaissee', 'annulee'], encaissee: ['annulee'], offline: ['encaissee'], annulee: [] },
  commande: { a_preparer: ['en_preparation'], en_preparation: ['prete', 'convertie'], prete: ['convertie'], convertie: [] },
  devis: { brouillon: ['envoye'], envoye: ['accepte', 'expire'], accepte: ['converti'], converti: [], expire: [] },
  facture: { brouillon: ['emise'], emise: ['partiellement_payee', 'payee', 'en_retard', 'annulee'], partiellement_payee: ['payee'], en_retard: ['payee', 'annulee'], payee: [], annulee: [] },
  avoir: { emis: ['rembourse', 'annule'], rembourse: [], annule: [] },
  paiement: { en_attente: ['valide', 'echoue'], valide: [], echoue: [], partiel: [] }
};
