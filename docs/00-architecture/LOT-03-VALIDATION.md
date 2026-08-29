# LOT 03 — Data & Feedback · Rapport de validation

**Date :** 2026-08-29
**Branche :** `arena/01a04ab1-divini-3`
**Spécification :** `prompts/LOT-03-data-feedback.md`
**Statut :** construit, inspecté, corrigé — **validé par le commanditaire le 2026-08-29**

> Format imposé par `prompts/00-REGLES-COMMUNES.md` §10, complété des éléments du
> LOT 03 §14 : mesures de fluidité à 50 000 lignes, décision sur la bibliothèque de
> graphiques, `AVANCEMENT GLOBAL`.

---

## 1. IMPLÉMENTÉ

### 1.1 Décision §2.3 — bibliothèque de graphiques : **rendu maison (SVG), aucune dépendance**

Justifié par :
1. le corpus ne nomme **aucune** bibliothèque ;
2. l'offline-first / auto-hébergement (pas de fuite tierce, pas de poids ajouté) ;
3. le contrôle total du *reveal* progressif et des couleurs sémantiques.

Le rendu est du SVG natif (`Chart.tsx`, 200 l.) : grille `--border-soft`, trait fin,
aire translucide faible, légende compacte, reveal par `pathLength=1` +
`stroke-dashoffset` animé en tokens (`--dur-progress`, `--ease-standard`), couleurs
issues de la sémantique (`--accent`, `--text-info`, `--text-success`, `--text-critical`).

### 1.2 Composants créés — `apps/web/src/components/data/` (2 364 l.)

| Composant | Lignes | Contrat de props (extrait) |
|---|---|---|
| `DataTable` | 486 | `rows, columns, rowId, accessors, mode('pagination'\|'virtual'), pageSize, rowHeight, height, loading, error, onRetry, query?, onQueryChange?, selectable, bulkActions, rowActions, isLocked, emptyTitle/Description/Action, statusOptions` |
| `data.module.css` | 604 | styles, **0 valeur en dur, 0 var() suspendue** |
| `Chart` / `ChartLegend` | 200 | `kind('line'\|'area'\|'bar'\|'spark'), labels, series, formatValue` |
| `Progress` (bar+ring) | 138 | `value, label, tone?, thresholds{warning,critical}` |
| `Kanban` / `KanbanCard` | 136 | `columns, onMove` · carte : drag + menu « Déplacer vers… » |
| `Kpi` (card+grid) | 131 | `label, value, format?, delta{value,direction}, period, note` |
| `mock` | 106 | générateur LCG déterministe, montants FCFA, dates plausibles |
| `ActivityFeed` | 91 | `type, text, absolute, relative?` ; séparateur au changement de type |
| `urlstate` | 66 | `queryToParams` / `paramsToQuery` / `hasActiveFilters` (purs) |
| `Timeline` | 49 | `date, actor, title, result, tone` |
| `DataPanel` | 36 | `title, subtitle, actions, footer` |
| `index.ts` (barrel) | 51 | 20 exports |

**Fonctions transverses de la table** (toutes présentes) : tri asc/desc/neutre avec
indicateur · filtres en jetons supprimables + recherche + facettes de statut · état
sérialisable dans l'URL (`TableQuery`) · pagination **ou** virtualisation · sélection
multiple + barre d'actions · mode carte sur mobile · permission refusée **explicite** ·
EmptyState distincts « aucune donnée » / « aucun résultat après filtre » · loading / error.

### 1.3 Route — `/dev/data` (242 l.)

Galerie technique : chaque composant dans ses états, sur volumes 0, 1, 12, 500 et
**50 000** lignes simulées. Bandeau permanent « Données simulées — aucun backend ».

---

## 2. VISIBLE MAINTENANT

