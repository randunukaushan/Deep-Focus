# Backend auth session issuance — 2026-10-11

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — creates the server-side app-session authorization boundary

## Outcome

Added `issueAppSessionFromVerifiedClaims()` as a local candidate between the
provider claims verifier and the existing transaction-bound app-session store.
It accepts only already verified claims, independently checks issuer, audience,
owner/session UUIDs and future expiry, derives the registry expiry from the
provider claim, and persists one active owner-bound row in the caller's
transaction. It never accepts or decodes a raw access token.

## Acceptance and limits

- Valid verified claims create exactly one registry insert: PASS.
- Issuer/audience/identity/expiry mismatches persist nothing: PASS.
- Raw-token-shaped and malformed input is rejected: PASS.
- Database insertion failure is propagated: PASS.
- Actual Supabase Auth verification, Edge Function request wiring, PostgreSQL
  execution, rollback/restart behavior and independent security review:
  `REVIEW_PENDING` / `NOT_RUN`.

## Checks

Focused test command:

```text
node --test tests/domain/auth-session-issuance.test.mjs
```

Result: **4/4 PASS**.

Repository regression command:

```text
node --test tests/domain/*.test.mjs tests/components/*.test.mjs tests/navigation/*.test.mjs web/tests/*.test.mjs
```

Result: **1002/1002 PASS**.

TypeScript typecheck: **PASS**.

Affected ESLint checks for the new source and test: **PASS**.

Documentation checker: **PASS** (`320` Markdown files, `936` local links,
`80/80` requirements).

No remote database, production migration, deployment, merge or push was
performed. The new helper is implemented and locally verified, but remains
`REVIEW_PENDING` until the provider-backed runtime and independent security
review exist.
