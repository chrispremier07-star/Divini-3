/**
 * DIVINI exo — DataPanel (LOT 03)
 *
 * Conteneur de données : titre (Space Grotesk), sous-titre, actions, contenu,
 * pied. Titre via `--t-card-title`, sous-titre/pied en caption muté.
 */

'use client';

import styles from './data.module.css';

export type DataPanelProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
};

export function DataPanel({ title, subtitle, actions, footer, children }: DataPanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h3 className={styles.panelTitle}>{title}</h3>
          {subtitle ? <p className={styles.panelSubtitle}>{subtitle}</p> : null}
        </div>
        {actions ? <div className={styles.panelActions}>{actions}</div> : null}
      </div>

      {children}

      {footer ? <div className={styles.panelFooter}>{footer}</div> : null}
    </section>
  );
}
