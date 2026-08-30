/**
 * DIVINI exo — Finance · modèle de données de démonstration (LOT 09)
 *
 * FRONTEND ONLY. Données mockées, signalées comme telles. Aucune donnée
 * financière réelle, aucun paiement réel, aucune conversion adossée à un service
 * externe.
 *
 * Cohérence LOT 06 : les encaissements reprennent les paiements du LOT 06
 * (pay-001 6000 FCFA espèces, pay-002 5000 FCFA mobile). Un paiement échoué
 * (pay-003) n'entre PAS en trésorerie.
 *
 * Honnêteté :
 *  - la projection de trésorerie est calculée LOCALEMENT à partir des flux et
 *    présentée comme **projection de démonstration**, jamais une prévision
 *    garantie ni un résultat (interdit §11) ;
 *  - un taux de change affiche toujours sa **date** et sa **source** ;
 *  - une période clôturée est verrouillée (non modifiable) ;
 *  - l'approbation d'une dépense est conditionnée au rôle.
 */

import { formatFcfa } from '../sales/mock';

export { formatFcfa };

/** Référence « aujourd'hui » de démonstration. */
export const FINANCE_TODAY = new Date(Date.UTC(2026, 7, 30)).toISOString();

const D = (day: number, h = 10) => new Date(Date.UTC(2026, 7, day, h, 0, 0)).toISOString();

/* -------------------------------- comptes -------------------------------- */

export type Account = {
  id: string;
  label: string;
  kind: 'banque' | 'caisse' | 'mobile';
  /** Solde initial au 1er août (démonstration). */
  openingBalance: number;
};

export const ACCOUNTS: Account[] = [
  { id: 'acc-banque', label: 'Banque — compte principal', kind: 'banque', openingBalance: 250_000 },
  { id: 'acc-caisse', label: 'Caisse siège', kind: 'caisse', openingBalance: 40_000 },
  { id: 'acc-mobile', label: 'Mobile money', kind: 'mobile', openingBalance: 15_000 }
];

export function findAccount(id: string): Account | undefined {
  return ACCOUNTS.find((a) => a.id === id);
}

/* --------------------------------- flux ---------------------------------- */

export type FlowDirection = 'in' | 'out';

export type CashFlow = {
  id: string;
  date: string;
  label: string;
  accountId: string;
  direction: FlowDirection;
  amount: number; // FCFA, toujours positif ; le sens porte le signe
  category: string;
  /** Référence croisée LOT 06, le cas échéant. */
  ref?: string;
  /** Flux réel (passé) ou projeté (futur). */
  projected?: boolean;
};

/**
 * Flux de trésorerie. Les encaissements passés reprennent les paiements LOT 06.
 * Les flux `projected` alimentent la projection (échéances à venir, dépenses
 * programmées) — démonstration.
 */
export const CASH_FLOWS: CashFlow[] = [
  /* ------------------------------ passé (réel) -------------------------- */
  { id: 'fl-001', date: D(29, 9), label: 'Encaissement vente comptoir', accountId: 'acc-caisse', direction: 'in', amount: 6000, category: 'Ventes', ref: 'PAY-2026-0001' },
  { id: 'fl-002', date: D(29, 12), label: 'Encaissement mobile (partiel)', accountId: 'acc-mobile', direction: 'in', amount: 5000, category: 'Ventes', ref: 'PAY-2026-0002' },
  { id: 'fl-003', date: D(28, 11), label: 'Règlement facture FAC-2026-0001', accountId: 'acc-banque', direction: 'in', amount: 180_000, category: 'Ventes' },
  { id: 'fl-004', date: D(26, 15), label: 'Achat de matières premières', accountId: 'acc-banque', direction: 'out', amount: 120_000, category: 'Achats' },
  { id: 'fl-005', date: D(25, 9), label: 'Loyer atelier', accountId: 'acc-banque', direction: 'out', amount: 85_000, category: 'Charges fixes' },
  { id: 'fl-006', date: D(20, 14), label: 'Règlement facture FAC-2026-0003', accountId: 'acc-banque', direction: 'in', amount: 95_000, category: 'Ventes' },

  /* --------------------------- futur (projeté) -------------------------- */
  { id: 'fl-101', date: D(34, 9), label: 'Échéance client — FAC-2026-0002', accountId: 'acc-banque', direction: 'in', amount: 70_000, category: 'Ventes', projected: true },
  { id: 'fl-102', date: D(36, 10), label: 'Dépense programmée — stock', accountId: 'acc-banque', direction: 'out', amount: 140_000, category: 'Achats', projected: true },
  { id: 'fl-103', date: D(40, 10), label: 'Loyer atelier (échu)', accountId: 'acc-banque', direction: 'out', amount: 85_000, category: 'Charges fixes', projected: true },
  { id: 'fl-104', date: D(45, 9), label: 'Échéance client — FAC-2026-0004', accountId: 'acc-banque', direction: 'in', amount: 60_000, category: 'Ventes', projected: true },
  { id: 'fl-105', date: D(38, 10), label: 'Remboursement emprunt', accountId: 'acc-banque', direction: 'out', amount: 300_000, category: 'Financement', projected: true }
];

