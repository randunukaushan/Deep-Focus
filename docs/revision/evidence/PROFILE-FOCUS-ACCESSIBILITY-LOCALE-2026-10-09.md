# Profile and Focus tab accessibility locale — 2026-10-09

## Implemented

The Profile productivity-profile action and the active-session card on the
Focus tab now use existing localized copy for their accessibility labels. Raw
English labels and raw internal session statuses are no longer announced on
those paths. Navigation and session behavior are unchanged.

## Verification

- TypeScript `--noEmit`: **PASS**.
- Affected ESLint with `--max-warnings=0`: **PASS**.
- Bundled runtime suite after this slice: **287/287 PASS**, 0 failed.

## Pending

Human translation review, native screen-reader verification and Android device
verification remain `REVIEW_PENDING`/`NOT_RUN`.
