/**
 * DIVINI exo — Cockpit · données de démonstration (LOT 05 §10)
 *
 * Mockées et **signalées** (bandeau permanent). Aucune donnée de source externe,
 * aucun chiffre d'entreprise réel (V2.18, l. 8334-8358).
 *
 * **Cohérence obligatoire (§10) :** les mêmes données alimentent signaux, missions,
 * KPI et graphique. Le CA annoncé est TOUJOURS la somme de la série affichée pour la
 * période choisie — le graphique et le KPI ne peuvent pas se contredire.
 *
 * Générateur déterministe (LCG) : le rendu serveur et client sont identiques, et
 * deux montages successifs produisent les mêmes valeurs (pas de divergence SSR).
 */

import type { IconName } from '../ui/Icon';

/* ------------------------------- Générateur ------------------------------- */

function lcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

/** Arrondit au millier de FCFA pour des valeurs plausibles et lisibles. */
function roundF(value: number): number {
  return Math.round(value / 1000) * 1000;
}

/* --------------------------------- Périodes ------------------------------- */

export type CockpitPeriod = 'today' | '7d' | '30d';

export const PERIOD_LABELS: Record<CockpitPeriod, string> = {
  today: "Aujourd'hui",
  '7d': '7 jours',
  '30d': '30 jours'
};

/* ------------------------------ Série de CA ------------------------------- */

/** 30 valeurs journalières déterministes (FCFA), cohérentes entre sections. */
const DAILY = (() => {
  const rand = lcg(20260830);
  const out: number[] = [];
  for (let i = 0; i < 30; i++) {
    const base = 850_000 + Math.sin(i / 4.2) * 180_000;
    out.push(roundF(base + rand() * 220_000));
  }
  return out;
})();

export type RevenueSeries = { labels: string[]; values: number[] };

export function revenueSeries(period: CockpitPeriod): RevenueSeries {
  if (period === 'today') {
    // Répartition horaire du dernier jour : la somme reconstitue le CA du jour.
    const dayTotal = DAILY[29] ?? 0;
    const weights = [4, 6, 8, 10, 12, 14, 12, 10];
    const sum = weights.reduce((a, b) => a + b, 0);
    let acc = 0;
    const values = weights.slice(0, -1).map((w) => {
      const v = roundF((dayTotal * w) / sum);
      acc += v;
      return v;
    });
    values.push(dayTotal - acc);
    return { labels: ['9h', '11h', '13h', '15h', '17h', '19h', '21h', '23h'], values };
  }
  const days = period === '7d' ? 7 : 30;
  const slice = DAILY.slice(30 - days);
  return {
    labels: slice.map((_, i) => `J-${days - 1 - i}`),
    values: slice
  };
}

/** CA annoncé = somme de la série affichée (cohérence KPI ⇄ graphique). */
export function revenueFor(period: CockpitPeriod): number {
  return revenueSeries(period).values.reduce((a, b) => a + b, 0);
}

/* --------------------------------- Signaux -------------------------------- */

export type SignalTone = 'critical' | 'warning' | 'info' | 'success';

export type CockpitSignal = {
  id: string;
  kind: 'watch' | 'good';
  tone: SignalTone;
  title: string;
  /** La cause, en une ligne. */
  cause: string;
  /** La donnée qui fonde le signal. */
  source: string;
  icon: IconName;
  action: { label: string; route?: string; lot?: number };
};

/** Destinations réelles livrées vs modules en construction. */
export const WATCH_SIGNALS: CockpitSignal[] = [
  {
    id: 'sig-stock',
    kind: 'watch',
    tone: 'warning',
    title: 'Risque de stock — 3 références sous le seuil',
    cause: 'Consommation supérieure à la moyenne sur 7 jours.',
    source: 'Stocks · seuils de réapprovisionnement',
    icon: 'package',
    action: { label: 'Voir les stocks', lot: 7 }
  },
  {
    id: 'sig-creance',
    kind: 'watch',
    tone: 'warning',
    title: 'Créance âgée — 45 jours (client de démonstration)',
    cause: 'Facture n° 000451 non réglée à échéance.',
    source: 'Ventes · encours clients',
    icon: 'creditCard',
    action: { label: 'Relancer le client', lot: 8 }
  },
  {
    id: 'sig-depenses',
    kind: 'watch',
    tone: 'info',
    title: '5 dépenses à valider',
    cause: 'Notes de frais en attente depuis 3 jours.',
    source: 'Dépenses · validations',
    icon: 'checkCircle',
    action: { label: 'Valider les dépenses', lot: 9 }
  },
  {
    id: 'sig-anomalie',
    kind: 'watch',
    tone: 'critical',
    title: 'Opération inhabituelle — avoir anormal',
    cause: 'Un avoir dépasse le panier moyen de la période.',
    source: 'Ventes · avoirs',
    icon: 'alertTriangle',
    action: { label: 'Examiner l’anomalie', lot: 15 }
  }
];

