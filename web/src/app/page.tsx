import Link from 'next/link';

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">A QUIETER WAY TO MAKE PROGRESS</p>
          <h1 id="home-title">Focus on what matters.</h1>
          <p className="lead">
            Deep Focus is being built to help you choose a next step, protect a
            little time for it, and return gently when your day changes.
          </p>
          <div className="actions">
            <Link className="button button-primary" href="/features">Explore the product</Link>
            <Link className="button button-secondary" href="/roadmap">See what is in progress</Link>
          </div>
          <p className="quiet-note">No streak debt. No pressure to share your work.</p>
        </div>
        <div className="focus-art" aria-hidden="true">
          <div className="focus-orbit focus-orbit-one" />
          <div className="focus-orbit focus-orbit-two" />
          <div className="focus-core"><span>one thing</span><i /></div>
        </div>
      </section>

      <section className="three-up" aria-label="Product principles">
        <article className="principle-card"><span className="number">01</span><h2>Choose a direction</h2><p>Keep tasks and meaningful goals close without turning your day into a scoreboard.</p></article>
        <article className="principle-card"><span className="number">02</span><h2>Make room to focus</h2><p>Use a timer you control, with clear pause and exit choices.</p></article>
        <article className="principle-card"><span className="number">03</span><h2>Come back calmly</h2><p>Interrupted time is part of real life. Your progress should reflect the work you did.</p></article>
      </section>

      <section className="callout">
        <div><p className="eyebrow">CURRENT STATUS</p><h2>This is a development preview.</h2><p>Accounts, purchases, downloads and online services are not available from this site.</p></div>
        <Link className="text-link" href="/help">Read the preview notes <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
