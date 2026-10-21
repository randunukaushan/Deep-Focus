# Snapshot materializer input type-boundary evidence — 2026-10-12

## Confirmed finding

The pure snapshot materializer applied UUID and decimal validation directly to
runtime input. Null or non-string snapshot/high-water values could throw before
the materialization boundary returned its intended validation error.

## Change

The materializer now checks the input object, requires string UUID and decimal
values, and rejects malformed input before digest callbacks, page generation or
staging. Entity validation and duplicate, payload, digest and cursor checks are
unchanged.

## Evidence

- Focused test: `tests/domain/snapshot-materializer.test.mjs`
- Result: 7/7 passed, including null and unsafe identity/high-water cases.
- Typecheck and affected lint: passed after the change.
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
