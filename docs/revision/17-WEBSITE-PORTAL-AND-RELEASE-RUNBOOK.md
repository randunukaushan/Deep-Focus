# Website, Account Portal and Release Runbook

Public website එක සහ Account Portal එක January 1 target එකේ අනිවාර්යයි.
Browser එකේ full timer/planner/LMS එක මේ release එකේ අනිවාර්ය නොවේ. මෙහි
routes, login/privacy/billing states සහ publish කරන තෙක් build order දක්වා ඇත.
මේ ලේඛනය නිසා domain එකක් මිලදී ගැනීමක් හෝ website එකක් deploy කිරීමක් නැත.

Status: **proposed detailed build/runbook**, 2026-09-16. Next.js is selected;
hosting/version/configuration remains ADR-002. [05](05-WEB-AND-INTEGRATIONS.md)
defines the surface boundaries, [14](14-BACKEND-API-DATABASE-BUILD-CONTRACT.md)
defines server-owned sessions, and [16](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md)
defines missing shared API modules. [Route manifest](contracts/web-surfaces.json)
is a documentation fixture, not active Next.js configuration.

## 1. Deliverable and directory boundary

The root project is an Expo mobile app. An isolated `web/` Next.js public-content
preview now exists with its own package/lock/test/build configuration; no
Supabase deployment or Account Portal exists. Preserve this boundary: do not move
mobile files, change root npm workspaces, or upgrade mobile React/Expo to satisfy
Next dependencies. Shared DTOs can first be generated/copied through a versioned
build artifact with a drift check; a monorepo migration needs its own approved
task. Do not import mobile FileSystem or credentials into web.

### Public-site implementation record — 2026-10-06

An isolated `web/` Next.js public-content candidate now exists. It implements the
home page and public feature, personal, education, plans, roadmap, updates, help,
contact, privacy, terms, data-deletion and accessibility routes. Copy is labelled
as a development preview; it does not claim released functionality, accept
payments/forms, expose accounts, or publish draft legal/accessibility promises.
The Account Portal, authentication callbacks, private APIs, final policy text,
localized review and deployment are not implemented. See the
[WEB-01 evidence record](evidence/WEB-01-public-preview-2026-10-06.md).

Current test evidence is source-level plus a successful isolated dependency
install and static build: web tests, typecheck, lint and Next production build
pass; the build prerenders the home, not-found and twelve public pages. Full web
audit has five high dev-tool findings in the lint dependency chain; the
production-only audit reports zero. Neither result proves exploitability or
absence of it in all runtime paths. Do not mark WEB-01/02 accepted or publish
until browser/accessibility review and the relevant publication gates pass.
`robots: noindex` is intentionally set for this preview.

Proposed layout, **none of these new files exists merely because of this plan**:

```text
web/
  app/(public)/...                 public content pages
  app/(auth)/...                   account entry/recovery pages
  app/(account)/account/...        protected portal pages
  app/auth/callback/route.ts       server-owned auth exchange
  app/auth/logout/route.ts         POST-only logout
  app/api/.../route.ts             narrowly allowlisted BFF endpoints as needed
  lib/server/auth.ts               verified identity/session registry
  lib/server/api.ts                Edge client, safe errors, DTO mapping
  lib/server/csrf.ts               route-handler origin/token checks
  lib/contracts/...               pinned shared DTO artifact
  components/...                  accessible web components; no business secrets
  content/...                    versioned public copy, locale/review metadata
  tests/...                      real selected unit/integration/browser tests
```

Record exact package versions, Node support, security updates, hosting adapter and
lockfile when scaffolding. Do not pin a release solely because documentation says
“latest.” Existing repo has no web `build`/`test:e2e` scripts; establish and prove
them before citing those commands as verification. Test tooling needs ADR-012
approval/version checks. Design direction is shared with mobile, not its imports.

## 2. Screen inventory and content truth

The manifest proposes **25 page routes**: thirteen public, five auth, seven account.
Two auth handlers are not pages. Optional detail pages for help/release notes may
be added only with route/content/test updates. None is a full browser focus app.

