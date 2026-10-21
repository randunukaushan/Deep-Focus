# Snapshot JSONB retry comparison — 2026-10-11

## Implemented

Snapshot staging now compares page payloads using canonical JSON object-key
ordering. Equivalent JSONB data is accepted on retry even if PostgreSQL returns
object keys in a different order; array order and page identity remain strict,
so changed content still produces `IDEMPOTENCY_CONFLICT`.

## Actual checks

- Snapshot staging/read/apply focused tests: **21/21 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite after this slice: **974/974 PASS**.
- Documentation checker after this slice: **PENDING**.

## Gates

Live PostgreSQL JSONB execution, concurrent staging races, Android verification
and independent security review remain `NOT_RUN`/`REVIEW_PENDING`.