/** Flux signés : entrée positive, sortie négative. */
export function signedAmount(flow: CashFlow): number {
  return flow.direction === 'in' ? flow.amount : -flow.amount;
}

export function flowsOf(accountId: string): CashFlow[] {
  return CASH_FLOWS.filter((f) => f.accountId === accountId);
}

/** Solde courant d'un compte = solde initial + flux passés signés. */
export function accountBalance(accountId: string): number {
  const acc = findAccount(accountId);
  if (!acc) return 0;
  return (
    acc.openingBalance +
    flowsOf(accountId)
      .filter((f) => !f.projected)
      .reduce((sum, f) => sum + signedAmount(f), 0)
  );
}

/** Trésorerie totale (somme des comptes). */
export function totalCash(): number {
  return ACCOUNTS.reduce((sum, a) => sum + accountBalance(a.id), 0);
}

/* ------------------------------- projection ------------------------------ */

export type ProjectionPoint = {
  date: string;
  balance: number;
  projected: boolean;
};

/**
 * Projection de trésorerie calculée LOCALEMENT.
 *
 * Méthode : solde total courant, puis application chronologique des flux
 * projetés (échéances à venir, dépenses programmées). Chaque point porte un
 * drapeau `projected` pour séparer passé (plein) et futur (pointillé).
 *
 * C'est une **projection de démonstration** : aucune garantie, aucun modèle
 * prédictif, aucun résultat comptable (interdit §11).
 */
export function buildProjection(): ProjectionPoint[] {
  const start = totalCash();
  const points: ProjectionPoint[] = [{ date: FINANCE_TODAY, balance: start, projected: false }];
  const future = CASH_FLOWS.filter((f) => f.projected).sort((a, b) => (a.date < b.date ? -1 : 1));
  let running = start;
  for (const flow of future) {
    running += signedAmount(flow);
    points.push({ date: flow.date, balance: running, projected: true });
  }
  return points;
}

/** Date de bascule négative prévue, ou null si la trésorerie reste positive. */
export function negativeCrossoverDate(): string | null {
  const points = buildProjection();
  for (const p of points) {
    if (p.balance < 0) return p.date;
  }
  return null;
}

/** Solde projeté minimum et sa date. */
export function projectedMinimum(): { balance: number; date: string } {
  const points = buildProjection();
  return points.reduce((min, p) => (p.balance < min.balance ? p : min), points[0]!);
}

/* ------------------------------ échéances -------------------------------- */

export type Due = {
  id: string;
  label: string;
  amount: number;
  dueDate: string;
  kind: 'creance' | 'dette';
  ref?: string;
};

