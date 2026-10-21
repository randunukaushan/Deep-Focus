# Backend deletion-confirmation validation evidence

## Scope

Added the EX-25 deletion-confirmation request foundation. It accepts only the
exact account-bound challenge ID and acknowledged consequences version fields.

## Safety behavior

- Client-supplied job IDs, receipt credentials, owner IDs and arbitrary options
  are rejected.
- The validator does not decide recent-auth, challenge ownership, challenge
  freshness or idempotency; those checks belong in the trusted transaction.
- No account is frozen, no deletion job is created and no data is removed.

## Verification

- Focused deletion-confirmation tests: **2/2 passed**.
- Typecheck: **passed**.
- Targeted source lint: **passed**.
- `git diff --check`: **passed**.

## Pending gates

Recent-auth and challenge-consumption checks, owner-lock transaction, account
freeze, durable deletion worker, retention/legal policy, restore
non-resurrection, independent security review and production deletion remain
`REVIEW_PENDING`.
