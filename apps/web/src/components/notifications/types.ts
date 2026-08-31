/**
 * DIVINI exo — Notification Center · types & contrat
 *
 * LOT 04 §2.2 : catégories, gravités, canaux et règle de destination.
 *
 * **Règle de destination (interdit n°2 du lot) :** chaque notification porte une
 * `destination` dont la `route` EXISTE réellement dans l'application. Une
 * notification sans écran actionnable est interdite — elle serait un bouton mort.
 *
 * **Honnêteté :** le flux est simulé localement et signalé comme tel. Aucune
 * notification ne prétend provenir d'un établissement réel, d'un paiement réel ou
 * d'un envoi WhatsApp/SMS réel (ceux-ci sont reportés aux lots 12 / backend).
 */

import type { IconName } from '../ui/Icon';

/** Les douze catégories du corpus (LOT 04 §2.2.3, l. 3294-3312). */
export const NOTIFICATION_CATEGORIES = [
  'ventes',
  'stock',
  'mouvements',
  'alertes',
  'livraisons',
  'anomalies',
  'paiements',
  'activite',
  'campagnes',
  'validations',
  'abonnement',
  'synchronisation'
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  ventes: 'Ventes',
  stock: 'Stock',
  mouvements: 'Mouvements',
  alertes: 'Alertes',
  livraisons: 'Livraisons',
  anomalies: 'Anomalies',
  paiements: 'Paiements',
  activite: 'Activité importante',
  campagnes: 'Campagnes',
  validations: 'Validations',
  abonnement: 'Abonnement',
  synchronisation: 'Synchronisation'
};

export const CATEGORY_ICON: Record<NotificationCategory, IconName> = {
  ventes: 'cart',
  stock: 'package',
  mouvements: 'refresh',
  alertes: 'bell',
  livraisons: 'truck',
  anomalies: 'alertTriangle',
  paiements: 'creditCard',
  activite: 'users',
  campagnes: 'messageCircle',
  validations: 'checkCircle',
  abonnement: 'shield',
  synchronisation: 'refresh'
};

/** Gravité — toujours accompagnée d'une icône et d'un texte (LOT 04 §6). */
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';

/** Destination réelle et actionnable. */
export type NotificationDestination = {
  /** Route existante — jamais un écran fictif. */
  route: string;
  /** Libellé de l'action : « Ouvrir », « Voir les préférences »… */
  label: string;
};

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  body: string;
  /** Horodatage ISO plausible. */
  at: string;
  /** Établissement émetteur — sert au filtrage par portée. */
  siteId: string;
  read: boolean;
  destination: NotificationDestination;
  /** Signale une entrée de démonstration (aucune donnée réelle). */
  demo?: boolean;
};

/** Canaux de diffusion (l. 2031-2052). Ici : in-app réel, les autres signalés. */
export const NOTIFICATION_CHANNELS = ['in-app', 'email', 'push', 'whatsapp', 'sms'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  'in-app': 'In-app',
  email: 'Email',
  push: 'Push',
  whatsapp: 'WhatsApp',
  sms: 'SMS'
};

/** État du flux local simulé (LOT 04 §9). */
export type NotificationFeedState = 'loading' | 'ready' | 'error' | 'offline' | 'syncing';
