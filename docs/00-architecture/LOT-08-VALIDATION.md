# LOT 08 — CRM · Rapport de validation

**Date :** 2026-08-30
**Branche :** `arena/01a04ab1-divini-3`
**Spécification :** `prompts/LOT-08-crm.md`
**Statut :** construit, inspecté, corrigé — **en attente de validation explicite**

> Format du socle §10 + complots §14 : statuts de consentement implémentés,
> manière dont l'immuabilité est rendue visible, `AVANCEMENT GLOBAL`.

---

## 1. IMPLÉMENTÉ

Module **CRM** complet, motif liste → détail → action réutilisé.

- **Clients** : liste (recherche nom / téléphone / email), fiche à onglets (profil,
  achats, activité, communication, consentements, fidélité), en-tête (avatar, segment,
  CA, points en mono), historique consolidé, création / modification.
- **Indicateurs clients** : total, nouveaux ce mois, actifs, fidèles, VIP, points en
  circulation, panier moyen, CA/client, LTV (mockée, signalée).
- **Segments** : créables, réutilisables comme cibles ; segment VIP à **règle
  configurable** affichée.
- **Prospects** : pipeline (Kanban), niveaux d'intérêt **1 à 5** explicites, sources,
  indicateurs (taux de conversion mocké signalé), conversion en client.
- **Relances** : scénarios (déclencheur → cible → action → fréquence), activables /
  désactivables, récurrents, programmables, audit visuel — **aucun envoi réel**.
- **Consentements** : statut par catégorie, source, méthode, date, preuve consultable,
  historique immuable, opt-out, do not contact, blocage global.
- **Page publique `/c/{token}`** : préférences de communication, sans donnée privée,
  tokens valide / expiré / révoqué gérés.

14 routes. Manifeste : **CRM → `disponible`** ; action Command Center « Créer une
relance » → `/app/relances`.

---

## 2. STATUTS DE CONSENTEMENT IMPLÉMENTÉS (§14)

`granted` (Accordé, SUCCESS) · `refused` (Refusé, CRITIQUE) · `withdrawn` (Retiré,
ATTENTION) · `expired` (Expiré, neutre) · **`unknown` (Inconnu, neutre)**.

Règle non négociable : **`isGranted` retourne `false` pour `unknown`** — un
consentement inconnu n'est jamais interprété comme accordé (corpus l. 1103, interdit
§11). Testé. Un consentement absent est également traité comme inconnu.

**Consentement ≠ autorisation d'envoi** : `canSendNow(client, catégorie)` est une
fonction distincte. Un consentement accordé n'autorise l'envoi que si le client n'est
pas en `doNotContact` ni en `globalBlock`. L'interface affiche les deux séparément
(« Envoi autorisé : oui/non » à côté du statut). Testé : un client en do-not-contact
avec un consentement accordé reste en envoi refusé.

---

## 3. IMMUABILITÉ RENDUE VISIBLE (§14)

- L'historique (`CONSENT_HISTORY`) est une liste d'événements **en ajout seul** :
  chaque modification **ajoute** un événement daté (acteur, motif, de → vers) et
  **n'efface ni n'écrase** les précédents.
- `buildConsentEvent` construit un nouvel événement **sans muter** l'historique
  existant — testé (longueur et ids inchangés après appel).
- Toute modification ouvre un `ConfirmDialog` qui explique explicitement : « cet acte
  est tracé : il crée un nouvel événement daté dans l'historique, sans effacer les
  précédents ». Aucune modification silencieuse.
- L'historique est affiché en timeline verticale avec la mention « Immuable — aucun
  événement n'est effacé ».

---

## 4. EXPLICITEMENT SIMULÉ

Création / modification de clients, prospects, segments, scénarios, consentements :
démonstration locale signalée, **aucune écriture réelle**. LTV et taux de conversion :
valeurs mockées **signalées** comme estimations, jamais des mesures réelles (interdit
§11). Règle VIP configurable, jamais codée en dur. Points de fidélité : solde de
démonstration (attribution réelle au LOT 10). Éligibilité WhatsApp, templates,
campagnes, envoi réel → LOT 12. Page publique : aucun consentement réel collecté.

---

## 5. TESTS — 204/204 (185 antérieurs + 19 nouveaux)

`tests/crm.test.mjs` (19) : inconnu ≠ accordé ; seul `granted` vaut accord ; absent =
inconnu ; consentement ≠ envoi (accordé sans blocage = oui ; inconnu = non ;
do-not-contact bloque malgré accord) ; immuabilité (modification crée un événement sans
muter l'historique) ; historique trié ; règle VIP par défaut + configurable ; cohérence
achats ⇄ ventes LOT 06 ; indicateurs clients/prospects ; tokens valide/expiré/révoqué/
inconnu ; rendus liste clients, pipeline prospects, panneau consentements.

Contrôles : typecheck 0 · var() 0 · valeurs en dur 0 · contrastes 0.

---

## 6. ERREURS RENCONTRÉES

1. Environnement re-provisionné en début de tour : dépôt local réinitialisé au commit
   de base, `node_modules` effacé. Récupéré via `git fetch` de la branche + `reset
   --mixed` (working tree intact) et `npm ci` + `npm run tokens`. Refspec de fetch
   ajouté pour `arena/01a04ab1-divini-3`.
2. `public.ts` contenait du JSX → renommé `public.tsx`.
3. Apostrophe dans une chaîne (`l'historique`) → apostrophe typographique.
4. `npx tsc` téléchargeait un paquet fantôme → runner du projet (`npm run typecheck`).

---

## 7. RÉGRESSIONS

**Aucune.** 185 tests antérieurs inchangés (204 − 19).

---

## 8. NON VÉRIFIABLE ICI

Rendu réel : les 4 breakpoints (consentements en carte par catégorie sous 720 px,
pipeline empilé), les deux thèmes, reduced-motion (count-up, underline onglets),
drag-over du pipeline. jsdom ne fait pas de layout.

---

## 9. AVANCEMENT GLOBAL

**AVANCEMENT GLOBAL : 36 %**

Lots 00-07 validés ; **LOT 08 en attente de validation explicite**.

---

## 10. STOP

LOT 08 **construit, inspecté, corrigé**. Je m'arrête et **j'attends votre validation
explicite** avant le LOT 09.
