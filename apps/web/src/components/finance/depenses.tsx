/**
 * DIVINI exo — Finance · dépenses & approbations (LOT 09)
 *
 * Workflow canonique (l. 1982-1984) : créée → en attente → approuvée → payée /
 * rejetée. Justificatif, montant, catégorie, demandeur. L'approbation est
 * **conditionnée au rôle simulé** : sans droit, état `permission denied`
 * explicite (interdit §11 : jamais approuver sans vérifier le rôle).
 *
 * Honnêteté : données mockées ; aucun paiement réel ; justificatifs simulés.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

import { DataTable, type DataColumnType } from '../data';
import { Badge, Button, EmptyState, Icon, Input, PermissionDenied, Select } from '../ui';
import { FieldGroup } from '../ui/Field';
import { ConfirmDialog } from '../ui/Overlay';
import { useToast } from '../ui/Toast';

import {
  EXPENSES,
  EXPENSE_STATUS_META,
  EXPENSE_TRANSITIONS,
  findExpense,
  canApprove,
  APPROVE_PERMISSION,
  APPROVE_CONTACT,
  formatFcfa,
  type Expense,
  type ExpenseStatus,
  type Role
} from './mock';

import styles from './finance.module.css';

/* ------------------------------- liste ----------------------------------- */

const COLUMNS: DataColumnType<Expense>[] = [
  {
    id: 'ref',
    header: 'Référence',
    width: '0 0 150px',
    mono: true,
    priority: 'high',
    render: (e) => (
      <Link href={`/app/depenses/${e.id}`} style={{ color: 'var(--text-primary)' }}>
        {e.ref}
      </Link>
    ),
    value: (e) => e.ref
  },
  {
    id: 'label',
    header: 'Libellé',
    width: '2 1 0',
    priority: 'high',
    value: (e) => e.label
  },
  {
    id: 'category',
    header: 'Catégorie',
    width: '1 1 0',
    priority: 'low',
    value: (e) => e.category
  },
  {
    id: 'amount',
    header: 'Montant',
    width: '0 0 120px',
    mono: true,
    sortable: true,
    sortValue: (e) => e.amount,
    render: (e) => <span className={styles.amount}>{formatFcfa(e.amount)}</span>
  },
  {
    id: 'status',
    header: 'Statut',
    width: '0 0 140px',
    priority: 'normal',
    render: (e) => (
      <Badge tone={EXPENSE_STATUS_META[e.status].tone} withIcon={false}>
        {EXPENSE_STATUS_META[e.status].label}
      </Badge>
    ),
    value: (e) => EXPENSE_STATUS_META[e.status].label
  }
];

export function ExpenseList() {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Dépenses & approbations</h1>
          <p className={styles.hint}>
            {EXPENSES.length} dépenses de démonstration · workflow créée → en attente →
            approuvée → payée / rejetée.
          </p>
        </div>
        <Link href="/app/depenses/nouveau">
          <Button variant="primary" size="sm" onClick={() => undefined}>
            <Icon name="plus" size="var(--ctl-icon-sm)" /> Nouvelle dépense
          </Button>
        </Link>
      </div>

      <DataTable
        rows={EXPENSES}
        columns={COLUMNS}
        rowId={(e) => e.id}
        accessors={{ searchText: (e) => `${e.ref} ${e.label} ${e.category}`, date: (e) => e.date }}
        statusOptions={Object.entries(EXPENSE_STATUS_META).map(([id, m]) => ({ id, label: m.label }))}
        emptyTitle="Aucune dépense"
        emptyDescription="Aucune dépense ne correspond à ce filtre."
      />
    </div>
  );
}

/* ------------------------------ approbation ------------------------------ */

const WORKFLOW: ExpenseStatus[] = ['creee', 'en_attente', 'approuvee', 'payee'];

function ApprovalStepper({ status }: { status: ExpenseStatus }) {
  const currentIndex = WORKFLOW.indexOf(status);
  const rejected = status === 'rejetee';

  return (
    <div className={styles.stepper}>
      {WORKFLOW.map((step, i) => {
        const done = !rejected && currentIndex >= i;
        return (
          <span key={step} className={styles.step} data-done={done}>
            {EXPENSE_STATUS_META[step].label}
          </span>
        );
      })}
      {rejected ? (
        <span className={styles.step} data-done style={{ borderColor: 'var(--state-critical)', color: 'var(--text-critical)' }}>
          Rejetée
        </span>
      ) : null}
    </div>
  );
}

