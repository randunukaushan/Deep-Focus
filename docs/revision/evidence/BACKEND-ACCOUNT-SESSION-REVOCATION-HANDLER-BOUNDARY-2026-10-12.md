# Account-session revocation handler boundary evidence — 2026-10-12

## Implemented

`postgres-account-session-revocation-handler.ts` now validates its transaction
runner, clock and optional revocation-ID factory when composed, and validates
the request container before reading actor/session or body fields. The
owner-bound revocation plan, outbox enqueue, receipt and retry/idempotency
behavior remain unchanged.

## Actual verification

- Focused test: `tests/domain/postgres-account-session-revocation-handler.test.mjs`
- Focused result: **4/4 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1336/1336 PASS**
- Docs checker: **PASS** (`448` markdown files, `936` local links checked)

## Boundaries

- Local candidate only; no provider revocation or live database was contacted.
- Real session revocation and cross-account RLS evidence: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No migration, deployment, merge, push or commit was performed.
