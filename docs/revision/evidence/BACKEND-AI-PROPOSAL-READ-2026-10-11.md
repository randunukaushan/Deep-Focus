# Backend AI proposal read evidence

## Scope

Added the local EX-33 `GET /v1/ai/proposals/{id}` candidate. It reads through
the existing owner-bound proposal transaction and exposes only the documented
reviewable or applied proposal fields.

## Safety behavior

- The route requires an active authenticated app session and passes the
  verified actor to the owner-bound SQL predicate.
- Missing or foreign proposals are privacy-preserving `NOT_FOUND` results.
- Ready proposals past `expiresAt` return `AI_PROPOSAL_EXPIRED`; applied
  proposals retain their applied receipt state for review.
- The route does not call an AI provider, apply operations, or accept a body.

## Verification

- Focused router, handler-registry and read-handler checks: **30/30 passed**.
- Typecheck: **passed**.
- Source lint: **passed**.
- `git diff --check`: **passed**.

## Pending gates

Live Supabase/RLS isolation, provider/runtime integration, apply integration,
independent security review and device verification remain `REVIEW_PENDING` or
`NOT_RUN`.