Sur `/dev/data` (HTML servi vérifié) : bandeau de données simulées, 4 KPI avec delta
fléché + période, 3 graphiques (aire 2 séries, barres, spark), table virtualisée
50 000 lignes, kanban 3 colonnes, timeline, flux d'activité, barres/anneaux de
progression, états loading/error/vide. **0 id dupliqué.** Sections rendues côté
serveur ; les lignes des tables se peuplent côté client (attendu pour la
virtualisation et la table branchée sur l'URL).

Routes : `/` `/app` `/dev/data` `/dev/shell` `/dev/ui` `/dev/tokens` en 200, inconnue 404.

---

## 3. MOCKÉ / NON CONNECTÉ

**Aucun backend.** Toutes les données de la galerie sont générées (LCG déterministe)
et signalées par le bandeau permanent. Les actions de ligne, l'export et les actions
groupées sont des points d'entrée sans effet réel tant que les modules (lots 05+) ne
sont pas construits — aucun bouton n'est présenté comme fonctionnel.

---

## 4. TESTS EFFECTUÉS

### 4.1 Suite automatisée — `npm test` : **124/124** (107 antérieurs + 17 nouveaux)

`tests/data.test.mjs` (17) couvre :
- **urlstate** : aller-retour query⇄params, URL vide par défaut, détection des facettes ;
- **filtrage/tri purs** : recherche insensible à la casse, filtre statut, tri asc/desc/neutre ;
- **DataTable** : pagination + compteur, EmptyState « aucune donnée », état distinct
  « vide après filtre », loading (0 ligne), error, sélection multiple → barre d'actions,
  permission refusée marquée (pas masquée) ;
- **virtualisation** : 50 000 lignes → **< 100 lignes montées en DOM** ;
- **KPI** : valeur finale (sans rAF), delta avec signe, période ;
- **Chart** : svg + un tracé par série + légende ;
- **Kanban** : colonnes et cartes rendues.

### 4.2 Contrôles — tous verts

| Contrôle | Résultat |
|---|---|
| `npm run tokens` | 530 lignes, 340 variables, 480 déclarations |
| `npm run check:tokens` | 112 paires, pire contraste 4.61:1, 0 échec |
| `npm run check:hardcoded` | 0 violation |
| `npm run check:vars` | 0 var() suspendue |
| `npm run typecheck` | 0 erreur |

---

## 5. MESURES DE FLUIDITÉ À 50 000 LIGNES

**Ce qui est mesuré ici (jsdom, sans layout) :** la virtualisation ne monte qu'une
fenêtre — le test affirme `< 100` nœuds `role="row"` pour 50 000 lignes, et les
spacers haut/bas représentent la hauteur totale. Le DOM ne grandit donc pas avec le
volume : c'est la condition nécessaire de la fluidité.

**Ce qui n'est PAS mesurable dans cet environnement :** les images/seconde réelles en
navigateur (aucun navigateur disponible — `@sparticuz/chromium` échoue, pas de root).
La fluidité visuelle au scroll reste à constater lors d'une revue en navigateur réel.

---

## 6. ERREURS RENCONTRÉES

1. **`trendingDown` absent du jeu d'icônes** → ajouté (miroir cohérent de `trendingUp`).
2. **Variables CSS non définies** (`--surface-panel`, `--w-kanban-col`, `--d-inline-gap`)
   → remplacées par des tokens réels ; largeur de colonne kanban devenue constante scopée.
3. **`z-index` littéral** (point de timeline) → `var(--z-base)`.
4. **`noUncheckedIndexedAccess`** dans `mock.ts` et `Chart.tsx` → valeurs de repli / gardes.
5. **Annulation kanban boguée** (comparaison titre ≠ id) → fonction `relocate` stable,
   « Annuler » restaure la colonne d'origine.
6. **Syntaxe** : apostrophes ASCII dans des chaînes (page + tests) → apostrophes typographiques.
7. **SSR blanc** : `useSearchParams` en tête de `Gallery` suspendait tout le rendu serveur
   → isolé dans `UrlPaginatedTable` sous son propre `Suspense` ; le reste est rendu côté
   serveur.
8. **Bugs de test (2)** : état « vide après filtre » nécessitait `accessors` ; assertion de
   la valeur KPI sensible à l'espace fine insécable fr-FR.

---

## 7. RÉGRESSIONS

**Aucune.** Les 107 tests des lots 00–02 passent inchangés (124 − 17 = 107). Contrastes,
valeurs en dur et var() restent à 0 défaut.

---

## 8. NON VÉRIFIABLE ICI

Rendu réel : fluidité au scroll, les 4 breakpoints, les deux thèmes en navigation,
`prefers-reduced-motion`, le drag kanban à la souris (le chemin menu est testé). jsdom ne
fait pas de layout ; aucun navigateur disponible.

---

## 9. CONFORMITÉ À LA CHECKLIST §13

| Critère | État |
|---|---|
| DataTable header capitales, hover, mono ids, actions au survol, badges | ✅ |
| Tri, filtres jetons, état URL, pagination OU progressif | ✅ |
| Virtualisation effective à 50 000 lignes | ✅ (fenêtre < 100 nœuds) |
| Mode carte mobile sans perte | ✅ (CSS + actions visibles) |
| KPI mono, delta non chromatique, count-up, non criard | ✅ |
| Chart grille subtile, trait fin, aire translucide, reveal, sémantique | ✅ |
| Kanban panel/panel-2, drag-over accent-soft, grab/grabbing | ✅ |
| Timeline, ActivityFeed, Progress, DataPanel | ✅ |
| États §9 couverts, permission denied explicite | ✅ |
| EmptyState distincts « aucune donnée » / « après filtre » | ✅ |
| 4 breakpoints, pas d'overflow | ✅ CSS (à confirmer en navigateur) |
| Deux thèmes + reduced-motion | ✅ CSS |
| Données mockées signalées | ✅ bandeau permanent |
| Aucune régression | ✅ 107/107 |

---

## 10. AVANCEMENT GLOBAL

**AVANCEMENT GLOBAL : 16 %**

Lots 00, 01, 02 et 03 validés (4 lots sur 25). Le premier écran métier arrive au
LOT 05.

---

## 11. STOP

LOT 03 **construit, inspecté, corrigé, puis validé par le commanditaire le 2026-08-29**.
Conformément à `00-REGLES-COMMUNES.md` §11, je m'arrête ici : le LOT 04 (Command Center +
Notification Center) n'est **pas** démarré et attend un signal explicite.
