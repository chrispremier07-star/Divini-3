# LOT 19 — Abonnement & Onboarding

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 02 et LOT 18 (validés). **Débloque** : LOT 21.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire les deux parcours qui transforment un visiteur en tenant opérationnel :
l'**onboarding en 10 étapes** et la gestion de l'**abonnement** (plans, modules, établissements,
échéance, paiements, reçus).

Règle d'or du corpus pour l'onboarding (l. 306–318) : **ne jamais faire perdre les données
saisies si l'utilisateur revient à une étape précédente.**

## 2. Périmètre

### 2.1 Onboarding — 10 étapes (l. 289–305)

```
1 Identité → 2 Entreprise → 3 Activité → 4 Pays / devise → 5 Organisation
→ 6 Modules → 7 Abonnement → 8 Paiement → 9 Validation → 10 Première configuration
```

Exigences d'affichage obligatoires : progression, étape actuelle, étapes restantes,
informations nécessaires, erreurs, validation, **sauvegarde progressive**.

Étapes à soigner particulièrement :
- **4 Pays / devise** : FCFA / XOF par défaut, architecture multi-devises visible.
- **6 Modules** : sélection depuis le Module Registry, avec prix individuel, dépendances et
  compatibilité de plan.
- **7 Abonnement** : récapitulatif dynamique du prix mensuel.
- **8 Paiement** : choix du moyen, **aucun paiement réel** — état explicite.
- **9 Validation** : récapitulatif complet avant création.
- **10 Première configuration** : logo, reçu de caisse (relais LOT 17), premiers réglages,
  premier établissement.

### 2.2 Abonnement

1. **Plan courant** : module de base, modules complémentaires actifs, établissements facturés,
   services facturables.
2. **Simulateur de prix** : `base + modules + établissements + services` — recalcul en direct
   (l. 402–428).
3. **Catalogue de modules** : prix, catégorie, dépendances, plan compatible, activation /
   désactivation (avec conséquence affichée).
4. **Échéance et statuts** : `essai · actif · échéance proche · suspendu · expiré · réactivé`
   (l. 470–481), avec décompte d'essai de 7 jours.
5. **Paiements** : moyens prévus — **Wave Business · carte Visa · espèces · virement
   bancaire** — derrière une couche de paiement **abstraite** (l. 499–516).
   En phase frontend : interface de paiement complète **sans traitement réel**, avec état
   explicite « aucun paiement réel n'est effectué ».
6. **Reçus** : liste, détail, aperçu (relais LOT 17).
7. **Réabonnement** : parcours UI ; la validation manuelle par le concepteur et la
   réinitialisation de l'échéance sur la base de la **date du premier abonnement** (l. 482–498)
   sont affichées comme règles, appliquées au LOT 21 puis au backend.
8. **Suspension** : écran expliquant la suspension du tenant **et** de ses établissements
   (l. 4540), avec chemin de réactivation.

### 2.3 Exclu (reporté)

