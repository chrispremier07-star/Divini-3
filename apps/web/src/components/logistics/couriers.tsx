/**
 * DIVINI exo — Logistique · livreurs, zones, statistiques (LOT 10)
 *
 * Livreurs (charge, performance), zones & tarifs **extensibles** (référentiel
 * ouvert, jamais figé — interdit §11), statistiques locales (taux de réussite,
 * CA perdu, motifs d'échec).
 *
 * Honnêteté : données mockées ; statistiques calculées localement ; aucun
 * suivi temps réel réel.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

import { DataPanel, KpiCard, KpiGrid, Chart, ProgressBar } from '../data';
import { Avatar, Badge, Button, EmptyState, Icon, Input } from '../ui';
import { FieldGroup } from '../ui/Field';
import { useToast } from '../ui/Toast';

import {
  COURIERS,
  ZONES,
  findCourier,
  findZone,
  courierLoad,
  deliveriesOfCourier,
  deliveryStats,
  formatFcfa,
  type Zone
} from './mock';

import styles from './logistics.module.css';

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

/* ------------------------------- livreurs -------------------------------- */

export function CourierList() {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Livreurs</h1>
          <p className={styles.hint}>{COURIERS.length} livreurs de démonstration · charge et performance.</p>
        </div>
      </div>
      <div className={styles.courierGrid}>
        {COURIERS.map((c) => {
          const load = courierLoad(c.id);
          const ratio = c.dailyCapacity > 0 ? Math.round((load / c.dailyCapacity) * 100) : 0;
          const tone = !c.active ? 'neutral' : ratio >= 90 ? 'critical' : ratio >= 70 ? 'warning' : 'success';
          return (
            <div key={c.id} className={styles.panel}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <Avatar initials={initials(c.name)} name={c.name} unavailable={!c.active} />
                <div>
                  <div className={styles.deliveryTitle}>
                    <Link href={`/app/livraisons/livreurs/${c.id}`} style={{ color: 'var(--text-primary)' }}>
                      {c.name}
                    </Link>
                  </div>
                  <div className={styles.hint}>{c.active ? c.phone : 'Hors service'}</div>
                </div>
                <Badge tone={c.active ? 'success' : 'neutral'} withIcon={false}>
                  {c.active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
                  <span className={styles.infoLabel}>Charge du jour</span>
                  <span className={styles.mono}>
                    {load} / {c.dailyCapacity}
                  </span>
                </div>
                <ProgressBar value={ratio} tone={tone === 'neutral' ? 'success' : tone} thresholds={{ warning: 70, critical: 90 }} />
              </div>
              <div className={styles.hint}>
                Zones : {c.zoneIds.map((z) => findZone(z)?.label ?? z).join(', ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CourierDetail({ id }: { id: string }) {
  const courier = findCourier(id);
  if (!courier) {
    return <EmptyState title="Livreur introuvable" description="Données de démonstration." icon="truck" />;
  }
  const deliveries = deliveriesOfCourier(courier.id);
  const delivered = deliveries.filter((d) => d.status === 'livree').length;
  const rate = deliveries.length > 0 ? Math.round((delivered / deliveries.length) * 100) : 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>{courier.name}</h1>
          <p className={styles.hint}>
            {courier.active ? courier.phone : 'Hors service'} · {courier.zoneIds.map((z) => findZone(z)?.label).join(', ')}
          </p>
        </div>
        <Badge tone={courier.active ? 'success' : 'neutral'} withIcon={false}>
          {courier.active ? 'Actif' : 'Inactif'}
        </Badge>
      </div>
      <KpiGrid>
        <KpiCard label="Livraisons affectées" value={deliveries.length} format={(v) => String(v)} period="Démonstration" />
        <KpiCard label="Livrées" value={delivered} format={(v) => String(v)} period="Démonstration" />
        <KpiCard label="Taux de réussite" value={rate} format={(v) => `${v} %`} period="Démonstration" note="Valeur mockée" />
      </KpiGrid>
    </div>
  );
}

/* -------------------------------- zones ---------------------------------- */

export function ZonesScreen() {
  const { push } = useToast();
  const [zones, setZones] = useState<Zone[]>(ZONES);
  const [label, setLabel] = useState('');
  const [rate, setRate] = useState('');
  const [minutes, setMinutes] = useState('');

  function addZone() {
    if (label.trim().length === 0) return;
    setZones((prev) => [
      ...prev,
      { id: `zone-${prev.length + 1}`, label: label.trim(), rate: Number(rate) || 0, estimatedMinutes: Number(minutes) || 0 }
    ]);
    setLabel('');
    setRate('');
    setMinutes('');
    push({ tone: 'success', title: 'Zone ajoutée (démo)', description: 'Référentiel extensible — aucune écriture réelle.' });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Zones & tarifs</h1>
          <p className={styles.hint}>
            Référentiel **extensible** — la liste n'est jamais figée (aucune liste fermée de zones).
          </p>
        </div>
      </div>

      <DataPanel title="Zones de démonstration" subtitle="Tarif et durée estimée">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Zone</th>
              <th className={styles.num}>Tarif</th>
              <th className={styles.num}>Durée estimée</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id}>
                <td>{z.label}</td>
                <td className={styles.num}>{formatFcfa(z.rate)}</td>
                <td className={styles.num}>{z.estimatedMinutes} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataPanel>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Ajouter une zone</span>
        </div>
        <div className={styles.infoGrid}>
          <FieldGroup label="Nom de la zone" required>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex. Bingerville" />
          </FieldGroup>
          <FieldGroup label="Tarif (FCFA)">
            <Input type="number" min={0} value={rate} onChange={(e) => setRate(e.target.value)} />
          </FieldGroup>
          <FieldGroup label="Durée estimée (min)">
            <Input type="number" min={0} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </FieldGroup>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" size="sm" onClick={addZone}>
            <Icon name="plus" size="var(--ctl-icon-sm)" /> Ajouter la zone
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- statistiques ------------------------------ */

export function DeliveryStatsScreen() {
  const stats = deliveryStats();

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Statistiques logistique</h1>
          <p className={styles.hint}>Calculées localement à partir des expéditions de démonstration.</p>
        </div>
      </div>

      <KpiGrid>
        <KpiCard label="Taux de réussite" value={stats.successRate} format={(v) => `${v} %`} period="Démonstration" />
        <KpiCard label="Livrées" value={stats.livree} format={(v) => String(v)} period="Démonstration" />
        <KpiCard label="Échouées" value={stats.echouee} format={(v) => String(v)} period="Démonstration" />
        <KpiCard label="CA perdu" value={stats.lostRevenue} format={formatFcfa} period="Échouées + annulées" note="Donnée qui fait agir" />
      </KpiGrid>

      <div className={styles.split}>
        <DataPanel title="Motifs d'échec" subtitle="Répartition">
          {stats.failureReasons.length === 0 ? (
            <p className={styles.hint}>Aucun échec enregistré.</p>
          ) : (
            <Chart
              kind="bar"
              labels={stats.failureReasons.map((r) => r.reason)}
              series={[{ id: 'failures', label: 'Échecs', values: stats.failureReasons.map((r) => r.count), color: 'var(--state-critical)' }]}
              formatValue={(v) => String(v)}
            />
          )}
        </DataPanel>
        <DataPanel title="Répartition des statuts" subtitle="Démonstration">
          <table className={styles.table}>
            <tbody>
              <tr><td>Livrées</td><td className={styles.num}>{stats.livree}</td></tr>
              <tr><td>Échouées</td><td className={styles.num}>{stats.echouee}</td></tr>
              <tr><td>Annulées</td><td className={styles.num}>{stats.annulee}</td></tr>
              <tr><td>Reprogrammées</td><td className={styles.num}>{stats.reprogrammee}</td></tr>
            </tbody>
          </table>
        </DataPanel>
      </div>
    </div>
  );
}
