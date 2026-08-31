/**
 * DIVINI exo — CRM · consentements (LOT 08)
 *
 * Point le plus sensible du produit. Le consentement est une donnée métier
 * centrale, historisée, vérifiable, **non modifiable silencieusement**.
 *
 * - statut par catégorie avec source, méthode, date, preuve consultable ;
 * - `unknown` affiché distinctement, **jamais** traité comme accordé ;
 * - toute modification ouvre une confirmation qui explique qu'elle **crée un
 *   nouvel événement** dans l'historique sans effacer le précédent ;
 * - consentement ≠ autorisation d'envoi (`canSendNow` affiché séparément) ;
 * - opt-out par catégorie, opt-out global, do not contact, blocage global.
 */

'use client';

import { useState } from 'react';

import { Badge, Button, Icon, SeverityIndicator } from '../ui';
import { ConfirmDialog, Modal } from '../ui/Overlay';
import { Timeline } from '../data';
import { useToast } from '../ui/Toast';

import {
  CONSENT_CATEGORY_LABELS,
  CONSENT_STATUS_META,
  consentsOf,
  historyOf,
  isGranted,
  canSendNow,
  findClient,
  buildConsentEvent,
  type Consent,
  type ConsentCategory,
  type ConsentStatus
} from './mock';

import styles from './crm.module.css';

const CATEGORIES = Object.keys(CONSENT_CATEGORY_LABELS) as ConsentCategory[];

/** Bannière do not contact — CRITIQUE avec icône et texte, jamais une pastille. */
export function DoNotContactBanner({ clientId }: { clientId: string }) {
  const client = findClient(clientId);
  if (!client?.doNotContact && !client?.globalBlock) return null;

  const global = client?.globalBlock;
  return (
    <div className={styles.dncBanner} role="alert">
      <Icon name="alertCircle" size="var(--ctl-icon-md)" />
      <div className={styles.dncText}>
        <span className={styles.dncTitle}>
          {global ? 'Blocage global des communications' : 'Ne pas contacter (do not contact)'}
        </span>
        <span className={styles.dncSub}>
          {global
            ? 'Aucun canal n’est autorisé pour ce client, quel que soit le consentement par catégorie.'
            : 'Ce client a demandé à ne plus être contacté. Aucun envoi n’est autorisé, même si un consentement existe par ailleurs.'}
        </span>
      </div>
    </div>
  );
}

/** Visionneuse de preuve — derrière une action explicite. */
function ConsentProofViewer({ consent }: { consent: Consent }) {
  const [open, setOpen] = useState(false);

  if (!consent.proof) {
    return (
      <span className={styles.consentNote}>
        <Icon name="alertTriangle" size="var(--ctl-icon-sm)" /> Preuve manquante
      </span>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Icon name="eye" size="var(--ctl-icon-sm)" /> Preuve
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Preuve de consentement" size="sm">
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Référence de preuve</span>
            <span className={`${styles.infoValue} ${styles.proofRef}`}>{consent.proof}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Catégorie</span>
            <span className={styles.infoValue}>{CONSENT_CATEGORY_LABELS[consent.category]}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Source</span>
            <span className={styles.infoValue}>{consent.source}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Méthode</span>
            <span className={styles.infoValue}>{consent.method}</span>
          </div>
        </div>
        <p className={styles.consentNote}>
          Preuve de démonstration — aucun document réel n'est stocké ni consultable.
        </p>
      </Modal>
    </>
  );
}

/** Ligne de consentement par catégorie. */
function ConsentCategoryRow({
  clientId,
  category,
  onChange
}: {
  clientId: string;
  category: ConsentCategory;
  onChange: () => void;
}) {
  const consent = consentsOf(clientId).find((c) => c.category === category);
  const status: ConsentStatus = consent?.status ?? 'unknown';
  const meta = CONSENT_STATUS_META[status];
  const granted = isGranted(consent);
  const sendAuthorized = canSendNow(clientId, category);

  return (
    <>
      {/* Desktop / tablette : ligne de tableau. */}
      <tr className={styles.consentTableRow}>
        <td>{CONSENT_CATEGORY_LABELS[category]}</td>
        <td>
          <Badge tone={meta.tone} withIcon={false}>
            {meta.label}
          </Badge>
        </td>
        <td>
          {consent ? (
            <>
              {consent.source} · {consent.method}
              <div className={styles.consentNote}>
                {new Date(consent.date).toLocaleDateString('fr-FR')}
              </div>
            </>
          ) : (
            <span className={styles.consentNote}>Aucune collecte enregistrée</span>
          )}
        </td>
        <td>{consent ? <ConsentProofViewer consent={consent} /> : <span className={styles.consentNote}>—</span>}</td>
        <td>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
            <span className={styles.consentNote}>
              Envoi autorisé : <strong>{sendAuthorized ? 'oui' : 'non'}</strong>
            </span>
            <Button variant="ghost" size="sm" onClick={onChange}>
              Modifier
            </Button>
          </div>
        </td>
      </tr>

      {/* Mobile : carte par catégorie. */}
      <div className={styles.consentCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-2)' }}>
          <strong>{CONSENT_CATEGORY_LABELS[category]}</strong>
          <Badge tone={meta.tone} withIcon={false}>
            {meta.label}
          </Badge>
        </div>
        <span className={styles.consentNote}>
          {consent
            ? `${consent.source} · ${consent.method} · ${new Date(consent.date).toLocaleDateString('fr-FR')}`
            : 'Aucune collecte enregistrée'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-2)' }}>
          {consent ? <ConsentProofViewer consent={consent} /> : <span className={styles.consentNote}>Pas de preuve</span>}
          <span className={styles.consentNote}>
            Envoi : <strong>{sendAuthorized ? 'oui' : 'non'}</strong>
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onChange}>
          Modifier le consentement
        </Button>
      </div>
    </>
  );
}

