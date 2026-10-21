# Break history list candidate — 2026-10-11

Added the local `GET /v1/breaks` read candidate for EX-07. It rechecks the
active app session inside the transaction, binds every query to the verified
owner, orders by `(ended_at DESC, id DESC)`, caps pages at 100 records and uses
an HMAC-signed owner/endpoint/limit/position cursor. The response exposes only
typed break fields and verification state; malformed or foreign-shaped rows
fail closed.

Focused cursor/router/handler tests, full regression tests, typecheck and lint
are the verification evidence for this local candidate. Live Supabase/RLS,
device and independent review evidence remain `NOT_RUN`/`REVIEW_PENDING`.
