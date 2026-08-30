'use client';

import { AppShell } from '@/components/shell';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

function NewQuoteContent() {
  const { push } = useToast();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <p className="t-body">
        Nouveau devis — création de démonstration. L'envoi réel (email/WhatsApp) est
        reporté au LOT 12 / backend ; le document reste local.
      </p>
      <Button
        variant="primary"
        size="sm"
        onClick={() =>
          push({ tone: 'success', title: 'Devis brouillon créé (démo)', description: 'Aucun envoi réel n’a eu lieu.' })
        }
      >
        Créer le devis brouillon
      </Button>
    </div>
  );
}

export default function NewQuotePage() {
  return (
    <AppShell>
      <NewQuoteContent />
    </AppShell>
  );
}
