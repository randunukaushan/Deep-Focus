# API ownership and consolidation inventory

Date: October 3, 2026. Status: inspected source inventory; draft integration
guidance. This document indexes current artifacts and records findings. It does
not replace their contracts or certify an implemented API.

## 1. Reproduce the inventory

From repository root, using the installed Node runtime:

```text
node docs/revision/inspect-api-inventory.mjs
node docs/revision/inspect-api-inventory.mjs --operations
```

The second command includes every operation's method, route, source file,
operationId, response statuses, query names and path parameters. Eight source
files currently declare **82 operations**: the previously counted 60 personal/
planning operations plus 22 classroom operations. All eight use OpenAPI 3.1.1
and logical server `/v1`. This does not identify a deployed gateway.

The inventory resolves registered local schema `$id` URNs as well as relative
file references. It found 10 registered schema IDs and inspected 422 distinct
source/reference locations, with no unresolved target. Its first run reported
unsupported URNs because the inventory resolver lacked that registry; adding
the local `$id` lookup corrected the tool, not the source contracts.

## 2. Source ownership

| Owner file under contracts | Operations | Owned boundary | Contract / existing check |
| --- | ---: | --- | --- |
| [personal-api.openapi.json](contracts/personal-api.openapi.json) | 14 | Profile, Task create/read/patch/action, Goal create/read, focus sessions/events | [14](14-BACKEND-API-DATABASE-BUILD-CONTRACT.md); check-backend-contracts.mjs |
| [personal-extensions.openapi.json](contracts/personal-extensions.openapi.json) | 12 | Goal edits/deletion, Task deletion, settings, breaks, reminders, analytics | [16](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md); check-extension-contracts.mjs |
| [operations-api.openapi.json](contracts/operations-api.openapi.json) | 15 | Legacy sync/snapshot, privacy jobs/export/deletion, sessions and billing access | [16](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md); check-operations-contracts.mjs |
| [rewards-ai.openapi.json](contracts/rewards-ai.openapi.json) | 6 | Rewards/history, goal progress, AI usage and proposal read/apply | [22](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md); check-rewards-ai-contracts.mjs |
| [planning.openapi.json](contracts/planning.openapi.json) | 5 | Plan generation/recovery/cancel, proposal revision and single-plan read | [24](24-DAILY-PLAN-AND-GENERATION-WIRE-CONTRACT.md); check-planning-contracts.mjs |
| [plan-management.openapi.json](contracts/plan-management.openapi.json) | 2 | Existing plan edit and lifecycle actions | [26](26-SAVED-PLAN-MANAGEMENT-WIRE.md); check-plan-management.mjs |
| [replication-v2.openapi.json](contracts/replication-v2.openapi.json) | 6 | Protocol-2 push/pull/snapshot and plan list | [27](27-PLAN-REPLICATION-SNAPSHOT-EXPORT-WIRE.md); check-replication-v2.mjs |
| [classroom.openapi.json](contracts/classroom.openapi.json) | 22 | Private classroom/member/invite/assignment/selected submission/feedback | [40](40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md); check-classroom-contracts.mjs |

No duplicate `operationId` or method/path ownership was found, including paths
normalized to ignore parameter names. Multiple methods on one resource are
intentional: for example, core owns GET `/goals/{id}` and extensions owns its
PATCH/DELETE. GET `/plans` belongs to replication-v2; GET `/plans/{id}` belongs
to planning; PATCH and actions belong to plan-management. A route directory is
not an ownership rule; use the method and owning source together.

## 3. Findings that matter when combining artifacts

| Finding | Inspected evidence | Disposition |
| --- | --- | --- |
| F1 Repeated component names | Four cross-file groups: securitySchemes/UserBearer, parameters/Cursor, parameters/Limit and responses/Error | Preserve document scope. Never overwrite components through a flat object merge |
| F2 Cursor acceptance differed; draft corrected | Core previously lacked minLength; backend-extensions required minLength 1 | October 3 follow-up added minLength 1 to core and explicit omitted/empty behavior to 14. Seven actual parameter fixtures cover omitted, empty, bounds and types. Token authenticity remains a server check |
| F3 Limit uses two representations | Core inlines integer 1–100/default 50; extensions and operations reference ListQuery's equivalent limit | Same inspected numeric bounds, not permission to discard source-specific metadata or to assume validators insert defaults |
| F4 Error metadata differs | Common personal Error body target; later slices additionally declare private/no-store response headers and differing descriptions | Preserve the complete Response Object, including headers. Equal body shape does not make the responses interchangeable |
| F5 Bearer labels differ | Classroom bearerFormat JWT; other files say Supabase user access JWT; type http and scheme bearer agree | Documentation labels do not verify identity. Keep actual token/session/ownership requirements in the security and domain contracts |
| F6 Two replication generations | `/sync/*` and `/replication/v2/*` are distinct existing routes | Preserve version negotiation and capability gates from 25–31. Do not silently substitute v2 or duplicate a mutation across both protocols |
| F7 Coverage is bounded | Paid resource-cloud contract 33 has no corresponding upload/object OpenAPI slice here; account-export schema has separate exclusions; classroom bridge schema is internal | 82 operations are an inventory of authored routes, not full launch API coverage. Retain the documented missing families and internal/public separation |

Each existing operation has a declared success status and a response body schema
where a body is expected; path placeholders have required parameters. These
presence checks do not prove completeness of errors, query coercion, headers,
response fields, authentication or cross-field behavior. The domain checkers
provide additional bounded fixture evidence, not real integrations.

## 4. Consolidation approach for a later admitted task

Keep these files as the source owners until a reviewed replacement exists. For
an implementation task, select only the owning operation and its referenced
schemas; include the associated prose invariants and acceptance cases. The
inventory provides one searchable entry without rewriting 82 contracts.

If a single generated OpenAPI bundle becomes necessary for client generation:

1. Pin the bundler and consumer versions under the tooling task; test support
   for the external draft-07 schemas, root `$id` URNs and OpenAPI 3.1.1 first.
2. Preserve method/path ownership, path-level parameters, security, extensions,
   request/response headers and all source-relative reference targets.
3. Namespace conflicting components by source. If names change, rewrite every
   corresponding reference, including security requirement keys. Retain stable
   schema IDs; do not convert a URN into a network fetch.
4. Compare the generated inventory with all 82 current operations, then check
   source versus generated request/response fixtures, including rejected input.
   Preserve the corrected empty versus omitted Cursor behavior from F2.
5. Record F2/F4 dispositions separately. A bundler must not make product
   or cache-policy decisions. Generated output is not a second hand-edited source.

No bundle, generator, client, server handler or new dependency was created in
this inventory task. A single generated artifact is not required to begin the
independent pure-domain harness in 38.

## 5. Completion boundary

BH-A1/BH-A2 cover inspected ownership and reference presence. The inventory has
no unresolved references or duplicate public operation ownership. F2 is resolved
in the draft parameter contract only; F1/F3/F4/F5 require preservation during
future consolidation, and F6/F7 retain existing version/coverage boundaries.
The reference check does not validate every JSON Schema keyword, nested `$id`
scope or all OpenAPI semantics. No file currently inspected required nested ID
rebasing; broaden the resolver or use admitted tooling if that changes.

Use [the build-entry handoff](49-BUILD-ENTRY-HANDOFF-SI.md) for the first bounded
implementation task. Existing HIGH security designs retain independent review.
