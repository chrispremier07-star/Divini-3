import { AppShell } from '@/components/shell';
import { InventoryList } from '@/components/stocks';

export default function Page() {
  return (
    <AppShell>
      <InventoryList />
    </AppShell>
  );
}
