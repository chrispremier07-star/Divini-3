# LOT 03 — Data & Feedback

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 01 (validé). **Débloque** : LOT 04, 05, 06, 08, 09, 15.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire les **composants de données** qui porteront tout l'ERP : table, KPI, graphique,
timeline, flux d'activité, progression, panneau de données et kanban.

Ce lot est le plus réutilisé du projet : les lots 05 à 23 n'afficheront aucune donnée autrement
que par ces composants. Leur qualité détermine la qualité perçue de tout le produit.

## 2. Périmètre

### 2.1 Inclus

| Composant | Exigences canoniques (l. 7890–7921) |
|---|---|
| **DataTable** | header compact en capitales ; bordures discrètes ; hover de ligne `--panel-2` ; identifiants en IBM Plex Mono ; actions secondaires **révélées au survol** ; badges compacts |
| **KPI** | valeur forte en mono ; label muté ; delta sémantique ; **count-up** ; hover minimal ; **aucune carte criarde** |
| **Chart** | grille subtile ; ligne fine ; zone faible/translucide ; légende compacte ; **reveal progressif** ; couleurs sémantiques |
| **Kanban** | colonnes `--panel` ; cartes `--panel-2` ; drag-over `--accent-soft` ; curseurs grab / grabbing ; feedback de déplacement discret |
| **Timeline** | événements datés, acteur, nature, résultat ; lecture verticale dense mais aérée |
| **ActivityFeed** | flux temps réel, regroupement par type, horodatage relatif + absolu |
| **Progress** | barre et anneau, valeur en mono, seuils sémantiques |
| **DataPanel** | conteneur de données : titre, sous-titre, actions, contenu, pied |

Fonctionnalités transverses de la table :
- tri par colonne (asc / desc / neutre) avec indicateur ;
- filtres (facettes, plage de dates, recherche) avec **état reflété dans l'URL** ;
- pagination **ou** chargement progressif, au choix par écran ;
- sélection multiple + barre d'actions groupées ;
- colonnes configurables (visibles / masquées / ordre) ;
- export visuel de la vue courante (état « à venir » explicite tant que l'export n'est pas réel) ;
- **virtualisation** pour les gros volumes (l. 2738–2763) ;
- **mode carte** sur mobile.

### 2.2 Exclu (reporté)

- Les écrans de modules qui consomment ces composants (lots 05+).
- Les graphiques spécifiques (projection de trésorerie → LOT 09, radar → LOT 14).
- Les 5 motions d'agents de la landing → **LOT 22**.

### 2.3 Décision à confirmer en ouverture de lot

| Décision | Impact |
|---|---|
| Bibliothèque de graphiques (le corpus n'en nomme aucune) : solution légère et maîtrisée, ou rendu maison | poids, animation de reveal, cohérence des couleurs sémantiques |

## 3. Écrans concernés

| Route | Écran | Nature |
|---|---|---|
| `/dev/data` | Galerie technique : chaque composant dans ses états, sur jeux de données de tailles variées (0, 1, 12, 500, 50 000 lignes simulées) | outil interne |

Aucun écran produit.

## 4. Composants concernés

**Créés** : DataTable, TableColumn, TableFilters, TablePagination, TableBulkBar, KpiCard,
KpiGrid, Chart (line / area / bar / spark), ChartLegend, Kanban, KanbanColumn, KanbanCard,
Timeline, TimelineItem, ActivityFeed, ActivityItem, ProgressBar, ProgressRing, DataPanel.
**Réutilisés** : Skeleton, EmptyState, ErrorState, Badge, StatusDot, SeverityIndicator,
IconButton, Dropdown, Checkbox, Search, DatePicker, Button — et tous les tokens LOT 00.

## 5. UX

- **Comprendre avant d'agir** : chaque KPI indique sa période, sa portée et son sens de
  variation ; chaque graphique a une légende compacte et un axe lisible.
- **Actions révélées, pas imposées** : les actions de ligne n'apparaissent qu'au survol (desktop)
  ou dans un menu (tactile), pour ne pas saturer la table.
- **Aucun écran vide injustifié** : une table sans donnée affiche un EmptyState utile (titre +
  explication + action), jamais un rectangle vide.
- **Filtres visibles et réversibles** : les filtres actifs sont affichés sous forme de jetons
  supprimables ; l'URL reflète l'état, donc partageable et restaurable.
- **Gros volumes** : pagination ou virtualisation obligatoires — jamais charger toute une base
  (l. 2738–2763).
- **Delta sémantique** : une variation n'est jamais exprimée par la couleur seule ; flèche +
  signe + valeur.
- **Kanban** : le déplacement est explicite (cible mise en évidence `--accent-soft`), avec
  annulation possible tant que l'action n'est pas confirmée.

## 6. Design — application stricte du Design System

- Header de table compact, en capitales, `--muted`, taille réduite, tracking léger.
- Lignes : bordure `--border-soft`, hover `--panel-2`, sélection `--accent-soft`.
- Identifiants, références, montants, quantités : **IBM Plex Mono**. Texte courant : Inter.
  Titres de panneau : Space Grotesk.
- KPI : valeur forte en mono, label muté, delta coloré sémantiquement, **aucune ombre colorée,
  aucun gradient**.
- Chart : grille `--border-soft` très discrète, trait fin, remplissage translucide faible,
  couleurs issues de la sémantique (`--info`, `--positive`, `--negative`, `--accent`).
- Kanban : colonnes `--panel`, cartes `--panel-2`, bordures fines, rayon 10 px.
- Rayons : 10 px pour les cartes et panneaux, 6–8 px pour les contrôles.

## 7. Responsive

| Composant | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| KpiGrid | 4–6 colonnes | 3–4 | **2** | 1–2 |
| DataTable | toutes colonnes | colonnes secondaires masquées | colonnes prioritaires + actions en menu | **mode carte** (ligne → carte), tri et filtres en drawer |
| Chart | pleine largeur + légende | pleine largeur | hauteur réduite | version simplifiée, valeurs en mono sous le graphe |
| Kanban | colonnes côte à côte | colonnes scrollables | 1–2 colonnes scrollables | 1 colonne, cartes empilées |
| Timeline / ActivityFeed | pleine largeur | pleine largeur | condensé | condensé, horodatage court |
| Filtres | barre inline | barre inline | jetons + « plus de filtres » | drawer plein écran |
| Actions groupées | barre au-dessus de la table | idem | idem | barre collante en bas |

Aucun overflow horizontal ; les tableaux ne débordent jamais : soit les colonnes se réduisent,
soit le mode carte prend le relais.

## 8. Motion

- **Count-up KPI** : 1 100–1 200 ms, easing canonique, déclenché à l'entrée dans le viewport.
- **Reveal de graphique** : tracé progressif (~1 300 ms de référence pour le trait), aires
  révélées après le trait, décalage léger entre séries.
- **Hover de ligne** : 140–220 ms.
- **Révélation des actions de ligne** : 140–220 ms.
- **Kanban** : déplacement discret, drag-over 220–320 ms, jamais de bounce.
- **Chargement** : skeleton animé sobre (pas de spinner permanent), transition skeleton → donnée
  sans clignotement (l. 3253–3274).
- `prefers-reduced-motion` : count-up remplacé par la valeur finale, reveal immédiat, aucune
  animation de skeleton prolongée.

## 9. États

Chaque composant de données couvre :

- `default` · `hover` · `active` · `focus-visible` · `disabled` ;
- `loading` (skeleton de lignes / de carte / de graphe) ;
- `empty` (EmptyState utile, distinct de « vide après filtre ») ;
- `error` (message non technique + action de reprise) ;
- `offline` (données potentiellement non à jour, indication explicite) ;
- `syncing` (synchronisation en cours) ;
- `permission denied` (colonne ou ligne **explicitement** marquée comme inaccessible — jamais un
  masquage silencieux qui ferait croire à une donnée absente) ;
- `success` / `info` / `warning` / `critical` pour les valeurs et badges sémantiques.

## 10. Données

Jeux de données **mockés et signalés comme tels** dans la galerie :
- volumes variés (0, 1, 12, 500, 50 000 lignes) pour prouver pagination et virtualisation ;
- libellés neutres, montants en FCFA cohérents, dates plausibles ;
- **aucun contenu issu d'une source de référence visuelle** (sociétés, témoignages, tarifs,
  statistiques — l. 8334–8358).

