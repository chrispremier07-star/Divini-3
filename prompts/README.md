# DIVINI exo — Bibliothèque de prompts de lots

**25 prompts de lots** (LOT 00 → LOT 24), un par fichier, plus le socle canonique commun.
Phase concernée : **PHASE 3 — FRONTEND / INTERFACES** (mission §01). Aucun lot ne démarre le
backend, la base de données, l'authentification ou la sécurité.

---

## 1. Comment utiliser un prompt de lot

1. Ouvrir `prompts/00-REGLES-COMMUNES.md` — **toujours**, c'est le socle (tokens, états,
   motion, responsive, règles de vérité, méthode, rapport).
2. Ouvrir le fichier du lot voulu, ex. `prompts/LOT-05-cockpit.md`.
3. Vérifier dans le tableau ci-dessous que **tous les lots dont il dépend sont validés**.
4. Soumettre les deux documents ensemble, **un seul lot à la fois**.
5. À la fin du lot : lire le rapport (7 points), inspecter, corriger, **valider explicitement**.
6. **STOP.** Ne pas enchaîner sur le lot suivant sans instruction.

> Un lot n'est jamais considéré comme validé parce qu'il fonctionne techniquement
> (mission §13). Validation = `construction → inspection → correction → validation explicite`.

## 2. Documents

| Fichier | Rôle |
|---|---|
| `00-REGLES-COMMUNES.md` | Socle canonique : direction artistique tranchée, tokens, typographie, rayons, motion, 15 états, responsive, accessibilité, règles de vérité, méthode A→G, non-régression, format de rapport, règle d'arrêt |
| `README.md` | Le présent index : ordre, dépendances, gate, état d'avancement |
| `LOT-00` … `LOT-24` | Un prompt de lot complet par fichier |

## 3. Ordre exact et dépendances

```
LOT 00 ─┬─► LOT 01 ─┬─► LOT 02 ─┬─► LOT 04 ─┬─► LOT 13
        │           │           │           └─► LOT 05 ─┬─► LOT 06 ─┬─► LOT 07 ─┬─► LOT 11
        │           └─► LOT 03 ─┘                       │           └─► LOT 17  │
        │                                               │           └─► LOT 08 ─┬─► LOT 10
        │                                               │                       └─► LOT 12
        │                                               └─► LOT 09 ─────────────┴─► LOT 23
        │                                                                          │
        └─► LOT 22 (Landing — avançable sur demande)                               │
                                                                                   ▼
   LOT 14 ◄─ (05, 09, 12) ──► LOT 15 ◄─ (03, 14) ──► LOT 16 ◄─ (14)
   LOT 18 ◄─ (02) ──► LOT 19 ◄─ (02, 18) ──► LOT 21 ◄─ (02, 19)
   LOT 20 ◄─ (02, 06)
   LOT 24 ◄─ (TOUS)  ── Frontend Validation Gate
```

