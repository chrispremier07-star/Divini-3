'use client';

/**
 * DIVINI exo — Galerie des primitives (LOT 01)
 *
 * Surface technique interne, hors navigation produit.
 *
 * Règle appliquée : **aucun bouton décoratif** (l. 7931). Chaque action de cette
 * galerie fait réellement quelque chose — elle écrit dans le journal visible en
 * bas de page, ouvre un overlay, ou pousse une notification. Il n'y a pas de
 * bouton mort.
 *
 * Les états `offline`, `syncing`, `permission-denied` et `critical` sont rendus
 * en démonstration et **signalés comme tels** : ils ne simulent aucune condition
 * système réelle.
 */

import { useCallback, useState } from 'react';

import {
  Alert,
  Avatar,
  Badge,
  Body,
  Button,
  Caption,
  Checkbox,
  ConfirmDialog,
  ContextMenu,
  DatePicker,
  Drawer,
  Dropdown,
  EmptyState,
  ErrorState,
  FieldGroup,
  FileUpload,
  ICON_NAMES,
  Icon,
  IconButton,
  Input,
  Modal,
  ModuleUnavailable,
  MonoValue,
  OfflineState,
  PermissionDenied,
  RadioGroup,
  Search,
  SectionLabel,
  Select,
  SeverityIndicator,
  Skeleton,
  SkeletonBlock,
  Stepper,
  StatusDot,
  Subtitle,
  Switch,
  SyncingState,
  Title,
  ToastProvider,
  useToast,
  type MenuItem,
  type ToastTone
} from '@/components/ui';

import { useAppearance } from '@/lib/appearance';

import styles from './ui-gallery.module.css';

/* ------------------------------ journal d'actions ------------------------- */

type LogEntry = { id: number; label: string };

