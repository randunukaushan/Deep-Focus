# RLS update-policy contract — 2026-10-14

## Change

Added a static migration regression for the app-session and sync-snapshot
candidate migrations. Every concrete `UPDATE` policy in those files must keep
an `auth.uid()` owner predicate in both `USING` and `WITH CHECK`, preventing a
future policy edit from silently allowing an authenticated user to reassign a
row to another owner.

## Evidence

- Focused migration contract test: `18 passed, 0 failed`.
- Full suite: `1491 tests, 1482 passed, 0 failed, 9 skipped`.
- Typecheck: passed. Affected lint: passed.
- Documentation checker: `PASS`; `561` Markdown files, `936` local links,
  `80/80` covered requirements, `0` errors.
- This is source-contract evidence only. Live PostgreSQL policy execution,
  Data API access and two-account isolation remain `NOT_RUN` /
  `REVIEW_PENDING`.
- Independent security review: `REVIEW_PENDING`.

## Boundaries

- No SQL was executed, no migration was applied and no remote project was
  changed.
