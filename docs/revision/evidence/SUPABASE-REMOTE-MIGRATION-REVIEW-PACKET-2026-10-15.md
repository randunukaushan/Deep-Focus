# Supabase remote migration review packet — 2026-10-15

TASK: Prepare a qualified independent-review packet for the existing Deep Focus
remote migration candidate.

TASK_STATUS: REVIEW_PENDING
RISK: HIGH — schema, RLS, ownership, session, sync and privacy controls.
DELIVERABLE: Review packet only; no migration, Edge deployment, secret change,
commit or push was performed.

## Target and scope

- Authorized disposable development target: `deep-focus-dev`
  (`wffyrevlhnqiycoybqia`), Singapore (`ap-southeast-1`).
- Observed target state on 2026-10-15: `ACTIVE_HEALTHY`; the target was empty
  before the owner-approved development rehearsal. Afterward, all 36 candidate
  migrations are recorded as applied.
- Candidate chain: the 34 ordered SQL files in
  [`supabase/migrations`](../../../supabase/migrations).
- Trust boundary: `df_private` is non-public. Client roles receive no table
  grants; a trusted gateway must derive actor identity from a verified session.

## Evidence available to the reviewer

| Area | Current evidence | Result |
| --- | --- | --- |
| Full local automated suite | `node --test` across every `tests/**/*.test.mjs` file | 1566 pass, 0 fail, 9 skipped |
| Migration order and static RLS/grant checks | `migration-manifest`, `migration-safety-contract`, `all-private-migrations-security`, `postgres-security-migration-contract` | Pass in deployment preflight |
| Local gateway/auth/recovery boundary tests | `scripts/verify-supabase-deployment-prereqs.mjs` | All checked local artifacts, contracts, typecheck and secret boundaries pass |
| Existing isolated PostgreSQL candidate tests | `tests/integration/migration-review-sql.test.mjs` | 9 specified cases pass only when an externally supplied PGlite module is available; currently skipped in the full local suite |
| Target-hosted pre-schema advisors | Supabase security and performance advisors | No findings |

The local preflight remains intentionally `LOCAL_PREREQUISITES_INCOMPLETE`:
ADR-011 retention/hosting/recovery policy is open, and Deno, Docker and the
pinned PGlite module are unavailable locally. Neither absence is represented as
a passing runtime test.

## Unit-boundary reconciliation

The canonical mobile model stores focus durations and `focus_time` targets as
integer seconds. The remote candidate deliberately uses explicit `*_ms` columns
and `target_unit = 'ms'`. This is not an implicit magnitude guess:
`sync-mutation-builders.ts` multiplies the local focus-time target by `1000`
and emits `targetUnit: 'ms'`; the gateway validates that exact unit before a
write. The reviewer must still verify a real remote create/read/sync round trip
does not double-convert, truncate or return milliseconds to a seconds-based
mobile model.

## Required reviewer checks

1. Review every migration for ordered dependencies, forward recovery, duplicate
   receipt handling, transaction scope, RLS, grants, constraints and ownership.
2. Confirm that `anon` and `authenticated` cannot obtain private table access,
   and that service-role paths retain server-side owner checks.
3. Rehearse the whole chain against an isolated hosted PostgreSQL/Supabase
   database using synthetic data; test interruption, retry, duplicate history,
   checksum mismatch and rollback/safe-forward recovery.
4. Verify owner-A versus owner-B isolation for read/write/delete and guessed
   identifiers using real Supabase Auth identities.
5. Inspect all function/view/RPC grants and `SECURITY DEFINER` behavior after
   migration. No review result may treat static tests as hosted proof.
6. Verify seconds-to-milliseconds conversion at every mobile/gateway/read/sync
   boundary with exact values such as `60 seconds` and `3,600 seconds`.
7. Return `APPROVE`, `CHANGES_REQUIRED`, or `BLOCKED`, with file/line evidence
   for every finding.

## Non-goals and current limits

- This packet does not approve deployment or claim production readiness.
- No real user data, database password, service-role secret or publishable key
  is included.
- Edge Function runtime, Supabase Auth provider configuration, Android/iOS
  testing and independent review remain unverified.
- The target received the 36-migration development rehearsal after explicit owner
  authorization. Production acceptance and release deployment remain out of scope.

## Next action

Use this packet and the hosted development evidence for an independent security
review. Do not treat the rehearsal as production approval; resolve the remaining
owner-isolation, gateway-token, unit-round-trip, rollback and independent-review
gates before production use.
