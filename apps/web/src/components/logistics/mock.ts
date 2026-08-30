/**
 * DIVINI exo — Logistique · modèle de données de démonstration (LOT 10)
 *
 * FRONTEND ONLY. Données mockées, signalées comme telles. Aucune donnée réelle,
 * aucun livreur réel, aucune géolocalisation, aucune notification réelle.
 *
 * Cohérence : les expéditions sont rattachées aux commandes du LOT 06
 * (`SALES_DOCS` kind 'commande') ; le CA perdu est dérivé de leurs montants.
 *
 * Gouvernance du référentiel (l. 1876, interdit §11) : les zones sont un
 * référentiel **extensible** — jamais une liste fermée figée.
 */

import { SALES_DOCS, docTotal, formatFcfa } from '../sales/mock';

export { formatFcfa };

/* ------------------------------- statuts --------------------------------- */

export type DeliveryStatus =
  | 'preparation'
  | 'a_expedier'
  | 'en_cours'
  | 'en_livraison'
  | 'echouee'
  | 'reprogrammee'
  | 'livree'
  | 'annulee';

export const DELIVERY_STATUS_META: Record<
  DeliveryStatus,
  { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'critical' }
> = {
  preparation: { label: 'Préparation', tone: 'neutral' },
  a_expedier: { label: 'À expédier', tone: 'neutral' },
  en_cours: { label: 'En cours', tone: 'info' },
  en_livraison: { label: 'En livraison', tone: 'info' },
  echouee: { label: 'Échouée', tone: 'critical' },
  reprogrammee: { label: 'Reprogrammée', tone: 'warning' },
  livree: { label: 'Livrée', tone: 'success' },
  annulee: { label: 'Annulée', tone: 'neutral' }
};

/** Transitions de statut autorisées. */
export const DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  preparation: ['a_expedier'],
  a_expedier: ['en_cours', 'annulee'],
  en_cours: ['en_livraison', 'echouee'],
  en_livraison: ['livree', 'echouee'],
  echouee: ['reprogrammee', 'annulee'],
  reprogrammee: ['en_cours'],
  livree: [],
  annulee: []
};

/* ------------------------------- livreurs -------------------------------- */

export type Courier = {
  id: string;
  name: string;
  phone: string;
  /** Zones desservies (ids). */
  zoneIds: string[];
  active: boolean;
  /** Capacité quotidienne (livraisons). */
  dailyCapacity: number;
};

export const COURIERS: Courier[] = [
  { id: 'crr-01', name: 'Omar Dieng', phone: '+221 77 555 11 22', zoneIds: ['zone-cocody', 'zone-marcory'], active: true, dailyCapacity: 12 },
  { id: 'crr-02', name: 'Aïssatou Kane', phone: '+221 78 555 33 44', zoneIds: ['zone-yopougon', 'zone-abobo'], active: true, dailyCapacity: 10 },
  { id: 'crr-03', name: 'Serge Bamba', phone: '+221 76 555 55 66', zoneIds: ['zone-plateau', 'zone-treichville'], active: false, dailyCapacity: 8 }
];

export function findCourier(id: string): Courier | undefined {
  return COURIERS.find((c) => c.id === id);
}

/* -------------------------------- zones ---------------------------------- */

/**
 * Référentiel de zones — **extensible**. Ces entrées sont des exemples de
 * démonstration, pas une liste fermée : l'interface permet d'ajouter une zone.
 */
export type Zone = {
  id: string;
  label: string;
  /** Tarif de livraison (FCFA). */
  rate: number;
  /** Durée estimée (minutes). */
  estimatedMinutes: number;
};

export const ZONES: Zone[] = [
  { id: 'zone-cocody', label: 'Cocody', rate: 1500, estimatedMinutes: 45 },
  { id: 'zone-marcory', label: 'Marcory', rate: 1200, estimatedMinutes: 35 },
  { id: 'zone-yopougon', label: 'Yopougon', rate: 2000, estimatedMinutes: 60 },
  { id: 'zone-abobo', label: 'Abobo', rate: 2000, estimatedMinutes: 65 },
  { id: 'zone-plateau', label: 'Plateau', rate: 1000, estimatedMinutes: 30 },
  { id: 'zone-treichville', label: 'Treichville', rate: 1200, estimatedMinutes: 40 }
];

export function findZone(id: string): Zone | undefined {
  return ZONES.find((z) => z.id === id);
}

/* ----------------------------- expéditions ------------------------------- */

export type DeliveryEvent = {
  date: string;
  status: DeliveryStatus;
  note: string;
  actor: string;
};

export type Delivery = {
  id: string;
  ref: string;
  /** Commande LOT 06 d'origine. */
  orderRef: string;
  customerId: string;
  zoneId: string;
  courierId?: string;
  status: DeliveryStatus;
  /** Motif d'échec — obligatoire si statut échouée. */
  failureReason?: string;
  events: DeliveryEvent[];
  createdAt: string;
};

