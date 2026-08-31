/**
 * DIVINI exo — Tests Logistique (LOT 10)
 *
 * Transitions de statut (8 statuts canoniques), échec toujours motivé,
 * statistiques (taux de réussite, CA perdu, motifs d'échec), zones extensibles,
 * livreurs et rendus. Le rendu réel (breakpoints, thèmes, reduced-motion) est
 * reporté dans LOT-10-VALIDATION.md.
 */

import { afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DELIVERIES,
  COURIERS,
  ZONES,
  FAILURE_REASONS,
  DELIVERY_STATUS_META,
  DELIVERY_TRANSITIONS,
  findDelivery,
  findCourier,
  findZone,
  orderAmount,
  courierLoad,
  deliveriesOfCourier,
  deliveryStats,
  DeliveryBoard,
  DeliveryStatsScreen,
  CourierList,
  ZonesScreen
} from '../apps/web/src/components/logistics/index.ts';

import { ShellStateProvider } from '../apps/web/src/lib/shell-state.tsx';
import { ToastProvider } from '../apps/web/src/components/ui/Toast.tsx';

import { createDom } from './helpers/dom.mjs';
import { h, render, unmountAll } from './helpers/react.mjs';

before(() => createDom());
afterEach(() => unmountAll());

function inShell(element) {
  return h(ShellStateProvider, null, h(ToastProvider, null, element));
}

const STATUSES = [
  'preparation',
  'a_expedier',
  'en_cours',
  'en_livraison',
  'echouee',
  'reprogrammee',
  'livree',
  'annulee'
];

describe('Logistique — statuts canoniques', () => {
  it('les 8 statuts canoniques sont définis', () => {
    for (const s of STATUSES) {
      assert.ok(DELIVERY_STATUS_META[s], `statut manquant ${s}`);
      assert.equal(typeof DELIVERY_STATUS_META[s].label, 'string');
    }
    assert.equal(Object.keys(DELIVERY_STATUS_META).length, 8, 'il doit y avoir exactement 8 statuts');
  });

  it('toute expédition a un statut canonique', () => {
    for (const d of DELIVERIES) {
      assert.ok(DELIVERY_STATUS_META[d.status], `statut inconnu ${d.status}`);
    }
  });
});

describe('Logistique — transitions de statut', () => {
  it('la préparation mène à « à expédier »', () => {
    assert.deepEqual(DELIVERY_TRANSITIONS.preparation, ['a_expedier']);
  });

  it('livrée et annulée sont des statuts terminaux', () => {
    assert.deepEqual(DELIVERY_TRANSITIONS.livree, []);
    assert.deepEqual(DELIVERY_TRANSITIONS.annulee, []);
  });

  it('un échec peut être reprogrammé ou annulé', () => {
    assert.deepEqual(DELIVERY_TRANSITIONS.echouee, ['reprogrammee', 'annulee']);
  });

  it('une livraison en cours peut réussir ou échouer', () => {
    assert.deepEqual(DELIVERY_TRANSITIONS.en_livraison, ['livree', 'echouee']);
  });

  it('chaque transition pointe vers un statut canonique', () => {
    for (const [from, targets] of Object.entries(DELIVERY_TRANSITIONS)) {
      assert.ok(DELIVERY_STATUS_META[from], `origine inconnue ${from}`);
      for (const t of targets) {
        assert.ok(DELIVERY_STATUS_META[t], `cible inconnue ${t} depuis ${from}`);
      }
    }
  });
});

describe('Logistique — échec toujours motivé', () => {
  it('toute expédition échouée porte un motif (interdit §11)', () => {
    for (const d of DELIVERIES) {
      if (d.status === 'echouee') {
        assert.ok(d.failureReason && d.failureReason.trim().length > 0, `${d.ref} échouée sans motif`);
      }
    }
  });

  it('le catalogue de motifs d’échec n’est pas vide', () => {
    assert.ok(FAILURE_REASONS.length > 0);
  });
});

