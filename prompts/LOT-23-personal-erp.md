# LOT 23 — Personal ERP

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 09 (validé). **Débloque** : —
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire le **Personal ERP** : un module **séparé et complémentaire**, **non rattaché au
tenant professionnel** (l. 2270–2291), qui gère les finances personnelles de l'utilisateur :
revenus, dépenses, épargne, objectifs, analyses et recommandations.

L'enjeu principal n'est pas fonctionnel mais **architectural et visuel** : les données
personnelles ne doivent jamais se mélanger aux données de l'entreprise, ni dans les écrans, ni
dans les indicateurs, ni dans les exports.

## 2. Périmètre

### 2.1 Inclus

1. **Vue d'ensemble personnelle** : solde, revenus du mois, dépenses du mois, taux d'épargne,
   progression des objectifs.
2. **Revenus personnels** : liste, création, récurrence, catégorie.
3. **Dépenses personnelles** : liste, création, catégorie, récurrence, justificatif facultatif.
4. **Épargne** : comptes d'épargne, versements, retraits, évolution.
5. **Objectifs** : objectif, montant cible, échéance, progression, versements associés.
6. **Analyses** : répartition par catégorie, évolution mensuelle, comparaison de périodes,
   capacité d'épargne.
7. **Recommandations** : produites par le **moteur local déterministe** (mêmes règles que le
   LOT 14), avec mention explicite « analyse de démonstration — aucun modèle d'IA connecté ».
8. **Séparation visible** : le module est accessible par une entrée distincte, dans un contexte
   visuellement identifié comme **personnel**, avec un avertissement permanent rappelant la
   séparation.
9. **Export personnel** (aperçu ; export réel reporté).

### 2.2 Exclu (reporté)

- Toute liaison comptable avec le tenant professionnel — **interdite par conception**.
- Recommandations réellement produites par un modèle → relais explicite.
- Synchronisation bancaire personnelle → hors périmètre.

## 3. Écrans concernés

| Route | Écran | Nature |
|---|---|---|
| `/app/personal` | Vue d'ensemble personnelle | module séparé |
| `/app/personal/revenus` · `/{id}` | Revenus | module séparé |
| `/app/personal/depenses` · `/{id}` | Dépenses | module séparé |
| `/app/personal/epargne` · `/{id}` | Épargne | module séparé |
| `/app/personal/objectifs` · `/{id}` | Objectifs | module séparé |
| `/app/personal/analyses` | Analyses | module séparé |

## 4. Composants concernés

**Créés** : PersonalContextBanner, PersonalOverview, PersonalBalanceCard, IncomeList,
IncomeForm, RecurrenceSelector, ExpenseList, ExpenseForm, PersonalCategoryPicker,
SavingsAccountList, SavingsAccountDetail, ContributionForm, GoalList, GoalCard,
GoalProgressRing, GoalContributionDialog, PersonalAnalysisPanel, CategoryBreakdownChart,
SavingsCapacityPanel, PersonalRecommendationList.
**Réutilisés** : DataTable, KpiCard, KpiGrid, Chart, DataPanel, Timeline, Progress,
ProgressRing, Badge, StatusDot, Button, Search, Select, Input, DatePicker, Checkbox, Modal,
Drawer, ConfirmDialog, EmptyState, Skeleton, ErrorState, OfflineState.

## 5. UX

- **Savoir où l'on est** : un bandeau permanent indique que l'espace est **personnel** et
  séparé de l'entreprise.
- **Ne jamais confondre** : aucun indicateur personnel n'apparaît dans le Cockpit, les rapports
  ou les indicateurs de l'entreprise — et réciproquement.
- **Suivre un objectif simplement** : cible, échéance, progression, prochain versement.
- **Comprendre sa capacité d'épargne** : calcul affiché avec ses hypothèses.
- **Recommandations honnêtes** : produites localement, avec les données utilisées, et jamais
  présentées comme un conseil financier personnalisé certifié.