export const DUES: Due[] = [
  { id: 'due-01', label: 'FAC-2026-0002 — Awa Diop', amount: 70_000, dueDate: D(34), kind: 'creance', ref: 'FAC-2026-0002' },
  { id: 'due-02', label: 'FAC-2026-0004 — Moussa Traoré', amount: 60_000, dueDate: D(45), kind: 'creance', ref: 'FAC-2026-0004' },
  { id: 'due-03', label: 'Fournisseur — matières premières', amount: 140_000, dueDate: D(36), kind: 'dette' },
  { id: 'due-04', label: 'Loyer atelier', amount: 85_000, dueDate: D(40), kind: 'dette' },
  { id: 'due-05', label: 'Remboursement emprunt', amount: 300_000, dueDate: D(38), kind: 'dette' }
];

/** Créances âgées (buckets) — démonstration. */
export type AgingBucket = { label: string; amount: number };

export const AGING_RECEIVABLES: AgingBucket[] = [
  { label: '0–30 j', amount: 70_000 },
  { label: '31–60 j', amount: 60_000 },
  { label: '61–90 j', amount: 25_000 },
  { label: '90+ j', amount: 15_000 }
];

/* ------------------------------- dépenses -------------------------------- */

export type ExpenseStatus = 'creee' | 'en_attente' | 'approuvee' | 'payee' | 'rejetee';

export const EXPENSE_STATUS_META: Record<
  ExpenseStatus,
  { label: string; tone: 'neutral' | 'warning' | 'info' | 'success' | 'critical' }
> = {
  creee: { label: 'Créée', tone: 'neutral' },
  en_attente: { label: 'En attente', tone: 'warning' },
  approuvee: { label: 'Approuvée', tone: 'info' },
  payee: { label: 'Payée', tone: 'success' },
  rejetee: { label: 'Rejetée', tone: 'critical' }
};

/** Workflow canonique (l. 1982-1984). */
export const EXPENSE_TRANSITIONS: Record<ExpenseStatus, ExpenseStatus[]> = {
  creee: ['en_attente'],
  en_attente: ['approuvee', 'rejetee'],
  approuvee: ['payee'],
  payee: [],
  rejetee: []
};

export type Expense = {
  id: string;
  ref: string;
  label: string;
  category: string;
  amount: number;
  date: string;
  requester: string;
  status: ExpenseStatus;
  /** Justificatif (référence simulée) — peut manquer. */
  receipt?: string;
  approver?: string;
};

export const EXPENSES: Expense[] = [
  { id: 'exp-001', ref: 'DEP-2026-0001', label: 'Fournitures de bureau', category: 'Fonctionnement', amount: 18_500, date: D(22), requester: 'A. Diallo', status: 'payee', receipt: 'JUS-0001', approver: 'Gérant' },
  { id: 'exp-002', ref: 'DEP-2026-0002', label: 'Carburant livraison', category: 'Logistique', amount: 32_000, date: D(26), requester: 'M. Sow', status: 'approuvee', receipt: 'JUS-0002', approver: 'Gérant' },
  { id: 'exp-003', ref: 'DEP-2026-0003', label: 'Maintenance imprimante', category: 'Fonctionnement', amount: 45_000, date: D(28), requester: 'K. Ndiaye', status: 'en_attente', receipt: 'JUS-0003' },
  { id: 'exp-004', ref: 'DEP-2026-0004', label: 'Achat emballages', category: 'Achats', amount: 67_000, date: D(29), requester: 'A. Diallo', status: 'creee' },
  { id: 'exp-005', ref: 'DEP-2026-0005', label: 'Frais de déplacement', category: 'Fonctionnement', amount: 25_000, date: D(24), requester: 'M. Sow', status: 'rejetee', receipt: 'JUS-0005', approver: 'Gérant' }
];

export function findExpense(id: string): Expense | undefined {
  return EXPENSES.find((e) => e.id === id);
}

/* ------------------------------- périodes -------------------------------- */

export type PeriodStatus = 'ouverte' | 'cloturee';

export type AccountingPeriod = {
  id: string;
  label: string;
  start: string;
  end: string;
  status: PeriodStatus;
};

