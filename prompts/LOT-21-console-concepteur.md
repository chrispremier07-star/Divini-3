# LOT 21 — Console Concepteur

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 02 et LOT 19 (validés). **Débloque** : —
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire la **troisième interface** du produit : la Console du créateur du SaaS,
**totalement séparée** de l'Interface Marchand (l. 2508–2510), avec son propre shell, ses
propres données et ses propres règles.

Elle donne le contrôle de la plateforme : tenants, abonnements, revenus, modules, validation des
établissements, réactivation des comptes, santé du système, audit — plus un assistant
d'interrogation.

## 2. Périmètre

### 2.1 Séparation stricte

- Shell distinct (`/console`), navigation propre, **aucune donnée de tenant mélangée** aux
  données de la plateforme.
- **Les finances du SaaS sont séparées des finances des tenants** (l. 3313–3329).
- Le Design System est **le même** (l. 8415–8444) : même langage visuel, fonctionnalités
  différentes.

### 2.2 Dashboard concepteur (l. 2536–2559)

Temps réel (simulé localement et signalé) : nouveaux tenants, actifs, inactifs, essais, abonnés,
suspendus, nouveaux utilisateurs, établissements créés, **CA SaaS**, revenus récurrents,
évolution, **churn**, modules populaires, consommation, activité.
Graphiques sobres et professionnels.

### 2.3 Tenants

Liste (filtres : statut, plan, pays, échéance, activité), fiche tenant (identité, abonnement,
établissements, utilisateurs, historique, activité), suspension, réactivation, historique des
paiements.

### 2.4 Validation des établissements (l. 376–401)

1. **File de validation** : demandes en attente, tenant demandeur, supplément tarifaire calculé.
2. **Revue** : informations, cohérence, impact sur l'abonnement.
3. **Validation ou refus** avec motif.
4. **Effet** : notification au tenant central et écran de confirmation premium côté marchand
   (préparé au LOT 18 — l'animation Lottie de confettis se déclenche sur une validation réelle,
   pas en phase frontend).
5. **Essai 7 jours** appliqué à l'établissement validé.

### 2.5 Abonnements et réabonnement (l. 482–498)

1. Liste des abonnements, échéances, statuts.
2. **Validation manuelle d'un paiement** : nombre de mois payés, date, montant, période.
3. **Réinitialisation de l'échéance** sur la base de la **date du premier abonnement** —
   affichée et vérifiable.
4. **Interdiction** : ne jamais modifier silencieusement les dates historiques.
5. **Réactivation d'un compte suspendu** avec confirmation et trace.

### 2.6 Modules (Module Registry, l. 429–456)

Création, prix, activation / désactivation, catégorie, dépendances, statut, disponibilité,
permissions, fonctionnalités, plan compatible. Toute modification de prix est **tracée**.

### 2.7 Finances du SaaS

Revenus, abonnements, renouvellements, modules vendus, établissements, historique des paiements,
**reçus**, prévisions, dépenses de la plateforme.

### 2.8 Reçus du SaaS (l. 3330–3346)

Génération selon le modèle documentaire du SaaS, avec choix : **nombre de mois, date, montant,
période**. Aperçu avant génération (relais LOT 17).

### 2.9 Santé du système et audit

Erreurs, files, latences, consommation, événements ; **toute action critique du concepteur est
auditée** (l. 2559).

### 2.10 Assistant concepteur (l. 2579–2596)

Surface d'interrogation sur l'état du système, les tenants, les abonnements, les statistiques,
les erreurs, l'activité, les recommandations.
En phase frontend : **moteur local déterministe** sur les données de démonstration, avec mention
explicite « analyse de démonstration — aucun modèle d'IA connecté », et état « service IA
requis » au-delà. Respect des permissions administrateur.

### 2.11 Marketplace (l. 2494–2507)

Surface de validation d'applications : sécurité, permissions, isolation, conformité —
**annoncée comme architecture préparée**, non fonctionnelle.

### 2.12 Exclu (reporté)

