# Gateway publishable-key configuration — 2026-10-13

TASK_STATUS: REVIEW_PENDING

RISK: HIGH — Edge configuration selects the application credential used for
provider-claim verification. No credential value was read, written or logged.

## Outcome

The local `deep-focus-gateway` configuration now prefers the current hosted
Supabase `SUPABASE_PUBLISHABLE_KEYS` JSON map and its required `default` entry.
It accepts `SUPABASE_PUBLISHABLE_KEY` only as a single-key local-development
fallback, then the legacy `SUPABASE_ANON_KEY` fallback for explicitly configured
older environments. A malformed configured publishable-key map fails closed; it
does not silently fall back to another environment variable.

The Edge entrypoint passes the selected publishable key only to the configured
Supabase Auth client for verified-claims lookup. Database URL and cursor secret
remain server-only and are not placed in mobile configuration or Git.

## Scope

- Changed: `supabase/functions/deep-focus-gateway/config.ts`, its Edge client
  call site and focused configuration tests.
- Not changed: remote project secrets/settings, migrations, Edge deployment,
  provider settings, user accounts, database data, dependencies, commits or
  pushes.

## Evidence

- Focused gateway/auth/rate-limit checks: 47/47 pass.
- `node node_modules/typescript/bin/tsc --noEmit`: pass.
- `node docs/revision/check-backend-contracts.mjs`: pass. It checks local DTO,
  metadata and SQL text only; it is not live API/auth/RLS evidence.

## Limits and next gate

The hosted Edge environment and real Supabase keys were not accessed. This does
not prove that a hosted function receives the expected map, that provider JWT
verification succeeds, or that RLS/owner isolation works. Those remain subject
to a disposable remote environment, real negative tests and independent security
review before migration or deployment.
