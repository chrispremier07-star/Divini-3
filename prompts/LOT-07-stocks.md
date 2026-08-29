# LOT 07 — Stocks

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 03 et LOT 06 (validés). **Débloque** : LOT 11.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire le module **Stocks** : produits, catégories (avec génération assistée), variantes et
images, mouvements, inventaires, entrepôts et emplacements — plus la vue d'ensemble des risques.

Le corpus précise un point de gouvernance essentiel (l. 1838–1841, 4446) : **le tenant central
possède les droits de création des produits et catégories ; les points de vente ont des droits
limités.** Cette asymétrie doit être visible dans l'interface, pas seulement déclarée.

## 2. Périmètre

### 2.1 Inclus

1. **Vue d'ensemble** : valorisation, produits à risque (sous seuil), stock dormant, derniers
   mouvements, écarts d'inventaire, répartition par entrepôt / établissement.
2. **Produits** : liste, fiche (onglets : informations, variantes, mouvements, fournisseurs,
   historique), création, modification, duplication, archivage.
3. **Catégories** : arborescence éditable + **génération assistée** : l'utilisateur saisit
   quelques mots-clés, une liste de catégories est proposée, il **supprime, modifie, valide**
   (l. 1805–1822, II.6).
4. **Variantes** : déclinaisons (taille, couleur, modèle), stock par variante, images et
   descriptions importées.
5. **Mouvements** : entrées, sorties, corrections, transferts ; liste filtrable, détail,
   justificatif, motif obligatoire.
6. **Inventaires** : campagne d'inventaire, saisie comptée vs théorique, écart, validation,
   historique.
7. **Entrepôts & emplacements** : liste, fiche, capacités, rattachement aux établissements.
8. **Seuils et alertes visuelles** : seuil d'alerte et seuil critique par produit, affichage
   sémantique.
9. **Gouvernance visible** : actions de création réservées au tenant central ; pour un rôle
   point de vente, ces actions sont en état `permission denied` avec explication.

### 2.2 Exclu (reporté)

- Fournisseurs et commandes d'achat → **LOT 11** (la fiche produit référence un fournisseur de
  démonstration).
- Stock prédictif et réapprovisionnement automatique → **LOT 14** / **LOT 16**.
- Impact réel d'une vente sur le stock → phase backend ; ici, cohérence mockée signalée.
- Génération réellement assistée par IA → l'interface est livrée avec une **proposition locale
  de démonstration**, explicitement signalée comme telle.

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/stocks` | Vue d'ensemble | N1 + N3 |
| `/app/stocks/produits` · `/{id}` · `/nouveau` · `/{id}/modifier` | Produits | N1 |
| `/app/stocks/categories` | Catégories + génération assistée | N1 + N3 |
| `/app/stocks/mouvements` · `/{id}` | Mouvements | N1 |
| `/app/stocks/inventaires` · `/{id}` | Inventaires | N1 |
| `/app/stocks/entrepots` · `/{id}` | Entrepôts & emplacements | N1 |

## 4. Composants concernés

**Créés** : StockOverviewCards, RiskList, DormantStockPanel, ProductForm, VariantEditor,
ImageUploader, CategoryTree, CategorySuggestPanel, SuggestedCategoryItem, MovementForm,
MovementTypeSelector, InventorySession, InventoryCountTable, VarianceBadge, WarehouseCard,
ThresholdEditor.
**Réutilisés** : DataTable, KpiCard, Chart, DataPanel, Timeline, Badge, StatusDot,
SeverityIndicator, Progress, Button, IconButton, Search, Select, Input, Checkbox, Switch,
FileUpload, Modal, Drawer, ConfirmDialog, EmptyState, Skeleton, ErrorState, PermissionDenied,
OfflineState, SyncingState.

## 5. UX

- **Voir le risque avant l'incident** : la vue d'ensemble ouvre sur les produits sous seuil et
  le stock dormant, pas sur un tableau exhaustif.
- **Créer un produit sans friction** : formulaire progressif, champs obligatoires explicites,
  images en glisser-déposer, variantes ajoutées sans quitter la page.
- **Catégories sans saisie fastidieuse** : mots-clés → proposition → curation → validation.
  L'utilisateur garde toujours la main : rien n'est créé sans validation explicite.
- **Mouvements traçables** : type, motif, quantité, acteur, date, justificatif — un mouvement
  sans motif est refusé côté interface.
- **Inventaire sans erreur** : saisie comptée face au théorique, écart immédiatement visible,
  validation confirmée.
- **Asymétrie de droits lisible** : un point de vente comprend pourquoi il ne peut pas créer un
  produit, et vers qui se tourner.

## 6. Design — application stricte du Design System

- Cartes de synthèse sur `--panel`, bordures fines, valeurs en **IBM Plex Mono**.
- Seuil d'alerte = ATTENTION `#F2A93B`, seuil critique = CRITIQUE `#E0785F`, toujours avec
  icône et libellé.
- Arborescence de catégories : indentation nette, `--border-soft`, sélection `--accent-soft`.
- Panneau de suggestion de catégories : propositions sur `--panel-2`, actions de retrait
  discrètes, validation en bouton primaire ambre.
