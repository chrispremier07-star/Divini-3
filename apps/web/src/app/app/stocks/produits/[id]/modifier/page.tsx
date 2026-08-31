import { AppShell } from '@/components/shell';
import { ProductForm } from '@/components/stocks';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await params;
  return (
    <AppShell>
      <ProductForm mode="edit" />
    </AppShell>
  );
}
