/**
 * DIVINI exo — Fidélité · modèle de données de démonstration (LOT 10)
 *
 * FRONTEND ONLY. Données mockées, signalées comme telles. Impact réel d'une
 * vente sur les points : cohérence mockée signalée, aucune attribution réelle.
 *
 * Cohérence : les opérations de points sont rattachées aux paiements du LOT 06
 * et aux clients du LOT 08. Le solde affiché vient du client LOT 08.
 *
 * Interdits (§11) respectés :
 *  - presets **configurables**, jamais codés en dur dans l'interface ;
 *  - exclusion des frais de livraison configurable et visible ;
 *  - une annulation produit une **correction tracée**, jamais une disparition
 *    silencieuse de points.
 */

import { CLIENTS, findClient, formatFcfa } from '../crm/mock';

export { CLIENTS, findClient, formatFcfa };

/* -------------------------------- presets -------------------------------- */

/**
 * Presets d'attribution — **configurables** et affichés comme tels.
 * `pointsPerStep` : 1 point tous les `currencyStep` FCFA.
 */
export type LoyaltyPreset = {
  id: string;
  label: string;
  /** Points offerts à l'inscription. */
  signupBonus: number;
  /** 1 point tous les `currencyStep` FCFA. */
  currencyStep: number;
};

export const LOYALTY_PRESETS: LoyaltyPreset[] = [
  { id: 'standard', label: 'Standard', signupBonus: 10, currencyStep: 1000 },
  { id: 'genereux', label: 'Généreux', signupBonus: 20, currencyStep: 500 },
  { id: 'economique', label: 'Économique', signupBonus: 5, currencyStep: 2000 }
];

export function findPreset(id: string): LoyaltyPreset | undefined {
  return LOYALTY_PRESETS.find((p) => p.id === id);
}

/* --------------------------- modes d'attribution ------------------------- */

export type AttributionMode = 'prorata' | 'after_full_payment';

export const ATTRIBUTION_MODE_LABELS: Record<AttributionMode, string> = {
  prorata: 'Au prorata du paiement',
  after_full_payment: 'Après paiement complet'
};

/* ------------------------------ opérations ------------------------------- */

export type PointsOperationType = 'gain' | 'correction' | 'expiration' | 'echange';

export type PointsOperation = {
  id: string;
  clientId: string;
  date: string;
  /** Points signés : gain positif, correction/expiration négatifs. */
  points: number;
  type: PointsOperationType;
  /** Paiement LOT 06 d'origine, le cas échéant. */
  paymentRef?: string;
  /** Mode d'attribution — affiché sur chaque opération. */
  mode?: AttributionMode;
  reason: string;
};

const DO = (day: number, h = 10) => new Date(Date.UTC(2026, 7, day, h, 0, 0)).toISOString();

/**
 * Opérations de points de démonstration, rattachées aux paiements LOT 06 et aux
 * clients LOT 08. Le mode d'attribution est porté par chaque opération.
 */
export const POINTS_OPERATIONS: PointsOperation[] = [
  { id: 'pop-001', clientId: 'cli-awa', date: DO(29, 9), points: 6, type: 'gain', paymentRef: 'PAY-2026-0001', mode: 'prorata', reason: 'Paiement 6 000 FCFA — 1 pt / 1 000' },
  { id: 'pop-002', clientId: 'cli-moussa', date: DO(29, 12), points: 5, type: 'gain', paymentRef: 'PAY-2026-0002', mode: 'prorata', reason: 'Paiement partiel 5 000 FCFA — prorata' },
  { id: 'pop-003', clientId: 'cli-awa', date: DO(20, 10), points: 10, type: 'gain', reason: 'Bonus d\u2019inscription' },
  { id: 'pop-004', clientId: 'cli-moussa', date: DO(18, 10), points: -3, type: 'correction', paymentRef: 'PAY-2026-0002', reason: 'Annulation partielle — correction tracée' },
  { id: 'pop-005', clientId: 'cli-fatou', date: DO(15, 10), points: -20, type: 'expiration', reason: 'Points expirés (12 mois)' }
];

export function operationsOf(clientId: string): PointsOperation[] {
  return POINTS_OPERATIONS.filter((o) => o.clientId === clientId).sort((a, b) =>
    a.date < b.date ? 1 : -1
  );
}

/* ------------------------------ calculs ---------------------------------- */

