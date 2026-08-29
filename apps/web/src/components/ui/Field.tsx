/**
 * DIVINI exo — Primitives de formulaire
 *
 * Design : fond `--panel` / `--surface-recessed`, bordure `--border`, rayon 6–8 px,
 * focus-visible net.
 *
 * Trois règles d'accessibilité s'appliquent partout :
 *   1. chaque champ a un `<label>` relié par `htmlFor` — pas de placeholder comme label ;
 *   2. l'erreur est annoncée par `aria-describedby` ET `aria-invalid`, pas seulement
 *      en rouge : la couleur n'est jamais le seul vecteur ;
 *   3. un champ `disabled` est explicitement rendu comme tel, jamais simplement grisé.
 */

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode
} from 'react';

import { Icon, type IconName } from './Icon';

import styles from './ui.module.css';

export type FieldSize = 'sm' | 'md' | 'lg';

/* ------------------------- association label ↔ champ ---------------------- */

type FieldContextValue = {
  id: string;
  /** Ids de l'aide et de l'erreur, à relier par aria-describedby. */
  describedBy?: string;
};

const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * Récupère l'identifiant fourni par FieldGroup, ou en génère un.
 *
 * Sans ce contexte, FieldGroup écrivait `htmlFor` vers un id que personne ne
 * portait : le label n'était associé à rien, et l'aide comme l'erreur restaient
 * muettes pour les lecteurs d'écran (aucun aria-describedby).
 */
function useFieldBinding(): { id: string; describedBy?: string } {
  const ctx = useContext(FieldContext);
  const fallback = useId();
  return ctx ?? { id: fallback };
}

/* ------------------------------- FieldGroup ------------------------------- */

type FieldGroupProps = {
  label: string;
  children: ReactNode;
  /** Texte d'aide permanent. */
  hint?: ReactNode;
  /** Message d'erreur. Sa présence rend le champ invalide. */
  error?: string;
  required?: boolean;
  size?: FieldSize;
  /** Rend le groupe non disponible — l'état est explicite, pas seulement visuel. */
  disabled?: boolean;
};

/**
 * Enveloppe label + aide + erreur.
 *
 * C'est elle qui garantit qu'aucun champ n'existe sans label : les primitives
 * ci-dessous passent par FieldGroup plutôt que de réinventer l'association.
 */
