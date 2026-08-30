import { AppShell } from '@/components/shell/AppShell';
import { CourierList } from '@/components/logistics';

export default function Page() {
  return (
    <AppShell>
      <CourierList />
    </AppShell>
  );
}
