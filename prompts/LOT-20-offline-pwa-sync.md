# LOT 20 — Offline, PWA & synchronisation (UI)

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 02 et LOT 06 (validés). **Débloque** : —
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire la **couche offline-first** visible du produit : statut de connexion, journal local
d'opérations, file de synchronisation, résolution de conflits, limite de 7 jours hors connexion,
installation PWA et reprise rapide.

L'offline est une fonctionnalité **stratégique** du produit (l. 2292–2296, 4540) : elle doit
être lisible en permanence, jamais implicite.

## 2. Périmètre

### 2.1 Statut de connexion

1. Indicateur permanent dans la topbar (livré au LOT 02, complété ici) :
   `en ligne · hors ligne · synchronisation en cours · conflit · erreur de synchronisation`.
2. Bandeau contextuel explicite lors du passage hors ligne, avec ce qui reste possible et ce qui
   ne l'est pas.
3. **Décompte des 7 jours** hors connexion, avec avertissements avant échéance et **blocage
   explicite** au-delà (l. 2313–2316).
4. Relances de réabonnement affichées **même hors connexion** (l. 4540).

### 2.2 Journal local d'opérations (l. 2317–2333)

Chaque opération offline expose :
`identifiant unique · timestamp · utilisateur · établissement · type d'opération ·
statut de synchronisation · version`
+ mécanisme **anti-duplication** visible.

Écran dédié : liste filtrable par statut, type, établissement, période ; détail d'une opération ;
retrait d'une opération non synchronisée (avec confirmation).

### 2.3 Synchronisation

1. **File de synchronisation** : en attente, en cours, réussie, échouée, en conflit.
2. **Déclenchement** : automatique au retour en ligne, manuel sur action explicite.
3. **Progression** : nombre d'opérations traitées / total, erreurs détaillées.
4. **Idempotence affichée** : une opération déjà synchronisée n'est jamais rejouée ; l'interface
   indique l'opération comme « déjà synchronisée » au lieu de la dupliquer.
5. **Résolution de conflits** : écran de comparaison (valeur locale / valeur distante,
   horodatage, acteur), choix explicite, trace de la décision.

### 2.4 PWA et raccourcis (l. 2701–2715, 3347–3356)

1. **Installation** : bouton d'installation, explication, état déjà installé.
2. **Raccourcis** : bureau et mobile, mode autonome.
3. **Reprise rapide** : restauration de la dernière position et du contexte (portée, module,
   filtres).
4. **Notifications push** : surface de consentement et de préférence ; l'envoi réel est reporté.
5. **États dégradés** : navigateur non compatible, installation refusée, stockage indisponible.

### 2.5 Exclu (reporté)

- Synchronisation réelle avec un serveur, idempotence côté serveur, résolution réelle de
  conflits → phase backend.
- Envoi réel de notifications push → backend.
- Chiffrement réel du stockage local → phase sécurité (le stockage local ne contient ici aucune
  donnée sensible).

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/synchronisation` | File et journal local | N2 |
| `/app/synchronisation/{operationId}` | Détail d'une opération | N2 |
| `/app/synchronisation/conflits` · `/{id}` | Résolution de conflits | N2 |
| `/app/parametres/application` | Installation PWA, raccourcis, reprise, push | N2 |
| *(bandeau global)* | Hors ligne + décompte 7 jours | N2 |

## 4. Composants concernés

**Créés** : ConnectionStatusBar, OfflineBanner, OfflineCountdown, OfflineCapabilityList,
OperationJournal, OperationRow, OperationDetail, SyncStatusBadge, DeduplicationNote,
SyncQueue, SyncProgress, SyncErrorList, ConflictList, ConflictCompareView, ConflictResolution,
ResolutionTrace, InstallPrompt, InstallStateBadge, ShortcutInstructions,
PushPermissionPanel, ResumeContextNotice, StorageUnavailableNotice.
**Réutilisés** : DataTable, DataPanel, Timeline, Badge, StatusDot, SeverityIndicator,
Progress, ProgressBar, Button, IconButton, Modal, Drawer, ConfirmDialog, EmptyState, Skeleton,
ErrorState, PermissionDenied.

## 5. UX

- **Toujours savoir où on en est** : le statut de connexion est permanent, jamais découvert par
  accident.
- **Savoir ce qui reste possible hors ligne** : la liste des capacités disponibles et
  indisponibles est explicite.
- **Ne jamais perdre une saisie** : chaque opération est journalisée localement avec son
  identifiant ; l'utilisateur peut la retrouver.
- **Comprendre un conflit** : la comparaison locale / distante est lisible, avec horodatage et
  acteur ; la décision est tracée.
- **Anticiper la limite** : le décompte des 7 jours avertit avant le blocage, puis explique
  pourquoi l'application exige une connexion.
- **Installer sans friction** : l'installation est proposée au bon moment, avec explication, et
  l'état « déjà installé » est reconnu.

## 6. Design — application stricte du Design System

- Bandeau hors ligne : `--panel` avec bordure ATTENTION `#F2A93B`, icône et texte — jamais un
  simple changement de couleur.
