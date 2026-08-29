import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { dark, light } from '@divini/design-tokens';

import { ANTI_FLASH_SCRIPT, AppearanceProvider } from '@/lib/appearance';

import './globals.css';

export const metadata: Metadata = {
  title: 'DIVINI exo',
  description:
    'ERP SaaS multi-tenant — DIVINI exo. Phase de construction frontend, lot par lot.'
};

export const viewport: Viewport = {
  // Valeurs issues du contrat de tokens, jamais écrites en littéral ici.
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: dark.bg },
    { media: '(prefers-color-scheme: light)', color: light.bg }
  ],
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" data-density="comfortable" suppressHydrationWarning>
      <head>
        {/* Thème posé avant le premier paint : aucun flash de thème au chargement. */}
        <script dangerouslySetInnerHTML={{ __html: ANTI_FLASH_SCRIPT }} />
      </head>
      <body>
        <AppearanceProvider>{children}</AppearanceProvider>
      </body>
    </html>
  );
}
