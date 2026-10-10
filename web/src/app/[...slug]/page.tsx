import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

import { ContentPage } from '@/components/content-page';
import { getPublicPage, publicPages } from '@/content/public-pages';
import { getLocalizedPublicPage } from '@/content/localized-public-pages';
import { LOCALE_COOKIE, resolveLocale } from '@/content/locale';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(publicPages).map((slug) => ({ slug: slug.split('/') }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = resolveLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const page = getLocalizedPublicPage(slug.join('/'), locale) ?? getPublicPage(slug.join('/'));
  return page ? { title: page.title, description: page.description } : {};
}

export default async function PublicPageRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const pageSlug = slug.join('/');
  const locale = resolveLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const localizedPage = getLocalizedPublicPage(pageSlug, locale);
  const page = localizedPage ?? getPublicPage(pageSlug);
  if (!page) notFound();
  return <ContentPage page={page} locale={locale} localized={locale === 'en' || localizedPage !== undefined} />;
}
