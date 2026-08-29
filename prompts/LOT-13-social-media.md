# LOT 13 — Social Media

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 04 (validé). **Débloque** : —
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire le module **Social Media** : calendrier éditorial, création assistée,
prévisualisation, programmation multi-réseaux et analytics — pour Facebook, Instagram et
TikTok au minimum (II.5).

Une règle dure du corpus : **les dates et heures passées doivent être bloquées côté frontend
ET backend** (l. 1622, II.5). Côté frontend, ce blocage est implémenté dans ce lot ; côté
backend, il le sera en phase backend — et l'interface ne doit jamais laisser croire qu'une
publication passée est programmable.

## 2. Périmètre

### 2.1 Inclus

1. **Calendrier** : vue jour, semaine, mois ; grille de publications ; déplacement d'un créneau
   à l'autre ; créneaux passés **visuellement verrouillés**.
2. **Comptes connectés** : liste des comptes par réseau, statut de connexion, portée
   (publication, lecture des statistiques), expiration d'autorisation.
3. **Éditeur de publication** : texte, import image/vidéo, **contexte de marque, audience et
   objectifs**, variantes par réseau, limites de longueur par réseau.
4. **Assistance à la rédaction** : suggestions générées **localement** à partir du contexte
   saisi, présentées comme assistance de démonstration — **aucun appel de modèle réel**.
5. **Prévisualisation** : rendu par réseau, avant publication.
6. **Programmation** : date et heure, multi-réseaux, file de publication, déprogrammation,
   reprogrammation.
7. **Rappels** : avant publication, en cas d'échec, en cas d'expiration d'autorisation.
8. **Analytics** : par réseau, par publication, par période — portée, impressions, engagement,
   clics, vues, interactions, évolution.
9. **Métrique indisponible** : état de premier ordre — une métrique non fournie par un réseau
   est affichée comme **non disponible**, jamais estimée ni inventée (l. 3910).
10. **Statistiques consolidées** : comparaison de périodes, meilleures publications.

### 2.2 Exclu (reporté)

- Connexion réelle aux réseaux, publication réelle, collecte réelle de statistiques →
  phase backend.
- Suggestions réellement produites par un modèle → l'assistance est locale et signalée ;
  le relais vers un service réel est explicitement annoncé.
