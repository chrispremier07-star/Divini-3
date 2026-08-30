/**
 * DIVINI exo — /dev/cockpit · galerie technique des états (LOT 05)
 *
 * Exerce les familles d'états d'écran exigées (§9) : chargement, vide, erreur,
 * hors ligne, permission refusée. Route technique, clairement présentée comme
 * une variation — le cockpit réel vit sur `/app`.
 */

'use client';

import { useState } from 'react';

import { AppShell } from '@/components/shell';
import { Cockpit, type CockpitState } from '@/components/cockpit';

const STATES: Array<{ id: CockpitState; label: string }> = [
  { id: 'auto', label: 'En direct (prêt / hors ligne selon connexion)' },
  { id: 'loading', label: 'Chargement (skeletons)' },
  { id: 'empty', label: 'Vide (aucune activité)' },
  { id: 'error', label: 'Erreur' },
  { id: 'offline', label: 'Hors ligne' },
  { id: 'denied', label: 'Permission refusée' }
];

export default function DevCockpitPage() {
  const [state, setState] = useState<CockpitState>('auto');

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        <p className="t-body-small">
          Galerie technique : le même Cockpit dans ses états d’écran. Données de
          démonstration signalées.
        </p>
        <label className="t-label" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
          État d’écran
          <select
            value={state}
            onChange={(e) => setState(e.target.value as CockpitState)}
            style={{
              minHeight: 'var(--d-button-height)',
              padding: '0 var(--sp-3)',
              borderRadius: 'var(--r-sm)',
              border: 'var(--bw-hairline) solid var(--border-default)',
              backgroundColor: 'var(--surface-recessed)',
              color: 'var(--text-primary)'
            }}
          >
            {STATES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <Cockpit demoState={state} />
      </div>
    </AppShell>
  );
}
