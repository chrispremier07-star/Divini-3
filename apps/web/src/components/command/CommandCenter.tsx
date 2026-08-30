/**
 * DIVINI exo — Command Center (LOT 04 §2.1)
 *
 * Overlay conforme au corpus (l. 7932-7939) : fond translucide + blur léger,
 * panneau central ~560 px, apparition `scale + translateY`, fermeture `Escape`,
 * item actif `--accent-soft` / `--accent`.
 *
 * Non-duplication : le piège à focus, le retour de focus et la lecture des
 * focusables viennent de `ui/focus` (LOT 01), les toasts de `ui/Toast`, la
 * confirmation de `ui/Overlay.ConfirmDialog`. Rien n'est réécrit.
 *
 * Clavier (LOT 04 §2.1.4) : flèches, `Entrée`, `Escape`, `Tab` ; raccourci global
 * d'ouverture affiché en IBM Plex Mono dans la topbar.
 *
 * Garde-fous (§2.1.6) : une action sensible déclare sa permission et passe par
 * `ConfirmDialog` ; un module planifié / non activé est affiché comme tel ;
 * COPILOT / AUTOPILOT sont relayés vers le LOT 14, jamais simulés.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { useRouter } from 'next/navigation';

import { Icon } from '../ui/Icon';
import { useToast } from '../ui/Toast';
import { ConfirmDialog } from '../ui/Overlay';
import { trapFocus, useReturnFocus } from '../ui/focus';

import { useNotificationPrefs } from '../notifications/prefs';

import {
  buildCommandIndex,
  highlightSegments,
  searchCommands,
  SECTION_LABELS,
  type CommandItem
} from './search';

import styles from './command.module.css';

type CommandCenterValue = {
  open: boolean;
  openPalette: () => void;
  closePalette: () => void;
  /** Raccourci affiché, résolu après montage (pas de divergence SSR). */
  shortcut: string | null;
};

const CommandCenterContext = createContext<CommandCenterValue | null>(null);

export function CommandCenterProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [shortcut, setShortcut] = useState<string | null>(null);

  useEffect(() => {
    const isMac =
      typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform ?? '');
    setShortcut(isMac ? '⌘K' : 'Ctrl K');
  }, []);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);

  // Raccourci global d'ouverture — actif même palette fermée.
  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, []);

  const value = useMemo(
    () => ({ open, openPalette, closePalette, shortcut }),
    [open, openPalette, closePalette, shortcut]
  );

  return (
    <CommandCenterContext.Provider value={value}>
      {children}
      <CommandPalette />
    </CommandCenterContext.Provider>
  );
}

export function useCommandCenter(): CommandCenterValue {
  const ctx = useContext(CommandCenterContext);
  if (!ctx) throw new Error('useCommandCenter doit être utilisé dans <CommandCenterProvider>.');
  return ctx;
}

/* -------------------------------- Palette --------------------------------- */

