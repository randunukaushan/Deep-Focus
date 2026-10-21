# Settings, Progress Policies and Unit Contracts

2026-09-18 — **source-inspected baseline and proposed implementation contract**.

මෙහිදී වෙන වෙනම තබන්නේ: app එකේ දැනට ඇති behavior, පැරණි docs වල examples,
owner අනුමත කළ constraints සහ තවම freeze කළ යුතු product values ය. UI එකක
`+50 XP` තිබීම reward formula එක අනුමත බවක් නොවේ. `25` කියන අගයට minutes ද,
seconds ද, milliseconds ද කියලා field එකෙන්ම පැහැදිලි විය යුතුයි.

Requirements DF-014/027–036/039/076; linked contracts:
[13 reliability](13-CORE-RELIABILITY-CONTRACTS.md),
[14 core API](14-BACKEND-API-DATABASE-BUILD-CONTRACT.md),
[15 experience](15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md),
[16 extensions](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md),
[19 safety](19-SAFETY-AND-COMMITMENT-CONTRACT.md).
No app code, production policy, migration, dependency or provider was changed.

## 1. Evidence and unresolved differences

| Area | Current/source evidence | Required treatment |
| --- | --- | --- |
| Local settings | `src/features/settings/settings-storage.ts` persists only break minutes `5 | 10 | 15`, fallback 5; web returns defaults; read/write errors are swallowed | Do not describe full settings/cloud sync as implemented; preserve selected value during migration and expose write failure |
| Focus setup | `src/app/focus/setup.tsx`: presets 25/45/60, initial 25, custom integer 5–180 | Retain as current baseline evidence; new product range needs one frozen rule, not the draft schema's 1–1440 engineering bound |
| Active route | `src/app/focus/session.tsx` separately coerces route input with a five-minute floor | Validation must converge at domain/command boundary; a route floor is not sufficient validation |
| Units | Current session types/legacy API/SQL examples use seconds; proposed core schema/SQL use milliseconds; settings use minutes; current focus-time goals use minutes | Versioned adapters, not renaming fields without conversion |
| Defaults | DATA_MODEL/DATABASE_SCHEMA legacy examples enable notifications/AI; 15 proposes no automatic schedule/AI transmission | A preference is not permission/consent; separate current values from proposed default policy |
| Rewards | Current Rewards route derives three local milestones: one session, five sessions, 3,600 focused seconds | This is not a trusted XP ledger, level curve or an approved future achievement catalog |
| Analytics | Current route sums completed local sessions and computes focused/planned ratio over those completed records | Not proof of all-attempt completion rate, remote verification or real attention; name the denominator |
| Goals | Current helper includes completed sessions after creation with no end bound or stable goal contribution mapping | Requires CR-05 migration/attribution work; cannot certify goal correctness from the new DTO |
| Streak/XP docs | Calendar-day example and centralized reward rules exist; numeric XP/level examples do not define a complete catalog | Record missing rules explicitly; no invented production rate from a screenshot |

Source inspection is not runtime verification. Existing local history is not
automatically server-verified merely because its status string is `completed`.

## 2. Settings ownership and precedence proposal

| Layer | Fields / owner | Boundary |
| --- | --- | --- |
| Product defaults | Versioned default bundle | Initial fallback only; not permission or a replacement for explicit choices |
| Account preferences | Theme, UI locale, default focus/break minutes, AI feature visibility | Exact allowlist in 16 and extension schema; expected-version update, owner derived from identity |
| Device overrides | Explicit local overrides for allowed account fields | Override stays until user selects Use account default; absent override differs from an equal-valued override |
| Device-only | OS grants, notification schedules/install identifiers, sound/haptics/motion preferences, raw assessment/phrases/resources | Not accepted by generic account PATCH; follow their own approved contracts |
| Session snapshot | Duration and admitted commitment behavior captured at Start | Later defaults do not mutate active or historical sessions |

Resolve a setting using explicit device override → account value → product
default. Questionnaire recommendations are reviewed proposals, not a higher
precedence layer. Reset previews exactly which overrides/preferences change and
does not delete history, revoke credentials or grant consent. Until guest/account
namespace migration is approved, do not attach unowned settings to whoever logs in.

Effective reduced motion must respect an enabled OS preference; an app false
cannot force animation against it. Notification delivery also requires OS
permission, user category choice and an actual schedule; a true preference cannot
schedule reminders by itself. AI visibility true neither uploads content nor
spends allowance: the admitted action still needs explicit review/confirmation,
minimal approved context, availability and trusted usage enforcement.

