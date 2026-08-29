# DIVINI exo — Architecture Blueprint v1.0

> **Statut du document : STRUCTURE UNIQUEMENT.**
> Ce document ne contient **aucun écran**, **aucun composant implémenté**, **aucun backend**,
> **aucune base de données**, **aucune authentification**, **aucune sécurité implémentée**.
> Il fixe l'architecture, la navigation, le sitemap, les routes, les modules, les écrans,
> le Design System à construire et le plan de lots.
>
> **Aucun lot n'est démarré. Aucun lot n'est validé.**

---

## 0. Base de vérité utilisée

Ce blueprint a été construit **exclusivement** à partir du corpus présent dans le dépôt :

| Source | Emplacement | Rôle |
|---|---|---|
| `MASTER_PROMPT_V3_VERROUILLE_DIVINI_EXO_SILO.txt` | racine du dépôt, 9 858 lignes | Corpus canonique fonctionnel (corps 0→145), enrichissements (II), annexe d'intégrité (III), couche Design System V2, annexes CSS/JS de référence |
| `MASTER PROMPT — DIVINI` (instruction de mission) | message de mission | Ordre de construction, Design First, règle de lots, Validation Gate |

Références canoniques vérifiées ligne à ligne et utilisées dans ce document :

| Sujet | Lignes |
|---|---|
| Identité produit « DIVINI exo », marché Côte d'Ivoire, devise FCFA/XOF | 167–199 |
| 3 interfaces majeures (Landing, Marchand, Concepteur) | 235–266 |
| Tenant, établissements, consolidation | 275–401 |
| Abonnement, modules complémentaires, calcul dynamique du prix | 402–456 |
| Module Registry | 429–456 |
| Essai 7 jours, statuts d'abonnement | 457–498 |
| Paiements (Wave Business, Visa, espèces, couche abstraite) | 499–516 |
| Devises | 517–535 |
| Architecture ERP en 4 niveaux | 536–586 |
| Dashboard intelligent / « Aujourd'hui dans votre entreprise » | 587–624 |
| Mission du jour | 625–644 |
| COPILOT / AUTOPILOT / RADAR / CASH VISION / GUARDIAN | 645–900 |
| Score de santé, mémoire d'entreprise, OCR | 901–1015 |
| WhatsApp : consentements, éligibilité, templates, campagnes, coûts | 1016–1554 |
| Social Media | 1555–1657 |
| CRM, clients VIP, prospects, relances | 1658–1779 |
| Stock, catégories IA, produits, livraisons, fidélité | 1780–1925 |
| RH, comptabilité, dépenses, Workflow Builder, notifications | 1926–2052 |
| Rapport matinal IA, autopilote, zéro formation | 2053–2130 |
| Studio documentaire, éditeur, modèles, génération IA, impression | 2131–2269 |
| Personal ERP | 2270–2291 |
| Offline-first et synchronisation | 2292–2333 |
| Sécurité, RBAC, audit global, API-first, API security, intégrations, Developer Portal, Marketplace | 2334–2507 |
| Console Concepteur, dashboard concepteur, contrôle central, chatbot concepteur | 2508–2596 |
| Landing → conversion, 5 signatures | 2597–2627 |
| UX/UI, Design System, responsive, PWA, performance, scalabilité | 2628–2763 |
| Données réelles uniquement, bouton = fonction réelle, non-régression | 2764–2847 |
| Empty states, erreurs, confirmations, performance UI, animations, notifications temps réel | 3184–3312 |
| Raccourcis / PWA install | 3347–3356 |
| Tests obligatoires, validation de lot, charge, observabilité, sauvegardes | 2938–3056 |
| Design tokens canoniques (dark) | 7785–7799 |
| Typographie canonique | 7801–7811 |
| Rayons canoniques | 7812–7819 |
| Easing canonique | 7820–7823 |
| Thème clair = traduction du système sombre | 7824–7844 |
| Shell ERP (sidebar / topbar / tabs) | 7845–7889 |
| Composants canoniques (KPI, chart, table, kanban, button, command palette, toast) | 7890–7950 |
| Couleurs sémantiques | 7951–7963 |
| États visuels obligatoires | 7964–7986 |
| Animation ERP (durées, interdits) | 7987–8010 |
| Responsive canonique | 8359–8384 |
| Accessibilité / reduced motion | 8385–8398 |
| Anti-régression visuelle | 8399–8414 |
| Design System unique | 8415–8444 |
| Autorisé / interdit | 8445–8479 |
| Checklist finale obligatoire | 8500–8530 |

**TypeScript + React** sont explicitement cités dans le corpus (lignes 2967, 6143, 6325).
Aucun framework d'application (Next.js, Vite, etc.) **n'est nommé** dans le corpus : le choix
est donc un **point de décision ouvert** (voir Annexe C), pas une décision prise ici.

---

# PARTIE A — VISION ET ARCHITECTURE GLOBALE

## 1. Vision globale de l'application

### 1.1 Produit

**DIVINI exo** est une plateforme **SaaS ERP multi-tenant**, modulaire, offline-first,
conçue pour évoluer de 100 → 1 000 → 10 000 → 100 000+ entreprises sans refonte
fondamentale (lignes 152–165).

Marché de référence : **Côte d'Ivoire**. Devise native : **FCFA / XOF**, avec architecture
multi-devises extensible (lignes 191–199, 517–535).

### 1.2 Bascule de paradigme

Le produit ne reproduit pas le schéma classique :

```
ERP classique  :  entreprise → saisit → enregistre → consulte
DIVINI exo     :  entreprise → parle → comprend → décide → agit
```
(lignes 201–234)

Conséquence architecturale majeure : la couche **Intelligence** et la couche
**Automatisation** ne sont pas des modules ajoutés en fin de parcours, mais des
**niveaux structurels** de l'ERP (§2.1).

### 1.3 Principe directeur d'interface

> « La puissance fonctionnelle doit être cachée derrière une interface extrêmement simple. »
> (ligne 229) — « Ne surtout pas chercher à mettre toutes ces fonctionnalités dans
> l'interface principale » (ligne 4607).

Traduction architecturale : **peu d'entrées de navigation de premier niveau**, richesse
déléguée aux écrans de détail, aux onglets contextuels et au **Command Center**.

### 1.4 Ordre de priorité absolu (corpus, lignes 11–23 et 3606–3626)

1. Sécurité · 2. Intégrité des données · 3. Isolation multi-tenant · 4. Conformité ·
5. Logique métier · 6. Fiabilité · 7. Performance · 8. Scalabilité · 9. Extensibilité ·
10. UX · 11. Esthétique · 12. Animation

En cas de conflit d'implémentation visuelle (ligne 8497) :
**FONCTIONNALITÉ > UX > ESTHÉTIQUE > ANIMATION**.

> **Note de méthode** : l'ordre de *construction* imposé par la mission (Design First,
> frontend avant backend) ne contredit pas cet ordre de *priorité* : il définit la
> séquence de livraison, pas la hiérarchie des exigences.

---

## 2. Architecture fonctionnelle

### 2.1 Les 4 niveaux de l'ERP (lignes 536–586)

| Niveau | Nom | Contenu | Traduction UI |
|---|---|---|---|
| **N1** | OPÉRATIONNEL | ventes, achats, stocks, clients, fournisseurs, dépenses, comptabilité, trésorerie, RH, livraisons, fidélité, CRM | Modules de saisie et de gestion : tables, formulaires, fiches, POS |
| **N2** | CONTRÔLE | permissions, validations, anomalies, audit, sécurité, conformité, règles métier | États `permission denied`, confirmations, Audit & Sécurité, Guardrails visuels |
| **N3** | INTELLIGENCE | analyse, prédiction, recommandations, détection, prévisions, scoring | COPILOT, RADAR, CASH VISION, GUARDIAN, Score de santé, Mission du jour |
| **N4** | AUTOMATISATION | workflows, notifications, relances, approbations, tâches, actions IA | AUTOPILOT, Workflow Builder, Notification Center, files d'actions |

**Règle** : chaque écran doit déclarer à quel niveau il appartient, car cela détermine
ses exigences (un écran N2/N3 ne ment jamais sur l'état réel — ligne 7984).

### 2.2 Les 3 interfaces majeures (lignes 235–266, 2508–2596)

| # | Interface | Public | Préfixe de route | Nature |
|---|---|---|---|---|
| 1 | **Landing Page** | public, prospect | `/` | Marketing, conversion, minimaliste, premium |
| 2 | **Interface Marchand (Tenant)** | entreprise cliente et ses établissements | `/app` | Le produit ERP : App Shell complet |
| 3 | **Console Concepteur** | créateur du SaaS | `/console` | Interface **totalement séparée**, contrôle plateforme |

Portails annexes rattachés :

| Portail | Préfixe | Rôle | Source |
|---|---|---|---|
| Onboarding tenant | `/onboarding` | 10 étapes de création de compte | 289–319 |
| Developer Portal | `/developers` | docs API, scopes, sandbox, webhooks | 2468–2493 |
| Page de consentement client | `/c/{token}` | préférences de communication, token long non prédictible, révocable | II.9, 5408–5458 |

### 2.3 Les 5 agents IA (signatures produit)

| Agent | Rôle | Périmètre d'action | Surface UI |
|---|---|---|---|
| **COPILOT** | analyse et explique (« pourquoi mon CA baisse ? ») → constat, causes, données utilisées, recommandations, actions | lecture + préparation d'actions | Cockpit, panneau latéral, écrans d'analyse |
| **AUTOPILOT** | exécute une tâche formulée en langage naturel | actions autorisées seulement ; jamais paiement, transfert, suppression massive, modif comptable critique, modif de permissions | Command Center, file d'actions, aperçu + validation |
| **RADAR** | détecte les risques avant qu'ils ne coûtent | lecture + alertes + préparation de réaction | Module RADAR, Alertes, badges sur modules |
| **CASH VISION** | trajectoire de trésorerie (passé / présent / futur) | lecture + projection | Module Trésorerie, Cash Vision |
| **GUARDIAN** | détecte et bloque les opérations à risque | garde-fou, tampon, blocage | Module Guardian, confirmations, Audit |

Chaîne obligatoire pour toute action IA (lignes 727–753, II.4) :
**Permission → règle → validation → action → audit.**

### 2.4 Modèle organisationnel multi-tenant

```
PLATEFORME (Concepteur)
└── TENANT (entreprise cliente, propriétaire)
    ├── Établissement A (point de vente / agence / boutique / entrepôt)
    │   ├── utilisateurs autorisés
    │   ├── caisse, ventes, mouvements, stock, activité
    │   └── statistiques propres
    ├── Établissement B
    └── …
```

Règles structurantes :

- Isolation multi-tenant **absolue**, garantie sur frontend, backend, API, base, stockage,
  queues, workers, cache, logs, analytics, webhooks, IA, exports, imports, fichiers,
  intégrations (lignes 320–352). **Jamais une simple protection frontend.**
- Le tenant central a une **vue consolidée** ; un utilisateur d'établissement ne voit que
  ce qui lui est autorisé (lignes 353–375).
- Création d'établissement = supplément tarifaire → demande → **validation obligatoire du
  concepteur** → notification + confirmation premium (Lottie confettis **uniquement ici**)
  → activation → essai 7 jours (lignes 376–401).
- Suspension du tenant central ⇒ suspension des établissements rattachés (ligne 4540).
- Hors connexion autorisé jusqu'à **7 jours**, puis connexion obligatoire (lignes 2292–2316, 4540).

### 2.5 Module Registry (lignes 429–456)

Chaque module déclare : identifiant, nom, description, prix, catégorie, dépendances,
statut, disponibilité, permissions, fonctionnalités, plan compatible.

Conséquences architecture frontend :

1. La navigation est **générée** depuis le registre des modules activés du tenant — jamais
   codée en dur par écran.
2. Un module désactivé n'est **pas simplement masqué** : ses accès backend seront protégés
   (ligne 451). Côté frontend, l'état est `module indisponible` explicite, pas un vide.
3. Le prix mensuel est **dynamique** : base + modules + établissements + services facturables
   (lignes 402–428). L'UI doit donc exposer un simulateur de prix, pas un tableau statique.

---

# PARTIE B — NAVIGATION

## 3. Architecture de navigation

### 3.1 Modèle à 4 couches

| Couche | Porteur | Contenu | Persistance |
|---|---|---|---|
| **C1 — Navigation primaire** | Sidebar | Espaces et modules de premier niveau | toujours visible (desktop), drawer/compacte (mobile) |
| **C2 — Navigation secondaire** | Tabs / sous-sections | Vues d'un même module (ex. Stocks : Vue d'ensemble, Produits, Mouvements, Inventaires) | dans la page, soulignement animé 2 px (l. 7881–7889) |
| **C3 — Navigation contextuelle** | Breadcrumb + filtres + en-tête de fiche | position hiérarchique, filtres actifs, portée (tenant / établissement), actions de l'entité | barre de contexte |
| **C4 — Navigation transversale** | Command Center + Notification Center + Cockpit | accès direct à toute entité/action, événements temps réel, priorités du jour | overlay global |

