# Backend evidence — PostgreSQL profile update candidate (2026-10-10)

## Implemented

The local gateway candidate now supports an owner-bound `patchMe` mutation. It updates only an active profile, requires the expected profile version, rejects unknown or blank/oversized fields, and returns a safe profile DTO. The route already existed; this slice supplies its server-side handler and transaction wiring.

## Verification

- `postgres-profile-applier.test.mjs`: 3/3 passed.
- Gateway handler regression: passed.
- Full bundled runtime suite: 499/499 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

This is a local candidate only. No Supabase connection, remote SQL, migration, production data, or deployment was used. Real RLS execution, concurrency evidence, independent security review, and Android/device verification remain `REVIEW_PENDING`.