| Lot | Nom | Dépend de | Débloque | État |
|---|---|---|---|---|
| [00](LOT-00-cadrage-contrat-de-tokens.md) | Cadrage & contrat de tokens | décision artistique (prise) | 01, 22 | **construit — validé provisoirement** |
| [01](LOT-01-fondations-design-system.md) | Fondations Design System | 00 | 02, 03, 22 | **construit — validé provisoirement** |
| [02](LOT-02-app-shell.md) | App Shell | 01 | 04, 18, 19, 20, 21 | **construit — validé** |
| [03](LOT-03-data-feedback.md) | Data & Feedback | 01 | 04, 05, 06, 08, 09, 15 | **construit — validé** |
| [04](LOT-04-command-center-notification-center.md) | Command Center + Notification Center | 02, 03 | 05, 13 | **construit — validé** |
| [05](LOT-05-cockpit.md) | Cockpit | 03, 04 | 06, 09, 14 | **construit — validé** |
| [06](LOT-06-ventes-commandes.md) | Ventes & Commandes | 03, 05 | 07, 08, 10, 17, 20 | **construit — en attente de validation** |
| [07](LOT-07-stocks.md) | Stocks | 03, 06 | 11 | non démarré |
| [08](LOT-08-crm.md) | CRM | 03, 06 | 10, 12 | non démarré |
| [09](LOT-09-finance.md) | Finance | 03, 05 | 11, 14, 23 | non démarré |
| [10](LOT-10-logistique-fidelite.md) | Logistique & Fidélité | 06, 08 | — | non démarré |
| [11](LOT-11-achats-fournisseurs-rh.md) | Achats, Fournisseurs & RH | 07, 09 | — | non démarré |
| [12](LOT-12-whatsapp.md) | WhatsApp | 08 | 14 | non démarré |
| [13](LOT-13-social-media.md) | Social Media | 04 | — | non démarré |
| [14](LOT-14-intelligence.md) | Intelligence (5 agents) | 05, 09, 12 | 15, 16 | non démarré |
| [15](LOT-15-rapports-indicateurs-alertes.md) | Rapports, Indicateurs & Alertes | 03, 14 | — | non démarré |
| [16](LOT-16-automatisation.md) | Automatisation | 14 | — | non démarré |
| [17](LOT-17-documents.md) | Documents | 06 | — | non démarré |
| [18](LOT-18-organisation-systeme.md) | Organisation & Système | 02 | 19 | non démarré |
| [19](LOT-19-abonnement-onboarding.md) | Abonnement & Onboarding | 02, 18 | 21 | non démarré |
| [20](LOT-20-offline-pwa-sync.md) | Offline, PWA & synchronisation (UI) | 02, 06 | — | non démarré |
| [21](LOT-21-console-concepteur.md) | Console Concepteur | 02, 19 | — | non démarré |
| [22](LOT-22-landing-page.md) | Landing Page | 00, 01 | — | non démarré |
| [23](LOT-23-personal-erp.md) | Personal ERP | 09 | — | non démarré |
| [24](LOT-24-consolidation-validation-gate.md) | Consolidation & Validation Gate | tous | passage backend | non démarré |

**Avancement global de la phase frontend : 28 %** — LOT 00 à LOT 06 construits, inspectés et corrigés. LOT 00 et LOT 01 validés provisoirement ; **LOT 02 à LOT 05 validés** ; LOT 06 en attente de validation (7 lots sur 25). Premier module métier complet (Ventes) au LOT 06.

## 4. Structure identique de chaque prompt de lot

Chaque fichier suit le format imposé par la mission §12, complété des garde-fous du corpus :

```
1  Objectif
2  Périmètre            (inclus / exclu-reporté)
3  Écrans concernés     (route · écran · niveau ERP · états obligatoires)
4  Composants concernés (créés / réutilisés)
5  UX                   (parcours, interactions, navigation)
6  Design               (application stricte du Design System)
7  Responsive           (desktop / laptop / tablette / mobile)
8  Motion               (animations et micro-interactions)
9  États                (les 15 états + états d'écran)
10 Données              (mock autorisé / interdit)
11 Interdits spécifiques au lot
12 Méthode d'exécution  (A → G)
13 Validation           (checklist complète)
14 Rapport attendu
15 STOP
```

## 5. Frontend Validation Gate (LOT 24)

Aucun passage au backend tant que la gate n'est pas passée. Elle couvre :
**DESIGN · UX · UI · MOTION · ACCESSIBILITÉ · QUALITÉ · VÉRITÉ** — détail dans
`LOT-24-consolidation-validation-gate.md` et dans le blueprint §21.

## 6. Ce que ces prompts ne sont PAS

- Ce ne sont **pas** des écrans, des composants ou du code : aucun fichier d'application n'est
  produit par ces documents.
- Ils n'autorisent **aucune** décision artistique nouvelle : la direction est verrouillée
  (Option A, thème sombre par défaut).
- Ils ne remplacent pas le corpus : en cas de divergence, le corpus verrouillé et le blueprint
  prévalent, et la divergence doit être signalée plutôt que tranchée silencieusement.
