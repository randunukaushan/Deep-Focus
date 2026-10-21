# Public Website, Account Portal, Future Web App and Integrations

Status: draft contract with approved Next.js Website/Portal and Supabase PostgreSQL/Auth selections. Website and Account Portal are January 1 requirements; full productivity Web App is later. ADR-002 hosting remains OPEN; billing/child/privacy decisions gate affected features. No site or account has been deployed.

Detailed follow-up: [17](17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md) specifies 25
proposed page routes, server-owned auth, page states, ten WP subcards, twenty-four
future browser/security scenarios and the publication/rollback runbook. Shared
backend extensions are in [16](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md). These
refine this outline; they are not a scaffolded web project or deployed services.

## 1. Three different surfaces

| Surface | January status | What it does / does not do |
| --- | --- | --- |
| Public Website | Required | Explain verified features, supported platforms/languages, plans, help, privacy and release information; no fake “live” capabilities |
| Account Portal | Required | Secure profile/preferences, modules/subscriptions, devices/connections, privacy/export/deletion, support; not a full focus/planning UI |
| Full Web App | Later | Browser tasks/goals/planning/timer/history/education/collaboration when approved; requires its own lifecycle/offline/browser QA |

Public website can be reachable without signing in. Portal requires a valid session and API-side permissions. Mobile, portal and future web use one identity and entitlement model; they must not create separate subscriptions/accounts silently.

## 2. Proposed routes and content acceptance

Routes are design proposals, not existing files. Keep public and authenticated layouts separate, even if one deployment hosts them.

| Route proposal | Acceptance / important states |
| --- | --- |
| `/` | Clear value proposition, real screenshots, actual availability; download links only to real release listings |
| `/features` | Separate Available, Beta and Planned; explain offline, AI, privacy and platform limitations |
| `/solutions/personal`, `/solutions/education` | Role-relevant workflows; Sri Lanka education launch boundary and General/Custom option |
| `/plans` | Approved catalog, inclusions/limits, billing period and tax disclosure where applicable; no invented prices |
| `/roadmap` | Planned/Research/In progress/Released; roadmap is not a contractual delivery guarantee |
| `/updates` | User-facing release notes based on completed changes, distinct from engineering templates |
| `/help` and `/contact` | Searchable help or useful index; actual support channel, expected response policy once selected, spam protection |
| `/privacy`, `/terms`, `/data-deletion` | Reviewed, versioned policy; usable account deletion instructions; no compliance badge without evidence |
| `/accessibility` | Supported access features, known limitations and feedback path; no untested conformance claim |
| `/account` | Session-aware overview; loading/error/retry; identity verified from trusted service |
| `/account/profile`, `/account/preferences` | Allowlisted edits; language/theme/motivation/personalisation settings only where shared contracts exist; preview reset |
| `/account/security` | Sessions/devices, sign-out controls and supported auth factors; recent auth for sensitive actions |
| `/account/billing` | Effective entitlements, purchase origin, renewal/end state, manage/restore instructions; no false “cancelled” before provider confirmation |
| `/account/connections` | Provider/scopes/last sync/errors; reconnect and revoke; unavailable connector states honest |
| `/account/privacy` | Data choices, export job states and explicit deletion lifecycle |

No placeholder price or “coming soon” subscription button may perform a real charge. If merchant approval is incomplete, a publicly truthful non-paid launch path needs an explicit owner scope decision; it is not permission to omit the required portal.

## 3. Shared settings boundary

Proposed account allowlist: supported UI language, theme, default focus/break
durations and AI feature visibility preference. Raw personalization answers,
assessment drafts and personal phrases remain local by default, consistent with
[15](15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md); transmitting them requires a
separate approved opt-in data contract. This corrects the earlier broad assumption
that all of them would be server account preferences. AI visibility is not consent
to send context or incur usage. Device preferences include OS permission grants,
biometric availability, installed notification schedules, sound/haptics/downloads
and local resource references. Label “this device” versus “your account”. Portal
cannot grant mobile permissions or pretend to edit a phone's local-only collection.

