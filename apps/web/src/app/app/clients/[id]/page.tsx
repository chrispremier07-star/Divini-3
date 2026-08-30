import { AppShell } from '@/components/shell';
import { ClientDetail } from '@/components/crm';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <ClientDetail id={id} />
    </AppShell>
  );
}
