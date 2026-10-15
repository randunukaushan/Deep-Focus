# PostgreSQL rate-limit boundary evidence — 2026-10-12

## Scope

The local gateway rate-limit adapter now requires exactly one valid counter
result and rejects malformed database containers, runtime key types, runner
configuration and transaction clients. The owner/operation/window atomic
upsert and bounded policy inputs remain active.

## Automated evidence

- tests/domain/postgres-rate-limit-adapter.test.mjs: 9/9 passed.
- Typecheck: passed.
- Affected lint: passed.
- Full repository suite: **1338/1338 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`452` markdown files, `936` local links checked).

## Verification boundary

This is local rate-limit evidence only. Live gateway traffic, deployed
PostgreSQL locking, Android/device verification and independent security review
remain REVIEW_PENDING or NOT_RUN.
