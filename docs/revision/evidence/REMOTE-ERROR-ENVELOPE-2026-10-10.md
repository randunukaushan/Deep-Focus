# Remote error envelope preservation — 2026-10-10

Gateway responses use a safe `{error:{code,messageKey,retryable}}` envelope.
Remote client එක කලින් top-level `code` පමණක් කියවූ නිසා `ACCESS_DENIED` සහ
`VERSION_CONFLICT` වැනි codes fallback HTTP code එකක් වෙන්න ඉඩ තිබුණි. එය
outbox policy එකට වැරදි retry තීරණයකට හේතු විය හැකි නිසා මේ slice එකෙන්
envelope code එක පමණක් කියවා, message එක නොගනී.

## Implemented

- Top-level legacy `code` සහ gateway nested `error.code` දෙකම support කරයි.
- Nested message/provider/database detail එක `RemoteApiError` message එකට copy
  නොකරයි.
- Remote sync pusher එකට `ACCESS_DENIED`/`VERSION_CONFLICT` වැනි safe codes
  ලැබෙන නිසා local outbox quarantine policy එක සමඟ නිවැරදිව සම්බන්ධ වේ.

## Actual checks

- Remote API client tests — **7/7 PASS**.
- Remote sync pusher tests — **6/6 PASS**.
- Full bundled-runtime regression suite — **344/344 PASS**.
- TypeScript `--noEmit` — **PASS**.
- Affected-file ESLint — **PASS**.

## Remaining gates

- Live gateway/Edge response integration, real RLS and PostgreSQL transaction —
  **NOT_RUN / REVIEW_PENDING**.
- Independent security review, Android network evidence and production release —
  **REVIEW_PENDING**.
