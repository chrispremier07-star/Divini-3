import Link from 'next/link';

import styles from './page.module.css';

/**
 * Racine de l'application — état des lieux vivant.
 *
 * Cette page récapitule ce qui est réellement livré à ce stade et renvoie vers
 * les écrans et galeries techniques qui existent. Elle n'est PAS une landing
 * publique (LOT 22) et ne présente aucune donnée métier réelle : tous les
 * écrans métier tournent sur des données simulées, signalées comme telles.
 *
 * Le pourcentage d'avancement est DÉRIVÉ du tableau ci-dessous
 * (lots construits / 25) : la légende et le tableau ne peuvent plus diverger.
 */

/** Nombre total de lots du plan frontend (README §3). */
const TOTAL_LOTS = 25;

const LOTS = [
  { id: 'LOT 00', name: 'Cadrage & contrat de tokens', state: 'construit — validé provisoirement' },
  { id: 'LOT 01', name: 'Fondations Design System', state: 'construit — validé provisoirement' },
  { id: 'LOT 02', name: 'App Shell', state: 'construit — validé' },
  { id: 'LOT 03', name: 'Data & Feedback', state: 'construit — validé' },
  { id: 'LOT 04', name: 'Command Center + Notification Center', state: 'construit — validé' },
  { id: 'LOT 05', name: 'Cockpit', state: 'construit — validé' },
  { id: 'LOT 06', name: 'Ventes & Commandes', state: 'construit — validé' },
  { id: 'LOT 07', name: 'Stocks', state: 'construit — validé' },
  { id: 'LOT 08', name: 'CRM', state: 'construit — validé' },
  { id: 'LOT 09', name: 'Finance', state: 'construit — validé' },
  { id: 'LOT 10', name: 'Logistique & Fidélité', state: 'construit — en attente de validation' }
];

const PROGRESS = Math.round((LOTS.length / TOTAL_LOTS) * 100);

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={`${styles.eyebrow} t-section-label`}>divini exo</p>
        <h1 className={styles.title}>Fondations, App Shell et modules métier en place</h1>
        <p className={`${styles.lede} t-body`}>
          Les lots 00 à 10 sont construits : contrat de tokens, primitives du
          Design System, App Shell (navigation, thème, densité, notifications),
          composants de données, puis les écrans métier — Cockpit, Ventes &
          Commandes, Stocks, CRM, Finance, Logistique & Fidélité. Prochaine
          étape : Achats, Fournisseurs & RH (LOT 11).
        </p>

        <div className={styles.warning}>
          <p className={`${styles.warningTitle} t-label`}>Ce qui n’existe pas encore</p>
          <p className={`${styles.warningBody} t-body-small`}>
            Aucun backend réel, aucune authentification, aucune persistance :
            tous les écrans métier tournent sur des données simulées, signalées
            comme telles. Rien n’est « fonctionnel » au sens métier (paiements
            réels, notifications réelles, suivi temps réel). Les galeries /dev
            restent des vitrines techniques de démonstration.
          </p>
        </div>

        <nav className={styles.nav} aria-label="Accès aux écrans livrés">
          <Link className={styles.link} href="/app">
            Ouvrir l’App Shell
          </Link>
          <Link className={styles.linkGhost} href="/app/ventes">
            Ventes
          </Link>
          <Link className={styles.linkGhost} href="/app/clients">
            CRM
          </Link>
          <Link className={styles.linkGhost} href="/app/tresorerie">
            Finance
          </Link>
          <Link className={styles.linkGhost} href="/app/livraisons">
            Livraisons
          </Link>
          <Link className={styles.linkGhost} href="/app/fidelite">
            Fidélité
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
            Avancement de la phase frontend — {PROGRESS} %
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
