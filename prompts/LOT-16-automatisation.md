# LOT 16 — Automatisation (Workflow Builder)

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 14 (validé). **Débloque** : —
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire le **Workflow Builder** : un éditeur de règles d'automatisation réellement
compréhensible par un non-technicien, fondé sur la structure canonique (l. 1985–2030) :

```
SI   → condition
ALORS → action
ET   → action supplémentaire
SINON → autre action
```

Exemples canoniques à rendre configurables :
- `SI stock < 20` → créer alerte + notifier responsable + préparer réapprovisionnement ;
  `SI stock < 5` → niveau critique.
- `Facture impayée depuis 7 jours` → rappel.
- `Client dépasse 500 000 FCFA` → proposer statut VIP.

## 2. Périmètre

### 2.1 Inclus

1. **Liste des automatisations** : nom, déclencheur, statut (active / inactive / en erreur),
   dernière exécution, nombre d'exécutions, module concerné.
2. **Éditeur visuel** : construction `SI / ALORS / ET / SINON`, conditions composables
   (ET / OU), seuils éditables, aperçu en langage naturel.
3. **Catalogue de conditions** par module : stock (quantité, seuil, ancienneté), ventes
   (montant, impayé, ancienneté de facture), clients (CA total, nombre d'achats, inactivité,
   anniversaire, seuil de points), trésorerie (solde, projection), livraisons (échec, retard),
   WhatsApp (fenêtre proche expiration, qualité), RH (contrat proche échéance).
4. **Catalogue d'actions** : créer une alerte, notifier un responsable, préparer un
   réapprovisionnement, proposer un statut, planifier une relance, créer une tâche, journaliser.
5. **Garde-fous** : une action sensible (paiement, suppression, modification de permission) est
   **absente du catalogue** et signalée comme non automatisable.
6. **Test à blanc** : exécution simulée sur les données de démonstration, avec résultat
   détaillé — clairement présentée comme simulation.
7. **Historique d'exécution** : date, déclencheur, condition évaluée, actions produites, résultat,
   erreur éventuelle.
8. **Activation / désactivation** : sans ambiguïté, avec confirmation si l'automatisation est
   critique.
9. **Modèles prêts à l'emploi** : les trois exemples canoniques pré-configurés, modifiables.

### 2.2 Exclu (reporté)

