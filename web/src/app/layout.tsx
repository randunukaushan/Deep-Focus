import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';

import { SiteShell } from '@/components/site-shell';
import { LOCALE_COOKIE, resolveLocale } from '@/content/locale';
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

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  return (
    <html lang={locale}>
      <body>
        <SiteShell locale={locale}>{children}</SiteShell>
      </body>
    </html>
  );
}
