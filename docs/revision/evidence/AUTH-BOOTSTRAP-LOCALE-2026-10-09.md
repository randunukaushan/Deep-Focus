# Auth bootstrap loading locale — 2026-10-09

## Implemented

The root auth-gate loading indicator and its live text now use the existing
localized sign-in loading copy instead of hard-coded English. This changes only
the presentation/accessibility text; route decisions, secure session restore
and account binding are unchanged.

## Verification

- Auth routing/identity focused checks: **pass**.
- TypeScript `--noEmit`: **PASS**.
- Affected ESLint with `--max-warnings=0`: **PASS**.
- Bundled runtime suite after this slice: **287/287 PASS**, 0 failed.

## Pending

Real provider runtime verification, independent security review and Android
device verification remain `REVIEW_PENDING`/`NOT_RUN`.
