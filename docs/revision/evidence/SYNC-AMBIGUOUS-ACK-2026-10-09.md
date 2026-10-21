# Sync ambiguous acknowledgement hardening — 2026-10-09

Local sync response validation එක තද කළා. එකම mutation ID එක accepted සහ
rejected lists දෙකේම පැමිණියහොත්, duplicate ID එකක් පැමිණියහොත් හෝ expected
batch එකට අයත් නොවන ID එකක් පැමිණියහොත් response එක invalid ලෙස සලකයි.

එවැනි අවස්ථාවක local outbox mutation එක acknowledge නොකර retryable
`SYNC_RESPONSE_INVALID` තත්ත්වයක් තබයි. මෙය remote server, database schema,
RLS හෝ production sync integration එකක් නොවේ; local safety boundary එකකි.

## සත්‍යාපනය

- Sync-focused tests: **7/7 PASS**.
- Bundled-runtime full suite: **241/241 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Docs checker: **PASS**.
- Real server/RLS, account-switch device flow සහ Android runtime: `NOT_RUN` /
  `REVIEW_PENDING`.
