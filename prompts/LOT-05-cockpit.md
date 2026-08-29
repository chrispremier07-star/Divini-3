# LOT 05 — Cockpit

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 03 et LOT 04 (validés). **Débloque** : LOT 06, LOT 09, LOT 14.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire le **Cockpit** : le premier écran du produit, celui qui répond à la question
« que se passe-t-il dans mon entreprise aujourd'hui et que dois-je faire ? ».

Le corpus est explicite (l. 587–624) : **le dashboard ne doit pas être uniquement une
collection de KPI.** Il doit exposer *À surveiller*, *Bonnes nouvelles*, puis
*Que voulez-vous faire ?* — et proposer la **Mission du jour** avec son impact financier
estimé (l. 625–644).

## 2. Périmètre

### 2.1 Inclus

1. **Bloc « Aujourd'hui dans votre entreprise »** (l. 596–624) :
   - **À surveiller** — risques de stock, créances, dépenses, baisse de CA, anomalies,
     échéances, opérations inhabituelles ;
   - **Bonnes nouvelles** — croissance, amélioration de marge, nouveaux clients, réduction de
     dépenses, diminution du stock dormant.
2. **Bloc « Que voulez-vous faire ? »** : `Voir les détails` · `Agir` · `Demander à l'IA`
   (ce dernier relaie vers COPILOT — état « LOT 14 » explicite, aucune réponse inventée).
3. **Mission du jour** (l. 625–644) : actions prioritaires concrètes
   (« relancer 8 clients », « commander 3 produits », « valider 5 dépenses ») avec
   **impact financier estimé** affiché, progression de la mission et état d'avancement.
4. **Rangée de KPI essentiels** : CA du jour et référence, trésorerie disponible, commandes en
   cours, alertes critiques, créances, stock à risque — avec delta sémantique et count-up.
5. **Graphique principal** : évolution du CA sur la période choisie, avec reveal progressif.
6. **Sélecteurs de contexte** : période (aujourd'hui, 7 jours, 30 jours, personnalisé) et
   portée (tenant / établissement) — cohérents avec le sélecteur global du shell.
7. **Cartes d'action** : chaque signal est actionnable et mène à un écran réel du produit
   (Ventes, Stocks, Trésorerie, CRM, Alertes).
8. **Épinglage** : l'utilisateur peut épingler les sections qui comptent pour lui (préférence
   locale).

### 2.2 Exclu (reporté)

- Les écrans cibles des cartes d'action, s'ils ne sont pas encore livrés : la carte affiche
  alors l'état « module en construction — LOT nn », **jamais** un écran vide.
- Le score de santé complet → **LOT 15**.
- Les prédictions RADAR et la projection CASH VISION → **LOT 14** / **LOT 09**.
- Toute exécution réelle d'une recommandation → **LOT 14**.

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app` | Cockpit | N1 + N3 |

États d'écran obligatoires : chargement, vide (aucune activité sur la période), erreur,
hors ligne (données non à jour), permission refusée (sections non autorisées explicitement
marquées).

## 4. Composants concernés

**Créés** : CockpitLayout, TodaySection, WatchItem, GoodNewsItem, WhatNextActions,
DailyMission, MissionItem, MissionProgress, CockpitKpiRow, MainChartCard, PeriodSelector,
PinnableSection.
**Réutilisés** : KpiCard, KpiGrid, Chart, DataPanel, Timeline, ActivityFeed, ProgressBar,
Badge, StatusDot, SeverityIndicator, Button, EmptyState, Skeleton, ErrorState, OfflineState,
PermissionDenied — et le Command Center pour « Demander à l'IA ».

## 5. UX

- **Lire en 10 secondes** : hiérarchie claire — d'abord *À surveiller*, puis *Mission du jour*,
  puis les KPI, puis le graphique. Aucun mur de cartes.
- **Comprendre pourquoi** : chaque signal explique sa cause en une ligne et indique la donnée
  qui le fonde ; aucun signal opaque.
- **Agir sans chercher** : `Voir les détails` ouvre l'écran concerné avec le bon filtre déjà
  appliqué ; `Agir` ouvre l'action directe ; `Demander à l'IA` ouvre le Command Center sur la
  section Analyse.
- **Mission du jour** : l'utilisateur comprend immédiatement ce qu'il doit faire et ce que cela
  rapporte ; cocher une tâche met à jour la progression sans rechargement.
- **Pas de surcharge** : le nombre de signaux affichés est borné ; le reste est accessible via
  « tout voir ».
- **Honnêteté** : les signaux et les missions proviennent de données mockées **signalées** ;
  l'impact financier estimé est affiché comme une **estimation**, jamais comme un résultat.

## 6. Design — application stricte du Design System

- Surface de travail `--bg`, sections sur `--panel`, bordures `--border` / `--border-soft`.
- Titres de section en Space Grotesk, corps en Inter, **toutes les valeurs en IBM Plex Mono**.
- Gravité des signaux : CRITIQUE `#E0785F`, ATTENTION `#F2A93B`, INFO `#4FC7B9`,
  SUCCESS `#6FCF97` — avec icône et texte, jamais la couleur seule.
