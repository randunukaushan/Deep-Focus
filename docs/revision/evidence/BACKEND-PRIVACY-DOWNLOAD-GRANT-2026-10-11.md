# Backend evidence: EX-23 private download-grant admission

Date: 2026-10-11

## Implemented

- Added a local `privacy_download_grants` migration candidate with owner/job
  identity, one-grant-per-job uniqueness, expiry and consumed state.
- Raw grant secrets are not stored; the table accepts only a 64-character
  lowercase SHA-256 digest.
- Added an owner-bound adapter that locks and checks a succeeded export job,
  requires a non-expired artifact, and creates one short-lived grant record.
- Repeated requests for the same owner/job replay the existing expiry and do
  not mint a replacement or silently extend the grant.
- Foreign, failed, expired and malformed jobs fail before grant issuance.

## Evidence

- `tests/domain/postgres-privacy-download-grant-adapter.test.mjs`: succeeded
  job admission, digest-only persistence, replay/no-extension and rejection
  cases.
- `tests/domain/postgres-security-migration-contract.test.mjs`: RLS, client
  role denial, owner/job uniqueness and raw-token exclusion.
- Focused result: 7/7 adapter/migration tests passing.
- Typecheck, targeted lint and `git diff --check`: passing.

## Boundaries

This slice does not generate raw secrets, sign URLs, publish artifacts, serve
downloads or contact a live Supabase database. Exact TTL, recent-auth policy,
artifact host configuration and delivery invalidation still require review.
Live RLS, integration, Android/device and independent security review remain
`REVIEW_PENDING` or `NOT_RUN`.
