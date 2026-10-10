# Backend evidence — PostgreSQL rate-limit counter candidate (2026-10-10)

The local candidate adds a server-only PostgreSQL counter adapter and a
versioned private migration. Each counter key is bound to an owner, operation
and fixed window; the SQL uses one `ON CONFLICT` increment and returns the
resulting count. The adapter never accepts arbitrary SQL keys, exposes counter
rows to client roles, or treats malformed database output as an allow.

## Actual checks

- Rate-limit adapter, gateway wiring and migration contract checks: **26/26 PASS**.
- Full bundled-runtime suite: **671/671 PASS**; TypeScript, affected ESLint and
  docs checker: **PASS** (227 Markdown, 936 links, 80/80 requirements).
- Remote SQL execution, distributed concurrency/load evidence, retention cleanup,
  `Retry-After` HTTP header wiring, independent security review and Android
  verification: **NOT_RUN / REVIEW_PENDING**.

## Boundaries

The migration is local and review-pending. No Supabase project, production data,
paid service, deployment, commit or push was touched.