Load has distinct found / missing / invalid / failed results. Only a genuinely
missing supported record receives persisted initial defaults. Corrupt/unsupported
data must not be overwritten as if new. Temporary in-memory defaults can keep the
core usable with an unsaved/recovery notice. Save success is acknowledged only
after commit; conflict refreshes the diff, and unknown commit reuses command ID.

### Default/range freeze sheet

These are recommendations for the next bounded freeze, **not new approvals**.

| Item | Evidence / recommended baseline | Still required |
| --- | --- | --- |
| Focus | Preserve 25 initial minutes, 25/45/60 presets and integer 5–180 custom range from current setup | One shared product policy for UI/domain/API; explicit approval before expanding range |
| Break | Preserve current 5 default, choices 5/10/15; break stays optional | Shared settings/domain/remote policy; a proposed 24-hour shape bound is not a UI option |
| Theme/locale | System theme proposed; si/ta/en launch locales approved September 25, with a visible selector | Exact fallback/default policy, qualified translations/font/accessibility QA; do not hard-code a billing country from locale |
| Notifications | No automatic schedule or OS prompt from default/onboarding completion | Exact initial category preferences and user-triggered permission flow |
| AI | No automatic provider call or data transfer; conservative visibility proposal off until chosen | Freeze visibility default; free allowance amount/renewal remains separately deferred |
| Sound/haptics | Respect OS/user control; no surprise audio | Exact initial feedback preferences and device behavior |
| Motion | OS reduce-motion wins; proposed local override may reduce further | Exact UI/storage representation, not a synced OS permission |
| Commitment | Ordinary End early proposed on by default; Emergency exit retained | 19's snapshot/interaction/default freeze, not an unbreakable lock |

No current selection is reset merely because this sheet recommends a baseline.
Do not silently shrink an existing valid user's preference or expand duration to
match a loose JSON schema bound. Handle out-of-policy imported values with a
review/migration path while preserving historical records.

## 3. Version and unit boundary

Local record schema, wire contract, sync envelope and reward rule each have their
own version. The proposal `TimingV2` in 13 and `contractVersion: 1` in the new sync
envelope are different namespaces, not a contradiction or permission to serve
legacy and draft DTOs interchangeably at one unversioned handler. Finalize one
published API representation and adapter/version negotiation before deployment.

| Representation | Meaning | Adapter rule |
| --- | --- | --- |
| Settings `*Minutes` | Integer preference for future configuration | Multiply by 60,000 exactly once when creating proposed `plannedMs` |
| Legacy `*DurationSeconds` | Whole-second timing fields | Validate finite nonnegative safe integer; multiply by 1,000 at a declared legacy boundary |
| Proposed `*Ms` | Integer milliseconds for domain/wire/prototype storage | No seconds guessing by magnitude; no per-segment display rounding |
| Goal `targetValue` + `targetUnit` | `ms` for focus time, `count` for session/task count | Type/unit must agree; legacy goal minutes convert once under a versioned migration |
| Streak dates | Local calendar dates under the frozen zone/attribution rule | Not UTC dates or 24-hour durations; never infer locale from billing country |
| Absolute instants | UTC `...Z` on the proposed wire | Preserve source timing/uncertainty; date-only task due values remain date-only |
| Ledger XP | Integer progression units under a named rule version | Never milliseconds, currency, purchasable stakes or attention measurement |

Arithmetic fixtures, not product-duration approvals: 25 minutes → 1,500,000 ms;
3,000 legacy seconds → 3,000,000 ms; 90 goal minutes → 5,400,000 ms. A migration
re-run on a versioned ms record must leave it unchanged, not multiply again.
Validate multiplication stays within safe integer/schema limits before writing.
Unknown version/unit is a recoverable error, not an inferred conversion.

Display may floor elapsed minutes/seconds and ceil remaining seconds as specified
in 13. Display rounding never feeds XP, stored timing or goal contribution values.
Do not convert new fractional-second history back to old whole seconds for
storage without an explicitly approved lossy adapter policy.

## 4. Settings and analytics wire refinements

[Extension schema](contracts/backend-extensions.schema.json) now includes proposed
strict AccountSettings/AccountSettingsResponse and AnalyticsQuery/
AnalyticsSummaryResponse definitions. They refine EX-04/05/17 in 16, not a claim
that all extension OpenAPI/response schemas or SQL migrations are finished.