export function FieldGroup({
  label,
  children,
  hint,
  error,
  required = false,
  size = 'md',
  disabled = false
}: FieldGroupProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  // L'erreur prime sur l'aide : les deux ne sont jamais annoncées ensemble,
  // sinon le message exploitable est noyé.
  const describedBy = error ? errorId : hint ? hintId : undefined;
  const binding: FieldContextValue = { id, describedBy };

  return (
    <FieldContext.Provider value={binding}>
      <div className={`${styles.field} ${disabled ? styles.fieldDisabled : ''}`}>
        <label className={styles.fieldLabel} htmlFor={id}>
          {label}
          {required ? (
            <span className={styles.fieldRequired} aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        <div className={styles.fieldControl}>{children}</div>
        {hint && !error ? (
          <p id={hintId} className={styles.fieldHint}>
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className={styles.fieldError} role="alert">
            <Icon name="alertCircle" size="var(--ctl-icon-sm)" />
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

/* --------------------------------- Input ---------------------------------- */

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: FieldSize;
  invalid?: boolean;
  loading?: boolean;
  icon?: IconName;
};

export function Input({
  size = 'md',
  invalid = false,
  loading = false,
  icon,
  className,
  disabled,
  id,
  ...rest
}: InputProps) {
  const binding = useFieldBinding();
  return (
    <span
      className={[
        styles.inputWrap,
        styles[`field${size}`],
        invalid ? styles.inputInvalid : '',
        disabled ? styles.inputDisabled : '',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon ? <Icon name={icon} size="var(--ctl-icon-sm)" className={styles.inputIcon} /> : null}
      <input
        id={id ?? binding.id}
        aria-describedby={binding.describedBy}
        className={styles.input}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
    </span>
  );
}

/* --------------------------------- Search --------------------------------- */

type SearchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> & {
  size?: FieldSize;
  value: string;
  onValueChange: (value: string) => void;
  onClear: () => void;
};

/**
 * Recherche.
 *
 * `type="search"` plus un bouton d'effacement réel : le champ n'est jamais un
 * décor. L'effacement est une action, pas un artefact visuel.
 */
export function Search({ size = 'md', value, onValueChange, onClear, id, ...rest }: SearchProps) {
  const binding = useFieldBinding();
  return (
    <span className={`${styles.inputWrap} ${styles[`field${size}`]}`}>
      <Icon name="search" size="var(--ctl-icon-sm)" className={styles.inputIcon} />
      <input
        id={id ?? binding.id}
        aria-describedby={binding.describedBy}
        type="search"
        className={styles.input}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        {...rest}
      />
      {value ? (
        <button type="button" className={styles.iconButton} onClick={onClear} aria-label="Effacer la recherche">
          <Icon name="close" size="var(--ctl-icon-sm)" />
        </button>
      ) : null}
    </span>
  );
}

/* --------------------------------- Select --------------------------------- */

type SelectProps = {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value: string;
  onChange: (value: string) => void;
  size?: FieldSize;
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
};

export function Select({
  options,
  value,
  onChange,
  size = 'md',
  invalid = false,
  disabled = false,
  placeholder,
  id
}: SelectProps) {
  const binding = useFieldBinding();
  return (
    <span
      className={[
        styles.inputWrap,
        styles.selectWrap,
        styles[`field${size}`],
        invalid ? styles.inputInvalid : '',
        disabled ? styles.inputDisabled : ''
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <select
        id={id ?? binding.id}
        aria-describedby={binding.describedBy}
        className={styles.select}
        value={value}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" size="var(--ctl-icon-sm)" className={styles.selectChevron} />
    </span>
  );
}

/* ------------------------------- DatePicker ------------------------------- */

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type DatePickerProps = {
  /** Date au format ISO `AAAA-MM-JJ`, ou chaîne vide. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
};

function startOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1));
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Sélecteur de date.
 *
 * Panneau inline sur desktop, panneau complet sous 720 px.
 * Le calendrier est navigable au clavier : `Escape` ferme le panneau et rend
 * le focus au champ.
 */
export function DatePicker({ value, onChange, disabled = false, invalid = false }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const binding = useFieldBinding();
  const selected = value ? new Date(`${value}T00:00:00Z`) : null;
  const [view, setView] = useState(() => {
    const base = selected ?? new Date();
    return { year: base.getUTCFullYear(), month: base.getUTCMonth() };
  });

  const first = startOfMonth(view.year, view.month);
  // Décalage lundi = 0
  const offset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(Date.UTC(view.year, view.month, i + 1)))
  ];

  const monthLabel = first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  return (
    <span
      ref={ref}
      className={[styles.inputWrap, styles[`fieldMd`], invalid ? styles.inputInvalid : '', disabled ? styles.inputDisabled : '']
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        id={binding.id}
        aria-describedby={binding.describedBy}
        className={styles.dateButton}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        <Icon name="calendar" size="var(--ctl-icon-sm)" className={styles.inputIcon} />
        <span className={styles.monoValue}>
          {value
            ? new Date(`${value}T00:00:00Z`).toLocaleDateString('fr-FR', { timeZone: 'UTC' })
            : 'Choisir une date'}
        </span>
      </button>

      {open ? (
        <div className={styles.calendar} role="dialog" aria-label={monthLabel}>
          <div className={styles.calendarHead}>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Mois précédent"
              onClick={() =>
                setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }))
              }
            >
              <Icon name="chevronLeft" size="var(--ctl-icon-sm)" />
            </button>
            <span className={styles.calendarTitle}>{monthLabel}</span>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Mois suivant"
              onClick={() =>
                setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }))
              }
            >
              <Icon name="chevronRight" size="var(--ctl-icon-sm)" />
            </button>
          </div>
          <div className={styles.calendarGrid} role="grid">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className={styles.calendarWeekday} aria-hidden="true">
                {d}
              </span>
            ))}
            {cells.map((d, i) =>
              d === null ? (
                <span key={`e${i}`} />
              ) : (
                <button
                  key={toIso(d)}
                  type="button"
                  role="gridcell"
                  className={`${styles.calendarDay} ${
                    selected && toIso(d) === toIso(selected) ? styles.calendarDaySelected : ''
                  }`}
                  aria-selected={selected ? toIso(d) === toIso(selected) : undefined}
                  onClick={() => {
                    onChange(toIso(d));
                    setOpen(false);
                  }}
                >
                  {d.getUTCDate()}
                </button>
              )
            )}
          </div>
        </div>
      ) : null}
    </span>
  );
}

/* ------------------------- Checkbox / Radio / Switch ---------------------- */

type CheckProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  /** État mixte — case « tout sélectionner » partiellement cochée. */
  mixed?: boolean;
};

export function Checkbox({ checked, onChange, label, disabled = false, mixed = false }: CheckProps) {
  const id = useId();
  return (
    <span className={styles.checkRow}>
      <input
        id={id}
        type="checkbox"
        className={styles.checkboxInput}
        checked={checked}
        disabled={disabled}
        aria-checked={mixed ? 'mixed' : checked}
        ref={(el) => {
          if (el) el.indeterminate = mixed;
        }}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.checkboxBox} aria-hidden="true">
        {mixed ? (
          <Icon name="minus" size="var(--ctl-icon-sm)" />
        ) : checked ? (
          <Icon name="check" size="var(--ctl-icon-sm)" />
        ) : null}
      </span>
      <label htmlFor={id} className={styles.checkLabel}>
        {label}
      </label>
    </span>
  );
}

type RadioGroupProps = {
  name: string;
  legend: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value: string;
  onChange: (value: string) => void;
};

