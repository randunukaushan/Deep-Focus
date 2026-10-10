# Goal detail locale slice — 2026-10-09

## Implemented

The native Goal detail route now uses the approved `en`, `si` and `ta` copy
layer for loading, read failure, unavailable, editing, progress, delete
confirmation, save/delete recovery and focus actions. Goal storage, ownership,
stale-write protection, confirmation behavior and seconds/minutes conversion
were not changed.

## Verification

- Goal detail component tests: **12/12 pass**.
- TypeScript: **PASS**.
- Affected Expo ESLint: **PASS**.

## Remaining gates

Human translation review, text scaling, screen-reader behavior and Android
device verification remain `REVIEW_PENDING`.
