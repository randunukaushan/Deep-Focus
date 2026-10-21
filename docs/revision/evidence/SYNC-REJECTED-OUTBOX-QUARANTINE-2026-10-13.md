# Rejected outbox quarantine evidence — 2026-10-13

## Implemented

`syncPendingOutbox` now excludes `rejected` local mutations from the automatic
push batch. This preserves the approved recovery rule: permanent server
decisions stay visible for explicit user resolution and are not silently
resent. Pending and recoverable `in_flight` entries retain their existing
retry behavior.

## Actual verification

- Focused test: `tests/domain/sync-service.test.mjs`
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1454 tests: 1448 PASS, 0 FAIL, 6 SKIPPED** across **258** test files.
- Docs checker: **PASS** (`527` markdown files, `936` local links checked)

## Boundaries

- Local sync candidate only; no remote endpoint or live database was contacted.
- Server-side authorization, RLS and Android/offline device evidence: `REVIEW_PENDING` / `NOT_RUN`.
- No migration, deployment, merge, push or commit was performed.
