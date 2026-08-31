import { AppShell } from '@/components/shell';
import { ProductForm } from '@/components/stocks';

export default function Page() {
  return (
    <AppShell>
      <ProductForm mode="create" />
    </AppShell>
  );
}
