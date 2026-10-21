import type { PublicPage } from '@/content/public-pages';
import { getContentPageCopy } from '@/content/content-page-copy';
import { sharedCopy, type Locale } from '@/content/locale';
import Link from 'next/link';

export function ContentPage({ page, locale = 'en', localized = true }: { page: PublicPage; locale?: Locale; localized?: boolean }) {
  const copy = getContentPageCopy(locale);
  return (
    <main className="page-shell" id="main-content" tabIndex={-1}>
      {!localized ? <p className="translation-note" role="status">{sharedCopy[locale].pageEnglishNotice}</p> : null}
      <header className="page-heading">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className="lead">{page.description}</p>
        {page.reviewPending ? <p className="notice" role="status">{copy.reviewPending}</p> : null}
      </header>
      {page.featureStatuses?.length ? (
        <section className="feature-readiness" aria-labelledby="feature-readiness-title">
          <div className="feature-readiness-heading">
            <div><p className="eyebrow">{copy.currentBuildStatus}</p><h2 id="feature-readiness-title">{copy.readinessTitle}</h2></div>
            <p>{copy.readinessDetail}</p>
          </div>
          <ul className="feature-status-grid">
            {page.featureStatuses.map((feature) => (
              <li className="feature-status-card" key={feature.featureId}>
                <div className="feature-status-top"><span className="feature-status-label">{copy.statusLabels[feature.status]}</span><span>{feature.surfaces.join(' · ')}</span></div>
                <h3>{feature.name}</h3>
                <p>{feature.publicCopy}</p>
                <p className="feature-status-meta">{copy.statusDate}: {feature.statusAsOf} · {copy.releaseVersion}: {feature.releaseVersion ?? copy.notReleased}</p>
              </li>
            ))}
          </ul>
          <p className="feature-readiness-note">{copy.readinessNote} <Link href="/roadmap">{copy.roadmapLink}</Link>.</p>
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