export const GOOD_SIGNALS: CockpitSignal[] = [
  {
    id: 'sig-croissance',
    kind: 'good',
    tone: 'success',
    title: 'CA en croissance de 12 % sur 7 jours',
    cause: 'Deux journées records cette semaine.',
    source: 'Ventes · CA',
    icon: 'trendingUp',
    action: { label: 'Voir les détails', route: '/dev/data' }
  },
  {
    id: 'sig-clients',
    kind: 'good',
    tone: 'success',
    title: '4 nouveaux clients cette semaine',
    cause: 'Effet de la campagne de proximité.',
    source: 'CRM · acquisitions',
    icon: 'users',
    action: { label: 'Voir le CRM', lot: 8 }
  },
  {
    id: 'sig-dormant',
    kind: 'good',
    tone: 'info',
    title: 'Stock dormant en baisse de 18 %',
    cause: 'Déstockage des références lentes.',
    source: 'Stocks · rotation',
    icon: 'package',
    action: { label: 'Voir les stocks', lot: 7 }
  }
];

/* --------------------------------- Missions ------------------------------- */

export type MissionStatus = 'todo' | 'doing' | 'done' | 'na';

export type Mission = {
  id: string;
  label: string;
  detail: string;
  /** Impact financier estimé — affiché comme estimation, jamais un résultat. */
  impact: string;
  status: MissionStatus;
  action: { label: string; lot?: number; route?: string };
};

export const MISSIONS: Mission[] = [
  {
    id: 'mis-relance',
    label: 'Relancer 8 clients en retard de paiement',
    detail: 'Créances de plus de 30 jours, montants décroissants.',
    impact: '≈ +450 000 F d’encaissements potentiels',
    status: 'todo',
    action: { label: 'Préparer les relances', lot: 8 }
  },
  {
    id: 'mis-commande',
    label: 'Commander 3 produits sous le seuil',
    detail: 'Évite trois ruptures d’ici 5 jours.',
    impact: '≈ 250 000 F de ventes protégées',
    status: 'doing',
    action: { label: 'Créer la commande', lot: 7 }
  },
  {
    id: 'mis-depenses',
    label: 'Valider 5 dépenses en attente',
    detail: 'Regularise le cycle de frais de la semaine.',
    impact: '≈ 180 000 F à regulariser',
    status: 'todo',
    action: { label: 'Valider', lot: 9 }
  }
];

/* ---------------------------------- KPI ----------------------------------- */

export type CockpitKpi = {
  id: string;
  label: string;
  value: number;
  format: 'fcfa' | 'count';
  delta: { value: number; direction: 'up' | 'down' | 'flat' };
  note: string;
};

export function cockpitKpis(period: CockpitPeriod): CockpitKpi[] {
  return [
    {
      id: 'kpi-ca',
      label: `CA — ${PERIOD_LABELS[period].toLowerCase()}`,
      value: revenueFor(period),
      format: 'fcfa',
      delta: { value: 12, direction: 'up' },
      note: 'Somme de la série affichée'
    },
    {
      id: 'kpi-treso',
      label: 'Trésorerie disponible',
      value: 2_350_000,
      format: 'fcfa',
      delta: { value: 4, direction: 'up' },
      note: 'Soldes consolidés (démo)'
    },
    {
      id: 'kpi-cmd',
      label: 'Commandes en cours',
      value: 14,
      format: 'count',
      delta: { value: 2, direction: 'up' },
      note: 'Tous établissements'
    },
    {
      id: 'kpi-alertes',
      label: 'Alertes critiques',
      value: 1,
      format: 'count',
      delta: { value: 0, direction: 'flat' },
      note: '1 opération inhabituelle'
    },
    {
      id: 'kpi-creances',
      label: 'Créances > 30 j',
      value: 450_000,
      format: 'fcfa',
      delta: { value: 6, direction: 'down' },
      note: '8 clients concernés'
    },
    {
      id: 'kpi-stock',
      label: 'Références à risque',
      value: 3,
      format: 'count',
      delta: { value: 1, direction: 'up' },
      note: 'Sous le seuil de réappro'
    }
  ];
}

export function formatFcfa(value: number): string {
  return `${value.toLocaleString('fr-FR')} F`;
}
