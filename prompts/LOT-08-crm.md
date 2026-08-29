# LOT 08 — CRM

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 03 et LOT 06 (validés). **Débloque** : LOT 10, LOT 12.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire le **CRM** : clients, segments, VIP, prospects, relances et — point le plus sensible
du produit — **les consentements**.

Le corpus impose une règle non négociable : le consentement est une **donnée métier centrale,
historisée, vérifiable et non modifiable silencieusement** (II.9, l. 5259–5297, 5330–5359).
L'interface doit rendre cette immuabilité **visible**, pas seulement la respecter.

## 2. Périmètre

### 2.1 Inclus

1. **Clients** : liste (recherche par nom, téléphone, email ; filtres avancés ; segments),
   fiche à onglets (profil, achats, activité, communication, consentements, fidélité),
   historique consolidé, création, modification.
2. **Indicateurs clients** (l. 1660–1674) : total, nouveaux ce mois, actifs, fidèles, VIP,
   points en circulation, panier moyen, CA moyen par client, lifetime value.
3. **Segment VIP** (l. 1688–1698) : règle par défaut **10+ achats ET CA total ≥ 500 000 FCFA**,
   **configurable** et affichée comme telle.
4. **Segments** : création, critères, taille, enregistrement, utilisation comme cible.
5. **Prospects** (l. 1699–1732) : liste, pipeline, fiche, niveaux d'intérêt **1 à 5**
   (Très faible → Très élevé), sources (boutique, Facebook, Instagram, TikTok, WhatsApp,
   site web, autres), indicateurs (total, nouveaux, intérêt élevé, relances, à recontacter,
   convertis, taux de conversion), conversion en client.
6. **Relances** (l. 1733–1765) : moteur de scénarios — déclencheurs (après achat, après
   création de contact, anniversaire, seuil de points, personnalisé), ciblage (nouveaux,
   actifs, fidèles, VIP, occasionnels, inactifs, à risque, perdus), scénarios activables /
   désactivables / récurrents / programmables / auditables.
7. **Consentements** : statuts par catégorie, source, méthode, date, **preuve**, historique
   immuable, opt-out par catégorie, opt-out global, **do not contact**, blocage global.
8. **Page publique `/c/{token}`** : préférences de communication du client, accessible par
   lien, sans exposition de données privées.
9. **Séparation consentement / autorisation d'envoi** (l. 5574–5609) : l'interface ne confond
   jamais « le client a consenti » et « on peut lui envoyer maintenant ».

### 2.2 Exclu (reporté)

- Éligibilité WhatsApp, templates, campagnes, file, coûts → **LOT 12**.
- Envoi réel de relances → backend / LOT 12.
- Attribution de points de fidélité → **LOT 10** (la fiche client affiche le solde de
  démonstration).
- Calcul réel de LTV → phase backend ; ici valeur mockée **signalée**.

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/clients` · `/{id}` · `/nouveau` · `/{id}/modifier` | Clients | N1 |
| `/app/clients/{id}/historique` | Historique consolidé | N1 |
| `/app/clients/{id}/consentements` | Consentements & preuves | N2 |
| `/app/clients/segments` · `/{id}` | Segments | N1 + N3 |
| `/app/prospects` · `/{id}` · `/nouveau` | Prospects / pipeline | N1 |
| `/app/relances` · `/scenarios/{id}` | Relances & scénarios | N4 |
| `/c/{token}` | Préférences client (public) | N2 |

## 4. Composants concernés

**Créés** : ClientProfileHeader, ClientTabs, PurchaseHistory, CommunicationLog,
ConsentPanel, ConsentCategoryRow, ConsentProofViewer, ConsentHistoryTimeline, OptOutDialog,
DoNotContactBanner, SegmentBuilder, SegmentCriteriaRow, ProspectPipeline, ProspectCard,
InterestLevelSelector, SourceBadge, ConversionDialog, ScenarioList, ScenarioEditor,
ScenarioTriggerPicker, ScenarioAudiencePicker, ScenarioSchedule, PublicPreferencePage,
PreferenceCategoryToggle.
**Réutilisés** : DataTable, KpiCard, KpiGrid, Chart, DataPanel, Timeline, ActivityFeed,
Kanban (pipeline), Badge, StatusDot, SeverityIndicator, Avatar, Button, Search, Select, Input,
DatePicker, Checkbox, Radio, Switch, Modal, Drawer, ConfirmDialog, EmptyState, Skeleton,
ErrorState, PermissionDenied.

## 5. UX

- **Trouver un client en deux secondes** : recherche par nom, téléphone ou email depuis
  n'importe où (topbar, Command Center, liste).
- **Comprendre un client en un écran** : la fiche résume identité, valeur, activité récente,
  préférences de communication.
- **Ne jamais deviner un consentement** : le statut est affiché par catégorie, avec sa source,
  sa méthode, sa date et sa preuve consultable.
- **Modifier un consentement est un acte tracé** : toute modification ouvre une confirmation
  qui explique qu'elle **crée un nouvel événement** dans l'historique sans effacer le précédent.
  Aucune modification silencieuse.
- **Prospects** : le pipeline se lit comme un entonnoir ; le niveau d'intérêt est explicite
  (1 à 5) et jamais réduit à une couleur.
- **Relances** : un scénario se comprend en une ligne (déclencheur → cible → action →
  fréquence) ; il s'active et se désactive sans ambiguïté.
- **Page publique** : aucun jargon, aucune donnée privée affichée, choix simples et réversibles.

## 6. Design — application stricte du Design System

- Fiche client : en-tête sobre (avatar, nom, segment, solde de points en mono), onglets à
  underline 2 px interpolé.
- Consentements : tableau par catégorie, statut en badge sémantique, preuve derrière une action
  explicite, historique en timeline verticale.
- **Bannière do not contact** : CRITIQUE `#E0785F` avec icône et texte — jamais une simple
  pastille rouge.