Theme can have account preference plus device override; preview the precedence before implementation. Changing an account default must not modify an in-progress focus session. Use the version conflict contract from [04](04-BACKEND-SECURITY-AND-SYNC.md); do not allow two forms to silently overwrite each other's fields.

## 4. Website/portal architecture and security

Next.js is the approved framework for these surfaces; the hosting vendor and exact build/package versions are not selected. Reuse TypeScript DTO/schema packages only after the repo structure decision; do not move the existing app into a monorepo automatically. A small separate web directory/workspace can be proposed with explicit build/dependency impact. Public rendering/static assets and private data access have distinct caching rules.

- Authorisation at server/API data access for every private request and mutation. Never rely on route hiding or a client-only redirect.
- Private pages/responses must not leak through shared CDN caches, analytics, URL query strings or static generation.
- Approved auth library/session design: secure HttpOnly cookies where appropriate, HTTPS, SameSite/CSRF controls, short-lived sessions with refresh/revocation handling, CSP and safe redirects. Do not put tokens in ordinary browser localStorage merely for convenience.
- Forms: server validation, accessible errors, rate limits, anti-enumeration and duplicate submission handling. State-changing GET routes are prohibited.
- Public search indexing must exclude account/private content; sitemap/canonical links cover public pages only. Robots directives are not authorisation.
- No marketing tracker, AI pixel or session replay inside private focus/education/account content by default. Consent and retention must match actual configured telemetry.
- Development/staging is non-production; no production keys in preview deployments. Preview access and indexing policy need verification.

Define domain/DNS ownership, transactional-email sender, support inbox and legal publisher details before launch. These require owner inputs, not fabricated contact addresses. DNS purchase, account creation, paid hosting and production publication require separate authority.

## 5. January website/portal task chain

WEB-01: approve routes/framework/data boundaries → scaffold with approved versions and reproducible build.

WEB-02: implement public design system, verified content and mobile-responsive navigation → contrast/keyboard/localisation/link QA. Avoid claiming features merely planned in the enterprise inventory.

WEB-03: integrate staging auth → sign-in/out, recovery, session expiry, redirects, two-user isolation; never accept cosmetic form success.

WEB-04: profile/preferences/security/privacy → versioned edits, pending/export/delete states, device/account distinction and sensitive-action re-authentication.

WEB-05: billing view and provider-authorised management → catalog, effective rights, restore/linking flows, sandbox upgrade/cancel/refund cases. Block production checkout until ADR-005/010 and verification pass.

WEB-06: release preview → domain/email/TLS/content/security checks → owner approves production deployment → smoke checks/monitoring/rollback. Website and portal are both included in acceptance; one does not substitute for the other.

Each WEB card must be expanded using [07](07-LUNA-IMPLEMENTATION-PLAYBOOK.md) after prerequisite ADRs, with exact files and commands. Current package deliberately does not invent a working `npm run build` for a web project that does not exist.

## 6. Full productivity Web App: future build plan

Shared server semantics must exist now; browser implementation is later. No claim that running Expo's current web target produces a production-ready full web app.

| Task | Dependencies | Implementation/output | Required evidence |
| --- | --- | --- | --- |
| FWEB-01 | ADR-001/002/012, mobile contract stable | Choose full-web rendering strategy with a prototype; shared schema and domain tests, browser support matrix | Auth/data boundary and accessibility comparison; owner approves choice |
| FWEB-02 | FWEB-01, WEB-03/04 | Authenticated shell, stable navigation, workspace selector and deep links | Keyboard/focus order, expiry, inaccessible/deleted links, responsive layouts |
| FWEB-03 | FWEB-02, core task/goal APIs | Tasks/goals/planning, optimistic UI only with rollback/conflict feedback | Duplicate submits, stale writes, bounded goal dates, date-only timezone fixtures |
| FWEB-04 | FWEB-03, session/sync contracts | Timestamp-based timer, one local leader across tabs, recovery and session history | Background tab throttling, reload, browser crash, two tabs, two devices, clock changes |
| FWEB-05 | FWEB-04 | Browser persistence/outbox and optional service worker after threat review | Eviction/quota/private-browsing limitations, version upgrade, account isolation, offline conflict; no silent cache loss claim |
| FWEB-06 | FWEB-03/04 | Return Ticket, outcomes, analytics and learning views for approved scope | Private sharing, accessible charts/tables, export integrity, content/version handling |
| FWEB-07 | Social/AI ADRs and APIs | Optional rooms/AI/connector surfaces | Membership revocation, moderation, proposal confirmation, quota/outage fallback |
| FWEB-08 | All selected FWEB tasks | Browser performance/security test, staged beta, operational release | Supported-browser matrix, migration/rollback, support docs and owner publication approval |

