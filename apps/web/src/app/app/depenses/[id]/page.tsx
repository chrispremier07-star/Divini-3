import { AppShell } from '@/components/shell';
import { ExpenseDetail } from '@/components/finance';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <ExpenseDetail id={id} />
    </AppShell>
  );
}
