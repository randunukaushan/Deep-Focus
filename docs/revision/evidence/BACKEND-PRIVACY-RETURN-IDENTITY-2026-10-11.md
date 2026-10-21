# Privacy-job returned-row identity — 2026-10-11

## Implemented

The PostgreSQL privacy-job adapter now checks the requested owner and job
identity on rows returned from claim, completion and failure transitions. A
foreign returned row fails closed as a dependency error, preserving the
owner-bound worker boundary even if a storage implementation violates the
expected SQL result contract.

## Actual checks

- Privacy worker, adapter and migration focused tests: **17/17 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite after this slice: **969/969 PASS**.
- Documentation checker after this slice: **PENDING**.

## Gates

Live PostgreSQL/Supabase execution, concurrent lease-race testing, Android
verification and independent security review remain `NOT_RUN`/`REVIEW_PENDING`.
