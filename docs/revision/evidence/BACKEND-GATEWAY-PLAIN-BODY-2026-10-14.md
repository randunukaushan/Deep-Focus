# Personal API gateway plain-body boundary — 2026-10-14

## Confirmed finding

The gateway accepted any non-array object as a request body. A non-plain object
such as `Date` could be measured/serialized by one path and canonical-hashed by
another, making replay comparison inconsistent and allowing an unsafe object to
reach dispatch.

## Change

Gateway body admission, sync mutation-body admission and canonical request
hashing now accept only ordinary JSON objects (including null-prototype
objects). Non-plain bodies fail before hashing, authentication dispatch or
handler execution.

## Evidence

- Focused tests: `tests/domain/personal-api-gateway.test.mjs` —
  `15 passed, 0 failed`.
- Typecheck: passed. Affected lint: passed.
- Full suite: `1492 tests, 1483 passed, 0 failed, 9 skipped`.
- Documentation checker: `PASS`; `562` Markdown files, `936` local links,
  `80/80` covered requirements, `0` errors.
- Live API, Auth, RLS and device transport evidence: `NOT_RUN` /
  `REVIEW_PENDING`.
- Independent security review: `REVIEW_PENDING`.

## Boundaries

- No network request, live database, migration, deployment, package
  installation, commit or push was performed.
