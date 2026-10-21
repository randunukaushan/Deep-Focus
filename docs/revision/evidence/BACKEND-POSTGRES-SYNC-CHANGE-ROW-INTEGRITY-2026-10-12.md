# PostgreSQL sync-change row-integrity evidence — 2026-10-12

## Scope

The local sync-change writer now requires exactly one valid row for each
committed entity, sequence head, inserted change and advanced head result.
Malformed result containers and ambiguous duplicate rows fail before any sync
insert or head update is accepted.
The entry point also validates the transaction client, actor identity and
mutation result container before reading committed data.

## Automated evidence

- tests/domain/postgres-sync-change-writer.test.mjs: 17/17 passed.
- Typecheck: passed.
- Affected lint: passed.
- Full repository suite: **1341/1341 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`452` markdown files, `936` local links checked).

## Verification boundary

This is local adapter evidence only. Live Supabase RLS/transactions, deployed
Edge execution, provider integration, production migration, Android/device
verification and independent security review remain REVIEW_PENDING or NOT_RUN.
