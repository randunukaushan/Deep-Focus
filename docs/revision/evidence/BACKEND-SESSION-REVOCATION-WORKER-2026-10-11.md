# Provider-revocation worker state candidate — 2026-10-11

## Implemented candidate

- Added a lease/fencing state machine for the session-revocation outbox.
- Due pending work and expired processing leases can be claimed with a new
  lease ID; succeeded and failed rows are not reclaimed.
- Only the current unexpired lease can publish success or record a retry.
- Retry and maximum-attempt values are supplied by the caller; no provider,
  credential, scheduling or spending choice is embedded.
- Provider error values are restricted to safe diagnostic codes and never store
  raw provider messages.

## Verification

- Worker state-machine checks: **5/5 PASS**.
- PostgreSQL worker-adapter checks: **3/3 PASS**.
- Full repository test suite: **765/765 PASS**.
- Real worker/database lease contention, provider sandbox delivery and failure
  reconciliation: `REVIEW_PENDING / NOT_RUN`.

## Boundary

This is a local candidate only. It does not claim a running worker, provider
revocation or production queue, and it does not modify remote data.
