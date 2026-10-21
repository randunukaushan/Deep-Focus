# Backend privacy-jobs migration evidence

## Scope

Added the local `privacy_jobs` migration candidate for EX-21–25. It stores
owner-bound export/deletion jobs with operation replay identity, lease fencing,
bounded retry state, safe error codes and private artifact metadata.

## Safety behavior

- The migration is transaction-bound and contains no destructive reset, drop or
  delete operation.
- `(owner_id, job_id)` and `(owner_id, operation_id)` preserve account isolation
  and idempotency scope.
- RLS is enabled and public/anonymous/authenticated table access is revoked;
  only the trusted server role receives table grants.
- Raw artifact locators are private server fields and are excluded from the job
  response contract.

## Verification

- Migration contract tests: **3/3 passed**.
- Typecheck: **passed**.
- Targeted lint: **passed**.
- `git diff --check`: **passed**.

## Pending gates

This SQL was not applied to Supabase. Isolated SQL execution, provider/worker
implementation, retention/legal policy, restore/non-resurrection drills,
independent authorization review and production migration remain
`REVIEW_PENDING`.
