# LOT 18 — Organisation & Système

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 02 (validé). **Débloque** : LOT 19.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire la **navigation système** : établissements, utilisateurs et rôles (RBAC), paramètres,
intégrations, audit et sécurité.

Ces écrans portent une exigence particulière : ils **affichent** des règles de contrôle sans
jamais les **appliquer** réellement (l'application réelle est côté serveur, phase sécurité).
L'interface doit donc être explicite sur ce point, conformément à l'interdiction de toute
« sécurité cosmétique » (mission §18).

## 2. Périmètre

### 2.1 Établissements (l. 353–401)

1. **Liste** : établissements du tenant, statut, essai restant, utilisateurs, activité.
2. **Fiche** : informations, utilisateurs autorisés, caisse, activité, statistiques propres.
3. **Création** — parcours canonique :
   `saisir les informations → calculer le supplément tarifaire → ajouter à l'abonnement →
   créer la demande → soumettre au concepteur → attendre la validation → notification →
   activation → essai 7 jours`.
4. **Supplément tarifaire** affiché avant soumission, avec détail du calcul.
5. **Écran d'attente de validation** : état explicite « en attente de validation par le
   concepteur », avec ce qui se passera ensuite.
6. **Confirmation premium** : écran de félicitation à la validation.
   ⚠️ **L'animation Lottie de confettis** (seule animation de ce type autorisée dans tout le
   produit, l. 393–397) est **préparée mais désactivée** dans ce lot : elle ne doit se déclencher
   que sur une validation **réelle** du concepteur, qui n'existe pas encore en phase frontend.
   L'écran affiche donc l'état « validation en attente (démonstration) ».
7. **Consolidation** : vue consolidée pour le tenant central, vue restreinte pour un
   établissement.

### 2.2 Utilisateurs & RBAC (l. 2362–2389)

1. **Utilisateurs** : liste, fiche, rôle, établissements autorisés, statut, dernière activité,
   invitation (UI), révocation.
2. **Rôles** : rôles configurables, matrice de permissions par rôle.
3. **Permissions granulaires** du corpus : `client.view`, `client.create`, `client.update`,
   `stock.view`, `stock.create`, `sale.create`, `sale.cancel`, `finance.view`, `finance.approve`,
   `consent.view`, `consent.create`, `consent.revoke`, `whatsapp.campaign.create`,
   `whatsapp.campaign.approve`, `whatsapp.campaign.send`, `whatsapp.template.manage`, etc.
4. **Effet visible** : le rôle sélectionné dans l'interface pilote les états
   `permission denied` des modules déjà livrés — c'est une **simulation d'affichage**, annoncée
   comme telle.
5. **Avertissement permanent** : « Les permissions affichées sont une simulation d'interface.
   Le contrôle réel sera appliqué côté serveur. »

### 2.3 Paramètres

Organisation · devise · numérotation · préférences (densité, thème, langue) · notifications ·
zones et tarifs · règles métier configurables (VIP, fidélité, seuils) · données et export.

### 2.4 Intégrations (l. 2451–2467)

Application · permissions (scopes) · dernière utilisation · activité · statut ·
**révocation immédiate**. Accès au Developer Portal (clés, sandbox, webhooks — surfaces
annoncées, non fonctionnelles).

### 2.5 Audit & Sécurité (l. 2390–2411)

1. **Journal global** : qui · quoi · quand · où · tenant · établissement · **ancienne valeur** ·
   **nouvelle valeur** · résultat · contexte · IP si applicable.
2. Filtres par acteur, module, période, gravité, établissement.
3. **Sessions** : sessions actives, appareil, dernière activité, révocation (UI).
4. **Événements de sécurité** : connexions, échecs, changements de permissions, révocations.
5. **Règle** : aucun événement d'audit supprimé silencieusement — l'interface n'offre aucune
   action de suppression.

### 2.6 Exclu (reporté)

