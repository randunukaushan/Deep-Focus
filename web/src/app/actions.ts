'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { isLocale, LOCALE_COOKIE, safeLocalReturnPath } from '@/content/locale';

export async function saveSiteLocale(formData: FormData) {
  const requested = formData.get('locale');
  const locale = isLocale(requested) ? requested : 'en';
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect(safeLocalReturnPath(formData.get('returnPath')));
}