- Toute action réelle sur un tenant (suspension, réactivation, validation) → phase backend.
- Assistant réellement connecté à un modèle → relais explicite.
- Marketplace fonctionnelle → hors périmètre actuel.

## 3. Écrans concernés

| Route | Écran | Niveau |
|---|---|---|
| `/console` | Dashboard concepteur | plateforme |
| `/console/tenants` · `/{id}` | Tenants | plateforme |
| `/console/etablissements/validation` · `/{id}` | File de validation | plateforme |
| `/console/abonnements` · `/{id}` | Abonnements | plateforme |
| `/console/modules` · `/{id}` · `/nouveau` | Module Registry | plateforme |
| `/console/revenus` · `/console/paiements` · `/console/recus` · `/console/depenses` | Finances SaaS | plateforme |
| `/console/utilisateurs` · `/console/roles` | Administration console | plateforme |
| `/console/integrations` · `/console/politiques` | Intégrations et politiques globales | plateforme |
| `/console/sante` | Santé du système | plateforme |
| `/console/audit` | Audit concepteur | plateforme |
| `/console/marketplace` | Marketplace (préparée) | plateforme |
| `/console/assistant` | Assistant concepteur | plateforme |

## 4. Composants concernés

**Créés** : ConsoleShell, ConsoleSidebar, ConsoleTopbar, ConsoleDashboard, PlatformKpiRow,
TenantList, TenantProfile, TenantActivityPanel, SuspendAction, ReactivateAction,
ValidationQueue, ValidationReviewPanel, ApproveRejectDialog, TrialAppliedNotice,
SubscriptionList, ManualPaymentDialog, MonthsPicker, DueDateResetPreview, HistoryLockNotice,
ModuleRegistryTable, ModuleForm, PriceChangeTrace, SaasRevenuePanel, ChurnChart,
PopularModulesChart, ReceiptGenerator, ReceiptParamsForm, SaasExpenseTable, SystemHealthPanel,
ErrorFeed, QueueMetrics, ConsoleAuditTable, MarketplaceReviewCard, ConsoleAssistantPanel.
**Réutilisés** : DataTable, KpiCard, KpiGrid, Chart, DataPanel, Timeline, ActivityFeed,
Progress, Badge, StatusDot, SeverityIndicator, Avatar, Button, Search, Select, Input,
DatePicker, Modal, Drawer, ConfirmDialog, EmptyState, Skeleton, ErrorState, PermissionDenied —
et les primitives LOT 01.

## 5. UX

- **Une console, pas un ERP** : la navigation est orientée plateforme (tenants, abonnements,
  modules, santé), jamais modules métier.
- **Valider en confiance** : la revue d'un établissement montre tout ce qui compte avant la
  décision, avec conséquence tarifaire explicite.
- **Ne jamais casser un historique** : toute réinitialisation d'échéance affiche l'ancienne et la
  nouvelle valeur avant confirmation.
- **Agir vite sur un compte suspendu** : réactivation en peu d'étapes, avec trace.
- **Interroger sans naviguer** : l'assistant répond sur l'état de la plateforme, avec les
  données utilisées.

## 6. Design — application stricte du Design System

- Même palette, mêmes typographies, mêmes rayons, même motion que l'Interface Marchand —
  **Design System unique** (l. 8415–8444).
- La distinction d'interface passe par la **navigation et le contenu**, pas par une autre
  charte graphique.
- Montants SaaS en **IBM Plex Mono**, devise explicite.
- Actions critiques (suspension, réactivation, validation, changement de prix) :
  `ConfirmDialog` avec conséquence explicite.
- Graphiques sobres, aucune animation décorative permanente.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Shell | sidebar 220 px | 220 px ou 72 px | 72 px + drawer | drawer plein écran |
| Dashboard | 3 colonnes | 2 | 2 | 1 colonne |
| Tenants | table complète | colonnes réduites | colonnes prioritaires | mode carte |
| Revue de validation | 2 colonnes | 2 colonnes | 1 colonne | 1 colonne |
| Finances | synthèses côte à côte | 2 colonnes | 1 colonne | 1 colonne |
| Assistant | fil + panneau | fil | fil | fil plein écran |

