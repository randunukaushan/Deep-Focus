# Atomic sync pull adapter — 2026-10-10

මෙය local cloud-sync pull boundary එකකි. Cursor එක වෙනම save කරන්නේ නැත;
page data සහ cursor එක එකම `applyPageAtomically` store operation එකකට යවයි.
Actual SQLite mirror/cursor adapter එක දැන් local candidate ලෙස සම්බන්ධ කර ඇත;
remote cursor signature verification සහ cloud runtime එක සම්පූර්ණ කළ බව
නොකියයි.

## Implemented

- Account namespace, cursor length, page size, decimal sequence, allowed entity
  kind/operation සහ UUID entity ID validate කරයි.
- Invalid/oversized page එකක් local store එකට යවන්නේ නැත.
- Store failure එක caller වෙත යන නිසා cursor advancement හෝ false success එකක්
  නොපෙන්වයි; callerට retry කළ හැක.
- SQLite adapter එක sequence receipt hash එකක් තබා එකම replay එක idempotent කරයි;
  වෙනස් payload replay එක fail කරයි.
- Remote entity rows, replay receipts සහ pull cursor එක එක transaction එකකින්
  ලියයි; cursor write failure එකේ ඒවා rollback වේ. Account owner namespace එක
  පමණක් පිළිගනී.

## Actual checks

- `node --experimental-strip-types --test tests/domain/sync-pull-apply.test.mjs` —
  **4/4 PASS**.
- Real SQLite incremental pull/ownership/replay/rollback checks — **1/1 PASS**;
  combined focused checks **26/26 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite — **366/366 PASS**.

## Remaining gates

- Cloud pull with two accounts, interrupted Android restart recovery and
  expired-cursor reset — **NOT_RUN**.
- Independent security review and remote integration — **REVIEW_PENDING**.

## Signed cursor compatibility follow-up

The local page validator now accepts both the existing bounded single-segment
fixture cursor and the server-issued bounded `payload.signature` cursor. The
page and cursor still reach the same atomic store callback, and store failure
still prevents cursor advancement.

- Sync pull apply, server pull, cursor and recovery focused set: **17/17 PASS**.
- Full bundled-runtime suite after this follow-up: **584/584 PASS**, 0 failures,
  0 skipped.
- TypeScript, affected ESLint and docs checker: **PASS**; real cloud/Android
  verification and independent review remain **NOT_RUN/REVIEW_PENDING**.
