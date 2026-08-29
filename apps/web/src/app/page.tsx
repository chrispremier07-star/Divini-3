import Link from 'next/link';

import styles from './page.module.css';

/**
 * Racine de l'application — état des lieux vivant.
 *
 * Cette page récapitule ce qui est réellement livré à ce stade et renvoie vers
 * les écrans et galeries techniques qui existent. Elle n'est PAS une landing
 * publique (LOT 22) et ne présente aucune donnée métier : les galeries /dev
 * affichent des données simulées, signalées comme telles.
 */

const LOTS = [
  { id: 'LOT 00', name: 'Cadrage & contrat de tokens', state: 'construit — validé provisoirement' },
  { id: 'LOT 01', name: 'Fondations Design System', state: 'construit — validé provisoirement' },
  { id: 'LOT 02', name: 'App Shell', state: 'construit — validé' },
  { id: 'LOT 03', name: 'Data & Feedback', state: 'construit — validé' }
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={`${styles.eyebrow} t-section-label`}>divini exo</p>
        <h1 className={styles.title}>Fondations, App Shell et données en place</h1>
        <p className={`${styles.lede} t-body`}>
          Les lots 00 à 03 sont livrés : contrat de tokens, primitives du Design
          System, App Shell (navigation, thème, densité, notifications) et
          composants de données (table virtualisée, KPI, graphiques, kanban).
          Le premier écran métier arrive au LOT 05.
        </p>

        <div className={styles.warning}>
          <p className={`${styles.warningTitle} t-label`}>Ce qui n’existe pas encore</p>
          <p className={`${styles.warningBody} t-body-small`}>
            Aucun écran métier, aucun backend réel, aucune authentification. Les
            données visibles dans les galeries /dev sont simulées et signalées comme
            telles. Rien n’est « fonctionnel » au sens métier.
          </p>
        </div>

        <nav className={styles.nav} aria-label="Accès aux écrans livrés">
          <Link className={styles.link} href="/app">
            Ouvrir l’App Shell
          </Link>
          <Link className={styles.linkGhost} href="/dev/tokens">
            Tokens
          </Link>
          <Link className={styles.linkGhost} href="/dev/ui">
            Composants
          </Link>
          <Link className={styles.linkGhost} href="/dev/shell">
            Shell
          </Link>
          <Link className={styles.linkGhost} href="/dev/data">
            Data
          </Link>
        </nav>
      </section>

      <section className={styles.table} aria-label="Avancement des lots">
        <table>
          <caption className={styles.caption}>
            Avancement de la phase frontend — 16 %
          </caption>
          <thead>
            <tr>
              <th scope="col" className="t-table-header">Lot</th>
              <th scope="col" className="t-table-header">Intitulé</th>
              <th scope="col" className="t-table-header">État</th>
            </tr>
          </thead>
          <tbody>
            {LOTS.map((lot) => (
              <tr key={lot.id}>
                <td className="t-mono-id">{lot.id}</td>
                <td>{lot.name}</td>
                <td>{lot.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
