/**
 * DIVINI exo — Tests du shell applicatif (LOT 02)
 *
 * Cible la checklist §13 du prompt LOT 02, sur ce que jsdom peut réellement
 * vérifier : structure du manifeste, statuts de modules, présence permanente
 * des éléments d'état, câblage clavier, absence d'écran fictif.
 *
 * Ce qui n'est PAS vérifiable ici est assumé et reporté dans
 * LOT-02-VALIDATION.md §« Non vérifiable » : les dimensions en pixels, la
 * durée des transitions, les breakpoints et `prefers-reduced-motion` relèvent
 * du rendu réel, pas du DOM virtuel.
 */

import { after, afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  AppShell,
  ContextBar,
  ConnectionStatus,
  Sidebar,
  SidebarItem,
  WorkspaceLayout
} from '../apps/web/src/components/shell/index.ts';
import {
  DEV_VARIATION_MODULES,
  MODULES,
  NAV_GROUPS,
  detachedModules,
  findModule,
  moduleForPathname,
  modulesByGroup,
  resolveModuleAction
} from '../apps/web/src/lib/modules.ts';
import { DEMO_SITES, TENANT_SCOPE, resolveScope, scopeLabel } from '../apps/web/src/lib/scope.ts';
import { AppearanceProvider } from '../apps/web/src/lib/appearance.tsx';
import { ShellStateProvider } from '../apps/web/src/lib/shell-state.tsx';

import { createDom } from './helpers/dom.mjs';
import { click, h, pressKey, render, unmountAll } from './helpers/react.mjs';

let dom;

before(() => {
  dom = createDom();
});

afterEach(async () => {
  await unmountAll();
  dom.window.document.body.innerHTML = '';
});

after(() => {
  dom.window.close();
});

/**
 * Rend un composant dans les contextes dont il dépend.
 *
 * `AppearanceProvider` est fourni par le layout racine dans l'application
 * réelle ; il n'existe pas en test, il faut donc le poser explicitement.
 */
function inShell(element) {
  return h(AppearanceProvider, null, h(ShellStateProvider, null, element));
}

function q(sel) {
  return dom.window.document.querySelector(sel);
}
function qAll(sel) {
  return Array.from(dom.window.document.querySelectorAll(sel));
}

/* ========================================================================== */
/* 1. Manifeste de navigation                                                 */
/* ========================================================================== */

describe('Manifeste de navigation — §13 « 7 groupes max, 5 à 7 entrées »', () => {
  it('comporte au plus 7 groupes', () => {
    assert.ok(
      NAV_GROUPS.length <= 7,
      `${NAV_GROUPS.length} groupes — la limite du corpus est 7`
    );
    assert.ok(NAV_GROUPS.length > 0, 'aucun groupe défini');
  });

  it('ne dépasse jamais 7 entrées par groupe', () => {
    // La règle opérante du blueprint §9 est le plafond : « au-delà, regrouper ».
    // Le plancher de 5 est une cible que l'arbre de référence du blueprint
    // n'atteint pas lui-même (COMMUNICATION et PILOTAGE comptent 2 entrées).
    // Ajouter des modules pour l'atteindre créerait de la navigation fictive.
    for (const group of modulesByGroup()) {
      assert.ok(
        group.items.length <= 7,
        `${group.label} : ${group.items.length} entrées — plafond 7 dépassé`
      );
    }
  });

  it('chaque module déclare un lot réel', () => {
    for (const m of MODULES) {
      assert.equal(typeof m.lot, 'number', `${m.id} : lot absent`);
      assert.ok(m.lot >= 5, `${m.id} : lot ${m.lot} — le shell est le LOT 02`);
      assert.ok(
        m.status === 'disponible' || m.status === 'planifie' || m.status === 'nonActive',
        `${m.id} : statut inconnu « ${m.status} »`
      );
    }
  });

  it('les identifiants sont uniques', () => {
    const ids = MODULES.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length, 'identifiants dupliqués dans le manifeste');
  });

  it('un module détaché est exclu du regroupement', () => {
    const detached = detachedModules();
    assert.ok(detached.length > 0, 'aucun module détaché (Personal ERP attendu)');

    const groupedIds = new Set(
      modulesByGroup().flatMap((g) => g.items.map((m) => m.id))
    );
    for (const m of detached) {
      assert.equal(m.detached, true, `${m.id} doit porter detached: true`);
      assert.equal(groupedIds.has(m.id), false, `${m.id} apparaît dans un groupe`);
    }
  });

  it('findModule résout par identifiant et rend undefined sinon', () => {
    assert.equal(findModule('cockpit')?.label, 'Cockpit');
    assert.equal(findModule('inexistant'), undefined);
  });
});