const DE = (day: number, h: number) => new Date(Date.UTC(2026, 7, day, h, 0, 0)).toISOString();

/** Montant d'une commande LOT 06 (pour le CA perdu). */
export function orderAmount(orderRef: string): number {
  const order = SALES_DOCS.find((d) => d.ref === orderRef);
  return order ? docTotal(order) : 0;
}

export const DELIVERIES: Delivery[] = [
  {
    id: 'dlv-001', ref: 'LVR-2026-0001', orderRef: 'CMD-2026-0001', customerId: 'cli-awa',
    zoneId: 'zone-cocody', courierId: 'crr-01', status: 'livree', createdAt: DE(29, 9),
    events: [
      { date: DE(29, 9), status: 'preparation', note: 'Commande préparée', actor: 'Magasin' },
      { date: DE(29, 10), status: 'en_cours', note: 'Prise en charge', actor: 'Omar Dieng' },
      { date: DE(29, 11), status: 'livree', note: 'Remise au client', actor: 'Omar Dieng' }
    ]
  },
  {
    id: 'dlv-002', ref: 'LVR-2026-0002', orderRef: 'CMD-2026-0002', customerId: 'cli-moussa',
    zoneId: 'zone-yopougon', courierId: 'crr-02', status: 'en_livraison', createdAt: DE(30, 8),
    events: [
      { date: DE(30, 8), status: 'preparation', note: 'Commande préparée', actor: 'Magasin' },
      { date: DE(30, 9), status: 'en_livraison', note: 'En tournée', actor: 'Aïssatou Kane' }
    ]
  },
  {
    id: 'dlv-003', ref: 'LVR-2026-0003', orderRef: 'CMD-2026-0003', customerId: 'cli-awa',
    zoneId: 'zone-marcory', courierId: 'crr-01', status: 'echouee', createdAt: DE(28, 14),
    failureReason: 'Client absent au point de remise',
    events: [
      { date: DE(28, 14), status: 'preparation', note: 'Commande préparée', actor: 'Magasin' },
      { date: DE(28, 16), status: 'echouee', note: 'Client absent', actor: 'Omar Dieng' }
    ]
  },
  {
    id: 'dlv-004', ref: 'LVR-2026-0004', orderRef: 'CMD-2026-0003', customerId: 'cli-awa',
    zoneId: 'zone-marcory', status: 'a_expedier', createdAt: DE(30, 7),
    events: [{ date: DE(30, 7), status: 'a_expedier', note: 'En attente de livreur', actor: 'Magasin' }]
  }
];

export function findDelivery(id: string): Delivery | undefined {
  return DELIVERIES.find((d) => d.id === id);
}

export function deliveriesOfCourier(courierId: string): Delivery[] {
  return DELIVERIES.filter((d) => d.courierId === courierId);
}

/** Charge du jour d'un livreur (livraisons actives). */
export function courierLoad(courierId: string): number {
  return DELIVERIES.filter(
    (d) => d.courierId === courierId && ['en_cours', 'en_livraison', 'a_expedier'].includes(d.status)
  ).length;
}

/* ---------------------------- motifs d'échec ----------------------------- */

export const FAILURE_REASONS = [
  'Client absent au point de remise',
  'Adresse introuvable ou incomplète',
  'Refus à la réception',
  'Moyen de paiement indisponible',
  'Colis endommagé en transit'
];

/* ----------------------------- statistiques ------------------------------ */

export type DeliveryStats = {
  total: number;
  livree: number;
  echouee: number;
  annulee: number;
  reprogrammee: number;
  /** Taux de réussite (%). */
  successRate: number;
  /** CA perdu : montants des commandes échouées + annulées. */
  lostRevenue: number;
  /** Répartition des motifs d'échec. */
  failureReasons: Array<{ reason: string; count: number }>;
};

/** Statistiques calculées LOCALEMENT à partir des expéditions de démonstration. */
export function deliveryStats(): DeliveryStats {
  const total = DELIVERIES.length;
  const livree = DELIVERIES.filter((d) => d.status === 'livree').length;
  const echouee = DELIVERIES.filter((d) => d.status === 'echouee').length;
  const annulee = DELIVERIES.filter((d) => d.status === 'annulee').length;
  const reprogrammee = DELIVERIES.filter((d) => d.status === 'reprogrammee').length;
  const successRate = total > 0 ? Math.round((livree / total) * 100) : 0;
  const lostRevenue = DELIVERIES.filter((d) => d.status === 'echouee' || d.status === 'annulee').reduce(
    (sum, d) => sum + orderAmount(d.orderRef),
    0
  );
  const reasonMap = new Map<string, number>();
  for (const d of DELIVERIES) {
    if (d.failureReason) reasonMap.set(d.failureReason, (reasonMap.get(d.failureReason) ?? 0) + 1);
  }
  return {
    total,
    livree,
    echouee,
    annulee,
    reprogrammee,
    successRate,
    lostRevenue,
    failureReasons: Array.from(reasonMap, ([reason, count]) => ({ reason, count }))
  };
}
