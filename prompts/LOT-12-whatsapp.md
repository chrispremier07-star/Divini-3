# LOT 12 — WhatsApp

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 08 (validé). **Débloque** : LOT 14.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire le module **WhatsApp** : le module le plus contraint du produit. Il doit rendre
visible et vérifiable la chaîne canonique (l. 3848) :

```
CONSENTEMENT → ÉLIGIBILITÉ → POLITIQUES INTERNES → TEMPLATE → LIMITES / QUALITÉ
             → QUEUE → PLATFORM → WEBHOOK → STATUT FINAL
```

et respecter trois règles absolues :
1. **UNKNOWN n'est jamais interprété comme GRANTED** (l. 1103) ;
2. **consentement ≠ autorisation d'envoi** (l. 5574–5609) ;
3. **ne jamais inventer les règles de la plateforme externe** (l. 6424) ni promettre une
   gratuité sur la seule base d'une limite d'envoi (l. 6682, 7314).

## 2. Périmètre

### 2.1 Inclus

1. **Vue d'ensemble** : volume, éligibles, non éligibles, coûts, qualité, file, alertes.
2. **Consentements** : tableau de bord dédié (l. 5920–5942), statuts par catégorie, sources,
   méthodes, preuves, opt-out, do not contact, historique immuable (hérité du LOT 08).
3. **Éligibilité** : liste des clients avec statut et **raison** ; écran
   **« Pourquoi ce client est-il éligible ? »** (l. 5881–5919) qui déroule chaque condition de
   la chaîne avec son résultat.
4. **Politique centralisée** (l. 1263–1294) : catégories, règles d'éligibilité, plafonds,
   horaires autorisés, fréquence maximale — **valeurs configurables**, jamais codées en dur.
5. **Templates** : liste, fiche, variables, statut, catégorie (marketing / utility),
   prévisualisation.
6. **Campagnes** : parcours canonique en étapes (l. 5659–5704) —
   `nouvelle campagne → choix du template → sélection de l'audience → vérification automatique
   des consentements → suppression des contacts non éligibles → affichage des exclusions →
   prévisualisation → validation → planification → file → envoi → webhooks → statistiques`.
7. **File d'envoi** : état de la file, priorités, pauses, reprises, échecs.
8. **Coûts** : **coût estimé** avant envoi, **coût réel** après — toujours distingués
   (l. 6836–6878) ; budget consommé, reste disponible, **mode économie**.
9. **Fenêtres de messagerie** : fenêtre de service client et fenêtre *free entry point*, avec
   **expiration** et alertes d'expiration (l. 7149–7181) — sans jamais promettre la gratuité.
