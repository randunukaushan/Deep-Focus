# Remote mutation idempotency boundary — 2026-10-14

## Confirmed finding

The remote client only checked whether a mutation idempotency key was truthy.
Malformed runtime values and non-UUID keys could therefore be sent in a
header, and a read request could carry an idempotency key even though the
backend contract reserves that header for writes.

## Change

Mutation requests now require a canonical UUID idempotency key. Read requests
reject a supplied key, and no invalid value reaches the transport layer.

## Evidence

- Focused test: `tests/domain/remote-api-client.test.mjs` — `12 passed, 0 failed`.
- Typecheck and affected lint: passed.
- Full suite: `1481 tests: 1472 passed, 0 failed, 9 skipped`.
- Documentation checker: `PASS`; `551` Markdown files, `936` local links
  checked, `80/80` requirements covered, `0` errors.

## Boundaries

- This is a local request-client contract test; it is not live gateway or
  database idempotency evidence.
- Independent security review and Android/device verification remain
  `REVIEW_PENDING` / `NOT_RUN`.
- No remote database, deployment, merge, push or commit was performed.
