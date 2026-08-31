# LOT 07 — Stocks · Rapport de validation

**Date :** 2026-08-30
**Branche :** `arena/01a04ab1-divini-3`
**Spécification :** `prompts/LOT-07-stocks.md`
**Statut :** construit, inspecté, corrigé — **en attente de validation explicite**

> Format du socle §10 + complots §14 : règle de cohérence stock/mouvements,
> fonctionnement de la suggestion de catégories (et son caractère local),
> `AVANCEMENT GLOBAL`.

---

## 1. IMPLÉMENTÉ

Module **Stocks** complet, motif liste → détail → action réutilisé du LOT 06.

- **Vue d'ensemble** `/app/stocks` : valorisation (count-up KpiCard), produits sous
  seuil, stock dormant, derniers mouvements (Timeline), écarts d'inventaire,
  répartition par entrepôt (ProgressBar + saturation).
- **Produits** : liste (DataTable LOT 03), fiche à onglets (informations, variantes,
  mouvements, fournisseurs, historique), création / modification / duplication /
  archivage (ConfirmDialog), éditeur de seuils, variantes, upload d'images.
- **Catégories** : arborescence éditable + **génération assistée locale**
  (mots-clés → suggestions → curation → validation).
- **Mouvements** : entrées / sorties / corrections / transferts, liste filtrable,
  détail, justificatif, **motif obligatoire** (refusé si vide).
- **Inventaires** : campagnes, compté vs théorique, écart en badge sémantique,
  validation confirmée, mode carte par article sous 720 px.
- **Entrepôts & emplacements** : cartes, capacités, saturation, rattachement.
- **Gouvernance visible** : création produits/catégories réservée au tenant central ;
  un établissement voit un état `permission denied` explicite.

13 routes sous `/app/stocks/**`. Manifeste : **Stocks → `disponible`** ; action
Command Center « Nouveau mouvement de stock » → `/app/stocks/mouvements/nouveau`.

---

## 2. RÈGLE DE COHÉRENCE STOCK / MOUVEMENTS (§14)

**Le stock affiché est dérivé des mouvements, jamais un champ figé.**
`stockOf(id) = Σ delta(mouvements)`. Les 19 mouvements de démonstration
reconstituent exactement le catalogue du LOT 06 :

| Produit | Mouvements | Stock | LOT 06 |
|---|---|---|---|
| prd-01 Café | +50 −8 −5 +5 | 42 | 42 ✓ |
| prd-02 Thé | +40 −10 | 30 | 30 ✓ |
| prd-03 Sucre | +30 −25 +3 | 8 | 8 ✓ |
| prd-04 Miel | +20 −5 | 15 | 15 ✓ |
| prd-05 Bissap | +25 −25 | 0 | 0 ✓ |
| prd-06 Arachides | +70 −10 | 60 | 60 ✓ |
| prd-07 Chocolat | +30 −8 | 22 | 22 ✓ |
| prd-08 Infusion | +40 −5 | 35 | 35 ✓ |

Un test assertit `stockOf(p) === PRODUCTS[LOT06].stock` pour les 8 produits, et
`Σ delta === stockOf` pour chacun. Aucun stock divergent n'est affichable.

---

## 3. SUGGESTION DE CATÉGORIES — LOCALE (§14)

`suggestCategories(motsClés)` est une **fonction pure sur lexique local** :
- table de correspondance mots-clés → libellés (café, thé, sucre, miel, bio…) ;
- repli déterministe (un mot-clé inconnu → catégorie éponyme en casse de titre) ;
- dé-duplication insensible à la casse ;
- **retour `[]` si aucun mot-clé exploitable** → l'interface affiche « suggestion
  vide », jamais une liste inventée.

**Aucun modèle d'IA, aucun appel réseau** (interdit §11). Présentée comme
« assistance locale » (badge). L'utilisateur supprime, modifie, valide ; **rien
n'est créé sans validation explicite** (bouton « Valider N catégorie(s) »).

---

## 4. EXPLICITEMENT SIMULÉ

Création / modification / archivage de produits, mouvements, seuils, inventaires :
démonstration locale signalée, **aucune écriture réelle** (phase backend). Upload
d'image : progression simulée localement et signalée, aucun stockage. Fournisseurs
complets → LOT 11. Réapprovisionnement automatique → LOT 14/16 (non implémenté).
Impact réel d'une vente sur le stock → backend.

---

## 5. TESTS — 185/185 (165 antérieurs + 20 nouveaux)

`tests/stocks.test.mjs` (20) : cohérence `Σ delta === stockOf` ; `stockOf === LOT06`
pour les 8 produits ; valorisation ; motifs non vides ; rupture = critique ;
sous-seuil = attention ; liste à risque non saine ; dormant avec stock ; suggestion
vide pour saisie vide ; lexique reconnu ; déterminisme ; dé-duplication ; gouvernance
(tenant vrai / site faux) ; écart compté−théorique ; ligne non comptée = 0 ;
hasVariance ; countProgress ; saturation cohérente ; rendus vue d'ensemble + liste.

Contrôles : typecheck 0 · var() 0 · valeurs en dur 0 · contrastes 0.

---

## 6. ERREURS RENCONTRÉES

1. `Button` exige `onClick` et n'a pas de variante `secondary` → `subtil` ;
   `IconButton` prend `icon` + `label` (pas children). Corrigé.
2. `--panel-2` n'est pas un token sémantique (primitive `--c-panel2`) → remplacé par
   `--surface-recessed`. check:vars repassé à 0.
3. `daysSince` non exporté du mock → exporté.

---

## 7. RÉGRESSIONS

**Aucune.** 165 tests antérieurs inchangés (185 − 20).

---

## 8. NON VÉRIFIABLE ICI

Rendu réel : les 4 breakpoints (saisie d'inventaire debout sur tablette), les deux
thèmes, reduced-motion (count-up, reveals), upload tactile. jsdom ne fait pas de layout.

---

## 9. AVANCEMENT GLOBAL

**AVANCEMENT GLOBAL : 32 %**

Lots 00-06 validés ; **LOT 07 en attente de validation explicite**.

---

## 10. STOP

LOT 07 **construit, inspecté, corrigé**. Je m'arrête et **j'attends votre validation
explicite** avant le LOT 08.
