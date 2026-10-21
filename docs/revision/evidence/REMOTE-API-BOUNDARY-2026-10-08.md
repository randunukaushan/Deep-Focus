# Remote API boundary foundation — 2026-10-08

## Task brief

- Outcome: add a narrow authenticated client boundary for the approved personal
  API contract without claiming that the remote schema, gateway or sync service
  is deployed.
- Scope: validate HTTPS API configuration, require an access token before a
  request, restrict paths to `/v1/`, attach only a bearer token and scoped
  headers, and require an idempotency key for mutations.
- Security boundary: the client never accepts a service-role key, does not log
  tokens, does not infer ownership from an ID, and preserves server error codes
  such as `VERSION_CONFLICT` for caller recovery logic.
- Non-goals: no remote writes, migration execution, local outbox, conflict
  resolution, sync replay, production endpoint, or security-review acceptance.

## Implementation

`src/features/auth/remote-api-client.ts` provides the adapter. It validates the
configured HTTPS origin, rejects unsafe paths/hosts, refuses unauthenticated
requests before calling `fetch`, and requires an idempotency key for `POST`,
`PATCH` and `DELETE`. Successful responses must contain a JSON object; malformed, scalar,
array or undecodable successful responses fail closed with
`REMOTE_RESPONSE_INVALID`. Malformed non-success responses still preserve the
HTTP status fallback so server error handling is not hidden. The approved
development API base is represented only by an environment variable placeholder;
no endpoint was contacted.

## Verification

- Focused boundary tests: **6/6 pass**.
- Root domain/component/navigation tests after this slice: **177/177 pass**.
- Root TypeScript check: pass.
- Root lint: no new error; the existing unused `View` warning in
  `src/app/auth/reset-password.tsx` remains.
- Combined with the web suite: **193/193 pass**.
- No Supabase migration, database write, Edge Function deployment or production
  data operation was performed.

## Follow-up: versioned delete transport — 2026-10-10

The client now supports idempotent `DELETE` requests and an explicitly
validated `Expected-Version` header for the approved versioned delete routes.
No remote endpoint was contacted.

- Remote API + dispatcher focused checks: **15/15 PASS**.
- Full bundled-runtime suite: **687/687 PASS**.
- TypeScript, affected ESLint and documentation checker: **PASS**.

## Review status

The adapter is a local foundation only. Server JWT validation, RLS/API ownership,
idempotent transaction receipts, sync conflict recovery and independent qualified
security review remain `REVIEW_PENDING` before remote integration is accepted.
Native 204/no-body endpoint support is intentionally not inferred by this client
contract and remains a server contract decision.
