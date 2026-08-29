# LOT 01 — Rapport de construction et d'inspection

Date : 2026-08-29
Statut : **construit, inspecté, corrigé — en attente de validation utilisateur**

Rien n'est déclaré validé. Ce rapport consigne ce qui a été livré, ce qui a été
mesuré, et les défauts trouvés puis corrigés.

---

## 1. Livrables

### Primitives — `apps/web/src/components/ui/` (4 641 lignes)

| Famille | Primitives |
|---|---|
| **Actions** | Button (primary / ghost / danger / subtil · sm–md–lg), IconButton, Dropdown, ContextMenu, ConfirmDialog |
| **Formulaires** | FieldGroup, Input, Search, Select, DatePicker, Checkbox, RadioGroup, Switch, FileUpload, Stepper |
| **Feedback** | Alert, Skeleton, SkeletonBlock, EmptyState, ErrorState, PermissionDenied, OfflineState, SyncingState, ModuleUnavailable, Modal, Drawer, Toast |
| **Identité** | Avatar, StatusDot, Badge, SeverityIndicator |
| **Typographie** | Title, Subtitle, Body, Caption, MonoValue, SectionLabel |

**32 primitives exportées** depuis un point d'entrée unique (`index.ts`).

À côté :
- **28 icônes** linéaires, jeu unique — viewBox 24, tracé `currentColor`,
  épaisseur 1,5, aucun remplissage ;
- **système de focus commun** (`focus.ts`) : piège à focus, navigation fléchée,
  retour du focus au déclencheur — partagé par Menu, Modal, Drawer, ConfirmDialog
  pour qu'aucun overlay n'invente son comportement clavier ;
- **base d'overlay unique** : `ConfirmDialog`, `Modal` et `Drawer` partagent
  `OverlayBase` (règle de non-duplication l. 3423-3439).

### Galerie — `/dev/ui`

709 lignes. Chaque primitive dans ses états pertinents, sur les deux thèmes, avec
bascule de densité.

**Aucun bouton décoratif** : les 41 boutons de la page ont une action réelle —
ils écrivent dans un journal visible en bas de page, ouvrent un overlay, ou
poussent une notification.

### Extension du contrat de tokens

| Ajout | Justification |
|---|---|
| `--ctl-*` (hauteurs, paddings, icônes, champs par taille) | LOT 01 §2.1 impose des tailles sm–md–lg |
| `--ease-linear` | Animations proportionnelles au temps — voir §4.4 |

Contrat après lot : **340 variables, 480 déclarations.**

---

## 2. Vérifications exécutées

| Contrôle | Résultat |
|---|---|
| `npm run check:tokens` | **112 paires, pire 4,61:1, 0 échec** (cascade CSS résolue, 2 thèmes) |
| `npm run check:hardcoded` | **24 fichiers analysés, 0 violation** |
| `npm test` | **76 tests, 76 passent** (focus, overlays, menus, toasts, formulaires, champs — §6) |
| `npm run typecheck` | exit 0 |
| `npm run build` | 6 pages prérendues, `/dev/ui` 14,8 kB |
| `GET /` | HTTP 200 |
| `GET /dev/tokens` | HTTP 200 |
| `GET /dev/ui` | HTTP 200 |
| `GET /inexistant` | HTTP 404 (comportement attendu) |

### Contenu réellement rendu

| Mesure | Valeur |
|---|---|
| Boutons | 41 |
| Champs | 19 inputs, 1 select |
| Icônes SVG | 66 |
| Labels avec `for` | 18 |
| Ids portés par un champ | 18 |
| **`for` orphelins** | **0** |
| **Champs étiquetés** | **15 / 15** |
| `aria-describedby` | 3, tous pointant vers un id existant |
| `aria-invalid` / `aria-checked` / `role="switch"` | 1 / 6 / 2 |
| `role="alert"` / `role="status"` / `aria-live` | 2 / 5 / 2 |

