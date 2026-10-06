import type { PublicPage } from '@/content/public-pages';

export function ContentPage({ page }: { page: PublicPage }) {
  return (
    <main className="page-shell" id="main-content" tabIndex={-1}>
      <header className="page-heading">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className="lead">{page.description}</p>
        {page.reviewPending ? <p className="notice" role="status">Not final — review and product details are still being completed.</p> : null}
      </header>
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
