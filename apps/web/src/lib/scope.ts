/**
 * DIVINI exo — Portée (tenant ⇄ établissements)
 *
 * Décision C.2 (tranchée le 2026-08-29, tracée dans le blueprint Annexe C) :
 * **sélecteur global unique**. La portée vit dans un état de session, pas dans
 * l'URL — `/app/ventes`, pas `/app/etablissements/{id}/ventes`.
 *
 * Toute la résolution de portée passe par CE module. Si un préfixe de route
 * devait être ajouté plus tard, c'est ici qu'il s'insérerait, sans refondre les
 * routes des lots 05 à 23.
 *
 * Les établissements sont des données de démonstration, signalées comme telles
 * (LOT 02 §10). Noms neutres et fictifs : aucun contenu de source externe
 * (V2.18, l. 8334-8358), aucune statistique, aucun chiffre d'entreprise.
 */

export type ScopeKind = 'tenant' | 'site';

export type Site = {
  id: string;
  label: string;
  /** Nom court pour les affichages contraints (tablette, mobile). */
  short: string;
};

/**
 * Établissements de démonstration.
 *
 * Libellés volontairement génériques : ils décrivent un type de lieu, pas une
 * entreprise inventée. Aucune donnée financière ne leur est attachée.
 */
export const DEMO_SITES: readonly Site[] = [
  { id: 'siege', label: 'Siège', short: 'Siège' },
  { id: 'atelier-centre', label: 'Atelier Centre', short: 'Atelier' },
  { id: 'depot-est', label: 'Dépôt Est', short: 'Dépôt' },
  { id: 'boutique-littoral', label: 'Boutique Littoral', short: 'Littoral' }
];

export type Scope =
  | { kind: 'tenant'; label: string }
  | { kind: 'site'; siteId: string };

/** Portée consolidée. Typée sur la variante précise : les appelants accèdent à `label`. */
export const TENANT_SCOPE: Extract<Scope, { kind: 'tenant' }> = {
  kind: 'tenant',
  label: 'Tous les établissements'
};

export function siteScope(siteId: string): Scope {
  return { kind: 'site', siteId };
}

export function isSameScope(a: Scope, b: Scope): boolean {
  // Rétrécissement explicite : comparer d'abord les discriminants ne suffit pas
  // à TypeScript pour autoriser l'accès à `siteId` sur les deux opérandes.
  if (a.kind === 'tenant' || b.kind === 'tenant') {
    return a.kind === b.kind;
  }
  return a.siteId === b.siteId;
}

/** Libellé affiché dans la topbar et le breadcrumb. */
export function scopeLabel(scope: Scope): string {
  if (scope.kind === 'tenant') return scope.label;
  return DEMO_SITES.find((site) => site.id === scope.siteId)?.label ?? 'Établissement inconnu';
}

/** Libellé court pour les écrans contraints. */
export function scopeShortLabel(scope: Scope): string {
  if (scope.kind === 'tenant') return 'Tous';
  return DEMO_SITES.find((site) => site.id === scope.siteId)?.short ?? '—';
}

/**
 * Une portée « tous les établissements » est une consolidation : elle agrège
 * plusieurs jeux de données. L'interface doit le dire explicitement plutôt que
 * de laisser croire à un établissement unique.
 */
export function isConsolidated(scope: Scope): boolean {
  return scope.kind === 'tenant' && DEMO_SITES.length > 1;
}

/**
 * Point d'entrée unique de la résolution de portée.
 *
 * Aujourd'hui la portée vient de l'état de session. Si la décision C.2 évoluait
 * vers un préfixe d'URL, seule cette fonction changerait.
 */
export function resolveScope(session: Scope): Scope {
  if (session.kind === 'site' && !DEMO_SITES.some((site) => site.id === session.siteId)) {
    // Un identifiant inconnu retombe sur la consolidation plutôt que d'afficher
    // un écran vide ou de lever : l'utilisateur voit alors que la portée a changé.
    return TENANT_SCOPE;
  }
  return session;
}
