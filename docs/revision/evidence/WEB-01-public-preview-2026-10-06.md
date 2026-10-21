# Task brief — WEB-01/02 public-site preview

```text
TASK: WEB-01/02 — create a truthful public-content preview in the approved web stack
STATE: IMPLEMENTATION CANDIDATE; install/build verified; browser review pending
DELIVERABLE: isolated Next.js routes, responsive shell and public copy
REQUIREMENT / PHASE: V1 public Website; WEB-01 foundation → WEB-02 public content
APPROVALS: Next.js Website/Portal selection; public Website required in V1;
  full productivity Web App is out of scope. Hosting remains unselected.
RISK / REASON: MEDIUM — public information surface, no private/auth/payment data;
  factual/legal/publication risks bounded by explicit preview disclosures
REVIEW GATE: self-review only; browser/accessibility/content review not performed

READ: AGENTS.md; docs/AI_RULES.md; docs/ai/AI_EXECUTION_POLICY.md;
  docs/ai/DEFINITION_OF_DONE.md; docs/ai/ENGINEERING_GUARDRAILS.md;
  docs/DOCUMENTATION_MAP.md; docs/revision/05 §§1–5; docs/revision/17 §§1–5;
  docs/revision/32 Website/Portal scope; official Next.js 16 installation docs
INSPECT: current Expo root/package lock, web surfaces route contract, no prior web app
BASELINE: dirty Expo app retained; Next.js registry metadata: 16.3.8,
  Node >=20.9, React peer ^19.0; exact pinned React 19.2.3 is peer-compatible
ALLOWED FILES: new web/ isolated app; root tsconfig.json to keep its TS boundary
  separate from Expo; docs/revision/17, this evidence, docs/CHANGELOG.md
NON-GOALS: auth/account portal, provider project/configuration, private APIs,
  full productivity web app, legal advice/policy, prices/checkout, support intake,
  ads/analytics, locale certification, hosting/domain/deployment

BEHAVIOR: public pages disclose development status and gated availability;
  never advertise a fake download, price, completed feature, contact channel,
  legal policy or accessibility certification. No submissions or tracking.
PERSISTENCE: no client or server user-data persistence.
FAILURES / EDGES: unknown route → not-found; static content only; responsive
  layout; skip link, semantic landmarks, visible focus and reduced-motion CSS.
SECURITY / PRIVACY: robots noindex; no credentials, forms, third-party assets,
  account pages or private caches. This is not a reviewed security policy.
ACCEPTANCE: all admitted public paths resolve from the content catalogue; gated
  policy/commercial copy discloses unavailability; no account route is faked.
VERIFICATION: Official npm CLI installed isolated web dependencies with lifecycle
  scripts disabled. `node --test --test-reporter=tap tests/*.test.mjs` in web/ —
  6/6 pass, including skip-target and accent-contrast regressions;
  `node node_modules/typescript/bin/tsc --noEmit` in web/ — exit 0;
  `node node_modules/eslint/bin/eslint.js .` in web/ — exit 0; Next.js 16.3.8
  production build — exit 0, 15 static pages generated. Initial build exposed
  incorrect Turbopack root inference due to the monorepo's two lockfiles; pinned
  `turbopack.root` to the isolated web project and reran build. Updated the skip
  target to each route's focusable `<main>` landmark and added a three-route
  regression assertion. Accent text now uses the experience token sheet's
  light/dark primary colors; calculated minimum is 5.75:1 light and 6.06:1 dark
  across sampled page surfaces. Added a contrast regression based on
  [WCAG 2.2 SC 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum). Final web
  suite is 6/6 and the static production build regenerated 15 pages. A local
  Node HTTP smoke check observed `/`, `/features`, `/privacy` → 200 and unknown
  route → 404; each response contains the focusable main target. Next logged
  `NoFallbackError` for the unknown static route but stayed responsive; installed
  Next source shows this sentinel is thrown when a non-prerendered path reaches
  a route configured with `dynamicParams = false`, then handled as not-found.
  Root Expo `node node_modules/typescript/bin/tsc --noEmit` — exit 0; root focused
  ESLint and docs checker pass. Browser interaction/accessibility testing remains
  NOT_RUN; computer-use permission prevented local Chrome inspection, and build
  output is not browser/device/accessibility verification.
STOP / OPEN DECISIONS: exact hosting/domain, publisher/support facts, legal text,
  language review and privacy policy remain outside this candidate.
```

## Dependency security follow-up — 2026-10-06

Official npm CLI 11.21.0 ran fresh full and `--omit=dev` audits from `web/`,
using package names/versions only. Full audit: 5 high findings, all in the
development lint chain (`eslint-config-next` → `@next/eslint-plugin-next` →
`fast-glob` → `micromatch` → `braces` 3.0.3). Production-only audit: 0 findings.
The applicable advisory is [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/ghsa-vfj7-8cjw-p6xm),
which describes stack-exhaustion denial of service for deeply nested brace
patterns and has no patched `braces` release in the affected major line at the
time of this check. This is a vulnerable dev dependency, not a demonstrated
exploit in the website; potential impact is on lint/build tooling if it handles
attacker-controlled patterns. npm's automated suggestion would require an
incompatible Next.js downgrade and was not applied. No website dependency files
changed during the audits. Advisory reachability, actual untrusted-pattern
processing and independent security/browser review remain NOT_VERIFIED; the
zero-production-finding report is not a security certification.

The isolated install created `web/package-lock.json`; root Expo dependencies and
`package-lock.json` were not changed by this website install. Official Next.js
configuration reference for `turbopack.root`: [Turbopack root option](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack).
