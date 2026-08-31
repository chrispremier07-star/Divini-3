/**
 * DIVINI exo — CRM · relances & scénarios (LOT 08)
 *
 * Moteur de scénarios : déclencheur → cible → action → fréquence. Un scénario se
 * comprend en une ligne ; il s'active et se désactive sans ambiguïté, avec audit
 * visuel. Aucun envoi réel (interdit §11) — les scénarios sont « prêts à envoyer »
 * mais non envoyés.
 *
 * Honnêteté : données mockées ; activations de démonstration.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Badge, Button, EmptyState, Icon, Select, Switch } from '../ui';
import { FieldGroup } from '../ui/Field';
import { Timeline } from '../data';
import { useToast } from '../ui/Toast';

import {
  SCENARIOS,
  TRIGGER_LABELS,
  AUDIENCE_LABELS,
  findScenario,
  type Scenario,
  type ScenarioAudience,
  type ScenarioTrigger
} from './mock';

import styles from './crm.module.css';

/** Un scénario en une ligne : déclencheur → cible → action → fréquence. */
function ScenarioRow({ scenario, onToggle }: { scenario: Scenario; onToggle: () => void }) {
  return (
    <div className={styles.scenarioRow}>
      <div>
        <div className={styles.scenarioFlow}>
          <Link href={`/app/relances/scenarios/${scenario.id}`} style={{ color: 'var(--text-primary)' }}>
            {scenario.label}
          </Link>
        </div>
        <div className={styles.scenarioMeta}>
          {TRIGGER_LABELS[scenario.trigger]} → {AUDIENCE_LABELS[scenario.audience]} → {scenario.action} ·{' '}
          {scenario.frequency}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
        <Badge tone={scenario.active ? 'success' : 'neutral'} withIcon={false}>
          {scenario.active ? 'Actif' : 'Inactif'}
        </Badge>
        <Switch checked={scenario.active} onChange={onToggle} label={`Activer ${scenario.label}`} />
      </div>
    </div>
  );
}

export function ScenarioList() {
  const { push } = useToast();
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(SCENARIOS.map((s) => [s.id, s.active]))
  );

  function toggle(id: string) {
    setActive((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      push({
        tone: next[id] ? 'success' : 'info',
        title: next[id] ? 'Scénario activé (démo)' : 'Scénario désactivé (démo)',
        description: 'Aucun envoi réel — exécution reportée au backend / LOT 12.'
      });
      return next;
    });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Relances & scénarios</h1>
          <p className={styles.hint}>
            {SCENARIOS.length} scénarios de démonstration · prêts à envoyer, aucun envoi réel.
          </p>
        </div>
      </div>

      <div className={styles.panel}>
        {SCENARIOS.map((s) => (
          <ScenarioRow key={s.id} scenario={{ ...s, active: active[s.id] ?? s.active }} onToggle={() => toggle(s.id)} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ éditeur ---------------------------------- */

export function ScenarioEditor({ id }: { id: string }) {
  const scenario = findScenario(id);
  const { push } = useToast();
  const [trigger, setTrigger] = useState<ScenarioTrigger>(scenario?.trigger ?? 'apres_achat');
  const [audience, setAudience] = useState<ScenarioAudience>(scenario?.audience ?? 'nouveaux');

  if (!scenario) {
    return (
      <EmptyState
        title="Scénario introuvable"
        description="Ce scénario n'existe pas dans les données de démonstration."
        icon="bell"
      />
    );
  }

  const triggerOptions = Object.entries(TRIGGER_LABELS).map(([value, label]) => ({ value, label }));
  const audienceOptions = Object.entries(AUDIENCE_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>{scenario.label}</h1>
          <div className={styles.profileMeta}>
            <Badge tone={scenario.active ? 'success' : 'neutral'} withIcon={false}>
              {scenario.active ? 'Actif' : 'Inactif'}
            </Badge>
            {scenario.recurrent ? <Badge tone="info" withIcon={false}>récurrent</Badge> : null}
            {scenario.schedulable ? <Badge tone="neutral" withIcon={false}>programmable</Badge> : null}
          </div>
        </div>
      </div>

      <div className={styles.split}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Configuration</span>
          </div>
          <div className={styles.infoGrid}>
            <FieldGroup label="Déclencheur">
              <Select
                options={triggerOptions}
                value={trigger}
                onChange={(v) => setTrigger(v as ScenarioTrigger)}
              />
            </FieldGroup>
            <FieldGroup label="Cible">
              <Select
                options={audienceOptions}
                value={audience}
                onChange={(v) => setAudience(v as ScenarioAudience)}
              />
            </FieldGroup>
            <FieldGroup label="Action">
              <span className={styles.infoValue}>{scenario.action}</span>
            </FieldGroup>
            <FieldGroup label="Fréquence">
              <span className={styles.infoValue}>{scenario.frequency}</span>
            </FieldGroup>
          </div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                push({
                  tone: 'success',
                  title: 'Scénario enregistré (démo)',
                  description: 'Aucun envoi réel — exécution reportée.'
                })
              }
            >
              Enregistrer
            </Button>
            <Button
              variant="subtil"
              size="sm"
              onClick={() =>
                push({
                  tone: 'info',
                  title: scenario.active ? 'Scénario désactivé (démo)' : 'Scénario activé (démo)',
                  description: 'Aucun envoi réel.'
                })
              }
            >
              <Icon name="zap" size="var(--ctl-icon-sm)" />
              {scenario.active ? 'Désactiver' : 'Activer'}
            </Button>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Audit</span>
            <span className={styles.hint}>Exécutions de démonstration</span>
          </div>
          {scenario.auditTrail.length === 0 ? (
            <p className={styles.hint}>Aucune exécution enregistrée pour ce scénario.</p>
          ) : (
            <Timeline
              items={scenario.auditTrail.map((a) => ({
                date: a.date,
                actor: 'Moteur de relance',
                title: scenario.label,
                result: a.result,
                tone: 'info'
              }))}
            />
          )}
          <p className={styles.hint}>
            Les scénarios sont auditables mais n'envoient rien : l'envoi réel relève du
            backend / LOT 12.
          </p>
        </div>
      </div>
    </div>
  );
}
