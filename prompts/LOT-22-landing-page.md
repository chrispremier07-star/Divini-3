# LOT 22 — Landing Page

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 00 et LOT 01 (validés). **Débloque** : —
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.
> **Note** : ce lot peut être avancé dans la séquence sur demande (Annexe C.6 du blueprint) ;
> il ne dépend que des tokens et des primitives.

---

## 1. Objectif

Construire la **Landing Page** publique : minimaliste, premium, moderne, extrêmement lisible,
persuasive, rapide, responsive (l. 249–266).

Elle vend des **bénéfices**, pas un catalogue : la différence fondamentale entre un ERP
classique (`saisit → enregistre → consulte`) et DIVINI exo
(`comprend → analyse → anticipe → recommande → agit`), incarnée par les **5 agents** (l. 2597–2627).

## 2. Périmètre

### 2.1 Structure canonique (l. 8014–8044)

```
navigation sticky → hero minimal (eyebrow, headline, CTA primaire, CTA secondaire, mockup)
→ marquee → statistiques → sticky showcase → feature grid → section 5 agents
→ pricing → FAQ → CTA final → footer
```

### 2.2 Hero et micro-motion (l. 8045–8062)

À conserver : **blobs flous** à dérive lente (~16 s) et opacité faible · **parallax du mockup**
avec retour au repos au `mouseleave` · **CTA magnétique** · **scroll reveal** · **count-up** des
statistiques · **navigation scroll-aware**.
Le mouvement reste premium et discret.

### 2.3 Scroll reveal (l. 8063–8077)

```
initial : opacity 0 + translateY(18px)
visible : opacity 1 + translateY(0)
durée   : 700 ms
easing  : cubic-bezier(.2,.8,.2,1)
déclenchement : IntersectionObserver — une seule fois, jamais de rejeu
```

### 2.4 Sticky showcase (l. 8078–8091)

Visuel collant, étapes verticales, étape active, visuel correspondant, transition
`opacity + translateY`, scroll contrôlé par IntersectionObserver.
Les étapes représentent de **véritables capacités de DIVINI exo**.

### 2.5 Les 5 agents — exigence non négociable (l. 8092–8196)

Chaque agent conserve **sa propre identité motion**, animée. Interdiction de remplacer par :
image statique, simple icône, simple hover, Lottie générique, animation standardisée.

| Agent | Éléments motion à conserver | Intention |
|---|---|---|
| **COPILOT** | bulle de saisie, trois points animés, barres de données, barres négatives signalées, bracket d'analyse, pill `-8,4 %`, relais par décalage | analyser et identifier la cause d'un problème |
| **AUTOPILOT** | trois tâches/enveloppes, déplacement séquentiel, arrivée vers validation, rings de validation, check final | préparer et exécuter une série d'actions avec validation |
| **RADAR** | cercles concentriques, sweep, blip, action préparée, check | détecter un risque et préparer une réaction |
| **CASH VISION** | courbe historique, frontière présent/futur, projection pointillée, bascule négative, marqueur temporel, pulse | montrer la trajectoire future de trésorerie |
| **GUARDIAN** | bouclier, halo respirant, scanline, signal de risque, mouvement du signal, état bloqué/tampon | détecter et protéger contre une opération à risque |

**Familles d'animation à conserver** (l. 8222–8256) :
`copilotDot · copilotBar · copilotFlagColor · copilotBracket · copilotPill ·
autopilotFly · autopilotPulseRing · radarSweep · radarBlip · radarAction ·
cvPastDraw · cvFutureFade · cvMarkerPulse · guardianBreathe · guardianScan ·
guardianFlag · guardianStamp`

**Synchronisation** (l. 8197–8221) : animations en `paused` par défaut, passées en `running`
lorsque la section devient visible (IntersectionObserver) ; `--i` pour l'offset entre agents,
`--j` pour l'offset interne ; base temporelle **4,2 s**. Le relais doit donner l'impression que
les agents travaillent **successivement**, pas simultanément.

### 2.6 Autres sections

- **Statistiques** : count-up — valeurs de **démonstration explicitement signalées** comme telles,
  jamais présentées comme des résultats clients réels.