### Couverture des 15 états obligatoires (l. 7964-7984)

**15 / 15 couverts**, vérifiés dans le CSS et le HTML servis :

`default` · `hover` · `active` · `focus-visible` · `disabled` · `loading` ·
`success` · `info` · `warning` · `error` · `critical` · `empty` · `offline` ·
`syncing` · `permission-denied`

Pseudo-classes présentes dans le CSS servi : `:hover` 12 · `:active` 3 ·
`:focus-visible` 15 · `:disabled` 21 · `:checked` 3 · `:focus-within` 1.

---

## 3. Défaut trouvé et corrigé — accessibilité (grave)

**Symptôme.** 4 champs rendus sans étiquette associée.

**Cause.** `FieldGroup` générait un `id` via `useId()` et écrivait
`<label htmlFor={id}>`, mais **ne transmettait jamais cet id à l'`Input`** : il le
posait sur un `data-field-id` du conteneur, ce qui n'associe rien. Le `for`
pointait vers un identifiant que personne ne portait.

Même défaut pour l'aide et l'erreur : `hintId` et `errorId` étaient générés puis
jamais reliés. `aria-describedby` : **0 occurrence** dans tout le rendu — un
lecteur d'écran n'entendait ni l'aide ni le message d'erreur au niveau du champ.

C'est exactement ce que la checklist du lot exige (« labels explicites »,
« l'erreur est annoncée par aria-describedby ET aria-invalid »).

**Correction.** Un contexte `FieldContext` fournit `{ id, describedBy }` ;
`Input`, `Search`, `Select` et `DatePicker` le consomment. Hors `FieldGroup`, ils
retombent sur leur propre `useId()` : les primitives restent utilisables seules.

**Vérifié après correction** : `for` orphelins **0**, champs étiquetés **15/15**,
`aria-describedby` **3** (les trois groupes qui portent une aide ou une erreur),
tous vers des ids existants.

---

## 4. Défauts trouvés dans l'outillage et le contrat

### 4.1 `stripComment` ne gérait pas les blocs multi-lignes

Le contrôle « aucune valeur en dur » analysait le contenu des commentaires JSDoc
comme du code : 4 faux positifs sur des hexadécimaux documentés.

