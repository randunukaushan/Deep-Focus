# Profile applier result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed profile rows must not be reported as a successful account mutation.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or deployment.

## Change

The PostgreSQL profile update adapter now rejects sparse or otherwise
non-plain-JSON returned rows before reporting a successful owner-bound profile
update. Existing owner, active-account, optimistic-version and malformed-result
assertions remain unchanged.

## Actual checks

- Focused profile-applier suite: **5/5 pass** (`node --test tests/domain/postgres-profile-applier.test.mjs`)
- Full domain suite: **1447/1447 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 614 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
