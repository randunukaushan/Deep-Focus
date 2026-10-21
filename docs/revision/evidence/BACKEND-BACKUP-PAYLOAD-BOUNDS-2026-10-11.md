# Backup payload bounds — 2026-10-11

## Implemented

The backup digest boundary now rejects canonical UTF-8 JSON payloads over 8
MiB. Both export artifacts and restore payloads pass through the same bound;
an oversized restore fails before the transaction callback. Restore now also
rejects more than 10,000 records before canonical digest work. Existing owner,
record-count, duplicate and digest checks remain unchanged.

## Actual checks

- Backup/restore focused suite: **16/16 PASS**.
- Full repository suite: **1228/1228 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS**.

## Gates

Real backup upload/restore, interrupted recovery, retention policy,
independent security review and production operation remain
`NOT_RUN` / `REVIEW_PENDING`.
