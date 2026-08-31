import { AppShell } from '@/components/shell';
import { SaleHistory } from '@/components/sales';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <SaleHistory id={id} />
    </AppShell>
  );
}
