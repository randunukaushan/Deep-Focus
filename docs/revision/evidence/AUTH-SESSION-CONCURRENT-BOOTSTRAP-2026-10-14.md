# App-session concurrent bootstrap — 2026-10-14

## Confirmed finding

App-session issuance checked for an existing `(owner_id, session_id)` row before
inserting, but concurrent requests could both observe no row. The later insert
could expose a raw uniqueness failure instead of replaying the owner-bound
session record.

## Change

The PostgreSQL app-session adapter now performs an idempotent insert with
`ON CONFLICT (owner_id, session_id) DO NOTHING`. A conflict is followed by a
locked read of the existing row, which is validated for owner, session, status
and timestamps before the transaction returns it. The app-session transaction
layer accepts and revalidates that returned record.

## Evidence

- Focused related tests: `tests/domain/postgres-app-session-adapter.test.mjs`,
  `tests/domain/app-session.test.mjs` and
  `tests/domain/postgres-authenticated-account-bootstrap.test.mjs` —
  `42 passed, 0 failed`.
- Typecheck: passed. Affected lint: passed.
- Full suite: `1489 tests, 1480 passed, 0 failed, 9 skipped`.
- Documentation checker: `PASS`; `559` Markdown files, `936` local links,
  `80/80` covered requirements, `0` errors.
- Live Supabase Auth, PostgreSQL concurrency, RLS and device restart:
  `NOT_RUN` / `REVIEW_PENDING`.
- Independent security review: `REVIEW_PENDING`.

## Boundaries

- No live database, migration application, deployment, package installation,
  commit or push was performed.
- Revocation, expiry and ownership rules remain unchanged; no session is
  revived or reassigned by the conflict path.