| Surface / page | Required content or result | Failure / exclusion rule |
| --- | --- | --- |
| `/` | Value: organize work, protect focus, return after interruption; real app preview | No fake downloads, user numbers, reviews or unbuilt feature screenshots |
| `/features` | Available/Beta/Planned per platform/version with limitations | A concept in the enterprise inventory cannot be labelled Released |
| `/solutions/personal` | Own work → plan → focus → outcome; later team branch clearly separated | No employee surveillance or unsupported enterprise compliance promises |
| `/solutions/education` | Sri Lanka initial education; student and independent-teacher own-resource workflows | Explicitly no supplied videos/papers/notes; no compulsory country pack/cohort |
| `/plans` | Approved offer matrix and actual purchase availability | Until catalog approval, explain unavailable purchasing; no placeholder charge/price |
| `/roadmap` | Research/Planned/In progress/Released and last update | No unapproved guaranteed delivery date or paid pre-order implication |
| `/updates` | Completed user-visible releases with real version/date | Engineering templates and draft docs are not public release notes |
| `/help`, `/contact` | Search/index, recovery/local-data/subscription guides, actual support route | No fabricated support address/SLA or collecting attachments by default |
| `/privacy`, `/terms` | Versioned qualified-review policy with publisher/contact/age/processing facts | Draft not publishable; no false compliance badge |
| `/data-deletion` | Account and local-only data distinctions; operational request/in-app route | No deceptive instant-backup-erasure or automatic store-cancellation claim |
| `/accessibility` | Actual support, known limitations and feedback path | No untested WCAG certification claim |
| `/sign-in`, `/sign-up` | Provider-backed identity; explicit age/consent policy where required | Neutral enumeration-safe errors; no cosmetic success |
| `/forgot-password`, `/reset-password`, `/verify-email` | Expiring one-purpose flow with resend/rate-limit/error states | No account reveal or successful password change without provider confirmation |

Every public feature record has `featureId`, status, platform, minimum app version,
public copy, supporting release/evidence reference and review date. Planned content
has no purchase-entitlement identifier. Public copy may be static/versioned; do
not introduce a CMS as an unapproved dependency. Download buttons stay absent or
honestly unavailable until real listing URLs exist. Third-party logos need rights
and actual connector support; an external link is not a working integration.

## 3. Account page contracts

| Page | Authoritative reads/writes | User-visible behavior |
| --- | --- | --- |
| `/account` | GET `/me`, verified entitlement summary | Real name/account state and links; independent loading/error areas, no fabricated metrics |
| `/account/profile` | GET/PATCH `/me` with allowlisted profile fields and version | Retain edits on failure; email/auth-factor changes go through Auth-specific revalidation, not generic profile patch |
| `/account/preferences` | EX-04/05 shared settings; current override explanation | Exact old/new preview; theme/locale/duration/AI visibility only; running mobile session unchanged |
| `/account/security` | EX-26/27 registered sessions + provider-backed auth workflow | Current/others/all sign-out distinguished; re-auth required; cannot claim all physical devices discovered |
| `/account/billing` | EX-28/29/30; selected provider when approved | Origin, period, pending/grace/expiry, overlap and official manage path; no client-only cancellation/grant |
| `/account/connections` | Later connector registry/revoke API under `05` | Only implemented connectors actionable; disconnected/degraded/revoked honest; no fake Connect button |
| `/account/privacy` | EX-21–25 owned jobs/challenge/receipt | Export states and explicit irreversible deletion consequences; no resource-upload feature |

Settings conflict returns latest version plus user's preserved draft to a review
screen, not last-writer-wins. “Save” locks duplicate submit until result, but
Escape/Back leaves a safe draft choice. Re-auth expiry preserves ordinary unsaved
text locally within the current page without putting sensitive drafts in URLs or
unapproved browser storage. Sign-out clears private client caches and invalidates
in-flight results; browser Back must not reveal a different account's old HTML.

Portal cannot access a phone's local phrases/resources/assessment drafts or grant
its OS notification permission. Show “Manage on this device in the mobile app”
and a safe app-navigation instruction, not an editable field that appears saved
but does nothing. Future opt-in phrase/draft sync needs an approved data contract.
Language and country/curriculum remain independent. Only reviewed supported
locales appear as supported; not every translated draft is a launch promise.

