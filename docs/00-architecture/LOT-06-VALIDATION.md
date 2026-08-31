# LOT 06 — Ventes & Commandes · Rapport de validation

**Date :** 2026-08-30
**Branche :** `arena/01a04ab1-divini-3`
**Spécification :** `prompts/LOT-06-ventes-commandes.md`
**Statut :** construit, inspecté, corrigé — **en attente de validation explicite**

> Format du socle §10 + complots §14 : modèle de données mocké partagé, statuts &
> transitions, ce qui est explicitement simulé, `AVANCEMENT GLOBAL`.

---

## 1. IMPLÉMENTÉ

Premier module métier complet ; il fixe le motif **liste → détail → action → historique**.

- **POS** `/app/ventes/pos` : recherche, grille produits (rupture désactivée), panier
  (qté, remise, client), multi-moyens de paiement **abstraits**, mise en attente +
  reprise, encaissement, aperçu du reçu, file hors ligne.
- **Listes + détails** : ventes, commandes, devis, factures, avoirs, paiements
  (DataTable LOT 03) ; détail avec lignes en mono, totaux, reste à payer, paiements
  rattachés, références croisées ; historique de vente présenté comme **journal de
  démonstration**.
- **Confirmations** : annulation vente/facture/devis sous `ConfirmDialog` avec
  conséquence + permission nommée.
- **Statuts** : badges libellé + couleur (brouillon neutre, payée SUCCESS, en retard
  CRITIQUE, partielle ATTENTION) — jamais la couleur seule.
- **Offline/syncing** : barre de file locale ; une coupure place la vente en file
  (`synced:false`), aucune saisie perdue.
- Manifeste : **Ventes passe `disponible`** (`/app/ventes`) ; « Nouvelle vente » du
  Command Center → POS.

Routes : `/app/ventes[/pos|/{id}|/{id}/historique]`, `/app/commandes`, `/app/devis[/nouveau]`,
`/app/factures`, `/app/avoirs`, `/app/paiements` (+ détails).

---

## 2. VISIBLE MAINTENANT

HTML servi vérifié : POS (panier, encaisser, moyens), liste ventes (réfs + statuts),
détail facture partielle (reste à payer), historique, nouveau devis. 0 id dupliqué.

---

## 3. MODÈLE DE DONNÉES MOCKÉ PARTAGÉ (§14)

`components/sales/mock.ts` : catalogue 8 produits (FCFA, TVA, stock) partagé avec le
LOT 07 ; documents cohérents — `fac-001` payée ⇄ `pay-001` (reste 0) ; `fac-002`
partielle ⇄ `pay-002` (reste exact) ; `avr-001` → `fac-002` ; chaque paiement → facture.
Paiements en couche **abstraite** (espèces/mobile/carte/banque), jamais un prestataire.

---

## 4. STATUTS & TRANSITIONS (§14)

Facture : brouillon→émise→{partielle,payée,en retard,annulée} ; payée/annulée terminaux.
Vente : en_attente→encaissée/annulée ; offline→encaissée. Commande, devis, avoir,
paiement : transitions déclarées dans `STATUS_TRANSITIONS` (vérité backend au LOT 20).

---

## 5. EXPLICITEMENT SIMULÉ (§14)

Encaissement = simulation locale signalée (jamais « paiement réussi » d'un prestataire).
Aucune écriture comptable, aucun mouvement de stock, aucun envoi réel (LOT 12/backend),
numérotation réelle reportée, reçu IA au LOT 17.

---

## 6. TESTS — 165/165 (151 antérieurs + 14 nouveaux)

`tests/sales.test.mjs` (14) : facture payée ⇄ paiement (reste 0) ; partielle reste exact ;
avoir/paiement → facture existante ; totaux justes ; statuts terminaux ; brouillon ne paie
pas directement ; statuts connus ; liste factures libellés ; détail partielle ; introuvable
→ EmptyState ; POS catalogue/panier ; ajout + rupture refusée ; recherche pure.

Contrôles : typecheck 0 · var() 0 · valeurs en dur 0 · contrastes 0.

---

## 7. ERREURS RENCONTRÉES

1. Pluriel « deviss » → route corrigée en `devis`.
2. `useToast` au niveau de la page `/app/devis/nouveau` → contenu isolé dans `<AppShell>`.
3. Saisie contrôlée React non simulable par événement brut → filtrage extrait en
   `searchProducts` (pur, testé).

---

## 8. RÉGRESSIONS

**Aucune.** 151 tests antérieurs inchangés (165 − 14).

---

## 9. NON VÉRIFIABLE ICI

Rendu réel : les 4 breakpoints, POS tactile, les deux thèmes, reduced-motion, aperçu reçu
en modale. jsdom ne fait pas de layout.

---

## 10. AVANCEMENT GLOBAL

**AVANCEMENT GLOBAL : 28 %**

Lots 00-05 validés ; **LOT 06 en attente de validation explicite**.

---

## 11. STOP

LOT 06 **construit, inspecté, corrigé**. Je m'arrête et **j'attends votre validation
explicite** avant le LOT 07.
