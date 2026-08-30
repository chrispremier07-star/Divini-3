/**
 * DIVINI exo — Logistique · expéditions (LOT 10)
 *
 * Board par statut, fiche (timeline, étiquette, changement de statut),
 * création depuis une commande LOT 06, affectation, reprogrammation, annulation.
 *
 * Honnêteté : données mockées signalées ; **motif d'échec obligatoire** (un échec
 * sans motif est refusé) ; aucune notification ni suivi temps réel réel.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Kanban, type KanbanColumnData, Timeline, DataPanel } from '../data';
import { Badge, Button, EmptyState, Icon, Input, Select } from '../ui';
import { FieldGroup } from '../ui/Field';
import { ConfirmDialog, Modal } from '../ui/Overlay';
import { useToast } from '../ui/Toast';

import {
  DELIVERIES,
  DELIVERY_STATUS_META,
  DELIVERY_TRANSITIONS,
  COURIERS,
  FAILURE_REASONS,
  findDelivery,
  findCourier,
  findZone,
  orderAmount,
  formatFcfa,
  type Delivery,
  type DeliveryStatus
} from './mock';

import styles from './logistics.module.css';

const STATUSES = Object.keys(DELIVERY_STATUS_META) as DeliveryStatus[];

function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const meta = DELIVERY_STATUS_META[status];
  return (
    <Badge tone={meta.tone} withIcon={false}>
      {meta.label}
    </Badge>
  );
}

/* --------------------------------- board --------------------------------- */

export function DeliveryBoard() {
  const columns: KanbanColumnData[] = STATUSES.map((status) => ({
    id: status,
    title: `${DELIVERY_STATUS_META[status].label} (${DELIVERIES.filter((d) => d.status === status).length})`,
    cards: DELIVERIES.filter((d) => d.status === status).map((d) => ({
      id: d.id,
      title: d.ref,
      meta: `${d.orderRef} · ${findZone(d.zoneId)?.label ?? '—'}`,
      tone: DELIVERY_STATUS_META[status].tone === 'neutral' ? undefined : DELIVERY_STATUS_META[status].tone
    }))
  }));

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Expéditions</h1>
          <p className={styles.hint}>
            {DELIVERIES.length} expéditions de démonstration · rattachées aux commandes du LOT 06.
          </p>
        </div>
        <Link href="/app/livraisons/nouveau">
          <Button variant="primary" size="sm" onClick={() => undefined}>
            <Icon name="plus" size="var(--ctl-icon-sm)" /> Nouvelle expédition
          </Button>
        </Link>
      </div>

      <div className={styles.demoBanner}>
        <Icon name="info" size="var(--ctl-icon-sm)" />
        <span>Données de démonstration — aucune notification ni suivi temps réel réel.</span>
      </div>

      <div className={styles.panel}>
        <Kanban columns={columns} />
      </div>
    </div>
  );
}

/* ------------------------------- étiquette ------------------------------- */

function LabelPreview({ delivery }: { delivery: Delivery }) {
  const [open, setOpen] = useState(false);
  const zone = findZone(delivery.zoneId);

  return (
    <>
      <Button variant="subtil" size="sm" onClick={() => setOpen(true)}>
        <Icon name="file" size="var(--ctl-icon-sm)" /> Étiquette
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Étiquette de livraison" size="sm">
        <div className={styles.label}>
          <div className={styles.labelRow}>
            <span>{delivery.ref}</span>
            <span>{zone?.label ?? '—'}</span>
          </div>
          <div className={styles.labelRow}>
            <span>Commande {delivery.orderRef}</span>
            <span>{formatFcfa(orderAmount(delivery.orderRef))}</span>
          </div>
          <div className={styles.labelRow}>
            <span>Livreur</span>
            <span>{delivery.courierId ? findCourier(delivery.courierId)?.name : 'Non affecté'}</span>
          </div>
          <div className={styles.labelBarcode} aria-hidden />
          <div className={styles.labelRow}>
            <span>{delivery.ref}</span>
          </div>
        </div>
        <p className={styles.hint}>
          Aperçu de démonstration — aucune génération d'étiquette réelle.
        </p>
      </Modal>
    </>
  );
}

/* -------------------------------- détail --------------------------------- */

