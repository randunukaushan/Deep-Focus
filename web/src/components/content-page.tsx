import type { PublicPage } from '@/content/public-pages';
import { sharedCopy, type Locale } from '@/content/locale';
import Link from 'next/link';

const statusLabels = {
  in_development: 'In development',
  prototype: 'Prototype',
  planned: 'Planned',
} as const;

export function ContentPage({ page, locale = 'en', localized = true }: { page: PublicPage; locale?: Locale; localized?: boolean }) {
  return (
    <main className="page-shell" id="main-content" tabIndex={-1}>
      {!localized ? <p className="translation-note" role="status">{sharedCopy[locale].pageEnglishNotice}</p> : null}
      <header className="page-heading">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className="lead">{page.description}</p>
        {page.reviewPending ? <p className="notice" role="status">Not final — review and product details are still being completed.</p> : null}
      </header>
      {page.featureStatuses?.length ? (
        <section className="feature-readiness" aria-labelledby="feature-readiness-title">
          <div className="feature-readiness-heading">
            <div><p className="eyebrow">CURRENT BUILD STATUS</p><h2 id="feature-readiness-title">What works, what is still being built.</h2></div>
            <p>Checked 7 October 2026. No public app release is available yet; statuses may change as reviews and device checks finish.</p>
          </div>
          <ul className="feature-status-grid">
            {page.featureStatuses.map((feature) => (
              <li className="feature-status-card" key={feature.featureId}>
                <div className="feature-status-top"><span className="feature-status-label">{statusLabels[feature.status]}</span><span>{feature.surfaces.join(' · ')}</span></div>
                <h3>{feature.name}</h3>
                <p>{feature.publicCopy}</p>
                <p className="feature-status-meta">Status date: {feature.statusAsOf} · Release version: {feature.releaseVersion ?? 'Not released'}</p>
              </li>
            ))}
          </ul>
          <p className="feature-readiness-note">These are development-status notes, not release promises. <Link href="/roadmap">Read the roadmap</Link>.</p>
        </section>
      ) : null}
      <div className="page-sections">
        {page.sections.map((section) => (
          <section className="content-card" key={section.heading}>
            <p className="eyebrow">{section.kicker}</p>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
            {section.items?.length ? <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}
          </section>
        ))}
      </div>
    </main>
  );
}
