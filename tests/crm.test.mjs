/**
 * DIVINI exo — Tests CRM (LOT 08)
 *
 * Règles non négociables : consentement inconnu JAMAIS traité comme accordé ;
 * historique immuable (toute modification crée un événement, n'efface rien) ;
 * consentement ≠ autorisation d'envoi ; règle VIP configurable ; cohérence des
 * achats avec les ventes LOT 06 ; tokens publics ; rendus.
 * Le rendu réel (breakpoints, thèmes, reduced-motion) est reporté dans LOT-08-VALIDATION.md.
 */

import { afterEach, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CLIENTS,
  CONSENTS,
  CONSENT_HISTORY,
  VIP_RULE,
  findClient,
  purchasesOf,
  qualifiesVip,
  clientMetrics,
  prospectMetrics,
  consentsOf,
  consentOf,
  isGranted,
  canSendNow,
  historyOf,
  buildConsentEvent,
  resolveToken,
  ClientList,
  ProspectList,
  ConsentPanel
} from '../apps/web/src/components/crm/index.ts';

import { ShellStateProvider } from '../apps/web/src/lib/shell-state.tsx';
import { ToastProvider } from '../apps/web/src/components/ui/Toast.tsx';

import { createDom } from './helpers/dom.mjs';
import { h, render, unmountAll } from './helpers/react.mjs';

before(() => createDom());
afterEach(() => unmountAll());

function inCrm(element) {
  return h(ShellStateProvider, null, h(ToastProvider, null, element));
}

describe('CRM — consentements : inconnu ≠ accordé', () => {
  it('un consentement inconnu n’est jamais accordé', () => {
    const unknown = CONSENTS.find((c) => c.status === 'unknown');
    assert.ok(unknown, 'aucun consentement inconnu dans les données');
    assert.equal(isGranted(unknown), false);
  });

  it('seul le statut « granted » vaut accord', () => {
    for (const c of CONSENTS) {
      assert.equal(isGranted(c), c.status === 'granted');
    }
  });

  it('un consentement absent est traité comme inconnu, non accordé', () => {
    assert.equal(isGranted(undefined), false);
  });
});

describe('CRM — consentement ≠ autorisation d’envoi', () => {
  it('un consentement accordé sans blocage autorise l’envoi', () => {
    assert.equal(canSendNow('cli-awa', 'sms'), true);
  });

  it('un consentement inconnu n’autorise pas l’envoi', () => {
    assert.equal(canSendNow('cli-awa', 'whatsapp'), false);
  });

  it('un do-not-contact bloque l’envoi même avec un consentement accordé', () => {
    const client = findClient('cli-ibrahima');
    assert.equal(client.doNotContact, true);
    // cli-ibrahima a un consentement whatsapp accordé…
    assert.equal(isGranted(consentOf('cli-ibrahima', 'whatsapp')), true);
    // …mais l'envoi reste refusé à cause du do-not-contact.
    assert.equal(canSendNow('cli-ibrahima', 'whatsapp'), false);
  });
});

describe('CRM — historique immuable', () => {
  it('une modification crée un nouvel événement sans toucher l’historique', () => {
    const before = CONSENT_HISTORY.length;
    const snapshot = CONSENT_HISTORY.map((e) => e.id);
    const event = buildConsentEvent('cli-awa', 'sms', 'granted', 'withdrawn', 'Opérateur', 'Opt-out', 1);
    // L'historique existant n'est ni muté ni écrasé.
    assert.equal(CONSENT_HISTORY.length, before);
    assert.deepEqual(CONSENT_HISTORY.map((e) => e.id), snapshot);
    // Le nouvel événement est distinct et horodaté.
    assert.ok(event.id);
    assert.ok(!snapshot.includes(event.id), 'le nouvel événement écrase un existant');
    assert.equal(event.to, 'withdrawn');
    assert.ok(event.date);
  });

  it('l’historique d’un client est trié du plus récent au plus ancien', () => {
    const hist = historyOf('cli-awa');
    for (let i = 1; i < hist.length; i++) {
      assert.ok(hist[i - 1].date >= hist[i].date, 'historique non trié');
    }
  });
});

describe('CRM — règle VIP configurable', () => {
  it('la règle par défaut est 10+ achats ET ≥ 500 000 FCFA', () => {
    assert.equal(VIP_RULE.minPurchases, 10);
    assert.equal(VIP_RULE.minRevenue, 500_000);
  });

  it('une règle plus stricte ne qualifie personne de plus', () => {
    const strict = { minPurchases: 999, minRevenue: 999_999_999 };
    for (const c of CLIENTS) {
      assert.equal(qualifiesVip(c.id, strict), false);
    }
  });

  it('une règle plus large qualifie au moins autant de clients', () => {
    const loose = { minPurchases: 1, minRevenue: 0 };
    const strictCount = CLIENTS.filter((c) => qualifiesVip(c.id, VIP_RULE)).length;
    const looseCount = CLIENTS.filter((c) => qualifiesVip(c.id, loose)).length;
    assert.ok(looseCount >= strictCount);
  });
});

describe('CRM — cohérence avec les ventes LOT 06', () => {
  it('les achats d’un client proviennent des documents de vente LOT 06', () => {
    const purchases = purchasesOf('cli-awa');
    for (const d of purchases) {
      assert.equal(d.customer, 'Client — Awa Diop');
      assert.ok(d.kind === 'vente' || d.kind === 'facture');
    }
  });

  it('les indicateurs clients sont cohérents', () => {
    const m = clientMetrics();
    assert.equal(m.total, CLIENTS.length);
    assert.ok(m.pointsInCirculation >= 0);
    assert.ok(m.estimatedLtv >= 0);
  });

  it('les indicateurs prospects exposent un taux de conversion borné', () => {
    const m = prospectMetrics();
    assert.ok(m.tauxConversion >= 0 && m.tauxConversion <= 100);
    assert.equal(m.total, 6);
  });
});

describe('CRM — page publique (tokens)', () => {
  it('résout un token valide, expiré et révoqué', () => {
    assert.equal(resolveToken('demo-valide-001')?.status, 'valid');
    assert.equal(resolveToken('demo-expire-002')?.status, 'expired');
    assert.equal(resolveToken('demo-revoque-003')?.status, 'revoked');
  });

  it('un token inconnu n’est pas résolu', () => {
    assert.equal(resolveToken('inexistant'), undefined);
  });
});

describe('CRM — rendus', () => {
  it('la liste clients affiche le catalogue', async () => {
    const view = await render(inCrm(h(ClientList, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('Awa Diop'), 'client absent');
    await view.unmount();
  });

  it('la liste prospects affiche le pipeline et les indicateurs', async () => {
    const view = await render(inCrm(h(ProspectList, null)));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('Pipeline'), 'pipeline absent');
    assert.ok(text.includes('Taux de conversion'), 'indicateur absent');
    await view.unmount();
  });

  it('le panneau de consentements distingue inconnu et accordé', async () => {
    const view = await render(inCrm(h(ConsentPanel, { clientId: 'cli-awa' })));
    const text = document.body.textContent ?? '';
    assert.ok(text.includes('Inconnu'), 'statut inconnu absent');
    assert.ok(text.includes('Accordé'), 'statut accordé absent');
    assert.ok(text.includes('Immuable'), 'mention d’immuabilité absente');
    await view.unmount();
  });
});
