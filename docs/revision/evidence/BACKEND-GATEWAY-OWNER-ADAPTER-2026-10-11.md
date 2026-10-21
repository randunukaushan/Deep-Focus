# Gateway PostgreSQL owner adapter — 2026-10-11

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — supplies preflight ownership data to the authenticated gateway

## Outcome

Added `createPostgresGatewayAuthorizationStore()` with a fixed resource-kind to
private-table map. Resource IDs are UUID-validated and passed as SQL parameters;
unknown table names cannot enter the query. Missing rows return `null`, while
foreign, duplicate or malformed returned metadata fails closed.

This adapter is deliberately preflight-only. The trusted mutation/read
handlers continue to repeat actor/owner checks inside their own transaction;
the lookup is not treated as the final authorization decision.

## Verification

- Focused adapter checks: **5/5 PASS**.
- Full regression: **1014/1014 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint checks: **PASS**.
- Documentation checker: **PASS** (`321` Markdown files, `936` local links,
  `80/80` requirements).
- Live PostgreSQL, RLS penetration, concurrent TOCTOU behavior and independent
  security review: `REVIEW_PENDING` / `NOT_RUN`.

No remote database, production migration, deployment, merge or push was used.
