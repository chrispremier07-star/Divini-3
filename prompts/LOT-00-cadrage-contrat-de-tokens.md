# LOT 00 — Cadrage & contrat de tokens

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md` (à lire avant ce lot).
> **Dépend de** : décision de direction artistique — ✅ prise le 2026-08-28 (Option A, thème
> sombre par défaut). **Débloque** : LOT 01, LOT 22.
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Figer le **contrat de tokens** de DIVINI exo : une source unique de vérité visuelle, écrite,
vérifiable, consommable par tous les lots suivants — plus le squelette de dépôt et les
conventions.

Ce lot ne produit **ni composant, ni écran produit, ni navigation**. Il produit la fondation
sans laquelle le LOT 01 serait arbitraire.

Résultat attendu : tout token utilisé ultérieurement existe déjà ici, et **aucune valeur de
couleur, de rayon, de durée ou de police n'est écrite en dur dans un composant** (l. 6143).

## 2. Périmètre

### 2.1 Inclus

1. **Package de tokens** unique (source unique, consommée par l'application).
2. **Thème sombre** — valeurs canoniques exactes du corpus (socle commun §2.1).
3. **Thème clair** — **dérivé** (le corpus n'en donne aucune valeur hexadécimale, cf. socle
   commun §2.3) : hiérarchie de surfaces équivalente, bordures fines, contraste doux, accent
   ambre identique, sémantique identique, densité identique. **À faire valider explicitement.**
4. **Échelle typographique** : rampes de tailles, graisses, hauteurs de ligne et tracking pour
   les trois polices, avec affectation stricte des rôles (display / body / mono).
5. **Échelle d'espacements** (base unique, multiples), **rayons** (6 / 8 / 10 / 12–14 / 16 /
   18–22), **ombres** (3 niveaux maximum, sobres), **épaisseurs de bordure**.
6. **Tokens de motion** : easing canonique `cubic-bezier(.2,.8,.2,1)` + durées nommées
   (micro / etat / panel / narrative / reveal / countup / tabs).
7. **Tokens sémantiques par état** : mapping couleur + contraste pour les 15 états obligatoires.
8. **Tokens de structure** : largeur sidebar (220 / 72 px), hauteur topbar, largeur command
   palette (560 px), largeur maximale de contenu, grille, gouttières, breakpoints
   (`980 px`, `720 px`, `560 px`, plus un palier grand écran).
9. **Échelle de z-index** nommée (base, dropdown, drawer, modal, command, toast).
10. **Squelette de dépôt** conforme au blueprint §8.3 (`apps/web`, `design-system/tokens`,
    `modules/`, `shell/`, `state/`, `services/`, `i18n/`, `motion/`, `packages/`).
11. **Conventions écrites** : nommage des tokens, nommage des fichiers, règles d'import,
    règle « aucune valeur visuelle en dur », règle de non-duplication (l. 3423–3439).
12. **Surface technique interne** `/dev/tokens` : galerie de visualisation des tokens (couleurs,
    typo, rayons, ombres, motion) sur les deux thèmes. **Non exposée dans la navigation
    produit**, clairement identifiée comme outil interne.
13. **Vérification automatique** : contrôle qu'aucune valeur hexadécimale, police ou durée ne
    soit codée en dur hors du package de tokens.

### 2.2 Exclu (reporté)

- Tout composant → **LOT 01**.
- App Shell, sidebar, topbar → **LOT 02**.
- Toute donnée métier, même mockée.
- Toute authentification, permission, backend.

### 2.3 Décisions à confirmer en ouverture de lot

| Réf blueprint | Décision | Statut |
|---|---|---|
| C.3 | Stack d'application. Le corpus impose **TypeScript + React** (l. 2967, 6143, 6325) mais ne nomme **aucun framework**. | à confirmer avant de coder |
| C.4 | Densité par défaut des tables et du shell (confortable vs compacte). | à confirmer |
| C.6 | Place de la Landing (LOT 22 par défaut). | à confirmer |

## 3. Écrans concernés

| Route | Écran | Nature |
|---|---|---|
| `/dev/tokens` | Galerie technique des tokens (2 thèmes) | outil interne, hors navigation produit |

**Aucun écran produit n'est créé dans ce lot.**

## 4. Composants concernés

**Aucun composant n'est créé.** Seuls des tokens, des types, des utilitaires de thème et la
galerie technique interne.

## 5. UX

Aucun parcours utilisateur dans ce lot. Ce qui est défini pour les lots suivants :

- **Hiérarchie visuelle** : combien de niveaux de titres, quel contraste entre `--text` et
  `--muted`, quelle taille pour les valeurs en mono.
- **Densité et respiration** : pas de base d'espacement, hauteur de ligne de contrôle, hauteur
  de ligne de tableau, marge de carte.
- **Lisibilité** : taille minimale de corps de texte, taille minimale en contexte dense,
  règle d'usage du mono (valeurs, identifiants, références — jamais du texte courant).

## 6. Design — application stricte du Design System

- Reprendre **exactement** les valeurs canoniques du socle commun §2.1 à §2.6. Aucune
  interprétation, aucun arrondi créatif, aucune couleur ajoutée.
- Aucune palette indigo / violette / ivoire (0 occurrence dans le corpus).
- Accent ambre `#F2A93B` unique ; `--accent-soft` `rgba(242,169,59,0.14)` pour les surfaces
  actives.
