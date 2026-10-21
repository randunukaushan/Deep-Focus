# Account bootstrap transaction — 2026-10-11

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — creates the first owner/profile/workspace/sync authorization foundation

## Outcome

Added a dependency-injected account bootstrap candidate. After the provider-side
identity is authorized, it creates or reuses the owner profile, personal
workspace and `sync_heads` row within one transaction. Duplicate retries return
the existing canonical profile name, workspace ID and sequence rather than
overwriting them. The PostgreSQL adapter uses parameterized SQL and validates
every returned owner, kind, version and sequence.

## Verification

- Account orchestration checks: **5/5 PASS**.
- PostgreSQL adapter checks: **2/2 PASS**.
- Full regression: **1009/1009 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint checks: **PASS**.
- Documentation checker: **PASS** (`320` Markdown files, `936` local links,
  `80/80` requirements).

No live database, migration execution, deployment or production data was used.
The candidate remains `REVIEW_PENDING` until PostgreSQL execution, rollback/
restart evidence, real RLS testing and independent security review are complete.
