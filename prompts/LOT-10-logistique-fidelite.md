# LOT 10 — Logistique & Fidélité

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 06 et LOT 08 (validés). **Débloque** : —
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire deux modules opérationnels complémentaires : **Livraisons** (suivre et mesurer la
livraison) et **Fidélité** (récompenser et retenir).

Les deux reposent sur des données déjà livrées : une livraison part d'une commande (LOT 06),
des points sont attribués à un client (LOT 08) à partir d'un paiement (LOT 06).

## 2. Périmètre

### 2.1 Inclus — Livraisons (l. 1842–1879)

1. **Expéditions** : liste, fiche, création depuis une commande, affectation d'un livreur,
   changement de statut, reprogrammation, annulation.
2. **Statuts canoniques** : `préparation · à expédier · en cours · en livraison · échouée ·
   reprogrammée · livrée · annulée`.
3. **Livreurs** : liste, fiche, zones desservies, charge du jour, performance.
4. **Zones & tarifs** : référentiel de zones, tarif par zone, durée estimée — **référentiel
   extensible** : ne jamais figer une liste fermée de zones d'Abidjan (l. 1876).
5. **Étiquettes** : aperçu et génération visuelle de l'étiquette.
6. **Statistiques** : taux de réussite, retards, annulations, **CA perdu**, performance par
   livreur, **motifs d'échec**.

### 2.2 Inclus — Fidélité (l. 1880–1925)

1. **Programme** : points, récompenses, niveaux, tags, expiration, statistiques.
2. **Presets configurables** :
   - Standard : 10 points + 1 point / 1 000 FCFA
   - Généreux : 20 points + 1 point / 500 FCFA
   - Économique : 5 points + 1 point / 2 000 FCFA
   Les valeurs restent **configurables** et affichées comme telles.
3. **Règles d'attribution** — deux modes minimum :
   - **au prorata du paiement** ;
   - **après paiement complet**.
4. **Exclusions** : les frais de livraison ne génèrent pas de points lorsque la règle applicable
   l'exclut — règle visible et configurable.
5. **Corrections** : une annulation entraîne les corrections nécessaires, visibles et tracées.
6. **Historique** : toute opération de points est historisée et consultable depuis la fiche
   client.

### 2.3 Exclu (reporté)