/* ========================================================================== */
/* 2. Statuts de modules                                                      */
/* ========================================================================== */

describe('Statuts de modules — §13 « explicites, aucun écran fictif »', () => {
  it('un module disponible porte une route réelle (Cockpit, LOT 05)', () => {
    // LOT 05 : le Cockpit est le premier écran livré. La garde reste utile :
    // tout module `disponible` doit mener à une route réelle, jamais un écran vide.
    const disponibles = MODULES.filter((m) => m.status === 'disponible');
    for (const m of disponibles) {
      assert.ok(
        m.route && m.route.startsWith('/'),
        `${m.id} est disponible sans route réelle`
      );
    }
    assert.ok(
      disponibles.some((m) => m.id === 'cockpit'),
      'le Cockpit livré au LOT 05 doit être marqué disponible'
    );
  });

  it('resolveModuleAction traduit planifié en lot, jamais en écran', () => {
    const planned = MODULES.find((m) => m.status === 'planifie');
    const action = resolveModuleAction(planned);
    assert.equal(action.kind, 'planned');
    assert.equal(action.lot, planned.lot);
  });

  it('resolveModuleAction traduit non activé en renvoi Abonnement', () => {
    const locked = DEV_VARIATION_MODULES.filter((m) => m.status === 'nonActive');
    assert.ok(locked.length > 0, 'aucun module non activé — la variation serait non testée');
    for (const m of locked) {
      const action = resolveModuleAction(m);
      assert.equal(action.kind, 'subscribe', `${m.id} devrait renvoyer vers Abonnement`);
      // La cible doit être un module réel : sinon le renvoi serait un bouton mort.
      assert.ok(
        findModule(action.target),
        `${m.id} renvoie vers « ${action.target} », absent du manifeste`
      );
    }
  });

  it('aucun module du manifeste de production n\'est marqué non activé', () => {
    // Un module « non activé » dans /app laisserait croire qu'il est construit
    // mais non souscrit. Aucun écran n'existe encore : ce serait faux.
    const wronglyLocked = MODULES.filter((m) => m.status === 'nonActive');
    assert.deepEqual(wronglyLocked.map((m) => m.id), []);
  });
});

describe('Rendu des statuts dans la sidebar', () => {
  it('un module planifié annonce son lot, pas un écran', async () => {
    const planned = MODULES.find((m) => m.status === 'planifie');
    await render(
      inShell(
        h(SidebarItem, {
          module: planned,
          active: false,
          compact: false,
          onSelect: () => {}
        })
      )
    );

    const button = q('button');
    assert.ok(button, 'aucun bouton rendu');
    const expectedLot = `LOT ${String(planned.lot).padStart(2, '0')}`;
    assert.ok(
      button.textContent.includes(expectedLot),
      `« ${button.textContent} » n'annonce pas ${expectedLot}`
    );
  });

  it('un module non activé affiche « non activé » et n\'est pas masqué', async () => {
    const locked = DEV_VARIATION_MODULES.find((m) => m.status === 'nonActive');
    await render(
      inShell(
        h(SidebarItem, {
          module: locked,
          active: false,
          compact: false,
          onSelect: () => {}
        })
      )
    );

    const button = q('button');
    assert.ok(button, 'le module non activé a été masqué au lieu d\'être affiché');
    assert.ok(
      button.textContent.includes('non activé'),
      `« ${button.textContent} » n'annonce pas l'état`
    );
    assert.equal(button.disabled, false, 'le module ne doit pas être désactivé silencieusement');
  });

  it('un module actif porte aria-current="page"', async () => {
    const planned = MODULES.find((m) => m.status === 'planifie');
    await render(
      inShell(
        h(SidebarItem, {
          module: planned,
          active: true,
          compact: false,
          onSelect: () => {}
        })
      )
    );
    assert.equal(q('button')?.getAttribute('aria-current'), 'page');
  });

  it('en mode compacte, le libellé passe en title', async () => {
    const planned = MODULES.find((m) => m.status === 'planifie');
    await render(
      inShell(
        h(SidebarItem, {
          module: planned,
          active: false,
          compact: true,
          onSelect: () => {}
        })
      )
    );
    const title = q('button')?.getAttribute('title');
    assert.ok(title?.includes(planned.label), `title « ${title} » ne porte pas le libellé`);
  });
});

