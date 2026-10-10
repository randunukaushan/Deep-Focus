# Snapshot mirror installation candidate — 2026-10-10

මෙය stale cursor recovery පසු ලැබෙන immutable snapshot එක local mirror එකට
ගෙන ඒම සඳහා local candidate boundary එකකි. Page validation සම්පූර්ණ වූ පසුව
පමණක් staged-install callback එකක් කැඳවයි; actual SQLite transaction එක දැන්
account-scoped remote mirror table එකකට candidate ලෙස සම්බන්ධ කර ඇත; production
හෝ cloud integration එකක් ලෙස නොසලකයි.

## Implemented

- Owner, snapshot ID, decimal high-water, page order/count සහ opaque cursor
  පරීක්ෂා කරයි.
- සෑම page එකකම digest, final/non-final cursor semantics සහ entity shape
  පරීක්ෂා කරයි.
- Duplicate entity identities, gaps, mixed snapshot metadata සහ digest mismatch
  install කිරීමට පෙර fail-closed වේ.
- Store failure caller වෙත යන නිසා partial success ලෙස report නොකරයි.
- Outbox, active focus session සහ local resources input එකක් නොවන නිසා ඒවාට
  overwrite බලපෑමක් නැත.
- Validated snapshot එකෙන් එක් explicit `applySnapshotAtomically` callback එකකට
  පමණක් entities යවයි; `preserveOutbox` සහ `preserveLocalOverlay` දෙකම
  අනිවාර්ය flags ලෙස contract කර ඇත.
- Local SQLite adapter එක remote mirror rows සහ cursor එක එකම transaction එකකින්
  replace කරයි; domain rows, outbox සහ local overlay rows නොමකයි.
- Cursor write එක fail කළ simulated interruption එකේ පෙර mirror/cursor සහ local
  work නැවත තිබූ බව real SQLite test එකෙන් තහවුරු කළා.

## Actual checks

- Snapshot mirror and apply-boundary focused tests — **6/6 PASS**.
- Real SQLite ownership/mirror transaction checks — **1/1 PASS**.
- Full bundled-runtime repository suite — **365/365 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.

## Remaining gates

- Android lifecycle crash/restart evidence, cloud snapshot API and reapplication
  of a real UI overlay — **NOT_RUN**.
- Cloud snapshot API, two-account isolation, independent security review and
  Android device evidence — **REVIEW_PENDING**.