- Le thème clair est une **traduction** : mêmes proportions, mêmes rôles de surface, mêmes
  sémantiques. Toute valeur claire proposée est présentée avec sa justification (contraste,
  équivalence de hiérarchie) et **soumise à validation**.
- Vérifier le **contraste** des paires texte/fond sur les deux thèmes, y compris `--muted` sur
  `--panel-2` et l'accent sur fond sombre.

## 7. Responsive

Définir les breakpoints comme tokens (`≤ 560`, `≤ 720`, `≤ 980`, `> 980`, palier grand écran)
et la grille associée (colonnes, gouttières, marges) — conformément au socle commun §4.
Aucun layout n'est construit ici.

## 8. Motion

Définir les tokens de durée et d'easing (socle commun §2.6) et **une seule** primitive
d'utilitaire : respect global de `prefers-reduced-motion`. Aucune animation n'est produite.

## 9. États

Établir le **mapping token → état** pour les 15 états obligatoires, sans les implémenter :

`default · hover · active · focus-visible · disabled · loading · success · info · warning ·
error · critical · empty · offline · syncing · permission denied`

Pour chacun : couleur de fond, couleur de bordure, couleur de texte, contraste vérifié, et
rappel que **la couleur n'est jamais le seul vecteur** (icône + texte).

## 10. Données

**Aucune donnée**, mockée ou réelle. Ce lot ne manipule que des valeurs de design.

## 11. Interdits spécifiques au lot

- Créer un composant, une page produit, un élément de navigation.
- Introduire un token non justifié par le corpus ou par une nécessité explicitée.
- Écrire une valeur visuelle en dur hors du package de tokens.
- Décider seul du framework (C.3) ou de la densité (C.4).
- Présenter le thème clair comme « canonique » alors qu'il est dérivé.
- Ajouter une police, un rayon, une ombre ou une durée hors des échelles définies.

## 12. Méthode d'exécution

- **A ANALYSER** : relire le corpus (l. 7785–7823, 7951–8010, 8359–8398) et le blueprint §13 ;
  confirmer C.3 et C.4 ; vérifier qu'aucun token n'existe déjà.
- **B PLANIFIER** : annoncer fichiers créés, structure du package, liste des tokens, stratégie
  de vérification.
- **C CONSTRUIRE** : tokens, thèmes, échelles, squelette, conventions, galerie interne.
- **D INTÉGRER** : rien à intégrer (aucun lot antérieur).
- **E TESTER** : bascule de thème, contraste, rendu des trois polices, respect du
  reduced-motion, exécution du contrôle « aucune valeur en dur ».
- **F CORRIGER** : corriger les contrastes insuffisants et toute dérive de valeur.
- **G VALIDER** : le contrat est valide lorsque chaque token a une valeur, un rôle et un
  contraste vérifié sur les deux thèmes.

## 13. Validation — checklist

- [ ] Toutes les valeurs canoniques du socle commun §2.1 sont présentes, à l'identique.
- [ ] Aucune couleur indigo / violette / ivoire n'existe.
- [ ] Thème sombre par défaut ; bascule vers le clair fonctionnelle.
- [ ] Thème clair **dérivé et présenté pour validation** (pas présenté comme canonique).
- [ ] 3 polices uniquement, rôles respectés, mono réservé aux valeurs/identifiants.
- [ ] Rayons limités à 6 / 8 / 10 / 12–14 / 16 / 18–22.
- [ ] Une seule easing ; durées dans les fourchettes canoniques.
- [ ] Les 15 états ont un mapping de tokens, contraste vérifié.
- [ ] Breakpoints et grille définis conformément au socle commun §4.
- [ ] Squelette de dépôt conforme au blueprint §8.3.
- [ ] Conventions écrites, dont « aucune valeur visuelle en dur ».
- [ ] Le contrôle automatique « aucune valeur en dur » s'exécute et passe.
- [ ] `/dev/tokens` affiche les deux thèmes et n'est pas dans la navigation produit.
- [ ] `prefers-reduced-motion` respecté globalement.
- [ ] Aucun composant, aucun écran produit, aucune donnée mockée.
- [ ] Décisions C.3 et C.4 confirmées par le donneur d'ordre et tracées.

## 14. Rapport attendu

Format du socle commun §10, avec en plus :
- la **liste complète des tokens** créés ;
- les **valeurs du thème clair proposées** et leur justification ;
- le **résultat du contrôle de contraste** ;
- le **résultat du contrôle « aucune valeur en dur »** ;
- `AVANCEMENT GLOBAL : XX %` cohérent avec un projet dont seul le socle existe.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre l'instruction explicite avant LOT 01.
Ne pas anticiper les primitives, ne pas esquisser la sidebar, ne pas créer de page produit.
