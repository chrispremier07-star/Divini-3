import { AppShell } from '@/components/shell';
import { ConsentPanel } from '@/components/crm';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <ConsentPanel clientId={id} />
    </AppShell>
  );
}
