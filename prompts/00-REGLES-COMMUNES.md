# DIVINI exo — RÈGLES COMMUNES À TOUS LES LOTS

> **Ce fichier est le socle canonique.** Il doit être lu **avant** n'importe quel prompt de lot
> (`prompts/LOT-*.md`). Aucun lot ne le réécrit : il le référence.
>
> Sources : `MASTER_PROMPT_V3_VERROUILLE_DIVINI_EXO_SILO.txt` (corpus verrouillé, 9 858 lignes)
> et `docs/00-architecture/DIVINI-ARCHITECTURE-BLUEPRINT.md` (architecture validée).
> Les numéros de ligne cités renvoient au corpus.

---

## 1. Identité et terminologie

- Nom officiel : **DIVINI exo** (l. 169). Utilisé de manière cohérente partout.
- Marché de référence : **Côte d'Ivoire**. Devise native : **FCFA / XOF** (l. 191–199).
- Terminologie obligatoire : **tenant** (entreprise cliente), **établissement** (point de
  vente / agence / boutique / entrepôt), **concepteur** (créateur du SaaS).
- Les 5 agents : **COPILOT · AUTOPILOT · RADAR · CASH VISION · GUARDIAN**.
- Langue de l'interface : **français (fr-FR)** natif, architecture i18n extensible (l. 3127–3145).

## 2. Direction artistique — DÉCISION VERROUILLÉE

**Option A retenue le 2026-08-28** (Annexe C.1 du blueprint) : le corpus verrouillé fait foi.

- Thème **sombre par défaut** (Annexe C.5). Le clair est une bascule, jamais une autre direction.
- **Interdiction absolue** d'introduire une palette indigo / violette / ivoire : « indigo » et
  « violet » ont **0 occurrence** dans le corpus, « ivoire » n'y apparaît que dans
  « Côte d'Ivoire ».
- Ambiance : cockpit opérationnel moderne — premium, technique, contemporain, sobre, précis,
  confiant, dense mais aéré (l. 7753–7784).
- Interdits visuels : dashboard générique, effet template SaaS, surcharge de cartes,
  glassmorphism excessif, gradients omniprésents, néons gratuits, animations décoratives
  permanentes (l. 7772–7784).

### 2.1 Tokens de couleur (thème sombre — valeurs canoniques, l. 7785–7799)

```
--bg          : #1C2126        --panel       : #22282E        --text        : #E7EBEE
--bg-2        : #171B1F        --panel-2     : #262D34        --muted       : #93A0AB
--border      : #333B43        --accent      : #F2A93B        --info        : #4FC7B9
--border-soft : #2A3038        --accent-soft : rgba(242,169,59,0.14)
                               --positive    : #6FCF97        --negative    : #E0785F
```

### 2.2 Couleurs sémantiques (l. 7951–7963)

| Sémantique | Couleur | Règle |
|---|---|---|
| INFO | `#4FC7B9` | information neutre |
| SUCCESS | `#6FCF97` | réussite réelle |
| ATTENTION | `#F2A93B` | à surveiller (même teinte que l'accent : ne jamais l'utiliser comme décoration) |
| CRITIQUE | `#E0785F` | gravité réelle — **jamais décoratif** |

> La couleur exprime la gravité réelle et **n'est jamais le seul vecteur d'information**
> (icône + texte obligatoires en complément).

### 2.3 ⚠️ Thème clair — point honnête à traiter en LOT 00

Le corpus **impose** un thème clair (l. 7824–7844) mais **ne fournit aucune valeur
hexadécimale** pour celui-ci : vérification faite, les 20 couleurs hexadécimales distinctes
du corpus appartiennent toutes au thème sombre (ou à des détails du CSS de référence).

Conséquence : le thème clair doit être **dérivé** comme *DARK SYSTEM → LIGHT SURFACE
TRANSLATION* (mêmes hiérarchies de surfaces, bordures fines, contraste doux, accent ambre
identique, couleurs sémantiques identiques, densité maîtrisée) et **ses valeurs dérivées
doivent être présentées pour validation en LOT 00** — elles ne sont pas canoniques par défaut.

