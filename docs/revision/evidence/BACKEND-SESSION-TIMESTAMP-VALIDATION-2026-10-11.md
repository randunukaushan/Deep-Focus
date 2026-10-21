# PostgreSQL app-session timestamp validation — 2026-10-11

The app-session persistence adapter now validates returned registry timestamps
and status semantics: `issued_at` and `expires_at` must be valid and ordered,
`revoked_at` must be valid and not precede issuance, and active/revoked status
must agree with whether `revoked_at` is present. Malformed storage rows fail
closed before session revocation or provider-revocation work is queued.

App-session focused tests: **30/30 PASS**. TypeScript and affected ESLint:
**PASS**. Full repository suite after this slice: **963/963 PASS**.
Documentation check and `git diff --check`: **PASS**.

Live Supabase Auth/session revocation, RLS, device recovery and independent
security review remain `NOT_RUN`/`REVIEW_PENDING`.