- Pipeline : colonnes `--panel`, cartes `--panel-2`, drag-over `--accent-soft`.
- Montants, CA, LTV, points : **IBM Plex Mono**.
- Page publique : mise en page épurée, lisible sur mobile, aucune chrome produit.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Liste clients | table complète | colonnes réduites | colonnes prioritaires | mode carte |
| Fiche client | en-tête + 2 colonnes | idem | 1 colonne, onglets | 1 colonne, onglets scrollables |
| Consentements | tableau par catégorie | idem | lignes condensées | **carte par catégorie** |
| Historique | timeline verticale | idem | condensée | condensée |
| Pipeline | colonnes côte à côte | scroll horizontal | 1–2 colonnes | 1 colonne empilée |
| Scénarios | liste + éditeur 2 colonnes | idem | 1 colonne | 1 colonne |
| `/c/{token}` | colonne centrée | colonne centrée | pleine largeur | pleine largeur |

## 8. Motion

- Ouverture de la fiche : transition narrative 420 ms maximum.
- Underline des onglets : ~280 ms interpolé.
- Count-up des indicateurs : 1 100–1 200 ms.
- Déplacement d'une carte de pipeline : discret, 220–320 ms, drag-over `--accent-soft`.
- Enregistrement d'un consentement : confirmation sobre — **aucune célébration**, c'est un acte
  juridique.
- `prefers-reduced-motion` : transitions quasi instantanées.

## 9. États

- **Client** : loading, introuvable, archivé, doublon possible (avertissement), permission
  denied, offline, syncing.
- **Consentement** : accordé, refusé, retiré, expiré, **inconnu** (l. 1103 : UNKNOWN n'est
  jamais interprété comme GRANTED — affichage neutre explicite), preuve disponible, preuve
  manquante, bloqué globalement.
- **Historique de consentement** : immuable, horodaté, avec acteur et motif.
- **Prospect** : à recontacter, en cours, converti, perdu, sans intérêt.
- **Scénario** : actif, inactif, en erreur, en attente de déclencheur, exécution en cours,
  permission denied.
- **Page publique** : token valide, token expiré, token révoqué, préférences enregistrées,
  erreur.

## 10. Données

Mockées et **signalées** :
- clients et prospects cohérents avec les ventes du LOT 06 (mêmes références de commande,
  montants en FCFA cohérents) ;
- consentements avec statuts variés, y compris **inconnu** et **retiré**, preuves simulées ;
- scénarios de relance prêts à activer mais **non envoyés** ;
- page publique avec token de démonstration.

Aucun envoi réel. Aucune donnée personnelle réelle. Aucune collecte réelle de consentement.

## 11. Interdits spécifiques au lot

- Modifier silencieusement un consentement ou écraser son historique.
- Interpréter un consentement **inconnu** comme accordé.
- Confondre consentement et autorisation d'envoi.
- Envoyer une relance par un canal réel.
- Exposer des données privées sur la page publique.
- Coder en dur la règle VIP (elle doit être configurable et affichée).
- Afficher une LTV ou un taux de conversion comme une mesure réelle.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 1658–1779, II.9, l. 5259–5609), vérifier les données du LOT 06.
- **B** : annoncer fichiers, modèle de consentement (statuts, preuves, historique), stratégie
  de test.
- **C** : construire clients, segments, prospects, relances, consentements, page publique.
- **D** : intégrer au shell, au Command Center, aux cartes d'action du Cockpit ; réutiliser les
  ventes du LOT 06.
- **E** : tester recherche, fiche, historique, modification de consentement (avec trace),
  opt-out, do not contact, pipeline, scénarios, page publique (token valide / expiré / révoqué),
  les 4 breakpoints, les deux thèmes, clavier, reduced-motion.
- **F** : corriger toute ambiguïté de statut, overflow, focus, états manquants.
- **G** : valider lorsque aucun statut de consentement n'est ambigu et que toute modification
  est visiblement tracée.

## 13. Validation — checklist

- [ ] Clients : liste, recherche (nom / téléphone / email), filtres, fiche à onglets, historique.
- [ ] Indicateurs clients complets (total, nouveaux, actifs, fidèles, VIP, points, panier moyen,
      CA/client, LTV) — valeurs mockées signalées.
- [ ] Règle VIP configurable et affichée (défaut : 10+ achats ET ≥ 500 000 FCFA).
- [ ] Segments créables et réutilisables comme cibles.
- [ ] Prospects : pipeline, niveaux 1–5, sources, indicateurs, conversion.
- [ ] Relances : scénarios avec déclencheurs, cibles, fréquence, activation, audit visuel.
- [ ] Consentements : statut par catégorie, source, méthode, date, preuve consultable.
- [ ] **Historique immuable** : toute modification crée un événement, n'efface rien.
- [ ] Statut **inconnu** affiché distinctement, jamais traité comme accordé.
- [ ] Opt-out par catégorie, opt-out global, do not contact, blocage global.
- [ ] Page `/c/{token}` : sans donnée privée, token invalide géré.
- [ ] Consentement et autorisation d'envoi clairement séparés.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 07.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : les statuts de consentement implémentés, la manière
dont l'immuabilité est rendue visible, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 09.
