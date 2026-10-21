# AI operation executor boundary evidence — 2026-10-12

## Confirmed finding

The AI proposal operation executor accessed `input.transaction.client` before
proving that the outer request and transaction container existed. Malformed
runtime input could therefore bypass the intended bounded validation path.

## Change

The executor now rejects malformed outer and transaction containers before
client or proposal access. The reviewed command catalog, explicit selected
operation requirement, owner-bound task/reminder appliers and sync receipt
writing remain unchanged; no provider or live AI call was added.

## Evidence

- Focused test: `tests/domain/postgres-ai-domain-operation-executor.test.mjs`
- Result: 5/5 passed, including malformed transaction coverage.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1377/1377 PASS** across **237** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`483` markdown files, `936` local links checked).
- Real provider-backed AI integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