- **Pricing** : module de base + modules complémentaires + établissements, avec bascule de
  période ; renvoie vers `/tarifs` et l'onboarding.
- **FAQ** : accordéon accessible.
- **CTA final** et **footer** : inscription, connexion, demande de démonstration, liens légaux.

### 2.7 Contenu strictement interdit (l. 8334–8358)

Aucune reprise comme vérité : noms de sociétés de démonstration, nombres d'équipes, tarifs en
euros, essai 14 jours, données européennes, valeurs de KPI de démo, témoignages, textes
marketing, données de stock ou statistiques issues d'une source de référence visuelle.
**Seul le style de présentation est réutilisable.**

## 3. Écrans concernés

| Route | Écran | Nature |
|---|---|---|
| `/` | Landing | public |
| `/tarifs` | Tarifs et simulateur | public |
| `/demo` | Demande de démonstration | public |
| `/legal/*` | Mentions, CGU, confidentialité, cookies | public |

## 4. Composants concernés

**Créés** : StickyNav, HeroSection, HeroEyebrow, HeroHeadline, MagneticCta, MockupParallax,
AmbientBlobs, Marquee, StatsRow, StatCounter, StickyShowcase, ShowcaseStep, FeatureGrid,
FeatureCard, AgentsSection, AgentCard (×5 : CopilotMotion, AutopilotMotion, RadarMotion,
CashVisionMotion, GuardianMotion), PricingSection, PricingToggle, PlanCard, FaqAccordion,
FinalCta, SiteFooter.
**Réutilisés** : Button, IconButton, Badge, Input, Select, Modal, Drawer, Skeleton — et tous
les tokens LOT 00 (couleurs, typographies, rayons, easing, durées).

## 5. UX

- **Comprendre en 5 secondes** : la promesse est lisible avant tout défilement.
- **Voir la différence** : la comparaison ERP classique / DIVINI exo est explicite.
- **Croire sans être manipulé** : les statistiques sont signalées comme démonstration ; aucun
  témoignage inventé.
- **Passer à l'action** : CTA primaire (inscription) et secondaire (démonstration) toujours
  accessibles, navigation scroll-aware.
- **Respecter le visiteur** : aucune animation permanente agressive, aucun rejeu de reveal.

## 6. Design — application stricte du Design System

- Headline en **Space Grotesk**, corps en **Inter**, chiffres en **IBM Plex Mono**.
- Accent ambre `#F2A93B` sur le CTA primaire et les soulignements ; fond sombre canonique.
- Blobs : opacité très faible, aucun néon, aucun gradient omniprésent.
- Cartes de fonctionnalités : `--panel`, bordure fine, rayon 12–14 px, hover sobre
  (`translateY` léger + bordure), **aucun glassmorphism excessif**.
- Sections marketing : rayons 18–22 px pour les grands blocs.
- Aucun logo de produit tiers, aucune capture d'écran d'un autre produit.

## 7. Responsive (l. 8368–8382)

| Zone | Desktop > 980 | ≤ 980 px | ≤ 560 px |
|---|---|---|---|
| Navigation | sticky complète | **simplifiée** | menu compact |
| Hero | texte + mockup côte à côte | **réorganisé** | empilé |
| Showcase | visuel sticky + étapes | **en colonne** | en colonne |
| Feature grid | 3 colonnes | **2 colonnes** | 1 colonne |
| Agents | 5 en relais | **2 colonnes** | **1 colonne** |
| Pricing | 3 cartes | 1 colonne | 1 colonne |
| FAQ | colonne bornée | pleine largeur | pleine largeur |
| Footer | multi-colonnes | réduit | **1 colonne** |

Le CTA magnétique et le parallax sont **désactivés sur tactile**, remplacés par un comportement
sobre équivalent.

## 8. Motion

- Durées canoniques : micro 140–220 ms, reveal 700 ms, count-up 1 100–1 200 ms, agents 4,2 s.
- Easing unique `cubic-bezier(.2,.8,.2,1)`.
- **Reveal une seule fois**, jamais de rejeu.
- Agents en `paused` hors viewport, `running` dans le viewport, avec relais.
- Blobs : dérive ~16 s, opacité faible, aucun mouvement brusque.
- `prefers-reduced-motion: reduce` : animations des agents désactivées (rendu statique lisible),
  blobs fixes, reveal immédiat, scroll normal, CTA non magnétique — **aucune information perdue**.

