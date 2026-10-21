# Backend evidence — server AI planning boundary candidate (2026-10-10)

The local server-only candidate binds AI proposal generation to a verified
actor/session context and the server usage service. It reserves one AI unit
before calling an injected provider, consumes on success, releases on provider
failure, and rejects allowance denial before any provider call. Applying a
proposal requires the exact confirmation token and timestamp; only then is the
server-owned apply callback invoked.

## Actual checks

- AI boundary, existing planner, entitlement and PostgreSQL usage checks:
  **31/31 PASS**.
- Full repository regression at the earlier boundary checkpoint: **675/675
  PASS**; TypeScript, affected ESLint and docs checker: **PASS** (229 Markdown,
  936 links, 80/80 requirements).
- Live OpenAI provider, credentials, remote storage, billing/allowance runtime,
  independent security review and Android verification:
  **NOT_RUN / REVIEW_PENDING**.

Provider failures are mapped to `AI_PROVIDER_UNAVAILABLE`; raw provider
messages and stacks are not rethrown through this boundary. The reservation
release is still attempted and the apply callback is never called.

## Boundaries

No API key, paid provider, remote database, production data, deployment,
commit or push was used. The injected provider and apply callback remain local
review candidates.

## Follow-up: session recheck before confirmed apply — 2026-10-10

- Confirmed plan application now requires a server-supplied session recheck
  immediately after confirmation validation and before the apply callback.
- A revoked-session failure prevents the server apply callback from running.
- AI/planning focused checks — **19/19 PASS**.
- Full repository regression after this follow-up — **680/680 PASS**.
- TypeScript, affected ESLint and documentation checker — **PASS**.
- Live OpenAI/provider credentials, remote allowance storage, Supabase
  execution, independent security review and Android/device verification remain
  **NOT_RUN / REVIEW_PENDING**.

## Follow-up: safe apply error boundary — 2026-10-10

- Raw errors from the confirmed-plan apply callback now map to
  `DEPENDENCY_UNAVAILABLE` without exposing storage/provider details.
- Existing server-defined boundary errors, including `AUTH_REQUIRED`, remain
  unchanged so revoked sessions still fail with the correct safe code.
- AI/planning focused checks — **20/20 PASS**.
- Full repository regression after this follow-up — **682/682 PASS**.
- TypeScript, affected ESLint and documentation checker — **PASS**.
- Live provider, remote allowance storage, Supabase execution, independent
  security review and Android/device verification remain
  **NOT_RUN / REVIEW_PENDING**.

## Follow-up: safe session-recheck error boundary — 2026-10-10

- Raw errors from the apply-time session recheck now map to
  `DEPENDENCY_UNAVAILABLE` without exposing session-store details.
- Server-defined authentication errors remain unchanged and the apply callback
  is not called after a failed recheck.
- AI/planning focused checks — **21/21 PASS**.
- Full repository regression after this follow-up — **683/683 PASS**.
- TypeScript, affected ESLint and documentation checker — **PASS**.
- Remote provider/runtime execution, independent security review and Android/
  device verification remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: safe allowance-reservation error boundary — 2026-10-10

- Raw errors from the server usage reservation now map to
  `DEPENDENCY_UNAVAILABLE` before the provider is called.
- Server-defined boundary errors remain unchanged and allowance denial still
  produces `AI_ALLOWANCE_EXCEEDED` without provider access.
- AI/planning focused checks — **22/22 PASS**.
- Full repository regression after this follow-up — **684/684 PASS**.
- TypeScript, affected ESLint and documentation checker — **PASS**.
- Remote provider/runtime execution, independent security review and Android/
  device verification remain **NOT_RUN / REVIEW_PENDING**.
