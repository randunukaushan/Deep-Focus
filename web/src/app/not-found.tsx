import Link from 'next/link';

export default function NotFound() {
  return <main className="page-shell" id="main-content" tabIndex={-1}><section className="content-card"><p className="eyebrow">NOT FOUND</p><h1>This page isn’t here.</h1><p>The link may have changed. Return to the home page to find your way around.</p><Link className="button button-primary" href="/">Back home</Link></section></main>;
}
