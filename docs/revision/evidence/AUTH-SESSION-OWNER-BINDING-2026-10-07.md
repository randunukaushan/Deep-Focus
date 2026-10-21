# Auth session owner binding — 2026-10-07

## Outcome and scope

Prepared an isolated candidate to close a local trust gap in the approved
Supabase account flow: an account namespace should not be selected solely from
cached `session.user.id`. The candidate requires verified JWT claims with a
matching `sub`; when claim verification errors, offline access is limited to
the same owner ID previously bound in SecureStore. This preserves the approved
offline/account-isolation goal in a reviewable proposal.

The candidate is intentionally **not wired into the active `AuthProvider`**.
The current application auth path remains unchanged until independent review
and native checks clear the gate.

No Supabase project settings, credentials, database, migration, sync, or account
data were changed. The candidate defers async verification outside the Supabase
callback and rejects superseded session results. Identity mismatch, absent
claims, unavailable/unreadable binding, and binding write failure deny local
account access.

## Acceptance evidence

- Matching verified claim opens only the matching owner ID.
- A network/claim error may use only the matching previously verified SecureStore
  owner; a different or absent owner is denied.
- Invalid UUIDs, missing/mismatched claim subjects, SecureStore write failure,
  and superseded auth events fail closed.
- Supabase documentation recommends `getClaims()` to verify cached JWT claims.
  The event callback is kept synchronous because Supabase documents a possible
  deadlock when another async Auth call runs inside `onAuthStateChange`.

## Actual checks

- `node --test --test-reporter=tap tests/domain/auth-session-identity.test.mjs tests/domain/auth-service.test.mjs tests/domain/auth-routing.test.mjs` — 16/16 PASS.
- `node node_modules/typescript/bin/tsc --noEmit` — PASS.
- Focused ESLint for changed auth files and test — PASS.
- Native SecureStore, live Supabase JWT, airplane-mode, account-switch, and
  Android installed-build checks — `NOT_RUN`.

## Status and review

HIGH risk because this controls authentication and account-data ownership.
The candidate remains `REVIEW_PENDING`; independent security review is required
before acceptance/integration. The active app path still selects the local
owner from its session ID without this added claim-binding check. Candidate
offline fallback currently treats any
`getClaims()` error as inability to verify and relies on a previously verified
local identity; reviewers must assess revoked/expired-token and shared-device
consequences. This evidence is not a security certification or release approval.

Sources: [Supabase getClaims](https://supabase.com/docs/reference/javascript/auth-getclaims),
[Supabase auth state callback](https://supabase.com/docs/reference/javascript/auth-onauthstatechange),
[Supabase callback deadlock advisory](https://supabase.com/docs/guides/troubleshooting/why-is-my-supabase-api-call-not-returning-PGzXw0).
