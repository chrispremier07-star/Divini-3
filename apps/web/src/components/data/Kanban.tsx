/**
 * DIVINI exo — Kanban (LOT 03, corpus l. 7911-7921)
 *
 * Colonnes `--surface-card`, cartes `--surface-raised`, drag-over
 * `--accent-soft`, curseurs grab/grabbing, feedback discret.
 *
 * Le déplacement n'est pas réservé à la souris : chaque carte expose un menu
 * « Déplacer vers… » (clavier / tactile). L'annulation reste possible côté
 * parent tant que l'action n'est pas confirmée (Toast « Annuler »).
 */

'use client';

import { useState } from 'react';

import { Dropdown, type MenuItem } from '../ui/Menu';
import { IconButton } from '../ui/Button';
import { StatusDot } from '../ui/Identity';
import type { Tone } from '../ui/Identity';

import styles from './data.module.css';

export type KanbanCardData = {
  id: string;
  title: string;
  meta?: string;
  tone?: Tone;
};

export type KanbanColumnData = {
  id: string;
  title: string;
  cards: KanbanCardData[];
};

export type KanbanProps = {
  columns: KanbanColumnData[];
  /** Appelé quand une carte change de colonne (drag ou menu). */
  onMove?: (cardId: string, toColumnId: string) => void;
};

export function KanbanCard({
  card,
  dragging,
  onDragStart,
  onDragEnd,
  moveItems
}: {
  card: KanbanCardData;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  moveItems: MenuItem[];
}) {
  return (
    <div
      className={`${styles.kanbanCard} ${dragging ? styles.kanbanCardDragging : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--d-button-gap)' }}>
        {card.tone ? <StatusDot tone={card.tone} label={card.tone} labelHidden /> : null}
        <strong>{card.title}</strong>
      </span>
      {card.meta ? <span className={styles.timelineMeta}>{card.meta}</span> : null}
      <Dropdown
        label={`Déplacer ${card.title}`}
        items={moveItems}
        trigger={
          <IconButton icon="moreHorizontal" label={`Déplacer ${card.title}`} size="sm" variant="ghost" onClick={() => {}} />
        }
      />
    </div>
  );
}

export function Kanban({ columns, onMove }: KanbanProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const handleDrop = (columnId: string) => {
    if (draggingId && onMove) onMove(draggingId, columnId);
    setDraggingId(null);
    setOverColumn(null);
  };

  return (
    <div className={styles.kanban}>
      {columns.map((column) => (
        <div
          key={column.id}
          className={`${styles.kanbanColumn} ${overColumn === column.id ? styles.kanbanColumnOver : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setOverColumn(column.id);
          }}
          onDragLeave={() => setOverColumn((c) => (c === column.id ? null : c))}
          onDrop={() => handleDrop(column.id)}
        >
          <span className={styles.kanbanColumnTitle}>
            {column.title}
            <span className={styles.timelineMeta}>{column.cards.length}</span>
          </span>

          {column.cards.map((card) => {
            const moveItems: MenuItem[] = columns
              .filter((c) => c.id !== column.id)
              .map((c) => ({
                id: c.id,
                label: `Déplacer vers ${c.title}`,
                onSelect: () => onMove?.(card.id, c.id)
              }));

            return (
              <KanbanCard
                key={card.id}
                card={card}
                dragging={draggingId === card.id}
                onDragStart={() => setDraggingId(card.id)}
                onDragEnd={() => {
                  setDraggingId(null);
                  setOverColumn(null);
                }}
                moveItems={moveItems}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export type KanbanColumnProps = KanbanColumnData;
export type { KanbanCardData as KanbanCardProps };
