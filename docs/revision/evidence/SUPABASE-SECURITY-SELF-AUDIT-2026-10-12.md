# Supabase security self-audit — 2026-10-12

TASK_STATUS: REVIEW_PENDING

REVIEW_TYPE: Author self-audit only. This is not the independent qualified
security review required before HIGH-risk migration or gateway integration.

DECISION: CHANGES_REQUIRED before any remote migration or Edge deployment.
S1 is remediated locally below; S2 still prevents acceptance or deployment.

## Scope and evidence examined

- Local `supabase/migrations/*.sql`, including private-schema grants/RLS,
  ownership constraints, app-session registry and mutation receipts.
- Local `deep-focus-gateway` entrypoint, provider-claim verification,
  account-bootstrap HTTP admission, session registry and rate-limit composition.
- Current remote `deep-focus-dev` project only through read-only inventory:
  **0 applied migrations**, **0 deployed Edge Functions**, security advisor
  **0 lints**. The advisor result is not a schema-security pass because no
  application schema exists remotely.
- Static backend-contract checker: PASS.
- Focused authorization, migration, bootstrap, app-session and gateway tests:
  **88/88 PASS**. These are synthetic/local tests; they do not prove live RLS,
  real JWT validation or owner isolation in PostgreSQL.

## Findings

### S1 — Bootstrap route bypasses the composed server-side rate limiter

**Severity: HIGH.**

`supabase/functions/deep-focus-gateway/index.ts:81-91` creates the bootstrap
handler separately. The regular authenticated gateway gets a PostgreSQL rate
counter at lines `122-125`, but the early return at lines `131-141` invokes
bootstrap before that runtime. An authenticated caller can therefore repeatedly
call bootstrap without the documented gateway abuse control. Provider claim
verification still occurs, and retry behavior is idempotent, but repeated calls
can consume authentication/database capacity.

**Required fix:** verify provider identity, apply a server-side owner-bound
bootstrap rate limit, then execute bootstrap. The limiter must not trust a body
owner ID or use a raw token as a durable database key. Add denial, retry-window,
same-owner retry and cross-owner isolation tests.

**Local remediation, 2026-10-13:** `bootstrapAuthenticatedAccount` now verifies
and validates the provider claims, consumes the existing PostgreSQL-backed
owner/operation bucket under `actor:<verified-sub>:bootstrapAccount`, and only
then allocates a workspace ID or starts the database transaction. A denied
request becomes a bounded `429 RATE_LIMITED` response with `retry-after`; an
invalid provider claim does not consume a bucket. The focused local tests cover
denial without transaction/workspace work, same-owner retry keys, distinct-owner
keys, invalid claims, safe HTTP error output and the atomic counter SQL contract.
This is synthetic evidence only and remains subject to independent review and
real Edge/PostgreSQL execution.

### S2 — No real database/RLS/Edge runtime evidence exists

**Severity: HIGH release gate.**

The remote project inventory is empty. Thus the local migration SQL has not been
executed against Supabase Postgres, and the Edge gateway has not run in Deno.
The local RLS/grant text and synthetic tests cannot establish that `anon`,
`authenticated`, service-role, direct Data API, expired tokens, revoked sessions
and two isolated owners behave as intended.

**Required fix/evidence:** use an explicitly authorized disposable Supabase
environment after S1 is fixed; apply reviewed migrations; run BE-T01–T10
negative/integration cases with synthetic users; run Supabase security advisors
after DDL; then obtain an independent qualified reviewer decision.

### S3 — Current root TypeScript verification was blocked outside this audit slice

**Severity: MEDIUM build gate.**

At the initial audit, `supabase/functions/_shared/postgres-task-applier.ts:145-234`
failed root typecheck because inferred result rows were `{}` while properties such as
`task_id`, `owner_id`, `goal_owner_id`, `workspace_id`, `id`, `version`, `status`
and `deleted_at` are read. This audit did not edit that user-owned task slice.

**Current status:** `node node_modules/typescript/bin/tsc --noEmit` passed after
the remediation checks. This audit did not modify that task slice and does not
attribute or independently accept its separate changes.

## Positive observations, not deployment approval

- Private tables are authored under `df_private`; the core migration revokes
  schema/table access from public, `anon` and `authenticated`, and grants the
  server role. Later migrations follow the same server-only pattern.
- No `SECURITY DEFINER` function or public/anonymous/authenticated grant was
  found in the local migration scan. The listed immutability trigger functions
  are `SECURITY INVOKER`.
- Gateway configuration rejects missing/unsafe config, keeps database URL and
  cursor secret server-side, validates provider claims, rechecks app sessions
  and emits safe error envelopes.
- Bootstrap and app-session retries preserve the first owner-bound account
  foundation and do not revive revoked/expired app sessions.

## Non-actions

No migration, function deployment, secret/configuration change, user creation,
database query that reads user data, commit or push occurred during this audit.

## Next action

Obtain an independent qualified review of the S1 remediation, then use an
explicitly authorized disposable Supabase environment for S2's real migration,
RLS, owner-isolation and Edge-runtime evidence. Remote execution remains
blocked until those steps are complete.
