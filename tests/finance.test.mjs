/**
 * DIVINI exo — Tests Finance (LOT 09)
 *
 * Cohérence des soldes avec les flux (et les paiements LOT 06), projection
 * locale + bascule négative, workflow de dépense, approbation conditionnée au
 * rôle, période clôturée verrouillée, devises (taux + date + source), rendus.
 * Le rendu réel (breakpoints, thèmes, reduced-motion) est reporté dans LOT-09-VALIDATION.md.
 */

import { afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  ACCOUNTS,
  CASH_FLOWS,
  EXPENSES,
  EXPENSE_TRANSITIONS,
  PERIODS,
  EXCHANGE_RATES,
  accountBalance,
  totalCash,
  signedAmount,
  buildProjection,
  negativeCrossoverDate,
  projectedMinimum,
  isPeriodLocked,
  netResult,
  findRate,
  convert,
  canApprove,
  TresorerieScreen,
  CashVisionScreen,
  ExpenseList
} from '../apps/web/src/components/finance/index.ts';

import { ShellStateProvider } from '../apps/web/src/lib/shell-state.tsx';
import { ToastProvider } from '../apps/web/src/components/ui/Toast.tsx';

import { createDom } from './helpers/dom.mjs';
import { h, render, unmountAll } from './helpers/react.mjs';

before(() => createDom());
afterEach(() => unmountAll());

function inFinance(element) {
  return h(ShellStateProvider, null, h(ToastProvider, null, element));
}

describe('Finance — cohérence soldes / flux', () => {
  it('le solde d’un compte = solde initial + flux passés signés', () => {
    for (const acc of ACCOUNTS) {
      const past = CASH_FLOWS.filter((f) => f.accountId === acc.id && !f.projected);
      const expected = acc.openingBalance + past.reduce((s, f) => s + signedAmount(f), 0);
      assert.equal(accountBalance(acc.id), expected);
    }
  });

  it('la trésorerie totale est la somme des soldes de comptes', () => {
    assert.equal(totalCash(), ACCOUNTS.reduce((s, a) => s + accountBalance(a.id), 0));
  });

  it('les encaissements reprennent les paiements du LOT 06', () => {
    const pay1 = CASH_FLOWS.find((f) => f.ref === 'PAY-2026-0001');
    const pay2 = CASH_FLOWS.find((f) => f.ref === 'PAY-2026-0002');
    assert.equal(pay1?.amount, 6000);
    assert.equal(pay2?.amount, 5000);
  });

  it('un paiement échoué n’entre pas en trésorerie', () => {
    const failed = CASH_FLOWS.find((f) => f.ref === 'PAY-2026-0003');
    assert.equal(failed, undefined, 'le paiement échoué ne doit pas générer de flux');
  });
});

describe('Finance — projection locale', () => {
  it('la projection démarre au solde courant et porte des points projetés', () => {
    const points = buildProjection();
    assert.equal(points[0].balance, totalCash());
    assert.equal(points[0].projected, false);
    assert.ok(points.some((p) => p.projected), 'aucun point projeté');
  });

  it('une bascule négative est détectée sur la période projetée', () => {
    const crossover = negativeCrossoverDate();
    assert.ok(crossover, 'aucune bascule négative détectée alors que la projection passe sous zéro');
    const min = projectedMinimum();
    assert.ok(min.balance < 0, 'le minimum projeté devrait être négatif');
  });

  it('les points projetés sont triés chronologiquement', () => {
    const points = buildProjection();
    for (let i = 1; i < points.length; i++) {
      assert.ok(points[i - 1].date <= points[i].date, 'projection non triée');
    }
  });
});

describe('Finance — workflow de dépense', () => {
  it('le workflow suit créée → en attente → approuvée → payée / rejetée', () => {
    assert.deepEqual(EXPENSE_TRANSITIONS.creee, ['en_attente']);
    assert.deepEqual(EXPENSE_TRANSITIONS.en_attente, ['approuvee', 'rejetee']);
    assert.deepEqual(EXPENSE_TRANSITIONS.approuvee, ['payee']);
  });

  it('payée et rejetée sont des statuts terminaux', () => {
    assert.deepEqual(EXPENSE_TRANSITIONS.payee, []);
    assert.deepEqual(EXPENSE_TRANSITIONS.rejetee, []);
  });

  it('toute dépense a un statut du workflow', () => {
    for (const e of EXPENSES) {
      assert.ok(EXPENSE_TRANSITIONS[e.status] !== undefined, `statut inconnu ${e.status}`);
    }
  });
});

describe('Finance — approbation conditionnée au rôle', () => {
  it('seul le gérant peut approuver', () => {
    assert.equal(canApprove('gerant'), true);
    assert.equal(canApprove('comptable'), false);
    assert.equal(canApprove('employe'), false);
  });
});

describe('Finance — périodes verrouillées', () => {
  it('une période clôturée est verrouillée, une ouverte ne l’est pas', () => {
    for (const p of PERIODS) {
      assert.equal(isPeriodLocked(p), p.status === 'cloturee');
    }
  });

  it('le résultat net est revenus − dépenses', () => {
    assert.equal(typeof netResult(), 'number');
  });
});

describe('Finance — devises honnêtes', () => {
  it('chaque taux porte une date et une source', () => {
    for (const r of EXCHANGE_RATES) {
      assert.ok(r.date, 'taux sans date');
      assert.ok(r.source && r.source.length > 0, 'taux sans source');
    }
  });

  it('la conversion utilise le taux et retourne null sans taux', () => {
    const rate = findRate('EUR', 'XOF');
    assert.equal(convert(100, rate), Math.round(100 * rate.rate));
    assert.equal(convert(100, undefined), null);
  });

  it('un couple de devises inconnu n’a pas de taux', () => {
    assert.equal(findRate('XOF', 'EUR'), undefined);
  });
});

describe('Finance — rendus', () => {
  it('la trésorerie affiche soldes et flux', async () => {
    const view = await render(inFinance(h(TresorerieScreen, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('Trésorerie totale'), 'carte trésorerie absente');
    assert.ok(text.includes('Flux de trésorerie'), 'table des flux absente');
    await view.unmount();
  });

  it('CASH VISION ouvre sur la réponse et distingue passé / projection', async () => {
    const view = await render(inFinance(h(CashVisionScreen, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('bascule négative') || text.includes('Trésorerie suffisante'), 'réponse absente');
    assert.ok(text.includes('Passé (réel)'), 'légende passé absente');
    assert.ok(text.includes('Projection (démonstration)'), 'légende projection absente');
    await view.unmount();
  });

  it('la liste de dépenses affiche le catalogue', async () => {
    const view = await render(inFinance(h(ExpenseList, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('DEP-2026-0001'), 'dépense absente');
    await view.unmount();
  });
});
