# PostgreSQL backup/restore adapter boundary evidence — 2026-10-12

## Implemented

`postgres-backup-restore-adapter.ts` now rejects malformed runner, source and
writer dependencies at composition time. It also rejects a malformed
transaction client before owner-bound export or restore callbacks run. The
existing backup manifest, digest, owner, duplicate-record and atomic
transaction checks remain in `backup-restore.ts`.

## Actual verification

- Focused test: `tests/domain/postgres-backup-restore-adapter.test.mjs`
- Focused result: **8/8 PASS**
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite (latest local run): **1480 tests: 1471 PASS, 0 FAIL, 9 SKIPPED**. The skipped cases are integration-gated tests and are not counted as live-database evidence.
- Docs checker: **PASS** (`549` markdown files, `936` local links checked, `80/80` requirements covered)

## Boundaries

- Local PostgreSQL adapter candidate only; no live database or migration was
  contacted.
- Real backup/restore transaction failure, restart and cross-account RLS
  evidence: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- No production data change, deployment, merge, push or commit was performed.

## Follow-up — 2026-10-14

The adapter now validates export requests and the complete restore artifact
before opening the caller-owned transaction. Foreign or malformed artifacts
therefore produce no transaction call; valid writes still use one atomic
transaction. The focused adapter suite is now **8/8 PASS**. This remains local
candidate evidence only; live PostgreSQL execution and independent review are
still `REVIEW_PENDING`.
