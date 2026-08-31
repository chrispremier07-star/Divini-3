/**
 * DIVINI exo — CRM · modèle de données de démonstration (LOT 08)
 *
 * FRONTEND ONLY. Données mockées, signalées comme telles. Aucune donnée
 * personnelle réelle, aucune collecte réelle de consentement, aucun envoi.
 *
 * Points non négociables (corpus II.9, l. 5259-5609) :
 *  - le consentement est historisé, vérifiable, **non modifiable silencieusement** :
 *    toute modification AJOUTE un événement à `CONSENT_HISTORY`, n'efface rien ;
 *  - un consentement **inconnu** n'est JAMAIS interprété comme accordé
 *    (`isGranted` retourne false pour `unknown`) ;
 *  - consentement ≠ autorisation d'envoi (`canSendNow` est distinct) ;
 *  - la règle VIP est **configurable** (`VIP_RULE`), jamais codée en dur ;
 *  - LTV et taux de conversion sont des valeurs mockées **signalées**.
 *
 * Cohérence LOT 06 : les clients reprennent les noms des documents de vente
 * (`SALES_DOCS.customer`) ; l'historique d'achats est dérivé de ces documents.
 */

import { SALES_DOCS, formatFcfa } from '../sales/mock';

export { formatFcfa };

/* --------------------------------- clients -------------------------------- */

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  segment: string;
  /** Solde de points de fidélité — démonstration (attribution réelle au LOT 10). */
  points: number;
  createdAt: string;
  archived?: boolean;
  /** Blocages de communication (voir consentements). */
  doNotContact?: boolean;
  globalBlock?: boolean;
};

/** Référence « aujourd'hui » de démonstration. */
export const CRM_TODAY = new Date(Date.UTC(2026, 7, 30)).toISOString();

export const CLIENTS: Client[] = [
  {
    id: 'cli-awa',
    name: 'Awa Diop',
    phone: '+221 77 000 11 22',
    email: 'awa.diop@exemple.sn',
    segment: 'VIP',
    points: 1240,
    createdAt: new Date(Date.UTC(2025, 2, 14)).toISOString()
  },
  {
    id: 'cli-moussa',
    name: 'Moussa Traoré',
    phone: '+221 78 000 33 44',
    email: 'moussa.traore@exemple.sn',
    segment: 'Fidèle',
    points: 480,
    createdAt: new Date(Date.UTC(2025, 6, 3)).toISOString()
  },
  {
    id: 'cli-fatou',
    name: 'Fatou Ndiaye',
    phone: '+221 76 000 55 66',
    email: 'fatou.ndiaye@exemple.sn',
    segment: 'Actif',
    points: 150,
    createdAt: new Date(Date.UTC(2026, 0, 22)).toISOString()
  },
  {
    id: 'cli-ibrahima',
    name: 'Ibrahima Sow',
    phone: '+221 70 000 77 88',
    email: 'ibrahima.sow@exemple.sn',
    segment: 'Occasionnel',
    points: 40,
    createdAt: new Date(Date.UTC(2026, 5, 9)).toISOString(),
    doNotContact: true
  },
  {
    id: 'cli-aicha',
    name: 'Aïcha Ba',
    phone: '+221 79 000 99 00',
    email: 'aicha.ba@exemple.sn',
    segment: 'Nouveau',
    points: 20,
    createdAt: new Date(Date.UTC(2026, 7, 12)).toISOString()
  }
];

export function findClient(id: string): Client | undefined {
  return CLIENTS.find((c) => c.id === id);
}

/** Nom tel qu'il apparaît dans les documents de vente du LOT 06. */
function salesCustomerName(client: Client): string {
  return `Client — ${client.name}`;
}

/** Historique d'achats dérivé des documents de vente LOT 06 (cohérence). */
export function purchasesOf(clientId: string) {
  const client = findClient(clientId);
  if (!client) return [];
  const name = salesCustomerName(client);
  return SALES_DOCS.filter(
    (d) => d.customer === name && (d.kind === 'vente' || d.kind === 'facture')
  );
}

/* ------------------------------ règle VIP -------------------------------- */

