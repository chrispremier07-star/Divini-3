/**
 * DIVINI exo — Command Center · index de recherche local (LOT 04 §2.1)
 *
 * L'index est CONSTRUIT, jamais codé dans le composant :
 *   - Navigation  → manifeste LOT 02 + écrans réels livrés ;
 *   - Entités     → données de démonstration signalées ;
 *   - Actions     → actions réelles du shell + actions métier planifiées ;
 *   - Analyse     → questions naturelles relayées vers COPILOT (LOT 14) ;
 *   - Tâches      → demandes relayées vers AUTOPILOT (LOT 14).
 *
 * Le filtrage est progressif, tolérant aux fautes de frappe et ordonné par
 * pertinence, avec surlignage de la correspondance (LOT 04 §2.1.3).
 *
 * **Garde-fous (§2.1.6) :** un module planifié ou non activé est présenté comme
 * tel (jamais une action disponible) ; une action sensible déclare sa permission
 * et passe par `ConfirmDialog`. COPILOT/AUTOPILOT ne sont JAMAIS simulés.
 */

import type { IconName } from '../ui/Icon';
import { MODULES, resolveModuleAction, type ModuleDescriptor } from '../../lib/modules';

export type CommandSection = 'navigation' | 'entites' | 'actions' | 'analyse' | 'taches';

export const SECTION_LABELS: Record<CommandSection, string> = {
  navigation: 'Navigation',
  entites: 'Entités',
  actions: 'Actions',
  analyse: 'Analyse',
  taches: 'Tâches'
};

export const SECTION_ORDER: CommandSection[] = [
  'navigation',
  'entites',
  'actions',
  'analyse',
  'taches'
];

export type CommandKind =
  /** Navigue vers une route réelle. */
  | 'navigate'
  /** Module planifié : affiche « en construction — LOT n », n'ouvre rien. */
  | 'planned'
  /** Module non activé : renvoi vers Abonnement → Modules. */
  | 'subscribe'
  /** Action réelle du shell nécessitant confirmation + permission. */
  | 'confirm'
  /** Question naturelle relayée vers COPILOT — non simulée. */
  | 'copilot'
  /** Demande relayée vers AUTOPILOT — non simulée. */
  | 'autopilot';

export type CommandItem = {
  id: string;
  section: CommandSection;
  label: string;
  icon: IconName;
  keywords: string[];
  kind: CommandKind;
  /** Hint affiché à droite : statut, LOT, permission ou relais. */
  hint?: string;
  route?: string;
  lot?: number;
  permission?: string;
  /** Identifiant d'entité de démonstration, le cas échéant. */
  entityId?: string;
};

/* ----------------------------- Normalisation ------------------------------ */

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dist = new Array<number>(rows * cols).fill(0);
  for (let i = 0; i < rows; i++) dist[i * cols] = i;
  for (let j = 0; j < cols; j++) dist[j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      dist[i * cols + j] = Math.min(
        (dist[(i - 1) * cols + j] ?? 0) + 1,
        (dist[i * cols + j - 1] ?? 0) + 1,
        (dist[(i - 1) * cols + j - 1] ?? 0) + cost
      );
    }
  }
  return dist[rows * cols - 1] ?? 0;
}

function targetScore(target: string, q: string): number {
  if (!q) return 1;
  if (target.includes(q)) return 100 - Math.min(target.indexOf(q), 40);
  const words = target.split(' ');
  if (words.some((w) => w.startsWith(q))) return 80;
  // Tolérance aux fautes de frappe : distance ≤ 1 sur un mot, ≤ 2 en global.
  if (q.length >= 3 && words.some((w) => levenshtein(w, q) <= 1)) return 55;
  if (q.length >= 4 && levenshtein(target, q) <= 2) return 45;
  // Sous-séquence (permet « fctre » → « facture »).
  let i = 0;
  for (const ch of target) {
    if (ch === q[i]) i++;
    if (i === q.length) return 30;
  }
  return 0;
}

