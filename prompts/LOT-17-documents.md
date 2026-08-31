# LOT 17 — Documents (Studio documentaire)

> **Socle obligatoire** : `prompts/00-REGLES-COMMUNES.md`.
> **Dépend de** : LOT 06 (validé). **Débloque** : —
> **Périmètre** : FRONTEND ONLY. **État** : non démarré.

---

## 1. Objectif

Construire le **Studio de documents** : un éditeur visuel de documents commerciaux
(reçus, factures, devis, bons, avoirs, relevés, rapports) avec ses variables, ses modèles, ses
formats de sortie et son parcours de **reçu de caisse personnalisé**.

Règle structurante du corpus (l. 2153) : **les données métier ne doivent jamais être modifiées
par l'éditeur visuel.** L'éditeur agit sur la présentation, jamais sur le contenu comptable.

## 2. Périmètre

### 2.1 Cycle de vie canonique d'un document (l. 2147)

```
Modifier → Aperçu → Tester → Enregistrer → Publier → Définir par défaut
```

### 2.2 Types de documents (l. 2137–2146)

Reçus · factures · devis · bons de commande · bons de livraison · avoirs · relevés · rapports ·
autres documents.

### 2.3 Éditeur visuel (l. 2155–2172)

Logo · couleurs · typographie · tailles · marges · espacements · alignements · séparateurs ·
blocs · pied de page.

### 2.4 Données & variables (l. 2174–2203)

Variables : entreprise, client, produits, quantités, prix, remises, TVA, totaux, paiement,
numéro, date, vendeur, **QR code**, **signature**, notes, champs personnalisés.
- **Variables conditionnelles** ;
- **champs obligatoires protégés** (non supprimables, non déplaçables hors de leur zone).

### 2.5 Modèles (l. 2205–2232)

Cinq modèles : **Minimal · Corporate · Premium · Commerce · Moderne**.
Capacités : duplication, personnalisation, **versioning**, modèle par défaut, modèle par
établissement, modèle par activité.
Formats de sortie : **thermique 58 mm · thermique 80 mm · A5 · A4 · PDF**.

### 2.6 Assistance à la conception (l. 2234–2249)

L'utilisateur formule une intention (« un reçu moderne, premium et minimaliste avec les
couleurs de mon logo »). En phase frontend, l'assistance produit des **propositions locales
déterministes** à partir des réglages disponibles, clairement présentées comme assistance de
démonstration — **aucun modèle d'IA réel**.
Interdiction absolue : l'assistance ne modifie jamais les données comptables, commerciales, les
champs obligatoires ni les montants.

### 2.7 Reçu de caisse personnalisé (l. 2251–2268, 4448)

1. Parcours guidé : import du logo, formulaire pas à pas, informations utiles.
2. **Vérification avant validation finale** : récapitulatif complet, avertissement explicite
   indiquant que le design ne sera **plus modifiable** après validation.
3. **Verrouillage** après validation : l'édition devient indisponible pour le marchand, avec
   explication.
4. **Réactivation possible par le concepteur** (surface annoncée, implémentée au LOT 21).
5. Impression automatisée : aperçu au format thermique réel (58 / 80 mm).

### 2.8 Exclu (reporté)

- Rendu PDF réel et impression physique → phase backend.
- Génération réellement assistée par modèle → relais explicite.
- Envoi de documents par canal réel → backend.

## 3. Écrans concernés

| Route | Écran | Niveau ERP |
|---|---|---|
| `/app/documents` | Bibliothèque | N1 |
| `/app/documents/modeles` · `/{id}` | Modèles | N1 |
| `/app/documents/editeur/{id}` | Éditeur visuel | N1 |
| `/app/documents/variables` | Données & variables | N1 |
| `/app/documents/recu-caisse` | Parcours guidé du reçu de caisse | N1 |
| `/app/documents/recu-caisse/apercu` | Aperçu et validation finale | N1 |
| `/app/documents/{id}/versions` | Versioning | N2 |