The connections page can show truthful service availability and help before an
integration ships; January portal inclusion is not approval to launch all Google/
ChatGPT/Claude/Gemini connectors. Do not show a revoked connection as still synced
merely because the last cached result exists.

## 4. Server-owned session and request sequence

Use the design in `14`: browser → same-origin Next server → user-authorized Edge
API. No Supabase service credential, refresh token or privileged SDK in client
components, rendered props, localStorage or analytics. A browser client that
expects readable Supabase cookies is not mixed into this HttpOnly-only design.
Verify the selected auth adapter with the actual package/provider versions.

1. Public GET is safe and read-only. A private GET validates session and app-session
   registry near data access, then reads only owned DTOs. Layout/proxy checks are
   convenience gates, not the only authorization boundary.[^1]
2. Sign-in form validates on server, performs provider exchange and rotates the
   session. Cookie is Secure/HttpOnly with appropriate SameSite/path/expiry. Cookie
   naming/domain must match the chosen deployment and cross-subdomain policy.
3. Callback accepts only the intended expiring flow, state/PKCE verification and
   approved origin. The unavoidable one-time code is not an access token: redact
   callback query logs, avoid third-party assets/referrers and immediately redirect
   to a clean URL after exchange. Never accept arbitrary `next` destinations.
4. A state-changing form validates Origin, CSRF/session binding, input, permission
   and expected version. Route handlers need explicit protection; do not assume
   Server Actions' protections automatically cover custom handlers.[^2]
5. Next server sends the user's validated token to the selected Edge route, never
   a service-role bypass to make a forbidden user operation succeed. Edge rechecks
   identity, active account/session and object authorization before its RPC.
6. Return allowlisted data/safe error. No unexpected stack traces or provider body.
   Revalidate only that user's view; do not populate a public/shared private cache.

`returnTo` accepts **exact paths** in the manifest allowlist, no host, protocol,
query, fragment, backslash, encoded separator or nested redirect. Validate decoded
input once using a tested parser; reject malformed/ambiguous encodings. Invalid
input falls back to `/account`, never redirects externally. Callback/verification
routes have their own single-purpose allowlist, not access to arbitrary action URLs.

Token renewal is serialized for a session. Concurrent tab refresh must not race
rotating credentials or resurrect a revoked session. Choose an audited adapter or
server-side session mechanism with measured concurrency proof; do not improvise
encryption/authentication primitives. Lockouts, recent-auth freshness and supported
factors require an explicit policy. App registry is necessary for the immediate
revocation guarantee proposed in `16`; JWT signature verification alone is not it.

## 5. Cache, browser and deployment security

Account/auth/API/job responses: `Cache-Control: private, no-store`, no shared CDN
storage or static prerendered personal data. Check actual HTML, streaming/RSC,
prefetch, error responses and navigation caches with two users. Cookie-aware
headers do not excuse a global in-memory cache keyed only by route. Public HTML
can cache verified public content, but never embed signed-in profile state into
that reusable response. Any personalized header fragment is private or separately
fetched after authorization. No service worker caches private portal responses in
this first website/portal slice.

Use HTTPS, explicit framing/base/object/script policies and configured outbound
service allowlists. CSP must be adapted to the selected Next build/rendering path
and tested in enforce mode before release, not copied from a random framework
version. Validate security headers on successful/error/callback routes through
the actual reverse proxy. Do not allow wildcard origins merely to resolve a CSRF
failure. `robots.txt`/noindex/sitemap exclusion reduce indexing, not authorization.
Preview environments are access-controlled and noindex; production credentials
never enter previews. No private session replay/marketing pixels by default.

Support forms accept bounded plain text and minimal reply contact with consent;
strip unsafe rendered markup, rate limit and protect inbox delivery. No arbitrary
URL fetch or attachment upload. Invalid requests preserve input and give accessible
feedback. A third-party anti-abuse widget, email provider or analytics service
requires its own privacy/cost/configuration decision; no account created here.

## 6. Billing/export/deletion end-to-end states