Un bandeau permanent de la galerie rappelle que ces données sont simulées.

## 11. Interdits spécifiques au lot

- Construire un écran de module.
- Charger un volume entier sans pagination ni virtualisation.
- Utiliser la couleur comme seul vecteur d'une variation ou d'une gravité.
- Produire un KPI « criard » (ombre colorée, gradient, icône décorative).
- Inventer une donnée de démonstration ressemblant à une donnée réelle d'entreprise.
- Animer en boucle un graphique ou un KPI.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 7890–7921, 2738–2763, 3204–3274), vérifier les composants déjà
  livrés (non-duplication).
- **B** : annoncer fichiers, contrat de props des composants, stratégie de test, décision sur la
  bibliothèque de graphiques.
- **C** : construire les composants, puis la galerie avec jeux de données variés.
- **D** : intégrer aux primitives LOT 01 et aux tokens LOT 00.
- **E** : tester tri, filtres, pagination, virtualisation à 50 000 lignes, sélection multiple,
  drag kanban, clavier, focus, les 4 breakpoints, les deux thèmes, reduced-motion.
- **F** : corriger overflow, pertes de focus, scintillements, états manquants.
- **G** : valider lorsque chaque composant gère ses états et ses volumes sans régression.

## 13. Validation — checklist

- [ ] DataTable : header compact en capitales, hover `--panel-2`, identifiants en mono, actions
      révélées au survol, badges compacts.
- [ ] Tri, filtres (jetons supprimables), état dans l'URL, pagination **ou** chargement
      progressif.
- [ ] Virtualisation effective à 50 000 lignes (fluidité vérifiée).
- [ ] Mode carte fonctionnel sur mobile, sans perte d'information ni d'action.
- [ ] KPI : valeur mono, label muté, delta sémantique non chromatique, count-up 1 100–1 200 ms,
      aucune carte criarde.
- [ ] Chart : grille subtile, trait fin, aire translucide, légende compacte, reveal progressif,
      couleurs sémantiques.
- [ ] Kanban : colonnes `--panel`, cartes `--panel-2`, drag-over `--accent-soft`, grab/grabbing.
- [ ] Timeline, ActivityFeed, Progress, DataPanel conformes.
- [ ] Les états du §9 sont tous couverts, y compris `permission denied` explicite.
- [ ] EmptyState distinct pour « aucune donnée » et « aucun résultat après filtre ».
- [ ] Les 4 breakpoints conformes, aucun overflow horizontal.
- [ ] Les deux thèmes corrects ; `prefers-reduced-motion` respecté.
- [ ] Données mockées signalées ; aucune donnée de source externe.
- [ ] Aucune régression sur LOT 00, 01, 02.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : les mesures de fluidité à 50 000 lignes, la décision
sur la bibliothèque de graphiques, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 04.