export function DeliveryDetail({ id }: { id: string }) {
  const delivery = findDelivery(id);
  const { push } = useToast();
  const [confirm, setConfirm] = useState<DeliveryStatus | null>(null);
  const [failureReason, setFailureReason] = useState('');
  const [touched, setTouched] = useState(false);

  if (!delivery) {
    return (
      <EmptyState
        title="Expédition introuvable"
        description="Cette expédition n'existe pas dans les données de démonstration."
        icon="truck"
      />
    );
  }

  const zone = findZone(delivery.zoneId);
  const courier = delivery.courierId ? findCourier(delivery.courierId) : undefined;
  const next = DELIVERY_TRANSITIONS[delivery.status];
  const reasonError = touched && failureReason.trim().length === 0 ? 'Le motif d’échec est obligatoire.' : undefined;

  function requestTransition(target: DeliveryStatus) {
    if (target === 'echouee') {
      setTouched(true);
      if (failureReason.trim().length === 0) return; // refusé sans motif
    }
    setConfirm(target);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <div className={styles.deliveryRef}>{delivery.ref}</div>
          <h1 className={styles.title}>Commande {delivery.orderRef}</h1>
          <div className={styles.hint}>
            {zone?.label} · {formatFcfa(orderAmount(delivery.orderRef))} · créée le{' '}
            {new Date(delivery.createdAt).toLocaleDateString('fr-FR')}
          </div>
        </div>
        <DeliveryStatusBadge status={delivery.status} />
      </div>

      <div className={styles.split}>
        <DataPanel title="Suivi" subtitle="Timeline de démonstration">
          <Timeline
            items={delivery.events.map((e) => ({
              date: e.date,
              actor: e.actor,
              title: DELIVERY_STATUS_META[e.status].label,
              result: e.note,
              tone: DELIVERY_STATUS_META[e.status].tone === 'neutral' ? 'info' : DELIVERY_STATUS_META[e.status].tone
            }))}
          />
        </DataPanel>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Actions</span>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Livreur</span>
              <span className={styles.infoValue}>{courier?.name ?? 'Non affecté'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Zone</span>
              <span className={styles.infoValue}>{zone?.label ?? '—'}</span>
            </div>
          </div>

          {delivery.status === 'echouee' ? (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Motif d'échec</span>
              <span className={styles.infoValue}>{delivery.failureReason}</span>
            </div>
          ) : null}

          {next.includes('echouee') ? (
            <FieldGroup label="Motif d'échec" required error={reasonError} hint="Obligatoire — un échec sans motif est refusé.">
              <Select
                options={FAILURE_REASONS.map((r) => ({ value: r, label: r }))}
                value={failureReason}
                onChange={setFailureReason}
                placeholder="Sélectionner un motif"
              />
            </FieldGroup>
          ) : null}

          <div className={styles.actions}>
            {next.map((target) => (
              <Button
                key={target}
                variant={target === 'echouee' || target === 'annulee' ? 'danger' : 'primary'}
                size="sm"
                onClick={() => requestTransition(target)}
              >
                {DELIVERY_STATUS_META[target].label}
              </Button>
            ))}
            <LabelPreview delivery={delivery} />
          </div>
          {next.length === 0 ? <p className={styles.hint}>Statut final — aucune action.</p> : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        onCancel={() => setConfirm(null)}
        title={confirm ? `Passer en « ${DELIVERY_STATUS_META[confirm].label} » ?` : ''}
        description={
          confirm === 'echouee'
            ? `L'expédition sera marquée échouée. Motif : « ${failureReason} ». Action de démonstration, aucune notification réelle.`
            : 'Changement de statut de démonstration, aucune notification réelle.'
        }
        confirmLabel="Confirmer"
        destructive={confirm === 'annulee' || confirm === 'echouee'}
        onConfirm={() => {
          const target = confirm;
          setConfirm(null);
          push({
            tone: target === 'echouee' || target === 'annulee' ? 'warning' : 'success',
            title: `Statut : ${target ? DELIVERY_STATUS_META[target].label : ''} (démo)`,
            description: 'Aucune notification réelle.'
          });
        }}
      />
    </div>
  );
}

/* ------------------------------ formulaire ------------------------------- */

export function DeliveryForm() {
  const { push } = useToast();
  const [orderRef, setOrderRef] = useState('CMD-2026-0001');
  const [zoneId, setZoneId] = useState('zone-cocody');
  const [courierId, setCourierId] = useState('');

  const orderOptions = ['CMD-2026-0001', 'CMD-2026-0002', 'CMD-2026-0003'].map((r) => ({ value: r, label: r }));
  const zoneOptions = ['zone-cocody', 'zone-marcory', 'zone-yopougon', 'zone-abobo', 'zone-plateau', 'zone-treichville'].map(
    (z) => ({ value: z, label: findZone(z)?.label ?? z })
  );
  const courierOptions = [{ value: '', label: 'Non affecté' }, ...COURIERS.map((c) => ({ value: c.id, label: c.name }))];

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.title}>Nouvelle expédition</h1>
      </div>
      <form
        className={styles.panel}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          push({
            tone: 'success',
            title: 'Expédition créée (démo)',
            description: `Commande ${orderRef} · aucune écriture réelle.`
          });
        }}
      >
        <div className={styles.infoGrid}>
          <FieldGroup label="Commande (LOT 06)" required>
            <Select options={orderOptions} value={orderRef} onChange={setOrderRef} />
          </FieldGroup>
          <FieldGroup label="Zone">
            <Select options={zoneOptions} value={zoneId} onChange={setZoneId} />
          </FieldGroup>
          <FieldGroup label="Livreur">
            <Select options={courierOptions} value={courierId} onChange={setCourierId} />
          </FieldGroup>
        </div>
        <div className={styles.actions}>
          <Button type="submit" variant="primary" size="sm" onClick={() => undefined}>
            Créer l'expédition
          </Button>
          <Link href="/app/livraisons">
            <Button type="button" variant="ghost" size="sm" onClick={() => undefined}>
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
