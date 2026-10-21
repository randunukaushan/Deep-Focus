# AI Proposal Apply Gateway Evidence — 2026-10-11

## තත්ත්වය

`EX-32` සඳහා `POST /v1/ai/proposals/{id}/apply` route admission, strict
`ProposalConfirmation` DTO validation, owner/session recheck boundary සහ
transactional apply coordinator wiring candidate එකක් ලෙස එකතු කර ඇත. ඒකට
පසුව canonical first-slice `task.create`, `task.patch` සහ `reminder.create`
commands existing owner-bound appliers හා sync writer වෙත map කරන executor එකද
එකතු කර ඇත.

මෙය live Supabase execution එකක් හෝ production-ready AI domain executor එකක්
ලෙස සලකන්නේ නැත. `applyAiProposalOperations` dependency එක සපයා නැති විට
handler එක `DEPENDENCY_UNAVAILABLE` ලෙස fail-closed වේ. Provider I/O එකක් හෝ
automatic generation/apply එකක් සිදු නොවේ.

## සත්‍යාපනය

- Focused gateway tests: **33/33 PASS**
- Focused executor tests: **3/3 PASS**
- Covered: route/resource binding, exact confirmation fields, digest/version/
  selection bounds, duplicate selection rejection, owner injection rejection,
  missing executor fail-closed behavior, supported command mapping, sync-change
  creation, unsupported-command rejection and target-identity validation.
- TypeScript typecheck: **PASS**
- Latest combined repository suite after migration runner: **925/925 PASS**
- Affected-file ESLint: **PASS**

## තවම `REVIEW_PENDING` / `NOT_RUN`

- Real Supabase transaction with two accounts and RLS.
- Real proposal operation executor applying task/reminder domain writes.
- Token expiry, duplicate apply and concurrent apply against a live database.
- Android/device and independent security review.
