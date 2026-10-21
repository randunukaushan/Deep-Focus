# Backend PostgreSQL privacy-job adapter evidence

## Scope

Added the local PostgreSQL adapter candidate for the privacy-job worker. It
reads due work, locks owner-bound rows, persists lease/fencing transitions and
uses owner plus lease predicates for completion and retry.

## Safety behavior

- Job and owner IDs are validated before database access.
- Returned row ownership, state, lease, retry and artifact metadata are
  validated fail-closed.
- Completion and failure updates require the matching owner, running state and
  lease owner, preventing stale workers from publishing results.
- SQL is only executed through the injected transaction runner; this slice did
  not connect to or mutate Supabase.

## Verification

- Focused PostgreSQL adapter tests: **5/5 passed**.
- Typecheck: **passed**.
- Targeted source lint: **passed**.
- `git diff --check`: **passed**.

## Pending gates

Isolated SQL execution, real RLS/transaction testing, scheduler/provider
integration, retention/legal policy, restore drills, independent security
review and production migration remain `REVIEW_PENDING`.
