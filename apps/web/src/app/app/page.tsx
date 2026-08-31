/**
 * DIVINI exo — /app : Cockpit (LOT 05)
 *
 * Le premier écran métier du produit remplace l'EmptyState assumé du LOT 02.
 * Il répond à « que se passe-t-il aujourd'hui et que dois-je faire ? » sans être
 * une simple collection de KPI (corpus l. 587-644).
 *
 * Les données sont mockées et signalées par le Cockpit lui-même ; aucune page
 * fictive n'est ouverte : chaque carte mène à une route réelle ou à l'état
 * « en construction — LOT n ».
 */

import { AppShell } from '@/components/shell';
import { Cockpit } from '@/components/cockpit';

export default function AppPage() {
  return (
    <AppShell>
      <Cockpit />
    </AppShell>
  );
}
