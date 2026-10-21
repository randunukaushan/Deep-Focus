# App/backend connection preparation — 2026-10-19

```text
TASK: Correct the Edge Function transport URL and account-switch guard before activating mobile sync.
STATE: IMPLEMENTED — account connection; full domain sync remains incomplete
DELIVERABLE: bounded code candidate, tests and hosted read-only inventory
REQUIREMENT / PHASE: V1 Phase 2 identity/backend; Phase 8 sync hardening
APPROVALS: Owner requests completing app/backend/database connection on 2026-10-19; target remains deep-focus-dev (wffyrevlhnqiycoybqia).
RISK / REASON: HIGH — bearer credentials and account-owned pending changes.
IMPLEMENTATION ROLE: current agent alone
REVIEW GATE: Owner explicitly waived independent-review prerequisite for this development activation on 2026-10-19; see the dated amendment in revision/01. Self-review and tests still required; no independent review is claimed.
READ: AGENTS.md; AI_RULES; documentation map; execution policy; Definition of Done; engineering guardrails; SECURITY sections 4–5; API auth/ownership requirements; revision 01 development authorization; revision 14 sections 3/6; revision 16 section 11.1.
INSPECT: remote-api-client; account-sync-runtime/boundary/coordinator; sync-service; remote push/pull; local owner registry; Edge gateway entry/config; deployment preflight; existing tests and dirty state.
BASELINE: Existing auth/UI/build changes preserved. API URL absent from .env.local. Supabase get_project confirms ACTIVE_HEALTHY in Singapore, PostgreSQL 17.11. Hosted function list is empty. Read-only pg_tables inventory confirms 37 df_private tables, all with RLS enabled; this does not prove policy correctness.
ALLOWED FILES: src/features/auth/remote-api-client.ts; src/features/sync/account-sync-runtime.ts; scoped auth/backend mobile wiring and related tests; supabase/functions/deep-focus-gateway/index.ts; supabase/functions/_shared/edge-postgres-transaction-runner.ts; tests/domain/edge-postgres-transaction-runner.test.mjs; scripts/smoke-development-backend.mjs (new); this evidence record; docs/revision/01-REQUIREMENTS-AND-DECISIONS.md; docs/CHANGELOG.md; ignored .env.local (public endpoint only).
NON-GOALS: Production writes/release; unrelated accounts/data; new providers/dependencies; paid services; destructive migration.
BEHAVIOR: Keep the full API base path for Edge Function requests. Reject unsafe paths before transport. Stop reading/sending an old account outbox if active identity changes. Never send a different user's session token for the captured account.
PERSISTENCE: No schema or stored-record changes. Pending changes remain local until acknowledged by the server.
FAILURES / EDGES: Missing session, account switch during outbox/session reads, function path prefixes, invalid paths and rejected requests.
ACCEPTANCE: BC-01 nested API path works for GET/POST; BC-02 malformed/escaping paths never reach fetch; BC-03 switch before push leaves outbox untouched; BC-04 mismatched session never sends; BC-05 existing transport/auth tests pass.
VERIFICATION: Installed node --test focused transport/sync tests; installed TypeScript/lint; diff check; hosted read-only inventory.
ROLLBACK / RECOVERY: Revert only scoped candidate changes; no hosted mutations to recover.
STOP / OPEN DECISIONS: Actual integration evidence remains required. Owner waived the independent-review gate for development only; this is not a production readiness claim.
```

The current mobile coordinator consumes the legacy pull DTO and the source also
contains a V2 storage/DTO path. Activation must select and verify the actual
gateway response, initial snapshot recovery and rejected-draft behavior rather
than assuming all existing adapters are interchangeable. The terminal pusher
explicitly rejects `session.terminal`; do not claim focus history is fully synced.

