# Public feature status display — 2026-10-07

```text
TASK: WP-03 public content — truthful feature status and evidence registry
STATE: IMPLEMENTED IN LOCAL PREVIEW; independent content/accessibility review pending
DELIVERABLE: structured feature-status records, accessible responsive rendering,
  regression tests and evidence
REQUIREMENT / PHASE: Public Website content lane; independent of private portal,
  auth, billing and mobile database migration
APPROVALS: Owner-approved local Public Website and Account Portal implementation;
  no publication/hosting authority. Required Sinhala/Tamil/English launch locales
  are not represented as supported by this English-only content.
RISK / REASON: LOW–MEDIUM — public-facing product-status claims; locally previewed,
  reversible, no private data or external service
REVIEW GATE: REVIEW_PENDING — owner/product-content and accessibility/browser
  review before publication. No independent reviewer or browser/device evidence
  is claimed.
READ: AGENTS.md; docs/AI_RULES.md; docs/ai/AI_EXECUTION_POLICY.md;
  docs/ai/DEFINITION_OF_DONE.md; docs/ai/ENGINEERING_GUARDRAILS.md;
  docs/DOCUMENTATION_MAP.md; docs/revision/05-WEB-AND-INTEGRATIONS.md;
  docs/revision/17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md §§2, 9;
  docs/revision/32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md
INSPECT: current public-page registry/rendering, actual mobile routes and changelog,
  feature evidence files, Next.js package scripts, existing tests and dirty worktree
ALLOWED FILES: web/src/content/public-pages.ts; web/src/components/content-page.tsx;
  web/src/app/globals.css; web/tests/public-pages.test.mjs; docs/CHANGELOG.md;
  this evidence
NON-GOALS: public release, hosting, account portal/auth, claims of device-verified
  availability, prices, download links, full app localization or promises/dates
BEHAVIOR: Features page shows current status, affected app/site surfaces, status
  date, supporting local evidence reference and null release version. Core focus
  and personal workflows are in development; Plan My Day is a local heuristic
  prototype; the Account Portal/secure sync are planned and unavailable. The
  prototype limitation and no-release condition are visible to users.
ACCESSIBILITY / PRIVACY: semantic section/list/headings, readable text labels beyond
  color, responsive one-column small-screen layout, light/dark contrast fixture;
  no form or user data collection. Actual browser/screen-reader behavior NOT_RUN.
ACCEPTANCE: all four records have unique IDs, allowed lifecycle state, a valid
  evidence file/date and no release version; component renders status and no-release
  text; existing route and contrast tests remain passing.
VERIFICATION: `node --test --test-reporter=tap tests/*.test.mjs` — 9/9 PASS;
  `node node_modules/typescript/bin/tsc --noEmit` — exit 0; direct web ESLint —
  exit 0; `node node_modules/next/dist/bin/next build` — exit 0, all 15 static
  pages generated. Root full suite/typecheck and docs check are recorded for the
  combined working tree; Android/iOS/browser/screen-reader checks NOT_RUN for
  this slice.
ROLLBACK: revert only the structured status records/rendering/styles/tests; no
  external publication or state change
STOP / OPEN DECISIONS: translation review, legal/publisher details, release dates,
  actual availability, website hosting and Account Portal provider-backed flows
  remain pending under their own contracts.
```

## Current local website verification — 2026-10-16

This is a current build check, not a publication or live-provider claim.

- `node --test tests/*.test.mjs` — **19/19 pass**.
- `node node_modules/typescript/bin/tsc --noEmit` — **PASS**.
- `node node_modules/eslint/bin/eslint.js . --max-warnings=0` — **PASS**.
- `node node_modules/next/dist/bin/next build` — **PASS**. Next.js compiled,
  completed TypeScript and generated **16/16** static pages; `/account` remains
  a dynamic server-rendered route.

The local project has no uncommitted website source change in this check. No
hosting, deployment, browser runtime, live provider flow, authenticated private
data, billing, publication, independent content/accessibility review or device
evidence was performed. Those remain **REVIEW_PENDING** or **NOT_RUN** as
applicable.

### Local HTTP smoke check

- The completed local build was served temporarily with `next start` on
  localhost. `GET /` and `GET /account` each returned **HTTP 200** with an HTML
  response. The temporary server was stopped immediately after the check.
- This confirms only the local server route path. It does not establish browser
  behavior, a provider-authenticated portal session, private data access,
  hosting configuration, publication or accessibility-device evidence.

## Account-summary export locale correction — 2026-10-16

The client-generated, portal-visible account-summary JSON now obtains its
privacy note from the selected `en`/`si`/`ta` privacy-copy record. It still
exports no private app data and does not prove provider authentication, cloud
sync, browser accessibility or hosted behavior.

- `node --test tests/*.test.mjs` — **19/19 PASS**.
- TypeScript and ESLint — **PASS**.

## Shared ContentPage status locale correction — 2026-10-16

The reusable public-page review notice, feature-status labels, release-version
fallback and roadmap prompt now use selected `en`/`si`/`ta` copy. This does not
translate page content that remains explicitly marked as English-only, and it
does not change the feature-status data or any release claim.

- `node --test tests/*.test.mjs` — **20/20 PASS**.
- TypeScript, ESLint and `git diff --check` — **PASS**.

## Plans status locale correction — 2026-10-16

The public Plans status page now has selected `en`/`si`/`ta` truthful no-checkout
copy. It still displays no price, checkout, payment data collection or offer.

- `node --test tests/*.test.mjs` — **21/21 PASS**.
- TypeScript, ESLint and `git diff --check` — **PASS**.