/** Dialogue d'opt-out — explique la trace créée. */
function OptOutDialog({
  open,
  clientId,
  category,
  onClose
}: {
  open: boolean;
  clientId: string;
  category: ConsentCategory | null;
  onClose: () => void;
}) {
  const { push } = useToast();
  const [reason, setReason] = useState('');

  if (!category) return null;
  const current = consentsOf(clientId).find((c) => c.category === category);
  const from = current?.status ?? 'unknown';

  return (
    <ConfirmDialog
      open={open}
      onCancel={onClose}
      title={`Retirer le consentement ${CONSENT_CATEGORY_LABELS[category]} ?`}
      description="Cet acte est tracé : il crée un nouvel événement daté dans l'historique, sans effacer les précédents. Le consentement ne sera pas modifié silencieusement. Aucun envoi réel n'a lieu."
      confirmLabel="Retirer et tracer"
      destructive
      onConfirm={() => {
        const event = buildConsentEvent(clientId, category, from, 'withdrawn', 'Opérateur', reason || 'Opt-out catégorie', 1);
        onClose();
        setReason('');
        push({
          tone: 'success',
          title: 'Consentement retiré (tracé)',
          description: `Événement ${event.id} ajouté à l'historique. Rien n'a été effacé.`
        });
      }}
    />
  );
}

/** Historique immuable en timeline verticale. */
function ConsentHistoryTimeline({ clientId }: { clientId: string }) {
  const events = historyOf(clientId);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Historique des consentements</span>
        <span className={styles.hint}>Immuable — aucun événement n'est effacé</span>
      </div>
      {events.length === 0 ? (
        <p className={styles.consentNote}>Aucun événement de consentement enregistré.</p>
      ) : (
        <Timeline
          items={events.map((e) => ({
            date: e.date,
            actor: e.actor,
            title: `${CONSENT_CATEGORY_LABELS[e.category]} : ${e.from ? CONSENT_STATUS_META[e.from].label : 'aucun'} → ${CONSENT_STATUS_META[e.to].label}`,
            result: e.reason,
            tone: e.to === 'granted' ? 'success' : e.to === 'withdrawn' ? 'warning' : e.to === 'refused' ? 'critical' : 'info'
          }))}
        />
      )}
    </div>
  );
}

/** Panneau complet des consentements d'un client. */
export function ConsentPanel({ clientId }: { clientId: string }) {
  const [optOutCategory, setOptOutCategory] = useState<ConsentCategory | null>(null);
  const { push } = useToast();
  const client = findClient(clientId);

  return (
    <div className={styles.wrap}>
      <DoNotContactBanner clientId={clientId} />

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>Consentements par catégorie</span>
          <span className={styles.hint}>Statut, source, méthode, date, preuve</span>
        </div>

        <p className={styles.separator}>
          <Icon name="info" size="var(--ctl-icon-sm)" />
          Consentement ≠ autorisation d'envoi : un consentement accordé n'autorise l'envoi que si
          le client n'est pas en « ne pas contacter » ni en blocage global.
        </p>

        {/* Desktop / tablette : tableau. */}
        <div className={styles.consentTableWrap}>
          <table className={styles.consentTable}>
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Source / méthode</th>
                <th>Preuve</th>
                <th>Envoi / action</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat) => (
                <ConsentCategoryRow
                  key={cat}
                  clientId={clientId}
                  category={cat}
                  onChange={() => setOptOutCategory(cat)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile : cartes. */}
        <div className={styles.consentCards}>
          {CATEGORIES.map((cat) => (
            <ConsentCategoryRow
              key={cat}
              clientId={clientId}
              category={cat}
              onChange={() => setOptOutCategory(cat)}
            />
          ))}
        </div>
      </div>

      <div className={styles.split}>
        <ConsentHistoryTimeline clientId={clientId} />
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Blocages</span>
          </div>
          <div className={styles.actions}>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                push({
                  tone: 'warning',
                  title: 'Ne pas contacter activé (démo)',
                  description: 'Trace créée dans l\u2019historique. Aucun envoi réel.'
                })
              }
            >
              <Icon name="lock" size="var(--ctl-icon-sm)" /> Ne pas contacter
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                push({
                  tone: 'critical',
                  title: 'Blocage global activé (démo)',
                  description: 'Tous les canaux bloqués. Trace créée.'
                })
              }
            >
              <Icon name="shield" size="var(--ctl-icon-sm)" /> Blocage global
            </Button>
          </div>
          <p className={styles.consentNote}>
            État actuel : {client?.doNotContact ? 'ne pas contacter actif' : 'aucun do-not-contact'}
            {' · '}
            {client?.globalBlock ? 'blocage global actif' : 'aucun blocage global'}.
          </p>
        </div>
      </div>

      <OptOutDialog
        open={optOutCategory !== null}
        clientId={clientId}
        category={optOutCategory}
        onClose={() => setOptOutCategory(null)}
      />
    </div>
  );
}
