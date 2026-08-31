# LOT 02 — App Shell · Rapport de validation

**Date :** 2026-08-29
**Branche :** `arena/01a04ab1-divini-3`
**Spécification :** `prompts/LOT-02-app-shell.md`
**Statut :** construit, inspecté, corrigé — **en attente de validation explicite**

> Ce rapport suit le format imposé par `prompts/00-REGLES-COMMUNES.md` §10, complété
> des éléments exigés par le LOT 02 §14 : structure du manifeste, statuts de modules,
> décision C.2 appliquée.

---

## 1. IMPLÉMENTÉ

### 1.1 Manifeste de navigation — `apps/web/src/lib/modules.ts` (469 l.)

Structure du descripteur :

| Champ | Type | Rôle |
|---|---|---|
| `id` | `string` | clé, segment de route, droit |
| `label` | `string` | libellé affiché |
| `group` | `NavGroupId` | groupe de rattachement |
| `icon` | `IconName` | icône linéaire du jeu unique |
| `permission` | `string` | droit requis — **aucune permission n'est effective dans ce lot** |
| `status` | `disponible` \| `planifie` \| `nonActive` | pilote le comportement |
| `lot` | `number` | lot qui livrera l'écran, affiché tel quel |
| `route` | `string?` | présente uniquement si `disponible` |
| `detached` | `boolean?` | entrée séparée du tenant (Personal ERP) |
| `summary` | `string?` | description pour l'état « en construction » |

**29 modules** répartis en **7 groupes** (plafond du corpus) :

| Groupe | Rendus | Modules |
|---|---|---|
| OPÉRATIONS | 6 | cockpit, ventes, stocks, crm, livraisons, achats |
| INTELLIGENCE | 6 | copilot, autopilot, radar, cash-vision, guardian, alertes |
| ORGANISATION | 4 | etablissements, utilisateurs, rh, abonnement |
| FINANCE | 4 | tresorerie, comptabilite, depenses, fidelite |
| SYSTÈME | 3 | parametres, integrations, audit |
| PILOTAGE | 3 | rapports, automatisation, documents |
| COMMUNICATION | 2 | whatsapp, social |
| **Total** | **28** | |

S'y ajoute **Personal ERP** (`detached: true`), rendu séparément en pied de sidebar
conformément au blueprint §9 — soit **29 entrées de navigation**, ce que confirme le
HTML servi (29 occurrences de `navItem`, 0 `navItemActive` par défaut, 30 boutons dans
`<aside>` dont le bouton de collapse).

Une 30ᵉ entrée, `dev-non-active`, vit dans `DEV_VARIATION_MODULES` : elle n'entre
**jamais** dans la navigation réelle et n'existe que pour exercer le statut
`non activé` sur `/dev/shell`.

`resolveModuleAction()` est **le seul endroit** qui traduit un statut en action
(`navigate` / `planned{lot}` / `subscribe{target}`). Aucun composant n'invente son
propre comportement.

### 1.2 Portée — `apps/web/src/lib/scope.ts` (96 l.)

Décision **C.2 appliquée** (voir §1.7). `Scope` est une union discriminée
`{ kind:'tenant', label }` | `{ kind:'site', siteId }`. `resolveScope()` est
**l'unique point de résolution** : une portée site inconnue retombe sur le tenant.
4 établissements de démonstration aux noms génériques neutres (Siège, Atelier
Centre, Dépôt Est, Boutique Littoral) — aucune entreprise fictive du corpus
(V2.18 l. 8334–8358).

### 1.3 État du shell — `apps/web/src/lib/shell-state.tsx` (135 l.)

Portée · sidebar repliée · tiroir mobile · module actif · **état de la zone de
travail** · **état de connexion**. Le tout mémoïsé pour éviter un nouveau contexte
à chaque rendu.

### 1.4 Composants — `apps/web/src/components/shell/` (1 258 l.)

