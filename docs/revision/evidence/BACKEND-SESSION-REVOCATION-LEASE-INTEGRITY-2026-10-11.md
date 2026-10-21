# Session-revocation lease integrity — 2026-10-11

## Implemented

The session-revocation outbox schema now requires `lease_id` and `lease_until`
to be present together. The worker state machine and PostgreSQL adapter reject
partial lease rows before claim processing, so malformed or manually altered
rows fail closed instead of being treated as valid lease state.

## Actual checks

- Session-revocation worker, adapter and migration-contract tests: **25/25 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite: **967/967 PASS**.
- Documentation check: **PASS**.
- Slice-scoped diff inspection reported no whitespace diagnostics, but the
  repository-wide `git diff --check` process returned a Windows exit anomaly
  while scanning the existing large changelog; this is not treated as a clean
  repository-wide pass.

## Gates

Live Supabase execution, concurrent database lease-race testing, Android
verification and independent security review remain `NOT_RUN`/`REVIEW_PENDING`.
