# Remote token-provider failure boundary — 2026-10-14

## Confirmed finding

The remote API client accepted a typed token provider without a runtime
dependency guard, and an exception from secure token retrieval could escape as
an unredacted caller-visible error.

## Change

The client now rejects a malformed token-provider dependency during composition
and maps token retrieval failures to the existing `401 AUTH_REQUIRED` error
before any network request. The underlying exception is not copied to the
error message or request headers.

## Evidence

- Focused test: `tests/domain/remote-api-client.test.mjs` — `12 passed, 0 failed`.
- Typecheck and affected lint: passed.
- Full suite: `1481 tests: 1472 passed, 0 failed, 9 skipped`.
- Documentation checker: `PASS`; `550` Markdown files, `936` local links
  checked, `80/80` requirements covered, `0` errors.

## Boundaries

- This is a local client boundary test; it is not live Supabase Auth or device
  secure-storage evidence.
- Independent security review and Android/device verification remain
  `REVIEW_PENDING` / `NOT_RUN`.
- No remote database, deployment, merge, push or commit was performed.
