# Sync plain-payload integrity — 2026-10-14

## Confirmed finding

The server sync boundary accepted any non-array object as an upsert payload.
Objects such as `Date` could therefore be hashed through one representation and
serialized to the database through another representation, undermining replay
hash consistency.

## Change

Sync change validation and canonical hashing now accept only plain JSON object
payloads (ordinary or null-prototype objects). Non-plain objects are rejected
before hashing, transaction opening or storage writes.

## Evidence

- Focused tests: `tests/domain/server-sync-transaction.test.mjs` —
  `13 passed, 0 failed`.
- Typecheck: passed. Affected lint: passed.
- Full suite: `1490 tests, 1481 passed, 0 failed, 9 skipped`.
- Documentation checker: `PASS`; `560` Markdown files, `936` local links,
  `80/80` covered requirements, `0` errors.
- Live PostgreSQL sync, RLS and two-account replay evidence: `NOT_RUN` /
  `REVIEW_PENDING`.
- Independent security review: `REVIEW_PENDING`.

## Boundaries

- No live database, migration, deployment, package installation, commit or push
  was performed.