- Contrôle réel des permissions, sessions réelles, MFA/2FA, chiffrement, rate limiting →
  phase sécurité.
- Validation réelle d'un établissement par le concepteur → LOT 21 (UI) puis backend.
- Envoi réel d'invitations → backend.
- Connexion réelle d'une intégration → backend.

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/etablissements` · `/{id}` · `/nouveau` | Établissements | N1 + N2 |
| `/app/etablissements/{id}/attente` | Attente de validation | N2 |
| `/app/utilisateurs` · `/{id}` · `/nouveau` | Utilisateurs | N2 |
| `/app/roles` · `/{id}` | Rôles et matrice de permissions | N2 |
| `/app/parametres` (+ sous-sections) | Paramètres | N2 |
| `/app/integrations` · `/{id}` | Intégrations | N2 |
| `/app/audit` | Journal global | N2 |
| `/app/securite` | Sessions et événements | N2 |

## 4. Composants concernés

**Créés** : EstablishmentList, EstablishmentCard, EstablishmentForm, SurchargeCalculator,
SurchargeBreakdown, ValidationPendingScreen, ValidationConfirmedScreen, TrialCountdownBadge,
ConsolidatedSwitch, UserList, UserForm, RoleList, PermissionMatrix, PermissionToggle,
RoleEffectPreview, SecurityDisclaimer, SettingsLayout, SettingsSection, CurrencySettings,
NumberingSettings, PreferenceSettings, BusinessRuleSettings, IntegrationList,
IntegrationCard, ScopeList, RevokeAction, DeveloperPortalLink, AuditTable, AuditDetail,
AuditValueDiff, SessionList, SessionRevokeAction, SecurityEventTimeline.
**Réutilisés** : DataTable, KpiCard, DataPanel, Timeline, Badge, StatusDot, SeverityIndicator,
Avatar, Button, IconButton, Search, Select, Input, DatePicker, Checkbox, Switch, Radio,
Modal, Drawer, ConfirmDialog, EmptyState, Skeleton, ErrorState, PermissionDenied, OfflineState.

## 5. UX

- **Créer un établissement sans surprise** : le supplément tarifaire est affiché **avant** la
  soumission, avec son détail ; l'attente de validation est explicite et dit ce qui suit.
- **Comprendre un rôle** : la matrice de permissions se lit par module et par action ; un
  aperçu montre l'effet du rôle sur l'interface.
- **Paramétrer sans casser** : chaque réglage sensible (devise, numérotation, règle métier)
  explique sa portée et ses conséquences.
- **Révoquer vite** : une intégration ou une session se révoque en une action confirmée.
- **Auditer sérieusement** : le journal montre l'ancienne et la nouvelle valeur ; aucune action
  de suppression n'est proposée.
- **Ne jamais laisser croire à une sécurité active** : l'avertissement de simulation est
  visible sur les écrans de permissions et de sécurité.

## 6. Design — application stricte du Design System

- Matrice de permissions : table dense, cases sobres, accordé = SUCCESS discret,
  refusé = neutre, partiel = ATTENTION — **toujours avec symbole en plus de la couleur**.
- Journal d'audit : table dense, horodatages et identifiants en **IBM Plex Mono**, différence
  ancienne/nouvelle valeur mise en évidence par libellé.
- Écran d'attente de validation : sobre, informatif, **sans animation**.
- Écran de confirmation : premium mais sobre ; emplacement du Lottie réservé, non actif.
- Avertissement de simulation : bandeau discret en `--muted`, permanent, non masquable.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Établissements | grille de cartes | 2–3 colonnes | 2 | 1 colonne |
| Utilisateurs | table complète | colonnes réduites | colonnes prioritaires | mode carte |
| Matrice de permissions | table complète | défilement horizontal | **vue par module** | vue par module, accordéon |
| Paramètres | navigation latérale + contenu | idem | 1 colonne | 1 colonne, sections en accordéon |
| Journal d'audit | table complète | colonnes réduites | colonnes prioritaires | mode carte + détail |
| Sessions | table | table | condensée | mode carte |

## 8. Motion

- Transitions d'écran : 220–320 ms.
- Bascule de consolidation : 220–320 ms.
- Révocation : confirmation puis sortie discrète 140–220 ms.
- **Aucune animation sur l'écran d'attente de validation** ; Lottie réservé et inactif.
- `prefers-reduced-motion` : transitions quasi instantanées.

## 9. États

- **Établissement** : actif, en attente de validation, validé, essai en cours, essai expiré,
  suspendu, refusé, archivé, permission denied.
- **Utilisateur** : actif, invité, suspendu, révoqué, sans rôle, accès restreint à un
  établissement.
- **Rôle / permission** : accordée, refusée, partielle, héritée, modifiable, verrouillée.
- **Intégration** : connectée, expirée, révoquée, scope insuffisant, jamais utilisée.
- **Audit** : journal vide, chargé, filtré, détail disponible, détail incomplet.
- **Sessions** : active, expirée, révoquée, appareil inconnu.

## 10. Données

Mockées et **signalées** :
- établissements, utilisateurs, rôles et permissions de démonstration ;
- journal d'audit cohérent avec les actions réalisées dans les modules déjà livrés ;
- intégrations de démonstration, sans connexion réelle ;
- sessions simulées.

Aucune donnée personnelle réelle, aucune invitation réelle, aucune révocation réelle.

## 11. Interdits spécifiques au lot

- Laisser croire que les permissions affichées sont appliquées.
- Proposer une action de suppression d'un événement d'audit.
- Déclencher l'animation de confettis sans validation réelle.
- Simuler une authentification, une session sécurisée ou un MFA.
- Révoquer réellement quoi que ce soit.
- Afficher un supplément tarifaire sans détail de calcul.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 353–401, 2362–2507), vérifier le shell (LOT 02) et les états
  `permission denied` des modules livrés.
- **B** : annoncer fichiers, matrice de permissions, structure du journal, stratégie de test.
- **C** : construire établissements, utilisateurs, rôles, paramètres, intégrations, audit,
  sécurité.
- **D** : brancher le rôle sélectionné sur les états `permission denied` des modules livrés ;
  préparer l'écran de validation pour le LOT 21.
- **E** : tester le parcours de création d'établissement, la matrice de permissions et son effet,
  les révocations confirmées, les filtres d'audit, les 4 breakpoints, les deux thèmes, clavier,
  reduced-motion.
- **F** : corriger toute ambiguïté de permission, overflow, focus, états manquants.
- **G** : valider lorsque chaque écran de contrôle indique clairement ce qui est simulé.

## 13. Validation — checklist

- [ ] Établissements : liste, fiche, création, supplément tarifaire détaillé, soumission.
- [ ] Écran d'attente de validation explicite, sans animation.
- [ ] Écran de confirmation préparé, **Lottie confettis réservé et inactif**.
- [ ] Essai 7 jours affiché avec décompte.
- [ ] Consolidation tenant / établissement.
- [ ] Utilisateurs : liste, fiche, rôles, établissements autorisés, invitation (UI), révocation.
- [ ] Matrice de permissions granulaires conforme au corpus, rôles configurables.
- [ ] Effet du rôle visible sur les modules livrés.
- [ ] **Avertissement de simulation permanent** sur permissions et sécurité.
- [ ] Paramètres : organisation, devise, numérotation, préférences, notifications, règles métier.
- [ ] Intégrations : scopes, dernière utilisation, activité, statut, révocation immédiate.
- [ ] Journal d'audit complet avec ancienne / nouvelle valeur, **sans action de suppression**.
- [ ] Sessions et événements de sécurité.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 17.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la matrice de permissions livrée, ce qui est
explicitement simulé, l'état du Lottie (réservé, inactif), et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 19.