### 2.4 Typographie (l. 7801–7811)

| Rôle | Police | Usage exclusif |
|---|---|---|
| `--font-display` | **Space Grotesk** | titres, identité, headings, grands chiffres structurants |
| `--font-body` | **Inter** | interface, textes, formulaires, tableaux, navigation |
| `--font-mono` | **IBM Plex Mono** | KPI, valeurs, identifiants, références, données techniques |

Aucune autre police. Aucune police décorative.

### 2.5 Rayons (l. 7812–7819)

`6 px` controls compacts · `8 px` buttons / nav / icônes · `10 px` cartes standard ·
`12–14 px` surfaces importantes · `16 px` mockups · `18–22 px` grands blocs marketing.
**Aucun autre rayon.**

### 2.6 Motion (l. 7820–7823, 7987–8010)

Easing canonique unique : `cubic-bezier(.2,.8,.2,1)`.

| Usage | Durée |
|---|---|
| micro-interaction | 140–220 ms |
| changement d'état | 220–320 ms |
| panel / sidebar | 320 ms |
| transition narrative | 420 ms |
| reveal | 700 ms |
| count-up KPI | 1 100–1 200 ms |
| tabs (underline) | ~280 ms |

Interdits : bounce permanent, rotation décorative, zoom agressif, animation constante de tous
les éléments, mouvement sans information. **Une seule animation Lottie autorisée dans tout le
produit : les confettis de confirmation de création d'établissement** (l. 393–397).

## 3. Les 15 états visuels obligatoires (l. 7964–7984)

Chaque composant pertinent prévoit : `default · hover · active · focus-visible · disabled ·
loading · success · info · warning · error · critical · empty · offline · syncing ·
permission denied`.

> « Le visuel ne doit jamais mentir sur l'état réel du système. » (l. 7984)

États d'écran obligatoires en plus : **chargement** (skeletons), **vide utile** (l. 3204–3219),
**erreur non technique** (l. 3221–3235), **permission refusée**, **module non activé**,
**hors ligne**.

## 4. Responsive canonique (l. 8359–8382)

| Largeur | ERP | Landing |
|---|---|---|
| `> 980 px` | grille complète | layout complet |
| `≤ 980 px` | réduction des colonnes (KPI 2 col.) | hero réorganisé, showcase en colonne, grids 2 col., pricing 1 col. |
| `≤ 720 px` | sidebar compacte 72 px, labels masqués, grilles 1 col. | — |
| `≤ 560 px` | — | mockup empilé, agents 1 col., footer 1 col. |

**Le responsive ne supprime aucune fonctionnalité** (l. 8382). Un module ne devient jamais
inutilisable sur petit écran (l. 2697).

## 5. Accessibilité (l. 8385–8398)

- `@media (prefers-reduced-motion: reduce)` : animations quasi désactivées, transitions quasi
  instantanées, reveal affiché directement, scroll normal.
- **Aucune donnée essentielle ne dépend d'une animation.**
- Contraste suffisant, `focus-visible` toujours visible, navigation clavier complète, labels
  explicites, ARIA correct, couleur jamais seule.

## 6. Règles de vérité — non négociables

1. **MOCK ≠ FAUSSE FONCTIONNALITÉ.** Toute donnée simulée est signalée comme telle dans l'UI.
2. **Aucun faux bouton** : chaque action visible correspond à une fonction réelle du frontend
   (l. 2784–2800). Si la fonction n'existe pas encore, l'action n'est pas affichée.
