# Snapshot page payload bounds — 2026-10-11

## Scope

This slice adds a local, review-gated size boundary for JSON stored in
`df_private.sync_snapshot_pages.payload`. The 256 KiB limit matches the
existing bounded server response policy and is an implementation default, not
a production retention or migration approval.

## Changes

- `snapshot-payload-boundary.ts` measures UTF-8 JSON bytes and fails closed.
- Snapshot materialization rejects an oversized page before digest callbacks.
- PostgreSQL staging rejects it before opening a write and PostgreSQL page
  reads reject an oversized stored row before returning trusted data.
- `20261011340000_sync_snapshot_page_payload_bounds_v1.sql` adds an additive
  `NOT VALID` check only; it was not executed remotely and does not rewrite or
  delete existing rows.

## Actual checks

- Snapshot payload boundary, materializer, staging and page-reader focus:
  **5/5 PASS**.
- Full repository domain/component/navigation/web suite: **1225/1225 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS**.

## Gates

- Existing-row validation, remote PostgreSQL execution, RLS penetration tests
  and independent security review: `NOT_RUN` / `REVIEW_PENDING`.
- No live database, production migration, deployment or commit was performed.
