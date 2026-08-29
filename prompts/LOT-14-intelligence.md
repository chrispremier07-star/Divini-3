# LOT 14 — Intelligence (COPILOT · AUTOPILOT · RADAR · CASH VISION · GUARDIAN)

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 05, LOT 09 et LOT 12 (validés). **Débloque** : LOT 15, LOT 16.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire les surfaces des **cinq agents** qui font la différence du produit, sans jamais
simuler une intelligence qui n'existe pas encore.

## 2. Règle centrale de ce lot — à lire avant tout

En phase frontend, **il est interdit de simuler un modèle d'IA**. Ce lot distingue donc
rigoureusement deux choses :

| Ce qui est livré ici | Ce qui est explicitement reporté |
|---|---|
| **Moteur d'analyse local déterministe** : calculs réels (agrégats, écarts, seuils, ruptures, aging) exécutés sur les données mockées, produisant constat, causes, données utilisées et recommandations **traçables** | Compréhension du langage naturel, génération de texte, prédiction statistique, exécution réelle d'actions |
| **Surfaces complètes** : conversation, réponse structurée, aperçu d'exécution, validation, journal | Connexion à un service d'IA, exécution côté serveur |

Chaque réponse produite porte la mention explicite :
**« Analyse de démonstration — calculs locaux sur données simulées. Aucun modèle d'IA
connecté. »**

Toute demande qui exige un modèle réel affiche l'état :
**« Nécessite le service IA — non connecté (phase backend) »**, sans réponse inventée.

C'est l'application directe de la règle : **MOCK DATA ≠ FAUSSE FONCTIONNALITÉ** (mission §09)
et « ne jamais simuler une donnée, un statut ou une réussite comme si elle était réelle »
(l. 44–48).

## 3. Périmètre

### 3.1 COPILOT (l. 645–702)

1. Surface de conversation : historique de session, questions, réponses structurées.
2. **Format de réponse canonique** : `constat → causes → données utilisées → recommandations →
   actions possibles` — avec les **données utilisées listées nommément** (traçabilité).
3. Questions pré-remplies et relais depuis « Demander à l'IA » du Cockpit et du Command Center.
4. Bouton **« Exécuter les recommandations »** → prépare un lot d'actions et le transmet à
   AUTOPILOT (aperçu + validation), jamais d'exécution directe.
5. Retour utilisateur : utile / pas utile, avec motif.

### 3.2 AUTOPILOT (l. 703–753, II.4)

1. Formulation d'un objectif en langage naturel → **classification locale déterministe** parmi
   les tâches autorisées connues ; toute formulation hors périmètre affiche l'état « service IA
   requis ».
2. Chaîne canonique : `comprendre → identifier les données → préparer les actions → vérifier
   les permissions → préparer les messages → présenter un aperçu → demander validation →
   exécuter → journaliser`.
3. **Aperçu avant exécution** : liste des actions, cibles, effets, permissions requises.
4. **Limites absolues affichées** : jamais seul — transaction financière critique, paiement,
   transfert d'argent, suppression massive irréversible, modification comptable critique,
   modification de permissions critiques. Ces demandes sont **refusées à l'écran** avec
   explication.
5. Journal des exécutions : qui, quoi, quand, résultat, périmètre.

### 3.3 RADAR (l. 754–784)

1. Liste de **signaux** : risque de rupture, stock dormant, créance âgée, baisse de CA,
   dépense inhabituelle, échéance, qualité WhatsApp dégradée, fenêtre proche de l'expiration.
2. Chaque signal : gravité, donnée source, date de détection, action préparée.
3. Filtres par gravité, module, période ; acquittement ; historique des signaux.
4. Détection produite par **règles locales explicites et affichées** (seuils visibles et
   configurables), jamais par une prédiction présentée comme telle.

### 3.4 CASH VISION (l. 785–811)

1. Intégration de l'agent au module Trésorerie (écran livré au LOT 09).
2. Ajouts de ce lot : explication de la projection (hypothèses affichées), scénarios comparés,
   alerte de bascule négative reliée à RADAR, action préparée (relance, report de dépense).
3. Les hypothèses de projection sont **affichées et modifiables** — jamais implicites.

### 3.5 GUARDIAN (l. 862–900)

1. Liste des **opérations à risque** détectées par règles locales : montant inhabituel,
   annulation répétée, remise exceptionnelle, modification sensible, tentative hors périmètre,
   activité hors horaire.
2. Chaque opération : niveau de risque, motif, état (`autorisée · en tampon · bloquée`),
   action de revue.
3. **Tampon** : une opération à risque peut être mise en attente de revue — état explicite,
   jamais un blocage silencieux.
4. Journal Guardian, relié à l'Audit (LOT 18).

### 3.6 Transversal

- **Score de santé** : calcul local à partir d'indicateurs réels des modules, avec le détail du
  calcul accessible (préparation du LOT 15).