3. Aucune API, authentification, permission ou sécurité **simulée et présentée comme réelle**.
4. Aucun contenu de démonstration externe repris comme donnée réelle (l. 8334–8358 : aucune
   donnée, tarif, société, témoignage ou statistique d'une source de référence visuelle).
5. Ne jamais déclarer « terminé / validé / fonctionnel / sécurisé / testé » sans vérification
   réelle correspondante.
6. Toute valeur externe (règles Meta, tarifs, taux, quotas) est **centralisée et configurable**,
   jamais codée en dur dans un composant (l. 6143).

## 7. Périmètre de la phase en cours — FRONTEND ONLY

La mission impose **DESIGN FIRST / FRONTEND FIRST**. Pendant les lots 00 → 24 :

**Autorisé** : UI complète, interactions réelles, transitions, filtres sur données locales,
tableaux et graphiques alimentés par données mockées réalistes, navigation, états,
accessibilité, responsive, motion.

**Interdit** : backend, API, base de données, migrations, authentification réelle, sécurité
serveur, intégrations réelles (Wave, Visa, Meta, réseaux sociaux), logique métier persistée.

> **Tension assumée et documentée** : le corpus §105 (l. 2862–2875) demande frontend et backend
> en parallèle ; la mission impose le frontend d'abord. C'est la **mission qui pilote la
> séquence** ; l'exigence de fond du corpus (ne jamais repousser l'interface à la fin) est
> respectée puisque l'interface est construite en premier et validée avant tout backend.

## 8. Méthode d'exécution de chaque lot (l. 2876–2937)

`A ANALYSER → B PLANIFIER → C CONSTRUIRE → D INTÉGRER → E TESTER → F CORRIGER → G VALIDER`
(→ DOCUMENTER, l. 3516–3527)

- **A** : lire l'existant avant de modifier ; identifier fichiers, composants, tokens, états,
  routes déjà présents (l. 96–113).
- **B** : annoncer fichiers créés / modifiés, composants, routes, états, tests, dépendances,
  risques, stratégie de non-régression.
- **C** : construire réellement, sans placeholder non assumé.
- **D** : intégrer au shell et aux modules déjà livrés.
- **E** : tester réellement (navigation, états, responsive, clavier, reduced motion).
- **F** : corriger les problèmes détectés, réellement.
- **G** : valider uniquement lorsque le parcours est cohérent. « Le code compile » n'est pas
  une preuve (l. 2981–2989).

## 9. Non-régression (l. 2818–2847, 8399–8414)

Avant de créer un composant, un service, un type ou un état : **vérifier s'il existe déjà** et
le réutiliser (l. 3423–3439).

Une modification de composant vérifie : même comportement, mêmes permissions, mêmes données,
mêmes états, même navigation, même validation, même persistance, même sécurité.
**Modifier CSS / layout / motion ≠ modifier la logique.**

Aucune correction n'est terminée sans vérification de non-régression.

## 10. Rapport obligatoire après chaque lot (l. 3528–3567)

```
1. IMPLÉMENTÉ            — liste précise de ce qui a été créé / modifié
2. VISIBLE MAINTENANT    — ce qui est réellement visible dans le frontend
3. MOCKÉ / NON CONNECTÉ  — ce qui est simulé, et où (obligatoire en phase frontend)
4. TESTS EFFECTUÉS       — tests réellement exécutés + résultat
5. ERREURS RENCONTRÉES   — erreurs et corrections
6. RÉGRESSIONS           — régression détectée : oui / non, laquelle
7. AVANCEMENT GLOBAL     — AVANCEMENT GLOBAL : XX %   (jamais gonflé)
```

## 11. Règle d'arrêt

Après chaque lot : **STOP**. Attendre l'instruction explicite.
Un lot n'est terminé qu'après : `construction → inspection → correction → validation explicite`.
Ne jamais supposer qu'un lot est validé parce qu'il fonctionne techniquement.

## 12. Ordre de priorité en cas de conflit (l. 11–23, 3606–3626, 8497)

Sécurité · Intégrité des données · Isolation multi-tenant · Conformité · Logique métier ·
Fiabilité · Performance · Scalabilité · Extensibilité · UX · Esthétique · Animation.

Pour un conflit d'implémentation visuelle : **FONCTIONNALITÉ > UX > ESTHÉTIQUE > ANIMATION**.
Pour un conflit de phase : **QUALITÉ DE L'INTERFACE > rapidité**, **FIDÉLITÉ AU DESIGN SYSTEM >
simplicité d'implémentation**, **QUALITÉ > quantité d'écrans**.
