import { AppShell } from '@/components/shell';
import { StockOverview } from '@/components/stocks';

export default function Page() {
  return (
    <AppShell>
      <StockOverview />
    </AppShell>
  );
}