/**
 * Règle VIP — CONFIGURABLE et affichée comme telle (interdit §11 : jamais codée
 * en dur). Défaut produit : 10+ achats ET CA total ≥ 500 000 FCFA.
 */
export type VipRule = {
  minPurchases: number;
  minRevenue: number; // FCFA
};

export const VIP_RULE: VipRule = { minPurchases: 10, minRevenue: 500_000 };

/** CA total d'un client (somme des factures/ventes LOT 06), en FCFA. */
export function clientRevenue(clientId: string): number {
  return purchasesOf(clientId).reduce((sum, d) => {
    const total = d.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) - d.discount;
    return sum + total;
  }, 0);
}

/** Un client satisfait-il la règle VIP donnée ? */
export function qualifiesVip(clientId: string, rule: VipRule = VIP_RULE): boolean {
  const purchases = purchasesOf(clientId).length;
  const revenue = clientRevenue(clientId);
  return purchases >= rule.minPurchases && revenue >= rule.minRevenue;
}

/* ----------------------------- indicateurs ------------------------------- */

/**
 * Indicateurs clients (l. 1660-1674). Valeurs mockées **signalées** : la LTV et
 * le taux de conversion ne sont pas des mesures réelles (interdit §11).
 */
export type ClientMetrics = {
  total: number;
  newThisMonth: number;
  active: number;
  loyal: number;
  vip: number;
  pointsInCirculation: number;
  averageBasket: number;
  averageRevenuePerClient: number;
  /** Mockée — signalée comme estimation, jamais une mesure réelle. */
  estimatedLtv: number;
};

export function clientMetrics(rule: VipRule = VIP_RULE): ClientMetrics {
  const total = CLIENTS.length;
  const newThisMonth = CLIENTS.filter((c) => c.createdAt >= new Date(Date.UTC(2026, 7, 1)).toISOString()).length;
  const active = CLIENTS.filter((c) => c.segment === 'Actif' || c.segment === 'VIP' || c.segment === 'Fidèle').length;
  const loyal = CLIENTS.filter((c) => c.segment === 'Fidèle' || c.segment === 'VIP').length;
  const vip = CLIENTS.filter((c) => qualifiesVip(c.id, rule)).length;
  const pointsInCirculation = CLIENTS.reduce((s, c) => s + c.points, 0);
  const allPurchases = CLIENTS.flatMap((c) => purchasesOf(c.id));
  const totalRevenue = CLIENTS.reduce((s, c) => s + clientRevenue(c.id), 0);
  const averageBasket = allPurchases.length > 0 ? Math.round(totalRevenue / allPurchases.length) : 0;
  const averageRevenuePerClient = total > 0 ? Math.round(totalRevenue / total) : 0;
  // LTV mockée : CA moyen × facteur de démonstration. Signalée comme estimation.
  const estimatedLtv = Math.round(averageRevenuePerClient * 3.5);
  return {
    total,
    newThisMonth,
    active,
    loyal,
    vip,
    pointsInCirculation,
    averageBasket,
    averageRevenuePerClient,
    estimatedLtv
  };
}

/* ------------------------------- segments -------------------------------- */

export type Segment = {
  id: string;
  label: string;
  /** Critères en langage lisible. */
  criteria: string;
  /** Cibles concernées (ids de clients) — démonstration. */
  memberIds: string[];
  /** Le segment VIP référence la règle configurable. */
  isVipRule?: boolean;
};

export const SEGMENTS: Segment[] = [
  {
    id: 'seg-vip',
    label: 'VIP',
    criteria: '10+ achats ET CA total ≥ 500 000 FCFA (règle configurable)',
    memberIds: CLIENTS.filter((c) => qualifiesVip(c.id)).map((c) => c.id),
    isVipRule: true
  },
  {
    id: 'seg-fidele',
    label: 'Fidèles',
    criteria: 'Segment « Fidèle » ou « VIP »',
    memberIds: CLIENTS.filter((c) => c.segment === 'Fidèle' || c.segment === 'VIP').map((c) => c.id)
  },
  {
    id: 'seg-actif',
    label: 'Actifs',
    criteria: 'Achat au cours des 90 derniers jours',
    memberIds: CLIENTS.filter((c) => c.segment === 'Actif').map((c) => c.id)
  },
  {
    id: 'seg-nouveau',
    label: 'Nouveaux',
    criteria: 'Créés ce mois-ci',
    memberIds: CLIENTS.filter((c) => c.createdAt >= new Date(Date.UTC(2026, 7, 1)).toISOString()).map((c) => c.id)
  }
];