| Flow | State sequence | Essential failure handling |
| --- | --- | --- |
| Billing display | loading → verified active/pending/grace/expired/unavailable | Unavailable data does not imply no subscription; avoid duplicate buy prompt |
| Manage subscription | authorize owned license → official provider → return → reconcile | Browser return is not proof of cancellation/payment; show pending and support |
| Restore/link | re-auth → provider verification → ownership match or conflict → rights refresh | Never bind by email alone or transfer another person's purchase |
| Export | request → queued/running → ready → authorized download → expired | Retry job with same intent; expired artifact requires new export; no public link |
| Delete | consequence review → recent auth → challenge → exact confirmation → frozen/deleting → complete/needs support | Never show complete before durable job; narrow status receipt survives ordinary sign-out |

The [operations wire protocol](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md) section 11
refines this flow: securely retain the pre-issued deletion status credential
before confirmation so a lost HTTP response after freeze does not strand the
user. Use a narrow server-owned receipt session, not tokens in page props or
browser localStorage. Its HttpOnly cookie/key/TTL/CSRF configuration still needs
security review. The receipt can read only that accepted job's coarse state.
Billing visibility uses stable grant IDs and only owned manageable license IDs;
unavailable rights/catalog are null, never fake free access or checkout success.

[28](28-ACCOUNT-EXPORT-ARTIFACT-CONTRACT.md) supplies the export artifact and
coverage/download refinements. Before download show snapshot date, local-only
exclusions and any separately handled families with a functioning reviewed access
path. Unknown inventory is not empty data. A server job succeeding does not prove
the browser saved a file; distinguish download-started/interrupted/expired states.
No inline private-data preview, automatic shared-device save or analytics payload.

If a policy legally requires deletion/data access, feature pricing must not block
it. No statement of jurisdictional compliance is made here; publisher, age,
retention and payment obligations require the owner's actual facts and qualified
review. Store purchase management and deletion are distinct; deleting Deep Focus
does not automatically cancel every store subscription. Explain the real selected
provider workflow before confirmation, without dark-pattern obstruction.

## 7. Bounded build cards

These refine WEB-01–06 without changing their original dependency order. Each is
DRAFT until its specified gates and allowed files/test commands are recorded.

| Card | Allowed area / one result | Verification and gate |
| --- | --- | --- |
| WP-01 | Approve web directory/runtime/host, scaffold isolated `web/` | Root mobile package/lock unchanged; reproducible install/build and environment inventory |
| WP-02 | Shared semantic web components and public shell | UX token approval; keyboard/contrast/responsive/large-text/no-layout-shift checks |
| WP-03 | Thirteen public routes + reviewed feature/content registry | Content truth, licenses, locale/legal publisher review; no fake price/listing links |
| WP-04 | Auth pages/callback/server session DAL | Selected adapter/version; provider staging sign-in/recovery/rotation/two-user tests |
| WP-05 | Account/profile/preferences with version conflicts | Core/settings APIs; no local-only fields or sensitive client props |
| WP-06 | Session security + privacy job screens | BX-06, recent-auth/deletion policy, download/job isolation and expired-session flows |
| WP-07 | Billing and connections visibility/management | Approved catalog/merchant/connector APIs; truthful unavailable and pending states |
| WP-08 | Header/cache/privacy/browser security rehearsal | Real reverse-proxy/host preview; no production data; negative CSRF/cache/redirect tests |
| WP-09 | Public content/support/accessibility/store-link signoff | Actual owner facts, qualified locale/legal review and supported-device/browser matrix |
| WP-10 | Staging release, approved deployment and rollback | All release gates, domain/email/TLS, real smoke checks and owner production authority |

Do not implement WP-07 checkout as a fake success while merchant approval is
pending. Other public/portal development can progress against explicitly labelled
synthetic fixtures, but release cannot conceal a missing required service.

## 8. Acceptance matrix — required future evidence

