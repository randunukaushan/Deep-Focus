# Backend evidence — PostgreSQL task-action applier candidate (2026-10-10)

## Implemented

The local task-action candidate locks the owner-scoped task row, checks the route resource ID and expected version, validates the allowed transition, and updates only the approved lifecycle fields with an optimistic-version predicate. Deleted rows and terminal transition attempts fail closed; the action timestamp is stored for completion/cancellation metadata.

## Verification

- `postgres-task-action-applier.test.mjs`: 3/3 passed.
- Full bundled runtime suite: 461/461 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

This is a local candidate only. No SQL was sent to Supabase, no migration or production data was touched, and the operation is not release-integrated. PostgreSQL/RLS execution, concurrent transition proof, independent security review, and Android/device verification remain `REVIEW_PENDING`.

## Follow-up: returned owner identity contract — 2026-10-10

- Task action SQL now includes `owner_id` in its `RETURNING` list, matching the
  existing fail-closed validation before a success response is created.
- Existing foreign returned-owner regression coverage passes; task-action
  focused checks — **5/5 PASS**.
- Full repository regression — **644/644 PASS**; remote PostgreSQL/RLS,
  independent review and Android/device verification remain
  **NOT_RUN / REVIEW_PENDING**.