export function findSegment(id: string): Segment | undefined {
  return SEGMENTS.find((s) => s.id === id);
}

/* ------------------------------- prospects ------------------------------- */

export type InterestLevel = 1 | 2 | 3 | 4 | 5;

export const INTEREST_LABELS: Record<InterestLevel, string> = {
  1: 'Très faible',
  2: 'Faible',
  3: 'Moyen',
  4: 'Élevé',
  5: 'Très élevé'
};

export type ProspectSource =
  | 'boutique'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'whatsapp'
  | 'site'
  | 'autres';

export const SOURCE_LABELS: Record<ProspectSource, string> = {
  boutique: 'Boutique',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  site: 'Site web',
  autres: 'Autres'
};

export type ProspectStatus = 'a_recontacter' | 'en_cours' | 'converti' | 'perdu' | 'sans_interet';

export const PROSPECT_STATUS_META: Record<ProspectStatus, { label: string; tone: 'info' | 'warning' | 'success' | 'critical' | 'neutral' }> = {
  a_recontacter: { label: 'À recontacter', tone: 'warning' },
  en_cours: { label: 'En cours', tone: 'info' },
  converti: { label: 'Converti', tone: 'success' },
  perdu: { label: 'Perdu', tone: 'critical' },
  sans_interet: { label: 'Sans intérêt', tone: 'neutral' }
};

export type Prospect = {
  id: string;
  name: string;
  contact: string;
  interest: InterestLevel;
  source: ProspectSource;
  status: ProspectStatus;
  createdAt: string;
  note?: string;
};

export const PROSPECTS: Prospect[] = [
  { id: 'pro-01', name: 'Cheikh Mbaye', contact: '+221 77 111 22 33', interest: 5, source: 'whatsapp', status: 'en_cours', createdAt: new Date(Date.UTC(2026, 7, 20)).toISOString(), note: 'Demande de devis gros volume.' },
  { id: 'pro-02', name: 'Mariama Sy', contact: 'mariama.sy@exemple.sn', interest: 4, source: 'instagram', status: 'a_recontacter', createdAt: new Date(Date.UTC(2026, 7, 24)).toISOString() },
  { id: 'pro-03', name: 'Ousmane Fall', contact: '+221 78 222 33 44', interest: 2, source: 'facebook', status: 'a_recontacter', createdAt: new Date(Date.UTC(2026, 7, 18)).toISOString() },
  { id: 'pro-04', name: 'Khady Dieng', contact: 'khady.dieng@exemple.sn', interest: 5, source: 'site', status: 'converti', createdAt: new Date(Date.UTC(2026, 6, 30)).toISOString() },
  { id: 'pro-05', name: 'Serigne Gueye', contact: '+221 76 333 44 55', interest: 1, source: 'tiktok', status: 'perdu', createdAt: new Date(Date.UTC(2026, 6, 12)).toISOString() },
  { id: 'pro-06', name: 'Ndèye Sow', contact: '+221 70 444 55 66', interest: 3, source: 'boutique', status: 'en_cours', createdAt: new Date(Date.UTC(2026, 7, 26)).toISOString() }
];

export function findProspect(id: string): Prospect | undefined {
  return PROSPECTS.find((p) => p.id === id);
}

/** Indicateurs prospects (l. 1699-1732). Taux de conversion mocké, signalé. */
export function prospectMetrics() {
  const total = PROSPECTS.length;
  const nouveaux = PROSPECTS.filter((p) => p.createdAt >= new Date(Date.UTC(2026, 7, 1)).toISOString()).length;
  const interetEleve = PROSPECTS.filter((p) => p.interest >= 4).length;
  const aRecontacter = PROSPECTS.filter((p) => p.status === 'a_recontacter').length;
  const convertis = PROSPECTS.filter((p) => p.status === 'converti').length;
  const relances = 3; // démonstration
  const tauxConversion = total > 0 ? Math.round((convertis / total) * 100) : 0; // mocké
  return { total, nouveaux, interetEleve, relances, aRecontacter, convertis, tauxConversion };
}

