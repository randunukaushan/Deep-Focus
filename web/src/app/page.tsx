import Link from 'next/link';
import { cookies } from 'next/headers';
import { homeCopy } from '@/content/home-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/content/locale';

export default async function HomePage() {
  const cookieStore = await cookies();
  const copy = homeCopy[resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value)];
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 id="home-title">{copy.title}</h1>
          <p className="lead">{copy.description}</p>
          <div className="actions">
            <Link className="button button-primary" href="/features">{copy.explore}</Link>
            <Link className="button button-secondary" href="/roadmap">{copy.roadmap}</Link>
          </div>
          <p className="quiet-note">{copy.reassurance}</p>
        </div>
        <div className="focus-art" aria-hidden="true">
          <div className="focus-orbit focus-orbit-one" />
          <div className="focus-orbit focus-orbit-two" />
          <div className="focus-core"><span>{copy.oneThing}</span><i /></div>
        </div>
      </section>

      <section className="three-up" aria-label={copy.principlesLabel}>
        {copy.principles.map((principle, index) => <article className="principle-card" key={principle.title}><span className="number">0{index + 1}</span><h2>{principle.title}</h2><p>{principle.body}</p></article>)}
      </section>

      <section className="callout">
        <div><p className="eyebrow">{copy.statusEyebrow}</p><h2>{copy.statusTitle}</h2><p>{copy.statusBody}</p></div>
        <Link className="text-link" href="/help">{copy.help} <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