10. **Qualité** : état de qualité du numéro, signaux, conséquences, historique.
11. **Normalisation des numéros** : format affiché, indicatif pays (Côte d'Ivoire par défaut),
    numéros invalides signalés.
12. **Journal d'audit WhatsApp** : qui, quoi, quand, résultat, motif d'exclusion.
13. **Importation de clients** (l. 5943–5973) : mapping de colonnes, détection de doublons,
    **statut de consentement des importés explicitement non accordé par défaut**.
14. **Protection contre les erreurs humaines** (l. 5974–5995) : confirmations renforcées,
    récapitulatif avant envoi, seuils d'alerte sur la taille d'audience.

### 2.2 Exclu (reporté)

- Toute connexion réelle à une plateforme externe, tout webhook réel → phase backend.
- Envoi réel de messages → phase backend.
- Tarifs réels de la plateforme → **jamais inventés** : les écrans de coût exposent des valeurs
  de démonstration **explicitement signalées** et un champ « tarif à configurer ».
- Règles et quotas réels de la plateforme → **non inventés** : affichés comme
  « à configurer / à vérifier auprès de la source officielle ».

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/whatsapp` | Vue d'ensemble | N1 |
| `/app/whatsapp/consentements` | Tableau de bord des consentements | N2 |
| `/app/whatsapp/eligibilite` · `/{clientId}` | Éligibilité + « pourquoi éligible ? » | N2 |
| `/app/whatsapp/politique` | Politique centralisée | N2 |
| `/app/whatsapp/templates` · `/{id}` | Templates | N1 |
| `/app/whatsapp/campagnes` · `/{id}` · `/nouveau` | Campagnes (parcours en étapes) | N4 |
| `/app/whatsapp/file` | File d'envoi | N2 |
| `/app/whatsapp/couts` | Coût estimé / coût réel / budget | N2 |
| `/app/whatsapp/qualite` | Qualité du numéro | N2 |
| `/app/whatsapp/audit` | Journal d'audit | N2 |
| `/app/whatsapp/import` | Importation de clients | N1 |

## 4. Composants concernés

**Créés** : WhatsAppOverview, ConsentDashboard, ConsentCategoryMatrix, EligibilityTable,
EligibilityExplainer, EligibilityConditionRow, PolicyEditor, PolicyRuleRow, TemplateList,
TemplatePreview, TemplateVariableTag, CampaignWizard, CampaignStepIndicator, AudienceSelector,
ExclusionSummary, ExclusionReasonBadge, CampaignPreview, CampaignValidationSummary,
SendQueue, QueueItem, CostEstimatePanel, ActualCostPanel, BudgetMeter, EconomyModeToggle,
WindowStatusBadge, WindowExpiryAlert, QualityPanel, PhoneNumberNormalizer, WhatsAppAuditTable,
ImportMapper, DuplicateDetector.
**Réutilisés** : DataTable, KpiCard, KpiGrid, Chart, DataPanel, Timeline, Progress,
ProgressBar, Badge, StatusDot, SeverityIndicator, Button, Search, Select, Input, DatePicker,
Checkbox, Switch, Radio, FileUpload, Modal, Drawer, ConfirmDialog, EmptyState, Skeleton,
ErrorState, PermissionDenied, OfflineState.

## 5. UX

- **Toujours savoir pourquoi** : aucun envoi n'est possible sans que l'éligibilité de chaque
  contact soit explicable. L'écran « Pourquoi ce client est-il éligible ? » déroule la chaîne
  condition par condition, avec le résultat de chacune.
- **Les exclusions sont montrées, pas avalées** : la campagne affiche clairement qui a été
  retiré de l'audience et **pourquoi** (pas de consentement, catégorie refusée, do not contact,
  numéro invalide, fenêtre expirée, politique interne).
- **Aucune promesse de gratuité** : les écrans de fenêtre gratuite indiquent l'existence d'une
  fenêtre et son expiration, jamais un envoi « gratuit » garanti.
- **Coût estimé ≠ coût réel** : deux zones distinctes, libellées, jamais fusionnées.
- **Protection contre l'erreur** : avant tout envoi, récapitulatif complet (audience finale,
  exclusions, template, coût estimé, fenêtre) et confirmation renforcée.
- **UNKNOWN visible** : un consentement inconnu est affiché comme inconnu, avec l'action
  « collecter le consentement » — jamais comme accordé.

## 6. Design — application stricte du Design System

- Matrice de consentements : lignes par catégorie, badges sémantiques, aucune couleur
  décorative.
- Explainer d'éligibilité : liste de conditions avec icône de résultat (validé / échoué /
  inconnu), couleur sémantique **et** libellé.
- **CRITIQUE `#E0785F`** réservé aux blocages réels (do not contact, qualité dégradée,
  exclusion définitive).
- **ATTENTION `#F2A93B`** pour les fenêtres proches de l'expiration et les coûts qui approchent
  du budget.
- File d'envoi : `--panel`, éléments `--panel-2`, progression fine.
- Journal d'audit : table dense, horodatages et identifiants en **IBM Plex Mono**.
- Aucun logo ou élément de marque externe reproduit de manière décorative.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Vue d'ensemble | 3 colonnes | 2 colonnes | 2 colonnes | 1 colonne |
| Matrice consentements | table par catégorie | idem | lignes condensées | carte par catégorie |
| Explainer | 2 colonnes (conditions + détail) | 2 colonnes | 1 colonne | 1 colonne |
| Campagne (wizard) | étapes horizontales + contenu | idem | étapes condensées | **indicateur `3/12` + contenu** |
| File d'envoi | table | table | condensée | mode carte |
| Coûts | estimé / réel côte à côte | idem | empilé | empilé |
| Import | mapping 2 colonnes | idem | 1 colonne | 1 colonne |

## 8. Motion

- Progression du wizard : transition 220–320 ms entre étapes, indicateur interpolé.
- Vérification des consentements : progression réelle (ou localement simulée et **signalée**),
  jamais d'animation en boucle.
