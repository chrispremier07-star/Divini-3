# LOT 10 — Logistique & Fidélité · Rapport de validation

**Date :** 2026-08-30
**Branche :** `arena/01a04ab1-divini-3`
**Spécification :** `prompts/LOT-10-logistique-fidelite.md`
**Statut :** construit, inspecté, corrigé — **en attente de validation explicite**

> Format du socle §10 + complots §14 : transitions de statut implémentées, règles
> d'attribution / exclusion, `AVANCEMENT GLOBAL`.

---

## 1. IMPLÉMENTÉ

Modules **Logistique** et **Fidélité** complets (frontend uniquement, dépend LOT 06 + 08).

### Logistique

- **Expéditions** `/app/livraisons` : tableau filtrable (référence, client, statut,
  zone, livreur), création depuis une commande LOT 06, fiche détail (timeline des
  événements, affectation livreur, changement de statut, motif d'échec **obligatoire**).
- **Création** `/app/livraisons/nouveau` : sélection commande → client, zone, livreur.
- **Livreurs** `/app/livraisons/livreurs` + `/livreurs/[id]` : charge du jour,
  performance, zones desservies.
- **Zones & tarifs** `/app/livraisons/zones` : référentiel **extensible** (ajout de
  zone à l'écran), jamais de liste fermée.
- **Statistiques** `/app/livraisons/statistiques` : taux de réussite, **CA perdu**,
  motifs d'échec, répartition des statuts.

### Fidélité

- **Programme** `/app/fidelite` : membres, points en circulation, niveaux, récompenses.
- **Règles** `/app/fidelite/regles` : presets **configurables**, mode d'attribution,
  exclusion des frais de livraison (visible + configurable).
- **Historique** `/app/fidelite/historique` : toute opération de points historisée.
- **Fiche client** (LOT 08) : onglet Fidélité remplacé par le vrai panneau LOT 10
  (solde, niveau, progression, expiration proche, opérations, correction tracée).

10 routes. Manifeste : **Livraisons, Fidélité → `disponible`** (avec routes réelles).

---

## 2. TRANSITIONS DE STATUT IMPLÉMENTÉES (§14)

8 statuts canoniques (l. 1854-1862) : **préparation · à expédier · en cours ·
en livraison · échouée · reprogrammée · livrée · annulée**.

`DELIVERY_TRANSITIONS` :
- `preparation` → `a_expedier`
- `a_expedier` → `en_cours` | `annulee`
- `en_cours` → `en_livraison` | `echouee`
- `en_livraison` → `livree` | `echouee`
- `echouee` → `reprogrammee` | `annulee`
- `reprogrammee` → `en_cours`
- `livree`, `annulee` : **terminaux**.

La fiche détail ne propose que les transitions valides. **Un échec exige un motif**
(liste `FAILURE_REASONS`) : impossible de marquer échouée sans motif (interdit §11).
Testé.

---

## 3. RÈGLES D'ATTRIBUTION / EXCLUSION (§14)

**Presets configurables** (jamais codés en dur, interdit §11) :
- Standard : 10 pts inscription, 1 pt / 1 000 FCFA
- Généreux : 20 pts, 1 pt / 500 FCFA
- Économique : 5 pts, 1 pt / 2 000 FCFA

**2 modes d'attribution** (`AttributionMode`), affichés sur chaque opération :
- `prorata` : points au prorata du paiement ;
- `after_full_payment` : points uniquement quand la facture est intégralement soldée.

`pointsForPayment(payé, total, déjàPayé, preset, mode, opts)` implémente les deux.
Testé (6 000 → 6 pts au prorata ; 0 pt avant solde ; 20 pts après solde).

**Exclusion des frais de livraison** (visible + configurable) :
`pointsFromAmount(montant, preset, { deliveryFee, excludeDeliveryFees })` soustrait les
frais de livraison de la base quand la règle l'exige (10 000 dont 1 500 de livraison →
8 pts si exclusion active, 10 pts sinon). Testé.

**Correction tracée** (jamais de suppression silencieuse, interdit §11) : une
annulation produit une opération `correction` **négative historisée** avec motif
(`pop-004`, −3 pts, « Annulation partielle — correction tracée »), jamais une
disparition. Testé.

---

## 4. EXPLICITEMENT SIMULÉ

Expéditions, livreurs, zones, points, niveaux, récompenses : démonstration signalée.
**Aucune notification réelle** (backend), **aucune géolocalisation temps réel** (non
prévue), **aucun suivi réel**, **aucun impact réel vente → points** (signal mocké).
Relances WhatsApp → LOT 12. Statistiques calculées localement sur le jeu de démo.

---

## 5. TESTS — 270/270 (243 antérieurs + 27 nouveaux)

`tests/logistics.test.mjs` (15) : 8 statuts canoniques ; transitions (terminaux, échec →
reprogrammée/annulée, cibles valides) ; échec toujours motivé ; zones extensibles +
findZone ; livreurs (findCourier, charge active, filtre) ; statistiques (taux de
réussite, **CA perdu** = échouées + annulées, compteurs, motifs agrégés) ; rendus
(tableau, stats, livreurs, zones).

`tests/loyalty.test.mjs` (12) : presets configurables (3 distincts, valeurs distinctes) ;
2 modes d'attribution (prorata, après solde) ; exclusion frais de livraison ; correction
tracée (négative + motif) ; opérations typées + motivées ; niveaux (levelFor, nextLevel,
progression bornée) ; statistiques (circulation, émis, expirés) ; rendus (synthèse,
règles, historique, panneau client).

Contrôles : typecheck 0 · var() 0 · valeurs en dur 0 · contrastes 0. Build : 10 routes
LOT 10 générées. Audit HTML servi : 10 écrans + fiche client, toutes les sondes OK.

---

## 6. ERREURS RENCONTRÉES

1. Environnement re-provisionné en début de tour → branche restaurée (`fetch` +
   `reset --mixed`), `npm ci` + `npm run tokens`.
2. Apostrophes dans des chaînes FR (`d'échec`, `l'historique`) → `\u2019`.
3. Barrel Fidélité n'exportait pas `CLIENTS` → ajout (ré-export depuis `../crm/mock`).
4. Modules `livraisons` / `fidelite` passés `disponible` **sans champ `route`** → garde
   du test shell (« tout module disponible porte une route réelle ») → routes ajoutées.
5. Test `courierLoad` initial comptait l'historique ; l'implémentation compte la
   **charge active** (en cours / en livraison / à expédier) — test aligné sur le réel.

---

## 7. RÉGRESSIONS

**Aucune.** 243 tests antérieurs inchangés (270 − 27).

---

## 8. NON VÉRIFIABLE ICI

Rendu réel : les 4 breakpoints (tableau des expéditions mobile, fiche détail), les deux
thèmes, reduced-motion, count-up des statistiques. jsdom ne fait pas de layout.

---

## 9. AVANCEMENT GLOBAL

**AVANCEMENT GLOBAL : 44 %**

Lots 00-09 validés ; **LOT 10 en attente de validation explicite** (11 lots sur 25).

---

## 10. STOP

LOT 10 **construit, inspecté, corrigé**. Je m'arrête et **j'attends votre validation
explicite** avant le LOT 11.