function ApprovalActions({ expense, role }: { expense: Expense; role: Role }) {
  const { push } = useToast();
  const [confirm, setConfirm] = useState<ExpenseStatus | null>(null);
  const allowed = canApprove(role);
  const next = EXPENSE_TRANSITIONS[expense.status];

  if (next.length === 0) {
    return <p className={styles.hint}>Aucune action disponible — statut final.</p>;
  }

  return (
    <div className={styles.actions}>
      {next.map((target) => (
        <Button
          key={target}
          variant={target === 'rejetee' ? 'danger' : 'primary'}
          size="sm"
          disabled={!allowed && (target === 'approuvee' || target === 'rejetee')}
          onClick={() => {
            if (!allowed && (target === 'approuvee' || target === 'rejetee')) {
              push({ tone: 'warning', title: 'Droit d’approbation manquant', description: APPROVE_PERMISSION });
              return;
            }
            setConfirm(target);
          }}
        >
          {target === 'approuvee' ? 'Approuver' : target === 'rejetee' ? 'Rejeter' : target === 'payee' ? 'Marquer payée' : 'Soumettre'}
        </Button>
      ))}

      <ConfirmDialog
        open={confirm !== null}
        onCancel={() => setConfirm(null)}
        title={confirm === 'rejetee' ? 'Rejeter cette dépense ?' : `Passer la dépense en « ${confirm ? EXPENSE_STATUS_META[confirm].label : ''} » ?`}
        description="Action de démonstration : le statut change localement, aucun paiement réel n'est effectué."
        confirmLabel="Confirmer"
        destructive={confirm === 'rejetee'}
        onConfirm={() => {
          const target = confirm;
          setConfirm(null);
          push({
            tone: target === 'rejetee' ? 'critical' : 'success',
            title: `Dépense ${target ? EXPENSE_STATUS_META[target].label.toLowerCase() : ''} (démo)`,
            description: 'Aucun paiement réel.'
          });
        }}
      />
    </div>
  );
}

/* -------------------------------- détail --------------------------------- */

export function ExpenseDetail({ id }: { id: string }) {
  const expense = findExpense(id);
  const [role, setRole] = useState<Role>('gerant');

  if (!expense) {
    return (
      <EmptyState
        title="Dépense introuvable"
        description="Cette dépense n'existe pas dans les données de démonstration."
        icon="receipt"
      />
    );
  }

  const allowed = canApprove(role);

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <div className={styles.hint}>{expense.ref}</div>
          <h1 className={styles.title}>{expense.label}</h1>
          <div className={styles.hint}>
            {expense.category} · {new Date(expense.date).toLocaleDateString('fr-FR')} · demandeur{' '}
            {expense.requester}
          </div>
        </div>
        <Badge tone={EXPENSE_STATUS_META[expense.status].tone} withIcon={false}>
          {EXPENSE_STATUS_META[expense.status].label}
        </Badge>
      </div>

      {/* Rôle simulé — conditionne l'approbation. */}
      <div className={styles.panel}>
        <FieldGroup label="Rôle simulé (conditionne l'approbation)">
          <Select
            options={[
              { value: 'gerant', label: 'Gérant — peut approuver' },
              { value: 'comptable', label: 'Comptable — sans droit d’approbation' },
              { value: 'employe', label: 'Employé — sans droit d’approbation' }
            ]}
            value={role}
            onChange={(v) => setRole(v as Role)}
          />
        </FieldGroup>
        {!allowed ? (
          <PermissionDenied
            resource="approuver ou rejeter une dépense"
            missingPermission={APPROVE_PERMISSION}
            contact={APPROVE_CONTACT}
          />
        ) : null}
      </div>

      <div className={styles.split}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Détail</span>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Montant</span>
              <span className={`${styles.infoValue} ${styles.amount}`}>{formatFcfa(expense.amount)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Catégorie</span>
              <span className={styles.infoValue}>{expense.category}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Justificatif</span>
              {expense.receipt ? (
                <span className={styles.receiptBox}>
                  <Icon name="file" size="var(--ctl-icon-sm)" />
                  <span className={styles.mono}>{expense.receipt}</span>
                </span>
              ) : (
                <span className={styles.hint}>
                  <Icon name="alertTriangle" size="var(--ctl-icon-sm)" /> Justificatif manquant
                </span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Approbateur</span>
              <span className={styles.infoValue}>{expense.approver ?? '—'}</span>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Workflow</span>
          </div>
          <ApprovalStepper status={expense.status} />
          <ApprovalActions expense={expense} role={role} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ formulaire ------------------------------- */

export function ExpenseForm() {
  const { push } = useToast();
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Fonctionnement');
  const [touched, setTouched] = useState(false);

  const labelError = touched && label.trim().length === 0 ? 'Le libellé est obligatoire.' : undefined;
  const amountError = touched && (amount === '' || Number(amount) <= 0) ? 'Un montant positif est obligatoire.' : undefined;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.title}>Nouvelle dépense</h1>
      </div>
      <form
        className={styles.panel}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (label.trim().length === 0 || amount === '' || Number(amount) <= 0) return;
          push({
            tone: 'success',
            title: 'Dépense créée (démo)',
            description: 'Statut « créée » — soumettez-la pour approbation. Aucune écriture réelle.'
          });
        }}
      >
        <div className={styles.infoGrid}>
          <FieldGroup label="Libellé" required error={labelError}>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} invalid={!!labelError} />
          </FieldGroup>
          <FieldGroup label="Montant (FCFA)" required error={amountError}>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} invalid={!!amountError} />
          </FieldGroup>
          <FieldGroup label="Catégorie">
            <Select
              options={['Fonctionnement', 'Achats', 'Logistique', 'Charges fixes'].map((c) => ({ value: c, label: c }))}
              value={category}
              onChange={setCategory}
            />
          </FieldGroup>
        </div>
        <div className={styles.actions}>
          <Button type="submit" variant="primary" size="sm" onClick={() => undefined}>
            Créer la dépense
          </Button>
          <Link href="/app/depenses">
            <Button type="button" variant="ghost" size="sm" onClick={() => undefined}>
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
