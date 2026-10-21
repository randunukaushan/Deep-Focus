# Versioned Migration Runner Evidence — 2026-10-11

## Implemented

Added a local migration coordinator between the deterministic manifest builder
and the server-only receipt adapter. It validates the complete manifest before
opening any transaction, applies migrations in filename order, saves the
identity/checksum receipt only after the supplied execution callback succeeds,
replays an exact receipt without executing SQL, and rejects a changed checksum,
schema version or authority. A failed execution leaves no receipt so a later
retry can safely run again.

The coordinator does not connect to Supabase, execute repository migrations or
choose a production migration policy. The caller must supply the transaction
boundary and SQL executor.

The matching PostgreSQL runner adapter now supplies that local transaction
shape: it locks and validates an existing receipt, verifies the supplied SQL
checksum before execution, strips only the validated outer `BEGIN`/`COMMIT`
wrapper before sending the body through the same injected client, and validates
the returned receipt after the insert. Empty or nested transaction control is
rejected. It remains a server-only candidate and does not select credentials or
a remote project.

## Verification

- Migration runner tests: **6/6 PASS**
- PostgreSQL migration-runner adapter tests: **5/5 PASS**
- TypeScript typecheck: **PASS**
- Affected ESLint: **PASS**
- Covered: ordering, apply-before-receipt ordering, exact replay, changed
  identity rejection, execution failure/retry, receipt-save failure/retry,
  serialized duplicate invocation and pre-transaction manifest validation.

## Remaining gates

- Actual PostgreSQL migration execution and rollback/restart rehearsal:
  **NOT_RUN / REVIEW_PENDING**
- Independent SQL/security review and production migration authorization:
  **REVIEW_PENDING**