- KPI : valeur forte, label muté, delta sémantique, hover minimal, **aucune carte criarde**.
- Graphique : grille subtile, trait fin, aire translucide, légende compacte.
- Aucune carte décorative, aucune icône illustrative, aucun gradient.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Cockpit | 2–3 colonnes | 2 colonnes | 1–2 colonnes | **1 colonne** |
| Ordre de priorité | À surveiller · Mission · KPI · graphe | idem | idem | **À surveiller → Mission du jour → KPI → graphe** |
| KpiRow | 4–6 | 3–4 | 2 | 1–2 |
| Graphique | pleine largeur + légende | pleine largeur | hauteur réduite | simplifié + valeurs en mono |
| Sélecteurs | inline dans l'en-tête | inline | condensés | en drawer |
| Cartes d'action | grille | grille | 2 colonnes | empilées, pleine largeur |

Aucune section supprimée sur mobile : l'ordre change, l'information reste.

## 8. Motion

- Count-up des KPI : 1 100–1 200 ms à l'entrée dans le viewport.
- Reveal du graphique principal : tracé progressif (~1 300 ms de référence).
- Apparition des sections : fondu + `translateY(18px)` → `0`, 700 ms, easing canonique,
  **une seule fois** (pas de rejeu).
- Progression de la mission : transition d'état 220–320 ms.
- Aucune animation en boucle sur le Cockpit. Aucune pulsation permanente.
- `prefers-reduced-motion` : valeurs finales directes, reveal immédiat, pas de translation.

## 9. États

- **Cockpit** : loading (skeletons de section), vide (aucune activité — EmptyState utile),
  error, offline (bandeau « données non à jour »), syncing, permission denied (section marquée).
- **WatchItem / GoodNewsItem** : default, hover, focus-visible, acquitté, critique, en cours
  de traitement.
- **DailyMission / MissionItem** : à faire, en cours, fait, non applicable, impact estimé
  affiché, progression.
- **KPI** : default, loading, valeur indisponible, delta positif, delta négatif, delta neutre.
- **Chart** : loading, vide, erreur, données partielles.
- **PeriodSelector / portée** : default, ouvert, sélectionné, loading.

## 10. Données

Mockées et **signalées** par un bandeau discret mais permanent (« données de démonstration ») :
- signaux plausibles (risque de stock, créance âgée, dépense en attente, baisse de CA) ;
- missions du jour cohérentes avec ces signaux ;
- KPI et séries temporelles en **FCFA**, cohérents entre eux (un CA annoncé doit correspondre à
  la série affichée) ;
- **aucun contenu de source externe** (sociétés, témoignages, statistiques — l. 8334–8358).

Cohérence obligatoire : les mêmes données mockées alimentent Cockpit, alertes et navigation,
pour que les parcours soient réalistes.

## 11. Interdits spécifiques au lot

- Transformer le Cockpit en collection de cartes (l. 587–590, 2657).
- Afficher un signal sans explication ni action.
- Inventer une réponse d'IA ou simuler COPILOT.
- Présenter un impact estimé comme un résultat obtenu.
- Afficher une carte d'action menant à un écran vide non assumé.
- Animer en boucle un KPI ou un graphique.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 587–644), vérifier les composants LOT 03 réutilisables, vérifier
  le manifeste LOT 02 pour les destinations des cartes d'action.
- **B** : annoncer fichiers, structure des données mockées partagées, stratégie de test.
- **C** : construire les sections, la mission du jour, les KPI, le graphique.
- **D** : brancher les cartes d'action sur les routes réelles (ou l'état « en construction »),
  brancher « Demander à l'IA » sur le Command Center.
- **E** : tester les 4 périodes, les 2 portées, les 4 breakpoints, les deux thèmes, clavier,
  reduced-motion, cohérence des données entre sections.
- **F** : corriger incohérences de données, overflow, hiérarchie, focus.
- **G** : valider lorsque l'écran se lit en quelques secondes et que chaque signal mène à une
  action réelle.

## 13. Validation — checklist

- [ ] « Aujourd'hui dans votre entreprise » avec *À surveiller* et *Bonnes nouvelles*.
- [ ] « Que voulez-vous faire ? » avec les trois entrées canoniques.
- [ ] Mission du jour avec actions concrètes, **impact financier estimé** et progression.
- [ ] KPI essentiels avec delta sémantique non chromatique et count-up.
- [ ] Graphique principal avec reveal progressif et légende compacte.
- [ ] Sélecteurs de période et de portée fonctionnels et cohérents avec le shell.
- [ ] Chaque signal : cause en une ligne + action réelle.
- [ ] Le nombre de signaux affichés est borné, avec « tout voir ».
- [ ] Épinglage des sections mémorisé localement.
- [ ] Les 5 familles d'états d'écran couvertes (loading, vide, erreur, offline, permission).
- [ ] Bandeau « données de démonstration » présent.
- [ ] Cohérence vérifiée entre signaux, missions, KPI et graphique.
- [ ] Hiérarchie de lecture : À surveiller → Mission → KPI → graphe (mobile compris).
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 04.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la liste des signaux et missions de démonstration,
les destinations réelles des cartes d'action (et celles marquées « en construction »), et
`AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 06.