- Statut de synchronisation : badges sémantiques cohérents avec le reste du produit.
- Comparaison de conflit : deux colonnes nettes, différences mises en évidence par libellé
  **et** couleur, valeurs en **IBM Plex Mono**.
- Décompte 7 jours : sobre ; passage en CRITIQUE `#E0785F` à l'approche du blocage.
- Aucun effet décoratif sur les indicateurs de synchronisation.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Barre de statut | dans la topbar | idem | icône + libellé court | **icône seule** + détail en sheet |
| Bandeau offline | pleine largeur sous la topbar | idem | idem | compact, 2 lignes max |
| Journal | table complète | colonnes réduites | colonnes prioritaires | mode carte |
| Conflits | comparaison 2 colonnes | idem | empilé | empilé avec bascule locale / distante |
| Installation PWA | modale centrée | modale | modale | sheet |

## 8. Motion

- Apparition du bandeau offline : 220–320 ms.
- Progression de synchronisation : mise à jour sobre, 140–220 ms par incrément.
- Résolution d'un conflit : sortie discrète après décision.
- **Aucune animation en boucle** sur l'indicateur de synchronisation : une progression réelle ou
  un état statique, jamais une animation décorative continue.
- `prefers-reduced-motion` : transitions quasi instantanées.

## 9. États

- **Connexion** : en ligne, hors ligne, reconnexion en cours, instable.
- **Synchronisation** : à jour, en attente, en cours, réussie, échouée, partiellement échouée,
  conflit, opération déjà synchronisée (anti-duplication).
- **Journal** : vide, opérations locales, opération retirée, détail indisponible.
- **Limite 7 jours** : dans les délais, échéance proche (ATTENTION), dépassée (CRITIQUE,
  blocage), relance de réabonnement affichée hors ligne.
- **PWA** : installable, installé, non compatible, installation refusée, stockage indisponible.
- **Push** : non demandé, autorisé, refusé, non disponible.
- **Reprise** : contexte restauré, contexte expiré.

## 10. Données

Mockées et **signalées** :
- journal local d'opérations issu des saisies des lots 06, 07, 08 ;
- file de synchronisation simulée, avec cas de conflit de démonstration ;
- aucune donnée sensible dans le stockage local.

Aucune synchronisation réelle, aucun push réel.

## 11. Interdits spécifiques au lot

- Simuler une synchronisation réussie avec un serveur.
- Rejouer une opération déjà synchronisée.
- Stocker une donnée sensible dans le navigateur.
- Animer en boucle un indicateur de synchronisation.
- Bloquer sans expliquer, ou laisser passer la limite de 7 jours sans avertissement.
- Résoudre un conflit silencieusement, sans décision explicite.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 2292–2333, 2701–2715, 3347–3356, 4540), vérifier les indicateurs
  du LOT 02 et les saisies du LOT 06.
- **B** : annoncer fichiers, modèle du journal local, stratégie de test des conflits.
- **C** : construire statut, bandeau, journal, file, conflits, PWA, reprise.
- **D** : intégrer au shell (LOT 02) et aux saisies des modules livrés.
- **E** : tester coupure réseau simulée, saisie hors ligne, retour en ligne, anti-duplication,
  conflit et sa résolution, décompte 7 jours et blocage, installation PWA, reprise, les 4
  breakpoints, les deux thèmes, clavier, reduced-motion.
- **F** : corriger toute duplication, toute perte de saisie, tout état ambigu.
- **G** : valider lorsqu'aucune opération n'est perdue ni dupliquée et que chaque état de
  synchronisation est lisible.

## 13. Validation — checklist

- [ ] Les 5 statuts de connexion affichés en permanence.
- [ ] Bandeau hors ligne avec capacités disponibles / indisponibles.
- [ ] Décompte 7 jours, avertissements, blocage explicite au-delà.
- [ ] Relances de réabonnement affichées même hors ligne.
- [ ] Journal local avec les 7 champs canoniques + anti-duplication visible.
- [ ] File de synchronisation avec progression et erreurs détaillées.
- [ ] **Anti-duplication vérifiée** : une opération synchronisée n'est jamais rejouée.
- [ ] Conflits : comparaison lisible, décision explicite, décision tracée.
- [ ] Installation PWA, raccourcis, état déjà installé, non-compatibilité gérée.
- [ ] Reprise rapide du contexte.
- [ ] Surface de consentement push ; envoi réel explicitement reporté.
- [ ] Aucune donnée sensible stockée localement.
- [ ] Aucune animation en boucle sur les indicateurs.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 19.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la preuve de l'anti-duplication, les cas de conflit
testés, le comportement au-delà de 7 jours, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 21.
