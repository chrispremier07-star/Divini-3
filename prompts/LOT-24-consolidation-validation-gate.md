# LOT 24 — Consolidation & Frontend Validation Gate

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : **TOUS** les lots (00 → 23) validés. **Débloque** : passage à la phase backend.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Faire passer l'ensemble du frontend par la **Frontend Validation Gate** : aucun passage au
backend n'est autorisé tant que cette gate n'est pas passée et **explicitement validée**
(mission §11, corpus l. 8500–8530).

Ce lot ne construit pas de nouvelle fonctionnalité. Il **consolide, vérifie, corrige et
prouve**.

## 2. Périmètre

### 2.1 Consolidation transversale

1. **Cohérence inter-modules** : mêmes composants, mêmes états, mêmes libellés, mêmes formats
   de date, de montant et de numéro partout.
2. **Cohérence des données mockées** : un même client, produit, vente ou montant est identique
   dans tous les modules où il apparaît.
3. **Navigation complète** : aucune route morte, aucun lien sans destination réelle, aucun
   breadcrumb incorrect, toutes les entrées du manifeste aboutissent.
4. **Command Center** : toutes les commandes pointent vers des écrans ou des actions réels.
5. **Notification Center** : toutes les notifications ont une destination réelle.
6. **i18n** : aucun texte codé en dur hors du catalogue de traduction ; fr-FR complet ;
   architecture prête pour une seconde langue.
7. **Performance UI** : aucun rechargement complet, aucun clignotement, aucun loader inutile,
   aucune requête redondante, virtualisation effective sur les gros volumes (l. 3253–3274).
8. **Non-régression** : rejeu des parcours clés des lots 05 à 23.

### 2.2 Accessibilité — vérification exhaustive

- Contraste sur les **deux thèmes**, y compris `--muted` sur `--panel-2`.
- `focus-visible` visible sur **tout** élément interactif ; aucun focus piégé ou perdu.
- Navigation **clavier intégrale** : sidebar, tabs, tables, modales, drawers, Command Center,
  éditeurs, calendrier, kanban.
- Labels explicites sur tous les champs ; ARIA correct ; rôles cohérents.
- **Couleur jamais seule** : chaque statut sémantique a icône et/ou texte.
- `prefers-reduced-motion` respecté partout, **sans perte d'information**.
- Ordre de tabulation logique ; cibles tactiles suffisantes.

### 2.3 Frontend Validation Gate — les 7 familles

| Famille | Vérifications |
|---|---|
| **DESIGN** | conformité au Design System canonique · hiérarchie · densité · respiration · couleurs · typographies (Space Grotesk / Inter / IBM Plex Mono) · sidebar conforme · topbar conforme · tabs conformes · responsive |
| **UX** | navigation · compréhension · parcours complets · actions réelles · feedback · cohérence · empty states utiles · confirmations sur opérations critiques |
| **UI** | composants · **15 états visuels** · formulaires · tables · graphiques · notifications · modales et drawers · erreurs non techniques · loading |
| **MOTION** | transitions · micro-interactions · count-up KPI · reveal charts · navigation · notifications · durées dans les fourchettes canoniques · les 5 agents animés sur la landing |
| **ACCESSIBILITÉ** | contraste · focus · clavier · labels · reduced motion · couleur non utilisée seule |
| **QUALITÉ** | aucun écran cassé · aucun écran vide injustifié · aucun overflow · aucun composant incohérent · aucun placeholder non assumé · **aucun faux bouton** · aucune régression |
| **VÉRITÉ** | toute donnée mockée signalée · aucune API simulée présentée comme réelle · aucune authentification simulée présentée comme sécurisée · aucune permission présentée comme appliquée · aucun paiement simulé comme réel · aucun tarif ou quota de plateforme inventé |

### 2.4 Checklist canonique du corpus (l. 8500–8530)

À cocher intégralement :

```
[ ] Master Prompt original intact
[ ] Aucune fonctionnalité supprimée
[ ] Aucun module supprimé
[ ] Aucun workflow modifié
[ ] Aucun rôle ou permission modifié
[ ] Aucun calcul modifié
[ ] Aucun contenu de source de référence visuelle importé comme donnée réelle
[ ] Design System appliqué
[ ] Palette respectée
[ ] Typographies respectées
[ ] Sidebar conforme
[ ] Topbar conforme
[ ] Tabs conformes
[ ] KPI animés
[ ] Charts cohérents
[ ] Tables cohérentes
[ ] Badges cohérents
[ ] Command palette cohérente
[ ] Toasts cohérents
[ ] Responsive cohérent
[ ] Reduced motion conforme
[ ] Hero motion conforme
[ ] Scroll reveal conforme
[ ] Sticky showcase conforme
[ ] Les 5 agents sont animés
[ ] COPILOT motion conservée
[ ] AUTOPILOT motion conservée
[ ] RADAR motion conservée
[ ] CASH VISION motion conservée
[ ] GUARDIAN motion conservée
```

### 2.5 Exclu

- Toute correction fonctionnelle majeure : si la gate révèle un défaut structurel, il est
  **signalé et traité dans le lot concerné**, pas bricolé ici.
- Tout début de backend, d'API, de base de données, d'authentification ou de sécurité.

## 3. Écrans concernés

**Tous.** Parcours clés à rejouer obligatoirement :

