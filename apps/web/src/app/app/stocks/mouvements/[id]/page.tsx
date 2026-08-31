import { AppShell } from '@/components/shell';
import { MovementDetail } from '@/components/stocks';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <MovementDetail id={id} />
    </AppShell>
  );
}
