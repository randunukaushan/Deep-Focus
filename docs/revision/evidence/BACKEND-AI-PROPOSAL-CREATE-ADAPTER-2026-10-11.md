# Backend evidence — AI proposal create adapter candidate (2026-10-11)

Added a local PostgreSQL candidate adapter for creating owner-bound AI
proposals. It validates ready/unexpired proposal records, persists only the
reviewed operation metadata, and uses `(owner_id, generation_request_id,
version)` as the duplicate-safe replay key. An identical replay returns the
canonical stored row; a changed replay fails with `AI_PROPOSAL_MISMATCH`.
JSON object keys are canonicalized before replay comparison so PostgreSQL
`jsonb` key ordering cannot cause a false conflict. Provider prompts are not
stored by this adapter.

## Actual checks

- Focused proposal adapter tests: **10/10 PASS**.
- Full repository regression: **1039/1039 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS**.
- `git diff --check`: no content errors; only existing line-ending warnings.

## Boundaries

This is a local candidate foundation. The proposal-generation route, live
provider, Supabase execution, remote RLS/account-isolation evidence,
independent security review and Android/device verification remain
**REVIEW_PENDING / NOT_RUN**. No live database, production migration,
deployment, payment, commit or push was performed.