## 8. Motion

- Count-up des KPI plateforme : 1 100–1 200 ms.
- Reveal des graphiques : progressif, une seule fois.
- Transitions d'écran : 220–320 ms.
- Validation d'un établissement : confirmation sobre — **les confettis appartiennent à
  l'écran marchand**, pas à la console.
- `prefers-reduced-motion` : transitions quasi instantanées.

## 9. États

- **Tenant** : essai, actif, échéance proche, suspendu, expiré, réactivé, archivé.
- **Demande d'établissement** : en attente, en revue, validée, refusée (avec motif), expirée.
- **Abonnement** : à valider, validé, en retard, résilié, réactivé.
- **Paiement manuel** : en saisie, paramètres incomplets, validé, reçu généré, erreur.
- **Module** : actif, inactif, brouillon, prix modifié (tracé), dépendance manquante.
- **Santé** : nominale, dégradée (ATTENTION), critique (CRITIQUE), donnée indisponible.
- **Assistant** : question posée, analyse locale, données insuffisantes, **service IA requis**,
  permission insuffisante.

## 10. Données

Mockées et **signalées** :
- tenants, abonnements, paiements, modules, établissements de démonstration ;
- finances SaaS **séparées** des finances de tenants, en FCFA ;
- activité temps réel simulée localement ;
- réponses de l'assistant produites par le moteur local.

Aucune donnée réelle de client, aucun paiement réel, aucune action réelle sur un tenant.

## 11. Interdits spécifiques au lot

- Mélanger données SaaS et données de tenants.
- Modifier silencieusement une date historique d'abonnement.
- Valider, suspendre ou réactiver réellement un compte.
- Donner à la console une charte graphique différente.
- Déclencher les confettis côté console.
- Simuler un assistant connecté à un modèle.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 2508–2596, 482–498, 3313–3346), vérifier le shell LOT 02 et
  l'abonnement LOT 19.
- **B** : annoncer fichiers, séparation des données, stratégie de test.
- **C** : construire le shell console puis chaque écran.
- **D** : relier la file de validation à l'écran d'attente du LOT 18 ; relier les reçus au
  LOT 17.
- **E** : tester revue et validation d'établissement, paiement manuel et réinitialisation
  d'échéance, réactivation, modification de prix tracée, assistant, les 4 breakpoints, les deux
  thèmes, clavier, reduced-motion.
- **F** : corriger toute confusion de données, tout état ambigu, tout overflow.
- **G** : valider lorsque la console est clairement séparée et que chaque action critique est
  confirmée et tracée.

## 13. Validation — checklist

- [ ] Interface totalement séparée, shell propre, aucune donnée mélangée.
- [ ] Finances SaaS distinctes des finances tenants.
- [ ] Dashboard : nouveaux tenants, actifs, inactifs, essais, abonnés, suspendus, nouveaux
      utilisateurs, établissements, CA SaaS, MRR, évolution, churn, modules populaires, activité.
- [ ] Tenants : liste, fiche, suspension, réactivation, historique.
- [ ] File de validation des établissements avec supplément tarifaire et motif de refus.
- [ ] Essai 7 jours appliqué à l'établissement validé.
- [ ] Paiement manuel : mois, date, montant, période ; échéance réinitialisée sur la date du
      premier abonnement ; ancienne / nouvelle valeur affichées.
- [ ] Aucune modification silencieuse de date historique.
- [ ] Module Registry complet, modification de prix tracée.
- [ ] Reçus SaaS avec paramètres et aperçu.
- [ ] Santé du système et audit concepteur.
- [ ] Assistant : analyse locale tracée, mention explicite, état « service IA requis ».
- [ ] Marketplace annoncée comme préparée, non fonctionnelle.
- [ ] Actions critiques sous `ConfirmDialog` avec trace.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 20.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la preuve de la séparation des données, les actions
critiques confirmées et tracées, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 22.
