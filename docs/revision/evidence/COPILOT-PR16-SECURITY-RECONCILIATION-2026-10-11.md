# Copilot PR #16 security reconciliation — 2026-10-11

## Scope

This is a repository-only reconciliation of the supplied Copilot report. No
live Supabase database, production migration, deployment, merge, or Android
device run was performed.

## Findings

| Finding | Repository result | Status |
| --- | --- | --- |
| `.env.example` contains Supabase URL and key | The values were the approved development project URL and an `sb_publishable_` client value, not a `service_role` secret. They were replaced with placeholders; local development values remain outside the example file. RLS and server authorization still need runtime evidence. | Confirmed unnecessary exposure; placeholder fix applied; runtime review pending |
| RLS and two-account isolation lack real database evidence | Migration candidates enable RLS, revoke client table grants, and bind policies/foreign keys to `owner_id`. Contract tests exist, but they do not execute against Supabase with two authenticated accounts. | `REVIEW_PENDING` / `NOT_RUN` |
| Auth revocation lacks real provider-flow evidence | App-session validation covers missing, expired, revoked and owner-mismatched records; sign-out and revocation contracts are tested with adapters. The native auth provider flow now requires a provider-verified subject before opening the local account namespace, stores only a secure matching offline binding, and fences stale auth events. Real Supabase Auth token, restart and account-switch tests were not run. | Local boundary confirmed; live provider/device evidence remains `REVIEW_PENDING` / `NOT_RUN` |
| Offline sync/restart lacks Android evidence | Local SQLite tests cover atomic recovery, replay/duplicate handling, ownership and restart-safe state transitions. No Android network-loss/restart run was performed. | `REVIEW_PENDING` / `NOT_RUN` |
| AI apply token expiry and duplicate apply | Confirmation token and timestamp validation, revoked-session rejection, durable apply receipts, replay checks and safe error boundaries are covered by local contracts. A live provider/database retry run was not performed. | Local contract covered; live provider/database review remains `REVIEW_PENDING` / `NOT_RUN` |
| Sinhala/English/Tamil, accessibility and rendering | Localized copy and accessibility contract tests exist. No complete Android device rendering matrix or independent accessibility review was run. | `REVIEW_PENDING` / `NOT_RUN` |
| Copilot review scope | The supplied report describes a targeted review, not a line-by-line independent security review. | Confirmed limitation |

## Actual checks

- Full repository test suite at the latest verification point: **1225/1225 PASS**.
- Auth-focused tests, including the verified session-owner activation boundary:
  **24/24 PASS**.
- Recent-auth and privacy-download focused tests: **7/7 PASS**.
- Privacy download-grant, migration-contract and privacy-job validation checks:
  **23/23 PASS** on the latest focused run.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Documentation check (`check-docs`): **PASS** (355 Markdown files, 80/80
  requirements covered, 936 local links).
- Slice-scoped diff inspection reported no whitespace diagnostics. The current
  repository-wide `git diff --check` scan is not recorded as a clean pass
  because the Windows process returned an exit anomaly while scanning the
  existing large changelog.
- Public-source server-secret scan: **16/16 PASS**.
- Migration safety/security contract focus: **35/35 PASS**.
- Snapshot restore/delete-tombstone recovery focus: **34/34 PASS**.

The full-suite result includes the provider-session, verified session-owner,
revocation, privacy-job,
export-enqueue, private-download-grant, recent-auth and sync-gateway contract
tests added in this work. These are local contracts; they are not a substitute
for live Supabase, Android or independent security evidence.

## Conclusion

The unnecessary example-file exposure was corrected. No RLS policy defect,
session-validation defect or local sync data-loss defect was confirmed from
repository evidence. The missing runtime/device/independent evidence remains
explicitly gated and must not be described as production security or release
readiness.

## Additional migration-safety check

The local migration manifest guard was reviewed against every current SQL
migration. No executable `DROP TABLE`, `TRUNCATE TABLE` or `DELETE FROM`
statement was found. `ON DELETE RESTRICT` foreign-key clauses and RLS `DELETE`
policies are retention/authorization rules, not destructive migration commands,
so the guard was not broadened in a way that could reject valid existing
migrations. The guard now also rejects schema/table/type/column drops, truncate
variants and `ALTER TABLE ... DROP COLUMN`; approved constraint-replacement
migrations remain allowed and are covered by their own migration contract tests.
The manifest and repository migration contract tests passed in the focused
35-test run after this guard addition; the current full-suite result is
1225/1225.
