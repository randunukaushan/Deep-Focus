# Sync owner type boundary — 2026-10-14

## Confirmed finding

The local sync coordinator validated the owner namespace with a regular
expression, but its runtime type annotation alone did not prevent a malformed
owner reader from returning a non-string value. That could escape as a raw
runtime exception before the outbox boundary reported a safe failure.

## Change

Sync now requires the initial owner value to be a string UUID before reading
pending outbox data. Malformed owner identities return the existing bounded
`SYNC_OWNER_INVALID` error and leave local mutations untouched. Malformed
optional owner/clock dependencies are rejected at the public coordinator
boundary before the same outbox access.

## Evidence

- Focused test: `tests/domain/sync-service.test.mjs` — `17 passed, 0 failed`.
- Typecheck: passed. Affected lint: passed.
- Full suite: `1487 tests, 1478 passed, 0 failed, 9 skipped`.
- Documentation checker: `PASS`; `557` Markdown files, `936` local links,
  `80/80` covered requirements, `0` errors.
- Live sync, two-account isolation, Android restart and network recovery:
  `NOT_RUN` / `REVIEW_PENDING`.
- Independent security review: `REVIEW_PENDING`.

## Boundaries

- No remote sync, live database, migration, deployment, package installation,
  commit or push was performed.
