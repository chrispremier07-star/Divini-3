# LOT 11 — Achats, Fournisseurs & RH

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 07 et LOT 09 (validés). **Débloque** : —
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire trois modules de gestion interne : **Fournisseurs**, **Achats** (commandes d'achat et
réception) et **RH** (module optionnel du corpus, l. 1926–1944).

Ils complètent la boucle opérationnelle : ce qui entre (achats), qui le fournit (fournisseurs),
qui le fait (RH) — et ce que cela coûte (masse salariale, reliée à la finance du LOT 09).

## 2. Périmètre

### 2.1 Inclus — Fournisseurs

1. **Liste et fiches** : identité, contacts, conditions (délais, minimums, modalités),
   produits fournis, historique des commandes, évaluation visuelle (délais tenus, incidents).
2. **Cartes fournisseurs** : vue synthétique par fournisseur (délai moyen, taux de conformité,
   encours).
3. **Rattachement produit** : un produit référence ses fournisseurs et son coût d'achat.

### 2.2 Inclus — Achats

1. **Commandes d'achat** : liste, fiche, création (fournisseur, lignes, quantités, coûts),
   statuts (`brouillon · envoyée · partiellement reçue · reçue · annulée`), réception totale ou
   partielle.
2. **Réception** : saisie des quantités reçues, écart commandé/reçu, impact sur le stock
   affiché (mouvement d'entrée de démonstration, cohérent avec le LOT 07).
3. **Réapprovisionnement préparé** : liste des produits sous seuil avec quantité suggérée —
   la suggestion automatique par RADAR est au **LOT 14** ; ici, la liste est calculée à partir
   des seuils du LOT 07.
4. **Encours fournisseurs** : dettes liées aux achats, reliées à la comptabilité (LOT 09).

### 2.3 Inclus — RH (l. 1926–1944)

1. **Employés** : liste, fiche, contrat, département, poste, date d'entrée, statut.
2. **Départements** : liste, effectif, responsable.
3. **Contrats** : type, durée, période d'essai, échéance.
4. **Présence** : pointage du jour, absences, retards, **demi-journées**.
5. **Avances** : demande, montant, statut, remboursement.
6. **Masse salariale** : synthèse par période et par département, reliée aux dépenses (LOT 09).
7. **Périmètre honnête** : la paie n'est implémentée que dans la limite du périmètre réellement
   livré ; ce qui ne l'est pas est affiché comme **non disponible**, jamais simulé.

### 2.4 Exclu (reporté)

- Suggestion automatique de réapprovisionnement par RADAR → **LOT 14**.
- Approbation automatique par workflow → **LOT 16**.
- Paiement réel des fournisseurs ou des salaires → backend.
- Bullets de paie, déclarations sociales → hors périmètre actuel, affiché comme non disponible.

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/fournisseurs` · `/{id}` · `/nouveau` | Fournisseurs | N1 |
| `/app/achats` · `/{id}` · `/nouveau` | Commandes d'achat | N1 |
| `/app/achats/{id}/reception` | Réception | N1 |
| `/app/achats/reapprovisionnement` | Réapprovisionnement préparé | N1 + N3 |
| `/app/rh` | Vue d'ensemble RH | N1 |
| `/app/rh/employes` · `/{id}` · `/nouveau` | Employés | N1 |
| `/app/rh/departements` | Départements | N1 |
| `/app/rh/presence` | Présence du jour | N1 |
| `/app/rh/avances` · `/{id}` | Avances | N1 |
| `/app/rh/masse-salariale` | Masse salariale | N1 + N3 |

## 4. Composants concernés

**Créés** : SupplierGrid, SupplierCard, SupplierProfile, SupplierTermsPanel, SupplierRating,
PurchaseOrderForm, PurchaseOrderLines, PurchaseOrderStatusBadge, ReceptionTable,
ReceivedVarianceBadge, RestockSuggestionTable, RestockQuantityInput, EmployeeList,
EmployeeProfile, ContractPanel, DepartmentTree, AttendanceBoard, AttendanceDayCell,
AbsenceBadge, AdvanceRequestForm, AdvanceStatusBadge, PayrollSummary.
**Réutilisés** : DataTable, KpiCard, KpiGrid, Chart, DataPanel, Timeline, Progress, Badge,
StatusDot, SeverityIndicator, Avatar, Button, IconButton, Search, Select, Input, DatePicker,
Checkbox, Switch, Modal, Drawer, ConfirmDialog, EmptyState, Skeleton, ErrorState,
PermissionDenied, OfflineState.

## 5. UX

- **Choisir un fournisseur en connaissance de cause** : délai moyen, conformité, encours visibles
  dès la liste.
- **Commander sans ressaisir** : une commande d'achat se construit depuis les produits sous
  seuil, avec quantités suggérées modifiables.
- **Réceptionner sans erreur** : l'écart commandé/reçu est immédiatement visible et doit être
  justifié.
- **RH simple** : présence du jour lisible en un écran ; une absence ou un retard est explicite ;
  une avance montre son statut et son reste à rembourser.
- **Périmètre explicite** : ce qui n'est pas implémenté (paie complète, déclarations) est affiché
  comme non disponible avec explication — jamais un bouton mort.

## 6. Design — application stricte du Design System

- Cartes fournisseurs sur `--panel`, bordures fines, valeurs en **IBM Plex Mono**.
- Évaluation de fournisseur : indicateurs sobres, **pas de notation décorative par étoiles
  colorées** ; sémantique INFO / ATTENTION / CRITIQUE selon le respect des délais.
- Statuts de commande d'achat : badges sémantiques cohérents avec ceux des factures (LOT 06).
- Écart de réception : badge ATTENTION ou CRITIQUE selon l'ampleur, avec libellé.
- Présence : grille sobre, présent = SUCCESS discret, absent = CRITIQUE, retard = ATTENTION,
  demi-journée = INFO — toujours avec texte ou icône.
- Masse salariale : montants en mono, comparaison de périodes sobre.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Fournisseurs | grille 3–4 cartes | 2–3 | 2 | 1 colonne |
| Commandes d'achat | table complète | colonnes réduites | colonnes prioritaires | mode carte |
| Réception | table commandé/reçu/écart | idem | condensée | **mode carte par ligne** |
| Réapprovisionnement | table avec quantité éditable | idem | condensée | mode carte |
| Employés | table + fiche 2 colonnes | idem | 1 colonne | 1 colonne |
| Présence | grille journalière | grille condensée | liste par employé | liste par employé |
| Masse salariale | synthèses côte à côte | 2 colonnes | 1 colonne | 1 colonne |

## 8. Motion

- Reveal des cartes fournisseurs : 700 ms, une seule fois.
- Count-up des encours et de la masse salariale : 1 100–1 200 ms.
- Ajout d'une ligne de commande : 220–320 ms.
- Validation d'une réception : confirmation sobre.
- Pointage de présence : transition d'état 140–220 ms.
- Aucune animation en boucle, aucune célébration.
- `prefers-reduced-motion` : transitions quasi instantanées.

## 9. États

- **Fournisseur** : liste loading / vide / erreur ; fiche loading / introuvable / inactif ;
  sans conditions renseignées (avertissement) ; permission denied.
- **Commande d'achat** : brouillon, envoyée, partiellement reçue, reçue, annulée, ligne
  incomplète, fournisseur manquant, offline, syncing.
- **Réception** : en attente, saisie en cours, écart détecté, écart justifié, réception validée,
  erreur.
- **Réapprovisionnement** : aucun produit sous seuil, suggestions disponibles, quantité
  modifiée, commande préparée.
- **Employé** : actif, en période d'essai, suspendu, sorti, contrat expiré (ATTENTION),
  dossier incomplet.
- **Présence** : présent, absent, retard, demi-journée, congé, non pointé.
- **Avance** : demandée, approuvée, remboursée partiellement, remboursée, refusée, permission
  denied.
- **Masse salariale** : période en cours, période clôturée, données incomplètes.

## 10. Données

Mockées et **signalées** :
- fournisseurs de démonstration (noms fictifs neutres — **aucune société issue d'une source de
  référence visuelle**, l. 8334–8358) ;
- commandes d'achat cohérentes avec les produits du LOT 07 et les dettes du LOT 09 ;
- réceptions cohérentes avec les mouvements de stock du LOT 07 ;
- employés, contrats, présence et avances de démonstration ;
- masse salariale cohérente avec les employés affichés.

Aucune donnée personnelle réelle. Aucun paiement réel.

## 11. Interdits spécifiques au lot

- Simuler une paie complète ou des déclarations sociales.
- Créer un bouton menant à une fonctionnalité non livrée.
- Valider une réception avec un écart non justifié.
- Utiliser des noms de sociétés provenant d'une source de référence visuelle.
- Implémenter une suggestion automatique de réapprovisionnement (LOT 14).
- Afficher une masse salariale incohérente avec les employés listés.

## 12. Méthode d'exécution

- **A** : relire le corpus (fournisseurs l. 1834–1841, RH l. 1926–1944), vérifier produits
  (LOT 07), dettes et dépenses (LOT 09).
- **B** : annoncer fichiers, statuts de commandes d'achat, périmètre RH retenu, stratégie de test.
- **C** : construire fournisseurs, achats et réception, réapprovisionnement, puis RH.
- **D** : intégrer au shell, au Command Center, aux cartes d'action du Cockpit, à la fiche
  produit (LOT 07) et à la comptabilité (LOT 09).
- **E** : tester cycle commande → réception → écart → impact stock, réapprovisionnement,
  pointage, avance, masse salariale, les 4 breakpoints, les deux thèmes, clavier, reduced-motion.
- **F** : corriger incohérences, états manquants, overflow, focus.
- **G** : valider lorsque la chaîne achat → réception → stock → dette est cohérente.

## 13. Validation — checklist

- [ ] Fournisseurs : liste, fiches, conditions, produits fournis, historique, évaluation sobre.
- [ ] Commandes d'achat : création, statuts complets, réception totale et partielle.
- [ ] Écart commandé/reçu visible et justifiable.
- [ ] Réapprovisionnement préparé depuis les seuils du LOT 07, quantités modifiables.
- [ ] Encours fournisseurs reliés à la comptabilité.
- [ ] RH : employés, départements, contrats, présence (dont demi-journées), avances.
- [ ] Masse salariale cohérente avec les employés affichés.
- [ ] Périmètre non implémenté affiché comme **non disponible**, jamais simulé.
- [ ] Aucun nom de société issu d'une source de référence visuelle.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 10.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : le périmètre RH réellement livré, la règle de
cohérence achat → réception → stock → dette, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 12.