/* ------------------------------- relances -------------------------------- */

export type ScenarioTrigger =
  | 'apres_achat'
  | 'apres_creation'
  | 'anniversaire'
  | 'seuil_points'
  | 'personnalise';

export const TRIGGER_LABELS: Record<ScenarioTrigger, string> = {
  apres_achat: 'Après achat',
  apres_creation: 'Après création de contact',
  anniversaire: 'Anniversaire',
  seuil_points: 'Seuil de points',
  personnalise: 'Personnalisé'
};

export type ScenarioAudience =
  | 'nouveaux'
  | 'actifs'
  | 'fideles'
  | 'vip'
  | 'occasionnels'
  | 'inactifs'
  | 'a_risque'
  | 'perdus';

export const AUDIENCE_LABELS: Record<ScenarioAudience, string> = {
  nouveaux: 'Nouveaux',
  actifs: 'Actifs',
  fideles: 'Fidèles',
  vip: 'VIP',
  occasionnels: 'Occasionnels',
  inactifs: 'Inactifs',
  a_risque: 'À risque',
  perdus: 'Perdus'
};

export type Scenario = {
  id: string;
  label: string;
  trigger: ScenarioTrigger;
  audience: ScenarioAudience;
  action: string;
  frequency: string;
  active: boolean;
  recurrent: boolean;
  schedulable: boolean;
  /** Audit visuel : dernières exécutions (démonstration, aucun envoi réel). */
  auditTrail: Array<{ date: string; result: string }>;
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'sc-01',
    label: 'Remerciement post-achat',
    trigger: 'apres_achat',
    audience: 'nouveaux',
    action: 'Message de remerciement + conseil produit',
    frequency: 'J+1 après achat',
    active: true,
    recurrent: false,
    schedulable: true,
    auditTrail: [{ date: new Date(Date.UTC(2026, 7, 28)).toISOString(), result: 'Prêt à envoyer (non envoyé — démo)' }]
  },
  {
    id: 'sc-02',
    label: 'Bienvenue nouveau contact',
    trigger: 'apres_creation',
    audience: 'nouveaux',
    action: 'Série de bienvenue (3 messages)',
    frequency: 'J+0, J+3, J+7',
    active: true,
    recurrent: true,
    schedulable: true,
    auditTrail: []
  },
  {
    id: 'sc-03',
    label: 'Réactivation inactifs',
    trigger: 'personnalise',
    audience: 'inactifs',
    action: 'Offre de réactivation',
    frequency: 'Mensuel',
    active: false,
    recurrent: true,
    schedulable: true,
    auditTrail: []
  },
  {
    id: 'sc-04',
    label: 'Anniversaire client',
    trigger: 'anniversaire',
    audience: 'fideles',
    action: 'Vœux + code fidélité',
    frequency: 'Annuel',
    active: true,
    recurrent: true,
    schedulable: true,
    auditTrail: []
  }
];

export function findScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

/* ----------------------------- consentements ----------------------------- */

/**
 * Statuts de consentement. `unknown` est un statut à part entière : il n'est
 * JAMAIS interprété comme accordé (corpus l. 1103, interdit §11).
 */
export type ConsentStatus = 'granted' | 'refused' | 'withdrawn' | 'expired' | 'unknown';

export const CONSENT_STATUS_META: Record<
  ConsentStatus,
  { label: string; tone: 'success' | 'critical' | 'warning' | 'neutral' }
> = {
  granted: { label: 'Accordé', tone: 'success' },
  refused: { label: 'Refusé', tone: 'critical' },
  withdrawn: { label: 'Retiré', tone: 'warning' },
  expired: { label: 'Expiré', tone: 'neutral' },
  unknown: { label: 'Inconnu', tone: 'neutral' }
};

export type ConsentCategory = 'sms' | 'email' | 'whatsapp' | 'phone' | 'postal';