| Composant | Lignes | Contenu |
|---|---|---|
| `shell.module.css` | 662 | styles, **81 variables, 0 suspendue** |
| `Sidebar.tsx` | 239 | `Sidebar` · `SidebarBrand` · `SidebarGroup` · `SidebarItem` · `UserFooter` |
| `ContextBar.tsx` | 210 | `ContextBar` · `Breadcrumb` · `ModuleTabs` |
| `WorkspaceLayout.tsx` | 151 | états de zone de travail |
| `AppShell.tsx` | 135 | assemblage |
| `Topbar.tsx` | 127 | `Topbar` · `SearchTrigger` |
| `ConnectionStatus.tsx` | 80 | 5 états de connexion |
| `ScopeSwitcher.tsx` | 57 | sélecteur de portée |
| `ThemeToggle.tsx` | 36 | bascule de thème |
| `index.ts` | 24 | barrel, 10 exports |

### 1.5 Routes

| Route | Taille | Contenu |
|---|---|---|
| `/app` | 224 B | coquille + zone de travail en EmptyState assumé |
| `/dev/shell` | 1,07 kB | banc technique : 5 états de connexion, 4 états de zone, statut `non activé` |

### 1.6 Icônes — 28 → 64

35 icônes ajoutées au jeu linéaire unique (modules + chrome), mêmes attributs
structurels que le LOT 01 (`viewBox` 24, `fill="none"`, `strokeWidth={1.5}`,
extrémités rondes, `aria-hidden` sauf `title`).

### 1.7 Décision C.2 — appliquée et tracée

**Sélecteur global unique**, la portée vit dans un état de session, pas dans l'URL :
`/app/ventes`, pas `/app/etablissements/{id}/ventes`. Trois raisons tirées du corpus :
1. LOT 02 §5 impose une portée « persistante pendant la session » ;
2. le blueprint §9 place le sélecteur dans la sidebar comme contrôle global, §8.1 le
   répète dans la topbar ;
3. la « consolidation visible » tenant ⇄ établissements (LOT 02 §2.1) n'a pas de sens
   avec un préfixe par établissement.

`lib/scope.ts` isole la résolution pour qu'un préfixe puisse être ajouté plus tard
sans refondre les routes. **L'Annexe C du blueprint est mise à jour** : reste ouverte
uniquement **C.6**.

### 1.8 Nouveau contrôle permanent — `scripts/check-dangling-vars.mjs`

Né d'un défaut réel (voir §5.1). Vérifie qu'aucune `var()` du CSS **consommateur** ne
référence une variable inexistante. Câblé dans `npm run check`.

---

## 2. VISIBLE MAINTENANT

Sur `/app` (vérifié sur le HTML réellement servi) :

- **Sidebar** 220 px / 72 px repliée, fond `--surface-panel`, `border-right`, 29 entrées
  (28 groupées + Personal ERP détaché) en 7 groupes, actif `--accent-soft` + `--accent`,
  pied utilisateur + mention
  « Session de démonstration — aucune authentification réelle ».
- **Topbar** : sélecteur de portée (« Tous les établissements »), déclencheur de
  recherche avec raccourci en mono, indicateur de connexion, bascule de thème.
- **Barre de contexte** : fil d'Ariane, titre, portée, filtres.
- **Zone de travail** : EmptyState assumé annonçant LOT 05 (Cockpit), LOT 06 (Ventes),
  LOT 07 (Stocks) + lien vers la route technique.
- Cliquer un module affiche **« en construction — LOT nn »**, jamais un écran fictif.

Sur `/dev/shell` : les 5 états de connexion, les 4 états de zone de travail, et la
variation `non activé`.

**Vérifications sur le HTML servi** (`/app` et `/dev/shell`) : 1 attribut `id`, **0
dupliqué**, **0 `<label for>` orphelin**, structure `<aside>` / `<header>` /
`<nav aria-label="Navigation principale">` / `role="status"` / `role="switch"` /
`aria-label="Fil d'Ariane"` / `aria-current="page"` tous présents.

**Routes** : `/` 200 · `/app` 200 · `/dev/shell` 200 · `/dev/ui` 200 · `/dev/tokens`
200 · `/inexistant` 404.

---

## 3. MOCKÉ / NON CONNECTÉ

**Aucun backend n'existe.** Sont explicitement simulés, et signalés comme tels à
l'utilisateur :

