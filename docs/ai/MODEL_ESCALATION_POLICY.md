# Replaceable model selection and escalation mapping

Checked 2026-09-19. This file is replaceable; permanent risk/verification rules
remain in [execution](AI_EXECUTION_POLICY.md) and [DoD](DEFINITION_OF_DONE.md).
These are project recommendations, not provider guarantees or automatic routing.

## Owner preference and evidence

The owner intends future bounded implementation with **GPT-5.6 Luna / medium**
and stronger reasoning now for difficult specification/architecture work. Keep
the active configuration unless a change is explicitly authorized. This document
does not change a running model, account, API configuration or reasoning setting.
Work alone; no extra agents/tasks unless the owner later explicitly permits them.

OpenAI's current model documentation describes Luna as cost-sensitive/high-volume
and supports `medium` reasoning; the model catalog distinguishes Terra's
cost/intelligence balance and Astra's complex reasoning/coding role. Those
descriptions are selection inputs, not evidence that any model passes this
project's acceptance tests. [Luna documentation](https://developers.openai.com/api/docs/models/gpt-5.6-luna),
[model catalog](https://developers.openai.com/api/docs/models).

Current candidate IDs: `gpt-5.6-luna`, `gpt-5.6-terra`, `gpt-5.6-sol`,
`gpt-6-astra`. Availability/reasoning options can differ by host/API/account and
change over time; recheck before an actual switch. No price, access entitlement,
context-window promise or performance benchmark is locked into this policy.
Owner budget decisions remain deferred; do not incur separate paid/API costs.

## Mapping by required role

| Task role/risk | Current recommendation | Trigger for a different choice |
| --- | --- | --- |
| LOW bounded implementation | Owner-configured Luna / medium for future work | No automatic escalation for a typo, lint fix or missing environment |
| MEDIUM bounded implementation | Luna first with concrete contract/tests | Evidence of reasoning/architecture limits after diagnosis; recommend appropriate Terra, Sol or Astra role, not a mandatory sequence |
| HIGH implementation | Luna may implement an approved bounded design; stronger design/debug role if needed | Unresolved cross-boundary reasoning, repeated non-informative failures or security/integrity uncertainty; independent qualified review still required |
| HIGH review | Independent capable reviewer; stronger-model review can assist within authorization | Author cannot self-certify; qualified human security review where model review cannot establish control correctness |
| CRITICAL design/review | Experienced specialist and capable stronger-model assistance if authorized; Sol/Astra are candidates | Risk and required expertise decide, not a nominal ladder. Human approval and production evidence remain mandatory |

The proposed Luna → Terra → Sol → Astra chain is **not mandatory**. Going through
every model can waste time/money and repeat a bad assumption. Fix missing facts,
tools or acceptance tests first. Escalate directly to the role needed for the
specific root cause; stay with the configured model when sufficient evidence
supports that choice. A model switch cannot resolve missing owner authority.

Before recommending a switch, provide the compact escalation packet from the
execution policy and state the expected benefit. The owner can authorize a serial
review without authorizing a fleet of agents. If authorization/reviewer availability
is absent, preserve the draft and mark REVIEW_PENDING; no fabricated review.

## Keeping context small without losing constraints

Keep root instructions short; use the map and task brief to load relevant
contracts. Codex documents hierarchical AGENTS discovery and instruction size
limits; linking a reference does **not** prove it was read. Do not change global
Codex settings or add nested overrides merely to bypass constraints.
[Official AGENTS guidance](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

Evaluate selection using actual task outcomes: acceptance met, failures/retries,
review findings, elapsed effort and observed usage if available. Do not invent
cost savings or promise that Luna can finish all future tasks. Refresh this
mapping when availability changes or project evidence justifies it; changing
model names must not weaken the permanent risk/verification gates.
