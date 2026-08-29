# LOT 00 — Rapport de construction et d'inspection

Date : 2026-08-29
Statut : **construit, inspecté, corrigé — en attente de validation utilisateur**

Ce rapport consigne ce qui a été livré, ce qui a été mesuré, et les défauts trouvés
puis corrigés. Il ne déclare rien de « validé » : la validation est explicite et
vient de l'utilisateur.

---

## 1. Décisions tranchées avant construction

| # | Décision | Choix |
|---|---|---|
| C.3 | Framework | Next.js (App Router) — TypeScript + React imposés par le corpus (l. 2967, 6143, 6325) |
| C.4 | Densité | Confortable par défaut + bascule compacte (l. 7764, 3184) |
| — | Polices | Auto-hébergées en woff2 (l. 2292, offline-first) |
| C.1/C.5 | Direction artistique / thème | Option A, sombre par défaut (2026-08-28) |

---

## 2. Livrables

### Contrat de tokens — `packages/design-tokens/`

Source TypeScript/ESM unique, dont est généré `dist/` (CSS + types).

| Fichier | Contenu |
|---|---|
| `src/color.mjs` | thèmes sombre (canonique) et clair (dérivé), paires de contraste |
| `src/typography.mjs` | 3 familles, échelle, 16 rôles typographiques |
| `src/spacing.mjs` | échelle 4 px, deux densités |
| `src/radius.mjs` | rayons 6–22 px, épaisseurs de bordure, affectation par rôle |
| `src/shadow.mjs` | 9 élévations, dont anneaux de focus |
| `src/motion.mjs` | easings, durées, rôles, mouvement réduit |
| `src/state.mjs` | les 15 états obligatoires, ordre de gravité |
| `src/structure.mjs` | shell, grilles, points de rupture, cibles tactiles |
| `src/zindex.mjs` | échelle fermée 0–1600 |

Sortie générée : **499 lignes, 324 variables distinctes, 449 déclarations.**

### Application — `apps/web/`

| Route | Rôle |
|---|---|
| `/` | État des lieux. Signale explicitement ce qui n'existe pas |
| `/dev/tokens` | Galerie technique interne : 2 thèmes, 2 densités, 15 états, contraste calculé |

### Contrôles — `scripts/`

| Script | Vérifie |
|---|---|
| `check-contrast.mjs` | contraste WCAG sur la **cascade CSS résolue** |
| `check-hardcoded.mjs` | aucune valeur en dur dans le code applicatif |
| `lib/resolve-css.mjs` | résolveur de cascade (spécificité, ordre, `var()`) |

### Conventions — `docs/CONVENTIONS.md`

Dix sections normatives : contrat, thèmes, densité, typographie, motion, états,
honnêteté de l'interface, points de rupture, commandes, périmètre du lot.

---

## 3. Ce qui a été mesuré

### Contraste

Thème sombre canonique — toutes les paires passent AA :

| Paire | Ratio |
|---|---|
| `--text-primary` sur `--surface-page` | 13,53:1 |
| `--text-secondary` sur `--surface-page` | 6,07:1 |
| `--state-error` sur `--surface-raised` | 4,98:1 (pire du sombre) |
| `--on-accent` sur `--accent` | 9,15:1 |

Un thème clair naïf reprenant les teintes canoniques **s'effondre** :

| Couleur | Sur `#FFFFFF` |
|---|---|
| accent `#F2A93B` | 2,00:1 |
| info `#4FC7B9` | 2,06:1 |
| positive `#6FCF97` | 1,90:1 |
| négative `#E0785F` | 2,99:1 |

C'est ce qui justifie les variantes texte-safe du thème clair.

Thème clair retenu, après résolution numérique :

| Token | Valeur | Pire ratio |
|---|---|---|
| `--c-info-text` | `#1D7168` | 4,72:1 |
| `--c-positive-text` | `#2B7449` | 4,61:1 |
| `--c-negative-text` | `#A04E3A` | 4,68:1 |
| `--c-attention-text` | `#8C5B14` | 4,71:1 |
| `--c-muted` | `#5A6470` | 4,88:1 |

