# LOT 01 — Fondations Design System

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 00 (validé). **Débloque** : LOT 02, LOT 03, LOT 22.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire les **primitives** du Design System DIVINI exo et leur **galerie d'états**, dans les
deux thèmes. Après ce lot, aucun module n'a plus à inventer un bouton, un champ, un badge ou un
état : il compose des primitives existantes.

Critère de réussite : la galerie montre chaque primitive dans ses états pertinents, sur thème
sombre **et** clair, en respectant `prefers-reduced-motion`, et **aucune** primitive ne
contient de valeur visuelle en dur.

## 2. Périmètre

### 2.1 Inclus — familles à livrer

| Famille | Primitives |
|---|---|
| **Actions** | Button (primary / ghost / danger / subtil, tailles sm–md–lg), IconButton, Dropdown, ContextMenu, ConfirmDialog |
| **Formulaires** | Input, Search, Select, DatePicker, Checkbox, Radio, Switch, FileUpload, FieldGroup (label + aide + erreur), Stepper |
| **Feedback** | Alert, Skeleton, EmptyState, ErrorState, PermissionDenied, OfflineState, SyncingState, ModuleUnavailable, Modal, Drawer, Toast |
| **Identité** | Avatar, StatusDot, Badge, SeverityIndicator |
| **Typographie** | Title, Subtitle, Body, Caption, MonoValue, SectionLabel |

À livrer également :
- la **galerie d'états** (route technique interne `/dev/ui`) ;
- le **système de focus-visible** commun ;
- le **système d'icônes linéaires** (jeu unique, style linéaire cohérent) ;
- les **règles d'accessibilité** de chaque primitive (rôle ARIA, comportement clavier).

### 2.2 Exclu (reporté)

- DataTable, KPI, Chart, Timeline, Kanban → **LOT 03**.
- Sidebar, Topbar, breadcrumb, tabs → **LOT 02**.
- Command palette, Notification Center → **LOT 04**.
- Tout composant métier.

## 3. Écrans concernés

| Route | Écran | Nature |
|---|---|---|
| `/dev/ui` | Galerie des primitives et de leurs états | outil interne, hors navigation produit |

Aucun écran produit.

## 4. Composants concernés

**Créés** : les primitives listées en §2.1.
**Réutilisés** : 100 % des tokens du LOT 00. **Aucune valeur en dur** (contrôle automatique).

Règle de non-duplication (l. 3423–3439) : avant de créer une primitive, vérifier qu'elle
n'existe pas déjà ; `ConfirmDialog` et `Modal` partagent la même base d'overlay.

## 5. UX

- **Feedback immédiat** sur toute interaction : hover, active (`scale ~0.96–0.97`, l. 7928),
  focus-visible, disabled explicite.
- **Aucun bouton décoratif** (l. 2659) : chaque bouton de la galerie a une action réelle de
  démonstration, jamais un bouton mort.
- **ConfirmDialog obligatoire** pour les opérations critiques : suppression, annulation, gros
  export, campagne importante, modification critique, réactivation, changement de permissions
  (l. 3253–3275).
- **EmptyState utile** : titre + explication + action. Modèle canonique (l. 3221–3236) :
  « Aucun prospect. » → « Commencez par ajouter votre premier prospect pour suivre vos
  opportunités commerciales. » → `Ajouter un prospect`.
- **ErrorState non technique** : message compréhensible et exploitable, jamais de stack trace à
  l'utilisateur ; les détails techniques restent dans les logs (l. 3237–3252).
- **PermissionDenied** : explique ce qui manque et vers qui se tourner ; ne simule aucune
  permission.
- **Clavier** : tout overlay se ferme à `Escape`, tout menu se navigue aux flèches, le focus est
  piégé dans les modales et rendu à l'élément déclencheur.

## 6. Design — application stricte du Design System

- Button primary = `--accent` avec texte sombre contrasté ; ghost = transparent + bordure ;
  hover subtil ; active `scale ~0.96–0.97` (l. 7922–7931).
- Champs : fond `--panel` / `--bg-2`, bordure `--border`, rayon 6–8 px, focus-visible net.
- Badge / StatusDot / SeverityIndicator : sémantique stricte (INFO `#4FC7B9`, SUCCESS `#6FCF97`,
  ATTENTION `#F2A93B`, CRITIQUE `#E0785F`) — **CRITIQUE jamais décoratif**.
- Toast : `panel`, border, shadow douce, entrée et sortie **par la droite**, progress bar fine,
  icône sémantique (l. 7940–7950).
- Modal / Drawer : overlay translucide, blur léger, apparition `scale + translateY`, rayon
  12–14 px.
- Aucune ombre portée colorée, aucun gradient hors usage justifié, aucun glassmorphism excessif.

## 7. Responsive