- Apparition du résumé d'exclusions : 220–320 ms.
- File d'envoi : progression fine, 140–220 ms par mise à jour.
- Alerte d'expiration de fenêtre : apparition sobre, **pas de pulsation permanente**.
- `prefers-reduced-motion` : transitions quasi instantanées.

## 9. États

- **Consentement** : accordé, refusé, retiré, expiré, **inconnu**, bloqué globalement, preuve
  disponible, preuve manquante.
- **Éligibilité** : éligible, non éligible (avec raison), inconnue, en cours de vérification,
  erreur de vérification.
- **Campagne** : brouillon, audience sélectionnée, exclusions appliquées, en prévisualisation,
  en attente de validation, planifiée, en file, en cours, terminée, échouée, annulée,
  permission denied (droit d'approbation manquant).
- **File** : vide, en attente, en cours, en pause, échec, reprise.
- **Coûts** : estimé disponible, réel disponible, budget proche du seuil (ATTENTION), budget
  dépassé (CRITIQUE), mode économie actif, tarif non configuré.
- **Fenêtre** : ouverte, proche expiration, expirée, type inconnu.
- **Qualité** : nominale, dégradée (ATTENTION), restreinte (CRITIQUE), état inconnu.
- **Import** : fichier invalide, colonnes non mappées, doublons détectés, import prêt,
  importé (consentement **non accordé** par défaut).

## 10. Données

Mockées et **signalées** :
- clients et consentements du LOT 08, avec cas limites (inconnu, retiré, do not contact) ;
- templates et campagnes de démonstration, **aucun envoi réel** ;
- file d'envoi simulée localement ;
- coûts de démonstration avec la mention explicite « tarif à configurer » ;
- règles de plateforme affichées comme « à configurer / à vérifier auprès de la source
  officielle » — **aucun quota, tarif ou fenêtre inventé**.

## 11. Interdits spécifiques au lot

- Inventer une règle, un quota, une limite, un tarif ou une fenêtre de la plateforme externe.
- Interpréter un consentement inconnu comme accordé.
- Promettre une gratuité d'envoi.
- Confondre consentement et autorisation d'envoi.
- Confondre coût estimé et coût réel.
- Envoyer quoi que ce soit par un canal réel.
- Importer des contacts en leur attribuant un consentement par défaut.
- Contourner ou « optimiser » une limite affichée (l. 5777–5795).

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 1016–1554, 3848, 5259–6109, 6400–7330), vérifier les consentements
  du LOT 08.
- **B** : annoncer fichiers, modèle d'éligibilité, parcours de campagne, stratégie de test.
- **C** : construire la chaîne complète, écran par écran.
- **D** : intégrer au shell, au Command Center, à la fiche client (LOT 08), aux coûts (LOT 09).
- **E** : tester l'explainer d'éligibilité sur tous les cas (accordé, refusé, retiré, inconnu,
  do not contact, numéro invalide, fenêtre expirée), le parcours de campagne en 12 étapes,
  l'import, le budget, les 4 breakpoints, les deux thèmes, clavier, reduced-motion.
- **F** : corriger toute ambiguïté de statut, toute exclusion non expliquée, tout overflow.
- **G** : valider lorsque **aucun** envoi n'est possible sans éligibilité explicable et sans
  confirmation renforcée.

## 13. Validation — checklist

- [ ] Chaîne canonique complète et visible, du consentement au statut final.
- [ ] Écran « Pourquoi ce client est-il éligible ? » déroulant chaque condition.
- [ ] **UNKNOWN jamais traité comme GRANTED**, affichage distinct.
- [ ] Consentement et autorisation d'envoi clairement séparés.
- [ ] Exclusions d'audience affichées **avec leur raison**.
- [ ] Parcours de campagne en étapes conforme, avec prévisualisation et validation.
- [ ] Coût estimé et coût réel distincts ; budget, seuil et mode économie.
- [ ] Fenêtres et expiration affichées **sans promesse de gratuité**.
- [ ] Qualité du numéro et ses conséquences.
- [ ] Normalisation des numéros, invalides signalés.
- [ ] Journal d'audit complet.
- [ ] Import : consentement **non accordé** par défaut, doublons détectés.
- [ ] Confirmations renforcées avant envoi.
- [ ] **Aucune règle, quota, tarif ou fenêtre de plateforme inventé.**
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 11.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la liste explicite des valeurs laissées
« à configurer » (et pourquoi elles ne sont pas inventées), les cas d'éligibilité testés, et
`AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 13.