| Élément | Nature | Signalement |
|---|---|---|
| Indicateur de connexion | **simulation d'interface** | `navigator.onLine` n'est volontairement **pas** lu : un « synchronisé » qui ne vérifie rien serait une fausse promesse. Piloté par `/dev/shell`. |
| Session utilisateur | démonstration | « Session de démonstration — aucune authentification réelle » en pied de sidebar |
| Établissements | données de démonstration | noms génériques neutres, aucun tenant réel |
| Permissions | déclaratives | champ `permission` présent, **aucun contrôle effectif** |
| Statut `non activé` | variation technique | cantonné à `DEV_VARIATION_MODULES`, jamais dans la navigation réelle |
| Recherche globale | bouton, pas un champ | ouvre un état explicite « arrive au LOT 04 » |

**Aucun module n'est marqué `disponible`** : aucun écran n'existe avant le LOT 05.
Marquer un module « non activé » dans `/app` laisserait croire qu'il est construit
mais non souscrit — ce serait faux.

---

## 4. TESTS EFFECTUÉS

### 4.1 Suite automatisée — `npm test` : **107/107**

| Suite | Tests | Couverture |
|---|---|---|
| `tests/shell.test.mjs` | **31** | **LOT 02** — nouveau |
| `tests/components.test.mjs` | 17 | LOT 01 overlays/menus |
| `tests/fields.test.mjs` | 17 | LOT 01 champs composés |
| `tests/inputs.test.mjs` | 17 | LOT 01 Input/FileUpload/DatePicker |
| `tests/focus.test.mjs` | 15 | LOT 01 focus |
| `tests/toast.test.mjs` | 10 | LOT 01 Toast |

`shell.test.mjs` couvre : plafond de 7 groupes et de 7 entrées · unicité des
identifiants · module détaché exclu du regroupement · aucun module `disponible` ·
`planifie` → lot · `nonActive` → renvoi **vers un module qui existe** · rendu des
statuts · `aria-current="page"` · infobulle en mode compacte · zone de travail
(accueil, lots nommés, **contenu de route rendu**) · portée (défaut, normalisation,
conservation) · indicateur de connexion (live region, **5 libellés distincts**) ·
topbar (portée, recherche, bascule) · mention de démonstration · navigation
(`nav[aria-label]`, `role="group"`) · **Escape ferme le tiroir** · fil d'Ariane ·
**double montage sans id dupliqué**.

### 4.2 Contrôles automatiques — tous verts

| Contrôle | Résultat |
|---|---|
| `npm run tokens` | 530 lignes, 340 variables, 480 déclarations |
| `npm run check:tokens` | 112 paires, pire contraste **4.61:1**, **0 échec** |
| `npm run check:hardcoded` | **0 violation** |
| `npm run check:vars` | 1 492 références, **0 suspendue** |
| `npm run typecheck` | **0 erreur** |

### 4.3 Build et service

`npm run build` : 6 routes générées, aucune erreur. Serveur `next start` sur
`0.0.0.0:3000`, 5 routes en 200, 1 en 404. HTML servi audité (voir §2).

### 4.4 Tests en négatif

- **Garde-fou `check:vars`** : défaut LOT 01 réinjecté → **exit 1** et diagnostic
  nominatif ; restauré → exit 0.
- **Test de non-régression du rendu `children`** : bug réinjecté → le test **échoue** ;
  restauré → 31/31.

---

## 5. ERREURS RENCONTRÉES

### 5.1 Défaut hérité du LOT 01 — `var()` suspendues *(réel, silencieux)*

`ui.module.css` contenait `var(--ctl-pad-x-lg)`, `var(--ctl-pad-x-md)`,
`var(--ctl-pad-x-sm)` : **5 occurrences, noms inexistants**. Les vrais tokens sont
`--ctl-pad-xlg/-xmd/-xsm`. Le navigateur ignore silencieusement une `var()` non
résolue : **ces `padding` ne s'appliquaient jamais**, sans aucune erreur de build.

Cause de l'angle mort : le garde-fou intégré à `build-css.mjs` ne vérifie que le CSS
**généré**, jamais le CSS **consommateur**. Corrigé par
`scripts/check-dangling-vars.mjs`, câblé dans `npm run check`.

### 5.2 Tokens inventés dans ma propre route *(réel)*