/* ========================================================================== */
/* 3. Zone de travail                                                         */
/* ========================================================================== */

describe('Zone de travail — §13 « EmptyState assumé »', () => {
  it('sans module actif, annonce la session de démonstration', async () => {
    await render(inShell(h(WorkspaceLayout, null)));
    const text = q('main')?.textContent ?? '';
    assert.ok(text.includes('démonstration'), 'la nature de la session n\'est pas annoncée');
    assert.ok(text.includes('LOT'), 'les lots à venir ne sont pas annoncés');
  });

  it('rend le contenu de la route sur l\'accueil', async () => {
    // Défect trouvé par l'audit du HTML servi : `children` n'était rendu que
    // dans la branche « module disponible ». L'accueil est pourtant l'état par
    // défaut du shell — celui qu'utilisent `/app` et `/dev/shell`. Sans ce
    // rendu, le contenu des routes était invisible.
    await render(
      inShell(h(WorkspaceLayout, null, h('p', { id: 'route-content' }, 'contenu de route')))
    );
    assert.ok(
      q('#route-content'),
      'le contenu fourni par la route n\'est pas rendu sur l\'accueil'
    );
  });

  it('un module planifié n\'ouvre aucun écran fictif', async () => {
    const planned = MODULES.find((m) => m.status === 'planifie');

    // Un SEUL provider : sidebar et zone de travail doivent partager l'état.
    // Les rendre sous deux providers distincts rendrait le test inopérant.
    await render(inShell(h(AppShell, null)));

    const buttons = qAll('button');
    const target = buttons.find((b) => b.textContent?.includes(planned.label));
    assert.ok(target, `entrée « ${planned.label} » introuvable`);
    await click(target);

    const body = dom.window.document.body.textContent ?? '';
    assert.ok(
      body.includes('en construction'),
      'un module planifié n\'annonce pas son état de construction'
    );
    assert.ok(
      body.includes(`LOT ${String(planned.lot).padStart(2, '0')}`),
      'le lot qui livrera l\'écran n\'est pas annoncé'
    );
  });

  it('la variation « non activé » renvoie vers Abonnement et reste visible', async () => {
    const locked = DEV_VARIATION_MODULES[0];
    assert.equal(locked.status, 'nonActive');
    assert.equal(resolveModuleAction(locked).kind, 'subscribe');

    await render(
      inShell(
        h(SidebarItem, {
          module: locked,
          active: false,
          compact: false,
          onSelect: () => {}
        })
      )
    );
    const button = q('button');
    assert.equal(button.disabled, false, 'le module a été désactivé au lieu d\'être expliqué');
    assert.ok(button.textContent?.includes('non activé'));
  });
});

/* ========================================================================== */
/* 4. Portée (décision C.2)                                                   */
/* ========================================================================== */