- Tout traitement de paiement réel → phase backend.
- Validation réelle par le concepteur → LOT 21 (UI) puis backend.
- Génération réelle de reçus → backend.

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/onboarding/{etape}` | 10 étapes | N1 |
| `/onboarding/recapitulatif` | Validation (étape 9) | N1 |
| `/app/abonnement` | Plan courant | N2 |
| `/app/abonnement/modules` | Catalogue et simulateur | N2 |
| `/app/abonnement/paiements` | Moyens et historique | N2 |
| `/app/abonnement/recus` · `/{id}` | Reçus | N2 |
| `/app/abonnement/echeance` | Échéance et statut | N2 |
| `/app/suspendu` | Compte suspendu | N2 |

## 4. Composants concernés

**Créés** : OnboardingLayout, StepIndicator, StepNavigation, ProgressiveSaveBadge,
IdentityStep, CompanyStep, ActivityStep, CountryCurrencyStep, OrganizationStep,
ModuleSelectionStep, ModulePriceCard, DependencyNotice, SubscriptionSummaryStep,
PaymentStep, PaymentMethodCard, NoRealPaymentNotice, ValidationSummaryStep,
FirstConfigStep, PlanOverview, PriceSimulator, PriceBreakdownRow, ModuleCatalog,
ModuleToggle, DueDatePanel, StatusBadge, TrialCountdown, PaymentHistory, ReceiptList,
ReceiptPreview, ReactivationPath, SuspensionScreen.
**Réutilisés** : DataTable, DataPanel, KpiCard, Badge, StatusDot, SeverityIndicator, Button,
IconButton, Search, Select, Input, DatePicker, Checkbox, Radio, Switch, FileUpload, Stepper,
Modal, Drawer, ConfirmDialog, EmptyState, Skeleton, ErrorState, PermissionDenied.

## 5. UX

- **Savoir où on en est** : progression permanente, étape courante, étapes restantes, retour
  arrière sans perte.
- **Comprendre le prix avant de payer** : le simulateur détaille chaque ligne ; aucun montant
  n'apparaît sans explication.
- **Choisir ses modules en connaissance de cause** : dépendances et conséquences affichées
  avant activation.
- **Ne jamais simuler un paiement réussi** : l'écran de paiement dit explicitement qu'aucun
  paiement réel n'est traité en phase frontend.
- **Comprendre une suspension** : l'écran explique la cause, l'étendue (tenant +
  établissements) et le chemin de réactivation.
- **Sauvegarde progressive visible** : un indicateur discret confirme que la saisie est
  conservée.

## 6. Design — application stricte du Design System

- Onboarding : mise en page épurée, une colonne centrée, indicateur d'étapes sobre, CTA primaire
  ambre, aucun élément décoratif.
- Montants : **IBM Plex Mono**, devise explicite, détail ligne à ligne.
- Statuts d'abonnement : badges sémantiques cohérents (essai = INFO, actif = SUCCESS,
  échéance proche = ATTENTION, suspendu / expiré = CRITIQUE).
- Écran de suspension : sobre, informatif, aucune agressivité visuelle.
- Moyens de paiement : cartes neutres, **aucun logo de prestataire reproduit de manière
  décorative**.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Onboarding | colonne centrée + résumé latéral | colonne centrée | colonne pleine | colonne pleine, indicateur `3/10` |
| Sélecteur de modules | grille 3 colonnes | 2 | 2 | 1 colonne |
| Simulateur de prix | récapitulatif latéral fixe | latéral | sous la sélection | **barre collante en bas** |
| Paiement | cartes côte à côte | idem | 1 colonne | 1 colonne |
| Abonnement | 2 colonnes | 2 colonnes | 1 colonne | 1 colonne |
| Reçus | table | colonnes réduites | condensée | mode carte |

## 8. Motion

- Transition entre étapes : 220–320 ms, direction cohérente (avant / arrière).
- Indicateur d'étapes : interpolation de position, jamais de saut.
- Recalcul du prix : transition courte sur le montant, **sans clignotement**.
- Sauvegarde progressive : confirmation discrète 140–220 ms.
- Aucune célébration à la fin de l'onboarding (les confettis sont réservés à la validation
  d'établissement, l. 393–397).
- `prefers-reduced-motion` : transitions quasi instantanées.

## 9. États

- **Onboarding** : étape en cours, étape incomplète, erreur de champ, sauvegarde en cours,
  sauvegardé, retour arrière (données conservées), récapitulatif, création en cours, échec.
- **Modules** : non activé, activé, dépendance manquante (avertissement), incompatible avec le
  plan, désactivation avec conséquence.
- **Prix** : calcul en cours, détail disponible, aucun module sélectionné, établissement
  supplémentaire ajouté.
- **Paiement** : moyen sélectionné, aucun moyen disponible, **aucun traitement réel**, échec
  simulé non applicable.
- **Abonnement** : essai, actif, échéance proche, suspendu, expiré, réactivé.
- **Reçus** : liste vide, reçu disponible, aperçu, génération non disponible.

## 10. Données

Mockées et **signalées** :
- catalogue de modules issu du manifeste (LOT 02) avec prix de démonstration en FCFA ;
- plans, échéances et statuts de démonstration ;
- historique de paiements et reçus de démonstration ;
- progression d'onboarding sauvegardée **localement** (aucune donnée sensible).

Aucun paiement réel, aucun reçu réel, aucune souscription réelle.

## 11. Interdits spécifiques au lot

- Simuler un paiement réussi ou afficher un statut de prestataire inventé.
- Faire perdre les données saisies lors d'un retour arrière.
- Afficher un montant sans détail de calcul.
- Activer un module dont la dépendance manque sans avertissement.
- Célébrer la fin de l'onboarding par une animation.
- Persister des données de paiement, même fictives, dans le navigateur.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 289–319, 402–516, 4540), vérifier le manifeste (LOT 02) et les
  établissements (LOT 18).
- **B** : annoncer fichiers, structure du simulateur, statuts d'abonnement, stratégie de test.
- **C** : construire l'onboarding puis l'abonnement.
- **D** : intégrer au shell, au Command Center, aux établissements (LOT 18) ; préparer le relais
  vers la Console Concepteur (LOT 21).
- **E** : tester les 10 étapes, le retour arrière sans perte, le simulateur, les statuts,
  l'écran de suspension, les 4 breakpoints, les deux thèmes, clavier, reduced-motion.
- **F** : corriger toute perte de saisie, tout montant non détaillé, tout état manquant.
- **G** : valider lorsque le parcours complet est cohérent et qu'aucun paiement n'est simulé
  comme réel.

## 13. Validation — checklist

- [ ] Les 10 étapes présentes, dans l'ordre canonique.
- [ ] Progression, étape courante, étapes restantes, informations nécessaires, erreurs.
- [ ] **Sauvegarde progressive** et retour arrière sans perte (test explicite).
- [ ] Sélection de modules avec prix, dépendances, compatibilité de plan.
- [ ] Simulateur `base + modules + établissements + services` avec détail ligne à ligne.
- [ ] Statuts `essai · actif · échéance proche · suspendu · expiré · réactivé`.
- [ ] Décompte d'essai 7 jours.
- [ ] Moyens de paiement prévus derrière une couche abstraite ; **aucun traitement réel**.
- [ ] Mention explicite « aucun paiement réel » sur l'écran de paiement.
- [ ] Reçus : liste, détail, aperçu.
- [ ] Règle de réabonnement (validation concepteur, échéance sur date du premier abonnement)
      affichée.
- [ ] Écran de suspension couvrant tenant **et** établissements, avec chemin de réactivation.
- [ ] Aucune donnée de paiement persistée côté navigateur.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 18.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la preuve du retour arrière sans perte, le détail du
simulateur de prix, ce qui est explicitement non traité (paiements), et
`AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 20.
