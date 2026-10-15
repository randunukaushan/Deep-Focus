# Sync pull stored-hash verification — 2026-10-11

## Implemented

The PostgreSQL sync pull adapter now reads the stored change hash and
recomputes the canonical hash before returning a change to the client. A
foreign, malformed or tampered private change row fails closed; valid legacy
`focus_session` rows still map to the canonical client `session` kind.

## Actual checks

- Sync pull focused tests: **9/9 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite: **989/989 PASS**.
- Documentation checker: **PENDING**.

## Gates

Live PostgreSQL pull execution, concurrent replay testing, RLS/account-
isolation verification, Android/device verification and independent security
review remain `NOT_RUN`/`REVIEW_PENDING`. No remote database, production
migration, deployment, commit or push was performed.