export const CONSENT_CATEGORY_LABELS: Record<ConsentCategory, string> = {
  sms: 'SMS',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  phone: 'Appel téléphonique',
  postal: 'Courrier postal'
};

export type Consent = {
  clientId: string;
  category: ConsentCategory;
  status: ConsentStatus;
  /** Source de la collecte (démonstration). */
  source: string;
  /** Méthode de collecte. */
  method: string;
  date: string;
  /** Preuve consultable (référence) — peut manquer. */
  proof?: string;
};

/**
 * Consentements de démonstration, volontairement variés : accordé, refusé,
 * retiré, expiré et **inconnu**. Preuves présentes ou manquantes.
 */
export const CONSENTS: Consent[] = [
  { clientId: 'cli-awa', category: 'sms', status: 'granted', source: 'Boutique', method: 'Formulaire papier signé', date: new Date(Date.UTC(2025, 2, 14)).toISOString(), proof: 'PRF-SMS-0001' },
  { clientId: 'cli-awa', category: 'email', status: 'granted', source: 'Site web', method: 'Double opt-in', date: new Date(Date.UTC(2025, 2, 15)).toISOString(), proof: 'PRF-EM-0001' },
  { clientId: 'cli-awa', category: 'whatsapp', status: 'unknown', source: 'Import historique', method: 'Inconnue', date: new Date(Date.UTC(2025, 1, 1)).toISOString() },
  { clientId: 'cli-moussa', category: 'sms', status: 'granted', source: 'Boutique', method: 'Cases cochées', date: new Date(Date.UTC(2025, 6, 3)).toISOString(), proof: 'PRF-SMS-0002' },
  { clientId: 'cli-moussa', category: 'email', status: 'withdrawn', source: 'Site web', method: 'Double opt-in', date: new Date(Date.UTC(2026, 3, 10)).toISOString(), proof: 'PRF-EM-0002' },
  { clientId: 'cli-fatou', category: 'email', status: 'granted', source: 'Site web', method: 'Double opt-in', date: new Date(Date.UTC(2026, 0, 22)).toISOString(), proof: 'PRF-EM-0003' },
  { clientId: 'cli-fatou', category: 'phone', status: 'refused', source: 'Boutique', method: 'Oral consigné', date: new Date(Date.UTC(2026, 0, 22)).toISOString() },
  { clientId: 'cli-ibrahima', category: 'sms', status: 'expired', source: 'Boutique', method: 'Formulaire', date: new Date(Date.UTC(2024, 5, 1)).toISOString(), proof: 'PRF-SMS-0003' },
  { clientId: 'cli-ibrahima', category: 'email', status: 'unknown', source: 'Import historique', method: 'Inconnue', date: new Date(Date.UTC(2024, 5, 1)).toISOString() },
  { clientId: 'cli-ibrahima', category: 'whatsapp', status: 'granted', source: 'WhatsApp', method: 'Mot-clé OK', date: new Date(Date.UTC(2024, 6, 1)).toISOString(), proof: 'PRF-WA-0002' },
  { clientId: 'cli-aicha', category: 'whatsapp', status: 'granted', source: 'WhatsApp', method: 'Mot-clé STOP/OK', date: new Date(Date.UTC(2026, 7, 12)).toISOString(), proof: 'PRF-WA-0001' }
];

export function consentsOf(clientId: string): Consent[] {
  return CONSENTS.filter((c) => c.clientId === clientId);
}

export function consentOf(clientId: string, category: ConsentCategory): Consent | undefined {
  return CONSENTS.find((c) => c.clientId === clientId && c.category === category);
}

/**
 * Le consentement est-il accordé ? `unknown` retourne **false** — un
 * consentement inconnu n'est jamais traité comme un accord (interdit §11).
 */
export function isGranted(consent: Consent | undefined): boolean {
  return consent?.status === 'granted';
}

/* ------------------------- historique immuable --------------------------- */

export type ConsentEvent = {
  id: string;
  clientId: string;
  category: ConsentCategory;
  from: ConsentStatus | null;
  to: ConsentStatus;
  actor: string;
  reason: string;
  date: string;
};