**Correction.** Suivi d'état du bloc d'une ligne à l'autre, plus reconnaissance
des chaînes et des URLs (`url("data:image/svg+xml,#fff")` n'est plus signalé).

### 4.2 Détection asymétrique de l'easing

Le contrôle vérifiait `transition-timing-function` et `animation-timing-function`,
mais **pas le shorthand**. Un `animation: spin 1s linear infinite` passait donc au
travers — fausse confiance, le genre d'asymétrie qui laisse passer une régression.

**Correction.** Les deux formes sont contrôlées. Prouvé par test négatif :
`animation: spin 1400ms linear infinite` déclenche maintenant **durée-littérale**
et **easing-interdit**.

### 4.3 Test négatif du contrôle

Sonde volontairement fautive, puis supprimée. Résultat :

| Cas | Attendu | Obtenu |
|---|---|---|
| Hex dans un bloc de commentaire multi-lignes | ignoré | ignoré |
| Hex dans un commentaire inline | ignoré | ignoré |
| `url("data:image/svg+xml,#fff")` | ignoré | ignoré |
| `https://example.com/#section` en chaîne | ignoré | ignoré |
| `color: #123456` | détecté | détecté |
| `'#FF0000'` en chaîne TS | détecté | détecté |
| `animation: … 1400ms linear …` | détecté | détecté (durée + easing) |
| `transition-timing-function: ease-in-out` | détecté | détecté |
| `var(--ease-linear)` | autorisé | autorisé |
| `var(--ease-standard)` | autorisé | autorisé |

### 4.4 `linear` — traité par le contrat, pas par exception

Trois usages : rotation du spinner (×2) et barre de progression du toast.

Ce ne sont pas des easings de transition mais des animations **proportionnelles au
temps** : un décompte non linéaire mentirait sur le temps restant — à mi-parcours
visuel, il ne resterait pas la moitié du temps.

Plutôt qu'une exception cachée dans un fichier CSS, `--ease-linear` est ajouté au
contrat avec sa restriction écrite (« réservé aux animations proportionnelles au
temps »), et `forbidden` est mis à jour en conséquence.

### 4.5 Risque de dérive documentaire

`Identity.tsx` recopiait les hexadécimaux canoniques en commentaire. Seconde source
susceptible de diverger : remplacée par la citation `l. 7951-7963 (V2.6)`.

### 4.6 Trois citations de corpus décalées

Vérifiées ligne à ligne, puis corrigées dans `prompts/` et le blueprint :

| Section | Citation erronée | Corrigée |
|---|---|---|
| EMPTY STATES | l. 3221–3236 | **l. 3204–3219** |
| ERREURS | l. 3237–3252 | **l. 3221–3235** |
| CONFIRMATIONS | l. 3253–3275 | **l. 3237–3252** |

### 4.7 Build et serveur de dev en collision

`npm run build` lancé pendant que `next dev` tournait : les deux écrivent dans le
même `.next`, le build a été écrasé et `/dev/tokens` renvoyait **404 en production**
alors que le manifest le listait.

**Correction.** Build effectué serveur arrêté, après purge de `.next`. Les quatre
routes vérifiées ensuite.

---

## 5. Trois fausses alertes de ma part

À signaler, parce qu'elles ont coûté des allers-retours et qu'aucune n'était un
défaut du produit :

1. J'ai annoncé « `/dev/tokens` 404 » comme une régression avant d'identifier la
   collision build/dev — c'était bien un défaut, mais d'environnement de build, pas
   de code.
2. J'ai signalé `hover` et `focus-visible` manquants en ne récupérant que le
   **premier** des deux fichiers CSS de la page.
3. J'ai signalé `Notification info` et `warning` manquants : React découpe
   `Notification {tone}` en deux nœuds texte, et mon marqueur omettait les accents.

---

## 6. Vérification par tests réels (ajoutée après coup)

Le §6 initial déclarait le clavier « écrit mais jamais exercé ». Ce n'est plus le
cas : un banc de test a été mis en place (`node:test` natif + jsdom).

### 6.1 Fonctions de focus — `tests/focus.test.mjs`

Importe le **vrai** module `apps/web/src/components/ui/focus.ts` (Node 22 lit le
`.ts` nativement) — pas une réimplémentation. **15 tests.**

| Comportement | Couverture |
|---|---|
| `getFocusable` — sélection des focusables | disabled, ancre sans href, `tabindex="-1"`, span |
| `getFocusable` — sous-arbres exclus | `hidden`, `inert`, `aria-hidden="true"` |
| `getFocusable` — élément en position fixe | retenu (régression gardée) |
| `trapFocus` — Tab sur le dernier | revient au premier |
| `trapFocus` — Shift+Tab sur le premier | revient au dernier |
| `trapFocus` — Tab interne | non intercepté |
| `trapFocus` — Shift+Tab depuis le conteneur | revient au dernier |
| `trapFocus` — conteneur vide | absorbé sans exception |
| `trapFocus` — nettoyage | l'écouteur est bien retiré |
| `moveFocus` — ArrowDown / ArrowUp | avance, recule, boucle aux deux bouts |
| `moveFocus` — Home / End | atteint les extrémités |
| `moveFocus` — touche non reconnue | ne déplace pas le focus |
| `moveFocus` — élément hors liste | ne provoque rien |

`useReturnFocus` n'est plus testé ici : c'est désormais un vrai hook React,
l'appeler hors composant est une erreur. Ses trois tests initiaux ne passaient
que *grâce* au défaut (voir 6.3). Son comportement réel est couvert en 6.2.

### 6.2 Composants React — `tests/components.test.mjs`

Un loader (`tests/helpers/loader.mjs`, esbuild) permet d'importer les `.tsx` du
projet et de neutraliser les imports CSS. Les composants sont **rendus pour de
vrai** dans jsdom via `react-dom/client` + `React.act`, puis pilotés. **17 tests.**

| Composant | Comportement vérifié |
|---|---|
| `Modal` | rien de rendu quand `open` est faux |
| `Modal` | `role="dialog"`, `aria-modal`, et **l'id de `aria-labelledby` existe** |
| `Modal` | `Escape` appelle `onClose` et est intercepté |
| `Modal` | le focus entre dans le panneau à l'ouverture |
| `Modal` | défilement verrouillé puis restauré |
| `Modal` | **un re-rendu du parent ne vole pas le focus** |
| `Modal` | focus rendu au déclencheur à la fermeture |
| `ConfirmDialog` | `onConfirm` appelé, libellé explicite respecté |
| `ConfirmDialog` | `onCancel` appelé depuis l'annulation |
| `ConfirmDialog` | `Escape` annule — **jamais** ne confirme |
| `Dropdown` | s'ouvre au clic, `Escape` le referme |
| `Dropdown` | focus rendu au déclencheur à la fermeture |
| `Dropdown` | entrée indisponible affichée et marquée, pas masquée |

### 6.3 Quatre défauts trouvés par ces tests

**1. `getFocusable` filtrait sur `el.offsetParent !== null`.** Doublement faux :
`offsetParent` vaut aussi `null` pour **tout élément en `position: fixed`**, qui
n'est pourtant pas invisible — or le tiroir et le voile de fond sont en position
fixe. Un élément focusable directement en `fixed` disparaissait donc du piège.
Et le critère dépendait du layout, donc invérifiable hors navigateur.
→ Remplacé par `closest('[hidden], [inert]')`, `closest('[aria-hidden="true"]')`,
et `display`/`visibility` calculés. Les attributs de sous-arbre portent
désormais sur tout leur contenu.

**2. `useReturnFocus` n'était pas un hook.** `saved` était une variable locale,
recréée à chaque rendu : la référence au déclencheur était perdue dès le premier
re-rendu. Et l'objet retourné était neuf à chaque rendu, ce qui re-déclenchait
les effets qui le listaient en dépendance.
→ `useRef` pour la valeur (survit aux rendus) + `useMemo` sans dépendance pour
une identité stable.

**3. `OverlayBase` volait le focus de l'utilisateur.** `onClose` figurait dans
les dépendances de l'effet. Tout parent transmettant une fonction inline
(`onClose={() => …}` — le cas le plus courant) re-déclenchait l'effet à chaque
rendu, et l'effet remet le focus sur le premier élément du panneau. Mesuré avant
correction : après un re-rendu du parent, `activeElement` n'était plus l'élément
que l'utilisateur venait de focusser.
→ `onClose` passé par ref ; l'effet ne dépend plus que de `open`.

**4. `Escape` ne fermait pas un menu dont le focus était sorti.** Le gestionnaire
était sur le `onKeyDown` du panneau : les événements remontent, ils ne descendent
pas. Mesuré : `Escape` envoyé sur le `document` laissait le menu ouvert.
→ Écoute au niveau du `document`, comme le faisait déjà `OverlayBase`.

Un manque d'API au passage : le libellé d'annulation de `ConfirmDialog` était
codé en dur « Annuler ». Ajout d'un `cancelLabel` optionnel, défaut inchangé.

### 6.4 Deux défauts de plus, trouvés en relisant mon propre code

**5. Identifiants DOM codés en dur.** `Modal`, `Drawer` et `ConfirmDialog`
portaient des ids littéraux (`modal-title`, `drawer-title`, `confirm-title`,
`confirm-desc`). Deux instances du même composant montées en même temps — une
confirmation lancée depuis une modale, cas courant — produisaient des ids
dupliqués. `aria-labelledby` résolvait alors vers le premier, donc vers le titre
d'un **autre** dialogue.
→ `useId()` partout. Mesuré avant correction :
`ids dupliqués : modal-title, confirm-title, confirm-desc`, et le test
« chaque dialogue est étiqueté par SON propre titre » échouait avec
« Premier titre étiquette un dialogue qui ne le contient pas ».
Vérifié aussi sur le HTML servi : **38 id, 0 dupliqué, 0 `for` orphelin**.

**6. Le bouton de fermeture ne dessinait pas une croix.** `Modal` et `Drawer`
rendaient `<span className={styles.iconClose} />`, et la classe faisait
`height: var(--sp-0)` + `border-top` + `rotate(45deg)` : **une seule diagonale**,
pas une croix. Le jeu d'icônes contient pourtant bien un `close`.
→ `<Icon name="close" />`, classe CSS morte supprimée.

**Une fausse alerte de ma part, à corriger** : j'avais noté que `DatePicker`
déclarait une `ref` inutilisée. C'est faux — `ref` est bien passée à l'élément
ligne 311 de `Field.tsx`. Rien à corriger.

**Preuve que les tests ont des dents** : l'ancienne implémentation de
`getFocusable` a été réinjectée temporairement — **9 tests échouent**. Restaurée,
tout repasse. Les défauts 2 à 4 ont chacun été observés en échec avant d'être
corrigés, puis en succès après.

### 6.5 Notifications — `tests/toast.test.mjs`

`ToastProvider` / `useToast` rendus pour de vrai, timers réels. **10 tests.**

| Comportement | Vérification |
|---|---|
| Région vivante | `aria-live="polite"`, `aria-relevant="additions text"` |
| Rôle ARIA | `critical` → `alert` ; `info`/`success`/`warning` → `status` |
| Icône sémantique | 4 tons → **4 icônes distinctes** |
| Barre de progression | rendue, `animation-duration` égale à la durée du toast, `aria-hidden` |
| Persistance critique | aucune barre, **et reste affiché** malgré une durée demandée |
| Auto-fermeture | un toast ordinaire disparaît après sa durée |
| Sortie | l'élément reste monté le temps de l'animation, puis est retiré |
| Action | le libellé est respecté, l'action est exécutée, puis fermeture |
| Fermeture | bouton étiqueté « Fermer la notification » |
| Hors contexte | `useToast` sans provider lève une erreur nommant `ToastProvider` |

**7e défaut trouvé.** Le commentaire de `ToastInput` annonçait « `critical`
ignore cette valeur et reste affiché », mais le code faisait
`toast.duration ?? DEFAULT_DURATION[tone]` : une durée explicite était honorée
même pour le ton critique. Une alerte critique qui s'efface seule est un défaut,
pas une commodité. → `critical` force `duration` à 0.

### 6.6 Formulaires — `tests/fields.test.mjs`

Les primitives les plus exposées en accessibilité, rendues pour de vrai.
**17 tests.**

| Primitive | Vérification |
|---|---|
| `FieldGroup` | `for` du label = `id` du contrôle |
| `FieldGroup` | aide annoncée via `aria-describedby` |
| `FieldGroup` | l'erreur prime sur l'aide, est rendue en `role="alert"`, et l'aide disparaît |
| `FieldGroup` | marqueur obligatoire `aria-hidden` |
| `FieldGroup` | 3 groupes montés → 0 id dupliqué |
| `Checkbox` | libellé associé, `aria-checked` |
| `Checkbox` | état mixte : `aria-checked="mixed"` **et** `indeterminate` natif posé |
| `Switch` | `role="switch"`, `aria-checked`, libellé associé |
| `RadioGroup` | `fieldset`/`legend`, chaque radio étiquetée, option indisponible désactivée et non masquée |
| `RadioGroup` | `onChange` reçoit la valeur cliquée |
| `RadioGroup` | deux groupes de même `name` → 0 id dupliqué |
| `Select` | hérite de l'`id` et de la description du groupe |
| `Search` | bouton d'effacement étiqueté, `onClear` appelé |
| `Stepper` | étapes futures verrouillées, passées atteignables, `aria-current="step"` |
| `Stepper` | `onGoTo` reçoit l'index visé |
| `Stepper` | indicateur condensé exact (`3/4` pour l'index 2) |

**8e défaut trouvé.** `RadioGroup` construisait ses id à partir du seul `name`
(`id={`${name}-${value}`}`). Deux groupes partageant un nom — deux formulaires
sur une page, une modale au-dessus d'un écran — produisaient des id dupliqués,
et chaque `label` pointait vers la mauvaise radio. Même schéma que le défaut 5.
Mesuré avant correction : `id dupliqués : choix-a, choix-b, choix-c`.
→ id dérivés de `useId()` ; `name` reste celui fourni, c'est lui qui groupe
nativement les radios.

### 6.7 Champs restants — `tests/inputs.test.mjs`

`Input`, `FileUpload` et `DatePicker`, derniers nommés comme non testés.
**17 tests.**

| Primitive | Vérification |
|---|---|
| `Input` | `aria-invalid="true"` si invalide, absent si valide |
| `Input` | icône et chargeur `aria-hidden`, jamais annoncés |
| `Input` | `disabled` réellement posé |
| `Input` | hérite de l'`id` et de la description du groupe |
| `FileUpload` | bouton « Parcourir » réel à l'état idle, vraie entrée `type="file"` |
| `FileUpload` | 4 états → 4 intitulés distincts, **aucune progression inventée** |
| `FileUpload` | « Parcourir » disparaît pendant et après l'opération |
| `FileUpload` | nom de fichier reçu affiché ; désactivé, il n'ouvre rien |
| `DatePicker` | déclencheur `aria-haspopup="dialog"`, `aria-expanded`, étiqueté par le groupe |
| `DatePicker` | ouverture au clic, `aria-expanded` mis à jour |
| `DatePicker` | sélection d'un jour → date ISO, puis fermeture |
| `DatePicker` | navigation de mois, **passage d'année** vérifié (décembre 2025) |
| `DatePicker` | `Escape` ferme depuis l'intérieur du calendrier |
| `DatePicker` | `Escape` ferme depuis le déclencheur |

**9e défaut trouvé.** `Escape` ne fermait pas le calendrier quand le focus était
à l'intérieur. Le `onKeyDown` était posé sur le bouton déclencheur, or le
calendrier en est un **frère**, pas un descendant : les touches partant du
panneau ne l'atteignaient jamais. Le commentaire du composant annonçait pourtant
« `Escape` ferme le panneau et rend le focus au champ ». Même famille que le
défaut 4 (`MenuPanel`). Mesuré avant correction : focus dans le calendrier,
`Escape` → panneau toujours ouvert.
→ écoute au niveau du `document` tant que le panneau est ouvert, et focus rendu
au déclencheur.

### 6.8 Commande

`npm test` — 76 tests, 76 passent. Intégré à `npm run lint`.

---

## 6bis. Ce qui reste non vérifié

- **Rendu visuel.** Aucun pixel observé. Le contraste est calculé selon WCAG 2.1
  sur la cascade résolue, ce n'est pas une observation.
- **Les trois points de rupture.** Les media queries sont écrites (≤ 979,98 px et
  ≤ 719,98 px) ; aucun test de viewport n'a été exécuté.
- **`prefers-reduced-motion`.** Le bloc existe dans le CSS généré et servi ; son
  effet n'a pas été observé.
- **`getComputedStyle` avec résolution de `var()`.** jsdom ne résout pas les
  variables CSS : la cascade reste vérifiée par `scripts/lib/resolve-css.mjs`,
  pas par un moteur de rendu.
- **Le tiroir en feuille plein écran sous 720 px** n'est pas exercé : `Drawer`
  est testé pour l'ouverture, `Escape` et `aria-modal`, mais pas son
  repositionnement responsive — il faudrait un vrai viewport.
- **La saisie clavier réelle** (frappe au clavier, `Tab` entre champs,
  validation à `Enter`) n'est pas exercée : jsdom ne simule pas la saisie
  native, il faut un vrai navigateur.
- **`Alert`, `Skeleton`, `EmptyState`, `ErrorState`, `PermissionDenied`,
  `OfflineState`, `SyncingState`, `ModuleUnavailable`** et les primitives
  d'identité et de typographie n'ont pas de test propre. Ce sont des composants
  de présentation sans interaction ; leur rendu est vérifié sur le HTML servi.

Chromium n'est pas installable dans cet environnement (téléchargement bloqué, pas
de root, dépôt Debian injoignable). `@sparticuz/chromium` fournit bien un binaire,
mais il lui manque `libnss3`/`libnspr4` et rien ne permet de les installer ici.

Ces points restent à reprendre au LOT 23, ou dès qu'un navigateur est disponible.

---

## 7. Conformité au lot

| Exigence | État |
|---|---|
| Primitives du §2.1 livrées et utilisées par la galerie | fait |
| États pertinents parmi les 15 obligatoires | 15/15 |
| Deux thèmes avec bascule | fait, bascule fonctionnelle dans le DOM |
| `focus-visible` partout, `Escape`, ARIA | **testé** : 76/76 — overlays, menus, toasts, formulaires, calendrier |
| Couleur jamais seule | fait : libellé + icône + forme |
| ConfirmDialog sur opérations critiques | fait (l. 3237-3252) |
| EmptyState / ErrorState / PermissionDenied / Offline / Syncing / ModuleUnavailable | fait |
| Toast : droite, progress bar, icône sémantique | fait |
| Aucun bouton décoratif | fait — 41 boutons, tous actifs, journal visible |
| Aucune donnée métier mockée | fait — libellés neutres uniquement |
| Aucune valeur en dur | fait — 24 fichiers, 0 violation |
| Aucune régression LOT 00 | tokens inchangés sauf ajouts justifiés ; 112 paires toujours à 0 échec |

**Non conforme / en suspens** : les vérifications restantes du §6bis — rendu
visuel, points de rupture, `prefers-reduced-motion`, et câblage clavier des
composants React. Aucun navigateur n'est installable dans cet environnement.

---

## 8. Périmètre respecté

Aucun composant de données (table, KPI, chart → LOT 03), aucun shell ni navigation
(→ LOT 02), aucune palette de commandes (→ LOT 04), aucun composant métier.

---

## 9. Note sur les fichiers joints

Les deux fichiers annoncés (`silo-landing-page.html`, `saas-erp-interaction-demo.html`)
n'étaient pas présents dans l'espace de travail : `find /` ne les a pas trouvés et
`/home/user/uploads/` n'existe pas. **Ils n'ont donc pas été lus.**

Ils n'auraient de toute façon pas alimenté ce lot : le corpus V2.18 (l. 8334-8358)
interdit de reprendre comme vérité le contenu Silo — noms d'entreprises, tarifs,
valeurs KPI de démo, témoignages, textes marketing — et précise « Seul le STYLE de
présentation est réutilisable ». LOT 01 §10 renchérit : « Aucun contenu issu d'une
source de référence visuelle. »

Ces fichiers relèvent de la landing (LOT 22) et des interactions (LOT 05 et suivants).

---

## 10. Avancement

`AVANCEMENT GLOBAL : 8 %`

2 lots construits sur 25 (LOT 00, LOT 01). Aucun lot validé à ce jour : la
validation du LOT 00 n'a pas été donnée explicitement avant de démarrer le LOT 01.

---

## 11. STOP

Lot terminé. **Arrêt ici.** LOT 02 non démarré — il attend une validation explicite.