## 9. États

- **Navigation** : haut de page, après défilement (scroll-aware), menu ouvert, lien actif.
- **Hero** : chargement, parallax actif, repos au `mouseleave`, tactile (parallax désactivé).
- **Agents** : hors viewport (paused), dans le viewport (running), reduced-motion (statique).
- **Statistiques** : avant reveal, count-up en cours, valeur finale.
- **Showcase** : étape active, étape inactive, transition.
- **Pricing** : période mensuelle, période annuelle, plan mis en avant.
- **FAQ** : fermé, ouvert, focus.
- **Formulaires (démo)** : en saisie, erreur de champ, envoi en cours, **envoi non disponible**
  (état explicite tant que le backend n'existe pas).

## 10. Données

- Statistiques de **démonstration**, signalées comme telles.
- Plans et prix cohérents avec le catalogue du LOT 19.
- FAQ rédigée à partir des capacités réelles décrites dans le corpus.
- **Aucun témoignage, aucune société, aucun chiffre issu d'une source de référence visuelle.**

## 11. Interdits spécifiques au lot

- Reprendre un contenu de source de référence visuelle comme vérité (l. 8334–8358).
- Remplacer la motion d'un agent par une image, une icône ou un Lottie générique.
- Animer les 5 agents simultanément sans relais.
- Rejouer un reveal au défilement.
- Afficher des statistiques comme des résultats clients réels.
- Simuler un envoi de formulaire de démonstration.
- Transformer la landing en catalogue interminable de fonctionnalités (l. 261).

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 235–266, 2597–2627, 8011–8250, 8369–8398), vérifier les tokens et
  primitives livrés.
- **B** : annoncer fichiers, structure des 5 motions, stratégie de test.
- **C** : construire la page section par section.
- **D** : relier les CTA vers `/inscription`, `/tarifs`, `/demo`, `/connexion`.
- **E** : tester scroll reveal, sticky nav, showcase, les 5 motions et leur relais, count-up,
  parallax et CTA magnétique (desktop) et leur désactivation (tactile), pricing, FAQ, les
  breakpoints 980 et 560, les deux thèmes, reduced-motion, performance de défilement.
- **F** : corriger tout rejeu d'animation, tout agent non synchronisé, tout overflow.
- **G** : valider lorsque les 5 agents sont animés avec leur identité propre et que la page reste
  lisible en reduced-motion.

## 13. Validation — checklist

- [ ] Structure canonique complète, dans l'ordre.
- [ ] Hero : eyebrow, headline Space Grotesk, accent ambre, CTA primaire et secondaire, mockup.
- [ ] Blobs à dérive lente et opacité faible ; parallax avec retour au repos.
- [ ] CTA magnétique (desktop), désactivé sur tactile.
- [ ] Navigation scroll-aware ; marquee ; statistiques avec count-up.
- [ ] Sticky showcase avec étapes et transitions contrôlées.
- [ ] Feature grid sobre.
- [ ] **Les 5 agents animés**, chacun avec sa motion propre et ses familles d'animation.
- [ ] Synchronisation : `paused` hors viewport, relais entre agents, base 4,2 s, `--i` / `--j`.
- [ ] Pricing cohérent avec le catalogue ; FAQ accessible ; CTA final ; footer complet.
- [ ] Scroll reveal 700 ms, une seule fois.
- [ ] Breakpoints 980 et 560 conformes.
- [ ] `prefers-reduced-motion` : agents statiques lisibles, aucune information perdue.
- [ ] **Aucun contenu de source de référence visuelle repris comme vérité.**
- [ ] Statistiques signalées comme démonstration.
- [ ] Formulaire de démonstration en état « envoi non disponible », jamais simulé.
- [ ] Aucune régression sur LOT 00 et LOT 01.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : la liste des familles d'animation implémentées par
agent, la preuve du relais et du `paused`/`running`, et `AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 23.
