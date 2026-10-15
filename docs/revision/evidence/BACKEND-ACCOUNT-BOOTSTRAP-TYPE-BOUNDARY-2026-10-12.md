# Account bootstrap type-boundary evidence — 2026-10-12

## Scope

This slice hardens the local account-bootstrap candidate against runtime type
confusion. Owner and workspace identifiers are checked as strings before UUID
matching. Returned foundation rows and sync-head values are validated before
they are exposed to the domain boundary or used as a successful bootstrap
result.

## Automated evidence

- tests/domain/account-bootstrap.test.mjs: 6/6 passed.
- tests/domain/postgres-account-bootstrap-adapter.test.mjs: 3/3 passed.
- Full suite: 1256/1256 passed; fail/cancel/skip/todo: 0/0/0/0.
- Typecheck: passed.
- Affected lint: passed.
- Documentation checker: passed; 372 markdown files, 19 canonical files,
  936 local links, 80/80 requirements covered, 0 errors.

## Verification boundary

This is local candidate evidence only. Live Supabase SQL/RLS, deployed Edge
runtime, production migration, Android/device verification and independent
security review remain REVIEW_PENDING or NOT_RUN.
