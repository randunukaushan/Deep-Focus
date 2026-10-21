# Immutable goal contribution ledger — 2026-10-11

## Implemented candidate

- Added `df_private.goal_contributions` as an owner-bound append-only ledger.
- A contribution is unique per owner, goal, source kind and source ID.
- The local PostgreSQL candidate attributes only verified terminal
  `focus_session` rows to bounded `focus_time` goals and stores actual focused
  milliseconds, including an early-ended session's real focused time.
- Replays return the existing identical contribution; changed history fails
  closed. No client table access, reward balance or XP formula was added.
- `task_completion` is reserved in the schema but is not admitted by this
  slice because its product/rule fixture is not yet approved.

## Verification

- Contribution-applier focused checks: **5/5 PASS**.
- TypeScript, affected ESLint, documentation checks and `git diff --check`:
  **PASS**.
- Full repository suite after this slice: **757/757 PASS**.

## Review boundary

This is a local server candidate. Real PostgreSQL transaction/RLS execution,
concurrent attribution, source-ledger reconciliation, Android/device evidence
and independent security/data review remain `REVIEW_PENDING / NOT_RUN`.
