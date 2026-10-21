# Backend export download validation evidence

## Scope

Added the EX-23 download-grant validation foundation. The request must be an
empty object, and the response requires an own job ID, a future expiry and an
HTTPS URL on an explicitly configured artifact origin allowlist.

## Safety behavior

- Credentials, unexpected ports, fragments, non-HTTPS and unallowlisted hosts
  are rejected.
- The validator does not issue, refresh or log a download credential.
- Recent authentication, owned succeeded/unexpired export checks and artifact
  ownership must occur in the trusted handler before this response is returned.
- No storage provider, signed URL service or live export artifact was used.

## Verification

- Focused download validation tests: **3/3 passed**.
- Typecheck: **passed**.
- Targeted source lint: **passed**.
- `git diff --check`: **passed**.

## Pending gates

Recent-auth and ownership integration, durable export artifact storage,
provider allowlist configuration, replay/expiry behavior, live database tests,
independent security review and production privacy release remain
`REVIEW_PENDING`.
