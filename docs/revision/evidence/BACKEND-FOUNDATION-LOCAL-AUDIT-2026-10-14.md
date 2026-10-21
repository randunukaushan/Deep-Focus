# Backend foundation local audit — 2026-10-14

TASK: Reconcile the existing local backend/database foundation before any live
Supabase migration or deployment.

TASK_STATUS: REVIEW_PENDING
RISK: HIGH — auth, ownership, migration, sync and backup boundaries affect
user data and trusted authorization.
DELIVERABLE: Isolated local verification only; no production code, provider
configuration, migration, deploy, commit or push was performed.

## Scope

The repository already contained the candidate backend, database and test work.
This audit did not rewrite it. It exercised the previously implemented
migration/receipt, account-session, sync/outbox, backup/restore, gateway and
secret-boundary suites to identify a reproducible local failure before making a
change. A subsequent manual Edge-entrypoint review found and fixed two local
candidate defects: sync cursor timestamps and account-bootstrap session/rate
limit clocks were captured when a long-lived gateway handler was created. They
are now resolved for each request.

## Acceptance evidence

All commands below used the repository's installed Node runtime and
`--experimental-strip-types`; no package download or installation occurred.

| Boundary | Result | Evidence |
| --- | --- | --- |
| Migration ordering, replay, receipt failure/retry, checksum and lock handling | 21/21 pass | `migration-runner`, `migration-receipt-validation`, `postgres-migration-runner-adapter`, `postgres-migration-receipt-adapter` |
| Session expiry/revocation, retry worker, account switching and sign-out namespace | 53/53 pass | `app-session*`, `request-session`, `auth-session-issuance`, `session-owner-activation`, `sign-out-transition` |
| Pull-before-push, offline retry, duplicate/conflict handling, account switching and SQLite V2 recovery | 71/71 pass | `account-sync-*`, `remote-sync-puller`, `sync-service`, `sqlite-v2-sync-storage`, `sync-pull-apply`, `sync-v2-*` |
| Backup/restore validation, rollback/retry, owner isolation, privacy jobs and download grants | 51/51 pass | `backup-restore`, `postgres-backup-restore-adapter`, `privacy-job-worker`, `postgres-privacy-*` |
| DTO validation, safe logs/errors, secret boundaries, AI/server request boundary, snapshot and V2 push validation | 49/49 pass | `public-secret-scan`, `safe-server-logger`, `gateway-*`, `management-link-validation`, `server-*`, `snapshot-payload-boundary`, `sync-v2-push-validation` |
| Private migration RLS/grant text checks, gateway ownership/session/rate-limit composition and backend/doc contracts | 94/94 pass; backend contract checker PASS; docs checker PASS | `all-private-migrations-security`, `postgres-security-migration-contract`, `migration-safety-contract`, `gateway-*`, `supabase-provider-session-verifier`, `request-session` |
| Mobile public-client configuration, verified account bootstrap, authenticated gateway runtime and provider/session-revocation adapters | 51/51 pass | `supabase-client-config`, `auth-session-identity`, `account-bootstrap*`, `postgres-authenticated-*`, `postgres-account-session-revocation-handler`, `postgres-app-session-revocation-worker-adapter` |

A current focused client/auth/security run also passed **34/34**: email and
OAuth callback boundaries, provider-claim/session issuance, remote API token and
error handling, public-client URL validation, anonymous-claim rejection, and
deployable/public source secret scans. This is local fixture evidence only; it
does not prove hosted provider configuration or live sign-in.

A current sync/recovery run passed **65/65**: owner-bound pull-before-push,
offline retry and outbox retention, account switching, duplicate and conflict
quarantine, atomic SQLite V2 group recovery, signed cursors, and V2 push replay
and epoch-reset handling. It does not prove live multi-device or hosted
PostgreSQL behavior.

A current backup/restore and privacy run passed **61/61**: bounded owner-bound
backup export, corrupt/foreign/oversized artifact rejection, atomic restore
rollback and retry, recent-auth download grants, export-job lease fencing, and
safe retry/terminal-failure reporting. It does not prove a real storage provider,
retention policy, or live deletion execution.

An isolated PGlite PostgreSQL run also passed these current candidate cases:

- full migration-chain bootstrap and unchanged-receipt replay;
- no direct client privileges on private tables;
- composite foreign-key rejection for cross-owner records;
- authenticated owner-A/owner-B task RLS isolation with a test-only fixture
  grant;
- bootstrap receipt rollback/retry and checksum-mismatch rejection.
- an existing private schema with no migration receipt fails closed instead of
  being treated as a safe replay target.
- service-role revocation-outbox writes cannot cross an owner boundary;
- legacy `remaining_units` migration preserves a null historical balance;
- migration advisory locks remain transaction-scoped and release after commit or
  rollback.

The complete PGlite file did not finish within the local command time limit in
one invocation. The remaining PGlite cases are therefore **NOT_RUN in this
audit pass**, rather than inferred from earlier evidence.

Selected continuation runs completed without a download or remote connection:
the five bootstrap/privilege/foreign-key/RLS/receipt-recovery cases passed
**5/5**; the missing-receipt fail-closed case passed **1/1**; and the
revocation-outbox owner isolation, legacy-null preservation and
transaction-scoped advisory-lock cases passed **3/3**. Therefore all nine
current PGlite cases passed as selected individual runs (**9/9**). The one-shot
complete file remains `NOT_RUN`; these selected results do not replace a full
hosted PostgreSQL/RLS rehearsal.

The timestamp fixes are covered by the sync gateway, authenticated gateway
runtime, gateway handler, entrypoint, account-bootstrap HTTP and authenticated
bootstrap suites: **42/42** and **33/33** pass. They preserve verified owner
binding and add a two-request regression case that requires fresh `now` and
expiry reads for each pull, plus Edge-entrypoint wiring coverage for bootstrap
and sync clock placement.

## Prerequisite disposition

| Prerequisite | Current disposition |
| --- | --- |
| Local migration ordering, receipt replay, rollback/retry and owner isolation candidate | Local automated evidence exists; `REVIEW_PENDING` |
| Local gateway configuration, public-key/secret separation and request admission candidate | Local automated evidence exists; `REVIEW_PENDING` |
| Local mobile SQLite/outbox and server sync recovery candidate | Local automated evidence exists; `REVIEW_PENDING` |
| Fresh TypeScript check | PASS — the current deployment-preflight run completed it after the timestamp fixes |
| Targeted local ESLint | PASS for the preflight script and shared gateway runtime/handler files; the Edge entrypoint is not covered because the Expo ESLint resolver cannot resolve its Deno import-map alias `@db/postgres` |
| Full lint and one-shot PGlite suite | `NOT_RUN` here because the local command limit/capture did not produce a trustworthy final result |
| Deno Edge runtime execution | `NOT_RUN` — no local Deno runtime is available |
| Local Supabase Edge serving | `NOT_RUN` — Docker-compatible runtime is unavailable; no install was attempted |
| Hosted Supabase PostgreSQL/RLS/Auth verification | `NOT_RUN` — no project connection, runtime configuration or remote action was authorised |
| Independent qualified security review | `REVIEW_PENDING` |

## Verification limits and next gate

This result does not prove live Supabase Auth, hosted PostgreSQL/RLS, Edge
runtime, provider configuration, Android/iOS behavior or an independent
security review. The current `node scripts/verify-supabase-deployment-prereqs.mjs`
run completed locally: all artifact, migration, recovery, gateway, secret-boundary
and TypeScript checks passed. It intentionally returned
`LOCAL_PREREQUISITES_INCOMPLETE` because ADR-011 is still open and Deno,
Supabase CLI, Docker and PGlite were unavailable in this environment. No remote
action, installation or secret read was performed. The full lint and full PGlite
output capture remain `NOT_RUN` for this audit record. A direct Expo lint attempt
did not return a final result within the command limit. Direct ESLint passed for
the preflight and shared gateway source files, while the Edge entrypoint produced
one resolver error for the Deno-only `@db/postgres` import-map alias. This is a
tooling-configuration limitation, not evidence that the Deno Edge entrypoint ran.
A fresh all-test Node run likewise did not emit its final summary before the
local command limit, including a compact-reporter retry; it is `NOT_RUN` rather
than treated as a pass or failure.

The next dependency-safe action is an independent review of the existing
HIGH-risk diff, followed by an explicitly authorised disposable hosted
environment for real migration/RLS/Edge verification. Until then this candidate
remains `REVIEW_PENDING` and is not deployment-ready.