| Primitive | Desktop / laptop | Tablette ≤ 980 | Mobile ≤ 720 |
|---|---|---|---|
| Button | tailles sm/md/lg | md | md, pleine largeur en formulaire |
| Dropdown / ContextMenu | ancré à l'élément | ancré | sheet bas d'écran si ancrage impossible |
| Modal | centré, largeur bornée | centré | quasi pleine largeur, marges réduites |
| Drawer | latéral | latéral plus étroit | plein écran ou sheet |
| Toast | bas droite | bas droite | bas, pleine largeur |
| DatePicker | panneau inline | panneau | sheet |
| FileUpload | zone de dépôt | zone | zone compacte + bouton |
| Stepper | horizontal | horizontal condensé | vertical ou indicateur `3/10` |

Cibles tactiles conformes sur mobile ; aucun overflow horizontal.

## 8. Motion

- Micro-interactions : 140–220 ms. Changements d'état : 220–320 ms. Panel/drawer : 320 ms.
- Easing unique `cubic-bezier(.2,.8,.2,1)`.
- Toast : 220 ms en entrée comme en sortie, translation X depuis la droite.
- Aucun bounce, aucune rotation décorative, aucun zoom agressif.
- `prefers-reduced-motion: reduce` : transitions quasi instantanées, overlays affichés
  directement.

## 9. États

Chaque primitive est livrée avec ses états pertinents parmi les 15 obligatoires :

- Button : default, hover, active, focus-visible, disabled, loading, (danger).
- Input / Select / DatePicker : default, hover, focus-visible, disabled, error, loading.
- Checkbox / Radio / Switch : default, hover, focus-visible, checked, disabled, mixed.
- Badge / StatusDot / SeverityIndicator : info, success, warning, critical, neutral.
- FileUpload : default, hover, dragover, uploading, success, error.
- Overlay (Modal/Drawer/Confirm) : ouverture, ouvert, fermeture.
- États d'écran : EmptyState, ErrorState, Skeleton, PermissionDenied, OfflineState,
  SyncingState, ModuleUnavailable.

La galerie `/dev/ui` affiche **tous** ces états côte à côte, sur les deux thèmes.

## 10. Données

Données de démonstration de la galerie uniquement (libellés, noms fictifs neutres).
**Aucune donnée métier mockée**, aucune statistique, aucun chiffre d'entreprise fictif.
Aucun contenu issu d'une source de référence visuelle (l. 8334–8358).

## 11. Interdits spécifiques au lot

- Créer un composant de données (table, KPI, chart) : c'est le LOT 03.
- Créer le shell ou une navigation : c'est le LOT 02.
- Introduire une couleur, un rayon, une ombre ou une durée hors tokens.
- Produire un bouton sans action réelle de démonstration.
- Simuler une permission ou un état de sécurité.
- Dupliquer une primitive existante au lieu de l'étendre.

## 12. Méthode d'exécution

- **A** : relire LOT 00 (tokens validés) et le socle commun §2–§5 ; lister les primitives déjà
  présentes.
- **B** : annoncer la liste des fichiers, l'ordre de construction, la stratégie de test.
- **C** : construire les primitives par famille, puis la galerie.
- **D** : intégrer les primitives à la galerie et aux deux thèmes.
- **E** : tester clavier, focus, ARIA, reduced-motion, contraste, les deux thèmes, les trois
  breakpoints ; exécuter le contrôle « aucune valeur en dur ».
- **F** : corriger contrastes, focus perdus, overflow, états manquants.
- **G** : valider lorsque chaque primitive montre tous ses états pertinents sans régression.

## 13. Validation — checklist

- [ ] Toutes les primitives du §2.1 existent et sont utilisées par la galerie.
- [ ] Chaque primitive expose ses états pertinents parmi les 15 obligatoires.
- [ ] Les deux thèmes rendent correctement, avec bascule fonctionnelle.
- [ ] `focus-visible` visible partout ; navigation clavier complète ; `Escape` ferme les overlays.
- [ ] Rôles ARIA corrects ; labels explicites ; couleur jamais seule.
- [ ] `prefers-reduced-motion` respecté.
- [ ] ConfirmDialog couvre les opérations critiques listées au §5.
- [ ] EmptyState, ErrorState, PermissionDenied, Offline, Syncing, ModuleUnavailable présents.
- [ ] Toast : entrée/sortie à droite, progress bar, icône sémantique.
- [ ] Aucun bouton décoratif, aucune donnée métier mockée.
- [ ] Aucune valeur visuelle en dur (contrôle exécuté et passé).
- [ ] Aucun overflow horizontal aux 3 breakpoints.
- [ ] Aucune régression sur le LOT 00 (tokens inchangés).

## 14. Rapport attendu

Format du socle commun §10, avec la liste des primitives livrées, le nombre d'états couverts,
les tests réellement exécutés et leur résultat, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 02.