Browser leader election prevents duplicate local tabs, but server invariants remain necessary for multiple devices. Browser timer notifications may require user permission and have platform limitations; never claim mobile-level app shielding in a normal webpage. Site storage can be removed by the browser/user; cloud durability and explicit offline status must be distinguished.

## 7. Connector architecture

Three independent products: (A) an in-app AI assistant calling provider APIs, (B) data connectors such as Google Calendar, (C) external AI clients using a scoped Deep Focus API/MCP server. Enabling one does not authorise the other two.

Connector record holds subject, provider, approved scopes, consent version/time, state, last successful sync and encrypted server-side credentials. Lifecycle: `disconnected → authorising → connected → degraded/reconsent → revoked`. Do not show connected merely because an OAuth popup closed. Redirect/state errors are safe and retryable. Scope expansion requests new consent.

Google Calendar first recommendation: optional read-only availability import. Show selected calendars and visibility choices; default to time blocks without importing confidential titles into other workspaces. Write-back is a separately consented capability with exact preview of calendar, title, times, reminders and affected events.

Store provider event ID+calendar ID, source timezone, version/etag and recurrence context. Handle all-day dates separately. Paginate initial and incremental sync. Provider 410 rebuilds that connector's mirror only, preserving local tasks and pending writes. Deletions remove mirror entries, not user-owned tasks derived from earlier imports without a separate confirmed rule. Feedback loops are prevented using origin mappings and idempotent write keys.

Disconnect revokes/deletes server credentials as supported, cancels jobs, updates UI and removes stale connector visibility according to policy. Account deletion includes connector cleanup. Deleting a Deep Focus task must not delete an external event merely because it is linked.

Other integrations—task managers, cloud files, notes, music, developer tools—need individual API eligibility, terms, scopes, import/export conflict rules and tests. A URL link is not a connected account and a connected account is not blanket write authority.

## 8. AI adapters and external MCP

Internal adapter interface proposal: `generateProposal(request, consentContext, budgetContext) → validatedProposal | typedFailure`; support cancellation, timeout, usage accounting and provider error mapping. Keep provider-specific SDKs behind the adapter. OpenAI/Anthropic/Google are direction candidates; no accounts/models/keys or processing regions have been selected for the app.

Core works without AI. Explain sent fields before first use; minimum approved context, no automatic journals/private team data. Provider/model changes that materially change processing/privacy need review. Output claims stay clearly AI-labelled. Invalid JSON, excessive operations, unsupported dates and over-capacity plans fail validation; do not “repair” into undisclosed side effects.

External API/MCP initial proposal: read own selected tasks/availability, create **draft proposals**, and read proposal status. No unrestricted SQL, shell, file system, account deletion, membership management, billing or secret access. Applying mutations requires the user's exact approval in an authorised interface and fresh permission checks. OAuth grants identify client, user, scopes and expiry; revocation invalidates access. Keep a per-client compatibility test record; do not advertise ChatGPT/Claude/Gemini interchangeably without evidence.

Acceptance W-01…W-08: public/private route separation; sensitive cache isolation; complete account recovery; provider-confirmed billing status; export/deletion lifecycle; Google pagination/410/delete safety; revoked connector cannot read/write; AI proposal cannot escalate rights or apply unconfirmed changes. These are future implementation tests, not tests run in this docs-only revision.
