# Local account-sync runtime dependency boundary evidence — 2026-10-12

## Confirmed finding

The local account-sync runtime assumed that an injected session client and
owner reader had callable shapes. A malformed client could reach token
acquisition, and an owner-reader exception could escape the bounded
`unavailable` result before sync work was attempted.

## Change

The runtime now validates the session client and catches owner-reader failure
before token or network access. It captures the verified owner for the run;
endpoint safety, bearer-only transport and account-scoped sync behavior remain
unchanged.

## Evidence

- Focused test: `tests/domain/account-sync-runtime.test.mjs`
- Result: 5/5 passed, including malformed dependency coverage.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1383/1383 PASS** across **237** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`489` markdown files, `936` local links checked).
- Real authenticated sync/device verification: `NOT_RUN`; independent security
  review: `REVIEW_PENDING`.
