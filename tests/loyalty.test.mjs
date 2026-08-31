/**
 * DIVINI exo — Tests Fidélité (LOT 10)
 *
 * Presets configurables (jamais codés en dur), 2 modes d'attribution,
 * exclusion des frais de livraison, correction tracée (jamais de suppression
 * silencieuse), niveaux, historique et rendus. Le rendu réel (breakpoints,
 * thèmes, reduced-motion) est reporté dans LOT-10-VALIDATION.md.
 */

import { afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CLIENTS,
  LOYALTY_PRESETS,
  LOYALTY_LEVELS,
  REWARDS,
  POINTS_OPERATIONS,
  EXPIRING_BATCHES,
  ATTRIBUTION_MODE_LABELS,
  findPreset,
  operationsOf,
  levelFor,
  nextLevel,
  levelProgress,
  pointsForPayment,
  pointsFromAmount,
  loyaltyStats,
  LoyaltyOverview,
  LoyaltyRulesScreen,
  PointsLedgerScreen,
  ClientLoyaltyPanel
} from '../apps/web/src/components/loyalty/index.ts';

import { ShellStateProvider } from '../apps/web/src/lib/shell-state.tsx';
import { ToastProvider } from '../apps/web/src/components/ui/Toast.tsx';

import { createDom } from './helpers/dom.mjs';
import { h, render, unmountAll } from './helpers/react.mjs';

before(() => createDom());
afterEach(() => unmountAll());

function inShell(element) {
  return h(ShellStateProvider, null, h(ToastProvider, null, element));
}

describe('Fidélité — presets configurables', () => {
  it('trois presets distincts sont proposés', () => {
    assert.ok(LOYALTY_PRESETS.length >= 3);
    const ids = LOYALTY_PRESETS.map((p) => p.id);
    assert.ok(ids.includes('standard'));
    assert.ok(ids.includes('genereux'));
    assert.ok(ids.includes('economique'));
  });

  it('chaque preset expose un bonus d’inscription et un pas monétaire configurables', () => {
    for (const p of LOYALTY_PRESETS) {
      assert.equal(typeof p.signupBonus, 'number');
      assert.ok(p.currencyStep > 0, `${p.id} : pas monétaire invalide`);
    }
  });

  it('les presets ont des valeurs distinctes (non figées)', () => {
    const steps = new Set(LOYALTY_PRESETS.map((p) => p.currencyStep));
    assert.equal(steps.size, LOYALTY_PRESETS.length, 'les pas monétaires doivent différer');
  });

  it('findPreset retrouve un preset', () => {
    assert.equal(findPreset('standard')?.id, 'standard');
    assert.equal(findPreset('inconnu'), undefined);
  });
});

describe('Fidélité — modes d’attribution', () => {
  it('deux modes d’attribution existent', () => {
    assert.ok(ATTRIBUTION_MODE_LABELS.prorata);
    assert.ok(ATTRIBUTION_MODE_LABELS.after_full_payment);
  });

  it('au prorata : les points portent sur le montant payé', () => {
    const preset = findPreset('standard');
    // 6 000 FCFA payés, 1 pt / 1 000 → 6 pts
    assert.equal(pointsForPayment(6000, 20000, 0, preset, 'prorata'), 6);
  });

  it('après paiement complet : rien tant que la facture n’est pas soldée', () => {
    const preset = findPreset('standard');
    // paiement partiel : 6 000 sur 20 000, déjà 0 payé → pas soldé → 0 pt
    assert.equal(pointsForPayment(6000, 20000, 0, preset, 'after_full_payment'), 0);
  });

  it('après paiement complet : points sur le total une fois soldé', () => {
    const preset = findPreset('standard');
    // 14 000 payés + 6 000 déjà = 20 000 = total → soldé → 20 pts
    assert.equal(pointsForPayment(14000, 20000, 6000, preset, 'after_full_payment'), 20);
  });
});

