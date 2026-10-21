# Cloud resource intent boundary — 2026-10-09

This slice adds a local pre-upload boundary for the optional paid Cloud
Resources path. It requires an explicit selected resource revision, matching
verified ownership, consent and a server-verified active entitlement. It creates
only an intent; it does not read resource bytes, reserve quota, contact a
provider, charge money or upload/download anything.

## Evidence

- Focused cloud-resource checks: **4/4 PASS**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint check: **PASS**.
- Current bundled-runtime suite: **298/298 PASS**, 0 failures.

## Pending gates

Provider/object API, quota reservation, retention, billing, storage isolation,
independent security review and production acceptance remain pending. The local
adapter fails closed with `CLOUD_RESOURCES_NOT_CONFIGURED`.
