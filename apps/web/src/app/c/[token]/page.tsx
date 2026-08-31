import { PublicPreferencePage } from '@/components/crm';

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PublicPreferencePage token={token} />;
}
