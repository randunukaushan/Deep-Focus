# Profile authenticated-state locale — 2026-10-09

## Implemented

The signed-in Profile status now joins the localized account message and email
with locale-neutral punctuation, and the sign-out control exposes localized
accessibility labels for idle and in-progress states. Authentication, sign-out
and offline account behavior are unchanged.

## Verification

- Auth identity focused checks: **6/6 PASS**.
- TypeScript `--noEmit`: **PASS**.
- Affected ESLint with `--max-warnings=0`: **PASS**.
- Bundled runtime suite after this slice: **287/287 PASS**, 0 failed.

## Pending

Provider runtime verification, independent security review, human translation
review and Android device verification remain `REVIEW_PENDING`/`NOT_RUN`.
