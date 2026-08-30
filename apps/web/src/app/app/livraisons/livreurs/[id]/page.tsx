import { AppShell } from '@/components/shell/AppShell';
import { CourierDetail } from '@/components/logistics';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <CourierDetail id={id} />
    </AppShell>
  );
}