Initial hosted observations used only metadata queries. After explicit development
activation authorization, deployed deep-focus-gateway with verify_jwt=true and
configured six missing custom server secrets using the authenticated local CLI.
Existing credentials were retained; secret values were generated in memory and
never printed. Synthetic adult test identities are marked in app_metadata for
bounded cleanup. Their initial bootstrap failed with 503, despite successful
provider login. The pinned Postgres driver returns native Date and bigint values;
added repository-boundary normalization with precision/date-only regression tests.
Further real-provider verification is in progress, not reported as passing.

## Final account-connection evidence

- Hosted target: deep-focus-dev only; deep-focus-gateway ACTIVE, version 9,
  verify_jwt=true. Bundle SHA-256:
  `ce6c4357e839514821215387b32a33349e4b2fbed44564e63566a203eb4bd928`.
- Six custom Edge secrets were added only when absent. Existing secrets were
  retained. Mobile .env.local gained only the public function URL; .env.example
  now illustrates the function mount. No server credential entered mobile code.
- Real bootstrap initially failed because hosted rate-limit rows and app sessions
  reference profiles. Provisioning now creates the profile/workspace/head and uses
  a transaction-bound rate counter before session issuance, on one connection.
- Fixed `/me` to return the existing ProfileEnvelope contract including the owned
  workspace. Fixed JSONB object-key reordering being treated as a receipt mismatch,
  which had rolled back otherwise successful writes.
- New mobile connection verifies the captured account against its session before
  each request, bootstraps on sign-in/restoration, verifies `/me`, retries on app
  foreground and discards stale results after sign-out/account switch. A generic
  initial display label is used; existing names are preserved by server bootstrap.
- `node --test` over 16 focused transport/auth/database/sync/secret-safety suites:
  143 PASS, 0 FAIL. Suites: account-backend-connection, account-bootstrap-client,
  remote-api-client, account-sync-runtime, account-sync-boundary,
  account-sync-coordinator, edge-postgres-transaction-runner,
  postgres-authenticated-account-bootstrap, postgres-gateway-read-handlers,
  postgres-domain-mutation-adapter, gateway-entrypoint, deep-focus-gateway-config,
  public-secret-scan, deployable-secret-boundary, user-facing-error-safety,
  safe-server-logger (all under tests/domain).
- Installed TypeScript `--noEmit`: PASS. Scoped ESLint: PASS. The Edge-only pinned
  JSR import has a narrowly explained import-resolver annotation; hosted bundling
  resolved it. `node docs/revision/check-docs.mjs`: PASS.
- Final version-9 hosted smoke: 14/14 checks PASS with bearer-only headers matching
  mobile transport. Includes missing-auth 401, password login for two synthetic
  accounts, bootstrap 200, owned profile 200, task creation 201, idempotent replay
  201, own task read 200, foreign task 404, sync pull 200, session revoke 200 and
  revoked-token denial 401. Command:
  `node scripts/smoke-development-backend.mjs --project-ref=wffyrevlhnqiycoybqia`
  with DEEP_FOCUS_SUPABASE_CLI_PATH pointing to the installed authenticated CLI.
- Four generated synthetic fixtures across the diagnostic/final runs have their
  app sessions revoked and profiles disabled; Auth identities are also banned.
  Test records/immutable receipts are retained rather than bypassing ledger guards.

## Remaining boundaries

The account/backend/database connection is implemented and its server path is
tested. This is not full application cloud synchronization: Task/Goal local writes
still do not enqueue domain commands, legacy terminal snapshots are not trusted
session events, and startup snapshot/pull materialization remains incomplete.
The existing outbox is deliberately not blindly activated. Phone/Google callback,
real offline lifecycle and cross-device sync remain NOT_RUN. The owner asked to
defer phone testing. No production readiness or independent review is claimed.

Scope additions made to address observed integration failures: the bootstrap,
read-handler and receipt adapters/tests, the native auth connection hook/client,
ignored mobile endpoint, .env.example, .gitignore for generated Supabase CLI cache,
and the synthetic smoke runner. No migration/schema or unrelated user data changed.
