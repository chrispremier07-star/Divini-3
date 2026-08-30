/**
 * DIVINI exo — Manifeste de navigation
 *
 * LOT 02 §2.1 : la sidebar est GÉNÉRÉE depuis ce manifeste. Aucun item de
 * navigation n'est codé en dur dans un composant (interdit, LOT 02 §11).
 *
 * Un module déclare : identifiant, libellé, groupe, icône, permission requise,
 * statut, et le lot qui le livrera. C'est le statut — jamais le composant — qui
 * décide de ce qu'un clic produit.
 *
 * Les trois statuts ont des comportements distincts et obligatoires :
 *   - `disponible`  → ouvre son écran ;
 *   - `planifie`    → affiche « en construction — LOT nn », n'ouvre AUCUN
 *                     écran fictif ;
 *   - `nonActive`   → renvoie vers Abonnement → Modules. Jamais un simple
 *                     masquage (l. 451) : une capacité absente doit rester
 *                     visible et explorable.
 *
 * Données de démonstration, signalées comme telles (LOT 02 §10). Aucune donnée
 * financière, aucune statistique, aucun nom d'entreprise réel (V2.18).
 */

import type { IconName } from '../components/ui/Icon';

/** Identifiants des groupes — 7 au maximum (blueprint §9, corpus l. 229). */
export const NAV_GROUPS = [
  'operations',
  'finance',
  'intelligence',
  'communication',
  'pilotage',
  'organisation',
  'systeme'
] as const;

export type NavGroupId = (typeof NAV_GROUPS)[number];

export const NAV_GROUP_LABELS: Record<NavGroupId, string> = {
  operations: 'Opérations',
  finance: 'Finance',
  intelligence: 'Intelligence',
  communication: 'Communication',
  pilotage: 'Pilotage',
  organisation: 'Organisation',
  systeme: 'Système'
};

export type ModuleStatus = 'disponible' | 'planifie' | 'nonActive';

export type ModuleDescriptor = {
  /** Identifiant stable — sert de clé, de segment de route et de droit. */
  id: string;
  label: string;
  group: NavGroupId;
  icon: IconName;
  /** Permission requise. Aucune permission n'est effective dans ce lot. */
  permission: string;
  status: ModuleStatus;
  /** Lot qui livrera l'écran. Affiché tel quel à l'utilisateur. */
  lot?: number;
  /** Route réelle — présente uniquement si `status === 'disponible'`. */
  route?: string;
  /** Entrée visuellement séparée du tenant (Personal ERP, blueprint §9). */
  detached?: boolean;
  /** Courte description, pour l'état « en construction ». */
  summary?: string;
};

/**
 * Le manifeste.
 *
 * Depuis le LOT 05, le Cockpit est le premier écran livré : il est `disponible`
 * avec sa route réelle (`/app`). Tous les autres restent honnêtement `planifie`,
 * avec le lot réel qui les livrera. Marquer un module `nonActive` dans `/app`
 * laisserait croire qu'il est construit mais non souscrit — ce serait faux.
 * L'état `nonActive` est démontré dans `/dev/shell`, variation technique.
 */