`dev-shell.module.css` référençait `--d-card-pad`, `--d-inline-gap`, `--w-container` :
**aucun n'existe**. Remplacés par `--d-section-gap`, `--sp-3`, `--sp-4` ; le
`max-width` est supprimé, la largeur étant déjà contrainte par la zone de travail.

### 5.3 Contenu des routes invisible *(réel — trouvé par l'audit, pas par les tests)*

`WorkspaceLayout` ne rendait `children` **que** dans la branche « module disponible ».
L'accueil est pourtant l'état par défaut du shell — celui qu'utilisent `/app` et
`/dev/shell`. Résultat : **aucun contrôle du banc technique n'était rendu**, et le
lien de `/app` non plus.

**Point notable :** les 30 tests jsdom passaient. C'est **l'audit du HTML réellement
servi** qui a révélé le défaut. Test de non-régression ajouté et validé en négatif.

### 5.4 Bouton mort *(réel)*

Le bouton « Voir dans Abonnement → Modules » avait `onClick: () => undefined` —
explicitement interdit par le socle commun. Corrigé : l'action `subscribe` porte
désormais une `target` vérifiée (`SUBSCRIPTION_MODULE_ID = 'abonnement'`), et le test
contrôle que **cette cible existe dans le manifeste** — un renvoi vers un module
inexistant redeviendrait un bouton mort.

### 5.5 Props inventées *(réel, attrapé par le typecheck)*

Dans `WorkspaceLayout` : `Title level={1}` (prend `as`), `PermissionDenied
title/missing` (prend `resource`/`missingPermission`), `SkeletonBlock` avec enfants
(prend `lines`). Corrigé après lecture des signatures réelles.

### 5.6 `AppearanceProvider` dupliqué *(réel)*

`AppShell` posait un second `AppearanceProvider` alors que le layout racine le fournit
déjà. Un provider imbriqué crée un état de thème parallèle, en désaccord avec celui
posé avant le premier paint. Retiré.

### 5.7 Typage *(réel)*

`noUncheckedIndexedAccess` rend un `Record<K,V>` indexé de type `V | undefined` :
remplacé par des `switch` exhaustifs, qui font échouer la compilation si un état est
ajouté sans être traité. Union discriminée `Scope` mal rétrécie : comparaison
explicite des discriminants.

### 5.8 Édition partielle *(réel)*

Des remplacements dans `shell-state.tsx` ont échoué silencieusement (chaînes de
recherche décalées) : `workspaceState` était utilisé sans être déclaré, et **absent du
tableau de dépendances du `useMemo`** — un changement d'état ne se serait pas propagé.
Repris avec assertions.

### 5.9 Bugs dans mes propres tests *(7)*

Extension `.ts` au lieu de `.tsx` · sidebar et zone de travail sous **deux providers
distincts** (test inopérant) · `AppShell` rendu hors `AppearanceProvider` ·
`ContextBar` rendu hors provider · assertion `group === null` sur un module détaché
(le type exige un groupe, la séparation passe par `detached`) · assertion « 5 à 7
entrées » plus stricte que la règle opérante · id `test-root` du harnais compté comme
dupliqué.

**Sur l'assertion « 5 à 7 entrées »** : l'arbre de référence du blueprint §9 comporte
lui-même des groupes de 2 (COMMUNICATION, PILOTAGE). La règle opérante est le
**plafond** (« au-delà, regrouper »). Ajouter des modules pour atteindre 5 aurait créé
de la navigation fictive — le test vérifie donc `≤ 7`, et l'écart au plancher est
signalé ici plutôt que masqué.

---

## 6. RÉGRESSIONS

**Aucune régression sur LOT 00 et LOT 01.** Les 76 tests antérieurs passent
inchangés (107 − 31 nouveaux = 76).

Deux points méritent d'être nommés :

- Le défaut §5.1 était **antérieur** au LOT 02 : il a été **introduit** au LOT 01 et
  **découvert** ici. Les trois `padding` concernés s'appliquent désormais. C'est une
  correction, pas une régression.
- `check:vars` est un contrôle **plus strict** qu'avant : il aurait fait échouer le
  LOT 01. Le durcissement est voulu.

---

## 7. CONFORMITÉ À LA CHECKLIST §13