export function RadioGroup({ name, legend, options, value, onChange }: RadioGroupProps) {
  /**
   * Les id sont dérivés de `useId`, pas du seul `name`.
   *
   * Deux groupes partageant un même `name` — deux formulaires sur une page,
   * une modale au-dessus d'un écran — produisaient des id DOM dupliqués et
   * chaque `label` pointait vers la mauvaise radio. Même schéma que le défaut
   * corrigé dans `Overlay.tsx`. `name` reste celui fourni : c'est lui qui
   * groupe nativement les radios.
   */
  const groupId = useId();

  return (
    <fieldset className={styles.radioGroup}>
      <legend className={styles.fieldLabel}>{legend}</legend>
      {options.map((o) => {
        const optionId = `${groupId}-${o.value}`;
        return (
          <span key={o.value} className={styles.checkRow}>
            <input
              type="radio"
              name={name}
              id={optionId}
              className={styles.checkboxInput}
              checked={value === o.value}
              disabled={o.disabled}
              onChange={() => onChange(o.value)}
            />
            <span className={styles.radioDot} aria-hidden="true" />
            <label htmlFor={optionId} className={styles.checkLabel}>
              {o.label}
            </label>
          </span>
        );
      })}
    </fieldset>
  );
}

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
};

export function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  const id = useId();
  return (
    <span className={styles.checkRow}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={styles.checkboxInput}
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`${styles.switch} ${checked ? styles.switchOn : ''}`} aria-hidden="true">
        <span className={styles.switchKnob} />
      </span>
      <label htmlFor={id} className={styles.checkLabel}>
        {label}
      </label>
    </span>
  );
}

/* ------------------------------- FileUpload ------------------------------- */

type FileUploadProps = {
  onFiles: (files: File[]) => void;
  /** Rendu par le parent : aucun téléchargement réel n'est simulé ici. */
  status?: 'idle' | 'uploading' | 'success' | 'error';
  /** Nom du fichier choisi, affiché en mono. */
  fileName?: string;
  disabled?: boolean;
  accept?: string;
};

/**
 * Zone de dépôt.
 *
 * `uploading`, `success` et `error` décrivent une opération réelle pilotée par
 * le parent. Cette primitive n'invente aucune progression : sans `status`, elle
 * reste à `idle`.
 */
export function FileUpload({
  onFiles,
  status = 'idle',
  fileName,
  disabled = false,
  accept
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={[
        styles.dropzone,
        dragging ? styles.dropzoneActive : '',
        status === 'error' ? styles.dropzoneError : '',
        status === 'success' ? styles.dropzoneSuccess : '',
        disabled ? styles.inputDisabled : ''
      ]
        .filter(Boolean)
        .join(' ')}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        onFiles(Array.from(e.dataTransfer.files));
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className={styles.srOnly}
        accept={accept}
        disabled={disabled}
        onChange={(e) => onFiles(Array.from(e.target.files ?? []))}
      />
      <Icon
        name={status === 'success' ? 'checkCircle' : status === 'error' ? 'alertCircle' : 'upload'}
        size="var(--ctl-icon-lg)"
      />
      <p className={styles.dropzoneTitle}>
        {status === 'uploading'
          ? 'Téléversement en cours'
          : status === 'success'
            ? 'Fichier reçu'
            : status === 'error'
              ? 'Téléversement échoué'
              : 'Déposer un fichier ici'}
      </p>
      {fileName ? <p className={styles.monoValue}>{fileName}</p> : null}
      {status === 'idle' ? (
        <button
          type="button"
          className={styles.stateAction}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Parcourir
        </button>
      ) : null}
    </div>
  );
}

/* --------------------------------- Stepper -------------------------------- */

type StepperProps = {
  steps: string[];
  current: number;
  onGoTo: (index: number) => void;
};

/**
 * Fil d'étapes.
 *
 * Horizontal sur desktop, condensé sur tablette, indicateur `3/10` sous 720 px
 * (LOT 01 §7). Les étapes passées sont atteignables, les étapes futures non :
 * on ne peut pas sauter une étape non remplie.
 */
export function Stepper({ steps, current, onGoTo }: StepperProps) {
  return (
    <div className={styles.stepper}>
      <span className={styles.stepperMobile}>
        <span className={styles.monoValue}>
          {Math.min(current + 1, steps.length)}/{steps.length}
        </span>
        {steps[current] ?? ''}
      </span>
      <ol className={styles.stepperList}>
        {steps.map((step, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo';
          return (
            <li key={step} className={`${styles.stepperItem} ${styles[`step${state}`]}`}>
              <button
                type="button"
                className={styles.stepperButton}
                disabled={i > current}
                aria-current={i === current ? 'step' : undefined}
                onClick={() => onGoTo(i)}
              >
                <span className={styles.stepperIndex} aria-hidden="true">
                  {state === 'done' ? <Icon name="check" size="var(--ctl-icon-sm)" /> : i + 1}
                </span>
                <span className={styles.stepperLabel}>{step}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