| Test | Required scenario |
| --- | --- |
| WP-T01 | All 25 proposed pages route correctly; no full-web timer accidentally advertised as shipped |
| WP-T02 | Public cached page for signed-in A then visitor B → no A profile/private fields |
| WP-T03 | Direct account/BFF/Server Action access without session → denied even if layout bypassed |
| WP-T04 | Two users request same private route/RSC/prefetch/error → complete cache isolation |
| WP-T05 | Missing/foreign Origin or CSRF token on route-handler write → no mutation |
| WP-T06 | Absolute/encoded/backslash/protocol-relative return URL → safe default, no external redirect |
| WP-T07 | Auth callback wrong state/replayed code/expired flow → safe failure, no token leakage |
| WP-T08 | Concurrent refresh tabs + revoked app session → no credential race or resurrection |
| WP-T09 | Password reset/email verification genuinely confirmed by staging provider, not UI-only success |
| WP-T10 | Preference version conflict → edited text retained; reviewed new version only |
| WP-T11 | Portal shows local phrases/resources/OS permissions as device-managed; cannot fake save them |
| WP-T12 | Mobile session active during portal duration change → original session configuration retained |
| WP-T13 | Billing outage/existing overlapping license → no false free state or unnecessary second purchase |
| WP-T14 | Provider management return/cancel/restore conflict → reconciled state, not URL-based grant |
| WP-T15 | Export wrong owner/expired token/download replay according to policy → access denied |
| WP-T16 | Delete challenge stale/wrong owner or JWT reused after freeze → no ordinary account access |
| WP-T17 | Worker fails during deletion → pending/support state; no false finished claim |
| WP-T18 | Browser Back/account switch/in-flight request → old private content not disclosed |
| WP-T19 | Keyboard/screen reader/language expansion/reduced motion → all critical actions usable |
| WP-T20 | Real mobile widths and slow network → loading/empty/error/retry without lost form data |
| WP-T21 | Public feature claims/plan amounts/download links match reviewed actual release/catalog |
| WP-T22 | Preview and public sitemap/robots → no private indexable paths; authorization still enforced |
| WP-T23 | Production headers/CSP/TLS/source bundles → no secrets, private telemetry or broken auth |
| WP-T24 | Rehearsed deployment rollback → backward-compatible API/session and preserved user data |

## 9. Publish and operate runbook

Before release record: domain owner and DNS access via approved secret workflow;
hosting project/region/runtime; authenticated email sender and support owner;
privacy/terms/age/retention facts; approved catalog/store listing destinations;
actual web/mobile versions and API/schema compatibility; incident contact and
rollback build. Do not request raw secrets in chat or invent addresses.

Build evidence: clean reviewed source diff, lockfile install, real type/lint/unit/
integration/browser commands, production-mode build in staging, environment bundle
scan, two-user security cases, provider sandbox tests, backup/restore drill and
qualified locale/accessibility/content review. Fill exact commands after WP-01,
not before a web package exists. Store the evidence report with build identifiers,
devices/browser versions and unverified limitations, not only screenshots.

Release sequence: owner scope/content/legal approval → staging smoke and rollback
rehearsal → explicit production deployment authorization → compatible schema/API
rollout → website/portal deployment → verify TLS/headers/links/auth/privacy/billing
reads using permitted test accounts → observe defined errors and job backlog →
announce only verified capabilities. Domain/hosting purchases and store submission
require separate authority. Stop promotion if critical privacy, data loss or
authentication regressions occur; disable affected writes without discarding local
work and follow the rehearsed rollback/forward-fix process.

Never restore an old database over real new writes solely to reverse a visual
release. Retain compatible API versions through the rollback window. Deletion
journal reconciliation precedes reopening traffic after a restore. Support must
have documented outage, missing purchase, lost-device/local-data and deletion-job
playbooks. SLA/enterprise security claims require actual operating evidence.

Full productivity web remains [FWEB-01–08](05-WEB-AND-INTEGRATIONS.md): browser
timer leadership, offline persistence, tasks/planning, private learning/workspace
flows and browser recovery get separate contracts/tests. No existing Expo web
preview or these 25 account/marketing pages substitutes for that future build.

## Sources

[^1]: Next.js, [Authentication](https://nextjs.org/docs/app/guides/authentication), accessed 2026-09-16. Data-access authorization and minimal DTOs; exact library/runtime is not selected by reading this guide.
[^2]: Next.js, [Data Security](https://nextjs.org/docs/app/guides/data-security), accessed 2026-09-16. Server Action origin checks and the need to authorize server mutations; custom route handlers require their own reviewed protection.