/**
 * Historique des consentements — **immuable**. Chaque modification AJOUTE un
 * événement ; aucun événement n'est jamais supprimé ni écrasé. C'est la trace
 * vérifiable exigée par le corpus (II.9).
 */
export const CONSENT_HISTORY: ConsentEvent[] = [
  { id: 'ev-001', clientId: 'cli-awa', category: 'sms', from: null, to: 'granted', actor: 'A. Diallo', reason: 'Collecte boutique', date: new Date(Date.UTC(2025, 2, 14)).toISOString() },
  { id: 'ev-002', clientId: 'cli-awa', category: 'email', from: null, to: 'granted', actor: 'Système', reason: 'Double opt-in confirmé', date: new Date(Date.UTC(2025, 2, 15)).toISOString() },
  { id: 'ev-003', clientId: 'cli-moussa', category: 'email', from: 'granted', to: 'withdrawn', actor: 'M. Traoré', reason: 'Désinscription via lien', date: new Date(Date.UTC(2026, 3, 10)).toISOString() },
  { id: 'ev-004', clientId: 'cli-fatou', category: 'phone', from: null, to: 'refused', actor: 'F. Ndiaye', reason: 'Refus explicite en boutique', date: new Date(Date.UTC(2026, 0, 22)).toISOString() },
  { id: 'ev-005', clientId: 'cli-ibrahima', category: 'sms', from: 'granted', to: 'expired', actor: 'Système', reason: 'Durée de validité écoulée', date: new Date(Date.UTC(2026, 5, 1)).toISOString() }
];

export function historyOf(clientId: string): ConsentEvent[] {
  return CONSENT_HISTORY.filter((e) => e.clientId === clientId).sort((a, b) =>
    a.date < b.date ? 1 : -1
  );
}

/**
 * Applique un changement de consentement de façon **traçée** : retourne le
 * nouvel événement à ajouter à l'historique (l'historique existant n'est jamais
 * muté). Aucune modification silencieuse.
 */
export function buildConsentEvent(
  clientId: string,
  category: ConsentCategory,
  from: ConsentStatus | null,
  to: ConsentStatus,
  actor: string,
  reason: string,
  seq: number
): ConsentEvent {
  return {
    id: `ev-${String(CONSENT_HISTORY.length + seq).padStart(3, '0')}`,
    clientId,
    category,
    from,
    to,
    actor,
    reason,
    date: CRM_TODAY
  };
}

/* -------------------- consentement vs autorisation d'envoi --------------- */

/**
 * Autorisation d'envoi à un instant T — DISTINCTE du consentement.
 *
 * Un consentement accordé ne suffit pas : il faut aussi que le client ne soit
 * pas en `doNotContact`, ni en blocage global. L'éligibilité du canal (WhatsApp
 * etc.) relève du LOT 12 et n'est pas évaluée ici. L'interface ne confond
 * jamais « le client a consenti » et « on peut lui envoyer maintenant ».
 */
export function canSendNow(clientId: string, category: ConsentCategory): boolean {
  const client = findClient(clientId);
  if (!client) return false;
  if (client.doNotContact || client.globalBlock) return false;
  return isGranted(consentOf(clientId, category));
}

/* ---------------------------- page publique ------------------------------ */

export type PublicTokenStatus = 'valid' | 'expired' | 'revoked';

export type PublicPreferenceToken = {
  token: string;
  status: PublicTokenStatus;
  clientId: string;
};

/**
 * Tokens de démonstration pour la page publique `/c/{token}`.
 * La page n'expose AUCUNE donnée privée : uniquement les préférences de
 * communication par catégorie.
 */
export const PUBLIC_TOKENS: PublicPreferenceToken[] = [
  { token: 'demo-valide-001', status: 'valid', clientId: 'cli-awa' },
  { token: 'demo-expire-002', status: 'expired', clientId: 'cli-moussa' },
  { token: 'demo-revoque-003', status: 'revoked', clientId: 'cli-fatou' }
];

export function resolveToken(token: string): PublicPreferenceToken | undefined {
  return PUBLIC_TOKENS.find((t) => t.token === token);
}
