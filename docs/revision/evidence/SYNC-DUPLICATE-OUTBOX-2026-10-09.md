# Duplicate local outbox hardening — 2026-10-09

Local outbox batch එකේ duplicate `mutationId` තිබුණොත් remote push එකට request
යැවීම නවතා, rows acknowledge නොකර `SYNC_OUTBOX_INVALID` retry state එකක්
තබන validation එකක් එක් කළා. මෙය corrupt local state එකක් server-side
idempotency boundary එකට යාම වැළැක්වීම සඳහාය.

## සත්‍යාපනය

- Sync-focused tests: **8/8 PASS**.
- Bundled-runtime full suite: **242/242 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Real server/RLS, account-switch device flow සහ Android runtime: `NOT_RUN` /
  `REVIEW_PENDING`.