- Images de produits : conteneur sobre, rayon 8–10 px, aucun effet décoratif.
- Écart d'inventaire : badge sémantique, jamais un simple chiffre coloré.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Vue d'ensemble | 3 colonnes | 2 colonnes | 2 colonnes | 1 colonne |
| Liste produits | table complète + vignettes | colonnes réduites | colonnes prioritaires | mode carte avec vignette |
| Fiche produit | onglets + 2 colonnes | onglets + 2 colonnes | onglets, 1 colonne | onglets scrollables, 1 colonne |
| Formulaire produit | 2 colonnes | 2 colonnes | 1 colonne | 1 colonne |
| Arborescence catégories | panneau latéral + liste | idem | plein largeur | drawer |
| Saisie d'inventaire | table comptée/théorique/écart | idem | colonnes condensées | **mode carte par article** |
| Import d'images | zone de dépôt large | idem | zone compacte | zone compacte + bouton |

La saisie d'inventaire doit rester utilisable **debout, sur tablette** : cibles larges, aucun
survol requis.

## 8. Motion

- Reveal des cartes de synthèse : 700 ms, easing canonique, une seule fois.
- Count-up des valorisations : 1 100–1 200 ms.
- Ajout d'une variante ou d'une catégorie : apparition 220–320 ms.
- Retrait d'une catégorie suggérée : sortie 140–220 ms.
- Validation de la liste de catégories : confirmation sobre, **pas de célébration**.
- Upload d'image : progression réelle (ou simulée localement et signalée), jamais d'animation
  en boucle.
- `prefers-reduced-motion` : valeurs finales directes, apparitions immédiates.

## 9. États

- **Produits** : liste loading / vide / vide après filtre / erreur / offline / syncing ;
  fiche loading / introuvable / archivée / permission denied ; formulaire default / validation /
  erreur de champ / enregistrement / enregistré.
- **Catégories** : arborescence vide, chargement, suggestion en cours, suggestion vide,
  suggestion en erreur, liste validée, permission denied (rôle point de vente).
- **Variantes / images** : aucune variante, ajout, upload en cours, upload réussi, upload
  échoué, format non supporté.
- **Mouvements** : liste loading / vide / erreur ; formulaire sans motif (refus), enregistrement,
  enregistré.
- **Inventaires** : aucune session, session en cours, comptage partiel, écart détecté, session
  validée, permission denied.
- **Entrepôts** : liste, fiche, capacité saturée (ATTENTION / CRITIQUE).

## 10. Données

Mockées et **signalées** :
- catalogue partagé avec le LOT 06 (mêmes références, mêmes prix en FCFA) ;
- mouvements et inventaires cohérents avec les quantités affichées (le stock affiché doit
  correspondre à la somme des mouvements) ;
- propositions de catégories générées **localement** à partir de mots-clés, présentées comme
  démonstration de l'assistance — **aucune réponse d'IA réelle, aucun appel externe**.

## 11. Interdits spécifiques au lot

- Simuler une génération par IA réelle ou un appel de service externe.
- Créer une catégorie sans validation explicite de l'utilisateur.
- Accepter un mouvement sans motif.
- Masquer une action réservée au tenant central au lieu de l'afficher en `permission denied`.
- Afficher un stock incohérent avec les mouvements de démonstration.
- Implémenter un réapprovisionnement automatique.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 1780–1841, II.6), vérifier le catalogue mocké du LOT 06 et les
  composants LOT 03.
- **B** : annoncer fichiers, cohérence du modèle stock/mouvements, stratégie de test.
- **C** : construire la vue d'ensemble, les produits, les catégories, les mouvements, les
  inventaires, les entrepôts.
- **D** : intégrer au shell, au Command Center, aux cartes d'action du Cockpit ; réutiliser le
  catalogue du LOT 06.
- **E** : tester création/édition, curation de catégories, mouvement refusé sans motif, session
  d'inventaire, les 4 breakpoints, les deux thèmes, clavier, reduced-motion, cohérence des
  quantités.
- **F** : corriger incohérences, overflow, focus, états manquants.
- **G** : valider lorsque la chaîne « produit → mouvement → quantité → alerte de seuil » est
  cohérente.

## 13. Validation — checklist

- [ ] Vue d'ensemble : valorisation, produits sous seuil, stock dormant, derniers mouvements,
      écarts, répartition.
- [ ] Produits : liste, fiche à onglets, création, modification, archivage.
- [ ] Catégories : arborescence éditable + suggestion par mots-clés avec curation et validation.
- [ ] Variantes et images fonctionnelles, avec upload et ses états.
- [ ] Mouvements : entrées, sorties, corrections, transferts, **motif obligatoire**.
- [ ] Inventaires : session, compté vs théorique, écart, validation, historique.
- [ ] Entrepôts et emplacements.
- [ ] Seuils d'alerte et critique avec sémantique + icône + libellé.
- [ ] Création produits/catégories réservée : état `permission denied` explicite pour un rôle
      point de vente.
- [ ] Quantités affichées cohérentes avec les mouvements de démonstration.
- [ ] Suggestion de catégories présentée comme assistance locale, non comme IA réelle.
- [ ] Saisie d'inventaire utilisable sur tablette.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 06.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la règle de cohérence stock/mouvements appliquée,
le fonctionnement de la suggestion de catégories (et son caractère local), et
`AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 08.