export const MODULES: readonly ModuleDescriptor[] = [
  /* ------------------------------ OPÉRATIONS ----------------------------- */
  {
    id: 'cockpit',
    label: 'Cockpit',
    group: 'operations',
    icon: 'gauge',
    permission: 'cockpit.view',
    status: 'disponible',
    lot: 5,
    route: '/app',
    summary: 'Vue de pilotage du jour : activité, alertes, décisions à prendre.'
  },
  {
    id: 'ventes',
    label: 'Ventes & Commandes',
    group: 'operations',
    icon: 'cart',
    permission: 'sales.view',
    status: 'disponible',
    lot: 6,
    route: '/app/ventes',
    summary: 'Devis, commandes, avoirs et suivi du cycle de vente.'
  },
  {
    id: 'stocks',
    label: 'Stocks',
    group: 'operations',
    icon: 'package',
    permission: 'inventory.view',
    status: 'disponible',
    lot: 7,
    route: '/app/stocks',
    summary: 'Niveaux, mouvements, inventaires et seuils de réapprovisionnement.'
  },
  {
    id: 'crm',
    label: 'CRM',
    group: 'operations',
    icon: 'users',
    permission: 'crm.view',
    status: 'disponible',
    lot: 8,
    route: '/app/clients',
    summary: 'Prospects, clients, opportunités et historique des échanges.'
  },
  {
    id: 'livraisons',
    label: 'Livraisons',
    group: 'operations',
    icon: 'truck',
    permission: 'logistics.view',
    status: 'planifie',
    lot: 10,
    summary: 'Expéditions, tournées et preuve de livraison.'
  },
  {
    id: 'achats',
    label: 'Achats & Fournisseurs',
    group: 'operations',
    icon: 'receipt',
    permission: 'purchasing.view',
    status: 'planifie',
    lot: 11,
    summary: 'Demandes d’achat, commandes fournisseurs et réceptions.'
  },

  /* -------------------------------- FINANCE ------------------------------ */
  {
    id: 'tresorerie',
    label: 'Trésorerie',
    group: 'finance',
    icon: 'wallet',
    permission: 'treasury.view',
    status: 'planifie',
    lot: 9,
    summary: 'Soldes, flux prévisionnels et besoins de financement.'
  },
  {
    id: 'comptabilite',
    label: 'Comptabilité',
    group: 'finance',
    icon: 'book',
    permission: 'accounting.view',
    status: 'planifie',
    lot: 9,
    summary: 'Journal, grand livre et rapprochements.'
  },
  {
    id: 'depenses',
    label: 'Dépenses',
    group: 'finance',
    icon: 'creditCard',
    permission: 'expenses.view',
    status: 'planifie',
    lot: 9,
    summary: 'Notes de frais, justificatifs et validations.'
  },
  {
    id: 'fidelite',
    label: 'Fidélité',
    group: 'finance',
    icon: 'heart',
    permission: 'loyalty.view',
    status: 'planifie',
    lot: 10,
    summary: 'Programmes, cagnottes et avantages clients.'
  },

  /* ----------------------------- INTELLIGENCE ---------------------------- */
  {
    id: 'copilot',
    label: 'COPILOT',
    group: 'intelligence',
    icon: 'sparkles',
    permission: 'intelligence.copilot',
    status: 'planifie',
    lot: 14,
    summary: 'Assistant de décision contextuel.'
  },
  {
    id: 'autopilot',
    label: 'AUTOPILOT',
    group: 'intelligence',
    icon: 'wand',
    permission: 'intelligence.autopilot',
    status: 'planifie',
    lot: 14,
    summary: 'Exécution automatique de règles métier.'
  },
  {
    id: 'radar',
    label: 'RADAR',
    group: 'intelligence',
    icon: 'radar',
    permission: 'intelligence.radar',
    status: 'planifie',
    lot: 14,
    summary: 'Détection d’anomalies et de signaux faibles.'
  },
  {
    id: 'cash-vision',
    label: 'CASH VISION',
    group: 'intelligence',
    icon: 'trendingUp',
    permission: 'intelligence.cashvision',
    status: 'planifie',
    lot: 14,
    summary: 'Projection de trésorerie et scénarios.'
  },
  {
    id: 'guardian',
    label: 'GUARDIAN',
    group: 'intelligence',
    icon: 'shield',
    permission: 'intelligence.guardian',
    status: 'planifie',
    lot: 14,
    summary: 'Surveillance des risques et garde-fous.'
  },
  {
    id: 'alertes',
    label: 'Alertes',
    group: 'intelligence',
    icon: 'bell',
    permission: 'alerts.view',
    status: 'planifie',
    lot: 15,
    summary: 'Seuils, notifications et historique des alertes.'
  },

  /* ---------------------------- COMMUNICATION ---------------------------- */
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    group: 'communication',
    icon: 'messageCircle',
    permission: 'whatsapp.view',
    status: 'planifie',
    lot: 12,
    summary: 'Conversations, modèles et campagnes.'
  },
  {
    id: 'social',
    label: 'Social Media',
    group: 'communication',
    icon: 'share',
    permission: 'social.view',
    status: 'planifie',
    lot: 13,
    summary: 'Publications, calendrier éditorial et comptes liés.'
  },

  /* ------------------------------- PILOTAGE ------------------------------ */
  {
    id: 'rapports',
    label: 'Rapports & Indicateurs',
    group: 'pilotage',
    icon: 'barChart',
    permission: 'reports.view',
    status: 'planifie',
    lot: 15,
    summary: 'Tableaux de bord, exports et indicateurs suivis.'
  },
  {
    id: 'automatisation',
    label: 'Automatisation',
    group: 'pilotage',
    icon: 'zap',
    permission: 'automation.view',
    status: 'planifie',
    lot: 16,
    summary: 'Construction de workflows et déclencheurs.'
  },
  {
    id: 'documents',
    label: 'Documents',
    group: 'pilotage',
    icon: 'file',
    permission: 'documents.view',
    status: 'planifie',
    lot: 17,
    summary: 'Modèles documentaires et génération.'
  },

  /* ----------------------------- ORGANISATION ---------------------------- */
  {
    id: 'etablissements',
    label: 'Établissements',
    group: 'organisation',
    icon: 'building',
    permission: 'organization.sites',
    status: 'planifie',
    lot: 18,
    summary: 'Sites, horaires et rattachements.'
  },
  {
    id: 'utilisateurs',
    label: 'Utilisateurs & rôles',
    group: 'organisation',
    icon: 'userCheck',
    permission: 'organization.users',
    status: 'planifie',
    lot: 18,
    summary: 'Comptes, rôles et périmètres d’accès.'
  },
  {
    id: 'rh',
    label: 'Ressources humaines',
    group: 'organisation',
    icon: 'users',
    permission: 'organization.hr',
    status: 'planifie',
    lot: 11,
    summary: 'Équipes, plannings et présences.'
  },
  {
    id: 'abonnement',
    label: 'Abonnement',
    group: 'organisation',
    icon: 'creditCard',
    permission: 'billing.view',
    status: 'planifie',
    lot: 19,
    summary: 'Formule, modules activés et facturation.'
  },

  /* -------------------------------- SYSTÈME ------------------------------ */
  {
    id: 'parametres',
    label: 'Paramètres',
    group: 'systeme',
    icon: 'sliders',
    permission: 'system.settings',
    status: 'planifie',
    lot: 18,
    summary: 'Préférences générales de l’application.'
  },
  {
    id: 'integrations',
    label: 'Intégrations',
    group: 'systeme',
    icon: 'plug',
    permission: 'system.integrations',
    status: 'planifie',
    lot: 18,
    summary: 'Connexions externes et synchronisations.'
  },
  {
    id: 'audit',
    label: 'Audit & Sécurité',
    group: 'systeme',
    icon: 'shieldCheck',
    permission: 'system.audit',
    status: 'planifie',
    lot: 18,
    summary: 'Journal des actions et politique de sécurité.'
  },

  /* --------------------- Entrée détachée du tenant ----------------------- */
  {
    id: 'personal-erp',
    label: 'Personal ERP',
    group: 'operations',
    icon: 'home',
    permission: 'personal.view',
    status: 'planifie',
    lot: 23,
    detached: true,
    summary: 'Espace personnel, indépendant du tenant.'
  }
];

