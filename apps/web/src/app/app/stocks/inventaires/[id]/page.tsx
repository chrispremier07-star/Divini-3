import { AppShell } from '@/components/shell';
import { InventoryDetail } from '@/components/stocks';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <InventoryDetail id={id} />
    </AppShell>
  );
}