export function scoreCommand(item: CommandItem, query: string): number {
  const q = normalize(query);
  const targets = [normalize(item.label), ...item.keywords.map(normalize)];
  return Math.max(...targets.map((t) => targetScore(t, q)));
}

/** Résultats groupés par section, ordonnés par pertinence. */
export function searchCommands(
  index: CommandItem[],
  query: string,
  perSection = 6
): Array<{ section: CommandSection; items: CommandItem[] }> {
  const scored = index
    .map((item) => ({ item, score: scoreCommand(item, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return SECTION_ORDER.map((section) => ({
    section,
    items: scored
      .filter((entry) => entry.item.section === section)
      .slice(0, perSection)
      .map((entry) => entry.item)
  })).filter((group) => group.items.length > 0);
}

/** Segments de surlignage (correspondance insensible casse + diacritiques). */
export function highlightSegments(
  label: string,
  query: string
): Array<{ text: string; match: boolean }> {
  const q = normalize(query);
  if (!q) return [{ text: label, match: false }];

  const normLabel = normalize(label);
  const index = normLabel.indexOf(q);
  if (index === -1) return [{ text: label, match: false }];

  // La normalisation ne change pas la longueur ici (on remplace 1:1), donc les
  // indices normalisés correspondent aux indices du libellé d'origine.
  return [
    { text: label.slice(0, index), match: false },
    { text: label.slice(index, index + q.length), match: true },
    { text: label.slice(index + q.length), match: false }
  ].filter((seg) => seg.text.length > 0);
}

/* ------------------------------ Construction ------------------------------ */

function moduleToCommand(module: ModuleDescriptor): CommandItem {
  const action = resolveModuleAction(module);
  if (action.kind === 'navigate') {
    return {
      id: `nav-${module.id}`,
      section: 'navigation',
      label: module.label,
      icon: module.icon,
      keywords: [module.group],
      kind: 'navigate',
      route: action.route
    };
  }
  if (action.kind === 'subscribe') {
    return {
      id: `nav-${module.id}`,
      section: 'navigation',
      label: module.label,
      icon: module.icon,
      keywords: [module.group],
      kind: 'subscribe',
      hint: 'Non activé'
    };
  }
  return {
    id: `nav-${module.id}`,
    section: 'navigation',
    label: module.label,
    icon: module.icon,
    keywords: [module.group, module.summary ?? ''],
    kind: 'planned',
    lot: action.lot,
    hint: `LOT ${action.lot}`
  };
}

type EntitySeed = {
  id: string;
  label: string;
  kind: string;
  icon: IconName;
  lot: number;
  keywords: string[];
};

const ENTITY_SEEDS: EntitySeed[] = [
  { id: 'cli-001', label: 'Client — Awa Diop', kind: 'Client', icon: 'users', lot: 8, keywords: ['client', 'crm'] },
  { id: 'cli-002', label: 'Client — Moussa Traoré', kind: 'Client', icon: 'users', lot: 8, keywords: ['client', 'crm'] },
  { id: 'prd-001', label: 'Produit — Référence 000312', kind: 'Produit', icon: 'package', lot: 7, keywords: ['produit', 'stock'] },
  { id: 'fct-001', label: 'Facture — n° 000451', kind: 'Facture', icon: 'file', lot: 6, keywords: ['facture', 'vente'] },
  { id: 'cmd-001', label: 'Commande — n° 000128', kind: 'Commande', icon: 'cart', lot: 6, keywords: ['commande', 'vente'] },
  { id: 'etb-001', label: 'Établissement — Atelier Centre', kind: 'Établissement', icon: 'building', lot: 18, keywords: ['etablissement', 'site'] }
];

const ANALYSE_SEEDS = [
  'Quel est mon chiffre d’affaires cette semaine ?',
  'Quels produits se vendent le mieux ce mois-ci ?',
  'Où en est ma trésorerie prévisionnelle ?'
];

const TACHES_SEEDS = [
  'Relance les factures en retard de plus de 7 jours',
  'Prépare un réassort pour les références sous le seuil',
  'Planifie une campagne pour les clients inactifs'
];

/** Écrans réels livrés, toujours proposés en navigation. */
const REAL_SCREENS: CommandItem[] = [
  { id: 'screen-home', section: 'navigation', label: 'Accueil', icon: 'home', keywords: ['accueil', 'home'], kind: 'navigate', route: '/app' },
  { id: 'screen-notif', section: 'navigation', label: 'Notifications', icon: 'bell', keywords: ['notifications', 'centre'], kind: 'navigate', route: '/app/notifications' },
  { id: 'screen-prefs', section: 'navigation', label: 'Préférences de notification', icon: 'sliders', keywords: ['preferences', 'reglages'], kind: 'navigate', route: '/app/parametres/notifications' }
];

/** Actions réelles du shell (effet immédiat, aucune donnée métier). */
const SHELL_ACTIONS: CommandItem[] = [
  { id: 'act-open-notif', section: 'actions', label: 'Ouvrir le centre de notifications', icon: 'bell', keywords: ['notifications'], kind: 'navigate', route: '/app/notifications' },
  { id: 'act-open-prefs', section: 'actions', label: 'Configurer les préférences de notification', icon: 'sliders', keywords: ['preferences'], kind: 'navigate', route: '/app/parametres/notifications' },
  {
    id: 'act-reset-prefs',
    section: 'actions',
    label: 'Réinitialiser les préférences de notification',
    icon: 'refresh',
    keywords: ['preferences', 'reinitialiser'],
    kind: 'confirm',
    permission: 'system.settings',
    hint: 'Sensible'
  }
];

/** Actions métier : présentes mais planifiées, jamais exécutables ici. */
const BUSINESS_ACTIONS: CommandItem[] = [
  { id: 'act-new-sale', section: 'actions', label: 'Nouvelle vente', icon: 'cart', keywords: ['vente', 'creer', 'pos'], kind: 'navigate', route: '/app/ventes/pos', permission: 'sales.create', hint: 'POS' },
  { id: 'act-new-expense', section: 'actions', label: 'Enregistrer une dépense', icon: 'creditCard', keywords: ['depense', 'finance'], kind: 'planned', lot: 9, permission: 'expenses.create', hint: 'LOT 9' },
  { id: 'act-new-reminder', section: 'actions', label: 'Créer une relance', icon: 'messageCircle', keywords: ['relance', 'crm'], kind: 'navigate', route: '/app/relances', permission: 'crm.remind', hint: 'CRM' },
  { id: 'act-new-stock', section: 'actions', label: 'Nouveau mouvement de stock', icon: 'package', keywords: ['stock', 'mouvement'], kind: 'navigate', route: '/app/stocks/mouvements/nouveau', permission: 'inventory.move', hint: 'Stocks' }
];

export function buildCommandIndex(): CommandItem[] {
  return [
    ...REAL_SCREENS,
    ...MODULES.map(moduleToCommand),
    ...ENTITY_SEEDS.map((e): CommandItem => ({
      id: `ent-${e.id}`,
      section: 'entites',
      label: e.label,
      icon: e.icon,
      keywords: e.keywords,
      kind: 'planned',
      lot: e.lot,
      entityId: e.id,
      hint: `${e.kind} · LOT ${e.lot}`
    })),
    ...SHELL_ACTIONS,
    ...BUSINESS_ACTIONS,
    ...ANALYSE_SEEDS.map((q, i): CommandItem => ({
      id: `ana-${i}`,
      section: 'analyse',
      label: q,
      icon: 'sparkles',
      keywords: ['copilot', 'analyse'],
      kind: 'copilot',
      hint: 'COPILOT · LOT 14'
    })),
    ...TACHES_SEEDS.map((q, i): CommandItem => ({
      id: `tac-${i}`,
      section: 'taches',
      label: q,
      icon: 'wand',
      keywords: ['autopilot', 'tache'],
      kind: 'autopilot',
      hint: 'AUTOPILOT · LOT 14'
    }))
  ];
}
