import Link from 'next/link';
import type { ReactNode } from 'react';
import { LocaleSelector } from '@/components/locale-selector';
import { sharedCopy, type Locale } from '@/content/locale';

const links = [
  { href: '/features', label: 0 },
  { href: '/solutions/personal', label: 1 },
  { href: '/solutions/education', label: 2 },
  { href: '/roadmap', label: 3 },
];

export function SiteShell({ children, locale }: { children: ReactNode; locale: Locale }) {
  const copy = sharedCopy[locale];
  return (
    <>
      <a className="skip-link" href="#main-content">{copy.skip}</a>
      <div className="status-bar"><span className="status-dot" /> {copy.status}</div>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Deep Focus home">
          <span className="brand-mark" aria-hidden="true"><i /></span>
          <span>DEEP FOCUS</span>
        </Link>
        <nav className="desktop-nav" aria-label={copy.navLabel}>
          {links.map((link) => <Link key={link.href} href={link.href}>{copy.navLinks[link.label]}</Link>)}
          <Link className="nav-cta" href="/plans">{copy.navLinks[4]}</Link>
          <Link href="/account">{copy.account}</Link>
        </nav>
        <LocaleSelector locale={locale} />
        <details className="mobile-menu">
          <summary>{copy.menu}</summary>
          <nav aria-label={copy.navLabel}>
            {links.map((link) => <Link key={link.href} href={link.href}>{copy.navLinks[link.label]}</Link>)}
            <Link className="nav-cta" href="/plans">{copy.navLinks[4]}</Link>
            <Link href="/account">{copy.account}</Link>
          </nav>
        </details>
      </header>
      {children}
      <footer className="site-footer">
        <div className="footer-top">
          <div><Link className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true"><i /></span><span>DEEP FOCUS</span></Link><p>{copy.footerTagline}</p></div>
          <nav aria-label={copy.footerLabel}>
            <Link href="/updates">{copy.footerLinks[0]}</Link><Link href="/help">{copy.footerLinks[1]}</Link><Link href="/accessibility">{copy.footerLinks[2]}</Link>
            <Link href="/privacy">{copy.footerLinks[3]}</Link><Link href="/terms">{copy.footerLinks[4]}</Link><Link href="/contact">{copy.footerLinks[5]}</Link>
          </nav>
        </div>
        <p className="footer-note">{copy.footerNote}</p>
      </footer>
    </>
  );
}