- Social listening et analyse de concurrence → non inclus dans ce lot.

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/social` | Vue d'ensemble | N1 |
| `/app/social/calendrier` | Calendrier (jour / semaine / mois) | N1 |
| `/app/social/publications` · `/{id}` · `/nouveau` | Publications | N1 |
| `/app/social/editeur/{id}` | Éditeur | N1 |
| `/app/social/comptes` | Comptes connectés | N2 |
| `/app/social/analytics` · `/{publicationId}` | Analytics | N3 |

## 4. Composants concernés

**Créés** : SocialOverview, CalendarGrid, CalendarDayCell, CalendarMonthView,
CalendarWeekView, PastSlotLock, PublicationCard, PublicationEditor, MediaUploader,
MediaPreview, BrandContextPanel, NetworkVariantEditor, LengthLimitIndicator,
SuggestionPanel, NetworkPreview, SchedulePicker, PublicationQueue, AccountList,
AccountStatusBadge, AuthorizationExpiryAlert, AnalyticsPanel, MetricCard,
MetricUnavailable, PeriodComparator, TopPublications.
**Réutilisés** : DataTable, KpiCard, KpiGrid, Chart, DataPanel, Timeline, Progress, Badge,
StatusDot, SeverityIndicator, Button, Search, Select, Input, DatePicker, Checkbox, Switch,
FileUpload, Modal, Drawer, ConfirmDialog, EmptyState, Skeleton, ErrorState, PermissionDenied,
OfflineState — et le Notification Center (LOT 04) pour les rappels.

## 5. UX

- **Voir le mois en un écran** : le calendrier est la surface principale ; chaque créneau montre
  le réseau, l'heure et l'état.
- **Ne jamais programmer dans le passé** : un créneau passé est verrouillé, avec explication ;
  le sélecteur de date interdit toute date antérieure.
- **Adapter sans réécrire** : une publication se décline par réseau (longueur, format, ton),
  avec les limites de chacun affichées en direct.
- **Comprendre la performance** : les analytics indiquent la période, le réseau, et signalent
  explicitement les métriques non disponibles.
- **Rappels utiles** : avant publication, en cas d'échec, avant expiration d'autorisation.

## 6. Design — application stricte du Design System

- Calendrier : grille sur `--panel`, cellules `--panel-2`, bordures `--border-soft`, créneau
  sélectionné `--accent-soft`.
- Créneau passé : verrouillé, atténué, avec icône de verrou et libellé — **jamais seulement
  grisé**.
- Cartes de publication : vignette sobre, réseau indiqué par un libellé (pas uniquement par une
  couleur), statut en badge sémantique.
- Analytics : valeurs en **IBM Plex Mono**, graphiques à grille subtile, métrique indisponible
  rendue comme telle (tiret + libellé), **jamais un zéro inventé**.
- Aucun logo de réseau reproduit de manière décorative.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Calendrier mois | grille 7 colonnes | grille 7 colonnes condensée | **vue semaine** par défaut | **vue jour** par défaut + liste |
| Calendrier jour | colonne horaire + créneaux | idem | idem condensé | liste horaire |
| Éditeur | 2 colonnes (contenu + aperçu) | 2 colonnes | 1 colonne, aperçu en bas | 1 colonne, aperçu en sheet |
| Comptes | table | table | condensée | mode carte |
| Analytics | métriques en grille + graphes | 2 colonnes | 1–2 colonnes | 1 colonne |

Le glisser-déposer d'un créneau a un **équivalent tactile et clavier** sur mobile.

## 8. Motion

- Déplacement d'une publication dans le calendrier : 220–320 ms, cible mise en évidence.
- Ouverture de l'éditeur : 320 ms.
- Apparition des suggestions : 220–320 ms, sans cascade.
- Reveal des graphiques : tracé progressif, une seule fois.
- Count-up des métriques : 1 100–1 200 ms.
- Aucune animation en boucle ; aucun effet sur les vignettes.
- `prefers-reduced-motion` : transitions quasi instantanées.

## 9. États

- **Publication** : brouillon, programmée, en file, publiée, échouée, déprogrammée, expirée,
  créneau passé (verrouillé), permission denied, offline.
- **Calendrier** : vide, chargé, chargement, erreur, hors ligne, créneau verrouillé.
- **Compte** : connecté, autorisation proche de l'expiration (ATTENTION), autorisation expirée
  (CRITIQUE), déconnecté, portée insuffisante.
- **Média** : aucun média, upload en cours, upload réussi, upload échoué, format non supporté,
  taille excessive.
- **Suggestion** : contexte insuffisant, génération locale en cours, suggestion disponible,
  service réel non connecté (état explicite).
- **Analytics** : chargement, données disponibles, **métrique non disponible**, période sans
  données, compte non autorisé à la lecture, erreur.

## 10. Données

Mockées et **signalées** :
- comptes de démonstration par réseau, publications programmées et publiées, créneaux passés ;
- statistiques de démonstration avec **certaines métriques volontairement indisponibles** pour
  prouver l'état correspondant ;
- suggestions générées localement à partir du contexte saisi.

Aucune publication réelle, aucune statistique réelle, aucun compte réel, aucune donnée issue
d'une source de référence visuelle.

## 11. Interdits spécifiques au lot

- Permettre la programmation d'une date ou heure passée.
- Inventer une métrique non fournie par un réseau, ou afficher un zéro à la place.
- Publier réellement sur un réseau.
- Présenter l'assistance locale comme une génération par modèle réel.
- Reproduire des logos de réseau à des fins décoratives.
- Perdre un contenu en cours d'édition en cas d'erreur.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 1555–1657, II.5, l. 3910), vérifier le Notification Center
  (LOT 04).
- **B** : annoncer fichiers, vues du calendrier, liste des métriques et de leur disponibilité,
  stratégie de test.
- **C** : construire calendrier, éditeur, comptes, programmation, analytics.
- **D** : intégrer au shell, au Command Center, aux rappels du Notification Center.
- **E** : tester le verrouillage des créneaux passés (sélection, glisser-déposer, saisie
  manuelle), les trois vues, les variantes par réseau, l'échec d'upload, les métriques
  indisponibles, les 4 breakpoints, les deux thèmes, clavier, reduced-motion.
- **F** : corriger tout contournement du verrouillage de date, overflow, focus, états manquants.
- **G** : valider lorsqu'aucune date passée n'est programmable par aucun chemin et que chaque
  métrique est soit réelle (mockée) soit explicitement indisponible.

## 13. Validation — checklist

- [ ] Calendrier jour / semaine / mois, avec grille et créneaux.
- [ ] **Dates et heures passées bloquées** sur tous les chemins (sélection, drag, saisie).
- [ ] Comptes connectés avec statut, portée et expiration d'autorisation.
- [ ] Éditeur : texte, médias, contexte marque/audience/objectifs, variantes par réseau,
      limites de longueur.
- [ ] Assistance locale présentée comme telle ; relais réel annoncé comme non connecté.
- [ ] Prévisualisation par réseau.
- [ ] Programmation multi-réseaux, file, déprogrammation, reprogrammation.
- [ ] Rappels via le Notification Center.
- [ ] Analytics par réseau, publication, période : portée, impressions, engagement, clics,
      vues, interactions, évolution.
- [ ] **Métrique non disponible** rendue comme telle, jamais un zéro inventé.
- [ ] Équivalent tactile et clavier au glisser-déposer.
- [ ] Les 4 breakpoints (vue jour par défaut sur mobile), les deux thèmes,
      `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 12.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la liste des métriques par réseau et leur statut
(disponible / non disponible dans la démonstration), la preuve du blocage des dates passées, et
`AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 14.
