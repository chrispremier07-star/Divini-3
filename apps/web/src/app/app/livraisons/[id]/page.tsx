import { AppShell } from '@/components/shell/AppShell';
import { DeliveryDetail } from '@/components/logistics';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <DeliveryDetail id={id} />
    </AppShell>
  );
}
