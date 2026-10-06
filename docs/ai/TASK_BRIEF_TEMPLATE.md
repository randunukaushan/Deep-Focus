# Bounded task brief

Fill only applicable fields; use `N/A — reason` instead of invented requirements.
This is a task packet, not a second feature specification. Link to authoritative
contracts; copied constraints must not become a conflicting source of truth.
Use [execution](AI_EXECUTION_POLICY.md), [DoD](DEFINITION_OF_DONE.md) and the
[lookup map](../DOCUMENTATION_MAP.md). Read selected instruction files completely.

```text
TASK: <ID / concise outcome>
STATE: <DRAFT or READY with evidence>
DELIVERABLE: <documentation | code | isolated verification | release>
REQUIREMENT / PHASE: <IDs, approved scope and current dependency>
APPROVALS: <exact subdecisions, source/section/date; open fields not used>
RISK / REASON: <level, trust/data boundaries, blast radius, reversibility>
IMPLEMENTATION ROLE: <use configured model; recommendation only if justified>
REVIEW GATE: <self / independent qualified / critical human approval; pending?>

READ: <required rules + exact canonical paths/sections and contract artifacts>
INSPECT: <current code, callers, persistence/services, config and real scripts>
BASELINE: <commit/dirty paths, pre-existing defects, environment constraints>
ALLOWED FILES: <exact paths; new paths explicitly labelled>
NON-GOALS: <excluded features, migrations, dependencies, deployment/refactors>

BEHAVIOR: <purpose, states/transitions, input/output/units/defaults, permissions>
PERSISTENCE: <ownership, offline/retry/recovery/version/migration consequences>
FAILURES / EDGES: <validation, unavailable/interrupted/duplicate/concurrent cases>
DEPENDENCIES / INTERACTIONS: <affected feature contracts, not speculative modules>
SECURITY / PRIVACY / ACCESSIBILITY: <applicable invariants and evidence>
ACCEPTANCE: <stable IDs with Given/When/Then, observable expected result>
VERIFICATION: <real commands/steps, fixtures/oracle, expected result/environment>
ROLLBACK / RECOVERY: <when needed; non-destructive rehearsals and authority>
STOP / OPEN DECISIONS: <exact missing facts and affected scope>

Implement only this slice. Preserve unrelated work and approved behavior.
Do not invent product defaults, loosen tests/authorization or claim unrun checks.
No agents, provider changes, secrets, spending, commit/push or production actions
without the authority required by repository policy and the current user task.
Return the concise completion record from Definition of Done with evidence.
```

## Example: document-only SyncPull query consistency

This example does not authorize app/backend implementation.

- Outcome: the draft `SyncPull.limit` schema expresses the same omitted-value
  default as its already specified OpenAPI query parameter.
- Relevant source: revision `16` sync contract; `contracts/backend-extensions.schema.json`
  `SyncPull`/`ListQuery`; `contracts/operations-api.openapi.json` EX-13; query-bound
  check in `check-operations-contracts.mjs`.
- Risk: MEDIUM contract correction; adds the documented default `50`, preserves
  integer bounds `1..100`, does not change authorization, actual server handling
  or claim that JSON Schema validation inserts defaults.
- Allowed files: that schema, document evidence/changelog; no source/providers.
- Acceptance: `SyncPull.limit` matches the shared documented default/bounds;
  checker passes without relaxing its assertion; existing fixtures still pass.
- Evidence: run operations and extension checkers with installed Node/Ajv;
  review exact diff. Runtime query coercion/default application is NOT RUN.
- Review: self-review sufficient for this isolated correction; the surrounding
  governance/security design remains separately HIGH and REVIEW_PENDING.

For a feature lacking concrete behavior, first create a **specification task**
with required owner decisions separated from proposed recommendations. Purpose,
state, persistence, failures, edge cases, tests, security and interactions must
be concrete where relevant before an implementation card becomes READY. Do not
mechanically add empty headings or label every future card ready from this template.
