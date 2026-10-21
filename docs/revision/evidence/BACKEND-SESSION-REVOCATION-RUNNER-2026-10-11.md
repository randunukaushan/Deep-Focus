# Provider session-revocation runner candidate — 2026-10-11

The local runner now connects the existing durable outbox state machine to an
opaque provider-revoker callback. It calls the provider only after a lease claim,
passes only owner/session/revocation identifiers, fences completion through the
lease-aware store, and converts untrusted provider failures to bounded
allowlisted error codes before scheduling the existing retry policy.

It does not contain provider credentials, call Supabase remotely, or claim that
provider revocation has run. Live provider execution, worker scheduling and
independent security review remain `REVIEW_PENDING`.

## Actual checks

- Runner, worker and PostgreSQL adapter tests: **12/12 PASS**.
- TypeScript typecheck: **PASS**.
- ESLint for `supabase/functions/_shared`: **PASS**.
- Full repository test suite after integration: **772/772 PASS**.
- Documentation check and `git diff --check`: **PASS**.

The PostgreSQL worker adapter also exposes a bounded `listDue` candidate for
pending or expired-processing rows, ordered by retry time and revocation ID.
It performs no provider call and is not a scheduler; runtime polling remains
`REVIEW_PENDING`.

A bounded batch coordinator now processes that due snapshot through the same
lease-fenced runner, rejects oversized adapter results and invalid worker lease
identities, and does not swallow processing failures. It is still a local
candidate, not a deployed scheduler.

The runner's provider `try/catch` is limited to the provider call. A durable
completion-store failure now propagates instead of being converted into a
provider retry, preventing a false success or misleading retry state.

The adapter also validates the complete job identity/state/lease/error shape at
the database boundary; malformed due rows are rejected before the batch can
hand them to the worker runner.
