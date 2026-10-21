# AI planning outer-input boundary — 2026-10-14

## Confirmed finding

The server AI planning boundary read request fields directly. Null or array
containers could therefore escape the intended safe validation error as a raw
runtime exception.

## Change

Create and confirmed-apply inputs now require object containers and the
required scalar fields before allowance, provider, session recheck or apply
callbacks are reached.

## Evidence

- Focused test: `tests/domain/server-ai-planning-boundary.test.mjs` — `11 passed, 0 failed`.
- Typecheck and affected lint: passed.
- Full suite: `1482 tests: 1473 passed, 0 failed, 9 skipped`.
- Documentation checker: `PASS`; `553` Markdown files, `936` local links
  checked, `80/80` requirements covered, `0` errors.

## Boundaries

- This is local server-boundary evidence; no OpenAI request, paid usage or
  live database operation was performed.
- Independent security review and provider/device verification remain
  `REVIEW_PENDING` / `NOT_RUN`.
