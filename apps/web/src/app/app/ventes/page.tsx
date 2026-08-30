import { AppShell } from '@/components/shell';
import { SalesList } from '@/components/sales';

export default function Page() {
  return (
    <AppShell>
      <SalesList kind="vente" />
    </AppShell>
  );
}
