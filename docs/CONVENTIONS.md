# DIVINI exo — Conventions de conception

Statut : **LOT 00 — cadrage et contrat de tokens.**
Ce document est normatif. Toute dérogation doit être justifiée par écrit, pas décidée dans le code.

Références : corpus verrouillé `MASTER_PROMPT_V3_VERROUILLE_DIVINI_EXO_SILO.txt`,
Design System V2 (l. 7698–8530), blueprint `docs/00-architecture/DIVINI-ARCHITECTURE-BLUEPRINT.md`.

---

## 1. Le contrat de tokens est la seule source de vérité

Aucune couleur, aucun espacement, rayon, ombre, durée, easing, z-index, taille ou
famille de police ne peut être écrit en littéral dans le code applicatif.

- **Source** : `packages/design-tokens/src/*.mjs`
- **Sortie générée** : `packages/design-tokens/dist/` (CSS + types) — ne jamais éditer
- **Régénération** : `npm run tokens`
- **Contrôle** : `npm run check:hardcoded` échoue sur toute valeur en dur

Si une valeur manque, on l'ajoute au contrat. On ne la met pas dans le composant.

### Couches

| Couche | Préfixe | Rôle |
|---|---|---|
| Primitives | `--c-*` | Valeurs brutes, définies par thème |
| Sémantique | `--surface-*`, `--text-*`, `--border-*`, `--state-*`, `--on-*` | Noms stables, résolus par thème |
| Densité | `--d-*` | Alias consommés par les composants |
| Neutre | `--sp-*`, `--r-*`, `--sh-*`, `--dur-*`, `--z-*`, `--fs-*`, `--font-*` | Indépendant du thème |

**Les composants consomment la couche sémantique et la couche densité, jamais les
primitives.** C'est ce qui permet au thème et à la densité de basculer sans réécrire les écrans.

---

## 2. Thèmes

| Thème | Statut | Origine |
|---|---|---|
| Sombre | **canonique** | corpus l. 7785–7799 et l. 7951–7963 — valeurs verrouillées |
| Clair | **dérivé, à valider** | aucune valeur dans le corpus ; traduction « dark system → light surface » |

- **Thème par défaut au premier chargement : sombre** (décision 2026-08-28).
- Le thème clair est une bascule, **pas une autre direction artistique**.
- Aucune palette indigo / violette / ivoire. Ces mots n'apparaissent pas dans le corpus.

### Pourquoi le thème clair possède des variantes `*-Text`

Le corpus impose des couleurs sémantiques identiques dans les deux thèmes
(`INFO #4FC7B9`, `SUCCESS #6FCF97`, `CRITIQUE #E0785F`). Mesurées sur fond blanc,
ces teintes donnent **1,74:1 à 2,99:1** : inutilisables en texte.

Le contrat conserve donc :

- les **teintes canoniques** (`--c-info`, `--c-positive`, `--c-negative`) pour les
  indicateurs, pastilles, jauges et tracés — l'identité est préservée ;
- des **variantes texte-safe** (`--c-info-text`, `--c-positive-text`, …) de même
  teinte à luminance réduite, pour le texte et les icônes sur fond clair.

La couche sémantique fait la sélection : `--text-info` vaut `--c-info` en sombre et
`--c-info-text` en clair. Les composants n'ont pas à le savoir.

Résultat mesuré : **112 paires vérifiées, pire 4,61:1, 0 échec** au seuil AA (4,5:1).

> ⚠️ Ces valeurs claires ne sont **pas canoniques**. Elles sont soumises à validation
> avant tout usage en production.

---

## 3. Densité

Décision C.4 : **confortable par défaut, bascule compacte.**

Justification : « dense mais aéré » (l. 7764), « zéro formation » (l. 3184),
« hiérarchie visuelle très claire » (l. 7753).

| | Confortable | Compact |
|---|---|---|
| Ligne de tableau | 44 px | 34 px |
| Padding de carte | 20 px | 14 px |
| Hauteur de champ | 40 px | 32 px |
| Hauteur de bouton | 38 px | 32 px |

Règle : **un composant ne connaît jamais sa densité**. Il consomme `--d-*`.
La cible tactile minimale reste 32 px en compact, 40 px en confortable.

---

## 4. Typographie

Trois familles, rôles exclusifs (l. 7801–7811). Aucune autre police n'est admise.

| Token | Famille | Rôle |
|---|---|---|
| `--font-display` | Space Grotesk | titres, identité, grands chiffres structurants |
| `--font-body` | Inter | interface, textes, formulaires, tableaux, navigation |
| `--font-mono` | IBM Plex Mono | KPI, valeurs, identifiants, références, données techniques |

