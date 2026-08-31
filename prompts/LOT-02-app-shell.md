# LOT 02 — App Shell

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 01 (validé). **Débloque** : LOT 04, 18, 19, 20, 21.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire l'**App Shell** canonique de l'Interface Marchand : sidebar, topbar, barre de
contexte, sélecteur de portée, thème, pied utilisateur et layout responsive — ainsi que la
**navigation générée** depuis un manifeste de modules.

Après ce lot, tous les modules des lots 05 à 23 s'insèrent dans un cadre déjà stable : aucun
module n'aura à redéfinir sa propre chrome.

## 2. Périmètre

### 2.1 Inclus

1. **Sidebar** conforme au corpus (l. 7861–7872) :
   - ouverte ~220 px, compacte ~72 px, transition de largeur ~320 ms ;
   - fond `--panel`, `border-right` 1 px `--border` ;
   - icônes linéaires, labels mutés ;
   - item actif `--accent-soft` + `--accent` ; hover `--panel-2` + `--text` ;
   - bouton de collapse ; pied utilisateur discret.
2. **Groupes de navigation** conformément au blueprint §9 : OPÉRATIONS · FINANCE ·
   INTELLIGENCE · COMMUNICATION · PILOTAGE · ORGANISATION · SYSTÈME — 7 groupes maximum,
   5 à 7 entrées par groupe.
3. **Navigation générée** : la sidebar est produite à partir d'un **manifeste** (module,
   identifiant, groupe, icône, permission requise, statut). Aucun item codé en dur.
   Statuts possibles : `disponible` · `planifié` · `non activé`.
   - `planifié` → état explicite « en construction — LOT nn », **n'ouvre aucun écran fictif** ;
   - `non activé` → renvoie vers Abonnement → Modules, jamais un simple masquage (l. 451).
4. **Topbar** conforme (l. 7873–7880) : compacte, `border-bottom`, recherche type control avec
   raccourci clavier affiché en IBM Plex Mono, actions à droite, CTA primaire ambre.
5. **Barre de contexte** : breadcrumb (obligatoire dès H3), titre de page, portée active, tabs
   de module, filtres actifs.
6. **Sélecteur de portée** : tenant ⇄ établissements, avec consolidation visible.
7. **Indicateur offline / synchronisation permanent** (l'application est offline-first).
8. **Pied utilisateur** : avatar, nom, rôle, établissement, accès thème / paramètres / aide.
9. **Bascule de thème** : sombre par défaut (décision C.5), clair disponible, préférence
   mémorisée.
10. **Layout responsive** complet (voir §7) et **zone de travail** générique.
11. **États globaux du shell** : thème, portée, manifeste de modules, statut de connexion,
    préférences de densité.
12. **Route technique interne** `/dev/shell` pour isoler les variations du shell.

### 2.2 Exclu (reporté)

- Command Center et Notification Center → **LOT 04** (la recherche de la topbar ouvre un
  état « à venir » explicite, pas un panneau vide).
- Tout écran de module (Cockpit → LOT 05, etc.).
- Toute authentification réelle, toute permission effective.

### 2.3 Décision à confirmer en ouverture de lot

| Réf blueprint | Décision | Impact |
|---|---|---|
| **C.2** | Portée multi-établissement : **sélecteur global** vs préfixe `/etablissements/{id}` dans chaque route | structure des routes et du breadcrumb |

## 3. Écrans concernés

| Route | Écran | Niveau ERP | Note |
|---|---|---|---|
| `/app` | Coquille + zone de travail | — | zone de travail en **EmptyState assumé** jusqu'au LOT 05 : elle annonce ce qui arrivera, lot par lot. Aucun faux dashboard. |
| `/dev/shell` | Variations techniques du shell (ouverte/compacte, thèmes, portées, statuts) | — | outil interne |

## 4. Composants concernés

**Créés** : AppShell, Sidebar, SidebarGroup, SidebarItem, ScopeSwitcher, Topbar, SearchTrigger,
ContextBar, Breadcrumb, ModuleTabs, UserFooter, ConnectionStatus, ThemeToggle, WorkspaceLayout.
**Réutilisés** : Button, IconButton, Avatar, Badge, StatusDot, EmptyState, Dropdown, Modal,
tous les tokens LOT 00.

## 5. UX

- **Entrée** : l'utilisateur arrive sur `/app`, comprend immédiatement où il est (portée,
  module actif, breadcrumb) et ce qu'il peut faire (CTA primaire de la topbar).
- **Sortie** : toute navigation passe par la sidebar, le breadcrumb ou les tabs ; le contexte
  n'est jamais perdu lors d'un changement d'onglet.
- **Changement de portée** : toujours visible dans la topbar, persistant pendant la session,
  confirmé lorsqu'il change le jeu de données affiché.
- **Collapse** : la sidebar passe de 220 à 72 px sans masquer l'information essentielle ; les
  libellés deviennent des infobulles au survol.
- **Recherche** : le déclencheur affiche son raccourci clavier ; en attendant le LOT 04, il
  ouvre un état explicite « Command Center — LOT 04 », pas un champ inerte.
- **Honnêteté sur la session** : le pied utilisateur affiche une **session de démonstration**,
  clairement identifiée comme telle. Aucune authentification réelle, aucune sécurité simulée
  présentée comme réelle (socle commun §6.3).
- **Zéro formation** : libellés en langage naturel, pas de jargon technique (l. 3184–3203).

## 6. Design — application stricte du Design System

- Valeurs de sidebar, topbar et tabs **exactement** celles du corpus (l. 7861–7889).
- Sidebar : fond `--panel`, jamais une couleur de marque pleine ; l'accent n'apparaît que sur
  l'item actif et le CTA primaire.
