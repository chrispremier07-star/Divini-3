# LOT 09 — Finance

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 03 et LOT 05 (validés). **Débloque** : LOT 11, LOT 14, LOT 23.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire le module **Finance** : trésorerie, **CASH VISION**, comptabilité, dépenses avec
workflow d'approbation, et devises.

CASH VISION est l'une des cinq signatures du produit : elle doit répondre à
« **sachez où est votre argent** » — passé, frontière présent/futur, projection, bascule
négative (l. 785–833, 8160–8177).

## 2. Périmètre

### 2.1 Inclus

1. **Trésorerie** : soldes par compte/caisse, flux (entrées / sorties), échéances à venir,
   créances, dettes, rapprochement visuel, export (état « à venir » explicite).
2. **CASH VISION** : courbe historique, **frontière présent/futur**, projection en pointillé,
   **bascule négative** mise en évidence, marqueur temporel, scénarios comparés
   (« si j'encaisse X plus tôt », « si je reporte cette dépense »).
3. **Comptabilité** : revenus, dépenses, catégories, **périodes** (ouverture, clôture, état),
   rapports (résultat, balance simplifiée, grands postes), créances âgées, dettes, exports.
4. **Dépenses** : création, catégorisation, montant, date, **justificatif**, statut,
   approbation, historique.
   Workflow canonique (l. 1982–1984) : `créée → en attente → approuvée → payée / rejetée`.
5. **Devises** (l. 517–535) : conversion, distinction **devise de transaction / devise du
   tenant / devise d'affichage**, taux utilisé, **date du taux**, **source du taux**.
6. **Garde-fous visuels** : une période clôturée est verrouillée à l'écran ; une valeur
   comptable historique est affichée comme **non rétro-modifiable**.
7. **Analyse financière avancée** (l. 812–833) : marge, évolution, comparaison de périodes.

### 2.2 Exclu (reporté)

- Écritures comptables réelles, clôture effective, rapprochement bancaire réel → phase backend.
- Masse salariale et paie → **LOT 11**.
- Paiement réel d'une dépense → backend.
- Prédiction de trésorerie par modèle → la projection est **mockée et signalée** comme
  projection de démonstration.

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/tresorerie` | Trésorerie | N1 |
| `/app/tresorerie/cash-vision` | CASH VISION | N3 |
| `/app/comptabilite` | Comptabilité | N1 |
| `/app/comptabilite/rapports` · `/{id}` | Rapports comptables | N3 |
| `/app/comptabilite/periodes` | Périodes (ouverture / clôture) | N2 |
| `/app/depenses` · `/{id}` · `/nouveau` | Dépenses & approbations | N1 + N2 |
| `/app/devises` | Convertisseur & taux | N1 |

## 4. Composants concernés

**Créés** : CashBalanceCards, CashFlowTable, UpcomingDuePanel, CashVisionChart,
PresentFutureDivider, ProjectionToggle, NegativeCrossoverMarker, TimeMarker, ScenarioPanel,
ScenarioComparator, AccountingPeriodList, PeriodLockBadge, LedgerSummary, AgingReceivables,
ExpenseForm, ReceiptUploader, ApprovalStepper, ApprovalActions, ExpenseStatusBadge,
CurrencyConverter, RateSourceNote.
**Réutilisés** : KpiCard, KpiGrid, Chart, DataTable, DataPanel, Timeline, Progress,
SeverityIndicator, Badge, StatusDot, Button, Search, Select, Input, DatePicker, FileUpload,
Modal, Drawer, ConfirmDialog, EmptyState, Skeleton, ErrorState, PermissionDenied, OfflineState.

## 5. UX

- **Répondre à la question avant d'afficher des chiffres** : CASH VISION ouvre sur la réponse
  (« trésorerie suffisante jusqu'au … » / « bascule négative prévue le … »), puis sur la courbe.
- **Distinguer le réel du projeté** : le passé est plein, le futur est pointillé, la frontière
  est explicite. Aucune confusion possible.
- **Comparer des scénarios** : l'utilisateur voit l'effet d'une décision avant de la prendre —
  toujours présenté comme une estimation.
- **Approuver sans ambiguity** : une dépense montre son justificatif, son montant, sa catégorie,
  son demandeur, et les actions autorisées selon le rôle.
- **Ne jamais laisser croire qu'une période est modifiable** : une période clôturée est
  visuellement verrouillée, avec explication.
- **Devises honnêtes** : le taux affiché indique sa **date** et sa **source** ; une conversion
  n'est jamais présentée comme une valeur comptable historique.

## 6. Design — application stricte du Design System

- **Tous les montants en IBM Plex Mono**, alignés à droite, avec devise explicite (FCFA).
- CASH VISION : trait fin pour le passé, pointillé pour la projection, aire translucide faible,
  grille subtile, légende compacte.
- Bascule négative : CRITIQUE `#E0785F` **avec marqueur et libellé**, jamais la couleur seule.
- Dépenses : badges de statut sémantiques (créée = neutre, en attente = ATTENTION,
  approuvée = INFO, payée = SUCCESS, rejetée = CRITIQUE).
- Justificatif : aperçu sobre, aucune miniature décorative.
- Période clôturée : badge de verrouillage discret mais explicite.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Trésorerie | soldes + flux côte à côte | 2 colonnes | 1–2 colonnes | 1 colonne |
| CASH VISION | courbe pleine largeur + panneau scénario | courbe + panneau réduit | courbe seule, scénario en bas | courbe simplifiée + valeurs en mono, scénario en sheet |
| Comptabilité | tableaux complets | colonnes réduites | colonnes prioritaires | mode carte |
| Dépenses | liste + détail 2 colonnes | idem | 1 colonne | 1 colonne |
| Approbation | barre d'actions dans l'en-tête | idem | barre collante | **barre collante en bas** |
| Convertisseur | 2 colonnes | 2 colonnes | 1 colonne | 1 colonne |

## 8. Motion

- Tracé de la courbe CASH VISION : reveal progressif (~1 300 ms de référence), puis apparition
  de la projection en fondu, puis **pulse bref et unique** du marqueur temporel.
- Count-up des soldes : 1 100–1 200 ms.
- Comparaison de scénarios : transition 220–320 ms entre les courbes, sans rejeu.
- Changement de statut d'une dépense : transition d'état sobre.
- **Aucune animation en boucle** sur un graphique financier ; aucun effet sur les montants.
- `prefers-reduced-motion` : courbes affichées directement, marqueur sans pulse.

## 9. États

- **Trésorerie** : loading, vide (aucun flux), erreur, offline, syncing, permission denied.
- **CASH VISION** : chargement, historique insuffisant (message explicite), projection
  indisponible, bascule négative, scénario en cours de calcul, erreur.
- **Comptabilité** : période ouverte, période clôturée (verrouillée), aucune écriture, erreur.
- **Dépenses** : créée, en attente, approuvée, payée, rejetée, justificatif manquant,
  justificatif illisible, permission denied (pas de droit d'approbation), offline.
- **Devises** : taux disponible (avec date et source), taux indisponible, taux ancien
  (avertissement), conversion impossible.

## 10. Données

Mockées et **signalées** :
- flux de trésorerie cohérents avec les ventes et paiements du LOT 06 (mêmes montants en FCFA) ;
- projection de trésorerie calculée localement à partir de ces flux, présentée comme
  **projection de démonstration** ;
- dépenses avec justificatifs simulés, statuts variés ;
- périodes comptables ouvertes et clôturées ;
- taux de change de démonstration **avec date et source affichées**.

Aucune donnée financière réelle. Aucun paiement réel. Aucune conversion adossée à un service
externe.

## 11. Interdits spécifiques au lot

- Présenter une projection comme une prévision garantie ou comme un résultat.
- Afficher un taux sans sa date et sa source.
- Laisser modifier une période clôturée, même visuellement.
- Laisser croire qu'une valeur comptable historique peut être rétro-modifiée par un changement
  de taux (l. 532).
- Approuver une dépense sans vérifier le rôle simulé.
- Animer en boucle un graphique financier.
- Implémenter un rapprochement bancaire réel.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 785–833, 1945–1984, 517–535), vérifier les flux du LOT 06 et les
  composants LOT 03.
- **B** : annoncer fichiers, modèle de flux et de projection, statuts de dépenses, stratégie de
  test.
- **C** : construire trésorerie, CASH VISION, comptabilité, dépenses, devises.
- **D** : intégrer au shell, au Command Center, aux cartes d'action du Cockpit ; réutiliser les
  flux du LOT 06.
- **E** : tester lecture de la projection, scénarios, approbations selon rôle, période clôturée,
  conversion de devise, les 4 breakpoints, les deux thèmes, clavier, reduced-motion, cohérence
  des montants.
- **F** : corriger incohérences de montants, états manquants, overflow, focus.
- **G** : valider lorsque la lecture passé / présent / futur est sans ambiguïté et que le
  workflow de dépense est complet.

## 13. Validation — checklist

- [ ] Trésorerie : soldes, flux, échéances, créances, dettes.
- [ ] CASH VISION : courbe historique, frontière présent/futur, projection pointillée, bascule
      négative marquée, marqueur temporel, scénarios comparés.
- [ ] Passé et futur visuellement distingués, sans ambiguïté.
- [ ] Comptabilité : revenus, dépenses, catégories, périodes, rapports, créances âgées, dettes.
- [ ] Période clôturée verrouillée à l'écran avec explication.
- [ ] Dépenses : workflow complet `créée → en attente → approuvée → payée / rejetée`,
      justificatif, historique.
- [ ] Approbation conditionnée au rôle simulé ; `permission denied` explicite.
- [ ] Devises : transaction / tenant / affichage distinguées, taux + **date** + **source**.
- [ ] Aucun montant en dehors d'IBM Plex Mono ; devise toujours explicite.
- [ ] Projection présentée comme estimation de démonstration.
- [ ] Montants cohérents avec les données du LOT 06 ; bandeau de démonstration présent.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 08.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la méthode de calcul local de la projection, les
statuts de dépenses implémentés, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 10.
