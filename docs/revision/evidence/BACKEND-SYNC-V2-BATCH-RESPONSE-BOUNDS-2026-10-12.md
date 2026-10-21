# V2 batch response bounds — 2026-10-12

## Implemented

The V2 batch receipt runtime and PostgreSQL adapter now bound the UTF-8 JSON
response body to 256 KiB, matching `sync_v2_batch_receipts.response_body`. An
oversized response is rejected before receipt persistence; oversized stored
replay rows and direct adapter writes fail closed; malformed and foreign
replay receipts remain fail-closed.

## Actual checks

- V2 batch receipt focused suite: **6/6 PASS**.
- PostgreSQL V2 batch receipt adapter focused suite: **6/6 PASS**.
- Full repository suite: **1230/1230 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS**.

## Gates

Live PostgreSQL execution, concurrent batch replay, RLS verification and
independent security review remain `NOT_RUN` / `REVIEW_PENDING`.
