# Worker list row boundary — 2026-10-14

## Scope

AI-generation and sync-snapshot worker `listDue` adapters now validate the
database result as a dense plain-JSON row array before mapping jobs. Sparse or
runtime-confused rows fail closed before worker lease processing.

## Evidence

- Focused worker suites: `17/17 passed; 0 failed; 0 skipped`
- Full domain suite: `1423/1423 passed; 0 failed; 0 skipped`
- TypeScript check: `PASS` (`node_modules/.bin/tsc --noEmit --pretty false`)
- Lint: `PASS` (`npm run lint`)
- Documentation check: `PASS` (`node docs/revision/check-docs.mjs`)

## Gates not established here

- Live worker execution against Supabase/PostgreSQL: `REVIEW_PENDING`
- Deno Edge runtime verification: `NOT_RUN`
- Independent security review: `REVIEW_PENDING`
- Production deployment: `NOT_RUN`