- **Mémoire d'entreprise** (l. 954–984) : journal local des décisions et préférences de la
  session, affiché comme mémoire de démonstration.
- **Signalement Internet** : toute capacité qui nécessitera un service externe porte la mention
  « nécessite une connexion Internet » (l. 3103–3110).

## 4. Périmètre exclu (reporté)

- Tout modèle d'IA réel, tout appel externe, toute génération de texte par modèle.
- Exécution réelle d'actions (relances, publications, commandes) → phase backend.
- Prédiction statistique réelle (RADAR reste rule-based et le dit).
- Rapport matinal vocal (l. 2053–2083) : la surface de synthèse est livrée, **la voix n'est pas
  implémentée** et est annoncée comme non disponible.

## 5. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/copilot` | COPILOT — conversation | N3 |
| `/app/copilot/{sessionId}` | Session de conversation | N3 |
| `/app/autopilot` | AUTOPILOT — formulation et file | N4 |
| `/app/autopilot/executions/{id}` | Détail d'exécution | N4 |
| `/app/radar` | RADAR — signaux | N3 |
| `/app/radar/{id}` | Détail d'un signal | N3 |
| `/app/cash-vision` | CASH VISION — agent | N3 |
| `/app/guardian` | GUARDIAN — opérations à risque | N2 |
| `/app/guardian/{id}` | Revue d'une opération | N2 |

## 6. Composants concernés

**Créés** : CopilotPanel, ConversationThread, MessageBubble, StructuredAnswer, CauseList,
DataSourceList, RecommendationList, ExecuteRecommendationsButton, AnswerFeedback,
DisclaimerBadge, AutopilotComposer, IntentClassificationPanel, ActionPreviewTable,
PermissionRequirementRow, ValidationDialog, ExecutionJournal, ExecutionStatusBadge,
ForbiddenActionNotice, RadarSignalList, SignalCard, SignalDetail, RuleThresholdEditor,
SignalAcknowledgeAction, CashVisionAgentPanel, ProjectionAssumptions, ScenarioComparator,
GuardianQueue, RiskOperationCard, RiskReasonList, HoldReviewDialog, HealthScoreDial,
ScoreBreakdown, MemoryJournal, InternetRequirementNote.
**Réutilisés** : DataTable, KpiCard, Chart, DataPanel, Timeline, ActivityFeed, Progress,
Badge, StatusDot, SeverityIndicator, Button, Search, Select, Input, Modal, Drawer,
ConfirmDialog, EmptyState, Skeleton, ErrorState, PermissionDenied, OfflineState — et le
Command Center (LOT 04).

## 7. UX

- **Une réponse qui se vérifie** : chaque constat cite les données utilisées ; l'utilisateur
  peut ouvrir la source. Aucune affirmation sans origine.
- **Rien ne s'exécute sans aperçu** : AUTOPILOT montre toujours la liste des actions, leurs
  cibles et leurs effets avant toute validation.
- **Un refus est une information** : une demande interdite (paiement, suppression massive,
  modification de permissions) est refusée à l'écran avec la raison, pas ignorée.
- **Un signal se comprend** : gravité, source, règle qui l'a produit, action proposée.
- **Une opération à risque se voit** : GUARDIAN ne bloque jamais silencieusement ; il met en
  tampon et demande une revue.
- **Le doute est affiché** : lorsque la demande dépasse le moteur local, l'état « service IA
  requis » remplace toute réponse approximative.

## 8. Design — application stricte du Design System

- Conversation : bulles sobres sur `--panel-2` (agent) et `--panel` (utilisateur), texte Inter,
  valeurs en mono, aucun avatar décoratif animé.
- **Badge de mention obligatoire** (« analyse de démonstration ») discret mais permanent, en
  `--muted`, jamais masquable.
- Réponse structurée : sections nettes (constat, causes, données, recommandations, actions) avec
  titres en Space Grotesk.
- Signaux RADAR : gravité en sémantique (INFO / ATTENTION / CRITIQUE) + icône + libellé.
- GUARDIAN : `bloquée` = CRITIQUE, `en tampon` = ATTENTION, `autorisée` = SUCCESS.
- Score de santé : anneau sobre, valeur en mono, détail du calcul accessible.
- Aucune animation décorative permanente sur les agents dans l'application (les 5 motions
  animées appartiennent à la **landing**, LOT 22).

## 9. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| COPILOT | fil + panneau latéral de contexte | fil + panneau réduit | fil seul, contexte en drawer | fil plein écran, contexte en sheet |
| AUTOPILOT | composition + aperçu côte à côte | idem | 1 colonne | 1 colonne, aperçu en sheet |
| RADAR | liste + détail 2 colonnes | idem | 1 colonne | 1 colonne |
| CASH VISION | courbe + hypothèses | courbe + panneau réduit | 1 colonne | courbe simplifiée + hypothèses en bas |
| GUARDIAN | file + revue 2 colonnes | idem | 1 colonne | 1 colonne, revue en sheet |

## 10. Motion

