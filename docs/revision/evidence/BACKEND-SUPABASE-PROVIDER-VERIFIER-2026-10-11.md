# Supabase Auth provider-token verifier — 2026-10-11

## Implemented candidate

The server boundary now has an adapter for Supabase Auth's provider-verified
`getClaims()` path. It does not use local `getSession()` state or decode an
unverified token. It maps only the verified `sub`, `session_id`, `exp`, `iss`
and `aud` claims into the existing app-session admission boundary, which still
rechecks the owner-bound registry row.

Provider errors, missing claims, malformed UUIDs, whitespace and oversized
tokens fail closed without exposing provider error details.

## Verification

- Provider verifier focused checks: **3/3 PASS**.
- Full repository suite after this slice: **748/748 PASS**.
- TypeScript, affected ESLint, documentation checks and `git diff --check`:
  **PASS**.

## Review boundary

This is a local server candidate. A real Supabase Auth request, real access/
refresh-token lifecycle, revoked-token behavior, RLS execution, Android/device
evidence and independent security review remain `REVIEW_PENDING / NOT_RUN`.