## 4. Composants concernés

**Créés** : DocumentLibrary, DocumentTypeCard, TemplateGallery, TemplateCard, VisualEditor,
EditorCanvas, EditorToolbar, BlockPalette, StylePanel, MarginRuler, VariablePanel,
VariableChip, ConditionalVariableRow, RequiredFieldLock, FormatSelector, ThermalPreview,
PagePreview, VersionList, VersionCompare, PublishDialog, SetDefaultAction,
ReceiptWizard, ReceiptWizardSteps, LogoUploader, BrandColorExtractor, ReceiptReviewSummary,
LockNotice, DesignAssistPanel, AssistSuggestionCard.
**Réutilisés** : DataTable, DataPanel, Badge, StatusDot, Button, IconButton, Input, Select,
Switch, Checkbox, Radio, FileUpload, Stepper, Modal, Drawer, ConfirmDialog, EmptyState,
Skeleton, ErrorState, PermissionDenied.

## 5. UX

- **Choisir un modèle avant de régler des détails** : la galerie de modèles est le point
  d'entrée, l'éditeur vient après.
- **Voir ce que l'on fait** : l'aperçu est permanent et au format réel (58 mm, 80 mm, A5, A4).
- **Ne jamais casser un document** : les champs obligatoires sont verrouillés visuellement ;
  toute tentative de suppression est refusée avec explication.
- **Revenu en arrière possible** : le versioning permet de revenir à une version antérieure.
- **Validation finale sans surprise** : le récapitulatif du reçu de caisse liste tout ce qui sera
  imprimé et avertit du verrouillage **avant** la validation.
- **Comprendre le verrouillage** : un design verrouillé explique pourquoi et vers qui se
  tourner pour le faire réactiver.

## 6. Design — application stricte du Design System

- Éditeur : canvas neutre, outils sur `--panel`, panneaux `--panel-2`, bordures fines.
- L'aperçu du document reflète **l'identité du marchand** (son logo, ses couleurs), pas celle de
  DIVINI exo — l'éditeur ne doit pas imposer la charte du produit au document.
- Champ obligatoire verrouillé : icône de verrou + libellé, jamais seulement grisé.
- Aperçu thermique : rendu monochrome fidèle, largeur réelle respectée.
- Versions : liste sobre, différence mise en évidence par libellé, pas par couleur seule.

## 7. Responsive

| Zone | Desktop > 1280 | Laptop 981–1280 | Tablette 721–980 | Mobile ≤ 720 |
|---|---|---|---|---|
| Bibliothèque | grille 3–4 | 2–3 | 2 | 1 colonne |
| Éditeur | canvas + 2 panneaux latéraux | canvas + 1 panneau | canvas + panneau en drawer | **aperçu seul + réglages en sheet** (édition complète annoncée comme confortable sur grand écran) |
| Aperçu | au format réel | au format réel | réduit proportionnellement | réduit, avec zoom |
| Variables | panneau latéral | panneau | drawer | sheet |
| Parcours reçu | stepper horizontal | idem | condensé | indicateur `3/6` |

L'édition fine reste possible sur tablette ; sur mobile, l'écran privilégie la consultation et la
validation.

## 8. Motion

- Changement de modèle : fondu de l'aperçu 220–320 ms.
- Application d'un réglage : mise à jour immédiate de l'aperçu, **sans clignotement**.
- Ajout d'un bloc : apparition 220–320 ms.
- Validation finale : confirmation sobre — **aucune célébration**, c'est un engagement
  définitif.
- `prefers-reduced-motion` : transitions quasi instantanées.

## 9. États

- **Document / modèle** : brouillon, enregistré, publié, par défaut, verrouillé, version
  antérieure, introuvable, permission denied.
- **Éditeur** : chargement, édition, champ obligatoire protégé (refus), réglage invalide,
  aperçu en rendu, rendu impossible, données de démonstration manquantes.
