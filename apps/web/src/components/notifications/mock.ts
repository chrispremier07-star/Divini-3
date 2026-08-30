/**
 * DIVINI exo — Notification Center · flux de démonstration
 *
 * LOT 04 §10 : flux simulé localement, horodaté de façon plausible, **signalé**.
 *
 * Deux contraintes d'honnêteté :
 *  - aucune notification ne simule un paiement réel, une vente réelle ou un envoi
 *    WhatsApp/SMS réel (interdit n°3) ;
 *  - chaque notification porte une destination **réelle** (interdit n°2) : à ce
 *    stade, les écrans métier n'existent pas, les entrées de démonstration
 *    renvoient donc vers les surfaces réelles qui existent (galeries /dev, écrans
 *    de notification, accueil), jamais vers un écran fictif.
 *
 * L'horodatage part d'une ANCRE FIXE et non de `Date.now()` : le rendu serveur et
 * le rendu client produisent ainsi exactement les mêmes libellés (pas de
 * divergence d'hydratation).
 */

import type { AppNotification, NotificationCategory, NotificationSeverity } from './types';

/** Ancre temporelle de démonstration — stable entre serveur et client. */
const ANCHOR = Date.UTC(2026, 7, 29, 9, 0, 0); // 2026-08-29 09:00 UTC

function at(minutesAgo: number): string {
  return new Date(ANCHOR - minutesAgo * 60_000).toISOString();
}

type Seed = {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  body: string;
  minutesAgo: number;
  siteId: string;
  read: boolean;
  route: string;
  label: string;
};

/**
 * Une entrée par catégorie du corpus. Les entrées métier sont explicitement des
 * exemples de démonstration et renvoient vers une surface réelle existante.
 */
const SEEDS: Seed[] = [
  {
    id: 'n-anomalie',
    category: 'anomalies',
    severity: 'critical',
    title: 'Exemple critique (démonstration)',
    body: 'Illustration du ton critique : aucune fermeture automatique, lecture requise.',
    minutesAgo: 4,
    siteId: 'siege',
    read: false,
    route: '/app/notifications',
    label: 'Ouvrir le centre de notifications'
  },
  {
    id: 'n-alerte',
    category: 'alertes',
    severity: 'warning',
    title: 'Seuil d’alerte atteint (démonstration)',
    body: 'Exemple d’alerte de seuil. Aucune donnée réelle n’est surveillée ici.',
    minutesAgo: 22,
    siteId: 'atelier-centre',
    read: false,
    route: '/app/notifications',
    label: 'Voir les alertes'
  },
  {
    id: 'n-stock',
    category: 'stock',
    severity: 'warning',
    title: 'Stock bas — 3 références (démonstration)',
    body: 'Exemple de rupture approchée. À raccorder au module Stocks (LOT 07).',
    minutesAgo: 47,
    siteId: 'depot-est',
    read: false,
    route: '/dev/data',
    label: 'Voir la table de démonstration'
  },
  {
    id: 'n-vente',
    category: 'ventes',
    severity: 'success',
    title: 'Vente enregistrée (démonstration)',
    body: 'Exemple de vente. Aucun paiement réel n’a eu lieu.',
    minutesAgo: 70,
    siteId: 'boutique-littoral',
    read: false,
    route: '/dev/data',
    label: 'Voir les données de démonstration'
  },
  {
    id: 'n-paiement',
    category: 'paiements',
    severity: 'info',
    title: 'Paiement simulé (démonstration)',
    body: 'Le canal de paiement réel arrive avec le backend — rien n’est débité ici.',
    minutesAgo: 95,
    siteId: 'boutique-littoral',
    read: true,
    route: '/dev/data',
    label: 'Voir les données de démonstration'
  },
  {
    id: 'n-mouvement',
    category: 'mouvements',
    severity: 'info',
    title: 'Mouvement de stock (démonstration)',
    body: 'Exemple d’entrée/sortie de stock, généré localement.',
    minutesAgo: 130,
    siteId: 'depot-est',
    read: true,
    route: '/dev/data',
    label: 'Voir les mouvements de démonstration'
  },
  {
    id: 'n-livraison',
    category: 'livraisons',
    severity: 'info',
    title: 'Livraison planifiée (démonstration)',
    body: 'Exemple de tournée. Le module Livraisons arrive au LOT 10.',
    minutesAgo: 180,
    siteId: 'atelier-centre',
    read: true,
    route: '/dev/data',
    label: 'Voir la démonstration'
  },
  {
    id: 'n-validation',
    category: 'validations',
    severity: 'info',
    title: 'Préférences de notification à configurer',
    body: 'Choisissez vos canaux et catégories. Réglage réel, stocké localement.',
    minutesAgo: 240,
    siteId: 'siege',
    read: false,
    route: '/app/parametres/notifications',
    label: 'Configurer les préférences'
  },
  {
    id: 'n-activite',
    category: 'activite',
    severity: 'success',
    title: 'Galerie Data disponible',
    body: 'Les composants de données du LOT 03 sont consultables dans /dev/data.',
    minutesAgo: 300,
    siteId: 'siege',
    read: true,
    route: '/dev/data',
    label: 'Ouvrir la galerie Data'
  },
  {
    id: 'n-campagne',
    category: 'campagnes',
    severity: 'info',
    title: 'Campagnes reportées (LOT 12–13)',
    body: 'Aucun envoi WhatsApp/SMS réel n’est effectué dans ce lot.',
    minutesAgo: 360,
    siteId: 'siege',
    read: true,
    route: '/app/notifications',
    label: 'Voir le centre de notifications'
  },
  {
    id: 'n-abonnement',
    category: 'abonnement',
    severity: 'warning',
    title: 'Abonnement de démonstration',
    body: 'Aucune facturation réelle. Le module Abonnement arrive au LOT 19.',
    minutesAgo: 420,
    siteId: 'siege',
    read: true,
    route: '/app/parametres/notifications',
    label: 'Voir les préférences'
  },
  {
    id: 'n-sync',
    category: 'synchronisation',
    severity: 'info',
    title: 'Synchronisation locale simulée',
    body: 'Le canal temps réel (websocket) arrive avec le backend — flux local ici.',
    minutesAgo: 480,
    siteId: 'siege',
    read: true,
    route: '/app',
    label: 'Ouvrir l’accueil'
  }
];

export function makeNotifications(): AppNotification[] {
  return SEEDS.map((seed) => ({
    id: seed.id,
    category: seed.category,
    severity: seed.severity,
    title: seed.title,
    body: seed.body,
    at: at(seed.minutesAgo),
    siteId: seed.siteId,
    read: seed.read,
    destination: { route: seed.route, label: seed.label },
    demo: true
  }));
}

/** Libellé horodaté déterministe (fr-FR, UTC) — identique serveur et client. */
export function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  }).format(date);
}
