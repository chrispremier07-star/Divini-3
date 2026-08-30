# LOT 05 — Cockpit · Rapport de validation

**Date :** 2026-08-30
**Branche :** `arena/01a04ab1-divini-3`
**Spécification :** `prompts/LOT-05-cockpit.md`
**Statut :** construit, inspecté, corrigé — **en attente de validation explicite**

> Format du socle commun §10 + complots du LOT 05 §14 : signaux et missions de
> démonstration, destinations réelles vs « en construction », `AVANCEMENT GLOBAL`.

---

## 1. IMPLÉMENTÉ

Le **premier écran métier** du produit, sur `/app`. Conforme au corpus l. 587-644 :
ce n'est **pas** une collection de KPI — on lit d'abord *À surveiller* puis *Bonnes
nouvelles*, *Que voulez-vous faire ?*, la *Mission du jour* (impact financier
**estimé**), la rangée de KPI et le graphique principal.

Composants créés (`components/cockpit/`) : `Cockpit`, `PinnableSection`, `SignalItem`
(WatchItem/GoodNewsItem), `MissionRow` (+ progression), sélecteur de période, mock
cohérent. Réutilisés (lots 01-04) : `KpiCard/KpiGrid`, `Chart`, `ProgressBar`,
`EmptyState/ErrorState/OfflineState/PermissionDenied/SkeletonBlock`, `Badge`, toasts,
et le **Command Center** pour « Demander à l'IA ».

- **Hiérarchie** : À surveiller → Mission → KPI → graphe, conservée sur mobile.
- **Mission du jour** : cocher met à jour la progression sans rechargement.
- **Épinglage** : préférence locale (`localStorage`), sections épinglées en premier.
- **Sélecteurs** : période (aujourd'hui/7 j/30 j) bornée ; portée lue du shell (LOT 02).
- **Cohérence (§10)** : le KPI « CA » est **la somme de la série affichée** pour la
  période — graphique et KPI ne peuvent pas se contredire (testé).
- **Honnêteté** : bandeau « données de démonstration » permanent ; impacts présentés
  comme estimations (`≈`) ; aucune réponse d'IA inventée.

Route `/app` = Cockpit ; galerie technique `/dev/cockpit` pour les états d'écran.

---

## 2. VISIBLE MAINTENANT

`/app` rend le Cockpit (bandeau démo, titre, sélecteurs ; le contenu se peuple côté
client après le chargement simulé). `/dev/cockpit` exerce les états. 0 id dupliqué.

---

## 3. MOCKÉ / NON CONNECTÉ

Signaux, missions, KPI et séries sont générés localement (LCG déterministe, SSR
stable) et signalés. Aucune donnée de source externe (V2.18). Les cartes vers des
modules non livrés affichent « en construction — LOT n », jamais un écran vide.

---

## 4. TESTS — 151/151 (139 antérieurs + 12 nouveaux)

`tests/cockpit.test.mjs` (12) : CA = somme de la série (3 périodes) ; granularité des
séries ; déterminisme ; signaux non opaques (cause + source) et actionnables (route ou
LOT) ; signaux bornés ; missions avec impact en estimation ; rendu prêt avec hiérarchie
et bandeau ; états vide/erreur/permission ; progression de mission mise à jour.

Contrôles : typecheck 0 · var() 0 · valeurs en dur 0 · contrastes 0 échec.

---

## 5. SIGNAUX & MISSIONS DE DÉMONSTRATION

**À surveiller** : risque de stock (3 réf.) · créance âgée 45 j · 5 dépenses à valider ·
opération inhabituelle (critique). **Bonnes nouvelles** : CA +12 % · 4 nouveaux clients ·
stock dormant −18 %.

**Missions** : relancer 8 clients (≈ +450 000 F) · commander 3 produits (≈ 250 000 F
protégés) · valider 5 dépenses (≈ 180 000 F).

---

## 6. DESTINATIONS DES CARTES D'ACTION

| Destination | Statut |
|---|---|
| `/app/notifications`, `/dev/data` | réelles |
| Stocks (LOT 7), CRM (LOT 8), Dépenses (LOT 9), Ventes (LOT 6), Alertes (LOT 15) | **en construction — LOT n** |

Le module **Cockpit** du manifeste passe `disponible` (route `/app`) : premier module
réellement livré ; le test « disponible ⇒ route réelle » le garantit.

---

## 7. RELAYÉ SANS SIMULATION

« Demander à l'IA » ouvre le **Command Center** (section Analyse) — COPILOT reste au
LOT 14, aucune réponse inventée. Exécution réelle des recommandations → LOT 14.

---

## 8. ERREURS RENCONTRÉES

1. `SkeletonBlock` attend `lines`, pas `height` ; `PermissionDenied` attend
   `resource/missingPermission/contact` ; `OfflineState` attend `lastSyncLabel`.
2. `'ready'` hors du type `CockpitState` → type runtime interne.
3. Le test shell « aucun module disponible » codait l'état LOT 02 → mis à jour
   (« disponible ⇒ route réelle », Cockpit disponible).

---

## 9. RÉGRESSIONS

**Aucune.** 139 tests antérieurs inchangés (151 − 12). Le shell couvre désormais le
premier module disponible.

---

## 10. NON VÉRIFIABLE ICI

Rendu réel : les 4 breakpoints, les deux thèmes, reduced-motion, count-up au viewport,
reveal ~1 300 ms. jsdom ne fait pas de layout.

---

## 11. AVANCEMENT GLOBAL

**AVANCEMENT GLOBAL : 24 %**

Lots 00-03 (+04) validés ; **LOT 05 en attente de validation explicite**.

---

## 12. STOP

LOT 05 **construit, inspecté, corrigé**. Je m'arrête et **j'attends votre validation
explicite** avant le LOT 06.
