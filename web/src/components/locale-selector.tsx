'use client';

import { usePathname } from 'next/navigation';

import { saveSiteLocale } from '@/app/actions';
import { sharedCopy, type Locale } from '@/content/locale';

export function LocaleSelector({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/';
  const copy = sharedCopy[locale];

  return (
    <form className="locale-form" action={saveSiteLocale}>
      <label htmlFor="site-locale">{copy.language}</label>
      <select id="site-locale" name="locale" defaultValue={locale}>
        <option value="si">සිංහල</option>
        <option value="ta">தமிழ்</option>
        <option value="en">English</option>
      </select>
      <input type="hidden" name="returnPath" value={pathname} />
      <button type="submit">{copy.applyLanguage}</button>
    </form>
  );
}
