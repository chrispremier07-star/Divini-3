import { AppShell } from '@/components/shell';
import { ClientForm } from '@/components/crm';

export default function Page() {
  return (
    <AppShell>
      <ClientForm mode="create" />
    </AppShell>
  );
}
