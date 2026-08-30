/**
 * DIVINI exo — CRM · clients (LOT 08)
 *
 * Liste (recherche nom / téléphone / email), fiche à onglets (profil, achats,
 * activité, communication, consentements, fidélité), historique consolidé,
 * création / modification.
 *
 * Honnêteté : données mockées signalées ; indicateurs (dont LTV) présentés comme
 * estimations ; solde de points en démonstration (attribution réelle au LOT 10).
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

import { DataTable, type DataColumnType, Timeline, ActivityFeed } from '../data';
import { Avatar, Badge, Button, EmptyState, Icon, Input } from '../ui';
import { FieldGroup } from '../ui/Field';
import { useToast } from '../ui/Toast';

import { ConsentPanel } from './consents';

import {
  CLIENTS,
  findClient,
  purchasesOf,
  clientRevenue,
  qualifiesVip,
  VIP_RULE,
  formatFcfa,
  consentsOf,
  CONSENT_STATUS_META,
  type Client
} from './mock';

import styles from './crm.module.css';

/* --------------------------------- liste --------------------------------- */

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const COLUMNS: DataColumnType<Client>[] = [
  {
    id: 'name',
    header: 'Client',
    width: '2 1 0',
    priority: 'high',
    sortable: true,
    sortValue: (c) => c.name,
    render: (c) => (
      <Link href={`/app/clients/${c.id}`} style={{ color: 'var(--text-primary)' }}>
        {c.name}
      </Link>
    ),
    value: (c) => c.name
  },
  {
    id: 'phone',
    header: 'Téléphone',
    width: '0 0 160px',
    mono: true,
    priority: 'normal',
    value: (c) => c.phone
  },
  {
    id: 'email',
    header: 'E-mail',
    width: '2 1 0',
    priority: 'low',
    value: (c) => c.email
  },
  {
    id: 'segment',
    header: 'Segment',
    width: '0 0 130px',
    priority: 'normal',
    render: (c) => (
      <Badge tone={c.segment === 'VIP' ? 'warning' : 'neutral'} withIcon={false}>
        {c.segment}
      </Badge>
    ),
    value: (c) => c.segment
  },
  {
    id: 'points',
    header: 'Points',
    width: '0 0 90px',
    mono: true,
    priority: 'low',
    sortable: true,
    sortValue: (c) => c.points,
    render: (c) => <span className={styles.mono}>{c.points}</span>
  }
];

export function ClientList() {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Clients</h1>
          <p className={styles.hint}>
            {CLIENTS.length} clients de démonstration · recherche par nom, téléphone ou email.
          </p>
        </div>
        <Link href="/app/clients/nouveau">
          <Button variant="primary" size="sm" onClick={() => undefined}>
            <Icon name="plus" size="var(--ctl-icon-sm)" /> Nouveau client
          </Button>
        </Link>
      </div>

      <DataTable
        rows={CLIENTS}
        columns={COLUMNS}
        rowId={(c) => c.id}
        accessors={{ searchText: (c) => `${c.name} ${c.phone} ${c.email} ${c.segment}` }}
        emptyTitle="Aucun client"
        emptyDescription="Aucun client ne correspond à cette recherche."
      />
    </div>
  );
}

/* ------------------------------ en-tête client --------------------------- */