### 3.2 Règles de navigation

- Toute entité accessible par **3 chemins** au minimum : sidebar, Command Center, lien
  contextuel (table, KPI, alerte, timeline).
- Le **breadcrumb est obligatoire** dès le niveau 3 (module → liste → détail).
- Un changement de portée (tenant ↔ établissement) est **toujours visible** dans la topbar
  et persiste pendant la session.
- Les filtres d'une liste sont **reflétés dans l'URL** (partageables, restaurables) —
  exigence future backend, mais contrat frontend à poser dès la structure.
- Aucune navigation ne doit **mentir** sur une permission : un élément interdit est affiché
  en état `permission denied`, jamais silencieusement absent lorsque l'utilisateur peut
  s'attendre à le voir (lignes 7964–7986, 2362–2389).

### 3.3 Structure de la navigation principale (Interface Marchand)

La liste de navigation demandée dans la mission est **réconciliée** avec le corpus canonique
(voir annexe C pour la table de réconciliation terminologique) :

| Demande mission | Entrée canonique retenue | Justification |
|---|---|---|
| Cockpit | **Cockpit** (Dashboard intelligent) | « cockpit opérationnel moderne » (l. 7770) ; contenu défini l. 587–644 |
| Tableau de bord | fusionné dans **Cockpit** | éviter deux dashboards concurrents (interdit : « dashboards remplis de cartes inutiles », l. 2657) |
| Activités | **Activité** (flux d'activité + journal) | notifications temps réel (l. 3294–3312), audit (l. 2390) |
| Commandes | **Ventes & Commandes** | ventes, commandes, factures, avoirs, POS |
| Stocks | **Stocks** | l. 1780–1841 |
| Logistique | **Livraisons** | l. 1842–1879 |
| Comptabilité | **Comptabilité** | l. 1945–1965 |
| Trésorerie | **Trésorerie & Cash Vision** | l. 785–833 |
| Rapports | **Rapports** | l. 2412–2433 (API-first) + exports |
| Indicateurs | **Indicateurs** | KPI, score de santé (l. 901–953) |
| Alertes | **Alertes & RADAR** | l. 754–784 |

Entrées supplémentaires **imposées par le corpus** et absentes de la liste de la mission :
CRM (clients/prospects/relances), Fidélité, WhatsApp, Social Media, Achats & Fournisseurs,
RH, Dépenses, Automatisation (Workflow Builder), Documents, Établissements, Abonnement,
Personal ERP.

### 3.4 Navigation système

| Entrée | Contenu | Source |
|---|---|---|
| **Utilisateurs** | comptes, rôles, permissions granulaires (RBAC), invitations, établissements autorisés | 2362–2389 |
| **Paramètres** | organisation, établissements, devise, numérotation, préférences, notifications, thème, langue | 3127–3165 |
| **Intégrations** | applications connectées, permissions, dernière utilisation, activité, statut, **révocation immédiate** | 2451–2467 |
| **Audit & Sécurité** | journal global (qui/quoi/quand/où/tenant/établissement/ancienne valeur/nouvelle valeur/résultat/contexte/IP), sessions, événements de sécurité | 2390–2411 |
| **Abonnement** | plan, modules, établissements facturés, échéance, statuts, paiements, reçus | 402–516 |

---

## 4. Sitemap complet

### 4.1 Arborescence — Interface Marchand (`/app`)

```
/app
│
├── Cockpit                                  « Aujourd'hui dans votre entreprise » + Mission du jour
│
├── Ventes & Commandes
│   ├── Point de vente (POS)
│   ├── Commandes · Devis · Factures · Avoirs · Paiements
│   └── Clients de comptoir (vente anonyme)
│
├── Stocks
│   ├── Vue d'ensemble (risques, dormants, valorisation)
│   ├── Produits · Catégories (génération IA) · Variantes
│   ├── Mouvements (entrées, sorties, corrections, transferts)
│   ├── Inventaires
│   └── Entrepôts & emplacements
│
├── Logistique (Livraisons)
│   ├── Expéditions · Livreurs · Zones & tarifs
│   └── Statistiques (réussite, retards, CA perdu, motifs d'échec)
│
├── CRM
│   ├── Clients (segments, VIP, historique, LTV)
│   ├── Prospects (niveaux d'intérêt, sources, pipeline)
│   ├── Relances (scénarios)
│   └── Consentements (statuts, preuves, opt-out, do not contact)
│
├── Fidélité                                 points, niveaux, récompenses, expiration, règles d'attribution
│
├── Achats & Fournisseurs                    fournisseurs, commandes d'achat, réapprovisionnement
│
├── Finance
│   ├── Trésorerie & Cash Vision             flux, projection, scénarios
│   ├── Comptabilité                         revenus, dépenses, périodes, créances, dettes, rapports
│   ├── Dépenses                             workflow créée → en attente → approuvée → payée / rejetée
│   └── Devises                              conversion, taux, date, source
│
├── RH                                       employés, départements, contrats, présence, avances, masse salariale
│
├── Communication
│   ├── WhatsApp                             consentements, éligibilité, templates, campagnes, file, coûts, qualité
│   └── Social Media                         calendrier, publications, génération IA, analytics multi-réseaux
│
├── Intelligence
│   ├── COPILOT                              conversation d'analyse reliée aux données autorisées
│   ├── AUTOPILOT                            tâches en langage naturel → aperçu → validation → exécution → audit
│   ├── RADAR                                risques prédits, signaux, actions préparées
│   ├── CASH VISION                          trajectoire de trésorerie
│   └── GUARDIAN                             opérations à risque, blocages, tampons
│
├── Automatisation                           Workflow Builder (SI / ALORS / ET / SINON), tâches, approbations
│
├── Documents                                Studio documentaire, éditeur visuel, modèles, variables, génération IA,
│                                            impression, reçu de caisse personnalisé
│
├── Rapports                                 rapports métier, exports, planifiés
├── Indicateurs                              KPI consolidés, score de santé, comparaisons
├── Alertes                                  alertes actives, historiques, règles, acquittement
├── Activité                                 flux temps réel (tenant + établissements selon permissions)
│
├── Organisation
│   ├── Établissements                       liste, création (supplément → validation concepteur), consolidation
│   ├── Utilisateurs & rôles (RBAC)
│   └── Caisse & points de vente
│
├── Système
│   ├── Paramètres                           organisation, devise, numérotation, préférences, notifications, thème, langue
│   ├── Intégrations                         applications connectées, scopes, révocation
│   ├── Developer Portal (accès)             clés, sandbox, webhooks
│   └── Audit & Sécurité                     journal, sessions, événements
│
├── Abonnement                               plan, modules, établissements, échéance, paiements, reçus
│
└── Personal ERP                             module séparé, non rattaché au tenant professionnel
```

### 4.2 Arborescence — Console Concepteur (`/console`)

```
/console
├── Dashboard concepteur       nouveaux tenants, actifs, inactifs, essais, abonnés, suspendus, nouveaux utilisateurs,
│                              établissements créés, CA SaaS, MRR, évolution, churn, modules populaires, activité
├── Tenants                    liste, fiche tenant, historique, suspension, réactivation
├── Établissements à valider   file de validation obligatoire (+ tarif appliqué)
├── Abonnements                plans, échéances, renouvellements, relances
├── Modules                    création, prix, activation/désactivation, catégories, dépendances, plans
├── Revenus                    CA SaaS, MRR, modules vendus, prévisions
├── Paiements & Reçus          historique, validation manuelle, génération de reçu (mois, date, montant, période)
├── Dépenses plateforme
├── Utilisateurs & rôles       administration de la console
├── Intégrations & politiques  fournisseurs de paiement, WhatsApp, réseaux sociaux, politiques globales
├── Santé du système           erreurs, files, latences, consommation, événements
├── Audit                      actions critiques du concepteur (toute action critique auditée)
├── Marketplace                validation, sécurité, permissions, isolation, conformité
└── Assistant concepteur       chatbot d'interrogation de la plateforme (permissions administrateur)
```

### 4.3 Arborescence — Landing Page (`/`)

```
/                      hero, 5 agents animés, showcase sticky, feature grid, statistiques, pricing, FAQ, CTA final
/tarifs                module de base + modules complémentaires + établissements (simulateur dynamique)
/connexion
/inscription  →  /onboarding (10 étapes)
/demo                  demande de démonstration
/c/{token}             page de consentement client (token long, non prédictible, révocable)
/legal/*               mentions, CGU, confidentialité, cookies, conformité
```

### 4.4 Onboarding tenant — 10 étapes (lignes 289–319)

`Identité → Entreprise → Activité → Pays/devise → Organisation → Modules → Abonnement →
Paiement → Validation → Première configuration`

Contrat UI obligatoire : progression, étape courante, étapes restantes, informations
nécessaires, erreurs, validation, **sauvegarde progressive**, aucune perte de données au
retour arrière.

---

## 5. Routes

### 5.1 Convention

- Préfixe d'application : `/app` (marchand), `/console` (concepteur), `/developers`, `/onboarding`.
- Pluriel pour les collections, identifiant pour le détail : `/app/stocks/produits/{id}`.
- Actions nommées en fin de chemin : `.../{id}/annuler`, `.../{id}/historique`.
- Portée d'établissement exprimée explicitement : `/app/etablissements/{id}/…` **ou**
  sélecteur de portée global (décision Annexe C.2).
- Filtres, tri et pagination **dans la query string** (état partageable).
- Toute route porte son exigence d'état : `chargement`, `vide`, `erreur`, `hors ligne`,
  `permission refusée`, `module indisponible`.

### 5.2 Table de routes — Interface Marchand

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app` | Cockpit | N1+N3 |
| `/app/activite` | Flux d'activité temps réel | N1 |
| `/app/ventes` | Liste ventes & commandes | N1 |
| `/app/ventes/pos` | Point de vente | N1 |
| `/app/ventes/{id}` | Détail vente / commande | N1 |
| `/app/ventes/{id}/historique` | Historique & audit de la vente | N2 |
| `/app/devis` · `/app/factures` · `/app/avoirs` · `/app/paiements` | Collections financières commerciales | N1 |
| `/app/factures/{id}` | Détail facture | N1 |
| `/app/stocks` | Vue d'ensemble stocks | N1+N3 |
| `/app/stocks/produits` · `/app/stocks/produits/{id}` | Liste / fiche produit | N1 |
| `/app/stocks/produits/nouveau` · `/app/stocks/produits/{id}/modifier` | Création / modification | N1 |
| `/app/stocks/categories` | Catégories (+ génération IA) | N1+N3 |
| `/app/stocks/mouvements` · `/app/stocks/mouvements/{id}` | Mouvements | N1 |
| `/app/stocks/inventaires` · `/app/stocks/inventaires/{id}` | Inventaires | N1 |
| `/app/stocks/entrepots` | Entrepôts & emplacements | N1 |
| `/app/livraisons` · `/app/livraisons/{id}` | Expéditions | N1 |
| `/app/livraisons/livreurs` · `/app/livraisons/zones` | Livreurs, zones & tarifs | N1 |
| `/app/livraisons/statistiques` | Analytics logistique | N3 |
| `/app/clients` · `/app/clients/{id}` | CRM clients | N1 |
| `/app/clients/{id}/historique` | Historique client consolidé | N1 |
| `/app/clients/{id}/consentements` | Consentements & preuves | N2 |
| `/app/clients/segments` | Segments | N1+N3 |
| `/app/prospects` · `/app/prospects/{id}` | Prospects / pipeline | N1 |
| `/app/relances` · `/app/relances/scenarios/{id}` | Relances & scénarios | N4 |
| `/app/fidelite` · `/app/fidelite/regles` | Fidélité | N1 |
| `/app/fournisseurs` · `/app/fournisseurs/{id}` | Fournisseurs | N1 |
| `/app/achats` · `/app/achats/{id}` | Commandes d'achat | N1 |
| `/app/tresorerie` | Trésorerie | N1 |
| `/app/tresorerie/cash-vision` | Cash Vision (projection) | N3 |
| `/app/comptabilite` | Comptabilité | N1 |
| `/app/comptabilite/rapports` | Rapports comptables | N3 |
| `/app/depenses` · `/app/depenses/{id}` | Dépenses & approbations | N1+N2 |
| `/app/devises` | Convertisseur & taux | N1 |
| `/app/rh` · `/app/rh/employes/{id}` | RH | N1 |
| `/app/whatsapp` | Vue d'ensemble WhatsApp | N1 |
| `/app/whatsapp/consentements` · `/app/whatsapp/eligibilite` · `/app/whatsapp/eligibilite/{clientId}` | Consentements, éligibilité, « pourquoi ce client est-il éligible ? » | N2 |
| `/app/whatsapp/templates` · `/app/whatsapp/campagnes` · `/app/whatsapp/campagnes/{id}` | Templates & campagnes | N4 |
| `/app/whatsapp/file` · `/app/whatsapp/couts` · `/app/whatsapp/qualite` | File d'envoi, coûts, qualité | N2 |
| `/app/social` · `/app/social/calendrier` · `/app/social/publications/{id}` · `/app/social/analytics` | Social Media | N1+N3 |
| `/app/copilot` | COPILOT | N3 |
| `/app/autopilot` · `/app/autopilot/executions/{id}` | AUTOPILOT + exécutions | N4 |
| `/app/radar` | RADAR | N3 |
| `/app/cash-vision` | Cash Vision | N3 |
| `/app/guardian` | GUARDIAN | N2 |
| `/app/automatisations` · `/app/automatisations/{id}` | Workflow Builder | N4 |
| `/app/documents` · `/app/documents/modeles/{id}` · `/app/documents/editeur/{id}` | Studio documentaire | N1 |
| `/app/documents/recu-caisse` | Personnalisation du reçu de caisse | N1 |
| `/app/rapports` · `/app/rapports/{id}` | Rapports | N3 |
| `/app/indicateurs` | Indicateurs & score de santé | N3 |
| `/app/alertes` · `/app/alertes/{id}` | Alertes | N3 |
| `/app/etablissements` · `/app/etablissements/{id}` · `/app/etablissements/nouveau` | Établissements | N1+N2 |
| `/app/utilisateurs` · `/app/utilisateurs/{id}` · `/app/roles` | Utilisateurs & RBAC | N2 |
| `/app/parametres` (+ `/organisation`, `/notifications`, `/apparence`, `/langue`, `/numerotation`) | Paramètres | N2 |
| `/app/integrations` · `/app/integrations/{id}` | Intégrations | N2 |
| `/app/audit` · `/app/securite` | Audit & Sécurité | N2 |
| `/app/abonnement` · `/app/abonnement/modules` · `/app/abonnement/paiements` | Abonnement | N2 |
| `/app/personal` (+ `/revenus`, `/depenses`, `/epargne`, `/objectifs`) | Personal ERP | séparé |
| `/app/notifications` | Notification Center (vue étendue) | N4 |

### 5.3 Table de routes — Console Concepteur

| Route | Écran |
|---|---|
| `/console` | Dashboard concepteur |
| `/console/tenants` · `/console/tenants/{id}` | Tenants |
| `/console/etablissements/validation` · `/console/etablissements/validation/{id}` | File de validation |
| `/console/abonnements` · `/console/abonnements/{id}` | Abonnements |
| `/console/modules` · `/console/modules/{id}` · `/console/modules/nouveau` | Module Registry |
| `/console/revenus` · `/console/paiements` · `/console/recus` · `/console/depenses` | Finances SaaS |
| `/console/utilisateurs` · `/console/roles` | Administration console |
| `/console/integrations` · `/console/politiques` | Intégrations & politiques globales |
| `/console/sante` | Santé du système |
| `/console/audit` | Audit concepteur |
| `/console/marketplace` | Marketplace |
| `/console/assistant` | Assistant concepteur |

### 5.4 Routes publiques

`/` · `/tarifs` · `/connexion` · `/inscription` · `/demo` · `/onboarding/{etape}` ·
`/c/{token}` · `/developers` · `/legal/*`

---

## 6. Hiérarchie des pages

| Profondeur | Type | Exemple | Zone d'écran |
|---|---|---|---|
| **H0** | Espace | Marchand / Concepteur / Public | changement d'App Shell |
| **H1** | Module | `/app/stocks` | sidebar active + breadcrumb niveau 1 |
| **H2** | Collection / vue | `/app/stocks/mouvements` | tabs de module actives |
| **H3** | Entité | `/app/stocks/produits/{id}` | breadcrumb 3 niveaux, en-tête de fiche, actions d'entité |
| **H4** | Sous-entité / onglet de détail | `/app/clients/{id}/consentements` | tabs de fiche |
| **H5** | Action / état | `.../annuler`, `.../historique` | modale, drawer ou écran dédié |

Règles :

- **H3 s'ouvre prioritairement en drawer** (contexte conservé) et en page pleine sur mobile ;
  la page pleine reste toujours accessible par URL.
- Les écrans de **création** sont des écrans à part entière (H2/H3) quand le formulaire est
  long (produit, établissement, campagne), sinon une modale (dépense, mouvement).
- Toute page H2/H3 expose : titre, portée (tenant/établissement), dernière mise à jour,
  actions primaires, état courant.

---

# PARTIE C — MODULES : FICHES D'ANALYSE

> Format imposé par la mission : Objectif · Utilisateur · Écrans · Navigation ·
> Actions principales · Informations critiques · Dépendances · Futurs besoins backend.
> **Les besoins backend sont listés à titre d'anticipation et ne sont PAS implémentés.**

## 7. Fiches modules

### 7.1 Cockpit (Dashboard intelligent)

| | |
|---|---|
| **Objectif** | Donner en un écran la situation du jour, les risques, les bonnes nouvelles et la prochaine action. N'est pas une collection de KPI (l. 587–624). |
| **Utilisateur** | Tenant central, gérants d'établissement, tout rôle disposant de `dashboard.view`. |
| **Écrans** | Cockpit (liste de sections) ; bloc « Aujourd'hui dans votre entreprise » (À surveiller / Bonnes nouvelles) ; « Que voulez-vous faire ? » (Voir les détails / Agir / Demander à l'IA) ; Mission du jour avec impact financier estimé. |
| **Navigation** | Entrée par défaut après connexion ; sortie vers n'importe quel module via les cartes d'action ; profondeur H1. |
| **Actions** | Consulter, filtrer par portée/période, agir sur un item, déléguer à COPILOT/AUTOPILOT, acquitter une alerte, épingler une section. |
| **Infos critiques** | CA du jour vs référence, trésorerie disponible, alertes critiques, échéances, stock à risque, créances, anomalies, mission du jour + impact estimé. |
| **Dépendances** | Ventes, Stocks, Trésorerie, CRM, Alertes, Intelligence (COPILOT/RADAR/GUARDIAN), Notifications. |
| **Futurs besoins backend** | agrégats temps réel par tenant/établissement/période ; moteur de signaux ; moteur de priorisation de la mission du jour ; estimation d'impact ; abonnements temps réel (vente, stock, mouvement, alerte, livraison, anomalie, paiement). |

### 7.2 Ventes & Commandes

| | |
|---|---|
| **Objectif** | Encaisser, suivre commandes/devis/factures/avoirs/paiements, y compris hors connexion. |
| **Utilisateur** | Caissier, vendeur, gérant, tenant central. Droits distincts (`sale.create`, `sale.cancel`). |
| **Écrans** | POS ; liste ventes ; détail vente ; devis ; factures ; avoirs ; paiements ; historique/audit de la vente ; état « en attente de synchronisation ». |
| **Navigation** | H1 sidebar → H2 collections → H3 détail ; POS accessible via Command Center et raccourci clavier. |
| **Actions** | vendre, mettre en attente, appliquer remise, encaisser (multi-moyens), imprimer reçu, créer facture, annuler (confirmation), relancer, exporter. |
| **Infos critiques** | total, reste à payer, moyen de paiement, état de synchronisation, stock impacté, points de fidélité générés, caisse/établissement. |
| **Dépendances** | Stocks, CRM, Fidélité, Documents (reçu), Trésorerie, Offline/Sync, WhatsApp (relance). |
| **Futurs besoins backend** | transactions atomiques ; idempotence offline ; séquence de numérotation ; écritures comptables dérivées ; attribution de points selon règle (prorata / après paiement complet). |

### 7.3 Stocks

| | |
|---|---|
| **Objectif** | Maîtriser produits, catégories, variantes, mouvements, inventaires, multi-entrepôts/établissements. |
| **Utilisateur** | Tenant central (**seul habilité à créer produits et catégories**, l. 4446), magasiniers, gérants ; points de vente en droits limités. |
| **Écrans** | vue d'ensemble ; produits (liste/fiche/création/modification) ; catégories (+ génération IA par mots-clés) ; variantes & images ; mouvements ; inventaires ; entrepôts ; stock prédictif. |
| **Navigation** | H1 → H2 onglets → H3 fiche produit (onglets : informations, variantes, mouvements, fournisseurs, historique). |
| **Actions** | créer/éditer produit, générer catégories par IA puis supprimer/modifier/valider, importer images, enregistrer mouvement, lancer inventaire, transférer, corriger, définir seuils. |
| **Infos critiques** | quantité disponible par emplacement, seuil, stock dormant, valorisation, dernière entrée/sortie, produits à risque, écarts d'inventaire. |
| **Dépendances** | Ventes, Achats/Fournisseurs, Livraisons, Alertes/RADAR, Automatisation, Documents. |
| **Futurs besoins backend** | journal de mouvements append-only ; valorisation (coût) ; règles de seuil ; moteur prédictif ; permissions de création réservées ; import média sécurisé. |

### 7.4 CRM (Clients, Prospects, Relances, Consentements)

| | |
|---|---|
| **Objectif** | Connaître, segmenter, relancer et respecter les préférences de communication. |
| **Utilisateur** | Commerciaux, gérants, tenant central. |
| **Écrans** | clients (liste/fiche/historique) ; segments ; VIP ; prospects (pipeline, niveaux d'intérêt 1–5, sources) ; relances (scénarios) ; consentements (statuts, preuves, opt-out, do not contact) ; page publique `/c/{token}`. |
| **Navigation** | H1 → H2 → H3 fiche avec onglets (profil, achats, activité, communication, consentements, fidélité). |
| **Actions** | rechercher (nom, téléphone, email), filtrer, segmenter, créer prospect, convertir, déclencher relance, enregistrer/retirer un consentement (avec preuve), bloquer globalement. |
| **Infos critiques** | total, nouveaux, actifs, fidèles, VIP, points en circulation, panier moyen, CA/client, LTV ; pour prospects : taux de conversion, à recontacter ; pour consentements : statut par catégorie, source, méthode, preuve, date. |
| **Dépendances** | Ventes, Fidélité, WhatsApp (éligibilité), Notifications, Audit, Social Media. |
| **Futurs besoins backend** | modèle de consentement historisé **immuable** (jamais de modification silencieuse) ; moteur d'éligibilité ; token de préférences long/non prédictible/révocable ; calcul LTV ; journal d'audit consentement. |

### 7.5 WhatsApp

| | |
|---|---|
| **Objectif** | Communiquer commercialement en respectant le consentement, les politiques et les coûts réels. |
| **Utilisateur** | Marketing, gérants, tenant central (approbation). |
| **Écrans** | vue d'ensemble ; consentements ; éligibilité (+ écran « pourquoi ce client est-il éligible ? ») ; templates ; campagnes (création, audience, prévisualisation, validation, planification) ; file d'envoi ; coûts (estimé vs réel) ; qualité ; journal d'audit ; importation de clients ; politique centralisée ; budget & mode économie. |
| **Navigation** | H1 → H2 → H3 campagne ; l'éligibilité est accessible depuis la fiche client. |
| **Actions** | collecter un consentement, créer/approuver/envoyer une campagne, gérer templates, surveiller file et qualité, arbitrer gratuit/payant, couper un envoi. |
| **Infos critiques** | statut de consentement par catégorie, éligibilité et **raison**, coût estimé puis coût réel, budget consommé, qualité du numéro, fenêtres gratuites et expiration, taux de livraison. |
| **Dépendances** | CRM, Consentements, Notifications, Comptabilité (coûts), Audit, Intégrations. |
| **Futurs besoins backend** | chaîne `CONSENTEMENT → ÉLIGIBILITÉ → POLITIQUES → TEMPLATE → LIMITES/QUALITÉ → QUEUE → PLATFORM → WEBHOOK → STATUT` ; normalisation des numéros ; idempotence ; journal immuable ; pricing engine ; **ne jamais inventer les règles Meta** (l. 6424). |

### 7.6 Social Media

| | |
|---|---|
| **Objectif** | Planifier, publier et mesurer sur Facebook, Instagram, TikTok. |
| **Écrans** | calendrier (vue jour/semaine/mois), file de publications, éditeur (média + génération IA + contexte marque/audience/objectifs), prévisualisation, publication détail, analytics par réseau/publication/période, paramètres de comptes. |
| **Actions** | importer image/vidéo, générer par IA, programmer, publier, déprogrammer, analyser, reprogrammer. |
| **Infos critiques** | portée, impressions, engagement, clics, vues, interactions, évolution — **uniquement les données réellement disponibles** par plateforme (l. 3910). |
| **Règle dure** | dates/heures passées bloquées **côté frontend ET backend** (l. 1622, II.5). |
| **Dépendances** | Intégrations, Documents, Notifications, Intelligence (suggestions). |
| **Futurs besoins backend** | connecteurs par plateforme, stockage média, files de publication, collecte analytics, gestion des échecs de publication. |

### 7.7 Finance (Trésorerie, Cash Vision, Comptabilité, Dépenses, Devises)

| | |
|---|---|
| **Objectif** | Savoir où est l'argent, aujourd'hui et demain, et tenir une comptabilité fiable. |
| **Écrans** | trésorerie (flux, soldes, échéances) ; Cash Vision (passé / frontière présent-futur / projection) ; comptabilité (revenus, dépenses, périodes, créances, dettes, rapprochements, rapports, exports) ; dépenses (création, justification, approbation) ; devises (conversion, taux, date, source). |
| **Actions** | enregistrer, catégoriser, joindre un justificatif, approuver/rejeter, payer, clôturer une période, projeter des scénarios, exporter. |
| **Infos critiques** | solde, projection de trésorerie, alerte de bascule négative, créances âgées, dettes, dépenses en attente, marge, taux et date du taux. |
| **Dépendances** | Ventes, Achats, RH, Abonnement (coûts SaaS), Audit, Documents. |
| **Futurs besoins backend** | écritures immuables ; clôture de période ; **jamais de modification rétroactive d'une valeur comptable** liée à un changement de taux (l. 532) ; workflow d'approbation ; projection ; données financières particulièrement protégées (l. 1962). |

### 7.8 Logistique (Livraisons)

| | |
|---|---|
| **Objectif** | Suivre et fiabiliser la livraison, mesurer la performance. |
| **Écrans** | expéditions (liste/détail), livreurs, zones & tarifs, étiquettes, statistiques. |
| **Statuts** | préparation · à expédier · en cours · en livraison · échouée · reprogrammée · livrée · annulée. |
| **Actions** | créer, affecter un livreur, changer de statut, imprimer l'étiquette, reprogrammer, analyser. |
| **Infos critiques** | taux de réussite, retards, annulations, **CA perdu**, performance par livreur, motifs d'échec. |
| **Dépendances** | Ventes, Stocks, CRM, Notifications, Rapports. |
| **Futurs besoins backend** | référentiel de zones extensible (**ne pas figer une liste fermée de zones d'Abidjan**, l. 1876), tarification, historique de statuts, géolocalisation éventuelle. |

### 7.9 Fidélité

| | |
|---|---|
| **Objectif** | Récompenser et retenir. |
| **Écrans** | programme (points, niveaux, récompenses, tags, expiration), règles d'attribution, statistiques, historique par client. |
| **Presets** | Standard 10 pts + 1 pt/1 000 FCFA · Généreux 20 pts + 1 pt/500 FCFA · Économique 5 pts + 1 pt/2 000 FCFA — **configurables**. |
| **Actions** | configurer, attribuer, corriger après annulation, consulter l'historique. |
| **Infos critiques** | points en circulation, points à expiration, coût du programme, impact sur le panier. |
| **Dépendances** | CRM, Ventes, Notifications, WhatsApp. |
| **Futurs besoins backend** | deux modes d'attribution minimum (prorata / après paiement complet), correction sur annulation, historisation complète, exclusion des frais de livraison selon règle. |

### 7.10 RH · Achats & Fournisseurs · Personal ERP

| Module | Résumé |
|---|---|
| **RH** (optionnel) | employés, départements, contrats, présence, absences, retards, demi-journées, avances, masse salariale, paie selon périmètre réellement implémenté. |
| **Achats & Fournisseurs** | fournisseurs (fiches, historique), commandes d'achat, réapprovisionnement préparé par RADAR/COPILOT, réception et impact stock. |
| **Personal ERP** | module **séparé, non rattaché au tenant professionnel** : revenus personnels, dépenses, épargne, objectifs, analyses, recommandations IA. Isolation de données stricte, y compris dans l'UI (pas de mélange avec les chiffres de l'entreprise). |

### 7.11 Intelligence (COPILOT · AUTOPILOT · RADAR · CASH VISION · GUARDIAN)

| | |
|---|---|
| **Objectif** | Comprendre, anticiper, recommander, exécuter sous contrôle, protéger. |
| **Écrans** | COPILOT (conversation, réponses structurées : constat, causes, données utilisées, recommandations, actions) ; AUTOPILOT (formulation, aperçu, validation, exécution, journal) ; RADAR (signaux, risques, actions préparées) ; CASH VISION (courbe) ; GUARDIAN (opérations à risque, blocages). |
| **Actions** | interroger, exécuter une recommandation via workflow sécurisé, approuver/rejeter un lot d'actions, tracer. |
| **Infos critiques** | données utilisées (traçabilité de la réponse), permission requise, impact estimé, état d'exécution, résultat, audit. |
| **Limites absolues (AUTOPILOT)** | jamais seul : transaction financière critique, paiement, transfert d'argent, suppression massive irréversible, modification comptable critique, modification de permissions critiques. Autorisé : relances, notifications, génération de contenu, préparation de commandes, suggestions, programmation, réponses non sensibles. |
| **Dépendances** | tous les modules ; RBAC ; Audit ; Notification Center. |
| **Futurs besoins backend** | service d'analyse sur données autorisées ; traçabilité des données utilisées ; moteur d'exécution avec validation ; journal d'audit IA ; signalement explicite quand une fonctionnalité IA nécessite Internet (l. 3103–3110). |

### 7.12 Automatisation (Workflow Builder)

SI → condition, ALORS → action, ET → action supplémentaire, SINON → autre action.
Exemples canoniques : stock < 20 → alerte + notification + préparation de réapprovisionnement ;
stock < 5 → niveau critique ; facture impayée 7 jours → rappel ; client > 500 000 FCFA → proposer VIP.
**Écrans** : liste des automatisations, éditeur (conditions/actions), historique d'exécution, tests.
**Dépendances** : tous les modules déclencheurs, Notifications, Audit.

### 7.13 Documents (Studio documentaire)

Données & variables → éditeur visuel → modèles → formats et sortie → identité documentaire →
génération IA → test et publication (l. 7484–7520).
**Écrans** : bibliothèque, éditeur visuel, variables disponibles, aperçu, génération IA,
publication, **personnalisation du reçu de caisse** (import logo, formulaire pas à pas,
vérification avant validation finale — non modifiable ensuite sauf réactivation par le
concepteur, l. 4448).
**Dépendances** : Ventes, Abonnement, Console Concepteur (réactivation d'édition), Audit.

### 7.14 Organisation & Système (Établissements, Utilisateurs/RBAC, Paramètres, Intégrations, Audit & Sécurité)

| Sous-module | Contenu | Exigence structurante |
|---|---|---|
| Établissements | liste, création, supplément tarifaire, validation concepteur, consolidation | essai 7 jours par établissement ; Lottie confettis uniquement à la confirmation |
| Utilisateurs & RBAC | comptes, rôles configurables, permissions granulaires (`client.view`, `sale.cancel`, `finance.approve`, `consent.revoke`, `whatsapp.campaign.send`, …) | la permission pilote l'UI **et** sera vérifiée côté serveur |
| Paramètres | organisation, devise, numérotation, notifications, thème, langue | configuration centralisée, pas de valeurs codées en dur (l. 6143) |
| Intégrations | applications, permissions, dernière utilisation, activité, statut, révocation immédiate | OAuth 2.0, scopes, clés restreintes |
| Audit & Sécurité | journal global, sessions, événements de sécurité | aucun événement d'audit supprimé silencieusement |

### 7.15 Abonnement & Monétisation

Écrans : plan courant, catalogue de modules (prix individuels, groupes, plans), simulateur de
prix (base + modules + établissements + services), échéance et statut (essai · actif · échéance
proche · suspendu · expiré · réactivé), paiements (Wave Business, Visa, espèces, banque —
derrière une couche de paiement **abstraite**), reçus, historique.

### 7.16 Console Concepteur

Voir §4.2. Exigences propres : séparation stricte des finances SaaS et des finances tenants
(l. 3313–3329) ; validation manuelle des paiements et des établissements ; génération de reçus ;
toute action critique auditée ; assistant soumis aux permissions administrateur.

---

# PARTIE D — APP SHELL ET STRUCTURE FRONTEND

## 8. Architecture App Shell

### 8.1 Composition canonique (l. 7845–7889)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Sidebar │ Topbar : recherche globale · portée · actions contextuelles · CTA   │
│         ├──────────────────────────────────────────────────────────────────────┤
│ nav     │ Barre de contexte : breadcrumb · tabs (soulignement animé) · filtres │
│ primaire├──────────────────────────────────────────────────────────────────────┤
│         │                                                                      │
│         │ Zone de travail (H1…H5)                                              │
│         │                                                                      │
│         ├──────────────────────────────────────────────────────────────────────┤
│ footer  │ Pied de page contextuel (statut offline/sync, pagination, aide)      │
│ user    │                                                                      │
└─────────┴───────────────────────────────────────────────────────────────────────┘
   Overlays globaux : Command Center · Notification Center · Toasts · Drawers · Modales
```

Le même shell s'applique à l'**Interface Marchand** et à la **Console Concepteur**, avec
leurs fonctionnalités respectives (l. 7847–7849) — Design System unique (l. 8415–8444).

### 8.2 Spécifications canoniques du shell

| Élément | Spécification |
|---|---|
| Sidebar ouverte | ~220 px |
| Sidebar compacte | ~72 px |
| Transition de largeur | ~320 ms |
| Fond sidebar | `panel`, `border-right: 1px border` |
| Icônes | linéaires ; labels mutés |
| Item actif | `accent-soft` + `accent` |
| Item hover | `panel-2` + `text` |
| Pied de sidebar | utilisateur discret |
| Topbar | compacte, `border-bottom`, recherche type control, raccourci clavier en mono, actions à droite, CTA primaire |
| Tabs | labels mutés, actif `text`, underline 2 px, mouvement ~280 ms, position et largeur interpolées, jamais de changement brutal |
| Command palette | overlay translucide, blur léger, panneau ~560 px, apparition scale + translateY, Escape, actif `accent-soft`/`accent` |
| Toasts | fixes, `panel`, border, shadow douce, entrée/sortie par la droite, progress bar fine, icône sémantique |

### 8.3 Structure de dossiers frontend (proposée, à valider en LOT 01)

```
apps/
  web/                       # application (landing + marchand + concepteur)
    src/
      app/                   # routes et layouts (par espace)
        (public)/            # landing, tarifs, connexion, inscription, demo, legal
        (onboarding)/        # 10 étapes
        (merchant)/app/      # Interface Marchand
        (console)/console/   # Console Concepteur
        (client)/c/          # page de consentement client
      shell/                 # AppShell, Sidebar, Topbar, ContextBar, PageHeader, FootBar
      modules/               # 1 dossier par module métier (ventes, stocks, crm, …)
        <module>/
          routes/            # écrans du module
          components/        # composants métier du module
          hooks/
          mock/              # données mockées réalistes — clairement signalées
      design-system/
        tokens/              # tokens (couleurs, typo, radius, spacing, ombres, motion)
        primitives/          # Button, Input, Badge, …
        patterns/            # DataTable, KPI, Chart, Timeline, EmptyState, …
        overlays/            # Modal, Drawer, CommandCenter, NotificationCenter, Toast
      state/                 # état global (session simulée, thème, portée, modules actifs)
      services/              # contrats de données (aujourd'hui mock, demain API)
      i18n/                  # fr-FR natif, architecture multi-langues
      motion/                # easing, durées, primitives d'animation, reduced-motion
packages/
  design-tokens/             # tokens partagés (source unique)
  contracts/                 # types partagés frontend ↔ futur backend
```

Règles :

- **Un module = un dossier autonome** ; aucune dépendance circulaire entre modules ;
  les échanges passent par des contrats partagés.
- **Aucune donnée métier codée en dur dans un composant** (l. 6143) : les données mockées
  vivent dans `mock/` et sont marquées comme telles dans l'UI.
- `design-system` ne dépend d'aucun module.

## 9. Structure Sidebar

```
SIDEBAR
├── Brand (logo + nom « DIVINI exo ») + bouton collapse
├── Sélecteur de portée : Tenant ⇄ Établissement(s)
├── Recherche / raccourci vers Command Center
├── Groupe OPÉRATIONS
│   ├── Cockpit
│   ├── Ventes & Commandes
│   ├── Stocks
│   ├── Livraisons
│   └── CRM
├── Groupe FINANCE
│   ├── Trésorerie & Cash Vision
│   ├── Comptabilité
│   ├── Dépenses
│   └── Fidélité
├── Groupe INTELLIGENCE
│   ├── COPILOT · AUTOPILOT · RADAR · CASH VISION · GUARDIAN
│   └── Alertes
├── Groupe COMMUNICATION
│   ├── WhatsApp
│   └── Social Media
├── Groupe PILOTAGE
│   ├── Rapports · Indicateurs · Activité
│   └── Automatisation · Documents
├── Groupe ORGANISATION
│   ├── Établissements · Utilisateurs & rôles
│   └── Abonnement
├── Groupe SYSTÈME
│   ├── Paramètres · Intégrations · Audit & Sécurité
└── Footer utilisateur (avatar, rôle, statut sync, thème, déconnexion)
```

Règles de composition :

- La sidebar est **générée** à partir du Module Registry du tenant + permissions du rôle :
  un module non activé n'apparaît pas comme « grisé » par défaut, il apparaît dans
  Abonnement → Modules avec un état explicite.
- Badge de compteur uniquement lorsqu'il porte une **information actionnable** (alertes,
  validations en attente, synchronisation).
- **7 groupes maximum**, 5 à 7 entrées par groupe : au-delà, regrouper (principe de la
  ligne 229).
- Personal ERP est une entrée **visuellement séparée** (module non rattaché au tenant).

## 10. Structure Header (Topbar)

```
TOPBAR
├── [gauche]  Breadcrumb (H1 → Hn) · Titre de page · Portée active (tenant/établissement)
├── [centre]  Recherche globale (control, raccourci clavier affiché en mono) → Command Center
├── [droite]  Statut offline / synchronisation · Notification Center (badge)
│             · Actions rapides contextuelles · Sélecteur de thème · Sélecteur de langue
│             · Avatar + menu (profil, paramètres, aide, déconnexion)
└── CTA primaire (action principale de la page courante)
```

Règles :

- La topbar est **compacte** ; elle ne duplique jamais les tabs du module.
- Le **statut offline/sync est permanent** tant que l'application est offline-first.
- Les actions contextuelles changent selon la page (ex. « Nouvelle vente » sur Ventes,
  « Nouveau mouvement » sur Stocks) et doivent correspondre à des fonctions réelles.

## 11. Command Center

Rôle : **réduire la navigation à zéro** pour les tâches fréquentes (l. 3166–3183, II.2).

| Aspect | Définition |
|---|---|
| Déclenchement | raccourci clavier, clic sur la recherche, bouton sidebar |
| Contenus | navigation (modules, écrans), entités (client, produit, facture), actions (nouvelle vente, enregistrer une dépense, créer une relance), requêtes d'analyse (déléguées à COPILOT), tâches AUTOPILOT |
| Comportement | filtrage progressif, sections, item actif `accent-soft`/`accent`, navigation clavier complète, Escape pour fermer |
| Garde-fous | une action sensible proposée par le Command Center affiche son exigence de permission et sa confirmation ; **aucun bouton fictif** (l. 2784–2800) |
| Visual | panneau ~560 px, overlay translucide + blur léger, apparition scale + translateY |

## 12. Notification Center

| Aspect | Définition |
|---|---|
| Sources | ventes, stock, mouvements, alertes, livraisons, anomalies, paiements, activités importantes (l. 3294–3312) ; campagnes WhatsApp ; validations d'établissement ; échéances d'abonnement ; synchronisation |
| Canaux | in-app, email, push, WhatsApp (si autorisé), SMS (selon module) — l. 2031–2052 |
| Structure | catégories, non lues/lues, regroupement par type, persistance, préférences par utilisateur et par établissement |
| Temps réel | le tenant central reçoit les événements de ses établissements **selon ses permissions** |
| UI | cloche + badge, panneau (liste, filtres, « tout marquer comme lu »), vue étendue `/app/notifications`, toasts pour l'immédiat |
| Règle | une notification pointe toujours vers un écran réel et actionnable ; une notification sans destination réelle est interdite |

---

# PARTIE E — DESIGN SYSTEM À CONSTRUIRE

## 13. État des lieux : ce qui est déjà verrouillé

Le corpus contient un Design System **déjà canonique et verrouillé** (couche V2, lignes
7698–8530) issu de deux références visuelles (`saas-erp-interaction-demo.html`,
`silo-landing-page(1).html`), avec annexe CSS et JS complète.

### 13.1 Tokens canoniques (l. 7785–7823)

```
DARK THEME SOURCE
--bg          : #1C2126      --panel       : #22282E      --text        : #E7EBEE
--bg-2        : #171B1F      --panel-2     : #262D34      --muted       : #93A0AB
--border      : #333B43      --accent      : #F2A93B      --info        : #4FC7B9
--border-soft : #2A3038      --accent-soft : rgba(242,169,59,0.14)
                             --positive    : #6FCF97      --negative    : #E0785F

TYPOGRAPHIE
--font-display : Space Grotesk   (titres, identité, grands chiffres structurants)
--font-body    : Inter           (interface, textes, formulaires, tableaux, navigation)
--font-mono    : IBM Plex Mono   (KPI, valeurs, identifiants, références, données techniques)

RADIUS : 6 controls · 8 buttons/nav/icons · 10 cards · 12–14 surfaces · 16 mockups · 18–22 marketing
EASING : cubic-bezier(.2,.8,.2,1)
```

### 13.2 Sémantique (l. 7951–7963)

`INFO #4FC7B9` · `SUCCESS #6FCF97` · `ATTENTION #F2A93B` · `CRITIQUE #E0785F`
— CRITIQUE n'est **jamais** décoratif ; la couleur exprime la gravité réelle.

### 13.3 Thème clair (l. 7824–7844)

Le mode clair **n'est pas une nouvelle direction artistique** : c'est une
*DARK SYSTEM → LIGHT SURFACE TRANSLATION*. Mêmes composants, proportions, états,
interactions, animations, accent ambre, couleurs sémantiques identiques, densité maîtrisée.

### 13.4 Identité (l. 7753–7784)

Premium, technique, contemporain, sobre, précis, confiant, opérationnel, dense mais aéré,
vivant, sans décoration inutile — « l'impression d'un cockpit opérationnel moderne ».
Interdits : dashboard générique, effet template SaaS, surcharge de cartes, glassmorphism
excessif, gradients omniprésents, néons gratuits, animations décoratives permanentes.

### 13.5 États visuels obligatoires (l. 7964–7986)

`default · hover · active · focus-visible · disabled · loading · success · info · warning ·
error · critical · empty · offline · syncing · permission denied`
— « Le visuel ne doit jamais mentir sur l'état réel du système. »

### 13.6 Motion (l. 7987–8010)

Micro 140–220 ms · état 220–320 ms · panel 320 ms · transition narrative 420 ms ·
reveal 700 ms · count-up 1 100–1 200 ms.
Interdits : bounce permanent, rotation décorative, zoom agressif, animation constante de
tous les éléments, mouvement sans information.

## 14. Direction artistique — conflit détecté puis **TRANCHÉ**

> **DÉCISION (2026-08-28) : Option A — le corpus verrouillé fait foi.**
> Palette dark `#1C2126` + accent ambre `#F2A93B`, typographies Space Grotesk / Inter /
> IBM Plex Mono, thème **sombre par défaut** à la première connexion, le clair restant une
> *DARK SYSTEM → LIGHT SURFACE TRANSLATION*.
> Les formulations « sidebar indigo/violette » et « workspace ivoire/blanc » de la mission
> §08 sont donc **écartées** : elles ne correspondent à aucun token du corpus (0 occurrence
> d'« indigo », 0 de « violet », et « ivoire » n'y apparaît que dans « Côte d'Ivoire »).
> Aucun token indigo/violet/ivoire ne sera introduit. Le LOT 00 peut démarrer.

Contexte du conflit, conservé pour traçabilité — la mission reçue (section 08) imposait :

> « la sidebar indigo/violette », « le workspace ivoire/blanc », « les deux thèmes ».

Le corpus verrouillé du dépôt impose autre chose :

| Point | Mission (section 08) | Corpus verrouillé du dépôt |
|---|---|---|
| Couleur dominante | indigo / violet | **ambre `#F2A93B`** (l. 7795, 7957) |
| Sidebar | indigo/violette | **`panel` `#22282E`** + border, item actif ambre (l. 7861–7872) |
| Workspace | ivoire / blanc | **dark `#1C2126`** par défaut (l. 7787) |
| Thème principal | clair suggéré | **dark source**, le clair étant une traduction (l. 7824–7844) |
| Occurrences | « ivoire » comme **couleur** n'apparaît nulle part : les 3 occurrences du mot dans le corpus sont « Côte d'**Ivoire** » (l. 191, 3140, 5800). « indigo » : **0 occurrence**. « violet » : 0 occurrence en tant que couleur d'interface | tokens explicites + CSS complet en annexe |

Les deux options étaient mutuellement exclusives :

- **Option A — Corpus verrouillé prioritaire** (règle « la direction artistique DIVINI est la
  source de vérité visuelle absolue » + clause d'immuabilité du corpus, l. 7702–7706) :
  dark `#1C2126` + accent ambre `#F2A93B`, Space Grotesk / Inter / IBM Plex Mono.
- **Option B — Révision assumée** : palette indigo/violette + workspace ivoire, impliquant une
  refonte écrite de la couche V2.

> **Résolution : Option A retenue** par le donneur d'ordre le 2026-08-28, avec thème **sombre
> par défaut**. Le point Annexe C.1 est clos ; le LOT 00 n'est plus bloqué.

## 15. Familles de composants à construire

| Famille | Composants | Spécification canonique de rattachement |
|---|---|---|
| **Navigation** | Sidebar, SidebarItem, ScopeSwitcher, Topbar, Breadcrumb, Tabs (underline animé), ContextBar, CommandCenter | l. 7845–7889, 7932–7939 |
| **Actions** | Button (primary/ghost/danger), IconButton, Dropdown, ContextMenu, QuickActions, ConfirmDialog | l. 7922–7931 ; confirmations l. 3237–3252 |
| **Formulaires** | Input, Search, Select, DatePicker, Checkbox, Radio, Switch, FileUpload, Stepper, FieldGroup, FormErrors | radius 6–8 px, focus-visible obligatoire |
| **Data** | KPI (count-up 1 100–1 200 ms), Chart (reveal progressif), DataTable (header compact uppercase, hover row, actions au hover, mono sur identifiants), Kanban (drag-over `accent-soft`), Timeline, ActivityFeed, Progress, DataPanel | l. 7890–7921, 7910–7921 |
| **Feedback** | Alert, NotificationItem, Toast (entrée/sortie droite + progress bar), Modal, Drawer, EmptyState, Skeleton, ErrorState, PermissionDenied, OfflineState, SyncingState, ModuleUnavailable | l. 7940–7950, 7964–7984, 3204–3219 |
| **Identité** | Avatar, StatusDot, Badge, SeverityIndicator, ScoreHealth, AgentBadge (COPILOT/AUTOPILOT/RADAR/CASH VISION/GUARDIAN) | l. 7951–7963 |
| **Marketing (landing)** | StickyNav, Hero, MockupParallax, Marquee, Stats, StickyShowcase, FeatureGrid, AgentCards (5 motions dédiées), Pricing, FAQ, FinalCTA, Footer | l. 8014–8256 |

Règles transverses :

- **Un seul langage visuel** pour marchand, concepteur, onboarding, dashboards, modules ERP,
  agents IA, social, documents, CRM, finance, stock, sécurité, paramètres, intégrations,
  Developer Portal, Marketplace et landing (l. 8415–8444).
- Toute extension du Design System doit être **justifiée et tracée**, jamais ajoutée par
  commodité d'implémentation.

---

# PARTIE F — RESPONSIVE

## 16. Architecture responsive

### 16.1 Points de rupture canoniques (l. 8359–8384)

| Largeur | Comportement ERP |
|---|---|
| `> 980 px` | grille complète |
| `≤ 980 px` | réduction du nombre de colonnes (KPI 2 colonnes, grilles 2 colonnes) |
| `≤ 720 px` | sidebar compacte (72 px), labels masqués, KPI 1–2 colonnes, grilles 1 colonne |
| petits écrans | **aucun module inutilisable** |

Landing : `≤ 980 px` hero réorganisé, showcase en colonne, feature grid 2 col., agents 2 col.,
pricing 1 col., navigation simplifiée ; `≤ 560 px` mockup empilé, agents 1 col., footer 1 col.

### 16.2 Comportement par zone

| Zone | Desktop (> 1280) | Laptop (981–1280) | Tablette (721–980) | Mobile (≤ 720) |
|---|---|---|---|---|
| **Sidebar** | ouverte 220 px, collapsible 72 px | ouverte ou compacte selon préférence | compacte 72 px + drawer sur demande | masquée → drawer plein écran, accès via topbar |
| **Topbar** | complète | complète | recherche réduite à l'icône | recherche icône, actions en menu |
| **ContextBar (breadcrumb + tabs)** | inline | inline | tabs scrollables horizontalement | breadcrumb condensé (2 niveaux max) + tabs scrollables |
| **Cockpit** | sections 2–3 colonnes | 2 colonnes | 1–2 colonnes | 1 colonne, priorité « À surveiller » puis « Mission du jour » |
| **KPI** | 4–6 par ligne | 3–4 | 2 | 1–2 |
| **DataTable** | toutes colonnes | colonnes secondaires masquées | colonnes prioritaires + actions en menu | **mode carte** (row → card), tri/filtres en drawer |
| **Détail d'entité** | drawer latéral + page pleine | drawer | page pleine | page pleine, onglets empilés |
| **Formulaires** | 2 colonnes | 2 colonnes | 1 colonne | 1 colonne, champs pleine largeur |
| **POS** | grille produits + panier latéral | idem compacté | produits 2 col., panier en bas | produits 1–2 col., panier en sheet |
| **Charts** | pleine largeur + légende | pleine largeur | hauteur réduite | version simplifiée + valeurs en mono |
| **Command Center** | panneau 560 px centré | idem | pleine largeur | sheet plein écran |
| **Notification Center** | panneau latéral | panneau | sheet | sheet plein écran |
| **Toasts** | bas droite | bas droite | bas, pleine largeur | bas, pleine largeur |
| **Landing** | layout complet | complet | réorganisé | empilé |

Règles dures :

- **Le responsive ne supprime aucune fonctionnalité** (l. 8382).
- Les cibles tactiles et l'ordre de tabulation sont revus par breakpoint, pas seulement les largeurs.
- `prefers-reduced-motion: reduce` : animations quasi désactivées, transitions quasi
  instantanées, reveal affiché directement, scroll normal, **aucune donnée essentielle ne
  dépend d'une animation** (l. 8385–8398).

---

# PARTIE G — PARCOURS UTILISATEURS PRINCIPAUX

## 17. Parcours transverses

| # | Parcours | Étapes | Écrans traversés |
|---|---|---|---|
| **P1** | Découverte → inscription | landing → tarifs → inscription → onboarding 10 étapes → paiement → validation → première configuration → Cockpit | `/`, `/tarifs`, `/onboarding/*`, `/app` |
| **P2** | Première vente (zéro formation) | connexion → Cockpit → « Nouvelle vente » → POS → encaissement → reçu → notification au tenant central | `/app`, `/app/ventes/pos`, `/app/notifications` |
| **P3** | Créer un établissement | Établissements → nouveau → infos → calcul du supplément → soumission → attente validation concepteur → notification + confirmation premium → essai 7 jours | `/app/etablissements/nouveau`, `/console/etablissements/validation` |
| **P4** | Réapprovisionnement piloté | RADAR détecte un seuil → alerte → COPILOT explique → AUTOPILOT prépare la commande d'achat → validation → réception → mouvement de stock → audit | `/app/radar`, `/app/copilot`, `/app/autopilot`, `/app/achats`, `/app/stocks/mouvements` |
| **P5** | Relance des impayés | Mission du jour → AUTOPILOT (« relances factures > 15 jours ») → vérification des consentements et de l'éligibilité → aperçu → validation → file → webhooks → statistiques → audit | `/app`, `/app/autopilot`, `/app/whatsapp/*` |
| **P6** | Campagne WhatsApp responsable | campagne → template → audience → **exclusion automatique des non éligibles** → prévisualisation → coût estimé → approbation → planification → envoi → coût réel → rapport | `/app/whatsapp/campagnes/*` |
| **P7** | Comprendre une baisse de CA | COPILOT « pourquoi mon CA baisse ? » → constat chiffré → causes → données utilisées → recommandations → « Exécuter les recommandations » (workflow sécurisé) → audit | `/app/copilot`, `/app/indicateurs` |
| **P8** | Trésorerie sous tension | Cash Vision → bascule négative prévue → alerte → scénario (retarder une dépense / accélérer un encaissement) → décision → suivi | `/app/tresorerie/cash-vision`, `/app/depenses` |
| **P9** | Dépense → approbation → paiement | création → justificatif → en attente → approbation (permission) → payée / rejetée → comptabilisation → historique | `/app/depenses/{id}`, `/app/comptabilite` |
| **P10** | Livraison suivie | commande → préparation → affectation livreur → étiquette → statuts → livrée / échouée → statistiques (CA perdu) | `/app/livraisons/*` |
| **P11** | Opération hors connexion | perte de réseau → état `offline` → saisies journalisées → reprise → synchronisation idempotente → état `syncing` → résolu / conflit à trancher | toutes surfaces |
| **P12** | Contrôle côté concepteur | dashboard → établissement à valider → validation → module/prix modifié → réactivation d'un compte suspendu → reçu généré → audit | `/console/*` |
| **P13** | Consentement client | lien `/c/{token}` → préférences par catégorie → opt-out global ou partiel → preuve horodatée → historique immuable | `/c/{token}`, `/app/clients/{id}/consentements` |
| **P14** | Fin d'essai / suspension | essai 7 jours → échéance proche → relances → suspension (tenant + établissements) → réabonnement → validation concepteur → reçu → réactivation | `/app/abonnement`, `/console/abonnements` |

---

# PARTIE H — PLAN DE CONSTRUCTION

## 18. Découpage en lots (frontend uniquement, dans l'ordre)

> Chaque lot est livré au format imposé : Objectif · Écrans · Composants · UX · Design ·
> Responsive · Motion · États · Validation. **Un lot à la fois, puis STOP.**

| Lot | Nom | Contenu | Dépend de |
|---|---|---|---|
| **LOT 00** | Cadrage & contrat de tokens | ✅ Direction artistique tranchée (Annexe C.1 = Option A, C.5 = sombre). Tokens écrits (couleurs, typo, radius, spacing, ombres, motion, sémantique), thème sombre **et** clair, squelette de dépôt, outillage, conventions | Annexe C.1 |
| **LOT 01** | Fondations Design System | Primitives (Button, IconButton, Input, Search, Select, DatePicker, Checkbox, Radio, Switch, FileUpload, Badge, Avatar, Status, Alert, Skeleton, EmptyState, ErrorState, PermissionDenied, Offline/Syncing, Modal, Drawer, Toast) + galerie d'états | LOT 00 |
| **LOT 02** | App Shell | Sidebar (220/72 px, groupes, collapse), Topbar, ContextBar (breadcrumb, tabs à underline animé), sélecteur de portée, footer utilisateur, thème, layout responsive | LOT 01 |
| **LOT 03** | Data & Feedback | DataTable (tri, filtres, pagination, colonnes, actions au hover, mode carte mobile), KPI (count-up), Chart (reveal), Timeline, ActivityFeed, Progress, DataPanel, Kanban | LOT 01 |
| **LOT 04** | Command Center + Notification Center | Command palette (~560 px, clavier, sections), Notification Center (panneau, catégories, préférences), Toast lifecycle, raccourcis | LOT 02, LOT 03 |
| **LOT 05** | Cockpit | « Aujourd'hui dans votre entreprise » (À surveiller / Bonnes nouvelles), « Que voulez-vous faire ? », Mission du jour + impact estimé, KPI, chart principal | LOT 03, LOT 04 |
| **LOT 06** | Ventes & Commandes | POS, ventes, devis, factures, avoirs, paiements, détail, historique, impression (aperçu), états offline | LOT 03, LOT 05 |
| **LOT 07** | Stocks | vue d'ensemble, produits, catégories (+ génération IA), variantes/images, mouvements, inventaires, entrepôts | LOT 03, LOT 06 |
| **LOT 08** | CRM | clients, fiche + onglets, segments, VIP, prospects/pipeline, relances, consentements, `/c/{token}` | LOT 03, LOT 06 |
| **LOT 09** | Finance | trésorerie, Cash Vision, comptabilité, dépenses + approbations, devises | LOT 03, LOT 05 |
| **LOT 10** | Logistique & Fidélité | livraisons (statuts, livreurs, zones, étiquettes, stats), fidélité (points, niveaux, règles) | LOT 06, LOT 08 |
| **LOT 11** | Achats, Fournisseurs & RH | fournisseurs, commandes d'achat, réapprovisionnement ; RH (employés, présence, avances, masse salariale) | LOT 07, LOT 09 |
| **LOT 12** | WhatsApp | consentements, éligibilité (+ « pourquoi éligible ? »), templates, campagnes, file, coûts estimé/réel, qualité, audit, politique, budget | LOT 08 |
| **LOT 13** | Social Media | calendrier, éditeur + IA, prévisualisation, publication, analytics | LOT 04 |
| **LOT 14** | Intelligence | COPILOT, AUTOPILOT (aperçu → validation → exécution → journal), RADAR, CASH VISION, GUARDIAN | LOT 05, LOT 09, LOT 12 |
| **LOT 15** | Rapports, Indicateurs & Alertes | rapports, exports, KPI consolidés, score de santé, alertes + acquittement | LOT 03, LOT 14 |
| **LOT 16** | Automatisation | Workflow Builder (SI/ALORS/ET/SINON), historique d'exécution | LOT 14 |
| **LOT 17** | Documents | studio documentaire, éditeur visuel, variables, modèles, génération IA, reçu de caisse personnalisé | LOT 06 |
| **LOT 18** | Organisation & Système | établissements, utilisateurs & RBAC, paramètres, intégrations, Audit & Sécurité | LOT 02 |
| **LOT 19** | Abonnement & Onboarding | 10 étapes, plans, modules, simulateur de prix, échéance/statuts, paiements (UI), reçus | LOT 02, LOT 18 |
| **LOT 20** | Offline, PWA & synchronisation (UI) | états offline/syncing/conflit, journal local, installation, reprise | LOT 02, LOT 06 |
| **LOT 21** | Console Concepteur | dashboard, tenants, validations, abonnements, modules, revenus, reçus, santé, audit, assistant | LOT 02, LOT 19 |
| **LOT 22** | Landing Page | hero, 5 agents animés, showcase sticky, feature grid, stats, pricing, FAQ, CTA, footer | LOT 00, LOT 01 |
| **LOT 23** | Personal ERP | revenus, dépenses, épargne, objectifs, analyses (séparé du tenant) | LOT 09 |
| **LOT 24** | Consolidation & Validation Gate | accessibilité (contraste, focus, clavier, labels, reduced motion), i18n, performance UI, cohérence inter-modules, non-régression, **Frontend Validation Gate complète** | tous |

## 19. Ordre exact de construction

```
LOT 00 → 01 → 02 → 03 → 04 → 05
        → 06 → 07 → 08 → 09 → 10 → 11
        → 12 → 13
        → 14 → 15 → 16 → 17
        → 18 → 19 → 20 → 21
        → 22 → 23
        → 24 (Validation Gate)
        → [STOP : passage au backend uniquement après validation explicite]
```

## 20. Dépendances entre lots

| Dépendance | Nature |
|---|---|
| LOT 01 ← LOT 00 | aucune primitive sans tokens |
| LOT 02 ← LOT 01 | le shell consomme les primitives |
| LOT 03 ← LOT 01 | DataTable/KPI/Chart utilisent tokens + primitives |
| LOT 04 ← LOT 02 + 03 | le Command Center navigue vers des écrans et des entités déjà modélisés |
| LOT 05 ← LOT 03 + 04 | le Cockpit est une composition de KPI, charts, alertes et actions |
| LOT 06 ← LOT 03 | tables, formulaires, POS |
| LOT 07 ← LOT 06 | les mouvements découlent des ventes/achats |
| LOT 08 ← LOT 06 | l'historique client et la LTV dépendent des ventes |
| LOT 09 ← LOT 03 + 05 | agrégats financiers |
| LOT 10 ← LOT 06 + 08 | livraison d'une commande, points d'un client |
| LOT 11 ← LOT 07 + 09 | réapprovisionnement et masse salariale |
| LOT 12 ← LOT 08 | **l'éligibilité dépend du consentement** — ordre non négociable |
| LOT 13 ← LOT 04 | publication, notifications, files |
| LOT 14 ← LOT 05 + 09 + 12 | l'IA agit sur des surfaces déjà existantes |
| LOT 15 ← LOT 03 + 14 | indicateurs et alertes issus des modules et des signaux |
| LOT 16 ← LOT 14 | les automatisations déclenchent des actions d'agents/modules |
| LOT 17 ← LOT 06 | reçu de caisse = sortie d'une vente |
| LOT 18 ← LOT 02 | RBAC pilote la navigation du shell |
| LOT 19 ← LOT 02 + 18 | l'abonnement dépend de l'organisation et des rôles |
| LOT 20 ← LOT 02 + 06 | l'offline s'applique au shell et aux saisies critiques |
| LOT 21 ← LOT 02 + 19 | la console valide ce que le tenant demande |
| LOT 22 ← LOT 00 + 01 | la landing réutilise tokens et primitives (peut être avancée sur demande) |
| LOT 23 ← LOT 09 | réutilise les patterns financiers, données séparées |
| LOT 24 ← tous | la Gate ne se passe qu'après l'ensemble |

## 21. Frontend Validation Gate

Aucun passage au backend sans validation de **tous** les items suivants, lot par lot puis
globalement (mission §11 + corpus l. 8500–8530).

**DESIGN** — conformité au Design System canonique · hiérarchie · densité · respiration ·
couleurs · typographie (Space Grotesk / Inter / IBM Plex Mono) · sidebar conforme · topbar
conforme · tabs conformes · responsive.

**UX** — navigation · compréhension · parcours complets · actions réelles · feedback ·
cohérence inter-modules · empty states utiles · confirmations sur opérations critiques.

**UI** — composants · 15 états visuels obligatoires · formulaires · tables · graphiques ·
notifications · modales/drawers · erreurs non techniques · loading.

**MOTION** — transitions · micro-interactions · count-up KPI · reveal charts · navigation ·
notifications · durées dans les fourchettes canoniques · les 5 agents animés (landing).

**ACCESSIBILITÉ** — contraste · focus-visible · navigation clavier · labels · ARIA ·
`prefers-reduced-motion` · **la couleur n'est jamais le seul vecteur d'information**.

**QUALITÉ** — aucun écran cassé · aucun écran vide injustifié · aucun overflow · aucun
composant incohérent · aucun placeholder non assumé · **aucun faux bouton** · aucune donnée
mockée présentée comme réelle · aucune régression.

**VÉRITÉ** — chaque surface mockée est signalée comme telle ; aucune authentification,
sécurité ou API simulée présentée comme réelle.

> Règle du corpus : « le code compile » n'est **pas** une preuve que la fonctionnalité est
> terminée (l. 2981–2989).

## 22. Future phase backend (non démarrée)

Déclenchée **uniquement** après validation explicite du frontend. Périmètre à couvrir, dans
l'ordre :

1. Architecture serveur et contrats (API-first, l. 2412–2433).
2. Base de données, modèles, migrations.
3. Isolation multi-tenant effective à tous les étages.
4. Authentification et sessions.
5. RBAC et permissions granulaires côté serveur.
6. Logique métier par module (ventes, stocks, CRM, finance, livraisons, fidélité, WhatsApp, social).
7. Validation stricte des entrées, transactions, idempotence.
8. Journalisation et audit global.
9. Événements, notifications temps réel, queues, workers.
10. Synchronisation offline idempotente et résolution de conflits.
11. Intégrations externes derrière des couches abstraites (paiement, WhatsApp, réseaux sociaux).
12. Performance : pagination, index, cache, batch, agrégations, virtualisation.
13. Observabilité, sauvegardes, récupération.

Règles : pas de fausse API, pas de backend fictif présenté comme réel, ne pas construire une
architecture gigantesque avant de connaître les besoins réels — mais ne rien construire qui
bloque la croissance 100 → 100 000+ tenants.

## 23. Future phase sécurité (non démarrée)

Phase dédiée, après le backend, niveau **très élevé, défensif et auditable** — sans jamais
prétendre à l'« inviolable ».

Authentification robuste · autorisation · RBAC granulaire · sessions (expiration, révocation) ·
MFA/2FA · protection des secrets · chiffrement en transit · chiffrement au repos des données
sensibles · validation stricte · anti-injection · anti-XSS · CSRF · anti abus et brute force ·
rate limiting · sécurité API (OAuth 2.0, scopes, clés restreintes, révocation, audit) ·
sécurité des fichiers · audit trail · journalisation · détection d'anomalies · séparation des
privilèges · moindre privilège · gestion sécurisée des erreurs · sauvegardes · restauration ·
rotation des secrets · dépendances · headers de sécurité · isolation des environnements ·
tests de sécurité · analyse de vulnérabilités · tests de pénétration · vérification des
permissions · protection des données sensibles (RGPD + lois locales) · isolation multi-tenant
vérifiée par tests.

**Interdits absolus** : masquer un bouton, cacher une route, désactiver un élément frontend,
vérification uniquement côté client, authentification simulée, secrets dans le frontend,
confiance dans les données du navigateur.

## 24. Future phase tests, audit et non-régression (non démarrée)

À chaque lot et à chaque grande phase : navigation · routes · composants · formulaires ·
états · responsive · accessibilité · performance · logique métier · API · permissions ·
isolation tenant · sécurité · erreurs · récupération · queues · webhooks · offline ·
synchronisation · audit · régression (l. 2938–2959).

Après chaque correction : **vérifier que rien d'autre n'est cassé**. Une correction n'est
terminée qu'après vérification de non-régression (l. 2818–2847, 8399–8414).

Puis : tests de charge et scalabilité · observabilité · sauvegarde/restauration · audit final ·
finalisation.

---

# PARTIE I — ANNEXES

## Annexe A — Réconciliation terminologique

| Terme de la mission | Terme canonique retenu | Note |
|---|---|---|
| DIVINI | **DIVINI exo** | nom officiel (l. 169) |
| Cockpit | Cockpit (Dashboard intelligent) | « cockpit opérationnel moderne » (l. 7770) |
| Tableau de bord | fusionné dans Cockpit | éviter deux dashboards concurrents |
| Activités | Activité | flux temps réel + journal |
| Commandes | Ventes & Commandes | inclut POS, devis, factures, avoirs |
| Logistique | Livraisons | l. 1842–1879 |
| Indicateurs | Indicateurs | KPI consolidés + score de santé |
| Utilisateurs / Paramètres / Intégrations / Audit & Sécurité | identiques | navigation système |
| Boutique / point de vente / agence | **Établissement** | terme professionnel retenu (l. 353–401) |
| Command Center | Command Center (command palette canonique) | l. 7859, 7932–7939 |

## Annexe B — Ce qui est explicitement HORS PÉRIMÈTRE aujourd'hui

- tout écran, tout composant implémenté ;
- tout backend, API, base de données, migration ;
- toute authentification, session, RBAC effectif, sécurité serveur ;
- toute intégration réelle (Wave, Visa, Meta/WhatsApp, réseaux sociaux) ;
- toute donnée réelle : les futures données mockées seront **signalées comme mockées** ;
- tout choix de framework verrouillé (voir Annexe C.3).

## Annexe C — Points de décision ouverts

| # | Décision | Impact | Bloquant pour |
|---|---|---|---|
| **C.1** | ✅ **TRANCHÉ le 2026-08-28 — Option A** : corpus verrouillé (dark `#1C2126` + ambre `#F2A93B`, Space Grotesk/Inter/IBM Plex Mono). Aucune palette indigo/violette/ivoire ne sera introduite. | définit tous les tokens | clos |
| **C.2** | Portée multi-établissement : sélecteur global unique vs préfixe `/etablissements/{id}` dans chaque route | structure de routes et du shell | LOT 02 |
| **C.3** | Stack d'application (le corpus impose TypeScript + React, l. 2967/6143/6325, mais ne nomme aucun framework) | outillage, routing, build | LOT 00 |
| **C.4** | Densité par défaut (confortable vs compacte) pour les tables | DataTable, Cockpit | LOT 03 |
| **C.5** | ✅ **TRANCHÉ le 2026-08-28** : thème **sombre** par défaut à la première connexion ; bascule vers le clair disponible. | thème, onboarding | clos |
| **C.6** | Placement de la Landing dans la séquence (LOT 22 par défaut, avançable sur demande) | ordre de livraison | planning |

---

**Fin du document — aucun lot démarré, aucun écran produit, aucun composant écrit.
Décisions enregistrées : Annexe C.1 (direction artistique = corpus verrouillé) et Annexe C.5
(thème sombre par défaut). Points encore ouverts : C.2, C.3, C.4, C.6.**