describe('Portée — décision C.2, sélecteur global unique', () => {
  it('la portée par défaut est la consolidation tenant', () => {
    assert.equal(TENANT_SCOPE.kind, 'tenant');
  });

  it('resolveScope normalise une portée site inconnue vers le tenant', () => {
    const resolved = resolveScope({ kind: 'site', siteId: 'inexistant' });
    assert.equal(resolved.kind, 'tenant');
  });

  it('resolveScope conserve une portée site connue', () => {
    const site = DEMO_SITES[0];
    const resolved = resolveScope({ kind: 'site', siteId: site.id });
    assert.equal(resolved.kind, 'site');
    assert.equal(scopeLabel(resolved), site.label);
  });

  it('les établissements de démonstration ont des identifiants uniques', () => {
    const ids = DEMO_SITES.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

/* ========================================================================== */
/* 5. Éléments d'état permanents                                              */
/* ========================================================================== */

describe('Éléments d\'état permanents — §13', () => {
  it('l\'indicateur de connexion est un live region status', async () => {
    await render(h(ConnectionStatus, { state: 'online' }));
    assert.equal(q('[role="status"]') !== null, true);
  });

  it('les cinq états de connexion produisent des libellés distincts', async () => {
    const states = ['online', 'offline', 'syncing', 'conflict', 'syncError'];
    const labels = [];
    for (const state of states) {
      dom.window.document.body.innerHTML = '';
      await render(h(ConnectionStatus, { state }));
      labels.push(q('[role="status"]')?.textContent);
    }
    assert.equal(new Set(labels).size, states.length, `libellés non distincts : ${labels}`);
  });

  it('le shell expose sélecteur de portée, recherche et thème en permanence', async () => {
    await render(inShell(h(AppShell, null)));
    const header = q('header');
    assert.ok(header, 'aucune topbar rendue');

    const buttons = Array.from(header.querySelectorAll('button'));
    const text = header.textContent ?? '';
    assert.ok(text.includes('Tous les établissements'), 'portée absente de la topbar');
    assert.ok(text.includes('Rechercher'), 'déclencheur de recherche absent');
    assert.ok(
      buttons.some((b) => b.getAttribute('role') === 'switch'),
      'bascule de thème absente'
    );
  });

  it('la session de démonstration est identifiée', async () => {
    await render(inShell(h(AppShell, null)));
    const text = dom.window.document.body.textContent ?? '';
    assert.ok(
      text.includes('démonstration'),
      'aucune mention de la nature démonstrative de la session'
    );
    assert.ok(
      text.includes('aucune authentification réelle'),
      'l\'absence d\'authentification réelle n\'est pas dite'
    );
  });
});

/* ========================================================================== */
/* 6. Navigation et clavier                                                   */
/* ========================================================================== */

describe('Navigation — §13 « clavier complète, Escape ferme le drawer »', () => {
  it('la sidebar expose une navigation aria-label', async () => {
    await render(inShell(h(Sidebar, null)));
    assert.ok(q('nav[aria-label]'), 'navigation sans libellé accessible');
  });

  it('les groupes sont exposés en role="group" avec libellé', async () => {
    await render(inShell(h(Sidebar, null)));
    const groups = qAll('[role="group"]');
    assert.ok(groups.length > 0, 'aucun groupe exposé');
    for (const g of groups) {
      assert.ok(g.getAttribute('aria-label'), 'groupe sans aria-label');
    }
  });

  it('Escape ferme le tiroir mobile', async () => {
    await render(inShell(h(AppShell, null)));

    const menuButton = qAll('button').find((b) =>
      b.getAttribute('aria-label')?.includes('Ouvrir la navigation')
    );
    assert.ok(menuButton, 'bouton de navigation mobile introuvable');
    await click(menuButton);

    // Le Drawer du LOT 01 rend un dialog
    assert.ok(q('[role="dialog"]'), 'le tiroir ne s\'est pas ouvert');

    await pressKey('Escape');
    assert.equal(q('[role="dialog"]'), null, 'Escape n\'a pas fermé le tiroir');
  });

  it('la barre de contexte expose un fil d\'Ariane avec page courante', async () => {
    await render(
      inShell(
        h(ContextBar, {
          title: 'Cockpit',
          breadcrumb: [
            { id: 'home', label: 'Accueil' },
            { id: 'module', label: 'Cockpit' }
          ]
        })
      )
    );

    const nav = q('nav[aria-label]');
    assert.ok(nav, 'aucun fil d\'Ariane rendu');
    const current = q('[aria-current="page"]');
    assert.equal(current?.textContent, 'Cockpit');
  });
});

/* ========================================================================== */
/* 7. Robustesse                                                              */
/* ========================================================================== */

describe('Robustesse', () => {
  it('monter le shell deux fois ne produit aucun id dupliqué', async () => {
    await render(inShell(h(AppShell, null)));
    await render(inShell(h(AppShell, null)));

    // `test-root` est le conteneur posé par le harnais, pas un composant.
    const ids = qAll('[id]')
      .map((el) => el.id)
      .filter((id) => id.length > 0 && id !== 'test-root');
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(dupes, [], `ids dupliqués : ${[...new Set(dupes)].join(', ')}`);
  });
});

describe('Navigation — module déduit de l’URL (correction « on reste sur le cockpit »)', () => {
  it('chaque route de module disponible se résout vers son module', () => {
    for (const m of MODULES) {
      if (m.status !== 'disponible' || !m.route) continue;
      assert.equal(moduleForPathname(m.route), m.id, `${m.route} ne résout pas ${m.id}`);
      // Les sous-routes héritent du module parent.
      assert.equal(moduleForPathname(`${m.route}/xyz`), m.id, `${m.route}/xyz ne résout pas ${m.id}`);
    }
  });

  it('le préfixe le plus long gagne (ventes vs accueil)', () => {
    assert.equal(moduleForPathname('/app'), 'cockpit');
    assert.equal(moduleForPathname('/app/ventes'), 'ventes');
    assert.equal(moduleForPathname('/app/ventes/cmd-1'), 'ventes');
  });

  it('un chemin sans module retourne null', () => {
    assert.equal(moduleForPathname('/dev/shell'), null);
    assert.equal(moduleForPathname(null), null);
  });
});