function ClientProfileHeader({ client }: { client: Client }) {
  const revenue = clientRevenue(client.id);
  const vip = qualifiesVip(client.id);
  return (
    <div className={styles.profileHeader}>
      <div className={styles.profileIdentity}>
        <Avatar initials={initials(client.name)} name={client.name} size="lg" />
        <div>
          <div className={styles.profileName}>{client.name}</div>
          <div className={styles.profileMeta}>
            <Badge tone={vip ? 'warning' : 'neutral'} withIcon={false}>
              {client.segment}
            </Badge>
            <span>{client.phone}</span>
            <span>·</span>
            <span>{client.email}</span>
          </div>
        </div>
      </div>
      <div className={styles.profileStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>CA total</span>
          <span className={styles.statValue}>{formatFcfa(revenue)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Points</span>
          <span className={styles.statValue}>{client.points}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Achats</span>
          <span className={styles.statValue}>{purchasesOf(client.id).length}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ fiche client ----------------------------- */

type TabId = 'profil' | 'achats' | 'activite' | 'communication' | 'consentements' | 'fidelite';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'profil', label: 'Profil' },
  { id: 'achats', label: 'Achats' },
  { id: 'activite', label: 'Activité' },
  { id: 'communication', label: 'Communication' },
  { id: 'consentements', label: 'Consentements' },
  { id: 'fidelite', label: 'Fidélité' }
];

export function ClientDetail({ id }: { id: string }) {
  const client = findClient(id);
  const [tab, setTab] = useState<TabId>('profil');

  if (!client) {
    return (
      <EmptyState
        title="Client introuvable"
        description="Ce client n'existe pas dans les données de démonstration."
        icon="users"
        action={{ label: 'Retour aux clients', onClick: () => undefined }}
      />
    );
  }

  const purchases = purchasesOf(client.id);
  const consents = consentsOf(client.id);

  return (
    <div className={styles.wrap}>
      <ClientProfileHeader client={client} />

      <div className={styles.actions}>
        <Link href={`/app/clients/${client.id}/historique`}>
          <Button variant="subtil" size="sm" onClick={() => undefined}>
            Historique consolidé
          </Button>
        </Link>
        <Link href={`/app/clients/${client.id}/modifier`}>
          <Button variant="subtil" size="sm" onClick={() => undefined}>
            Modifier
          </Button>
        </Link>
      </div>

      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={styles.tab}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profil' ? (
        <div className={styles.panel}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Téléphone</span>
              <span className={`${styles.infoValue} ${styles.mono}`}>{client.phone}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>E-mail</span>
              <span className={styles.infoValue}>{client.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Segment</span>
              <span className={styles.infoValue}>{client.segment}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Client depuis</span>
              <span className={styles.infoValue}>
                {new Date(client.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'achats' ? (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Achats</span>
            <span className={styles.hint}>Dérivé des ventes LOT 06</span>
          </div>
          {purchases.length === 0 ? (
            <p className={styles.hint}>Aucun achat enregistré pour ce client.</p>
          ) : (
            <Timeline
              items={purchases.map((d) => ({
                date: d.date,
                actor: d.ref,
                title: `${d.kind === 'vente' ? 'Vente' : 'Facture'} ${d.ref}`,
                result: formatFcfa(d.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) - d.discount),
                tone: 'success'
              }))}
            />
          )}
        </div>
      ) : null}

      {tab === 'activite' ? (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Activité récente</span>
          </div>
          <ActivityFeed
            items={[
              { type: 'creation', text: 'Client créé', absolute: new Date(client.createdAt).toLocaleString('fr-FR') },
              ...purchases.slice(0, 3).map((d) => ({
                type: 'sale' as const,
                text: `${d.kind} ${d.ref}`,
                absolute: new Date(d.date).toLocaleString('fr-FR')
              }))
            ]}
          />
        </div>
      ) : null}

      {tab === 'communication' ? (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Communication</span>
            <span className={styles.hint}>Journal de démonstration</span>
          </div>
          <Timeline
            items={consents.slice(0, 4).map((c) => ({
              date: c.date,
              actor: c.source,
              title: `${c.category} — ${CONSENT_STATUS_META[c.status].label}`,
              result: c.method,
              tone: c.status === 'granted' ? 'success' : c.status === 'withdrawn' ? 'warning' : 'info'
            }))}
          />
        </div>
      ) : null}

      {tab === 'consentements' ? <ConsentPanel clientId={client.id} /> : null}

      {tab === 'fidelite' ? (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Fidélité</span>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Solde de points</span>
              <span className={`${styles.infoValue} ${styles.mono}`}>{client.points}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Règle VIP</span>
              <span className={styles.infoValue}>
                {VIP_RULE.minPurchases}+ achats ET ≥ {formatFcfa(VIP_RULE.minRevenue)}
              </span>
            </div>
          </div>
          <p className={styles.hint}>
            Solde de démonstration — l'attribution réelle des points arrive au LOT 10.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* --------------------------- historique consolidé ------------------------ */

export function ClientHistory({ id }: { id: string }) {
  const client = findClient(id);
  if (!client) {
    return <EmptyState title="Client introuvable" description="Données de démonstration." icon="users" />;
  }
  const purchases = purchasesOf(client.id);

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <div className={styles.hint}>{client.name}</div>
          <h1 className={styles.title}>Historique consolidé</h1>
        </div>
      </div>
      <div className={styles.panel}>
        <Timeline
          items={[
            { date: client.createdAt, actor: 'Système', title: 'Client créé', result: 'Catalogue de démonstration', tone: 'info' },
            ...purchases.map((d) => ({
              date: d.date,
              actor: d.ref,
              title: `${d.kind} ${d.ref}`,
              result: formatFcfa(d.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) - d.discount),
              tone: 'success' as const
            }))
          ]}
        />
      </div>
    </div>
  );
}

/* ------------------------------ formulaire ------------------------------- */

export function ClientForm({ mode }: { mode: 'create' | 'edit' }) {
  const { push } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const nameError = touched && name.trim().length === 0 ? 'Le nom est obligatoire.' : undefined;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.title}>{mode === 'create' ? 'Nouveau client' : 'Modifier le client'}</h1>
      </div>
      <form
        className={styles.panel}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (name.trim().length === 0) return;
          push({
            tone: 'success',
            title: mode === 'create' ? 'Client créé (démo)' : 'Client enregistré (démo)',
            description: 'Aucune écriture réelle — phase backend.'
          });
        }}
      >
        <div className={styles.infoGrid}>
          <FieldGroup label="Nom" required error={nameError}>
            <Input value={name} onChange={(e) => setName(e.target.value)} invalid={!!nameError} />
          </FieldGroup>
          <FieldGroup label="Téléphone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FieldGroup>
          <FieldGroup label="E-mail">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FieldGroup>
        </div>
        <div className={styles.actions}>
          <Button type="submit" variant="primary" size="sm" onClick={() => undefined}>
            {mode === 'create' ? 'Créer le client' : 'Enregistrer'}
          </Button>
          <Link href="/app/clients">
            <Button type="button" variant="ghost" size="sm" onClick={() => undefined}>
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
