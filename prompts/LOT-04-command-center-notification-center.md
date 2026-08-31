# LOT 04 — Command Center + Notification Center

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 02 et LOT 03 (validés). **Débloque** : LOT 05, LOT 13.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire la **couche transversale** du produit : le **Command Center** (command palette) qui
supprime la navigation pour les tâches fréquentes, et le **Notification Center** qui rend
l'application proactive.

Ce sont les deux surfaces qui incarnent la promesse « zéro formation » (l. 2111–2130, II.2) :
l'utilisateur exprime une intention, le système l'amène à bon port.

## 2. Périmètre

### 2.1 Inclus — Command Center

1. Overlay conforme au corpus (l. 7932–7939) : fond translucide, blur léger, panneau central
   **~560 px**, apparition `scale + translateY`, fermeture par `Escape`, item actif
   `--accent-soft` / `--accent`.
2. **Sections de résultats** :
   - **Navigation** — modules et écrans du manifeste LOT 02 ;
   - **Entités** — clients, produits, factures, commandes, établissements (recherche sur les
     données mockées locales) ;
   - **Actions** — « Nouvelle vente », « Enregistrer une dépense », « Créer une relance »,
     « Nouveau mouvement de stock »… ;
   - **Analyse** — questions naturelles relayées vers COPILOT (état « LOT 14 » explicite tant
     que l'agent n'existe pas) ;
   - **Tâches** — demandes formulées en langage naturel relayées vers AUTOPILOT (idem).
3. **Filtrage progressif** : tolérant aux fautes de frappe, ordonné par pertinence, avec
   surlignage de la correspondance.
4. **Navigation clavier complète** : flèches, `Entrée`, `Escape`, `Tab` ; raccourci global
   d'ouverture affiché en IBM Plex Mono dans la topbar.
5. **Actions rapides** et **historique des dernières actions** de la session.
6. **Garde-fous** : une action sensible affiche sa permission requise et passe par
   `ConfirmDialog` ; un module non activé ou une entrée `planifié` est affichée comme telle,
   jamais comme une action disponible.

### 2.2 Inclus — Notification Center

1. **Panneau** accessible depuis la cloche de la topbar : liste, catégories, non lues / lues,
   filtres, « tout marquer comme lu ».
2. **Vue étendue** `/app/notifications` : historique complet, filtres par catégorie, par
   établissement, par période, recherche.
3. **Catégories** : ventes · stock · mouvements · alertes · livraisons · anomalies · paiements ·
   activité importante · campagnes · validations · abonnement · synchronisation.
4. **Préférences de notification** : par canal (in-app, email, push, WhatsApp, SMS), par
   catégorie, par établissement — écran dédié.
5. **Toasts** pour l'immédiat : cycle de vie complet (apparition, durée, progress bar, action,
   fermeture, empilement, limite d'empilement).
6. **Règle de destination** : chaque notification pointe vers un écran réel et actionnable.
   Une notification sans destination réelle est **interdite**.
7. **Portée** : le tenant central voit les événements de ses établissements **selon ses
   permissions** ; un utilisateur d'établissement ne voit que les siens.

### 2.3 Exclu (reporté)

