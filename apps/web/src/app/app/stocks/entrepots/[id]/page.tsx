import { AppShell } from '@/components/shell';
import { WarehouseDetail } from '@/components/stocks';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <WarehouseDetail id={id} />
    </AppShell>
  );
}
