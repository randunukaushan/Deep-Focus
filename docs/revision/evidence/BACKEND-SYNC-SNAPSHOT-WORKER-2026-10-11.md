# Backend evidence: sync snapshot worker state machine

Date: 2026-10-11

## Implemented

- Added a typed snapshot-job lease/fencing state machine for queued work and
  expired leases.
- Every claim increments the fencing version and binds the lease to one worker;
  foreign or expired workers cannot complete the job.
- Successful completion clears the lease and is terminal.
- Retry scheduling is bounded by caller-supplied times and safe error codes.
  Transient retries clear `safe_error_code`; only terminal failed jobs expose a
  safe code, matching the migration constraint.
- Exhausted attempts fail closed with `ATTEMPTS_EXHAUSTED`.

## Evidence

- Snapshot-worker and existing privacy-worker focused tests: **9/9 PASS**.
- Full repository test suite: **858/858 PASS**.
- Documentation check: **PASS, 80/80 requirements covered**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- `git diff --check`: **PASS**.

## Boundaries

This is the state-machine foundation only. PostgreSQL claim/update adapter,
worker scheduling, source-table reads and remote execution remain
`REVIEW_PENDING`/`NOT_RUN`.