/**
 * Variations techniques réservées à `/dev/shell`.
 *
 * Aucun module du manifeste de production n'est `nonActive` : à ce stade du
 * projet aucun écran n'existe, et marquer un module « non activé » laisserait
 * croire qu'il est construit mais non souscrit — ce serait faux.
 *
 * Le statut `nonActive` doit pourtant être exercé (checklist §13). Il l'est
 * donc ici, sur un descripteur explicitement nommé et cantonné à la route
 * technique, sans jamais entrer dans la navigation réelle.
 */
export const DEV_VARIATION_MODULES: readonly ModuleDescriptor[] = [
  {
    id: 'dev-non-active',
    label: 'Module non activé',
    group: 'organisation',
    icon: 'lock',
    permission: 'demo.locked',
    status: 'nonActive',
    lot: 19,
    summary:
      'Variation technique : illustre le renvoi vers Abonnement → Modules, jamais un masquage.'
  }
];

/** Modules regroupés par groupe, dans l'ordre du manifeste. */
export function modulesByGroup(
  modules: readonly ModuleDescriptor[] = MODULES
): Array<{ group: NavGroupId; label: string; items: ModuleDescriptor[] }> {
  return NAV_GROUPS.map((group) => ({
    group,
    label: NAV_GROUP_LABELS[group],
    items: modules.filter((m) => m.group === group && !m.detached)
  })).filter((entry) => entry.items.length > 0);
}

/** Entrées détachées du tenant (Personal ERP). */
export function detachedModules(
  modules: readonly ModuleDescriptor[] = MODULES
): ModuleDescriptor[] {
  return modules.filter((m) => m.detached);
}

export function findModule(id: string): ModuleDescriptor | undefined {
  // Les variations techniques sont résolues après le manifeste : elles ne
  // peuvent donc jamais masquer un module réel de même identifiant.
  return MODULES.find((m) => m.id === id) ?? DEV_VARIATION_MODULES.find((m) => m.id === id);
}

/**
 * Ce qu'un clic sur un module doit produire.
 *
 * Centralisé ici pour qu'aucun composant n'invente son propre comportement :
 * c'est cette fonction, et elle seule, qui traduit un statut en action.
 */
/**
 * Identifiant du module vers lequel renvoie un module non activé.
 *
 * Doit exister dans le manifeste : un renvoi vers un module inexistant serait
 * un bouton mort, ce que le socle commun interdit. `tests/shell.test.mjs`
 * le vérifie.
 */
export const SUBSCRIPTION_MODULE_ID = 'abonnement';

export type ModuleAction =
  | { kind: 'navigate'; route: string }
  | { kind: 'planned'; lot: number }
  /** Renvoi explicite vers Abonnement → Modules, jamais un masquage (l. 451). */
  | { kind: 'subscribe'; target: string };

export function resolveModuleAction(module: ModuleDescriptor): ModuleAction {
  switch (module.status) {
    case 'disponible':
      // Une route est obligatoire pour un module disponible : sans elle,
      // l'entrée serait un bouton mort, ce que le socle commun interdit.
      return module.route ? { kind: 'navigate', route: module.route } : { kind: 'planned', lot: 0 };
    case 'nonActive':
      return { kind: 'subscribe', target: SUBSCRIPTION_MODULE_ID };
    case 'planifie':
    default:
      return { kind: 'planned', lot: module.lot ?? 0 };
  }
}