Hiérarchie de surfaces — le clair reproduit le canon :

| Écart inter-surfaces | Sombre (canon) | Clair (dérivé) |
|---|---|---|
| plage mesurée | 1,07 – 1,24 | 1,06 – 1,23 |

Bordures — le clair est équivalent ou meilleur :

| | sur page | sur carte |
|---|---|---|
| sombre `#333B43` | 1,43 | 1,31 |
| clair `#C3CAD2` | 1,53 | 1,65 |

**Total : 112 paires vérifiées sur la cascade résolue, pire 4,61:1, 0 échec.**

### Commandes exécutées

| Commande | Résultat |
|---|---|
| `npm run tokens` | 499 lignes, 324 variables, 449 déclarations |
| `npm run check:tokens` | 112 paires, 0 échec |
| `npm run check:hardcoded` | 10 fichiers analysés, 0 violation |
| `npm run typecheck` | exit 0 |
| `npm run build` | 5 pages prérendues, `/` 3,64 kB, `/dev/tokens` 4,49 kB |
| `GET /` | HTTP 200, 22 985 octets |
| `GET /dev/tokens` | HTTP 200, 65 432 octets |

Contenu vérifié dans le HTML servi : les 15 états (15/15), les valeurs `#1C2126`,
`#F5F6F8`, `#8C5B14`, `#2B7449`, `#1D7168`, `#A04E3A`, le ratio `4.61:1`, l'easing
`cubic-bezier(.2,.8,.2,1)`, la mention « dérivé — à valider ».

Polices : 25 règles `@font-face` et 50 références woff2 servies par l'application,
**aucune URL de CDN tiers** dans le HTML.

---

## 4. Défauts trouvés et corrigés

### 4.1 Écrasement du thème clair par la cascade — grave

**Symptôme.** `html[data-theme='light']` définissait `--text-accent: var(--c-attention-text)`
(4,71:1), puis un bloc `:root` placé **après** redéfinissait
`--text-accent: var(--c-accent)`.

**Cause.** `:root` (pseudo-classe) et `[data-theme='light']` (attribut) ont la même
spécificité (0,1,0). À égalité, l'ordre source décide : `:root`, plus tardif, gagnait.

**Impact.** En thème clair, `--text-accent` retombait sur `#F2A93B` = **2,00:1 sur
blanc**. Idem pour `--text-success`, `--text-info`, `--text-warning`, `--text-error`,
`--text-critical` et les `--border-*` associés. Tout le travail de dérivation
texte-safe était annulé silencieusement.

**Pourquoi c'est passé.** Le contrôle de contraste lisait la **table JS**, qui était
juste. Il ne voyait pas la cascade. Fausse assurance.

**Correction.** Les blocs de thème passent à `html[data-theme='…']` (0,1,1),
strictement au-dessus de `:root` (0,1,0). L'ordre ne décide plus.

**Garde-fou ajouté.** `check-contrast.mjs` rejoue désormais la cascade réelle sur le
CSS généré (`scripts/lib/resolve-css.mjs`) avant de mesurer. Le résolveur a été
validé sur la structure défectueuse : il reproduit `#F2A93B` avec l'ancien CSS et
`#8C5B14` avec le nouveau.

### 4.2 Variables référencées mais jamais définies — 4 occurrences

`var(--inexistant)` ne fait échouer aucun build : le navigateur invalide simplement
la propriété. Quatre cas :

| Référence | Attendu | Impact |
|---|---|---|
| `--c-bg-2` | `--c-bg2` | `--surface-recessed` vide → fond des champs absent |
| `--c-panel-2` | `--c-panel2` | `--surface-raised` vide → **survol de ligne absent** |
| `--bg` | `--surface-page` | `--sh-focus` invalide → **anneau de focus non rendu** |
| `--negative` | `--state-critical` | `--sh-focus-critical` invalide |

