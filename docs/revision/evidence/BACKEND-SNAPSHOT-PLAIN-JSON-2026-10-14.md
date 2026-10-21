# Snapshot plain-JSON payload boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — this hardens a server-side sync snapshot storage boundary and
prevents runtime values from being silently coerced or omitted before hashing
and persistence.
ACCEPTANCE_CRITERIA_RESULT: snapshot payloads accept bounded finite plain JSON
only: PASS; invalid runtime values are rejected before storage: PASS; existing
snapshot materialization and staging behavior remains green: PASS.
VERIFICATION_STATUS: PASS for the local candidate and regression suite.
REVIEW_STATUS: self-review complete; independent security/RLS review remains
REVIEW_PENDING.
RELEASE_STATUS: NOT_READY — no live database or deployment was used.

## Change

`supabase/functions/_shared/snapshot-payload-boundary.ts` now recursively checks
that values are finite JSON primitives, arrays and plain objects, rejecting
custom prototypes, `Date`, `undefined`, `BigInt`, symbol keys and cycles before
`JSON.stringify` and the UTF-8 size check.  This prevents a value from being
silently converted or dropped while the stored snapshot digest still appears
valid.

`tests/domain/snapshot-payload-boundary.test.mjs` adds regression coverage for
coercion/omission-prone values and cyclic input. `docs/CHANGELOG.md` records the
change.

## Actual checks

- Focused snapshot boundary/materializer/staging/builder tests: **31/31 pass**.
- Full local test command over all `tests/**/*.test.mjs`: **1493 total, 1484
  passed, 0 failed, 9 skipped**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint files: **PASS**.
- Documentation checker: **PASS** — 562 Markdown files, 936 local links, 80/80
  requirements, 0 errors.

## Limits and next gate

No Supabase project, live RLS, real two-account authorization, Android/device
recovery, production migration, deployment, merge, push or commit was performed.
Those checks remain `NOT_RUN` or `REVIEW_PENDING` as applicable. No package or
tool download was performed for this slice.
