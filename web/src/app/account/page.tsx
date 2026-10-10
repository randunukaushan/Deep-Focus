import { AccountPortal } from '@/components/account-portal';
import { LOCALE_COOKIE, resolveLocale } from '@/content/locale';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'Account Portal',
  description: 'Deep Focus account portal development status.',
};

export default async function AccountPortalPage() {
  const cookieStore = await cookies();
  return <AccountPortal locale={resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value)} />;
}
