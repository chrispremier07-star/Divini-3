/**
 * DIVINI exo — Barre de contexte
 *
 * Breadcrumb, titre de page, portée active, tabs de module, filtres actifs
 * (LOT 02 §2.1).
 *
 * Tabs (corpus l. 7882-7888) : labels mutés, actif `text`, underline 2 px,
 * mouvement ~280 ms, **position et largeur interpolées**, jamais de changement
 * brutal. Un underline rendu par onglet apparaîtrait et disparaîtrait : un seul
 * élément est donc positionné en absolu depuis les mesures de l'onglet actif.
 */

'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Icon } from '../ui/Icon';

import { scopeLabel } from '../../lib/scope';
import { useShellState } from '../../lib/shell-state';

import styles from './shell.module.css';

/* -------------------------------- Breadcrumb ------------------------------ */

export type BreadcrumbSegment = {
  id: string;
  label: string;
  /** Absent pour le segment courant : il n'est pas cliquable. */
  onSelect?: () => void;
};

type BreadcrumbProps = {
  segments: BreadcrumbSegment[];
  /** Sous 720 px, seuls les deux derniers niveaux sont affichés (§7). */
  condensed?: boolean;
};

export function Breadcrumb({ segments, condensed = false }: BreadcrumbProps) {
  const visible = condensed && segments.length > 2 ? segments.slice(-2) : segments;
  const hiddenCount = segments.length - visible.length;

  return (
    <nav aria-label="Fil d’Ariane" className={styles.breadcrumb}>
      {hiddenCount > 0 ? (
        <span aria-hidden="true" className={styles.breadcrumbOverflow}>
          …
        </span>
      ) : null}

      {visible.map((segment, index) => {
        const isLast = index === visible.length - 1;

        return (
          <span key={segment.id} style={{ display: 'contents' }}>
            {index > 0 ? (
              <Icon name="chevronRight" size="var(--ctl-icon-sm)" aria-hidden="true" />
            ) : null}

            {isLast || !segment.onSelect ? (
              <span className={styles.breadcrumbCurrent} aria-current={isLast ? 'page' : undefined}>
                {segment.label}
              </span>
            ) : (
              <button type="button" className={styles.breadcrumbLink} onClick={segment.onSelect}>
                {segment.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/* --------------------------------- ModuleTabs ----------------------------- */

export type ModuleTab = {
  id: string;
  label: string;
};

type ModuleTabsProps = {
  tabs: ModuleTab[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

export function ModuleTabs({ tabs, activeId, onSelect }: ModuleTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [underline, setUnderline] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    if (!activeId) {
      setUnderline(null);
      return;
    }
    const el = itemRefs.current.get(activeId);
    if (!el) {
      setUnderline(null);
      return;
    }
    // En l'absence de layout (tests jsdom), les mesures valent 0 : on ne pose
    // alors aucun underline plutôt qu'un trait de largeur nulle mal placé.
    if (el.offsetWidth === 0) {
      setUnderline(null);
      return;
    }
    setUnderline({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeId]);

  // useLayoutEffect : la mesure doit précéder la peinture, sinon l'underline
  // serait visible à sa position précédente pendant une image.
  useLayoutEffect(() => {
    measure();
  }, [measure, tabs]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(list);
    return () => observer.disconnect();
  }, [measure]);

  if (tabs.length === 0) return null;

  return (
    <div ref={listRef} className={styles.tabs} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => {
            if (el) itemRefs.current.set(tab.id, el);
            else itemRefs.current.delete(tab.id);
          }}
          type="button"
          role="tab"
          aria-selected={tab.id === activeId}
          tabIndex={tab.id === activeId ? 0 : -1}
          className={`${styles.tab} ${tab.id === activeId ? styles.tabActive : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}

      {underline ? (
        <span
          className={styles.tabUnderline}
          aria-hidden="true"
          style={{
            width: `${underline.width}px`,
            transform: `translateX(${underline.left}px)`
          }}
        />
      ) : null}
    </div>
  );
}

/* -------------------------------- ContextBar ------------------------------ */

type ContextBarProps = {
  title: string;
  breadcrumb: BreadcrumbSegment[];
  tabs?: ModuleTab[];
  activeTabId?: string | null;
  onTabSelect?: (id: string) => void;
  /** Filtres actifs — affichés, jamais implicites. */
  filters?: string[];
};

export function ContextBar({
  title,
  breadcrumb,
  tabs = [],
  activeTabId = null,
  onTabSelect,
  filters = []
}: ContextBarProps) {
  const { scope } = useShellState();

  return (
    <div className={styles.contextBar}>
      <Breadcrumb segments={breadcrumb} />

      {tabs.length > 0 && onTabSelect ? (
        <ModuleTabs tabs={tabs} activeId={activeTabId} onSelect={onTabSelect} />
      ) : null}

      {/* La portée est répétée ici : un changement de jeu de données doit rester
          visible là où l'utilisateur regarde, pas seulement dans la topbar. */}
      <span className={styles.breadcrumb}>
        <Icon name="globe" size="var(--ctl-icon-sm)" aria-hidden="true" />
        {scopeLabel(scope)}
      </span>

      {filters.length > 0 ? (
        <span className={styles.breadcrumb}>
          <Icon name="filter" size="var(--ctl-icon-sm)" aria-hidden="true" />
          {filters.join(' · ')}
        </span>
      ) : null}

      <span className={styles.breadcrumbCurrent}>{title}</span>
    </div>
  );
}
