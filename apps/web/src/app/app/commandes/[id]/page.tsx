import { AppShell } from '@/components/shell';
import { DocDetail } from '@/components/sales';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <DocDetail kind="commande" id={id} />
    </AppShell>
  );
}
