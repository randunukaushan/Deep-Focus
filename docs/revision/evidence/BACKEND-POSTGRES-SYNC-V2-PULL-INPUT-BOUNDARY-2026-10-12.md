# PostgreSQL V2 sync-pull input boundary evidence — 2026-10-12

## Confirmed finding

V2 pull validation used regular expressions and `BigInt` before proving runtime
input types, and the store checked the app session inside a transaction before
validating the pull request. Malformed input could therefore cause an
unclassified runtime error or unnecessary protected access.

## Change

V2 pull and signed-page inputs now validate object, UUID, decimal, clock, limit
and secret types before session, transaction or query access. Group completeness,
change hashing, privacy-epoch reset and signed cursor semantics remain
unchanged.

## Evidence

- Focused test: `tests/domain/postgres-sync-v2-pull-adapter.test.mjs`
- Result: 8/8 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1387/1387 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`466` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