- COPILOT / AUTOPILOT réels → **LOT 14** (le Command Center prépare l'entrée, ne simule pas
  l'agent).
- Le canal temps réel réel (websocket) → phase backend. Ici : flux local simulé, **signalé**.
- Toute notification WhatsApp ou SMS réelle → **LOT 12** / backend.

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/notifications` | Notification Center — vue étendue | N4 |
| `/app/parametres/notifications` | Préférences de notification | N2 |
| *(overlay global)* | Command Center | N1–N4 |
| *(overlay global)* | Toasts | N4 |

## 4. Composants concernés

**Créés** : CommandCenter, CommandInput, CommandSection, CommandItem, CommandEmpty,
CommandFooter, QuickActions, NotificationCenter, NotificationPanel, NotificationItem,
NotificationFilters, NotificationPreferences, ToastStack, Toast.
**Réutilisés** : Modal/overlay base LOT 01, Toast primitif LOT 01, Search, Switch, Checkbox,
Select, Badge, StatusDot, Avatar, EmptyState, Skeleton, ErrorState, ConfirmDialog, DataTable
(pour la vue étendue).

## 5. UX

- **Command Center** : ouvert par raccourci ou clic sur la recherche ; l'utilisateur tape deux
  ou trois lettres et voit déjà des résultats utiles ; `Entrée` exécute, `Escape` referme, le
  focus revient à l'élément déclencheur.
- **Intention → action** : « je veux créer une facture » doit mener au bon processus sans que
  l'utilisateur connaisse l'arborescence (l. 3773).
- **Notification Center** : la cloche indique le nombre de non lues ; le panneau s'ouvre sans
  quitter la page ; chaque item montre sa gravité, sa portée, son horodatage et son action.
- **Toasts** : réservés à l'immédiat et au transient ; tout ce qui doit être retrouvé plus tard
  vit dans le Notification Center, jamais uniquement en toast.
- **Honnêteté** : les notifications de démonstration sont identifiées comme telles ; aucune ne
  prétend provenir d'un établissement réel ni d'un paiement réel.

## 6. Design — application stricte du Design System

- Command palette : panneau ~560 px centré, `--panel`, bordure `--border`, rayon 12–14 px,
  overlay translucide + blur léger, item actif `--accent-soft` + `--accent`, section en
  `--muted`.
- Notification item : `--panel`, bordure fine, pastille sémantique, icône linéaire, non lu
  marqué par un poids de texte et une pastille — **pas par une couleur criarde**.
- Toast : `--panel`, border, shadow douce, progress bar fine `--accent`, icône sémantique.
- Gravité : INFO `#4FC7B9`, SUCCESS `#6FCF97`, ATTENTION `#F2A93B`, CRITIQUE `#E0785F` —
  toujours accompagnée d'une icône et d'un texte.
- Aucune animation décorative permanente sur la cloche ou la palette.

## 7. Responsive

| Surface | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Command Center | panneau 560 px centré | 560 px | pleine largeur moins marges | **sheet plein écran** |
| Notification Panel | panneau latéral droit | panneau latéral | sheet | **sheet plein écran** |
| `/app/notifications` | DataTable complète | colonnes réduites | colonnes prioritaires | mode carte |
| Toasts | bas droite, empilés | bas droite | bas, pleine largeur | bas, pleine largeur |
| Préférences | 2 colonnes | 2 colonnes | 1 colonne | 1 colonne |

Le clavier reste utilisable sur desktop et tablette ; sur mobile, la palette devient un sheet
avec champ de saisie visible au-dessus du clavier système.

## 8. Motion

- Ouverture de la palette : `scale + translateY`, 220–320 ms, easing canonique ; fermeture plus
  rapide.
- Apparition des résultats : légère transition de fondu, **sans décalage en cascade** qui
  retarderait la lecture.
- Toast : entrée depuis la droite 220 ms, sortie vers la droite 220 ms, progress bar linéaire
  sur la durée de vie.
- Panneau de notifications : 320 ms depuis la droite.
- Aucun bounce, aucune rotation, aucune pulsation permanente sur la cloche (une pulsation
  brève est autorisée à l'arrivée d'une notification critique, une seule fois).
- `prefers-reduced-motion` : overlays affichés directement, pas de translation.

## 9. États

- **CommandCenter** : fermé, ouvert, vide initial (suggestions), en cours de filtrage, résultat,
  aucun résultat (CommandEmpty utile), action en cours, action nécessitant confirmation,
  permission refusée, module non activé, entrée planifiée.
- **NotificationItem** : non lu, lu, hover, focus-visible, sélectionné, chargement de
  destination, destination indisponible, critique.
- **NotificationPanel** : chargement (skeleton), vide (EmptyState utile), erreur, offline
  (notifications non synchronisées), syncing.
- **Toast** : info, success, warning, critical, avec action, sans action, en cours de fermeture,
  empilé.
- **Préférences** : default, modification, enregistrement, enregistré, erreur, permission
  refusée.

## 10. Données

Mockées et **signalées** :
- index de recherche local (modules du manifeste + entités de démonstration) ;
- flux de notifications simulé, généré localement, horodaté de façon plausible ;
- préférences de notification persistées **localement** (aucun stockage critique non sécurisé,
  aucune donnée sensible).

Aucune notification ne simule un paiement réel, une vente réelle ou un envoi WhatsApp réel.

## 11. Interdits spécifiques au lot

- Simuler COPILOT ou AUTOPILOT (réponses inventées, analyses fictives).
- Créer une notification sans destination réelle.
- Ouvrir un canal réel (email, push, WhatsApp, SMS).
- Persister des données sensibles dans le navigateur.
- Faire de la cloche un élément animé en permanence.
- Afficher une action sensible sans sa confirmation.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 7932–7939, 2031–2052, 3166–3183, 3294–3312), vérifier le
  manifeste LOT 02 et le Toast LOT 01 (non-duplication).
- **B** : annoncer fichiers, structure de l'index de recherche, contrat des notifications.
- **C** : construire la palette, le centre de notifications, les toasts, les préférences.
- **D** : brancher la recherche de la topbar (LOT 02) et la vue étendue sur DataTable (LOT 03).
- **E** : tester clavier intégral, filtrage, empilement des toasts, filtres, préférences, les 4
  breakpoints, les deux thèmes, reduced-motion, focus rendu au déclencheur.
- **F** : corriger focus perdus, empilements infinis, destinations mortes, overflow.
- **G** : valider lorsque chaque résultat et chaque notification mène à un écran réel.

## 13. Validation — checklist

- [ ] Command palette : ~560 px, overlay translucide + blur, apparition `scale + translateY`,
      `Escape` ferme, item actif `--accent-soft` / `--accent`.
- [ ] Sections Navigation / Entités / Actions / Analyse / Tâches présentes.
- [ ] Navigation clavier complète ; raccourci affiché en mono ; focus rendu au déclencheur.
- [ ] Filtrage progressif tolérant aux fautes, avec surlignage.
- [ ] États « planifié » et « non activé » explicites ; aucune action fictive.
- [ ] Actions sensibles → `ConfirmDialog` + permission affichée.
- [ ] Notification Center : panneau + vue étendue `/app/notifications` + préférences.
- [ ] Toutes les catégories du §2.2 présentes ; portée respectée selon le rôle simulé.
- [ ] Chaque notification a une destination réelle et actionnable.
- [ ] Toasts : entrée/sortie à droite, progress bar, icône sémantique, empilement borné.
- [ ] États du §9 couverts, y compris offline / syncing / permission denied.
- [ ] Notifications de démonstration identifiées comme telles.
- [ ] Les 4 breakpoints conformes ; les deux thèmes ; `prefers-reduced-motion` respecté.
- [ ] Aucune régression sur LOT 00, 01, 02, 03.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la liste des commandes disponibles, la liste des
catégories de notifications actives, ce qui est explicitement **relayé vers le LOT 14** sans
être simulé, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 05.
