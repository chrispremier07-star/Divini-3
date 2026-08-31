import { AppShell } from '@/components/shell';
import { ExpenseList } from '@/components/finance';

export default function Page() {
  return (
    <AppShell>
      <ExpenseList />
    </AppShell>
  );
}