- Apparition d'une réponse : fondu + légère translation, 220–320 ms ; **pas d'effet de
  frappe simulée en boucle**.
- Indicateur « analyse en cours » : sobre, borné dans le temps, jamais permanent.
- Reveal des graphes et du score : progressif, une seule fois.
- Mise en tampon d'une opération : transition d'état 220–320 ms.
- Aucune célébration, aucune pulsation permanente, aucun agent animé dans l'application.
- `prefers-reduced-motion` : apparitions immédiates, indicateur statique.

## 11. États

- **COPILOT** : session vide, question posée, analyse en cours, réponse structurée, données
  insuffisantes, **service IA requis**, erreur, hors ligne, permission denied.
- **AUTOPILOT** : objectif saisi, intention classée, intention hors périmètre, actions préparées,
  permissions manquantes, aperçu affiché, validation demandée, exécution simulée terminée,
  **action interdite refusée**, journal.
- **RADAR** : aucun signal, signaux actifs, signal acquitté, règle désactivée, seuil en édition,
  erreur.
- **CASH VISION** : historique insuffisant, hypothèses par défaut, hypothèses modifiées,
  projection indisponible, bascule négative.
- **GUARDIAN** : aucune opération à risque, opération autorisée, en tampon, bloquée, revue en
  cours, permission denied.
- **Score de santé** : calcul en cours, score disponible, détail indisponible, données
  incomplètes.

## 12. Données

Mockées et **signalées** :
- réponses produites par le **moteur local** à partir des données des lots 05 à 12 (mêmes
  chiffres, mêmes références) ;
- signaux RADAR issus de règles locales dont les seuils sont affichés ;
- opérations GUARDIAN issues de règles locales explicites ;
- journal d'exécutions de démonstration.

Aucune réponse inventée sans calcul sous-jacent. Aucun texte prétendument généré par un modèle.

## 13. Interdits spécifiques au lot

- Simuler un modèle d'IA, une génération de texte ou une compréhension du langage naturel.
- Produire une réponse sans données sources traçables.
- Exécuter quoi que ce soit sans aperçu ni validation.
- Laisser AUTOPILOT préparer une action interdite (paiement, transfert, suppression massive,
  modification comptable critique, modification de permissions).
- Bloquer silencieusement une opération dans GUARDIAN.
- Animer un agent dans l'application produit.
- Présenter une détection par règles comme une prédiction.
- Implémenter le rapport matinal vocal.

## 14. Méthode d'exécution

- **A** : relire le corpus (l. 645–953, II.3, II.4), vérifier les données des lots 05 à 12.
- **B** : annoncer fichiers, règles locales de détection et leurs seuils, format de réponse,
  stratégie de test.
- **C** : construire les cinq surfaces et le moteur local.
- **D** : brancher COPILOT sur le Cockpit et le Command Center, RADAR sur les alertes,
  CASH VISION sur la trésorerie, GUARDIAN sur les opérations sensibles, AUTOPILOT sur les
  actions autorisées.
- **E** : tester chaque agent : réponse traçable, refus d'action interdite, aperçu et validation,
  acquittement de signal, mise en tampon, état « service IA requis », les 4 breakpoints, les
  deux thèmes, clavier, reduced-motion.
- **F** : corriger toute réponse non traçable, tout refus manquant, tout état ambigu.
- **G** : valider lorsqu'aucune réponse n'est produite sans données sources et qu'aucune action
  interdite n'est préparée.

## 15. Validation — checklist

- [ ] COPILOT : format `constat → causes → données utilisées → recommandations → actions`.
- [ ] Données utilisées listées nommément et consultables.
- [ ] Mention « analyse de démonstration — aucun modèle d'IA connecté » permanente.
- [ ] État « service IA requis » pour toute demande hors moteur local.
- [ ] « Exécuter les recommandations » passe par AUTOPILOT (aperçu + validation).
- [ ] AUTOPILOT : chaîne complète, aperçu avant exécution, permissions vérifiées, journal.
- [ ] **Actions interdites refusées à l'écran avec explication.**
- [ ] RADAR : signaux avec gravité, source, règle et seuil affichés ; acquittement ; historique.
- [ ] CASH VISION : hypothèses affichées et modifiables, scénarios, bascule reliée à RADAR.
- [ ] GUARDIAN : opérations à risque, motif, `autorisée / en tampon / bloquée`, revue, journal.
- [ ] Aucun blocage silencieux.
- [ ] Score de santé calculé localement avec détail accessible.
- [ ] Capacité nécessitant Internet signalée comme telle.
- [ ] Rapport matinal vocal explicitement non implémenté.
- [ ] Aucun agent animé dans l'application.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 13.

## 16. Rapport attendu

Format du socle commun §10, avec en plus : la liste des règles locales et de leurs seuils, la
liste des demandes qui basculent sur « service IA requis », la liste des actions interdites
testées, et `AVANCEMENT GLOBAL : XX %`.

## 17. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 15.
