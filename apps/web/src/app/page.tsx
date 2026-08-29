import Link from 'next/link';

import styles from './page.module.css';

/**
 * Racine de l'application.
 *
 * LOT 00 ne livre aucune interface métier : ni écran, ni composant, ni backend.
 * Cette page est un état des lieux, pas une landing. La landing publique est le
 * LOT 22 et n'existe pas encore.
 */

const LOTS = [
  { id: 'LOT 00', name: 'Cadrage & contrat de tokens', state: 'en cours de validation' },
  { id: 'LOT 01', name: 'Primitives du Design System', state: 'non commencé' },
  { id: 'LOT 22', name: 'Landing page publique', state: 'non commencé' }
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={`${styles.eyebrow} t-section-label`}>divini exo</p>
        <h1 className={styles.title}>Contrat de tokens établi</h1>
        <p className={`${styles.lede} t-body`}>
          Le LOT 00 est livré : squelette du dépôt, contrat de tokens (thème sombre
          canonique, thème clair dérivé et à valider), conventions écrites et contrôles
          automatiques.
        </p>

        <div className={styles.warning}>
          <p className={`${styles.warningTitle} t-label`}>Ce qui n’existe pas encore</p>
          <p className={`${styles.warningBody} t-body-small`}>
            Aucun écran, aucun composant d’interface, aucune donnée, aucun backend.
            Les couleurs affichées ici sont le contrat lui-même, pas une maquette
            d’application. Rien n’est « fonctionnel » au sens métier.
          </p>
        </div>

        <nav className={styles.nav} aria-label="Accès technique">
          <Link className={styles.link} href="/dev/tokens">
            Ouvrir la galerie technique des tokens
          </Link>
        </nav>
      </section>

      <section className={styles.table} aria-label="Avancement des lots">
        <table>
          <caption className={styles.caption}>Avancement</caption>
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
