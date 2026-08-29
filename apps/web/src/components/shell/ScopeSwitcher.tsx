/**
 * DIVINI exo — Sélecteur de portée (tenant ⇄ établissements)
 *
 * Décision C.2 : sélecteur global unique, portée par la session — pas de
 * préfixe d'URL. Visible en permanence dans la topbar (LOT 02 §5).
 *
 * La consolidation « Tous les établissements » est annoncée comme telle : elle
 * agrège plusieurs jeux de données, et l'interface ne doit pas laisser croire à
 * un établissement unique.
 *
 * Les établissements sont des données de démonstration (`lib/scope.ts`).
 */

'use client';

import { Icon } from '../ui/Icon';
import { Dropdown, type MenuItem } from '../ui/Menu';

import { DEMO_SITES, isConsolidated, scopeLabel, TENANT_SCOPE } from '../../lib/scope';
import { useShellState } from '../../lib/shell-state';

import styles from './shell.module.css';

export function ScopeSwitcher() {
  const { scope, setScope } = useShellState();

  const items: MenuItem[] = [
    {
      id: 'tenant',
      label: isConsolidated(TENANT_SCOPE)
        ? `${TENANT_SCOPE.label} (consolidé)`
        : TENANT_SCOPE.label,
      icon: 'layers',
      onSelect: () => setScope(TENANT_SCOPE)
    },
    ...DEMO_SITES.map((site) => ({
      id: site.id,
      label: site.label,
      icon: 'building' as const,
      onSelect: () => setScope({ kind: 'site' as const, siteId: site.id })
    }))
  ];

  return (
    <Dropdown
      label="Portée active"
      items={items}
      trigger={
        <span className={styles.scopeButton}>
          <Icon name={scope.kind === 'tenant' ? 'layers' : 'building'} size="var(--ctl-icon-sm)" />
          <span className={styles.scopeText}>{scopeLabel(scope)}</span>
          <Icon name="chevronDown" size="var(--ctl-icon-sm)" />
        </span>
      }
    />
  );
}
