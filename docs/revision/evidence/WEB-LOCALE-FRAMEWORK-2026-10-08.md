# Public website language framework — 2026-10-08

## Task brief

- Outcome: add a safe, persistent language preference foundation to the local public website without implying that unreviewed page translations are complete.
- Scope: approved V1 website UI/localization lane; Sinhala, Tamil and English are the approved target interface languages. Locale remains separate from country/curriculum. Source: `docs/revision/01-REQUIREMENTS-AND-DECISIONS.md` ADR-008 and `docs/revision/evidence/WEB-FEATURE-STATUS-2026-10-07.md`.
- Risk: MEDIUM, reversible preference/UI behavior; no account, user, or study data is stored. Independent language/accessibility review remains pending.
- Allowed files: `web/src/app/layout.tsx`, `web/src/app/page.tsx`, `web/src/app/actions.ts`, `web/src/app/globals.css`, `web/src/components/site-shell.tsx`, `web/src/components/locale-selector.tsx`, new `web/src/content/locale.ts` and `home-copy.ts`, `web/tests/public-pages.test.mjs`, this evidence and changelog.
- Non-goals: translating legal, commercial, policy, educational or feature page content; account portal, authentication, backend, publication, and language/curriculum inference.
- Behavior: accept only `en`, `si`, `ta`; default to English for absent/invalid cookie; set a same-site, HTTP-only preference cookie, secure in production; preserve only a validated local path after language selection. The root document language and shared shell labels reflect the selected locale.
- Acceptance: locale validator rejects arbitrary values; invalid preference falls back to English; selecting a supported language stores only that enum and returns to a safe local path; shared shell/document language use matching locale labels; no test claims body content is translated.
- Verification: web test suite, web typecheck, web lint, web production build; inspect final diff. Device/native checks are not applicable to this website slice.
- Review: self-review for this bounded preference framework. Human Sinhala/Tamil translation and accessibility review remain `REVIEW_PENDING` before publication.
- Rollback: revert only this isolated locale framework; it does not modify existing saved app data or backend state.

## Implementation record

Status: `IMPLEMENTED` for locale preference, shared shell labels, homepage, personal, education, roadmap, updates and help page copy.

Commercial, legal and feature pages remain English and visibly announce that fallback in the selected language. This is not full website localization. Sinhala/Tamil translation review, font rendering and accessibility checks remain `REVIEW_PENDING`. No public site was deployed.

Checks: website tests 16/16 pass, website typecheck pass, website lint pass, and optimized production build pass on 2026-10-08. The build generated 16 routes including `/account`. The portal uses the approved development project's publishable key only; provider-verified sign-in/sign-out is implemented, while private data sync is not. Local HTTP smoke checks returned 200 and confirmed English, Sinhala and Tamil document language/copy, plus the Sinhala notice on an English-only privacy page. Initial sandboxed build/server were denied access to the Windows workspace path/loopback; scoped local permission allowed verification. Actual browser/device review is `NOT_RUN`.
