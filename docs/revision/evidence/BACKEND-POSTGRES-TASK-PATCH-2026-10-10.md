# Backend evidence — PostgreSQL patchTask applier candidate (2026-10-10)

## Implemented

The local `patchTask` candidate binds the update to the verified actor, task ID, and expected version. Only allowlisted mutable fields can be changed; omitted fields remain unchanged while explicit `null` values clear nullable fields. The SQL predicate excludes deleted records and returns a safe version conflict when no matching row is updated.

## Verification

- `postgres-task-patch-applier.test.mjs`: 3/3 passed.
- Full bundled runtime suite: 452/452 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

This is a local candidate only. No remote SQL or migration was executed, no production data was touched, and this operation is not release-integrated. PostgreSQL/RLS execution, independent security review, and Android/device verification remain `REVIEW_PENDING`.

## Follow-up: linked-goal workspace binding — 2026-10-10

- `goalId` වෙනස් කරන patch එකකදී task එක සහ goal එක එකම verified owner
  workspace එකේදැයි transaction client එකෙන් තහවුරු කරයි. නොගැළපුණොත් update
  නොකර `NOT_FOUND` ලෙස fail-closed වේ.
- Task patch, create and authorization focused checks — **12/12 PASS**.
- Remote RLS execution සහ independent review තවම **NOT_RUN / REVIEW_PENDING**.
- Full bundled-runtime repository suite — **605/605 PASS**.
- TypeScript — **PASS**; affected ESLint — **PASS**; documentation checker —
  **PASS** (80/80 requirements, 0 errors).