| Critère | État |
|---|---|
| Sidebar 220/72 px, transition 320 ms, `--panel`, `border-right`, icônes linéaires, actif `--accent-soft` + `--accent` | ✅ (valeurs par tokens) |
| 7 groupes max, navigation **générée** depuis le manifeste | ✅ 7 groupes, 0 item codé en dur |
| 5 à 7 entrées par groupe | ⚠️ plafond respecté (max 7) ; plancher non atteint sur 4 groupes — voir §5.9 |
| Statuts `planifié` / `non activé` explicites, aucun écran fictif, aucun masquage | ✅ |
| Topbar compacte, `border-bottom`, recherche avec raccourci mono, CTA ambre | ✅ |
| Tabs : underline 2 px interpolé, jamais brutal | ✅ élément unique positionné depuis les mesures |
| Sélecteur de portée visible et persistant, C.2 tracée | ✅ voir §1.7 |
| Indicateur offline/sync permanent | ✅ 5 états, libellés distincts |
| Thème sombre par défaut, bascule, mémorisé, sans flash | ✅ (LOT 00 + `ThemeToggle`) |
| Navigation clavier, focus-visible, `Escape` ferme le drawer | ✅ testé |
| Session de démonstration identifiée, aucune sécurité simulée présentée comme réelle | ✅ |
| Zone de travail en EmptyState assumé annonçant les lots | ✅ LOT 05/06/07 nommés |
| Aucune régression LOT 00 / LOT 01 | ✅ 76/76 |

---

## 8. NON VÉRIFIABLE ICI

Honnêtement signalé, conformément au socle commun §6.3 :

- **Rendu visuel réel** — dimensions 220/72 px, hauteur de topbar, largeur de palette :
  jsdom ne fait pas de layout (`getBoundingClientRect()` renvoie des zéros).
- **Durées et easings** — les transitions sont écrites en tokens, leur perception n'est
  pas mesurable sans navigateur.
- **Les 4 breakpoints** et l'absence d'overflow : les media queries sont écrites
  (`979.98px` etc.), leur effet n'est pas vérifiable ici.
- **`prefers-reduced-motion`** : la règle est présente dans le CSS, non évaluée.
- **Interpolation de l'underline des tabs** : le calcul de position est testé, mais
  jsdom renvoie `offsetWidth === 0`, donc **aucun underline n'est posé en test** (le
  composant s'abstient volontairement plutôt que de poser un trait mal placé).
- **Aucun navigateur disponible dans cet environnement** : `@sparticuz/chromium`
  échoue (`libnss3` manquant, pas de root). jsdom est le seul DOM.

---

## 9. FICHIERS

**Créés :** `lib/modules.ts` · `lib/scope.ts` · `lib/shell-state.tsx` ·
`components/shell/{AppShell,Sidebar,Topbar,ContextBar,WorkspaceLayout,ScopeSwitcher,
ConnectionStatus,ThemeToggle,index}` · `components/shell/shell.module.css` ·
`app/app/page.tsx` · `app/dev/shell/{page.tsx,dev-shell.module.css}` ·
`scripts/check-dangling-vars.mjs` · `tests/shell.test.mjs` · ce rapport.

**Modifiés :** `components/ui/Icon.tsx` (+35 icônes) · `components/ui/ui.module.css`
(3 `var()` corrigées) · `package.json` (`check:vars`) ·
`DIVINI-ARCHITECTURE-BLUEPRINT.md` (C.2 tranchée) · `prompts/README.md` (avancement).

---

## 10. AVANCEMENT GLOBAL

**AVANCEMENT GLOBAL : 12 %**

Lots 00, 01 et 02 construits. LOT 00 et LOT 01 validés provisoirement ; **LOT 02 en
attente de validation explicite**. Aucun écran métier n'existe : le premier arrive au
LOT 05.

---

## 11. STOP

Le LOT 02 est **construit, inspecté et corrigé**. Conformément à
`00-REGLES-COMMUNES.md` §11, je m'arrête ici et **j'attends votre validation
explicite** avant d'entamer le LOT 03 (Data & Feedback).

Un lot n'est terminé qu'après : construction → inspection → correction →
**validation explicite**.