- Exécution réelle côté serveur, planification réelle → phase backend.
- Envoi réel de notifications ou de relances → backend / LOT 12.
- Actions sensibles automatisées — **interdites par conception** (l. 727–753).

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/automatisations` | Liste | N4 |
| `/app/automatisations/nouveau` | Création | N4 |
| `/app/automatisations/{id}` | Détail et édition | N4 |
| `/app/automatisations/{id}/historique` | Historique d'exécution | N4 |
| `/app/automatisations/{id}/test` | Test à blanc | N4 |

## 4. Composants concernés

**Créés** : AutomationList, AutomationCard, AutomationStatusBadge, WorkflowEditor,
ConditionBlock, ConditionRow, ConditionOperatorToggle, ThresholdField, ActionBlock, ActionRow,
ActionCatalog, ActionPicker, ElseBranch, NaturalLanguagePreview, DryRunPanel, DryRunResultRow,
ExecutionHistoryTable, ExecutionDetail, AutomationTemplates, TemplateCard,
SensitiveActionNotice.
**Réutilisés** : DataTable, DataPanel, Timeline, Badge, StatusDot, SeverityIndicator, Button,
IconButton, Dropdown, Search, Select, Input, Switch, Checkbox, Modal, Drawer, ConfirmDialog,
EmptyState, Skeleton, ErrorState, PermissionDenied.

## 5. UX

- **Comprendre sans lire du code** : chaque règle affiche une phrase en langage naturel
  (« Si le stock passe sous 20, alors alerte le responsable et prépare un réapprovisionnement »)
  en plus de sa structure.
- **Construire par composition** : ajouter une condition ou une action ne demande jamais
  d'écrire une expression.
- **Tester avant d'activer** : le test à blanc montre ce qui se serait passé, sur quelles
  données, avec quel résultat.
- **Savoir ce qui est impossible** : les actions sensibles ne sont pas proposées ; un encart
  explique pourquoi elles ne sont pas automatisables.
- **Suivre l'effet** : l'historique montre chaque exécution et son résultat, y compris les
  erreurs.

## 6. Design — application stricte du Design System

- Éditeur : blocs sur `--panel-2`, bordures `--border`, connecteurs discrets, rayon 10 px.
- Mots-clés structurels (`SI`, `ALORS`, `ET`, `SINON`) en capitales, Space Grotesk, `--muted`
  pour la structure et `--text` pour le contenu.
- Seuils et valeurs : **IBM Plex Mono**.
- Statut : active = SUCCESS, inactive = neutre, en erreur = CRITIQUE — avec libellé.
- Aucun effet de « nœuds » décoratif : la lisibilité prime sur l'aspect graphique.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Liste | table complète | colonnes réduites | colonnes prioritaires | mode carte |
| Éditeur | blocs empilés + catalogue latéral | idem | blocs pleine largeur, catalogue en drawer | **empilement vertical strict**, catalogue en sheet |
| Aperçu langage naturel | sous l'éditeur | idem | idem | en tête de page |
| Test à blanc | 2 colonnes (paramètres + résultat) | idem | 1 colonne | 1 colonne |
| Historique | table | table | condensée | mode carte |

L'éditeur reste utilisable sur tablette : cibles larges, aucun glisser-déposer obligatoire.

## 8. Motion

- Ajout d'un bloc : apparition 220–320 ms.
- Retrait d'un bloc : sortie 140–220 ms.
- Mise à jour de l'aperçu en langage naturel : fondu court, sans clignotement.
- Test à blanc : progression bornée, jamais en boucle.
- Activation : transition d'état sobre.
- `prefers-reduced-motion` : transitions quasi instantanées.

## 9. États

- **Automatisation** : active, inactive, en erreur, brouillon, jamais exécutée, permission
  denied, module non activé.
- **Éditeur** : règle vide, condition incomplète, action manquante, seuil invalide, règle
  valide, règle en conflit (même déclencheur, actions opposées).
- **Test à blanc** : paramètres en saisie, exécution en cours, résultat vide (aucune donnée ne
  déclenche), résultat produit, erreur.
- **Historique** : vide, exécutions réussies, exécutions en échec, détail indisponible.

## 10. Données

Mockées et **signalées** :
- règles de démonstration pré-configurées (les trois exemples canoniques) ;
- exécutions simulées localement à partir des données des lots 07, 06, 08, 09 ;
- historique de démonstration.

Aucune exécution réelle, aucun envoi réel, aucune planification réelle.

## 11. Interdits spécifiques au lot

- Proposer une action sensible dans le catalogue (paiement, transfert, suppression massive,
  modification comptable critique, modification de permissions).
- Exécuter réellement une automatisation.
- Afficher un historique d'exécution inventé sans simulation sous-jacente.
- Imposer un glisser-déposer sans équivalent clavier ou tactile.
- Coder en dur les seuils (ils doivent rester éditables).

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 1985–2030, 727–753), vérifier les données des modules sources.
- **B** : annoncer fichiers, catalogues de conditions et d'actions, stratégie de test.
- **C** : construire liste, éditeur, catalogues, test à blanc, historique, modèles.
- **D** : intégrer au shell, au Command Center, aux alertes (LOT 15) et à RADAR (LOT 14).
- **E** : tester création complète d'une règle, les trois modèles canoniques, le test à blanc,
  l'activation, l'absence d'actions sensibles, les 4 breakpoints, les deux thèmes, clavier,
  reduced-motion.
- **F** : corriger règles invalides acceptées, overflow, focus, états manquants.
- **G** : valider lorsqu'une règle se construit, se comprend, se teste et s'active sans
  ambiguïté.

## 13. Validation — checklist

- [ ] Structure `SI / ALORS / ET / SINON` conforme.
- [ ] Conditions composables (ET / OU) avec seuils éditables.
- [ ] Catalogue de conditions couvrant les modules listés.
- [ ] Catalogue d'actions **sans action sensible**, avec encart explicatif.
- [ ] Aperçu en langage naturel de chaque règle.
- [ ] Les trois exemples canoniques disponibles comme modèles.
- [ ] Test à blanc avec résultat détaillé, présenté comme simulation.
- [ ] Historique d'exécution avec résultat et erreurs.
- [ ] Activation / désactivation sans ambiguïté, confirmation si critique.
- [ ] Éditeur utilisable sur tablette sans glisser-déposer obligatoire.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 15.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : les catalogues de conditions et d'actions livrés, la
liste des actions volontairement exclues, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 17.
