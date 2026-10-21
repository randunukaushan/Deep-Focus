# Backend privacy-job worker evidence

## Scope

Added the local EX-21–25 privacy-job lease/fencing state machine. It claims
due work, reclaims expired leases, increments a fencing version, schedules
safe retries and prevents stale workers from publishing completion.

## Safety behavior

- Retry limits and retry timestamps are injected; no unapproved policy numbers
  are hard-coded.
- Provider failures accept only allowlisted safe error codes and never store raw
  provider text.
- Successful jobs may carry only private server artifact metadata; the public
  job response remains the coarse contract.
- Expired, failed and succeeded jobs cannot be claimed again, and an expired
  or foreign lease cannot complete a job.

## Verification

- Focused privacy worker tests: **5/5 passed**.
- Typecheck: **passed**.
- Targeted source lint: **passed**.
- `git diff --check`: **passed**.

## Pending gates

PostgreSQL adapter/transaction execution, worker scheduling, recent-auth and
ownership checks, artifact storage, retention/legal policy, restore drills,
independent security review and production operation remain `REVIEW_PENDING`.
