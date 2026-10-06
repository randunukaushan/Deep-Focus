import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { SiteShell } from '@/components/site-shell';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Deep Focus — Focus on What Matters',
    template: '%s — Deep Focus',
  },
  description: 'A calm, user-controlled focus and planning app in development.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0e1c36',
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