function CommandPalette() {
  const { open, closePalette, shortcut } = useCommandCenter();
  const router = useRouter();
  const { push } = useToast();
  const { reset } = useNotificationPrefs();

  const index = useMemo(() => buildCommandIndex(), []);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [history, setHistory] = useState<CommandItem[]>([]);
  const [confirming, setConfirming] = useState<CommandItem | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useReturnFocus();

  const groups = useMemo(() => {
    if (query.trim()) return searchCommands(index, query);
    // Vide initial : suggestions (écrans réels + actions rapides + historique).
    const suggestions = index.filter(
      (item) => item.id.startsWith('screen-') || item.id.startsWith('act-')
    );
    const recent = history.filter((h) => !suggestions.some((s) => s.id === h.id));
    return [
      ...(recent.length > 0 ? [{ section: 'navigation' as const, items: recent.slice(0, 3) }] : []),
      { section: 'navigation' as const, items: suggestions.filter((s) => s.id.startsWith('screen-')) },
      { section: 'actions' as const, items: suggestions.filter((s) => s.id.startsWith('act-')) }
    ].filter((g) => g.items.length > 0);
  }, [index, query, history]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => setActiveIndex(0), [query, open]);

  // Focus entrant, piège et retour au déclencheur.
  useEffect(() => {
    if (!open) return;
    returnFocus.save();
    const panel = panelRef.current;
    inputRef.current?.focus();
    const release = panel ? trapFocus(panel) : () => {};
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePalette();
      }
    };
    document.addEventListener('keydown', onKeydown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      release();
      document.removeEventListener('keydown', onKeydown);
      document.body.style.overflow = previousOverflow;
      returnFocus.restore();
      setQuery('');
    };
  }, [open, closePalette, returnFocus]);

  const recordHistory = useCallback((item: CommandItem) => {
    setHistory((prev) => [item, ...prev.filter((h) => h.id !== item.id)].slice(0, 5));
  }, []);

  const run = useCallback(
    (item: CommandItem) => {
      switch (item.kind) {
        case 'navigate':
          if (item.route) router.push(item.route);
          recordHistory(item);
          closePalette();
          break;
        case 'planned':
          push({
            tone: 'info',
            title: `${item.label} — en construction`,
            description: `Cette capacité arrive au LOT ${item.lot ?? '—'}. Aucun écran fictif n’est ouvert.`
          });
          recordHistory(item);
          closePalette();
          break;
        case 'subscribe':
          push({
            tone: 'info',
            title: 'Module non activé',
            description: 'Disponible via Abonnement → Modules. Il reste visible et explorable.'
          });
          closePalette();
          break;
        case 'confirm':
          setConfirming(item);
          break;
        case 'copilot':
          push({
            tone: 'info',
            title: 'Relayé vers COPILOT',
            description: 'L’agent de décision arrive au LOT 14. Aucune réponse n’est inventée ici.'
          });
          recordHistory(item);
          closePalette();
          break;
        case 'autopilot':
          push({
            tone: 'info',
            title: 'Relayé vers AUTOPILOT',
            description: 'L’exécution automatique arrive au LOT 14. Aucune tâche n’est simulée.'
          });
          recordHistory(item);
          closePalette();
          break;
      }
    },
    [router, push, closePalette, recordHistory]
  );

  const onInputKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(flat.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = flat[activeIndex];
      if (item) run(item);
    }
  };

  if (!open) return null;

  let running = -1;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => e.target === e.currentTarget && closePalette()}
    >
      <div ref={panelRef} className={styles.panel} role="dialog" aria-modal="true" aria-label="Command Center">
        <div className={styles.inputRow}>
          <Icon name="search" size="var(--ctl-icon-md)" className={styles.inputIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-listbox"
            aria-activedescendant={flat[activeIndex] ? `cmd-opt-${activeIndex}` : undefined}
            placeholder="Rechercher un écran, une entité, une action…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeydown}
          />
          {shortcut ? <span className={styles.kbd}>{shortcut}</span> : null}
        </div>

        <div className={styles.results} id="command-listbox" role="listbox" aria-label="Résultats">
          {flat.length === 0 ? (
            <div className={styles.empty}>
              <Icon name="search" size="var(--ctl-icon-lg)" />
              <p className={styles.emptyTitle}>Aucun résultat pour « {query} »</p>
              <p className={styles.emptyText}>
                Vérifiez l’orthographe, ou essayez « facture », « stock », « notification ».
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.section} className={styles.group}>
                <h3 className={styles.groupTitle}>{SECTION_LABELS[group.section]}</h3>
                <ul>
                  {group.items.map((item) => {
                    running += 1;
                    const i = running;
                    const active = i === activeIndex;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          id={`cmd-opt-${i}`}
                          role="option"
                          aria-selected={active}
                          className={`${styles.option} ${active ? styles.optionActive : ''}`}
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => run(item)}
                        >
                          <Icon name={item.icon} size="var(--ctl-icon-sm)" className={styles.optionIcon} />
                          <span className={styles.optionLabel}>
                            {highlightSegments(item.label, query).map((seg, s) =>
                              seg.match ? <mark key={s}>{seg.text}</mark> : <span key={s}>{seg.text}</span>
                            )}
                          </span>
                          {item.permission ? (
                            <span className={styles.optionPerm}>{item.permission}</span>
                          ) : null}
                          {item.hint ? <span className={styles.optionHint}>{item.hint}</span> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>

        <footer className={styles.footer}>
          <span className={styles.footerHint}>
            <span className={styles.kbd}>↑↓</span> naviguer
          </span>
          <span className={styles.footerHint}>
            <span className={styles.kbd}>↵</span> exécuter
          </span>
          <span className={styles.footerHint}>
            <span className={styles.kbd}>esc</span> fermer
          </span>
        </footer>
      </div>

      <ConfirmDialog
        open={confirming !== null}
        title={confirming?.label ?? ''}
        description={`Action sensible. Permission requise : ${
          confirming?.permission ?? '—'
        }. Les préférences de notification locales seront réinitialisées.`}
        confirmLabel="Réinitialiser les préférences"
        cancelLabel="Annuler"
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          reset();
          push({ tone: 'success', title: 'Préférences réinitialisées', description: 'Réglage local appliqué.' });
          if (confirming) recordHistory(confirming);
          setConfirming(null);
          closePalette();
        }}
      />
    </div>
  );
}
