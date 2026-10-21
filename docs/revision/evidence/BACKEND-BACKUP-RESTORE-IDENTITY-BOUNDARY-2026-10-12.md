# Backup and restore identity-boundary evidence — 2026-10-12

## Scope

The local backup and restore admission helpers now reject runtime owner and
digest type confusion explicitly. Existing owner binding, schema checks,
payload digest verification, duplicate detection and non-destructive restore
rules remain active.

## Automated evidence

- tests/domain/backup-restore.test.mjs: 17/17 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local backup/restore evidence only. No real user data was exported or
restored; production data, deployment, Android/device verification and
independent security review remain REVIEW_PENDING or NOT_RUN.