describe('Fidélité — exclusion des frais de livraison', () => {
  it('les frais de livraison sont exclus quand la règle l’exige', () => {
    const preset = findPreset('standard');
    // 10 000 dont 1 500 de livraison, exclusion active → base 8 500 → 8 pts
    assert.equal(pointsFromAmount(10000, preset, { deliveryFee: 1500, excludeDeliveryFees: true }), 8);
  });

  it('les frais de livraison comptent quand la règle ne les exclut pas', () => {
    const preset = findPreset('standard');
    // exclusion inactive → base 10 000 → 10 pts
    assert.equal(pointsFromAmount(10000, preset, { deliveryFee: 1500, excludeDeliveryFees: false }), 10);
  });

  it('l’exclusion s’applique aussi via pointsForPayment', () => {
    const preset = findPreset('standard');
    const withExclusion = pointsForPayment(10000, 10000, 0, preset, 'prorata', {
      deliveryFee: 1500,
      excludeDeliveryFees: true
    });
    const without = pointsForPayment(10000, 10000, 0, preset, 'prorata', {
      deliveryFee: 1500,
      excludeDeliveryFees: false
    });
    assert.ok(withExclusion < without, 'l’exclusion doit réduire les points');
  });
});

describe('Fidélité — correction tracée (jamais silencieuse)', () => {
  it('une annulation produit une opération de correction négative', () => {
    const correction = POINTS_OPERATIONS.find((o) => o.type === 'correction');
    assert.ok(correction, 'aucune opération de correction');
    assert.ok(correction.points < 0, 'une correction doit être négative');
    assert.ok(correction.reason && correction.reason.length > 0, 'correction sans motif');
  });

  it('toute opération porte un type et un motif', () => {
    for (const o of POINTS_OPERATIONS) {
      assert.ok(['gain', 'correction', 'expiration', 'echange'].includes(o.type), `type inconnu ${o.type}`);
      assert.ok(o.reason && o.reason.length > 0, `${o.id} sans motif`);
    }
  });

  it('operationsOf filtre par client', () => {
    const ops = operationsOf('cli-awa');
    for (const o of ops) {
      assert.equal(o.clientId, 'cli-awa');
    }
    assert.ok(ops.length > 0);
  });
});

describe('Fidélité — niveaux', () => {
  it('levelFor renvoie le bon palier', () => {
    assert.equal(levelFor(0).id, 'bronze');
    assert.equal(levelFor(500).id, 'argent');
    assert.equal(levelFor(1500).id, 'or');
    assert.equal(levelFor(5000).id, 'platine');
  });

  it('nextLevel renvoie le palier supérieur ou null au maximum', () => {
    assert.equal(nextLevel(0)?.id, 'argent');
    assert.equal(nextLevel(5000), null);
  });

  it('levelProgress est borné entre 0 et 100', () => {
    for (const pts of [0, 250, 500, 1000, 1500, 5000]) {
      const p = levelProgress(pts);
      assert.ok(p >= 0 && p <= 100, `progression hors bornes : ${p}`);
    }
  });
});

describe('Fidélité — statistiques', () => {
  it('les points en circulation somment les soldes clients', () => {
    const s = loyaltyStats();
    assert.equal(s.pointsInCirculation, CLIENTS.reduce((sum, c) => sum + c.points, 0));
    assert.equal(s.members, CLIENTS.length);
  });

  it('les points émis somment les gains positifs', () => {
    const s = loyaltyStats();
    assert.equal(
      s.pointsIssued,
      POINTS_OPERATIONS.filter((o) => o.points > 0).reduce((sum, o) => sum + o.points, 0)
    );
  });

  it('les points expirés somment les expirations', () => {
    const s = loyaltyStats();
    assert.equal(
      s.pointsExpired,
      POINTS_OPERATIONS.filter((o) => o.type === 'expiration').reduce((sum, o) => sum + Math.abs(o.points), 0)
    );
  });
});

describe('Fidélité — rendus', () => {
  it('la synthèse affiche les membres et les points', async () => {
    const view = await render(inShell(h(LoyaltyOverview, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('Membres'), 'carte membres absente');
    assert.ok(text.includes('Points en circulation'), 'carte points absente');
    await view.unmount();
  });

  it('les règles affichent les presets et l’exclusion', async () => {
    const view = await render(inShell(h(LoyaltyRulesScreen, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('Standard'), 'preset Standard absent');
    assert.ok(text.toLowerCase().includes('exclu'), 'règle d’exclusion absente');
    await view.unmount();
  });

  it('l’historique affiche les opérations', async () => {
    const view = await render(inShell(h(PointsLedgerScreen, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('Correction'), 'opération de correction absente');
    await view.unmount();
  });

  it('le panneau de fidélité client affiche le solde et le niveau', async () => {
    const view = await render(inShell(h(ClientLoyaltyPanel, { clientId: 'cli-awa' })));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('Solde de points'), 'solde absent');
    assert.ok(text.includes('Fidélité'), 'titre absent');
    await view.unmount();
  });
});
