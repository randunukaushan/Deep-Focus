# PostgreSQL snapshot build composition evidence — 2026-10-10

## Outcome

Added a local composition candidate that materializes already-authorized
records, creates server-signed page cursors, and passes the complete immutable
page set to the existing transactional staging adapter. Staging failures
propagate; the composition does not report `ready` itself.

## Acceptance evidence

- `tests/domain/postgres-snapshot-build-adapter.test.mjs`: **4/4 PASS**.
- Covers one-page staging, multi-page signed cursor verification, invalid secret
  rejection before storage and propagation of staging failure.
- Existing materializer and staging tests remain in the full regression suite.
- Full bundled runtime suite after this slice: **582/582 PASS**, 0 failures,
  0 skipped.
- TypeScript `--noEmit`: **PASS**, exit 0; affected ESLint: **PASS**, exit 0.
- Documentation checker: **PASS**, 224 Markdown files, 80/80 requirements,
  no errors. `git diff --check`: exit 0; existing LF/CRLF notices only.
- The local mirror integration regression also passes with a real signed
  two-segment cursor; the validator remains backward-compatible with the
  existing single-segment test fixtures.

## Boundaries

This is not a public snapshot job endpoint and does not claim authorization of
the source records, real PostgreSQL execution, RLS enforcement, secret custody,
retention/cleanup, remote migration or independent security review. Those stay
`REVIEW_PENDING`; no remote or production data was changed.

## Follow-up: staging return contract alignment — 2026-10-10

- The builder harness now models the reviewed staging `RETURNING` contract:
  owner, snapshot identity and ready status are returned together.
- Builder checks — **4/4 PASS**; combined task/sync/snapshot focused checks —
  **27/27 PASS**; full repository regression — **644/644 PASS**.
- Remote job execution, RLS, secret custody, independent review and device
  verification remain **NOT_RUN / REVIEW_PENDING**.