## 6. Design — application stricte du Design System

- Même palette et mêmes composants — **Design System unique** (l. 8415–8444).
- La distinction « personnel » passe par le **bandeau de contexte** et la navigation, pas par
  une autre charte graphique.
- Montants en **IBM Plex Mono**, devise explicite (FCFA).
- Progression d'objectif : anneau sobre avec valeur numérique affichée.
- Aucun graphisme décoratif, aucune illustration.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Vue d'ensemble | 3 colonnes | 2 | 2 | 1 colonne |
| Listes | table complète | colonnes réduites | colonnes prioritaires | mode carte |
| Objectifs | grille de cartes | 2–3 | 2 | 1 colonne |
| Analyses | graphiques côte à côte | 2 colonnes | 1 colonne | 1 colonne |
| Formulaires | 2 colonnes | 2 colonnes | 1 colonne | 1 colonne |

## 8. Motion

- Count-up des soldes et de l'épargne : 1 100–1 200 ms.
- Progression d'objectif : transition 220–320 ms, **sans célébration**.
- Reveal des graphiques : progressif, une seule fois.
- Aucune animation en boucle.
- `prefers-reduced-motion` : transitions quasi instantanées.

## 9. États

- **Module** : aucun mouvement (EmptyState utile avec première action), chargement, erreur,
  offline, syncing, permission denied.
- **Revenus / dépenses** : ponctuel, récurrent, modifié, supprimé (confirmation), catégorie
  manquante.
- **Épargne** : aucun compte, versement en cours, retrait, solde insufficient (refus).
- **Objectifs** : à créer, en cours, atteint, dépassé, échéance dépassée (ATTENTION),
  abandonné.
- **Recommandations** : données insuffisantes, recommandations disponibles, service IA requis.

## 10. Données

Mockées et **signalées**, **totalement disjointes** des données des autres modules :
aucune référence à une vente, une facture, un client ou un produit de l'entreprise.
Montants personnels en FCFA, cohérents entre revenus, dépenses, épargne et objectifs.

## 11. Interdits spécifiques au lot

- Mélanger données personnelles et données de l'entreprise, dans quelque écran que ce soit.
- Faire apparaître un indicateur personnel dans le Cockpit, les rapports ou les indicateurs.
- Simuler un conseil financier personnalisé certifié.
- Célébrer un objectif atteint par une animation.
- Donner au module une charte graphique différente.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 2270–2291), vérifier les composants financiers du LOT 09.
- **B** : annoncer fichiers, règle de séparation des données, stratégie de test.
- **C** : construire vue d'ensemble, revenus, dépenses, épargne, objectifs, analyses,
  recommandations.
- **D** : intégrer au shell (LOT 02) avec une entrée distincte et le bandeau de contexte.
- **E** : tester la séparation (vérification explicite qu'aucune donnée personnelle n'apparaît
  ailleurs et réciproquement), les objectifs, les recommandations, les 4 breakpoints, les deux
  thèmes, clavier, reduced-motion.
- **F** : corriger toute fuite de données entre contextes, tout état manquant.
- **G** : valider lorsque la séparation est vérifiée dans les deux sens.

## 13. Validation — checklist

- [ ] Module accessible par une entrée distincte, bandeau de contexte permanent.
- [ ] Revenus, dépenses, épargne, objectifs, analyses présents.
- [ ] Objectifs : cible, échéance, progression, versements.
- [ ] Capacité d'épargne calculée avec hypothèses affichées.
- [ ] Recommandations locales avec mention explicite et données utilisées.
- [ ] **Séparation vérifiée dans les deux sens** (aucune donnée personnelle dans les modules
      entreprise, aucune donnée entreprise dans le module personnel).
- [ ] Même Design System, aucune charte parallèle.
- [ ] Montants en mono, devise explicite.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 22.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la preuve de la séparation des données dans les deux
sens, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 24.
