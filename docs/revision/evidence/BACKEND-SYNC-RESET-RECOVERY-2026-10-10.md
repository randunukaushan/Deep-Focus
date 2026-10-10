# Sync reset recovery policy — 2026-10-10

Approved sync contract අනුව stale cursor එක empty success එකක් නොවෙයි.
`SYNC_RESET_REQUIRED` ලැබුණාම නව snapshot bootstrap එකක් ආරම්භ කළ යුතු අතර
local outbox, pending drafts සහ local overlay මැකිය නොහැක. SQLite adapter එක
remote cursor/receipt state පමණක් reset කරයි.

## Implemented

- `SYNC_RESET_REQUIRED` සඳහා cursor reset callback එක පමණක් ධාවනය කර snapshot
  bootstrap decision එක දෙයි.
- `AUTH_REQUIRED` re-authentication, `ACCESS_DENIED`/`ACCOUNT_DISABLED` stop,
  `DEPENDENCY_UNAVAILABLE`/`RATE_LIMITED` retry ලෙස වෙන් කරයි.
- `CURSOR_EXPIRED` list-cursor code එක sync reset ලෙස අනුමාන නොකර fail-closed වේ.
- `resetRemotePullForSnapshot` remote receipts සහ cursor rows මකා snapshot එකට
  නැවත ආරම්භ වීමට ඉඩ දෙයි; පෙර remote mirror සහ local work තාවකාලිකව රකී.

## Actual checks

- Sync recovery tests — **3/3 PASS**.
- Real SQLite reset/ownership/recovery check — **1/1 PASS**; combined focused
  sync/database checks **30/30 PASS**.
- Full bundled-runtime repository suite — **367/367 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.

## Remaining gates

- Real snapshot creation, Android crash/restart recovery and cloud two-account
  integration — **NOT_RUN**.
- Independent security review, device verification and production sync —
  **REVIEW_PENDING**.
