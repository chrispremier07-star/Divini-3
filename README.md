# DIVINI exo

ERP SaaS multi-tenant. Construction **frontend-first**, lot par lot, avec validation
explicite à chaque lot.

> **État actuel : LOT 00 — cadrage et contrat de tokens.**
> Aucun écran, aucun composant d'interface, aucune donnée, aucun backend.
> Rien n'est fonctionnel au sens métier.

---

## Orientation

| Document | Contenu |
|---|---|
| `MASTER_PROMPT_V3_VERROUILLE_DIVINI_EXO_SILO.txt` | Corpus verrouillé — source de vérité (9 858 lignes) |
| `docs/00-architecture/DIVINI-ARCHITECTURE-BLUEPRINT.md` | Architecture complète, 9 parties + annexes |
| `docs/CONVENTIONS.md` | Conventions normatives issues du LOT 00 |
| `prompts/README.md` | Index des 25 lots, graphe de dépendances, gate |

---

## Démarrage

```bash
npm install
npm run dev          # http://localhost:3000  — régénère les tokens avant de servir
```

| Commande | Effet |
|---|---|
| `npm run tokens` | régénère le CSS et les types du contrat depuis la source |
| `npm run check` | contraste WCAG + absence de valeur en dur |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | build de production |

Node ≥ 20.

---

## Structure

```
apps/web                     Application Next.js (App Router)
  src/app/layout.tsx           layout racine, thème posé avant le premier paint
  src/app/page.tsx             racine — état des lieux, pas une landing
  src/app/dev/tokens/          galerie technique interne du contrat
  src/lib/appearance.tsx       thème + densité, persistance, anti-flash

packages/design-tokens       Contrat de tokens — source unique de vérité
  src/*.mjs                    source (couleurs, typo, espacement, motion, états…)
  scripts/build-css.mjs        génère dist/ (CSS + types)
  dist/                        GÉNÉRÉ — ne pas éditer, non commité

scripts/check-contrast.mjs   contrôle WCAG sur la cascade CSS résolue
scripts/check-hardcoded.mjs  contrôle « aucune valeur en dur »
scripts/lib/resolve-css.mjs  résolveur de cascade (spécificité, ordre, var())
```

---

## Direction artistique

Corpus verrouillé, option A : fond `#1C2126`, accent ambre `#F2A93B`,
Space Grotesk / Inter / IBM Plex Mono, auto-hébergées.

**Thème sombre par défaut.** Le thème clair existe en bascule mais ses valeurs sont
**dérivées et non validées** : le corpus impose un thème clair sans en fournir aucune
couleur. Voir `docs/CONVENTIONS.md` §2.

Aucune palette indigo, violette ou ivoire.

---

## Règle de progression

Un lot n'est terminé qu'après **construction → inspection → correction → validation
explicite**. Le lot suivant ne démarre pas sur une validation supposée.
