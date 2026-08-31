/**
 * DIVINI exo — Stocks · catégories (LOT 07)
 *
 * Arborescence éditable + génération assistée LOCALE : l'utilisateur saisit des
 * mots-clés, une liste est proposée (`suggestCategories`, lexique local — aucun
 * appel d'IA ni service externe, interdit §11), il supprime, modifie, valide.
 * Rien n'est créé sans validation explicite.
 *
 * Gouvernance : création réservée au tenant central ; un établissement voit un
 * état `permission denied` explicite.
 */

'use client';

import { useState } from 'react';

import { Badge, Button, EmptyState, Icon, IconButton, Input, PermissionDenied } from '../ui';
import { useToast } from '../ui/Toast';

import { useShellState } from '../../lib/shell-state';

import {
  CATEGORIES,
  STOCK_PRODUCTS,
  childrenOf,
  suggestCategories,
  canCreate,
  CREATE_PERMISSION,
  CREATE_CONTACT,
  type Category
} from './mock';

import styles from './stocks.module.css';

/** Nombre de produits rattachés à une catégorie (elle-même ou ses enfants). */
function productCount(categoryId: string): number {
  const direct = STOCK_PRODUCTS.filter((p) => p.categoryId === categoryId).length;
  const childCount = childrenOf(categoryId).reduce((sum, c) => sum + productCount(c.id), 0);
  return direct + childCount;
}

function TreeNode({
  category,
  depth,
  selectedId,
  onSelect
}: {
  category: Category;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const children = childrenOf(category.id);
  return (
    <>
      <button
        type="button"
        className={styles.treeNode}
        data-depth={depth}
        aria-current={selectedId === category.id}
        onClick={() => onSelect(category.id)}
      >
        <Icon name={children.length > 0 ? 'chevronRight' : 'package'} size="var(--ctl-icon-sm)" />
        <span>{category.label}</span>
        <span className={styles.treeCount}>{productCount(category.id)}</span>
      </button>
      {children.map((child) => (
        <TreeNode
          key={child.id}
          category={child}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

/** Arborescence éditable (sélection + suppression de démonstration). */
function CategoryTree() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { push } = useToast();
  const roots = childrenOf(null);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Arborescence</span>
        <span className={styles.panelHint}>{CATEGORIES.length} catégories</span>
      </div>
      <div className={styles.tree}>
        {roots.map((root) => (
          <TreeNode
            key={root.id}
            category={root}
            depth={0}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ))}
      </div>
      {selectedId ? (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              push({
                tone: 'info',
                title: 'Catégorie retirée (démo)',
                description: 'Aucune écriture réelle — phase backend.'
              })
            }
          >
            <Icon name="trash" size="var(--ctl-icon-sm)" /> Supprimer la sélection
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Panneau de suggestion : mots-clés → propositions locales → curation → validation. */
function CategorySuggestPanel() {
  const [keywords, setKeywords] = useState('');
  const [suggested, setSuggested] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const { push } = useToast();

  function generate() {
    setBusy(true);
    setError(false);
    // Génération locale, déterministe. Aucun appel réseau.
    const result = suggestCategories(keywords);
    setBusy(false);
    if (result.length === 0) {
      setError(true);
      setSuggested([]);
      return;
    }
    setSuggested(result);
  }

  function removeAt(index: number) {
    setSuggested((prev) => (prev ? prev.filter((_, i) => i !== index) : prev));
  }

  function renameAt(index: number, value: string) {
    setSuggested((prev) => (prev ? prev.map((s, i) => (i === index ? value : s)) : prev));
  }

  function validate() {
    const count = suggested?.length ?? 0;
    setSuggested(null);
    setKeywords('');
    push({
      tone: 'success',
      title: `${count} catégorie(s) validée(s) (démo)`,
      description: 'Création locale de démonstration — aucune écriture réelle.'
    });
  }

  return (
    <div className={styles.suggestPanel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Génération assistée</span>
        <Badge tone="neutral" withIcon={false}>assistance locale</Badge>
      </div>
      <p className={styles.suggestNote}>
        Saisissez quelques mots-clés : une liste de catégories est proposée localement
        (lexique de démonstration). Vous supprimez, modifiez, validez. Rien n'est créé sans
        validation explicite. Aucun modèle d'IA, aucun appel externe.
      </p>

      <div className={styles.formField}>
        <Input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="café, thé, miel, bio…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              generate();
            }
          }}
        />
      </div>

      <div className={styles.actions}>
        <Button variant="primary" size="sm" onClick={generate} loading={busy}>
          Proposer des catégories
        </Button>
      </div>

      {error ? (
        <p className={styles.fieldError}>
          Aucun mot-clé exploitable — la suggestion est vide (rien n'est inventé).
        </p>
      ) : null}

      {suggested && suggested.length > 0 ? (
        <>
          <div className={styles.suggestList}>
            {suggested.map((label, index) => (
              <div key={`${label}-${index}`} className={styles.suggestItem}>
                <input
                  className={styles.suggestLabel}
                  value={label}
                  aria-label={`Catégorie proposée ${index + 1}`}
                  onChange={(e) => renameAt(index, e.target.value)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--fs-sm)'
                  }}
                />
                <div className={styles.suggestActions}>
                  <IconButton
                    icon="trash"
                    label={`Retirer ${label}`}
                    onClick={() => removeAt(index)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className={styles.actions}>
            <Button variant="primary" size="sm" onClick={validate}>
              Valider {suggested.length} catégorie(s)
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSuggested(null)}>
              Tout annuler
            </Button>
          </div>
        </>
      ) : null}

      {suggested && suggested.length === 0 && !error ? (
        <EmptyState
          title="Liste vidée"
          description="Toutes les propositions ont été retirées. Relancez une suggestion."
          icon="layers"
        />
      ) : null}
    </div>
  );
}

/** Écran Catégories. */
export function CategoriesScreen() {
  const { scope } = useShellState();
  const allowed = canCreate(scope.kind);

  return (
    <div className={styles.listWrap}>
      <div className={styles.detailHead}>
        <div>
          <h1 className={styles.detailTitle}>Catégories</h1>
          <p className={styles.panelHint}>
            Arborescence éditable et génération assistée locale. Données de démonstration.
          </p>
        </div>
      </div>

      <div className={styles.categoryLayout}>
        <CategoryTree />
        {allowed ? (
          <CategorySuggestPanel />
        ) : (
          <PermissionDenied
            resource="créer des catégories"
            missingPermission={CREATE_PERMISSION}
            contact={CREATE_CONTACT}
          />
        )}
      </div>
    </div>
  );
}
