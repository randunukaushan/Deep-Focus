# Backend evidence: PostgreSQL sync snapshot worker adapter

Date: 2026-10-11

## Implemented

- Added local `listDue`, `claim`, `complete` and `fail` adapter operations.
- Claim/complete/fail reads lock the owner/job row with `FOR UPDATE` and write
  with owner, job, worker and fencing-version predicates.
- Returned rows are validated against the typed worker state machine before
  they are handed back to callers.
- Transient retry errors are not persisted into `safe_error_code`; terminal
  failure codes remain allowlisted and bounded.

## Evidence

- Adapter and worker focused tests: **8/8 PASS**.
- The malformed-row test confirms invalid returned data fails closed.

## Boundaries

This is a local adapter candidate. No remote SQL execution, scheduler,
source-table reader, live RLS test or independent security review was run.
Those remain `REVIEW_PENDING`/`NOT_RUN`.
