# Server secret and safe-error boundary — 2026-10-10

මෙය Supabase server/Edge Function සඳහා local candidate helper එකකි. Public
Expo/browser bundle එකට ඇතුළත් නොකළ යුතුය; managed secret store එකක් හෝ live
Edge Function runtime එකක් මෙහි සක්‍රිය කරලා නැත.

## Implemented

- `EXPO_PUBLIC_*` සහ `NEXT_PUBLIC_*` නම් server secret ලෙස භාවිත කිරීම
  ප්‍රතික්ෂේප කරයි.
- Secret එක අවම අකුරු 32ක් සහ control-character නැති එකක් විය යුතුය.
- Service endpoint එක HTTPS විය යුතු අතර credentials, query සහ fragment
  තහනම් කරයි.
- Unknown/provider/SQL/stack errors එකම safe `DEPENDENCY_UNAVAILABLE` envelope
  එකකට පරිවර්තනය කරයි; stable allowlisted error codes පමණක් පිටතට යයි.
- Safe diagnostic log record එක event/status/code/retryable/request ID වැනි
  allowlisted fields පමණක් ලබා දෙයි; error object, token හෝ private message
  serialize නොකරයි.

## Actual checks

- `node --experimental-strip-types --test tests/domain/server-boundary.test.mjs` —
  **5/5 PASS**.
- TypeScript — **PASS**.
- Affected-file ESLint — **PASS**.
- Full bundled-runtime repository suite after subsequent slices — **344/344 PASS**.

## Remaining gates

- Managed secret injection, rotation/revocation, log sink inspection and live
  Edge Function runtime — **NOT_RUN**.
- Independent security review and deployment — **REVIEW_PENDING**.
