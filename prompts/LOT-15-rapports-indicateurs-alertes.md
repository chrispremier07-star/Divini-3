# LOT 15 — Rapports, Indicateurs & Alertes

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 03 et LOT 14 (validés). **Débloque** : —
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire la couche de **pilotage consolidé** : rapports métier, indicateurs transverses avec
**score de santé**, et centre d'alertes.

Ces trois surfaces répondent à une même question sous trois angles : *que s'est-il passé*
(rapports), *où en suis-je* (indicateurs), *que dois-je traiter maintenant* (alertes).

## 2. Périmètre

### 2.1 Rapports

1. **Catalogue de rapports** : ventes, achats, stocks, trésorerie, comptabilité, clients,
   livraisons, fidélité, WhatsApp, social, RH.
2. **Paramétrage** : période, portée (tenant / établissement), comparaison de périodes,
   granularité (jour / semaine / mois), filtres.
3. **Rendu** : synthèse chiffrée, tableaux, graphiques, lecture en une page.
4. **Export** : aperçu avant export ; l'export réel est une action explicitement marquée
   « à venir » tant que le backend n'existe pas — **aucun faux téléchargement**.
5. **Rapports planifiés** : configuration de la récurrence et des destinataires (l'envoi réel
   est reporté).
6. **Historique des générations**.

### 2.2 Indicateurs

1. **KPI consolidés** par domaine, avec période, portée, delta et tendance.
2. **Score de santé de l'entreprise** (l. 901–953) : score global, contribution par axe,
   évolution, **détail du calcul accessible**.
3. **Comparaisons** : période précédente, même période année précédente, par établissement.
4. **Vue par établissement** : consolidation et détail, selon les permissions.
5. **Export d'indicateurs** (même règle d'honnêteté que les rapports).

### 2.3 Alertes

1. **Centre d'alertes** : alertes actives, historiques, acquittées.
2. **Règles d'alerte** : seuil, module, gravité, destinataires, canal, activation —
   cohérentes avec les règles de RADAR (LOT 14).
3. **Acquittement** : avec motif facultatif, tracé.
4. **Escalade visuelle** : une alerte critique non traitée reste visible et remonte dans le
   Cockpit.
5. **Lien vers l'action** : chaque alerte pointe vers l'écran concerné avec le bon filtre.

### 2.4 Exclu (reporté)

- Génération réelle de fichiers et envoi réel → phase backend.
- Rapports comptables légaux et déclarations → hors périmètre actuel, affiché comme non
  disponible.
