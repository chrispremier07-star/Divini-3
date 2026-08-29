/**
 * DIVINI exo — jeux de données SIMULÉS (LOT 03)
 *
 * Données générées de façon DÉTERMINISTE (générateur congruentiel linéaire),
 * jamais `Math.random` : les tests et le rendu serveur sont reproductibles.
 *
 * Elles sont signalées comme simulées partout où elles sont affichées
 * (bandeau permanent de la galerie, §10). Aucun contenu n'est issu d'une
 * source de référence visuelle (l. 8334–8358) : libellés neutres, montants en
 * FCFA cohérents, dates plausibles.
 */

import type { Tone } from '../ui/Identity';

export type MockRow = {
  /** Référence en IBM Plex Mono. */
  id: string;
  label: string;
  customer: string;
  /** Montant en FCFA. */
  amount: number;
  qty: number;
  /** Date ISO. */
  date: string;
  status: 'paid' | 'pending' | 'late' | 'draft';
  /** Ligne dont une valeur est inaccessible pour ce rôle (§9 permission denied). */
  locked?: boolean;
};

export const STATUS_TONE: Record<MockRow['status'], Tone> = {
  paid: 'success',
  pending: 'info',
  late: 'critical',
  draft: 'neutral'
};

export const STATUS_LABEL: Record<MockRow['status'], string> = {
  paid: 'Payé',
  pending: 'En attente',
  late: 'En retard',
  draft: 'Brouillon'
};

/** Générateur congruentiel linéaire — déterministe et sans dépendance. */
function makeRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

const LABELS = ['Facture', 'Commande', 'Devis', 'Bon de livraison', 'Avoir'];
const CUSTOMERS = [
  'Client A',
  'Client B',
  'Client C',
  'Client D',
  'Client E',
  'Client F',
  'Client G',
  'Client H'
];
const STATUSES: MockRow['status'][] = ['paid', 'pending', 'late', 'draft'];

/**
 * Génère `count` lignes. Le volume est borné par l'appelant ; la galerie ne
 * monte jamais 50 000 lignes d'un coup en DOM (virtualisation), mais peut les
 * GENERER pour prouver la fluidité.
 */
export function makeRows(count: number, seed = 7): MockRow[] {
  const rng = makeRng(seed);
  const rows: MockRow[] = [];
  const start = Date.UTC(2026, 0, 2);

  for (let i = 0; i < count; i += 1) {
    const labelIndex = Math.floor(rng() * LABELS.length);
    const customerIndex = Math.floor(rng() * CUSTOMERS.length);
    const statusIndex = Math.floor(rng() * STATUSES.length);
    const dayOffset = Math.floor(rng() * 240);
    const date = new Date(start + dayOffset * 86400000).toISOString().slice(0, 10);

    rows.push({
      id: `REF-${String(i + 1).padStart(6, '0')}`,
      label: `${LABELS[labelIndex] ?? 'Document'} ${i + 1}`,
      customer: CUSTOMERS[customerIndex] ?? 'Client',
      amount: Math.round(5000 + rng() * 495000),
      qty: 1 + Math.floor(rng() * 40),
      date,
      status: STATUSES[statusIndex] ?? 'draft',
      locked: i % 37 === 0
    });
  }
  return rows;
}

export const EMPTY_ROWS: MockRow[] = [];
export const ONE_ROW = makeRows(1);
export const FEW_ROWS = makeRows(12);
export const MEDIUM_ROWS = makeRows(500);
/** Volume de preuve pour la virtualisation — généré, jamais monté en entier. */
export const HUGE_COUNT = 50000;

export function formatFcfa(value: number): string {
  return `${value.toLocaleString('fr-FR')} F`;
}