- **Variables** : disponible, conditionnelle, obligatoire, vide (rendu à prévoir), personnalisée.
- **Parcours reçu** : étape en cours, logo absent, logo invalide, informations incomplètes,
  récapitulatif, validation, **verrouillé**.
- **Assistance** : intention saisie, propositions locales disponibles, service réel non
  connecté, aucune proposition applicable.
- **Versioning** : aucune version, versions disponibles, restauration en cours, restaurée.

## 10. Données

Mockées et **signalées** :
- documents de démonstration construits à partir des ventes et factures du LOT 06 (mêmes
  montants en FCFA, mêmes références) ;
- logo et couleurs de démonstration ;
- propositions d'assistance produites localement.

Aucun PDF réel généré, aucune impression réelle, aucun envoi réel.

## 11. Interdits spécifiques au lot

- Laisser l'éditeur visuel modifier une donnée métier, un montant ou un champ obligatoire.
- Simuler une génération par modèle d'IA.
- Permettre l'édition d'un reçu verrouillé côté marchand.
- Valider le reçu de caisse sans récapitulatif ni avertissement de verrouillage.
- Produire un faux téléchargement de PDF.
- Imposer la charte DIVINI exo au document du marchand.

## 12. Méthode d'exécution

- **A** : relire le corpus (l. 2131–2268, 7484–7520, 4448), vérifier les documents du LOT 06.
- **B** : annoncer fichiers, formats supportés, liste des variables, stratégie de test.
- **C** : construire bibliothèque, modèles, éditeur, variables, formats, versioning, parcours
  reçu de caisse.
- **D** : intégrer au shell, au Command Center, à l'aperçu du reçu (LOT 06).
- **E** : tester le cycle complet `Modifier → Aperçu → Tester → Enregistrer → Publier →
  Définir par défaut`, les cinq formats, les cinq modèles, le verrouillage du reçu, les champs
  obligatoires protégés, les 4 breakpoints, les deux thèmes, clavier, reduced-motion.
- **F** : corriger tout débordement d'aperçu, tout champ obligatoire modifiable, tout état
  manquant.
- **G** : valider lorsque aucun réglage visuel ne peut altérer une donnée métier.

## 13. Validation — checklist

- [ ] Cycle de vie canonique complet pour chaque type de document.
- [ ] Les 9 types de documents présents.
- [ ] Éditeur visuel : logo, couleurs, typographie, tailles, marges, espacements, alignements,
      séparateurs, blocs, pied de page.
- [ ] **Aucune donnée métier modifiable** par l'éditeur (test explicite).
- [ ] Variables complètes, y compris QR code, signature, champs personnalisés.
- [ ] Variables conditionnelles et champs obligatoires protégés.
- [ ] Les 5 modèles (Minimal, Corporate, Premium, Commerce, Moderne) + duplication +
      versioning + défaut par établissement et par activité.
- [ ] Les 5 formats (58 mm, 80 mm, A5, A4, PDF) avec aperçu fidèle.
- [ ] Assistance locale présentée comme telle ; aucune donnée comptable touchée.
- [ ] Parcours reçu de caisse : logo, étapes, récapitulatif, avertissement, validation.
- [ ] **Verrouillage effectif** après validation, avec explication et relais concepteur.
- [ ] Aucun faux téléchargement.
- [ ] Les 4 breakpoints, les deux thèmes, `prefers-reduced-motion` respectés.
- [ ] Aucune régression sur LOT 00 à 16.

## 14. Rapport attendu

Format du socle commun §10, avec en plus : les formats et modèles livrés, la preuve que les
données métier sont inaltérables, le comportement de verrouillage, et
`AVANCEMENT GLOBAL : XX %`.

## 15. STOP

Après ce lot : **s'arrêter**. Attendre la validation explicite avant LOT 18.