- Envoi réel de notifications de livraison → backend.
- Géolocalisation temps réel des livreurs → non prévue à ce stade.
- Relances de fidélité par WhatsApp → **LOT 12**.
- Impact réel d'une vente sur les points → cohérence mockée signalée.

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/livraisons` · `/{id}` · `/nouveau` | Expéditions | N1 |
| `/app/livraisons/livreurs` · `/{id}` | Livreurs | N1 |
| `/app/livraisons/zones` | Zones & tarifs | N1 |
| `/app/livraisons/statistiques` | Analytics logistique | N3 |
| `/app/fidelite` | Programme & statistiques | N1 |
| `/app/fidelite/regles` | Règles d'attribution et exclusions | N2 |
| `/app/fidelite/historique` | Historique des opérations de points | N1 |

## 4. Composants concernés

**Créés** : DeliveryBoard, DeliveryCard, DeliveryStatusBadge, DeliveryTimeline, CourierList,
CourierCard, CourierLoadBar, ZoneTable, ZoneForm, RateEditor, LabelPreview,
DeliveryStatsPanel, FailureReasonChart, LoyaltyOverview, LevelProgress, RewardList,
PointsLedger, PointsExpiryPanel, AttributionModeSelector, ExclusionRuleToggle,
PointsCorrectionDialog.
**Réutilisés** : DataTable, KpiCard, KpiGrid, Chart, DataPanel, Timeline, ActivityFeed,
Kanban (statuts), Progress, ProgressBar, Badge, StatusDot, SeverityIndicator, Avatar, Button,
Search, Select, Input, Switch, Radio, Modal, Drawer, ConfirmDialog, EmptyState, Skeleton,
ErrorState, PermissionDenied, OfflineState.

## 5. UX

- **Suivre une livraison en un coup d'œil** : statut actuel, livreur, zone, heure estimée,
  dernier événement.
- **Comprendre un échec** : le motif est obligatoire et exploitable ; il alimente les
  statistiques, jamais une case vide.
- **Mesurer le coût réel** : le **CA perdu** est affiché explicitement, car c'est la donnée qui
  fait agir.
- **Programme de fidélité lisible** : le client et le gérant comprennent comment les points sont
  gagnés, quand ils expirent, ce qu'ils valent.
- **Attribution sans surprise** : le mode d'attribution (prorata / paiement complet) est affiché
  sur chaque opération de points.
- **Correction tracée** : une annulation produit une opération de correction visible, jamais une
  disparition silencieuse de points.

## 6. Design — application stricte du Design System

- Statuts de livraison : badges sémantiques cohérents (préparation = neutre, en cours = INFO,
  échouée = CRITIQUE, reprogrammée = ATTENTION, livrée = SUCCESS, annulée = neutre barré).
- Timeline de livraison : verticale, dense mais aérée, horodatage en mono.
- Étiquette : surface lisible, typographie structurée, code de référence en mono,
  **aucune décoration**.
- Fidélité : progression de niveau en `Progress`, points en **IBM Plex Mono**, expiration
  signalée en ATTENTION avant échéance.
- Graphique des motifs d'échec : couleurs sémantiques, légende compacte.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Expéditions | kanban par statut ou table | table | table condensée | **mode carte** |
| Fiche livraison | 2 colonnes + timeline | 2 colonnes | 1 colonne | 1 colonne |
| Livreurs | grille de cartes | grille 2 col. | 2 col. | 1 colonne |
| Zones & tarifs | table éditable | table | table condensée | mode carte |
| Statistiques | graphiques côte à côte | 2 colonnes | 1 colonne | 1 colonne |
| Fidélité | synthèse + ledger | 2 colonnes | 1 colonne | 1 colonne |
| Étiquette | aperçu en modale | modale | pleine largeur | plein écran |

## 8. Motion

- Changement de statut : transition d'état 220–320 ms, déplacement de carte discret si vue
  kanban.
- Apparition de la timeline : reveal 700 ms, une seule fois.
- Count-up des statistiques : 1 100–1 200 ms.
- Progression de niveau de fidélité : transition 220–320 ms, **sans célébration**.
- Reveal des graphiques : tracé progressif.
- Aucune animation en boucle ; aucune pulsation permanente sur un statut.
- `prefers-reduced-motion` : transitions quasi instantanées.

## 9. États

- **Expédition** : chaque statut canonique, plus loading, introuvable, erreur, permission
  denied, offline, syncing, adresse incomplète, livreur non affecté, reprogrammation en attente.
- **Livreur** : actif, inactif, charge complète (ATTENTION), hors service.
- **Zones** : liste vide, zone sans tarif (avertissement), tarif en édition, doublon détecté.
- **Étiquette** : aperçu, génération, échec, données manquantes.
- **Statistiques** : période sans données (message explicite), chargement, erreur.
- **Fidélité** : programme non configuré, points à expiration proche, points expirés,
  correction en attente, règle d'exclusion active, permission denied.

## 10. Données

Mockées et **signalées** :
- expéditions rattachées aux commandes du LOT 06, statuts variés, motifs d'échec réalistes ;
- livreurs et zones de démonstration (référentiel **extensible**, non figé) ;
- opérations de points cohérentes avec les paiements du LOT 06 et les clients du LOT 08, avec
  mode d'attribution affiché ;
- statistiques calculées localement à partir de ces données.

Aucune donnée réelle, aucun livreur réel, aucune géolocalisation.

## 11. Interdits spécifiques au lot

- Figer une liste fermée de zones (l. 1876).
- Accepter un échec de livraison sans motif.
- Attribuer des points sur les frais de livraison quand la règle l'exclut.
- Supprimer silencieusement des points lors d'une annulation.
- Coder en dur les presets de fidélité (ils doivent rester configurables).
- Simuler une notification ou un suivi temps réel réel.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 1842–1925), vérifier les commandes du LOT 06, les clients et
  paiements des lots 06 et 08.
- **B** : annoncer fichiers, statuts et transitions, règles d'attribution, stratégie de test.
- **C** : construire livraisons (expéditions, livreurs, zones, étiquettes, statistiques) puis
  fidélité (programme, règles, ledger, historique).
- **D** : intégrer au shell, au Command Center, aux cartes d'action du Cockpit, à la fiche client
  (LOT 08).
- **E** : tester cycle de vie complet d'une expédition, motifs d'échec, statistiques, modes
  d'attribution, exclusion des frais de livraison, correction après annulation, les 4
  breakpoints, les deux thèmes, clavier, reduced-motion.
- **F** : corriger incohérences de points, statuts manquants, overflow, focus.
- **G** : valider lorsque les statuts sont complets et que chaque opération de points est
  explicable.

## 13. Validation — checklist

- [ ] Les 8 statuts de livraison canoniques présents et correctement sémantisés.
- [ ] Expéditions : liste, fiche, création depuis commande, affectation, reprogrammation,
      annulation.
- [ ] Livreurs : liste, fiche, charge, performance.
- [ ] Zones & tarifs **extensibles**, aucun référentiel figé.
- [ ] Étiquettes : aperçu et génération visuelle.
- [ ] Statistiques : taux de réussite, retards, annulations, **CA perdu**, performance,
      motifs d'échec.
- [ ] Motif d'échec obligatoire.
- [ ] Fidélité : points, récompenses, niveaux, tags, expiration, statistiques.
- [ ] Presets Standard / Généreux / Économique présents et **configurables**.
- [ ] Deux modes d'attribution minimum, affichés sur chaque opération.
- [ ] Exclusion des frais de livraison configurable et visible.
- [ ] Correction de points après annulation, visible et tracée.
- [ ] Historique des opérations accessible depuis la fiche client.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 09.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : les transitions de statut implémentées, les règles
d'attribution et d'exclusion appliquées, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 11.