AccountSettings is the account allowlist plus server ID/version/updatedAt.
It does not include device override values, notification grants, credentials,
private phrases, raw assessment, resources or commitment fields. Separate GET
account values from locally resolved effective settings. PATCH retains unknown-
field rejection, expectedVersion and explicit consent boundaries. A successful
PATCH returns the same AccountSettingsResponse shape. Do not return guessed
defaults after a database/auth failure as a successful GET.

AnalyticsQuery requires `start`, `end`, `timeZone`; the service additionally
checks a supported zone, actual chronological order, approved maximum range and
account ownership. A non-empty timezone string passing JSON validation is not
proof of a valid IANA identifier. Period semantics are half-open `[start,end)`.

Response includes requested period and `meta` (`asOf`, `sourceSequence`,
`ruleVersion`, `status`). Status is proposed `current | pending | stale |
unavailable`. Current means current through the stated source sequence, not
globally simultaneous or proof of human concentration. Pending/stale may show
only a previously validated snapshot, visibly labelled. No usable snapshot means
unavailable with null totals/metadata, not fabricated zeros. A genuine empty
period has a current snapshot and numeric zero counts.

Summary uses `verifiedFocusMs`, `completedSessionCount`, `completedTaskCount`;
locally pending sessions are a separate device-side display, never added to
verified totals twice. This shape intentionally contains no completion-rate,
health, XP, level or streak value while their exact policies are unresolved.
Negative values, fractional counts, unknown fields and contradictory unavailable
payloads are rejected. DTO fixtures prove shape only, not the data's truth.

## 5. Streak, XP and goal rules to freeze

| Rule | Stable constraint | Missing decision / proposed treatment |
| --- | --- | --- |
| Qualifying day | Completed eligible focus activity; cancelled/paused-only records do not qualify; one date counts once | Retain the simple one-qualifying-session candidate; any additional minimum/cap must be explicit |
| Day attribution | Consistent local calendar day; receipt time is not silently completion time | Proposed effective-end date in a captured named zone, compatible with 13's cutoff; travel/zone-change policy still to freeze |
| Late arrival | No duplicate reward; preserve authoritative activity | Rebuild from accepted distinct day set, not blindly increment an arrival-order counter; define late acceptance window |
| Current streak | Longest streak never decreases because a day is missed | Proposed length of run ending today, or yesterday while today is still available; otherwise 0; timezone/as-of explicit |
| XP | Trusted/idempotent; no missed-work or exit deduction | Exact base/bonus rates, eligible source kinds, caps and levels not specified by existing UI examples |
| Achievements | Evidence-based IDs, one unlock, no purchase of fake achievement | Freeze catalog/thresholds; current local 1/5-session/one-hour badges are evidence, not automatic future catalog adoption |
| Rest | No focus minutes or focus-session completion credit from a break | Any separate rest reward is a new explicit rule; `+10 XP` mockup is not authorization |
| Goals | Explicit task completion; bounded periods; immutable attributed contributions | Freeze event attribution and retarget/fork policy; creation lower bound alone is insufficient |

A versioned reward rule fixture must state effective dates, qualifying statuses,
accepted verification states, rates/thresholds/rounding, timezone/day attribution,
late-sync/overlap behavior and supported event kinds. Missing policy blocks new
trusted reward grants and publication, **not local focus saving or data access**.
Never fill missing amounts with zero and present them as a deliberate offer.

Ledger uniqueness remains `(owner, sourceType, sourceId, awardKind)` under 16.
Rule version is provenance, not a new dedup key that permits re-granting history.
Rebuild projections from immutable evidence; do not replay side effects. A
verified correction requires its own trusted/audited contract, not arbitrary
client XP debit. A new catalog must not retroactively reward every old event
unless an explicit migration/backfill decision and idempotency plan allow it.

Calendar fixture candidates: two completions on one local date count once;
September 15 and 16 dates give a two-day run as of September 17 before today's
activity; September 14 and 16 give a one-day current run in that same evaluation.
These illustrate the proposed today/yesterday rule, not a shipped algorithm.
Test actual zone conversion, DST/travel and delayed sync after the zone policy is
frozen; adding 86,400 seconds is not a general local-calendar-date operation.

## 6. Build cards — DRAFT

All cards need the 07 READY gate, approved release/phase placement and test
tooling. Exact allowed paths, schema adoption and rollback must be frozen before
implementation. Current settings/session/history/reward routes are inspection
targets, not permission for a broad rewrite or another provider.