Les polices sont **auto-hébergées** (paquets `@fontsource`), aucune requête réseau
au démarrage — cohérent avec l'offline-first stratégique (l. 2292).

On n'écrit jamais `font-family` ni `font-size` en littéral : on applique un rôle
(`t-page-title`, `t-body`, `t-mono-value`, …) qui fixe d'un coup famille, taille,
graisse, interlignage et tracking.

**Identifiants, montants et références sont toujours en mono.** Ce n'est pas
décoratif : c'est ce qui rend une référence scannable dans un tableau de 200 lignes.

---

## 5. Motion

Easing unique : `cubic-bezier(.2,.8,.2,1)`.

**Interdits** : `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, tout rebond,
tout élastique, toute rotation décorative, tout zoom agressif (l. 8002–8010).

| Registre | Durée |
|---|---|
| Micro-interaction | 140–220 ms |
| Transition d'état | 220–320 ms |
| Panneau / sidebar | 320 ms |
| Narrative | 420 ms |
| Révélation de page | 700 ms |
| Count-up KPI | 1100–1200 ms |

`prefers-reduced-motion: reduce` : fondu d'opacité uniquement, jamais de déplacement.
Le contrat l'applique déjà globalement ; un composant n'a pas à le refaire.

Aucune animation décorative. Le mouvement signale toujours quelque chose.

Le confetti Lottie (l. 393–397) est **réservé et inactif** : il sera branché au LOT 18.

---

## 6. Les quinze états obligatoires

Corpus l. 7964–7984. Tout composant pertinent les prévoit :

`default` · `hover` · `active` · `focus-visible` · `disabled` · `loading` ·
`success` · `info` · `warning` · `error` · `critical` · `empty` · `offline` ·
`syncing` · `permission-denied`

- `focus-visible` n'est **jamais** supprimé. L'anneau est un token (`--sh-focus`).
- La couleur exprime la gravité réelle. `critical` n'est jamais décoratif.
- La couleur n'est **jamais le seul vecteur** : chaque état porte aussi un libellé,
  une icône ou une position.

---

## 7. Honnêteté de l'interface — non négociable

> « Le visuel ne doit jamais mentir sur l'état réel du système. » (l. 7982)

Règles applicables dès le LOT 00 et vérifiées au LOT 24 :

1. **Une donnée simulée est signalée comme simulée.** Jamais présentée comme réelle.
2. **Une capacité absente s'affiche « non disponible »**, jamais en bouton mort.
3. **Aucun export, impression ou téléchargement factice.** S'il n'est pas branché,
   il est marqué « à venir ».
4. **Aucune règle externe inventée** : quotas, tarifs, fenêtres ou conditions de
   plateformes tierces ne sont jamais fabriqués.
5. **Aucune sécurité, session, permission ou paiement simulé** présenté comme réel.
   Ces surfaces sont étiquetées « simulation d'interface ».
6. Les quatre états `offline`, `syncing`, `permission-denied` et `critical` ne
   peuvent pas être joués en démonstration : sans branchement réel, ils s'affichent
   comme non disponibles.

---

## 8. Points de rupture

Corpus l. 8359–8382.

| Largeur | Comportement |
|---|---|
| > 980 px | sidebar dépliée (220 px), grilles multi-colonnes |
| ≤ 980 px | sidebar repliée (72 px) puis tiroir, grilles réduites |
| ≤ 720 px | une colonne, tableaux → cartes empilées |
| ≤ 560 px | landing uniquement |

Les tableaux ne se réduisent pas à l'infini : sous 720 px, une ligne devient une carte.

---

## 9. Commandes

| Commande | Effet |
|---|---|
| `npm run tokens` | régénère le CSS et les types depuis la source |
| `npm run check:tokens` | contraste WCAG sur la **cascade CSS résolue** |
| `npm run check:hardcoded` | aucune valeur en dur dans le code applicatif |
| `npm run check` | les deux |
| `npm run typecheck` | `tsc --noEmit` sur l'application |
| `npm run build` | build de production |
| `npm run dev` | serveur de développement (port 3000) |

`npm run build` régénère les tokens avant de compiler : le CSS ne peut pas être périmé.

---

## 10. Ce que le LOT 00 ne livre pas

Aucun écran, aucun composant d'interface, aucune donnée, aucun backend, aucune
authentification. La galerie `/dev/tokens` est une **surface technique interne**,
pas une maquette produit. La landing publique est le LOT 22 et n'existe pas encore.

Rien dans ce lot n'est « fonctionnel » au sens métier.
