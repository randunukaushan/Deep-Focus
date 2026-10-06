# Task brief — Progress read failure and retry

```text
TASK: UX-02 follow-up — show a recoverable Progress history read error
STATE: IMPLEMENTED; native interaction/accessibility REVIEW_PENDING
DELIVERABLE: mobile UI and tested read-state helper
REQUIREMENT / PHASE: UX-02 / UX-T24; phase 5 Progress; independent of cloud/rewards
APPROVALS: Home / Plan / Focus / Progress / Profile navigation and local-first
  session storage are owner-approved; no new data or product behavior selected
RISK / REASON: MEDIUM — local history read failure must not masquerade as empty;
  reversible UI-only change, with no persistence writes
REVIEW GATE: self-check complete; Expo platform/screen-reader evidence pending

READ: AGENTS.md; docs/AI_RULES.md; docs/ai/AI_EXECUTION_POLICY.md;
  docs/ai/DEFINITION_OF_DONE.md; docs/ai/ENGINEERING_GUARDRAILS.md;
  docs/DOCUMENTATION_MAP.md; docs/revision/15 §§7–9; docs/COMPONENT_LIBRARY.md;
  docs/revision/07 dependency order
INSPECT: src/app/(tabs)/progress/index.tsx, session history reader and current tests
BASELINE: user-owned dirty repository; 41/41 focused tests, typecheck passed;
  npm/npx lint wrapper unavailable, local ESLint executable available
ALLOWED FILES: Progress route, new progress read-state helper/test, this evidence,
  docs/CHANGELOG.md
NON-GOALS: storage semantics/schema, focus/session history units, analytics
  calculations, navigation, rewards, localization system, native dependency

BEHAVIOR: a successful empty history stays an empty state; a rejected local read
  becomes a generic error state, never exposes internal storage text, preserves
  stored data, and offers retry. Successful retry renders the existing history.
PERSISTENCE: read-only; no rewrite, cleanup, migration or deletion.
FAILURES / EDGES: distinguish empty from failure; repeated route focus retries;
  retry action starts a fresh read; unmounted view ignores late result.
SECURITY / ACCESSIBILITY: generic copy only; labeled live region and explicit
  retry action; native screen-reader announcement/render behavior NOT_RUN.
ACCEPTANCE: tested empty/error distinction and transient failure recovery; the
  route exposes error copy and retry without changing existing metrics.
VERIFICATION: 43/43 focused tests pass, including 2 new helper failure/retry
  cases; TypeScript typecheck exit 0; direct ESLint on the two changed TypeScript
  files and the new test exit 0 (one unnecessary-dependency warning was removed
  before final verification); docs checker passes 56 Markdown files / 910 links;
  git diff --check exit 0 (line-ending notices only). Actual screen rendering is
  not exercised by these synthetic tests.
STOP / OPEN DECISIONS: no product decision needed; actual device/browser matrix
  and independent release review remain open.
```
