# Backend privacy job validation evidence

## Scope

Added the EX-21/EX-22 privacy validation foundation. Export requests are
restricted to the documented JSON own-account scope, and privacy job responses
expose only the coarse ID, kind, state, update time and allowlisted safe error
code defined by the contract.

## Safety behavior

- Unknown export scopes and extra inclusion fields are rejected.
- Only export/deletion jobs are accepted by this privacy response validator;
  snapshot jobs remain on the separate snapshot contract.
- Raw URLs, object locators, account content and provider/SQL error details are
  not part of the validated job response.
- This slice does not create a job, export data, issue a download token or
  perform deletion.

## Verification

- Focused privacy validator tests: **3/3 passed**.
- Typecheck: **passed**.
- Targeted source lint: **passed**.
- `git diff --check`: **passed**.

## Pending gates

Recent-auth enforcement, owned durable job storage/worker, consistent snapshot
export, artifact host allowlist, deletion protocol, retention/legal policy,
restore non-resurrection, live database tests and independent review remain
`REVIEW_PENDING`.
