# Server-side sync pull candidate — 2026-10-10

මෙය verified actor සහ signed cursor binding එකෙන් owner-scoped incremental
sync page එක කියවීමට local Supabase server candidate boundary එකකි. Store එකේ
read operation එක consistent transaction/snapshot එකකින් owner-scoped විය යුතුය;
remote project එකට මෙය deploy කරලා නැත.

## Implemented

- Cursor එකක් නැති පළමු read එක `after = 0` ලෙස ආරම්භ කරයි; page high-water
  එකෙන් අලුත් signed cursor එකක් නිකුත් කරයි.
- Cursor තිබේ නම් owner UUID, page limit, signature සහ expiry verify කර පසුවම
  store read එක කැඳවයි.
- Store එකෙන් ලැබෙන sequence, high-water, entity kind/ID, page size සහ order
  නැවත validate කරයි.
- Store failure එක empty page එකක් බවට පරිවර්තනය නොකර caller වෙත යවයි.
- Client-supplied owner field එකක් භාවිත නොකර verified actor ID එකෙන් read scope
  තීරණය කරයි.

## Actual checks

- Server pull focused tests — **4/4 PASS**.
- TypeScript `--noEmit` — **NOT_RUN after this candidate**; previous slice PASS.
- Affected-file ESLint — **NOT_RUN after this candidate**.
- Full bundled-runtime repository suite — **NOT_RUN after this candidate**;
  previous verified suite **372/372 PASS**.

## Remaining gates

- Real PostgreSQL consistent read, two-account RLS, Edge Function JWT path,
  cursor expiry/retry runtime and cloud integration — **NOT_RUN**.
- Independent security review, deployment and production migration —
  **REVIEW_PENDING**.