describe('Logistique — zones extensibles', () => {
  it('le référentiel de zones est une liste ouverte', () => {
    assert.ok(Array.isArray(ZONES));
    assert.ok(ZONES.length > 0);
    for (const z of ZONES) {
      assert.equal(typeof z.rate, 'number');
      assert.equal(typeof z.estimatedMinutes, 'number');
    }
  });

  it('findZone retrouve une zone par id', () => {
    const z = ZONES[0];
    assert.equal(findZone(z.id)?.id, z.id);
    assert.equal(findZone('zone-inconnue'), undefined);
  });

  it('toute expédition référence une zone existante', () => {
    for (const d of DELIVERIES) {
      assert.ok(findZone(d.zoneId), `${d.ref} référence une zone inconnue ${d.zoneId}`);
    }
  });
});

describe('Logistique — livreurs', () => {
  it('findCourier retrouve un livreur', () => {
    const c = COURIERS[0];
    assert.equal(findCourier(c.id)?.id, c.id);
    assert.equal(findCourier('crr-inconnu'), undefined);
  });

  it('courierLoad compte la charge active du jour (pas l’historique)', () => {
    const active = ['en_cours', 'en_livraison', 'a_expedier'];
    for (const c of COURIERS) {
      const load = courierLoad(c.id);
      const expected = DELIVERIES.filter((d) => d.courierId === c.id && active.includes(d.status)).length;
      assert.equal(load, expected);
    }
  });

  it('deliveriesOfCourier filtre par livreur', () => {
    const c = COURIERS.find((x) => deliveriesOfCourier(x.id).length > 0);
    assert.ok(c, 'aucun livreur avec expédition');
    for (const d of deliveriesOfCourier(c.id)) {
      assert.equal(d.courierId, c.id);
    }
  });
});

describe('Logistique — statistiques', () => {
  it('le taux de réussite correspond aux livrées / total', () => {
    const s = deliveryStats();
    const expected = DELIVERIES.length > 0 ? Math.round((s.livree / DELIVERIES.length) * 100) : 0;
    assert.equal(s.successRate, expected);
  });

  it('le CA perdu somme les commandes échouées et annulées', () => {
    const s = deliveryStats();
    const expected = DELIVERIES.filter((d) => d.status === 'echouee' || d.status === 'annulee').reduce(
      (sum, d) => sum + orderAmount(d.orderRef),
      0
    );
    assert.equal(s.lostRevenue, expected);
    assert.ok(s.lostRevenue > 0, 'le jeu de démo comporte un échec : le CA perdu doit être non nul');
  });

  it('les compteurs de statuts sont cohérents avec les données', () => {
    const s = deliveryStats();
    assert.equal(s.livree, DELIVERIES.filter((d) => d.status === 'livree').length);
    assert.equal(s.echouee, DELIVERIES.filter((d) => d.status === 'echouee').length);
    assert.equal(s.annulee, DELIVERIES.filter((d) => d.status === 'annulee').length);
    assert.equal(s.reprogrammee, DELIVERIES.filter((d) => d.status === 'reprogrammee').length);
  });

  it('les motifs d’échec sont agrégés avec leur occurrence', () => {
    const s = deliveryStats();
    for (const r of s.failureReasons) {
      assert.ok(r.count > 0);
      assert.equal(typeof r.reason, 'string');
    }
  });
});

describe('Logistique — rendus', () => {
  it('le tableau des expéditions affiche les références', async () => {
    const view = await render(inShell(h(DeliveryBoard, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('LVR-2026-0001'), 'expédition absente');
    await view.unmount();
  });

  it('les statistiques affichent le CA perdu', async () => {
    const view = await render(inShell(h(DeliveryStatsScreen, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('CA perdu'), 'carte CA perdu absente');
    assert.ok(text.includes('Taux de réussite'), 'carte taux de réussite absente');
    await view.unmount();
  });

  it('la liste des livreurs affiche les noms', async () => {
    const view = await render(inShell(h(CourierList, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes(COURIERS[0].name), 'livreur absent');
    await view.unmount();
  });

  it('l’écran des zones affiche le référentiel et son caractère extensible', async () => {
    const view = await render(inShell(h(ZonesScreen, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes(ZONES[0].label), 'zone absente');
    assert.ok(text.toLowerCase().includes('extensible'), 'mention extensible absente');
    await view.unmount();
  });
});
