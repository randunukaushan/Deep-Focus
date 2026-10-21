# Supabase local deployment preflight — 2026-10-13

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING

RISK: HIGH — this preflight protects a future authenticated data migration and
Edge deployment, but it does not perform either action.

## Outcome

Added `scripts/verify-supabase-deployment-prereqs.mjs`, a local, fail-closed
preflight command for the already authored Supabase migration and Edge gateway.
It makes no network request and never applies a migration, deploys a function,
reads local secret values, creates users or writes to a remote project.

## What it verifies

- required local migration and Edge entrypoint artifacts exist;
- an Edge server-environment template lists all required names while actual
  local `.env` files remain ignored and no privileged key placeholder appears;
- gateway configuration rejects incomplete, unsafe or client-exposed server
  values, and the deployable source has no static database credential, Supabase
  secret key or private-key literal;
- migration manifest, migration-safety and private-schema security tests pass;
- the backend contract checker and root TypeScript check pass;
- gateway authorization tests reject foreign, missing and malformed ownership
  metadata before a handler can act;
- gateway session tests reject missing, malformed, anonymous, expired or
  account-switched session identity before any protected action;
- gateway rate-limit tests reject unsafe policy/input, provide a bounded 429
  result and require atomic actor/operation/window counter semantics;
- gateway request-composition tests reject malformed, foreign and revoked
  requests before handlers, and keep diagnostic/internal error details private;
- local Deno and the optional external PGlite module are actually available;
- local Supabase CLI and Docker availability are explicit for the separate
  local Edge Runtime serving gate;
- when Deno is available, the actual Edge entrypoint is checked against its
  function-specific `deno.json` dependency configuration;
- when the PGlite module is configured, its isolated PostgreSQL migration,
  rollback, retry, duplicate and cross-owner checks execute rather than skip;
- with `--runtime`, the required hosted secret names are present without
  displaying their values, including the Supabase URL and each numeric policy
  value consumed by gateway configuration; the gateway's own validator also
  accepts the complete environment without printing its values. The hosted
  variable-name list is exported from the configuration module so the template
  and preflight cannot silently drift from it.
- the unresolved ADR-011 production policy is an explicit failing check;
  retention, hosting region, RPO and RTO are never silently defaulted.

The script returns non-zero until every selected condition is true. It reports
`READY_FOR_EXTERNAL_GATES`, not deploy readiness, when its local checks pass.
The unresolved ADR-011 policy is an explicit failing condition, so optional
runtime tools cannot turn missing retention, region, RPO or RTO decisions into
deployment approval.

## Required later invocation

Run from the repository root only after an explicitly authorised disposable
environment and its server-side configuration exist:

```powershell
node scripts/verify-supabase-deployment-prereqs.mjs --runtime
```

If Deno is intentionally kept outside `PATH`, set `DEEP_FOCUS_DENO_PATH` to a
verified local executable before invoking the preflight. This path is a local
tool reference, not a secret and is never sent to Supabase.

For local Supabase Edge Runtime serving, set
`DEEP_FOCUS_SUPABASE_CLI_PATH` when the CLI is outside `PATH`; Docker (or a
Docker-compatible runtime) must also be available. The preflight verifies that
explicit path as a local file and does not invoke the CLI or `functions serve`.

Do not paste secret values into the command line, terminal transcript, source
or evidence. The command neither validates a remote database nor replaces the
isolated PostgreSQL, RLS, owner A/B, provider, Deno/Edge or independent-review
gates in the core deployment-readiness record.

## Local verification

The base command was run on 2026-10-13. Static migration checks, backend
contract checking, gateway ownership authorization, local provider/session
and rate-limit boundaries, gateway configuration/secret-boundary checks and
request composition, plus TypeScript, passed. It intentionally returned
`LOCAL_PREREQUISITES_INCOMPLETE` because this workspace has no Deno runtime and
no configured external PGlite module; the six PGlite migration tests therefore
remain skipped rather than being treated as passing.

