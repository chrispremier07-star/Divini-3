import { AppShell } from '@/components/shell/AppShell';
import { DeliveryStatsScreen } from '@/components/logistics';

export default function Page() {
  return (
    <AppShell>
      <DeliveryStatsScreen />
    </AppShell>
  );
}
