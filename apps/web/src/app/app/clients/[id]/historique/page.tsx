import { AppShell } from '@/components/shell';
import { ClientHistory } from '@/components/crm';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <ClientHistory id={id} />
    </AppShell>
  );
}