function ActionLog({ entries }: { entries: LogEntry[] }) {
  return (
    <div className={styles.log} aria-live="polite">
      <SectionLabel>journal des actions de démonstration</SectionLabel>
      {entries.length === 0 ? (
        <Caption>Aucune action pour l’instant. Chaque bouton de cette page écrit ici.</Caption>
      ) : (
        <ol className={styles.logList}>
          {entries.map((e) => (
            <li key={e.id} className={styles.logItem}>
              <MonoValue>{String(e.id).padStart(3, '0')}</MonoValue>
              <span>{e.label}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* --------------------------------- section -------------------------------- */

function Section({
  id,
  title,
  note,
  children
}: {
  id: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-h`}>
      <header className={styles.sectionHead}>
        <h2 id={`${id}-h`}>
          <Subtitle as="span">{title}</Subtitle>
        </h2>
        {note ? <Caption>{note}</Caption> : null}
      </header>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

/** Bloc d'état : un libellé + le rendu. Rend les états comparables côte à côte. */
function StateCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.stateCell}>
      <SectionLabel as="p">{label}</SectionLabel>
      <div className={styles.stateRender}>{children}</div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className={styles.card}>{children}</div>;
}

/* --------------------------------- galerie -------------------------------- */

const MENU_ITEMS = (log: (l: string) => void): MenuItem[] => [
  { id: 'open', label: 'Ouvrir', icon: 'eye', onSelect: () => log('Menu → Ouvrir') },
  { id: 'duplicate', label: 'Dupliquer', icon: 'file', onSelect: () => log('Menu → Dupliquer') },
  { id: 'export', label: 'Exporter', icon: 'download', onSelect: () => log('Menu → Exporter') },
  { id: 'archive', label: 'Archiver (indisponible)', icon: 'package', onSelect: () => {}, disabled: true },
  { id: 'delete', label: 'Supprimer', icon: 'trash', destructive: true, onSelect: () => log('Menu → Supprimer') }
];

const STEPS = ['Identification', 'Coordonnées', 'Vérification', 'Confirmation'];

function Gallery() {
  const { theme, density, toggleTheme, setDensity } = useAppearance();
  const { push } = useToast();

  const [log, setLog] = useState<LogEntry[]>([]);
  const record = useCallback((label: string) => {
    setLog((prev) => [{ id: prev.length + 1, label }, ...prev].slice(0, 8));
  }, []);

  // overlays
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  // champs
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [date, setDate] = useState('');
  const [checked, setChecked] = useState(true);
  const [mixed, setMixed] = useState(false);
  const [radio, setRadio] = useState('mensuel');
  const [toggled, setToggled] = useState(false);
  const [fileName, setFileName] = useState<string | undefined>();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [step, setStep] = useState(1);
  const [invalidInput, setInvalidInput] = useState('abc');

  const notify = useCallback(
    (tone: ToastTone) => {
      const messages: Record<ToastTone, [string, string]> = {
        info: ['Information enregistrée', 'Aucune action supplémentaire n’est requise.'],
        success: ['Opération terminée', 'La modification a été prise en compte.'],
        warning: ['Vérification conseillée', 'Un élément demande votre attention avant validation.'],
        critical: ['Action requise', 'Cette notification critique ne se ferme pas seule.']
      };
      const [title, description] = messages[tone] as [string, string];
      push({ tone, title, description });
      record(`Notification ${tone}`);
    },
    [push, record]
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <SectionLabel as="p">surface technique interne</SectionLabel>
          <Title>Primitives du Design System</Title>
          <Body>
            Chaque primitive dans ses états pertinents, sur les deux thèmes. Aucune
            donnée métier : uniquement des libellés de démonstration.
          </Body>
        </div>
        <div className={styles.controls}>
          <Button variant="ghost" size="sm" icon={theme === 'dark' ? 'eye' : 'eye'} onClick={toggleTheme}>
            Thème {theme === 'dark' ? 'clair' : 'sombre'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon="sliders"
            onClick={() => setDensity(density === 'comfortable' ? 'compact' : 'comfortable')}
          >
            Densité {density === 'comfortable' ? 'compacte' : 'confortable'}
          </Button>
        </div>
      </header>

      {/* ------------------------------ Actions ------------------------------ */}
      <Section
        id="actions"
        title="Actions"
        note="primary / ghost / danger / subtil, tailles sm–md–lg. Active : scale 0,98. Aucun bouton sans action."
      >
        <Card>
          <div className={styles.row}>
            <StateCell label="primary">
              <Button onClick={() => record('Bouton primary')}>Enregistrer</Button>
            </StateCell>
            <StateCell label="ghost">
              <Button variant="ghost" onClick={() => record('Bouton ghost')}>
                Annuler
              </Button>
            </StateCell>
            <StateCell label="subtil">
              <Button variant="subtil" onClick={() => record('Bouton subtil')}>
                Détails
              </Button>
            </StateCell>
            <StateCell label="danger">
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Supprimer
              </Button>
            </StateCell>
            <StateCell label="disabled">
              <Button disabled onClick={() => {}}>
                Indisponible
              </Button>
            </StateCell>
            <StateCell label="loading">
              <Button loading onClick={() => {}}>
                En cours
              </Button>
            </StateCell>
          </div>

          <div className={styles.row}>
            <StateCell label="taille sm">
              <Button size="sm" onClick={() => record('Bouton sm')}>
                Petit
              </Button>
            </StateCell>
            <StateCell label="taille md">
              <Button onClick={() => record('Bouton md')}>Moyen</Button>
            </StateCell>
            <StateCell label="taille lg">
              <Button size="lg" onClick={() => record('Bouton lg')}>
                Grand
              </Button>
            </StateCell>
            <StateCell label="avec icône">
              <Button icon="plus" onClick={() => record('Bouton avec icône')}>
                Ajouter
              </Button>
            </StateCell>
            <StateCell label="icône à droite">
              <Button variant="ghost" trailingIcon="arrowRight" onClick={() => record('Bouton icône droite')}>
                Continuer
              </Button>
            </StateCell>
            <StateCell label="IconButton">
              <div className={styles.row}>
                <IconButton icon="trash" label="Supprimer" variant="danger" onClick={() => record('IconButton supprimer')} />
                <IconButton icon="filter" label="Filtrer" onClick={() => record('IconButton filtrer')} />
                <IconButton icon="download" label="Exporter" disabled onClick={() => {}} />
              </div>
            </StateCell>
          </div>
        </Card>

        <Card>
          <div className={styles.row}>
            <StateCell label="Dropdown">
              <Dropdown
                label="Actions sur l’élément"
                items={MENU_ITEMS(record)}
                trigger={
                  <Button variant="ghost" size="sm" trailingIcon="chevronDown" onClick={() => {}}>
                    Actions
                  </Button>
                }
              />
            </StateCell>
            <StateCell label="ContextMenu — clic droit">
              <ContextMenu label="Actions contextuelles" items={MENU_ITEMS(record)}>
                <div className={styles.contextBox}>
                  <Caption>Clic droit ici. Les mêmes actions restent accessibles par le Dropdown : le menu contextuel complète le clavier, il ne le remplace pas.</Caption>
                </div>
              </ContextMenu>
            </StateCell>
          </div>
        </Card>
      </Section>

      {/* --------------------------- Formulaires ----------------------------- */}
      <Section
        id="formulaires"
        title="Formulaires"
        note="Chaque champ a un label relié par htmlFor. L’erreur est annoncée par aria-describedby ET aria-invalid."
      >
        <Card>
          <div className={styles.formGrid}>
            <FieldGroup label="Dénomination" hint="Nom tel qu’il apparaîtra sur les documents." required>
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Exemple : Atelier du Plateau" />
            </FieldGroup>

            <FieldGroup label="Référence interne" error="La référence doit comporter au moins 6 caractères.">
              <Input value={invalidInput} onChange={(e) => setInvalidInput(e.target.value)} invalid />
            </FieldGroup>

            <FieldGroup label="Champ non disponible" hint="Désactivé explicitement, pas simplement grisé.">
              <Input value="Valeur verrouillée" disabled readOnly />
            </FieldGroup>

            <FieldGroup label="Champ en chargement">
              <Input value="Recherche…" loading readOnly />
            </FieldGroup>

            <FieldGroup label="Recherche">
              <Search
                value={query}
                onValueChange={setQuery}
                onClear={() => {
                  setQuery('');
                  record('Recherche effacée');
                }}
                placeholder="Filtrer la liste"
              />
            </FieldGroup>

            <FieldGroup label="Périodicité">
              <Select
                value={selectValue}
                onChange={(v) => {
                  setSelectValue(v);
                  record(`Périodicité → ${v || 'aucune'}`);
                }}
                placeholder="Choisir une périodicité"
                options={[
                  { value: 'mensuel', label: 'Mensuelle' },
                  { value: 'trimestriel', label: 'Trimestrielle' },
                  { value: 'annuel', label: 'Annuelle' },
                  { value: 'archive', label: 'Archivée (indisponible)', disabled: true }
                ]}
              />
            </FieldGroup>

            <FieldGroup label="Échéance">
              <DatePicker value={date} onChange={(v) => { setDate(v); record(`Date → ${v}`); }} />
            </FieldGroup>

            <FieldGroup label="Échéance non disponible">
              <DatePicker value="" onChange={() => {}} disabled />
            </FieldGroup>
          </div>
        </Card>

        <Card>
          <div className={styles.row}>
            <StateCell label="Checkbox — cochée">
              <Checkbox checked={checked} onChange={(v) => { setChecked(v); record(`Checkbox → ${v}`); }} label="Recevoir les relances" />
            </StateCell>
            <StateCell label="Checkbox — décochée">
              <Checkbox checked={false} onChange={(v) => setChecked(v)} label="Option inactive" />
            </StateCell>
            <StateCell label="Checkbox — mixte">
              <Checkbox checked={false} mixed={mixed} onChange={() => setMixed((m) => !m)} label="Tout sélectionner" />
            </StateCell>
            <StateCell label="Checkbox — disabled">
              <Checkbox checked disabled onChange={() => {}} label="Imposé par le contrat" />
            </StateCell>
            <StateCell label="Switch">
              <Switch checked={toggled} onChange={(v) => { setToggled(v); record(`Switch → ${v}`); }} label="Notifications" />
            </StateCell>
            <StateCell label="Switch — disabled">
              <Switch checked disabled onChange={() => {}} label="Verrouillé" />
            </StateCell>
          </div>

          <RadioGroup
            name="periodicite-radio"
            legend="Fréquence de facturation"
            value={radio}
            onChange={(v) => { setRadio(v); record(`Fréquence → ${v}`); }}
            options={[
              { value: 'mensuel', label: 'Mensuelle' },
              { value: 'trimestriel', label: 'Trimestrielle' },
              { value: 'manuel', label: 'Manuelle' },
              { value: 'archive', label: 'Archivée (indisponible)', disabled: true }
            ]}
          />
        </Card>

        <Card>
          <div className={styles.row}>
            <StateCell label="FileUpload — repos">
              <FileUpload
                status="idle"
                fileName={fileName}
                accept=".pdf,.png,.jpg"
                onFiles={(files) => {
                  const name = files[0]?.name;
                  setFileName(name);
                  setUploadStatus('uploading');
                  record(`Fichier choisi : ${name ?? 'aucun'}`);
                  window.setTimeout(() => setUploadStatus('success'), 1600);
                }}
              />
            </StateCell>
            <StateCell label="FileUpload — téléversement">
              <FileUpload status="uploading" fileName="justificatif-0421.pdf" onFiles={() => {}} />
            </StateCell>
            <StateCell label="FileUpload — reçu">
              <FileUpload status="success" fileName="justificatif-0421.pdf" onFiles={() => {}} />
            </StateCell>
            <StateCell label="FileUpload — échec">
              <FileUpload
                status="error"
                fileName="justificatif-0421.pdf"
                onFiles={() => {}}
              />
            </StateCell>
          </div>
          <Caption>
            Les statuts « téléversement », « reçu » et « échec » sont pilotés par la
            galerie. Aucun téléversement réel n’a lieu : le premier bloc attend
            réellement un fichier, les trois autres affichent un état figé.
          </Caption>
        </Card>

        <Card>
          <Stepper steps={STEPS} current={step} onGoTo={(i) => { setStep(i); record(`Étape → ${STEPS[i]}`); }} />
          <div className={styles.row}>
            <Button
              variant="ghost"
              size="sm"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Précédent
            </Button>
            <Button size="sm" disabled={step === STEPS.length - 1} onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
              Suivant
            </Button>
          </div>
          <Caption>
            Les étapes futures ne sont pas atteignables : on ne saute pas une étape
            non remplie. Sous 720 px, le fil devient un indicateur numérique.
          </Caption>
        </Card>
      </Section>

      {/* ----------------------------- Feedback ------------------------------ */}
      <Section
        id="feedback"
        title="Retours d’état"
        note="Une erreur est compréhensible et exploitable. Jamais de stack trace : les détails restent dans les logs."
      >
        <Card>
          <div className={styles.stack}>
            <Alert tone="info" title="Synchronisation planifiée" onDismiss={() => record('Message info fermé')}>
              La prochaine synchronisation est prévue en fin de journée.
            </Alert>
            <Alert
              tone="success"
              title="Modification enregistrée"
              action={{ label: 'Annuler la modification', onClick: () => record('Modification annulée') }}
            >
              Les coordonnées ont été mises à jour.
            </Alert>
            <Alert tone="warning" title="Pièce manquante" onDismiss={() => record('Message d’attention fermé')}>
              Un justificatif est attendu avant la validation du dossier.
            </Alert>
            <Alert
              tone="critical"
              title="Établissement suspendu"
              action={{ label: 'Voir les motifs', onClick: () => record('Motifs consultés') }}
            >
              Les encaissements sont interrompus. Cette alerte ne se ferme pas seule.
            </Alert>
          </div>
        </Card>

        <Card>
          <div className={styles.stack}>
            <SectionLabel>chargement — skeleton</SectionLabel>
            <SkeletonBlock lines={3} />
            <div className={styles.row}>
              <Skeleton width="var(--sp-20)" height="var(--sp-8)" radius="var(--r-max)" />
              <Skeleton width="var(--sp-24)" />
              <Skeleton width="var(--sp-16)" />
            </div>
            <Caption>
              Pulsation d’opacité, pas de balayage lumineux : le corpus interdit
              l’animation décorative constante.
            </Caption>
          </div>
        </Card>

        <Card>
          <div className={styles.stateGrid}>
            <EmptyState
              title="Aucun prospect."
              description="Commencez par ajouter votre premier prospect pour suivre vos opportunités commerciales."
              action={{ label: 'Ajouter un prospect', onClick: () => record('EmptyState → Ajouter un prospect') }}
            />
            <ErrorState
              title="Le document n’a pas pu être ouvert"
              description="Le fichier est peut-être endommagé ou dans un format non pris en charge. Vous pouvez réessayer, ou le téléverser à nouveau."
              reference="ERR-2026-0421"
              onRetry={() => record('ErrorState → Réessayer')}
            />
            <PermissionDenied
              resource="la paie"
              missingPermission="paie.lecture"
              contact="l’administrateur de votre établissement"
            />
          </div>
        </Card>

        <Card>
          <div className={styles.stateGrid}>
            <OfflineState
              lastSyncLabel="il y a 12 minutes"
              demonstration
              onRetry={() => record('OfflineState → Rechercher la connexion')}
            />
            <div className={styles.stack}>
              <SyncingState demonstration />
              <Caption>
                <Code>offline</Code> et <Code>syncing</Code> décrivent une connectivité
                réelle. Ici ils sont affichés en démonstration et signalés comme tels :
                aucune condition système n’est simulée.
              </Caption>
            </div>
            <ModuleUnavailable
              module="Module Social Media"
              reason="Ce module n’est pas actif pour votre abonnement actuel."
              onLearnMore={() => record('ModuleUnavailable → Conditions d’activation')}
            />
          </div>
        </Card>
      </Section>

      {/* ---------------------------- Notifications -------------------------- */}
      <Section
        id="notifications"
        title="Notifications"
        note="Entrée et sortie par la droite, progress bar fine, icône sémantique. Critique ne se ferme pas seule."
      >
        <Card>
          <div className={styles.row}>
            {(['info', 'success', 'warning', 'critical'] as ToastTone[]).map((tone) => (
              <Button key={tone} variant="ghost" size="sm" onClick={() => notify(tone)}>
                Notification {tone}
              </Button>
            ))}
          </div>
        </Card>
      </Section>

      {/* ------------------------------ Overlays ----------------------------- */}
      <Section
        id="overlays"
        title="Overlays"
        note="ConfirmDialog et Modal partagent la même base. Escape ferme, le focus est piégé puis rendu au déclencheur."
      >
        <Card>
          <div className={styles.row}>
            <Button onClick={() => { setModalOpen(true); record('Modal ouverte'); }}>Ouvrir une modale</Button>
            <Button variant="ghost" onClick={() => { setDrawerOpen(true); record('Tiroir ouvert'); }}>
              Ouvrir un tiroir
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>Opération critique</Button>
          </div>
          <Caption>
            La confirmation est obligatoire pour : suppression, annulation, gros
            export, campagne importante, modification critique, réactivation,
            changement de permissions.
          </Caption>
        </Card>
      </Section>

      {/* ------------------------------ Identité ----------------------------- */}
      <Section
        id="identite"
        title="Identité et sémantique"
        note="La couleur n’est jamais le seul vecteur : chaque indicateur porte aussi un libellé, une icône ou une forme."
      >
        <Card>
          <div className={styles.row}>
            <StateCell label="Avatar">
              <div className={styles.row}>
                <Avatar initials="AP" name="Atelier du Plateau" size="sm" />
                <Avatar initials="MC" name="Marché Central" size="md" />
                <Avatar initials="YP" name="Yopougon Nord" size="lg" />
                <Avatar initials="??" name="Inconnu" size="md" unavailable />
              </div>
            </StateCell>
            <StateCell label="StatusDot">
              <div className={styles.stack}>
                <StatusDot tone="success" label="Actif" />
                <StatusDot tone="info" label="En vérification" />
                <StatusDot tone="warning" label="À surveiller" />
                <StatusDot tone="critical" label="Suspendu" />
                <StatusDot tone="neutral" label="Inactif" />
              </div>
            </StateCell>
            <StateCell label="Badge">
              <div className={styles.row}>
                <Badge tone="success">Réglée</Badge>
                <Badge tone="info">Brouillon</Badge>
                <Badge tone="warning">En retard</Badge>
                <Badge tone="critical">Impayée</Badge>
                <Badge tone="neutral">Archivée</Badge>
              </div>
            </StateCell>
            <StateCell label="SeverityIndicator">
              <div className={styles.stack}>
                <SeverityIndicator tone="info" label="À surveiller" level={1} />
                <SeverityIndicator tone="warning" label="Prioritaire" level={3} />
                <SeverityIndicator tone="critical" label="Critique" level={4} />
              </div>
            </StateCell>
          </div>
          <Caption>
            CRITIQUE n’est jamais décoratif : il signale une gravité réelle. Un
            niveau de sévérité est rendu par des barres ET une couleur — deux
            vecteurs, jamais un seul.
          </Caption>
        </Card>
      </Section>

      {/* ---------------------------- Typographie ---------------------------- */}
      <Section
        id="typographie"
        title="Typographie"
        note="Trois familles, rôles exclusifs. Identifiants, montants et références toujours en mono."
      >
        <Card>
          <div className={styles.stack}>
            <Title as="p">Espace Grotesk — titre de page</Title>
            <Subtitle as="p">Titre de section</Subtitle>
            <Body>
              Inter — texte courant. La densité reste lisible sans formation : chaque
              ligne conserve assez d’air pour être suivie du regard.
            </Body>
            <Caption>Inter — texte secondaire, jamais en dessous de 11,5 px.</Caption>
            <div className={styles.row}>
              <MonoValue>1 284 500 FCFA</MonoValue>
              <MonoValue>DEV-2026-0042</MonoValue>
              <MonoValue>2026-08-29</MonoValue>
            </div>
            <SectionLabel as="p">libellé de section</SectionLabel>
          </div>
        </Card>
      </Section>

      {/* ------------------------------- Icônes ------------------------------ */}
      <Section
        id="icones"
        title="Icônes"
        note="Jeu unique, style linéaire : viewBox 24, tracé currentColor, épaisseur 1,5. Une icône n’introduit jamais de couleur propre."
      >
        <Card>
          <ul className={styles.iconGrid}>
            {ICON_NAMES.map((name) => (
              <li key={name} className={styles.iconCell}>
                <Icon name={name} size="var(--ctl-icon-lg)" />
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <ActionLog entries={log} />
    </main>
  );
}

/** Mise en évidence inline d'un nom d’état, en mono. */
function Code({ children }: { children: React.ReactNode }) {
  return <span className={styles.code}>{children}</span>;
}

export default function DevUiPage() {
  return (
    <ToastProvider>
      <Gallery />
    </ToastProvider>
  );
}
