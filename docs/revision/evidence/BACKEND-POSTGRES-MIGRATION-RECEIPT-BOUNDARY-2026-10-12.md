# PostgreSQL migration-receipt boundary evidence — 2026-10-12

## Scope

The local migration runner now validates receipt result containers before
mapping or accepting migration receipts. Malformed reads and writes cannot be
reported as a successful migration. It also validates the transaction client
before invoking the migration operation callback.

## Automated evidence

- tests/domain/postgres-migration-runner-adapter.test.mjs: 7/7 passed.
- Typecheck: passed.
- Affected lint: passed.
- Full repository suite: **1334/1334 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`450` markdown files, `936` local links checked).

## Verification boundary

This is local migration-runner evidence only. No remote migration was applied;
production data, deployment, Android/device verification and independent
security review remain REVIEW_PENDING or NOT_RUN.
