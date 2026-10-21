# Settings applier result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed settings rows must not be reported as a successful personalization or AI-preference mutation.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or deployment.

## Change

The PostgreSQL settings update adapter now rejects sparse or otherwise
non-plain-JSON returned rows before mapping the owner-bound settings response.
Existing allowlist, optimistic-version, locale, duration and malformed-result
assertions remain unchanged.

## Actual checks

- Focused settings-applier suite: **4/4 pass** (`node --test tests/domain/postgres-settings-applier.test.mjs`)
- Full domain suite: **1448/1448 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 615 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
