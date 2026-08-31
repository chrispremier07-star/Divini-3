import { AppShell } from '@/components/shell';
import { ScenarioEditor } from '@/components/crm';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <ScenarioEditor id={id} />
    </AppShell>
  );
}