| ID | Outcome | Dependencies / cases |
| --- | --- | --- |
| SP-01 | Freeze versioned defaults/duration/metric rule fixtures and provenance | ADR-003/006/008/012 and unresolved sheet above; no invented XP amount; SP-T01–04/13–16 |
| SP-02 | Recoverable scoped settings, precedence and reviewed migration | SP-01, CR storage, BX settings, UX defaults; SP-T01–08 |
| SP-03 | Explicit legacy/new unit adapters and version negotiation | SP-01, CR/BE schemas and migration contract; SP-T09–12/23 |
| SP-04 | Trusted projections and non-punitive reward ledger with bounded goals | SP-01/03, BX ledger/sync and CR goal foundation; SP-T13–22 |
| SP-05 | Account Portal/mobile agreement and real-build failure/locale evidence | SP-02–04, WP settings/auth, UX accessibility; all relevant SP cases |

## 7. Acceptance cases — all NOT RUN against the app

| ID | Given / action | Required result |
| --- | --- | --- |
| SP-T01 | Missing supported settings vs invalid/unreadable record | Only genuine missing gets initial defaults; errors visible, no overwrite masquerading as initialization |
| SP-T02 | Existing 10-minute break; migration/relaunch | Choice preserved; one migration version, no reset to 5 |
| SP-T03 | Device override equals old account value; portal changes account default | Explicit override remains until Use account default; equal numeric value is not absence |
| SP-T04 | Change future duration during an active session | Active snapshot and history unchanged; next start uses frozen precedence |
| SP-T05 | OS notifications denied or no schedule; account preference true | No notification claim or silent permission prompt/schedule |
| SP-T06 | AI visibility true; no user generation confirmation | No provider request, content transfer or allowance spend |
| SP-T07 | Settings write failure/conflict/account switch | Preserve last durable owner-specific state; no false Saved or cross-account callback |
| SP-T08 | Portal PATCH injects haptics, phrases, OS grant or commitment field | Reject outside account allowlist; no silent local data upload |
| SP-T09 | Convert 25 minutes / 3,000 legacy seconds | Exactly 1,500,000 / 3,000,000 ms; no magnitude guessing |
| SP-T10 | Re-run migration on already-versioned ms record | No double multiplication, IDs/history preserved |
| SP-T11 | NaN, infinity, unsafe multiplication, negative or unknown unit/version | Reject/recover without silent zero or guessed schema |
| SP-T12 | Several sub-second segments; display rounded duration | Stored totals and eligibility use unrounded domain values |
| SP-T13 | Several qualifying completions on same calendar date | One streak date; no duplicate daily bonus if selected |
| SP-T14 | Local midnight / DST / travel under frozen zone rule | Correct attributed dates without blanket 24-hour arithmetic or retrospective timezone rewrite |
| SP-T15 | Late qualifying day arrives out of order | Deterministic recomputation under accepted-day rules, no decrement/increment based solely on arrival order |
| SP-T16 | Missing reward policy; completion is saved | No invented XP/level; truthful unavailable/pending progress, durable core preserved |
| SP-T17 | Repeated source, sync replay, rule-version change or rebuild | One trusted award identity; no repeated side effects or penalty |
| SP-T18 | Real empty period vs unavailable projection | Current zero summary versus unavailable null summary; do not confuse them |
| SP-T19 | Stale/pending prior snapshot | asOf/sequence/rule and stale status visible; local pending not double-counted |
| SP-T20 | Record exactly at goal/analytics period end | Excluded from half-open prior period; one contribution under frozen attribution |
| SP-T21 | Cancelled focus, pause rest or post-focus break | No focus-completion credit; no automatic task completion or rest XP from a mockup |
| SP-T22 | Reversed range, unsupported zone, wrong owner or excessive query period | Service rejects semantically; schema pass alone does not authorize query |
| SP-T23 | Legacy/new DTO mixed fields or mislabeled duration | Reject explicit version/unit mismatch; do not silently coerce wire shape |
| SP-T24 | Large text/screen reader and pending/error settings/progress states | Values, units, provenance and failure action understandable without colour-only signals |

## 8. Completion boundary

Schema fixtures and arithmetic examples are document evidence, not execution of
these 24 app scenarios. Complete output contracts exist here only for the named
settings/analytics refinements; streak/reward endpoints, deployed rules, migration
handlers and complete extension OpenAPI still need work. No price, allowance,
XP curve, clinical claim or platform capability was approved by this addition.
