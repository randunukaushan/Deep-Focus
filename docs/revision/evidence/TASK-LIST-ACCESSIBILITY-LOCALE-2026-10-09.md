# Task list accessibility locale — 2026-10-09

## Implemented

The active Task row accessibility label now uses the localized `ready` copy
instead of the hard-coded English `pending` status. Archived and completed
labels remain localized, and task completion, add/retry and archive behavior
are unchanged.

## Verification

- Tasks component tests: **5/5 PASS**.
- TypeScript `--noEmit`: **PASS**.
- Affected ESLint with `--max-warnings=0`: **PASS**.
- Bundled runtime suite after this slice: **287/287 PASS**, 0 failed.

## Pending

Human translation review, native screen-reader verification and Android device
verification remain `REVIEW_PENDING`/`NOT_RUN`.
