import Link from 'next/link';
import type { ReactNode } from 'react';

const links = [
  { href: '/features', label: 'Features' },
  { href: '/solutions/personal', label: 'For yourself' },
  { href: '/solutions/education', label: 'For education' },
  { href: '/roadmap', label: 'Roadmap' },
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="status-bar"><span className="status-dot" /> Product development preview · No sign-up or purchase</div>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Deep Focus home">
          <span className="brand-mark" aria-hidden="true"><i /></span>
          <span>DEEP FOCUS</span>
        </Link>
        <nav aria-label="Main navigation">
          {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          <Link className="nav-cta" href="/plans">Plans</Link>
        </nav>
      </header>
      {children}
      <footer className="site-footer">
        <div className="footer-top">
          <div><Link className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true"><i /></span><span>DEEP FOCUS</span></Link><p>Focus on What Matters.</p></div>
          <nav aria-label="Footer navigation">
            <Link href="/updates">Updates</Link><Link href="/help">Help</Link><Link href="/accessibility">Accessibility</Link>
            <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link>
          </nav>
        </div>
        <p className="footer-note">Development preview. Product, availability and policy details are not final.</p>
      </footer>
    </>
  );
}
