# LOT 06 — Ventes & Commandes

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 03 et LOT 05 (validés). **Débloque** : LOT 07, 08, 10, 17, 20.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire le module **Ventes & Commandes** : le point de vente, les commandes, devis,
factures, avoirs et paiements — avec leurs écrans de détail, d'historique et leurs états
hors ligne.

C'est le premier module métier complet du produit : il fixe le **motif d'écran métier**
(liste → détail → action → historique) que tous les modules suivants réutiliseront.

## 2. Périmètre

### 2.1 Inclus

1. **Point de vente (POS)** : recherche de produit, grille de produits, panier, remise,
   quantité, client (ou vente anonyme), multi-moyens de paiement, mise en attente,
   reprise d'une vente en attente, encaissement, aperçu du reçu.
2. **Ventes** : liste (filtres, tri, pagination), détail, historique et audit de la vente,
   annulation (avec `ConfirmDialog`), duplication.
3. **Commandes** : liste, détail, statuts, préparation, conversion en facture.
4. **Devis** : liste, détail, création, envoi (état « à venir » explicite), conversion.
5. **Factures** : liste, détail, statuts (brouillon, émise, partiellement payée, payée,
   en retard, annulée), échéance, relance (relais CRM).
6. **Avoirs** : liste, détail, création liée à une facture.
7. **Paiements** : liste, détail, moyen, montant, date, rattachement à une facture,
   paiement partiel.
8. **Impression** : aperçu du reçu et de la facture avant impression (la personnalisation
   avancée du reçu est au **LOT 17**).
9. **États hors ligne** : saisie possible, statut `offline` explicite, file locale visible,
   état `syncing` au retour.
10. **Numérotation visible** : format de référence affiché (la génération réelle est backend).

### 2.2 Exclu (reporté)

