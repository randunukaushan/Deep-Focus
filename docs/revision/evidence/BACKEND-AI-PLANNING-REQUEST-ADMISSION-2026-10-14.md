# AI planning request admission — 2026-10-14

## Confirmed finding

The server AI boundary validated identity and timing fields before reserving
allowance, but the planning request itself was left to the provider. A
malformed request could therefore create an unnecessary reserve/release cycle.

## Change

The canonical planning-request validator is now shared with the providers and
is executed before allowance reservation. Invalid model, time, timestamp or
task inputs fail with `VALIDATION_FAILED` without calling usage or provider
dependencies.

## Evidence

- Focused test: `tests/domain/server-ai-planning-boundary.test.mjs` — `12 passed, 0 failed`.
- Typecheck and affected lint: passed.
- Full suite: `1483 tests, 1474 passed, 0 failed, 9 skipped`.
- Documentation checker: `PASS`; `554` Markdown files, `936` local links,
  `80/80` covered requirements, `0` errors.

## Boundaries

- No AI provider request, paid usage, live database or deployment was used.
- Provider selection, allowance policy and confirmed-apply review gates remain
  unchanged.
- Independent security review remains `REVIEW_PENDING`.
