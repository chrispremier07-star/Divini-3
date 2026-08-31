import { AppShell } from '@/components/shell';
import { SegmentDetail } from '@/components/crm';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <SegmentDetail id={id} />
    </AppShell>
  );
}
