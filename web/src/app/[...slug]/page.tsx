import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ContentPage } from '@/components/content-page';
import { getPublicPage, publicPages } from '@/content/public-pages';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(publicPages).map((slug) => ({ slug: slug.split('/') }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getPublicPage(slug.join('/'));
  return page ? { title: page.title, description: page.description } : {};
}

export default async function PublicPageRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = getPublicPage(slug.join('/'));
  if (!page) notFound();
  return <ContentPage page={page} />;
}
