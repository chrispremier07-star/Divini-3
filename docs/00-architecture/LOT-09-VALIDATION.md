# LOT 09 — Finance · Rapport de validation

**Date :** 2026-08-30
**Branche :** `arena/01a04ab1-divini-3`
**Spécification :** `prompts/LOT-09-finance.md`
**Statut :** construit, inspecté, corrigé — **en attente de validation explicite**

> Format du socle §10 + complots §14 : méthode de calcul local de la projection,
> statuts de dépenses implémentés, `AVANCEMENT GLOBAL`.

---

## 1. IMPLÉMENTÉ

Module **Finance** complet.

- **Trésorerie** `/app/tresorerie` : soldes par compte/caisse, flux (entrées /
  sorties), échéances à venir (créances / dettes), créances âgées, export « à venir ».
- **CASH VISION** `/app/tresorerie/cash-vision` : ouvre sur la **réponse** (bascule
  négative prévue le … / trésorerie suffisante), courbe passé plein + futur pointillé,
  frontière présent/futur, bascule négative marquée (CRITIQUE + libellé), marqueur
  temporel (pulse unique), scénarios comparés.
- **Comptabilité** `/app/comptabilite` : grands postes, résultat, périodes (ouverture /
  clôture), créances âgées ; période clôturée **verrouillée à l'écran**.
- **Dépenses** `/app/depenses` : liste, détail, workflow d'approbation, justificatif,
  formulaire ; approbation **conditionnée au rôle**.
- **Devises** `/app/devises` : rôles transaction / tenant / affichage, convertisseur,
  taux avec **date + source**.

10 routes. Manifeste : **Trésorerie, Comptabilité, Dépenses → `disponible`** ; action
Command Center « Enregistrer une dépense » → `/app/depenses/nouveau`.

---

## 2. MÉTHODE DE CALCUL LOCAL DE LA PROJECTION (§14)

`buildProjection()` :
1. solde de départ = trésorerie totale courante (somme des soldes de comptes) ;
2. application **chronologique** des flux projetés (échéances à venir, dépenses
   programmées, remboursement d'emprunt) ;
3. chaque point porte un drapeau `projected` → sépare passé (plein) et futur (pointillé).

`negativeCrossoverDate()` parcourt les points et retourne la première date où le solde
passe sous zéro. Avec les données de démonstration, la bascule est détectée (solde
projeté minimum négatif) — testé.

C'est une **projection de démonstration** : calcul local, aucun modèle prédictif,
aucune prévision garantie, aucun résultat comptable (interdit §11). Les scénarios
(« encaisser plus tôt », « reporter une dépense ») décalent des flux et recalculent —
toujours présentés comme estimation.

---

## 3. STATUTS DE DÉPENSE IMPLÉMENTÉS (§14)

Workflow canonique (l. 1982-1984) : **créée → en attente → approuvée → payée / rejetée**.
- `creee` (neutre) → `en_attente`
- `en_attente` (ATTENTION) → `approuvee` | `rejetee`
- `approuvee` (INFO) → `payee`
- `payee` (SUCCESS) et `rejetee` (CRITIQUE) : terminaux.

`ApprovalStepper` affiche la progression ; `ApprovalActions` ne propose que les
transitions valides. **Approbation conditionnée au rôle** : `canApprove('gerant')` =
true, `comptable` / `employe` = false → `PermissionDenied` explicite (interdit §11 :
jamais approuver sans vérifier le rôle). Testé.

---

## 4. EXPLICITEMENT SIMULÉ

Soldes, flux, projection, dépenses, périodes, taux : démonstration signalée, **aucune
écriture comptable réelle, aucun paiement réel, aucune clôture effective, aucun
rapprochement bancaire réel** (phase backend). Projection mockée signalée. Taux de
change de démonstration **avec date + source**, aucune conversion adossée à un service
externe. Masse salariale / paie → LOT 11.

---

## 5. TESTS — 223/223 (204 antérieurs + 19 nouveaux)

`tests/finance.test.mjs` (19) : solde = initial + flux signés ; trésorerie totale ;
encaissements ⇄ paiements LOT 06 (6000 / 5000) ; paiement échoué exclu ; projection
(départ, points projetés, tri) ; bascule négative détectée ; workflow de dépense +
statuts terminaux ; approbation par rôle ; période clôturée verrouillée ; devises
(date + source, conversion, couple inconnu) ; rendus trésorerie, CASH VISION, dépenses.

Contrôles : typecheck 0 · var() 0 · valeurs en dur 0 · contrastes 0.

---

## 6. ERREURS RENCONTRÉES

1. Environnement encore re-provisionné en début de tour (HEAD base, node_modules
   effacé) → branche restaurée (`fetch` + `reset --mixed`), `npm ci` + `npm run tokens`.
2. Apostrophes dans des chaînes (`j'encaisse`, `d'approbation`) → apostrophes
   typographiques / reformulation.
3. `Chart` générique sans frontière passé/futur ni marqueur → `CashVisionChart` SVG
   dédié (extension justifiée : signature produit).

---

## 7. RÉGRESSIONS

**Aucune.** 204 tests antérieurs inchangés (223 − 19).

---

## 8. NON VÉRIFIABLE ICI

Rendu réel : les 4 breakpoints (CASH VISION mobile, approbation en barre collante), les
deux thèmes, reduced-motion (reveal courbe, pulse marqueur), count-up des soldes. jsdom
ne fait pas de layout.

---

## 9. AVANCEMENT GLOBAL

**AVANCEMENT GLOBAL : 40 %**

Lots 00-08 validés ; **LOT 09 en attente de validation explicite**.

---

## 10. STOP

LOT 09 **construit, inspecté, corrigé**. Je m'arrête et **j'attends votre validation
explicite** avant le LOT 10.
