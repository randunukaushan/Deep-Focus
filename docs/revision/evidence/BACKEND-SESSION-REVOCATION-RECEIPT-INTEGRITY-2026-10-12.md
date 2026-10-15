# Session revocation receipt integrity evidence — 2026-10-12

## Confirmed finding

The PostgreSQL account-session adapter previously checked only the owner and
mutation IDs returned by a receipt insert. A changed request hash, session
list, current-session flag or provider status could therefore be reported as
saved without verification.

## Change

The insert now returns and validates the complete receipt. Any mismatch with
the requested value fails closed as `DEPENDENCY_UNAVAILABLE`, preserving the
transaction caller's rollback boundary.

## Evidence

- PostgreSQL app-session adapter tests: **16/16 PASS**.
- TypeScript typecheck and affected ESLint: **PASS**.
- Full repository suite: **1393 PASS, 0 FAIL, 6 SKIPPED** across **239** test
  files. The six skipped tests are the PGlite-backed PostgreSQL integration
  cases, not passing security evidence.
- Docs checker: **PASS** (`496` markdown files, `936` local links checked).
- Live Supabase Auth/session database and independent review:
  `NOT_RUN` / `REVIEW_PENDING`.