- Tabs : labels mutés, actif `--text`, underline 2 px `--accent`, position et largeur
  **interpolées**, jamais de changement brutal.
- Workspace : `--bg`, cartes sur `--panel`, bordures `--border` / `--border-soft`.
- Densité maîtrisée : respiration réelle entre groupes, aucune surcharge de cartes (l. 2657).
- Badge de compteur **uniquement** s'il porte une information actionnable.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Sidebar | ouverte 220 px, collapsible 72 px | ouverte ou compacte selon préférence | **compacte 72 px** + drawer à la demande | **masquée** → drawer plein écran depuis la topbar |
| Topbar | complète | complète | recherche réduite à l'icône | recherche icône, actions en menu |
| ContextBar | breadcrumb + tabs inline | inline | tabs scrollables horizontalement | breadcrumb condensé (2 niveaux max) + tabs scrollables |
| Zone de travail | pleine largeur bornée | pleine largeur | marges réduites | pleine largeur, empilement |
| Sélecteur de portée | dans la topbar | dans la topbar | icône + nom court | dans le drawer |
| Pied utilisateur | en bas de sidebar | en bas de sidebar | icône seule | en haut du drawer |

Aucune fonctionnalité supprimée sur petit écran (l. 8382). Aucun overflow horizontal.

## 8. Motion

- Largeur de sidebar : **320 ms**, easing canonique.
- Underline des tabs : **~280 ms**, position et largeur interpolées.
- Ouverture du drawer mobile : 320 ms, overlay translucide.
- Apparition des infobulles (sidebar compacte) : 140–220 ms.
- Bascule de thème : transition courte et douce, **sans flash** ; aucune animation décorative
  permanente dans la chrome.
- `prefers-reduced-motion` : transitions quasi instantanées, underline positionné directement.

## 9. États

- **SidebarItem** : default, hover, active, focus-visible, disabled, `permission denied`,
  `planifié`, `non activé`, loading (manifeste en chargement).
- **Topbar / SearchTrigger** : default, hover, focus-visible, disabled.
- **ScopeSwitcher** : default, hover, ouvert, sélectionné, loading, error.
- **ConnectionStatus** : `online` · `offline` · `syncing` · `conflit` · `erreur de
  synchronisation` — visible en permanence.
- **ThemeToggle** : sombre / clair, focus-visible.
- **WorkspaceLayout** : loading (skeleton), empty (EmptyState assumé), error, permission denied.
- **Breadcrumb / Tabs** : état courant, état survolé, état focus, overflow (tabs scrollables).

## 10. Données

Mockées et **signalées comme telles** :
- manifeste de navigation (modules, groupes, statuts) ;
- liste d'établissements de démonstration (noms fictifs neutres, aucun contenu de source
  externe — l. 8334–8358) ;
- identité de session de démonstration.

Aucune donnée financière, aucune statistique, aucun chiffre d'entreprise fictif dans ce lot.

## 11. Interdits spécifiques au lot

- Créer un écran de module (Cockpit, Ventes, Stocks…).
- Créer le Command Center ou le Notification Center.
- Implémenter une authentification, même simulée, ou masquer l'absence d'authentification.
- Coder un item de navigation en dur hors manifeste.
- Masquer silencieusement un module non activé (l. 451).
- Utiliser une couleur de marque pleine en fond de sidebar.
- Trancher seul la décision C.2.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 7845–7889), le blueprint §8–§9, les tokens et primitives livrés ;
  confirmer C.2.
- **B** : annoncer fichiers créés, structure du manifeste, stratégie de test.
- **C** : construire le shell, la navigation générée, les états globaux.
- **D** : intégrer les primitives LOT 01 et les tokens LOT 00 ; monter `/app` et `/dev/shell`.
- **E** : tester collapse, drawer, tabs, portée, thème, les 4 breakpoints, clavier, focus,
  reduced-motion, les deux thèmes.
- **F** : corriger overflow, focus perdus, transitions brusques, états manquants.
- **G** : valider lorsque le shell est stable, cohérent sur les deux thèmes et les 4
  breakpoints, sans régression sur LOT 00/01.

## 13. Validation — checklist

- [ ] Sidebar : 220 px / 72 px, transition 320 ms, fond `--panel`, `border-right`, icônes
      linéaires, labels mutés, actif `--accent-soft` + `--accent`, hover `--panel-2` + `--text`,
      pied utilisateur discret.
- [ ] 7 groupes maximum, 5 à 7 entrées par groupe, navigation **générée** depuis le manifeste.
- [ ] Statuts `planifié` et `non activé` explicites ; aucun écran fictif ; aucun masquage
      silencieux.
- [ ] Topbar : compacte, `border-bottom`, recherche avec raccourci en mono, actions à droite,
      CTA primaire ambre.
- [ ] Tabs : underline 2 px interpolé ~280 ms, jamais brutal.
- [ ] Sélecteur de portée visible et persistant ; décision C.2 appliquée et tracée.
- [ ] Indicateur offline / synchronisation permanent.
- [ ] Thème sombre par défaut, bascule fonctionnelle, préférence mémorisée, aucun flash.
- [ ] Les 4 breakpoints conformes au §7, aucun overflow, aucune fonctionnalité supprimée.
- [ ] Navigation clavier complète, focus-visible visible, `Escape` ferme le drawer.
- [ ] `prefers-reduced-motion` respecté.
- [ ] Session de démonstration clairement identifiée ; aucune sécurité simulée présentée comme
      réelle.
- [ ] Zone de travail en EmptyState assumé annonçant les lots à venir.
- [ ] Aucune régression sur LOT 00 et LOT 01.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la structure du manifeste de navigation, les statuts
de modules affichés, la décision C.2 appliquée, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 03.
