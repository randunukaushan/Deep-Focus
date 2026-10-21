# Authenticated account-sync runtime candidate — 2026-10-11

## Scope

This slice adds a local runtime composition around the existing owner-bound
outbox sync boundary. It reads the explicitly configured
`EXPO_PUBLIC_DEEP_FOCUS_API_BASE_URL` and obtains a current provider access token
only when a sync run has due work. The token is transport input; the remote
server must verify it and derive the owner. No app-startup sync, remote
database write, deployment or production migration was performed.

## Safety behavior

- Missing endpoint or missing native Supabase client returns `unavailable` and
  does not read a token or call the network.
- Non-HTTPS endpoints, credential-bearing URLs, query/hash-bearing URLs and
  invalid owner IDs fail before token access.
- The caller supplies the already verified local owner callback; the runtime
  does not accept an owner from the request body.
- Token acquisition failures remain a sync retry state and cannot be reported
  as successful acknowledgement.
- Native `SecureStore` is lazy-loaded only by the app runtime; domain tests use
  an injected client and do not load native modules.

## Actual checks

- Runtime, account-boundary and sync-service tests: **20/20 PASS**.
- Full repository suite: **938/938 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation check and `git diff --check`: **PASS**.

## Gates

This remains a local `REVIEW_PENDING` candidate. Live Supabase Auth/RLS,
provider token verification, Android offline/restart recovery, independent
security review and deployment are `NOT_RUN`; this evidence does not claim
cloud-sync or production readiness.

The related snapshot-restore boundary also has a regression assertion that
delete tombstones remain `payload: null` during restore, so a deleted remote
entity is not recreated by the mirror installation path. This is local
contract evidence, not an installed backup/restore drill.