/**
 * Points générés par un montant, pour un preset donné.
 * Si `excludeDeliveryFees`, les frais de livraison sont retirés du montant
 * avant calcul (règle visible et configurable).
 */
export function pointsFromAmount(
  amount: number,
  preset: LoyaltyPreset,
  opts: { deliveryFee?: number; excludeDeliveryFees?: boolean } = {}
): number {
  const fee = opts.excludeDeliveryFees ? opts.deliveryFee ?? 0 : 0;
  const base = Math.max(0, amount - fee);
  return Math.floor(base / preset.currencyStep);
}

/**
 * Points attribués selon le mode :
 *  - `prorata` : sur le montant du paiement courant ;
 *  - `after_full_payment` : uniquement si le paiement solde la facture.
 */
export function pointsForPayment(
  paymentAmount: number,
  invoiceTotal: number,
  alreadyPaid: number,
  preset: LoyaltyPreset,
  mode: AttributionMode,
  opts: { deliveryFee?: number; excludeDeliveryFees?: boolean } = {}
): number {
  if (mode === 'prorata') {
    return pointsFromAmount(paymentAmount, preset, opts);
  }
  const fullyPaid = alreadyPaid + paymentAmount >= invoiceTotal;
  return fullyPaid ? pointsFromAmount(invoiceTotal, preset, opts) : 0;
}

/* -------------------------------- niveaux -------------------------------- */

export type LoyaltyLevel = { id: string; label: string; minPoints: number };

export const LOYALTY_LEVELS: LoyaltyLevel[] = [
  { id: 'bronze', label: 'Bronze', minPoints: 0 },
  { id: 'argent', label: 'Argent', minPoints: 500 },
  { id: 'or', label: 'Or', minPoints: 1500 },
  { id: 'platine', label: 'Platine', minPoints: 5000 }
];

export function levelFor(points: number): LoyaltyLevel {
  return [...LOYALTY_LEVELS].reverse().find((l) => points >= l.minPoints) ?? LOYALTY_LEVELS[0]!;
}

export function nextLevel(points: number): LoyaltyLevel | null {
  return LOYALTY_LEVELS.find((l) => l.minPoints > points) ?? null;
}

/** Progression (0-100) vers le niveau suivant. */
export function levelProgress(points: number): number {
  const current = levelFor(points);
  const next = nextLevel(points);
  if (!next) return 100;
  const span = next.minPoints - current.minPoints;
  return span > 0 ? Math.round(((points - current.minPoints) / span) * 100) : 100;
}

/* ------------------------------ récompenses ------------------------------ */

export type Reward = { id: string; label: string; cost: number };

export const REWARDS: Reward[] = [
  { id: 'rwd-01', label: 'Remise 1 000 FCFA', cost: 200 },
  { id: 'rwd-02', label: 'Produit offert', cost: 500 },
  { id: 'rwd-03', label: 'Livraison offerte', cost: 300 }
];

/* ------------------------------- expiration ------------------------------ */

/** Durée de validité des points (jours). */
export const POINTS_VALIDITY_DAYS = 365;

export type ExpiringBatch = { clientId: string; points: number; expiresAt: string };

export const EXPIRING_BATCHES: ExpiringBatch[] = [
  { clientId: 'cli-fatou', points: 20, expiresAt: new Date(Date.UTC(2026, 8, 15)).toISOString() },
  { clientId: 'cli-ibrahima', points: 40, expiresAt: new Date(Date.UTC(2026, 9, 1)).toISOString() }
];

/* ------------------------------ statistiques ----------------------------- */

export type LoyaltyStats = {
  members: number;
  pointsInCirculation: number;
  pointsIssued: number;
  pointsRedeemed: number;
  pointsExpired: number;
};

export function loyaltyStats(): LoyaltyStats {
  const pointsInCirculation = CLIENTS.reduce((s, c) => s + c.points, 0);
  const issued = POINTS_OPERATIONS.filter((o) => o.points > 0).reduce((s, o) => s + o.points, 0);
  const corrected = POINTS_OPERATIONS.filter((o) => o.type === 'correction').reduce((s, o) => s + Math.abs(o.points), 0);
  const expired = POINTS_OPERATIONS.filter((o) => o.type === 'expiration').reduce((s, o) => s + Math.abs(o.points), 0);
  return {
    members: CLIENTS.length,
    pointsInCirculation,
    pointsIssued: issued,
    pointsRedeemed: corrected,
    pointsExpired: expired
  };
}