- Produits, catégories, stock → **LOT 07** (le POS consomme un catalogue mocké cohérent).
- Fiche client complète → **LOT 08** (le POS référence un client de démonstration).
- Écritures comptables, trésorerie → **LOT 09**.
- Personnalisation IA du reçu de caisse → **LOT 17**.
- Synchronisation réelle, idempotence backend → **LOT 20** (UI) puis phase backend.
- Envoi réel par WhatsApp / email → **LOT 12** / backend.

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/ventes/pos` | Point de vente | N1 |
| `/app/ventes` | Liste des ventes | N1 |
| `/app/ventes/{id}` | Détail d'une vente | N1 |
| `/app/ventes/{id}/historique` | Historique et audit | N2 |
| `/app/commandes` · `/app/commandes/{id}` | Commandes | N1 |
| `/app/devis` · `/app/devis/{id}` · `/app/devis/nouveau` | Devis | N1 |
| `/app/factures` · `/app/factures/{id}` | Factures | N1 |
| `/app/avoirs` · `/app/avoirs/{id}` | Avoirs | N1 |
| `/app/paiements` · `/app/paiements/{id}` | Paiements | N1 |

## 4. Composants concernés

**Créés** : PosLayout, ProductGrid, ProductTile, Cart, CartLine, DiscountControl,
PaymentSelector, PaymentSplit, PendingSaleDrawer, ReceiptPreview, SaleDetailHeader,
SaleLinesTable, InvoiceStatusBadge, PaymentTimeline, OfflineQueueBar, DocumentActions.
**Réutilisés** : DataTable, KpiCard, DataPanel, Timeline, ActivityFeed, Badge, StatusDot,
SeverityIndicator, Button, IconButton, Search, Select, Input, DatePicker, Modal, Drawer,
ConfirmDialog, EmptyState, Skeleton, ErrorState, OfflineState, SyncingState, PermissionDenied,
Progress.

## 5. UX

- **Vendre en moins d'une minute** : recherche → ajout au panier → encaissement. Le POS est
  pensé pour le tactile comme pour le clavier (raccourcis de quantité et de validation).
- **Aucune perte de saisie** : une vente en attente est conservée ; une coupure réseau
  n'annule pas la saisie, elle la place en file avec statut visible.
- **Confirmation sur le critique** : annulation d'une vente, annulation d'une facture,
  suppression d'un devis → `ConfirmDialog` avec conséquence explicite.
- **Statuts lisibles** : chaque statut de facture a une couleur sémantique **et** un libellé
  clair ; « en retard » n'est jamais exprimé par la seule couleur.
- **Historique honnête** : l'onglet historique montre qui a fait quoi et quand ; il est
  explicitement présenté comme **journal de démonstration** tant que l'audit réel n'existe pas.
- **Permissions visibles** : un utilisateur sans `sale.cancel` voit l'action en état
  `permission denied`, pas une action absente.

## 6. Design — application stricte du Design System

- POS : grille de produits sur `--panel-2`, cartes `--panel`, rayon 10 px, sélection marquée
  par `--accent-soft` ; panier latéral sur `--panel` avec bordure `--border`.
- Tableaux de lignes : montants, quantités et références en **IBM Plex Mono**, alignés à droite
  pour les montants.
- Statuts : badges compacts, sémantique stricte (brouillon = neutre, payée = SUCCESS,
  en retard = CRITIQUE, partiellement payée = ATTENTION).
- Aperçu de reçu : surface claire et lisible, typographie structurée, **aucune décoration**.
- Aucun gradient, aucune ombre colorée, aucune icône illustrative.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| POS | grille produits + panier latéral fixe | grille + panier plus étroit | produits 2 colonnes, panier en bas | produits 1–2 colonnes, **panier en sheet** |
| Listes | DataTable complète | colonnes secondaires masquées | colonnes prioritaires | **mode carte** |
| Détail | 2 colonnes (infos + lignes) | 2 colonnes | 1 colonne, onglets | 1 colonne, onglets empilés |
| Aperçu reçu | modale centrée | modale | modale pleine largeur | plein écran |
| File hors ligne | barre en pied de page | idem | barre collante | barre collante compacte |

Le POS reste **utilisable à une main sur tablette** : cibles tactiles suffisantes, aucune action
cachée derrière un survol.

## 8. Motion

- Ajout au panier : retour visuel bref (140–220 ms), sans translation longue.
- Ouverture du panier en sheet (mobile) : 320 ms.
- Validation d'encaissement : transition d'état 220–320 ms puis confirmation sobre.
- Aperçu du reçu : apparition `scale + translateY`, 220–320 ms.
- Changement de statut : transition de badge, pas d'animation décorative.
- **Aucune animation de célébration** : le seul Lottie autorisé du produit reste les confettis
  de validation d'établissement (l. 393–397).
- `prefers-reduced-motion` : transitions quasi instantanées.

## 9. États

- **POS** : catalogue en chargement, catalogue vide, recherche sans résultat, panier vide,
  panier actif, remise appliquée, paiement partiel, encaissement en cours, encaissement réussi,
  échec d'encaissement, **offline**, **syncing**, permission refusée.
- **Listes** : loading, empty (aucune vente), empty après filtre, error, offline, syncing.
- **Détail** : loading, introuvable, error, permission denied, annulé, partiellement payé.
- **Paiement** : en attente, validé, échoué, partiel.
- **File hors ligne** : vide, en attente, en cours, échec, conflit (relais LOT 20).

## 10. Données

Mockées et **signalées** :
- catalogue de démonstration cohérent (références, prix en FCFA, TVA, stock indicatif) partagé
  avec le LOT 07 à venir ;
- ventes, factures, avoirs et paiements **cohérents entre eux** (une facture payée a son
  paiement ; un avoir référence sa facture) ;
- file hors ligne locale, sans donnée sensible.

Aucune donnée réelle, aucun moyen de paiement réel, aucune transaction réelle. Le module
n'affiche jamais « paiement réussi » comme s'il provenait d'un prestataire : il s'agit d'une
**simulation locale explicitement signalée**.

## 11. Interdits spécifiques au lot

- Simuler un paiement réel (Wave, Visa, banque) ou afficher un statut de prestataire inventé.
- Créer une écriture comptable ou un mouvement de stock réel.
- Envoyer un document par un canal réel.
- Afficher une action sans permission effective correspondante.
- Produire un reçu personnalisé par IA (LOT 17).
- Laisser une saisie se perdre en cas d'erreur ou de coupure.

## 12. Méthode d'exécution

- **A** : relire le corpus (ventes, paiements l. 499–516, offline l. 2292–2333), vérifier les
  composants LOT 03 et le motif d'écran posé par le LOT 05.
- **B** : annoncer fichiers, modèle de données mocké partagé, statuts et transitions, stratégie
  de test.
- **C** : construire le POS, puis les listes, détails, historiques, aperçus.
- **D** : intégrer au shell (LOT 02), au Command Center (LOT 04) et aux cartes d'action du
  Cockpit (LOT 05).
- **E** : tester le parcours complet de vente, l'annulation, le paiement partiel, la coupure
  réseau simulée, les 4 breakpoints, les deux thèmes, clavier, reduced-motion.
- **F** : corriger incohérences de données, états manquants, overflow, focus.
- **G** : valider lorsque le parcours « recherche → vente → encaissement → reçu → historique »
  est cohérent de bout en bout.

## 13. Validation — checklist

- [ ] POS complet : recherche, grille, panier, remise, client, multi-paiements, mise en attente,
      reprise, encaissement, aperçu du reçu.
- [ ] Ventes, commandes, devis, factures, avoirs, paiements : liste + détail pour chacun.
- [ ] Historique et audit d'une vente accessibles et présentés comme journal de démonstration.
- [ ] Annulations et opérations critiques sous `ConfirmDialog` avec conséquence explicite.
- [ ] Statuts de facture complets, libellés + couleur, jamais la couleur seule.
- [ ] Paiement partiel géré, avec reste à payer exact en mono.
- [ ] États offline / syncing visibles ; aucune saisie perdue.
- [ ] Numérotation de référence affichée, génération réelle explicitement reportée.
- [ ] Permissions simulées affichées en `permission denied`, jamais masquées.
- [ ] Données mockées cohérentes entre ventes, factures, avoirs, paiements ; bandeau de
      démonstration présent.
- [ ] Aucun paiement réel simulé comme réel.
- [ ] Les 4 breakpoints conformes, POS utilisable au tactile.
- [ ] Les deux thèmes ; `prefers-reduced-motion` respecté.
- [ ] Aucune régression sur LOT 00 à 05.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : le modèle de données mocké partagé, les statuts et
transitions implémentés, ce qui est explicitement simulé, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 07.
