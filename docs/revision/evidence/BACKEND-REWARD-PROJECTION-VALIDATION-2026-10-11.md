# Backend reward projection validation evidence

## Scope

Added a local EX-18 projection-envelope validator. It validates the shared
`ProjectionMeta` states and the documented reward summary shape without choosing
an XP formula, level curve, streak policy or achievement catalogue.

## Safety behavior

- `unavailable` requires `asOf`, `sourceSequence`, `ruleVersion` and `summary`
  all to be `null`; fabricated zero rewards are rejected.
- Available projections require a valid instant, decimal source sequence,
  non-empty rule version, valid IANA timezone and safe integer counts.
- Current streak cannot exceed longest streak, and calendar dates are checked
  rather than accepted as arbitrary strings.
- The validator is read-only and does not grant rewards or write a ledger.

## Verification

- Focused validator tests: **3/3 passed**.
- Typecheck: **passed**.
- Targeted source lint: **passed**.
- `git diff --check`: **passed**.

## Pending gates

The XP/level/achievement policy, trusted ledger migration/writer, live RLS and
independent security review remain `REVIEW_PENDING`; no reward values are
claimed to be production-authoritative.
