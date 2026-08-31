# LOT 04 — Command Center + Notification Center · Rapport de validation

**Date :** 2026-08-30
**Branche :** `arena/01a04ab1-divini-3`
**Spécification :** `prompts/LOT-04-command-center-notification-center.md`
**Statut :** construit, inspecté, corrigé — **en attente de validation explicite**

> Format du socle commun §10 + les complots du LOT 04 §14 : liste des commandes,
> catégories actives, ce qui est relayé vers le LOT 14 sans être simulé,
> `AVANCEMENT GLOBAL`.

---

## 1. IMPLÉMENTÉ

### 1.1 Command Center (`components/command/`, overlay global)

Conforme au corpus l. 7932-7939 : overlay translucide + blur léger, panneau central
**560 px**, apparition `scale + translateY`, fermeture `Escape`, item actif
`--accent-soft` + liseré `--accent`.

**Sections de résultats** (§2.1.2) : Navigation (manifeste LOT 02 + écrans réels),
Entités (démo signalée), Actions, Analyse, Tâches.

**Filtrage progressif** tolérant aux fautes (substring, préfixe, Levenshtein ≤ 1-2,
sous-séquence), ordonné par pertinence, avec **surlignage** de la correspondance.

**Clavier intégral** : `↑↓`/`Home`/`End`, `Entrée`, `Escape`, `Tab` (piège + retour de
focus via `ui/focus`, non dupliqué) ; raccourci global `⌘K`/`Ctrl K` affiché en IBM
Plex Mono dans la topbar.

**Garde-fous** (§2.1.6) : une action sensible déclare sa permission et passe par
`ConfirmDialog` (ex. « Réinitialiser les préférences » → `system.settings`) ; un module
planifié / non activé est affiché comme tel, jamais exécutable ; l'historique des
dernières actions de la session est conservé.

### 1.2 Notification Center (`components/notifications/`)

- **Cloche** dans la topbar : compteur de non-lues, ouvre le **panneau** (Drawer LOT 01
  réutilisé) : non lues / toutes, filtre par catégorie, « tout marquer comme lu », lien
  vers l'historique.
- **Vue étendue** `/app/notifications` (N4) : branche la **DataTable du LOT 03** (tri,
  pagination, mode carte) + filtres catégorie / établissement / période + recherche.
- **Préférences** `/app/parametres/notifications` (N2) : par canal et par catégorie,
  persistées **localement**, états enregistrement / enregistré / erreur.
- **Toasts** : primitive LOT 01 réutilisée ; **empilement borné** (5) ajouté.
- **Portée** : le flux est filtré par la portée active (tenant ⇄ établissement, LOT 02).
- **Règle de destination** : chaque notification pointe vers une route réelle ; une
  destination morte est interdite et testée.

### 1.3 Routes créées

| Route | Écran |
|---|---|
| `/app/notifications` | Notification Center — vue étendue |
| `/app/parametres/notifications` | Préférences de notification |
| *(overlay global)* | Command Center + panneau de notifications |

---

## 2. VISIBLE MAINTENANT

HTML servi vérifié : `/app/notifications` (filtres + table + « flux local simulé »),
`/app/parametres/notifications` (canaux dont in-app actif, canaux réels « reportés »,
catégories, réinitialisation), `/app` (coquille). Cloche et déclencheur de recherche
présents dans la topbar. 0 id dupliqué.

---

## 3. MOCKÉ / NON CONNECTÉ

Flux de notifications **simulé localement et signalé** (ancre temporelle fixe, SSR
stable). Aucun paiement/vente réel, aucun envoi WhatsApp/SMS réel (seul in-app est
réel ; les autres canaux sont des réglages « reportés »). COPILOT / AUTOPILOT **non
simulés** (voir § relayé LOT 14).

---

## 4. TESTS EFFECTUÉS — 139/139 (124 antérieurs + 15 nouveaux)

`tests/command-notifications.test.mjs` (15) : cinq sections présentes ; normalisation ;
tolérance aux fautes (« factre », « stok ») ; surlignage ; garde-fous (actions métier
planifiées avec LOT + permission ; relais LOT 14) ; toute commande `navigate` a une route
réelle ; chaque notification a une destination réelle ; 12 catégories ; flux déterministe ;
préférences par défaut ; portée tenant ⇄ site ; « tout marquer comme lu ».

**Infrastructure de test** : le harnais ne pouvait pas importer `next/link` /
`next/navigation` (résolution webpack) ni les dossiers. Ajout de stubs
(`tests/helpers/stubs/`) et de la résolution d'index — le shell redevient testable sans
dupliquer React.

Contrôles : typecheck 0 · var() 0 suspendue · valeurs en dur 0 · contrastes 0 échec.

---

## 5. COMMANDES DISPONIBLES

| Section | Commandes réelles | Planifiées / relayées |
|---|---|---|
| Navigation | Accueil, Notifications, Préférences | tous les modules du manifeste (LOT n) |
| Actions | ouvrir le centre, configurer prefs, **réinitialiser prefs** (confirm) | nouvelle vente (6), dépense (9), relance (8), mouvement stock (7) |
| Entités | — (démo signalée) | client/produit/facture/commande/établissement (LOT n) |
| Analyse | — | 3 questions → COPILOT (LOT 14) |
| Tâches | — | 3 demandes → AUTOPILOT (LOT 14) |

---

## 6. CATÉGORIES DE NOTIFICATIONS ACTIVES

Les **12** du corpus sont présentes (filtres) : ventes · stock · mouvements · alertes ·
livraisons · anomalies · paiements · activité importante · campagnes · validations ·
abonnement · synchronisation. Le flux de démonstration en illustre une chacune, toutes à
destination réelle.

---

## 7. RELAYÉ VERS LE LOT 14 SANS ÊTRE SIMULÉ

- **COPILOT** (section Analyse) : les questions naturelles sont relayées, aucune réponse
  inventée.
- **AUTOPILOT** (section Tâches) : les demandes sont relayées, aucune tâche exécutée.
- Canal temps réel (websocket) et envois WhatsApp/SMS réels → backend / LOT 12.

---

## 8. ERREURS RENCONTRÉES

1. `useNotifications` appelé au niveau de la page (hors provider) → contenu isolé dans un
   composant rendu dans `<AppShell>`.
2. `--r-full` inexistant → `--r-max`.
3. `priority` de colonne attend `'high'|'normal'|'low'`, pas un nombre.
4. `noUncheckedIndexedAccess` dans Levenshtein → gardes `?? 0` / `charAt`.
5. Harnais : imports `next/*` et dossiers non résolus → stubs + résolution d'index.

---

## 9. RÉGRESSIONS

**Aucune.** 124 tests antérieurs inchangés (139 − 15 = 124). Le shell, désormais importé
via le Command Center, reste couvert par `shell.test.mjs` (31) grâce aux stubs.

---

## 10. NON VÉRIFIABLE ICI

Rendu réel : palette 560 px, blur, les 4 breakpoints, les deux thèmes, reduced-motion,
focus rendu au déclencheur en navigateur. jsdom ne fait pas de layout.

---

## 11. AVANCEMENT GLOBAL

**AVANCEMENT GLOBAL : 20 %**

Lots 00, 01, 02, 03 validés ; **LOT 04 en attente de validation explicite**. Le premier
écran métier arrive au LOT 05.

---

## 12. STOP

LOT 04 **construit, inspecté, corrigé**. Conformément au socle §11, je m'arrête et
**j'attends votre validation explicite** avant le LOT 05.
