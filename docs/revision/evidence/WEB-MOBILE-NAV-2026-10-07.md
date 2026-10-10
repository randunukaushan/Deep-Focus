# Public-site small-screen navigation — 2026-10-07

```text
TASK: WEB-02 — accessible small-screen navigation
STATE: IMPLEMENTED; browser and assistive-technology review pending
DELIVERABLE: responsive public-site menu disclosure, regression test and evidence
REQUIREMENT / PHASE: required public Website; WEB-02 responsive navigation
APPROVALS: approved Next.js public-site preview; no hosting/publication authority
RISK: LOW — reversible presentational behavior; no private data or persistence
REVIEW: self-review; independent browser/accessibility review remains pending
ALLOWED FILES: web/src/components/site-shell.tsx; web/src/app/globals.css;
  web/tests/public-pages.test.mjs; docs/CHANGELOG.md; this evidence file
NON-GOALS: auth/portal, public policy approval, payment/forms, hosting, locales,
  account data, dependencies, mobile application or deployment
BEHAVIOR: desktop navigation is unchanged. At <=800px a native HTML details/
  summary disclosure shows the same public routes; no script or added package.
  Touch targets are at least 48px and keyboard focus remains visibly outlined.
ACCESSIBILITY: native summary disclosure semantics; visible focus; 48px targets.
  Actual keyboard/browser/screen-reader behavior still needs manual review.
VERIFICATION: `node --test tests/*.test.mjs` — 8/8 PASS;
  `node node_modules/typescript/bin/tsc --noEmit` — PASS;
  `node node_modules/eslint/bin/eslint.js .` — PASS;
  `node node_modules/next/dist/bin/next build` — PASS, 15 static pages generated.
  Browser/device/screen-reader checks are NOT_RUN.
ROLLBACK: restore the prior header/CSS and remove the new test; no data changes.
STOP: browser/screen-reader inspection needs the user's desktop browser-control
  permission; no browser operation was attempted in this slice.
```
