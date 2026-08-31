import { AppShell } from '@/components/shell';
import { PeriodDetail } from '@/components/finance';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <PeriodDetail id={id} />
    </AppShell>
  );
}
