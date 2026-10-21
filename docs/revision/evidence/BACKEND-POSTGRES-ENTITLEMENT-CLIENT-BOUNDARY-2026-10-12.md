# PostgreSQL entitlement client boundary evidence — 2026-10-12

## Implemented

The server-authoritative entitlement reader now validates its injected
transaction client before session re-check or entitlement lookup. Existing
owner binding, active-session re-check, server verification marker, capability
allowlist, expiry validation and duplicate-row fail-closed behavior remain in
place.

## Actual verification

- Focused test: `tests/domain/postgres-entitlement-adapter.test.mjs`
- Focused result: **12/12 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1336/1336 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`452` markdown files, `936` local links checked)

## Boundaries

- Local entitlement candidate only; no billing provider or live database was
  contacted.
- Real subscription/entitlement integration and RLS evidence:
  `REVIEW_PENDING` / `NOT_RUN`.
- Android/device verification: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No paid service, production data change, deployment, merge, push or commit
  was performed.
