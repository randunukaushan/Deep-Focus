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
