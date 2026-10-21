# PostgreSQL privacy-job row-integrity evidence — 2026-10-12

## Scope

The local privacy-job adapter now validates result containers and rejects null
or duplicate job rows before claiming, completing, failing or listing privacy
work. Owner binding and fencing predicates remain unchanged.

## Automated evidence

- tests/domain/postgres-privacy-job-adapter.test.mjs: 9/9 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local privacy-job evidence only. No real export/deletion job was run;
production data, deployment, Android/device verification and independent
security review remain REVIEW_PENDING or NOT_RUN.