- Envoi d'alertes par canal réel → backend.

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/rapports` | Catalogue | N3 |
| `/app/rapports/{id}` | Rapport rendu | N3 |
| `/app/rapports/planifies` | Rapports planifiés | N4 |
| `/app/indicateurs` | Indicateurs consolidés | N3 |
| `/app/indicateurs/sante` | Score de santé | N3 |
| `/app/indicateurs/etablissements` | Comparaison par établissement | N3 |
| `/app/alertes` · `/{id}` | Alertes | N3 |
| `/app/alertes/regles` | Règles d'alerte | N2 |

## 4. Composants concernés

**Créés** : ReportCatalog, ReportCard, ReportConfigPanel, PeriodComparator, GranularitySelector,
ReportView, ReportSection, ExportPreview, ExportAvailabilityNote, ScheduledReportList,
ScheduleEditor, GenerationHistory, IndicatorDashboard, IndicatorGroup, TrendSparkline,
HealthScoreDial, ScoreAxisBreakdown, ScoreHistory, EstablishmentComparisonTable,
AlertCenter, AlertCard, AlertFilters, AcknowledgeDialog, EscalationBadge, AlertRuleList,
AlertRuleEditor, ThresholdInput, RecipientPicker.
**Réutilisés** : DataTable, KpiCard, KpiGrid, Chart, DataPanel, Timeline, Progress,
ProgressRing, Badge, StatusDot, SeverityIndicator, Button, Search, Select, DatePicker,
Checkbox, Switch, Modal, Drawer, ConfirmDialog, EmptyState, Skeleton, ErrorState,
PermissionDenied, OfflineState.

## 5. UX

- **Trouver le bon rapport sans chercher** : catalogue groupé par domaine, avec description
  courte de ce que le rapport répond.
- **Paramétrer sans se perdre** : période, portée et comparaison toujours visibles ; un
  changement recalcule sans rechargement complet.
- **Lire un score sans le subir** : le score de santé s'accompagne toujours de sa composition
  par axe ; il n'est jamais un chiffre opaque.
- **Traiter une alerte en deux gestes** : comprendre (motif, source) puis agir (lien filtré) ou
  acquitter.
- **Ne jamais promettre un export** : tant que l'export n'est pas réel, l'action le dit.

## 6. Design — application stricte du Design System

- Toutes les valeurs chiffrées en **IBM Plex Mono**, devise explicite.
- Graphiques : grille subtile, trait fin, aire translucide, légende compacte, couleurs
  sémantiques.
- Score de santé : anneau sobre, teinte sémantique selon le niveau, **valeur numérique toujours
  affichée** (la couleur ne suffit jamais).
- Alertes : gravité par badge + icône + libellé ; critique non acquittée mise en évidence sans
  agressivité visuelle.
- Rapports : mise en page dense mais aérée, sections nettes, titres Space Grotesk.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Catalogue | grille 3–4 | 2–3 | 2 | 1 colonne |
| Rapport | pleine largeur bornée, 2 colonnes | 2 colonnes | 1 colonne | 1 colonne, tableaux en mode carte |
| Config de rapport | panneau latéral | panneau | barre condensée | drawer |
| Indicateurs | 4–6 KPI par ligne | 3–4 | 2 | 1–2 |
| Score de santé | anneau + axes côte à côte | idem | empilé | empilé |
| Comparaison établissements | table | colonnes réduites | colonnes prioritaires | mode carte |
| Alertes | liste + détail 2 colonnes | idem | 1 colonne | 1 colonne |

## 8. Motion

- Count-up des indicateurs : 1 100–1 200 ms.
- Reveal des graphiques : tracé progressif, une seule fois.
- Recalcul après changement de paramètre : transition courte 220–320 ms, **sans clignotement**.
- Anneau de score : animation de remplissage bornée, une seule fois.
- Acquittement d'alerte : sortie discrète 140–220 ms.
- Aucune animation en boucle.
- `prefers-reduced-motion` : valeurs finales directes.

## 9. États

- **Rapport** : catalogue loading / vide ; rapport en génération, rendu, données insuffisantes
  pour la période, erreur, permission denied, offline, export non disponible.
- **Indicateurs** : chargement, valeur indisponible, delta neutre, comparaison impossible,
  données partielles.
- **Score de santé** : calcul en cours, score disponible, détail indisponible, historique
  insuffisant.
- **Alertes** : aucune alerte, alertes actives, alerte acquittée, alerte critique non traitée,
  règle désactivée, destination indisponible, permission denied.

## 10. Données

Mockées et **signalées**, cohérentes avec les modules des lots 05 à 14 : un rapport de ventes
doit refléter les ventes du LOT 06, un indicateur de trésorerie les flux du LOT 09, une alerte
un signal de RADAR.

Aucun rapport réel généré, aucun export réel, aucune donnée de source externe.

## 11. Interdits spécifiques au lot

- Produire un faux téléchargement ou simuler un envoi.
- Afficher un score de santé sans détail de calcul accessible.
- Créer une alerte sans destination réelle.
- Afficher un indicateur incohérent avec les données du module source.
- Laisser une alerte critique disparaître sans acquittement.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 901–953, 2412–2433), vérifier les données des lots 05 à 14.
- **B** : annoncer fichiers, liste des rapports, axes du score, règles d'alerte, stratégie de
  test.
- **C** : construire rapports, indicateurs, score, alertes.
- **D** : intégrer au shell, au Command Center, au Cockpit (les alertes critiques y remontent).
- **E** : tester chaque rapport sur plusieurs périodes et portées, la comparaison, le score et
  son détail, l'acquittement, les 4 breakpoints, les deux thèmes, clavier, reduced-motion.
- **F** : corriger incohérences, états manquants, overflow.
- **G** : valider lorsque chaque chiffre affiché est cohérent avec son module source.

## 13. Validation — checklist

- [ ] Catalogue de rapports couvrant les domaines listés.
- [ ] Paramétrage période / portée / comparaison / granularité fonctionnel.
- [ ] Rendu lisible en une page, sections nettes.
- [ ] Export : aperçu réel, action « à venir » explicite, **aucun faux téléchargement**.
- [ ] Rapports planifiés configurables ; envoi explicitement reporté.
- [ ] Indicateurs consolidés avec delta et tendance.
- [ ] Score de santé avec composition par axe et détail de calcul accessible.
- [ ] Comparaison par établissement selon les permissions.
- [ ] Alertes : actives, historiques, acquittement tracé, escalade visible.
- [ ] Règles d'alerte éditables, cohérentes avec RADAR.
- [ ] Chaque alerte pointe vers un écran réel avec filtre appliqué.
- [ ] Cohérence vérifiée entre rapports, indicateurs, alertes et modules sources.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 14.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la liste des rapports livrés, les axes du score de
santé et leur pondération, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 16.
