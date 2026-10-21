# Remote API error-code boundary — 2026-10-14

## Confirmed finding

The authenticated remote client treated any server-provided `code` string as a
client error code. Because that response is untrusted, arbitrary or control
character text could cross the error boundary and be exposed to callers.

## Change

Remote error codes are now accepted only when they match the bounded uppercase
identifier format already used by local retry/conflict handling. Invalid or
unbounded server text falls back to `HTTP_<status>`; response messages remain
untrusted and are not copied into the error message.

## Evidence

- Focused test: `tests/domain/remote-api-client.test.mjs` — `13 passed, 0 failed`.
- Typecheck: passed. Affected lint: passed.
- Full suite: `1488 tests, 1479 passed, 0 failed, 9 skipped`.
- Documentation checker: `PASS`; `558` Markdown files, `936` local links,
  `80/80` covered requirements, `0` errors.
- Live API, Auth, server logs and device transport: `NOT_RUN` /
  `REVIEW_PENDING`.
- Independent security review: `REVIEW_PENDING`.

## Boundaries

- No network API call, package installation, live database, migration,
  deployment, commit or push was performed.