The existing pinned external module was subsequently located in an earlier
isolated runtime cache without installing or modifying a project dependency.
With `DEEP_FOCUS_PGLITE_MODULE` set to that module, the original six integration cases
passed: full candidate-chain replay, rollback/retry and checksum mismatch,
missing-receipt fail-closed behavior, service-role cross-owner outbox rejection,
legacy nullable-balance preservation, and migration advisory-lock release. The
preflight now runs that suite whenever a configured module is present. This is
isolated WASM PostgreSQL evidence, not Supabase-hosted PostgreSQL, Deno/Edge,
provider Auth or real RLS penetration evidence.

The suite now additionally enumerates every candidate `df_private` base table
after the full migration chain and proves neither `anon` nor `authenticated`
has any direct table privilege (`SELECT`, `INSERT`, `UPDATE`, `DELETE`,
`TRUNCATE`, `REFERENCES` or `TRIGGER`), while `pg_class.relrowsecurity` is
enabled for each table. The existing direct-read denial case remains separately
covered for the migration receipt table. This provides local database-grant and
RLS-flag evidence for the direct client entry boundary; Data API, Edge,
provider-token and live RLS behavior remain separate `NOT_RUN` gates.

The original seven isolated cases are verified: six passed in a concurrent run,
and the advisory-lock case passed in a separate filtered run within the same
current migration revision. Two further focused cases also passed against that
same revision, bringing the local isolated migration evidence to nine cases.
This is still local PGlite evidence, not a Supabase-hosted migration or review
decision.

The eighth isolated case verifies the personal-core composite foreign keys reject
cross-owner task→goal and focus-session→task links. Focus-event cross-owner
writes are also blocked by its owner-bound timestamp trigger before the foreign
key check; that trigger behavior is not substituted for an authenticated owner
A/B API case. This is database-integrity evidence only; it does not replace
Edge/API and RLS penetration cases with real authenticated identities.

The ninth isolated case exercises the task RLS policy with a test-only
transaction fixture that grants schema/table SELECT after migration. With the
simulated JWT subject set to owner A or B, each sees only its own task; with the
simulated unauthenticated `anon` role, no task is visible. The candidate
migration itself still grants client roles nothing; this temporary grant exists
solely to exercise the RLS predicate. It is not Data API or live Supabase Auth
evidence.

The gateway configuration regression suite also now verifies that the Edge
entrypoint resolves its PostgreSQL and Supabase client imports only through the
function-local `deno.json`, with exact pinned versions. This protects the local
deployment artifact from accidentally drifting to floating runtime imports; it
does not establish that those dependencies will load in Supabase Edge.

On 2026-10-14, the assembled local gateway security gate passed 88 focused
tests covering request admission/routing, session/provider validation,
owner authorization, rate limiting, server configuration, environment-template
and static-secret boundaries. This is local unit/contract evidence only: it
does not contact Supabase, prove a provider-issued token, serve Deno code or
replace the required isolated hosted-boundary and independent-review gates.

On 2026-10-14, the deployment-preflight policy regression passed (`1/1`). The
actual preflight returned `LOCAL_PREREQUISITES_INCOMPLETE`: migration,
contract, gateway and type checks passed; ADR-011, Deno, Supabase CLI, Docker
and PGlite remained unavailable or unresolved. No remote action occurred.

Supabase CLI `2.120.0` was found in an existing temporary runtime cache, and
its `functions serve` command is available. Docker is not installed in this
workspace, so local Edge Runtime execution remains `NOT_RUN`. No function was
served, linked, migrated, deployed or remotely accessed.

`supabase/config.toml` is deliberately not a preflight requirement: no local
Supabase CLI deployment workflow or approved project configuration file exists
in this repository, and the future remote action can use the provider deployment
boundary without inventing CLI configuration.

`supabase/functions/.env.example` is a Git-safe server configuration template,
not a secret source or a deployed configuration file. It includes only the
gateway's required variable names and safe placeholder values. The local
`supabase/functions/.env` paths are ignored so a later local runtime setup does
not accidentally stage server credentials.

## Files

- `scripts/verify-supabase-deployment-prereqs.mjs`
- `tests/domain/deployment-preflight-policy.test.mjs`
- this evidence file
- `docs/CHANGELOG.md`

## Remaining gates

Independent qualified security review, an explicitly authorised disposable
Supabase environment, real PostgreSQL/RLS/owner-isolation and Edge-runtime
evidence, secrets/configuration setup, and an explicit migration/deployment
approval remain required. No remote action occurred in this task.
