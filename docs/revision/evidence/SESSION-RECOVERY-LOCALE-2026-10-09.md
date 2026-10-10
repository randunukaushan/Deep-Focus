# Session recovery locale slice — 2026-10-09

## Implemented

The native interrupted-session recovery screen now uses approved `en`, `si`
and `ta` copy for checking, failure, retry, safe-empty and navigation states.
Session recovery reads, routing, active-session restoration and data-preservation
behavior were not changed.

## Verification

- Recovery copy tests: **2/2 pass**.
- TypeScript: **PASS**.
- Affected Expo ESLint: **PASS**.

## Remaining gates

Human translation review, text scaling, screen-reader behavior and Android
device verification remain `REVIEW_PENDING`.