| # | Parcours | Lots traversés |
|---|---|---|
| P1 | Landing → tarifs → inscription → onboarding 10 étapes → Cockpit | 22, 19, 02, 05 |
| P2 | Cockpit → nouvelle vente → encaissement → reçu → historique | 05, 06, 17 |
| P3 | Création d'établissement → supplément → attente de validation → console | 18, 21 |
| P4 | Risque de stock → signal → analyse → commande d'achat → réception | 14, 07, 11 |
| P5 | Impayés → relances → éligibilité → aperçu → validation | 05, 14, 12 |
| P6 | Campagne → audience → exclusions → coût estimé → approbation | 12 |
| P7 | Baisse de CA → analyse → données utilisées → recommandations → aperçu | 14 |
| P8 | Trésorerie → projection → bascule → scénario → décision | 09, 14 |
| P9 | Dépense → justificatif → approbation → paiement → comptabilisation | 09 |
| P10 | Commande → préparation → livreur → statuts → statistiques | 10 |
| P11 | Coupure réseau → saisies → journal → retour → synchronisation → conflit | 20 |
| P12 | Console → validation → module → réactivation → reçu | 21 |
| P13 | Consentement client → préférences → preuve → historique | 08 |
| P14 | Fin d'essai → suspension → réabonnement → réactivation | 19, 21 |

## 4. Composants concernés

Aucun composant nouveau. **Audit de tous les composants existants** : usage effectif,
duplication éventuelle à fusionner, props incohérentes à harmoniser, états manquants à ajouter.

## 5. UX · Design · Responsive · Motion · États — vérifiés, pas construits

Ce lot ne crée **aucune interface nouvelle**. Les cinq dimensions du format de lot sont donc
traitées en **vérification**, pas en construction :

| Dimension | Ce qui est vérifié | Où |
|---|---|---|
| **UX** | les 14 parcours se déroulent sans rupture ; chaque action produit un feedback ; les empty states sont utiles ; les opérations critiques sont confirmées | §3, §2.3 (famille UX) |
| **Design** | conformité au Design System canonique sur tous les écrans : palette, typographies, rayons, sidebar, topbar, tabs, densité, respiration | §2.3 (famille DESIGN), §2.4 |
| **Responsive** | matrice écran × breakpoint (4 paliers) sans overflow ni perte de fonctionnalité | §7 (livrable 2) |
| **Motion** | durées dans les fourchettes canoniques, easing unique, aucun mouvement sans information, les 5 agents animés avec leur identité propre | §2.3 (famille MOTION) |
| **États** | matrice composant × état : les **15 états visuels** obligatoires couverts partout où ils s'appliquent | §7 (livrable 1) |

Aucun de ces points n'est « corrigé en place » par un contournement visuel : un défaut
structurel est renvoyé au lot qui en est responsable (§2.5).

## 6. Méthode d'exécution

- **A ANALYSER** : inventorier écrans, composants, routes, états ; lister les incohérences.
- **B PLANIFIER** : prioriser les corrections par gravité (bloquant / majeur / mineur).
- **C CONSTRUIRE** : corriger réellement, sans contournement visuel.
- **D INTÉGRER** : re-vérifier après chaque correction.
- **E TESTER** : rejeu des 14 parcours, accessibilité, performance, les 4 breakpoints, les deux
  thèmes, reduced-motion.
- **F CORRIGER** : traiter chaque défaut constaté, puis re-tester.
- **G VALIDER** : produire le rapport de gate. **La gate n'est pas un auto-accord** : elle est
  soumise à validation explicite du donneur d'ordre.

## 7. Livrables de la gate

1. **Matrice de couverture des états** : composant × état, avec statut couvert / non couvert.
2. **Matrice responsive** : écran × breakpoint, avec anomalies relevées et corrigées.
3. **Rapport d'accessibilité** : contraste, clavier, focus, ARIA, reduced motion.
4. **Rapport de vérité** : inventaire complet de ce qui est mocké, où, et comment c'est signalé.
5. **Rapport de non-régression** sur les 14 parcours.
6. **Liste des anomalies restantes**, avec gravité et lot de rattachement.
7. **Checklist canonique** du corpus, cochée ligne à ligne.
8. **Recommandation** : gate **passée** ou **non passée**, avec motifs.

## 8. Critères de blocage (gate non passée si…)

- un écran est cassé, vide sans justification, ou en overflow ;
- un bouton ne correspond à aucune fonction réelle ;
- une donnée mockée est présentée comme réelle ;
- une permission, une authentification ou une sécurité est présentée comme effective ;
- un tarif, quota ou règle de plateforme externe est inventé ;
- un état visuel obligatoire manque sur un composant central ;
- la navigation clavier est impossible sur un écran majeur ;
- la couleur est le seul vecteur d'un statut ;
- `prefers-reduced-motion` fait perdre une information ;
- une régression non corrigée est détectée ;
- les 5 agents de la landing ne sont pas animés avec leur identité propre.

## 9. Rapport attendu

Format du socle commun §10, avec en plus les **8 livrables** du §7, et :

```
AVANCEMENT GLOBAL : XX %
FRONTEND VALIDATION GATE : PASSÉE / NON PASSÉE
```

Le pourcentage doit refléter l'état réel : la fin de la phase frontend ne vaut **pas** 100 % du
projet, puisqu'il reste les fonctionnalités réelles, le backend, la sécurité, l'intégration, les
tests et l'audit final.

## 10. STOP

Après ce lot : **s'arrêter**.

Le passage à la phase backend n'est autorisé **que** si :
1. la gate est passée ;
2. le donneur d'ordre l'a **explicitement validée** ;
3. les décisions ouvertes restantes (Annexe C du blueprint) sont tranchées.

Ne jamais commencer le backend, la base de données, l'authentification ou la sécurité sans
instruction explicite.
