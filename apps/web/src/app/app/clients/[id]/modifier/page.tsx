import { AppShell } from '@/components/shell';
import { ClientForm } from '@/components/crm';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await params;
  return (
    <AppShell>
      <ClientForm mode="edit" />
    </AppShell>
  );
}