export const PERIODS: AccountingPeriod[] = [
  { id: 'per-2026-06', label: 'Juin 2026', start: new Date(Date.UTC(2026, 5, 1)).toISOString(), end: new Date(Date.UTC(2026, 5, 30)).toISOString(), status: 'cloturee' },
  { id: 'per-2026-07', label: 'Juillet 2026', start: new Date(Date.UTC(2026, 6, 1)).toISOString(), end: new Date(Date.UTC(2026, 6, 31)).toISOString(), status: 'cloturee' },
  { id: 'per-2026-08', label: 'Août 2026', start: new Date(Date.UTC(2026, 7, 1)).toISOString(), end: new Date(Date.UTC(2026, 7, 31)).toISOString(), status: 'ouverte' }
];

export function findPeriod(id: string): AccountingPeriod | undefined {
  return PERIODS.find((p) => p.id === id);
}

/** Une période clôturée est verrouillée : non modifiable, même visuellement. */
export function isPeriodLocked(period: AccountingPeriod): boolean {
  return period.status === 'cloturee';
}

/* ---------------------------- grands postes ------------------------------ */

export type LedgerLine = { label: string; amount: number; kind: 'revenu' | 'depense' };

/** Grands postes du mois courant (démonstration). */
export const LEDGER_LINES: LedgerLine[] = [
  { label: 'Ventes', amount: 340_000, kind: 'revenu' },
  { label: 'Achats', amount: 120_000, kind: 'depense' },
  { label: 'Charges fixes', amount: 85_000, kind: 'depense' },
  { label: 'Fonctionnement', amount: 88_500, kind: 'depense' },
  { label: 'Logistique', amount: 32_000, kind: 'depense' }
];

export function netResult(): number {
  return LEDGER_LINES.reduce((sum, l) => sum + (l.kind === 'revenu' ? l.amount : -l.amount), 0);
}

/* -------------------------------- devises -------------------------------- */

export type CurrencyRole = 'transaction' | 'tenant' | 'affichage';

export type ExchangeRate = {
  from: string;
  to: string;
  rate: number;
  /** Date du taux — toujours affichée. */
  date: string;
  /** Source du taux — toujours affichée. */
  source: string;
};

/**
 * Taux de change de démonstration. Chaque taux porte sa **date** et sa
 * **source** (interdit §11 : aucun taux sans date ni source). Aucune conversion
 * adossée à un service externe.
 */
export const EXCHANGE_RATES: ExchangeRate[] = [
  { from: 'EUR', to: 'XOF', rate: 655.957, date: new Date(Date.UTC(2026, 7, 29)).toISOString(), source: 'BCEAO — démonstration' },
  { from: 'USD', to: 'XOF', rate: 605.2, date: new Date(Date.UTC(2026, 7, 29)).toISOString(), source: 'BCEAO — démonstration' }
];

export function findRate(from: string, to: string): ExchangeRate | undefined {
  return EXCHANGE_RATES.find((r) => r.from === from && r.to === to);
}

/** Rôles de devise distingués (l. 517-535). */
export const CURRENCY_ROLES: Record<CurrencyRole, { label: string; code: string }> = {
  transaction: { label: 'Devise de transaction', code: 'EUR' },
  tenant: { label: 'Devise du tenant', code: 'XOF' },
  affichage: { label: "Devise d'affichage", code: 'XOF' }
};

/**
 * Convertit un montant avec un taux donné. Présenté comme une conversion de
 * démonstration, jamais comme une valeur comptable historique : un changement de
 * taux ne rétro-modifie pas une valeur passée (l. 532).
 */
export function convert(amount: number, rate: ExchangeRate | undefined): number | null {
  if (!rate) return null;
  return Math.round(amount * rate.rate);
}

/** Un taux est-il ancien (> 7 jours) ? Avertissement. */
export function isRateStale(rate: ExchangeRate): boolean {
  return Date.parse(FINANCE_TODAY) - Date.parse(rate.date) > 7 * 86_400_000;
}

/* ------------------------------- gouvernance ----------------------------- */

/** Rôles simulés pour l'approbation de dépenses. */
export type Role = 'gerant' | 'comptable' | 'employe';

/** Un rôle peut-il approuver une dépense ? */
export function canApprove(role: Role): boolean {
  return role === 'gerant';
}

export const APPROVE_PERMISSION = 'expenses.approve';
export const APPROVE_CONTACT = 'gérant ou comptable habilité';
