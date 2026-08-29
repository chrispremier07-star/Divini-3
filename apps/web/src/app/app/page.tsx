/**
 * DIVINI exo — /app : coquille applicative
 *
 * LOT 02 §3 : la zone de travail est un **EmptyState assumé** jusqu'au LOT 05.
 * Elle annonce ce qui arrivera, lot par lot. Aucun faux dashboard, aucune donnée
 * inventée, aucun chiffre d'entreprise fictif (V2.18).
 *
 * Route `/app` et non `/` : la racine reste la page d'état des lieux du LOT 00,
 * la landing publique est le LOT 22.
 */

import Link from 'next/link';

import { AppShell } from '@/components/shell';

export default function AppPage() {
  return (
    <AppShell>
      {/*
        La zone de travail sans module actif est rendue par `WorkspaceLayout` :
        titre, explication et mention de la session de démonstration. On ne
        duplique pas ici un contenu qui appartient au shell.
      */}
      <p className="t-body">
        Voir aussi la{' '}
        <Link href="/dev/shell">route technique du shell</Link>{' '}
        pour exercer ses variations (sidebar compacte, portées, statuts de
        module, états de connexion).
      </p>
    </AppShell>
  );
}
