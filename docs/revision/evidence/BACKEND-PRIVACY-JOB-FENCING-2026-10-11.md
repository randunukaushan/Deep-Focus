# Privacy-job lease fencing — 2026-10-11

## Implemented

Privacy export/deletion worker transitions now bind completion and failure
updates to the current `fencing_version` as well as owner, job and lease
owner. Partial lease rows are rejected by the migration, state machine and
PostgreSQL adapter, preventing stale workers from committing after a newer
lease has been issued.

## Actual checks

- Privacy worker/adapter/migration focused tests: **19/19 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite after this slice: **967/967 PASS**.
- Documentation check and `git diff --check`: **PASS**.

## Gates

Live Supabase worker execution, concurrent lease-race testing, privacy-provider
integration, Android verification and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`.
