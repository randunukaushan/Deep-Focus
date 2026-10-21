# Backend snapshot cursor handler evidence — 2026-10-10

## Outcome

Added a local PostgreSQL composition candidate that accepts an opaque snapshot
page cursor only after validating the trusted actor and path snapshot ID, then
verifies the HMAC cursor and reads the signed page index through the existing
owner-bound page adapter.

## Scope and boundaries

- Allowed implementation: `supabase/functions/_shared/postgres-snapshot-cursor-handlers.ts`
  and its domain test.
- The handler never accepts or trusts a client page index; the test includes an
  extra client field only to prove the signed index wins.
- Invalid, foreign-account, foreign-snapshot, tampered, expired and wrong-secret
  cursors fail before a storage query; unavailable pages return privacy-preserving
  `NOT_FOUND`.
- No public route registry, secret custody/rotation, remote database execution,
  RLS advisor result, production migration, deployment or device evidence is
  claimed here.

## Acceptance evidence

- `tests/domain/postgres-snapshot-cursor-handlers.test.mjs`: **5/5 PASS**.
- Full bundled runtime suite (`tests/domain`, `tests/components`,
  `tests/navigation`, `web/tests`): **572/572 PASS**, 0 failures, 0 skips.
- TypeScript `--noEmit`: **PASS**, exit 0.
- Affected ESLint for the new handler and test: **PASS**, exit 0.
- `node docs/revision/check-docs.mjs`: **PASS**, 221 Markdown files, 936 local
  links, 80/80 requirements covered, no errors.
- `git diff --check`: run after this record; existing line-ending notices are
  not treated as whitespace failures.

## Review status

The implementation is a local candidate only. Public route wiring, real
Supabase/PostgreSQL/RLS execution, secret management and independent security
review remain `REVIEW_PENDING`. No remote or production data was changed and no
commit, push or deployment was performed.
