# PostgreSQL sync-snapshot materializer boundary evidence — 2026-10-12

## Confirmed finding

The scheduler materializer validated some configuration values but relied on a
downstream builder to reject malformed runners and did not validate digest
callbacks at construction. Null or malformed composition input could therefore
fail outside the intended safe boundary.

## Change

The materializer now validates its input object, transaction runner, digest
callbacks and scheduler configuration before constructing the snapshot flow.
Owner/session binding, source reads and repeatable-read staging remain
unchanged.

## Evidence

- Focused test: `tests/domain/postgres-sync-snapshot-materializer.test.mjs`
- Result: 4/4 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1372/1372 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`464` markdown files, `936` local links checked).
- Real PostgreSQL/Auth integration: `NOT_RUN`; Android/device verification:
  `NOT_RUN`; independent security review: `REVIEW_PENDING`.
