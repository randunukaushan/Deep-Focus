# PostgreSQL download-grant boundary evidence — 2026-10-12

## Scope

The local download-grant adapter now validates runtime token-digest types and
database result containers before issuing or replaying a grant. Owner/job
binding, recent authentication, artifact expiry and non-secret response rules
remain active.

## Automated evidence

- tests/domain/postgres-privacy-download-grant-adapter.test.mjs: 5/5 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local grant-adapter evidence only. No real download grant or export
artifact was issued; production data, deployment, Android/device verification
and independent security review remain REVIEW_PENDING or NOT_RUN.