L'anneau de focus cassé est un défaut d'accessibilité direct : l'état
`focus-visible` est obligatoire (l. 7964).

**Correction.** Les quatre références sont corrigées, et le générateur **échoue**
désormais si une variable est référencée sans être définie. Un CSS silencieux ne
peut plus être émis.

### 4.3 Noms de famille de polices erronés

Les tokens déclaraient `'Inter'` et `'Space Grotesk'`. Les paquets auto-hébergés
déclarent en réalité `'Inter Variable'` et `'Space Grotesk Variable'`. Les polices
ne se seraient pas appliquées. Corrigé sur les noms vérifiés dans les CSS des paquets.

### 4.4 Autres corrections

- `label: 'Confortable'` / `'Compact'` fuitaient en variables CSS (`--d-label`) :
  déplacés dans `densityLabels`, hors de l'échelle.
- Import CSS incorrect (`import { StatusPanel } from './status-panel.css'`) :
  remplacé par un module CSS.
- `themeColor: '#1C2126'` en littéral dans le layout : remplacé par `dark.bg` /
  `light.bg` du contrat.
- Classe utilitaire `t-mono-value-small` utilisée mais non définie : ajoutée.
- Déclarations TS manquantes pour `densityLabels`, `motionRole`, `radiusRole`,
  `shadowRole`, `borderRole`, `translate`, `scale`, `opacity`, `stagger`,
  `reducedMotion` : ajoutées au générateur.
- `tsconfig.tsbuildinfo` (cache) ajouté au `.gitignore`.

---

## 5. Contrôle « aucune valeur en dur » — validé par test négatif

Le contrôle a été éprouvé sur un fichier volontairement fautif : **14 violations
détectées sur 12 catégories** (hex, rgb(), rayon, espacement, ombre, z-index,
police, taille, durée, easing hors contrat, palette proscrite, couleur littérale),
exit 1. Le fichier a été supprimé ensuite.

Sans ce test, un contrôle qui ne scanne rien affiche aussi « aucune violation ».

---

## 6. Ce qui n'a pas pu être vérifié ici

- **Rendu navigateur réel.** Chromium n'a pas pu être téléchargé dans cet
  environnement. La cascade a été vérifiée par un résolveur qui rejoue spécificité,
  ordre source et `var()` sur le CSS réellement servi — mais ce n'est pas un
  navigateur. Les valeurs de contraste, elles, sont calculées selon WCAG 2.1.
- **Bascule thème/densité au clic.** Le mécanisme est écrit et le HTML porte
  `data-theme="dark"` `data-density="comfortable"` ; l'interaction elle-même n'a pas
  été exercée dans un navigateur.
- **Polices réellement dessinées.** Les woff2 sont servis (25 `@font-face`,
  HTTP 200), mais le rendu des glyphes n'a pas été observé.

---

## 7. À valider par l'utilisateur

1. **Le thème clair dans son ensemble.** Aucune de ses valeurs n'est canonique.
   Surfaces, textes, variantes sémantiques : tout est dérivé.
2. **Les variantes `*-Text`.** Elles s'écartent de « couleurs sémantiques
   identiques » (l. 7951–7963) par nécessité de lisibilité. C'est un arbitrage
   explicite : identité de teinte conservée, luminance réduite pour le texte.
3. **La densité confortable par défaut** (ligne 44 px, carte 20 px).
4. **Le périmètre du lot** : tokens, squelette, conventions, contrôles — aucun écran.

---

## 8. Ce que le LOT 00 ne livre pas

Aucun écran, aucun composant d'interface, aucune donnée, aucun backend, aucune
authentification, aucune sécurité. La galerie `/dev/tokens` est une surface
technique interne, pas une maquette produit. La landing publique est le LOT 22.

Rien dans ce lot n'est fonctionnel au sens métier.
