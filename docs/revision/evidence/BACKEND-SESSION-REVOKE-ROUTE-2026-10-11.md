# Account Session Revoke Route Evidence — 2026-10-11

EX-27 now has strict route and DTO admission for exactly `one`, `others` and
`all` scopes. The gateway handler is deliberately fail-closed until the
server-side recent-auth verifier and durable idempotent frozen-target receipt
are supplied. Without those dependencies it performs no database access and
cannot revoke a session accidentally.

Verification:

- Focused route/DTO/handler tests: **31/31 PASS**
- Full repository suite: **925/925 PASS**
- TypeScript, affected ESLint, docs checker and `git diff --check`: **PASS**

Live provider revocation, replay-after-new-session, durable receipt/frozen-target
execution, RLS and independent security review remain **REVIEW_PENDING / NOT_RUN**.
