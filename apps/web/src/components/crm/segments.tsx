/**
 * DIVINI exo — CRM · segments (LOT 08)
 *
 * Segments créables et réutilisables comme cibles. Le segment VIP affiche sa
 * règle et la rend **configurable** (interdit §11 : jamais codée en dur).
 *
 * Honnêteté : données de démonstration ; tailles de segment calculées sur le
 * catalogue mocké ; aucune écriture réelle.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Badge, Button, Icon, Input } from '../ui';
import { FieldGroup } from '../ui/Field';
import { useToast } from '../ui/Toast';

import {
  SEGMENTS,
  VIP_RULE,
  CLIENTS,
  findSegment,
  qualifiesVip,
  clientRevenue,
  formatFcfa,
  type VipRule
} from './mock';

import styles from './crm.module.css';

/** Constructeur de segment + règle VIP configurable. */
function SegmentBuilder() {
  const { push } = useToast();
  const [rule, setRule] = useState<VipRule>(VIP_RULE);
  const [label, setLabel] = useState('');
  const [criteria, setCriteria] = useState('');

  const vipCount = CLIENTS.filter((c) => qualifiesVip(c.id, rule)).length;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Créer un segment</span>
      </div>

      <div className={styles.infoGrid}>
        <FieldGroup label="Nom du segment">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex. Grands comptes" />
        </FieldGroup>
        <FieldGroup label="Critères" hint="En langage lisible — démonstration.">
          <Input value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder="Ex. CA ≥ 1 000 000 FCFA" />
        </FieldGroup>
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            if (label.trim().length === 0) return;
            push({
              tone: 'success',
              title: 'Segment créé (démo)',
              description: 'Réutilisable comme cible de relance. Aucune écriture réelle.'
            });
          }}
        >
          Enregistrer le segment
        </Button>
      </div>

      <div className={styles.separator}>
        <Icon name="sliders" size="var(--ctl-icon-sm)" />
        Règle VIP — configurable, jamais codée en dur
      </div>

      <div className={styles.infoGrid}>
        <FieldGroup label="Achats minimum">
          <Input
            type="number"
            min={1}
            value={rule.minPurchases}
            onChange={(e) => setRule({ ...rule, minPurchases: Number(e.target.value) })}
          />
        </FieldGroup>
        <FieldGroup label="CA total minimum (FCFA)">
          <Input
            type="number"
            min={0}
            step={10000}
            value={rule.minRevenue}
            onChange={(e) => setRule({ ...rule, minRevenue: Number(e.target.value) })}
          />
        </FieldGroup>
      </div>
      <p className={styles.hint}>
        Avec cette règle, <span className={styles.mono}>{vipCount}</span> client(s) sont VIP.
        Défaut produit : {VIP_RULE.minPurchases}+ achats ET ≥ {formatFcfa(VIP_RULE.minRevenue)}.
      </p>
    </div>
  );
}

export function SegmentsScreen() {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Segments</h1>
          <p className={styles.hint}>
            {SEGMENTS.length} segments de démonstration · réutilisables comme cibles de relance.
          </p>
        </div>
      </div>

      <div className={styles.split}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Segments enregistrés</span>
          </div>
          {SEGMENTS.map((seg) => (
            <div key={seg.id} className={styles.scenarioRow}>
              <div>
                <div className={styles.scenarioFlow}>
                  <Link href={`/app/clients/segments/${seg.id}`} style={{ color: 'var(--text-primary)' }}>
                    {seg.label}
                  </Link>
                </div>
                <div className={styles.scenarioMeta}>{seg.criteria}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                {seg.isVipRule ? (
                  <Badge tone="warning" withIcon={false}>
                    règle configurable
                  </Badge>
                ) : null}
                <span className={styles.mono}>{seg.memberIds.length}</span>
              </div>
            </div>
          ))}
        </div>

        <SegmentBuilder />
      </div>
    </div>
  );
}

export function SegmentDetail({ id }: { id: string }) {
  const segment = findSegment(id);

  if (!segment) {
    return (
      <div className={styles.wrap}>
        <p className={styles.hint}>Segment introuvable dans les données de démonstration.</p>
      </div>
    );
  }

  const members = segment.memberIds.map((mid) => CLIENTS.find((c) => c.id === mid)).filter(Boolean);

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>{segment.label}</h1>
          <p className={styles.hint}>{segment.criteria}</p>
        </div>
        <Badge tone={segment.isVipRule ? 'warning' : 'neutral'} withIcon={false}>
          {members.length} membre(s)
        </Badge>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Membres</span>
          <span className={styles.hint}>Cible réutilisable pour les relances</span>
        </div>
        {members.length === 0 ? (
          <p className={styles.hint}>Aucun membre pour ce segment avec les données de démonstration.</p>
        ) : (
          members.map((c) => (
            <div key={c!.id} className={styles.scenarioRow}>
              <div>
                <div className={styles.scenarioFlow}>
                  <Link href={`/app/clients/${c!.id}`} style={{ color: 'var(--text-primary)' }}>
                    {c!.name}
                  </Link>
                </div>
                <div className={styles.scenarioMeta}>
                  {c!.segment} · CA {formatFcfa(clientRevenue(c!.id))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
