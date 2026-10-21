# Account bootstrap mobile client — 2026-10-12

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING

RISK: HIGH — this is the mobile-to-trusted-API boundary for creating an
authenticated account foundation.

## Outcome

Added `src/features/auth/account-bootstrap-client.ts`. It accepts only an
explicit display-name choice, an already verified user ID and a UUID
idempotency key. It sends no client owner identifier and rejects any bootstrap
response whose profile, workspace or sync-head owner is not the verified local
user. It also rejects malformed response fields before a workspace identity can
be adopted by mobile code.

The helper is intentionally not wired into `AuthProvider` yet. The app does not
currently collect a required first-account display name, and the Edge endpoint
has not been deployed. Existing local account activation therefore remains
unchanged.

## Verification

Focused account-bootstrap client, HTTP admission, app-session and PostgreSQL
adapter tests: **43/43 PASS**.

Documentation checker: **PASS**.

The current full TypeScript command is **FAIL** due to pre-existing changed
`supabase/functions/_shared/postgres-task-applier.ts` result-row type errors
(`task_id`, `owner_id`, `goal_owner_id`, `workspace_id`, `goal_id`, `id`,
`version`, `status`, `deleted_at` on `{}`). This task did not modify that file
and did not suppress or repair those unrelated errors.

## Remaining gates

No Edge Function deployment, migration, provider configuration, remote account
or production data change occurred. Deno/Supabase runtime, real provider,
owner-isolation, installed-device and independent security-review evidence are
all still NOT RUN / REVIEW_PENDING.
