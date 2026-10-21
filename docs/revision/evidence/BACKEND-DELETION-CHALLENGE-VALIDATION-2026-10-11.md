# Backend deletion-challenge validation evidence

## Scope

Added the EX-24 deletion-challenge response foundation. The request is empty,
and the response validates bounded challenge/job IDs, a consequences version,
future challenge expiry and a separately bounded status receipt expiry.

## Safety behavior

- Receipt credentials must have the documented bounded server-secret shape and
  are treated as sensitive values; tests use synthetic data only.
- A receipt cannot outlive the challenge, and expired challenges are rejected.
- This validator does not generate credentials, persist them, freeze an account,
  create a deletion job or authorize status polling.
- Recent auth, account ownership, one-time challenge consumption, secure
  storage/key lifecycle and deletion consequences remain trusted-server gates.

## Verification

- Focused deletion-challenge tests: **3/3 passed**.
- Typecheck: **passed**.
- Targeted source lint: **passed**.
- `git diff --check`: **passed**.

## Pending gates

Recent-auth integration, durable one-time challenge/receipt storage, account
freeze transaction, deletion worker, retention/legal policy, restore
non-resurrection, independent security review and production deletion remain
`REVIEW_PENDING`.
