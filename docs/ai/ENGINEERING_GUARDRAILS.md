# Engineering guardrails

Read completely for code/configuration, architecture/security design and changes
to these rules. Detailed topic contracts are routed by the [map](../DOCUMENTATION_MAP.md).
These constraints consolidate the former root/AI-rules details; they do not
approve expanded scope, arbitrary defaults or a different stack.

## Product, scope and dependencies

- Protect attention, sustainable work/recovery and user control. Calm, accessible,
  privacy-conscious experience; no manipulative engagement, gambling, real-money
  rewards or missed-work XP penalties. No unverified health/burnout predictions.
- Follow the approved phase/dependency order in `V1_IMPLEMENTATION_PLAN.md`.
  Do not skip incomplete foundations for easier secondary features. Prioritize
  `configure → start → supported pause/resume → complete/cancel → persist → recover
  → verified progress`. Expanded enterprise proposals remain gated by the register.
- Mobile: TypeScript, React Native, Expo SDK 56, Expo Router, functional components
  and Hooks. Before Expo-specific code, consult the exact
  [SDK 56 documentation](https://docs.expo.dev/versions/v56.0.0/) and verify installed
  `package.json`/lockfile compatibility. Prefer supported project-local tooling.
- No new/replacement framework, routing/state system, database/backend/AI provider
  or major dependency without documented need and owner approval. Use the
  [recorded selections](../revision/01-REQUIREMENTS-AND-DECISIONS.md); Firebase is
  not a mandatory approved dependency. Keep `package-lock.json` synchronized with
  authorized dependency changes. Do not apply mobile tooling to unrelated web work.
- Preserve valid functionality and unrelated dirty edits. No large rewrite,
  deletion of functionality or breaking/irreversible change without explicit
  approval. Build future capability through clear boundaries, not speculative
  infrastructure or shortcuts that knowingly compromise security/reliability.

## Architecture, code and correctness

- Follow approved layers/dependency direction. Routes/presentation compose UI and
  navigation; business rules, persistence and external services belong in their
  established layers. Use SOLID/clean boundaries where practical, not ceremony.
- Reuse existing components/hooks/services/repositories/types/utilities/tokens.
  Abstract only for clear reuse, consistency, testing or maintainability; avoid
  both duplication and premature abstraction. Keep state near its owner; no
  duplicate truth or persisted derived state without a documented need.
- Readable, strongly typed TypeScript and meaningful names; avoid unnecessary
  `any`, unsafe assertions, magic numbers, deep nesting, oversized mixed-purpose
  files, circular dependencies, dead code and debugging output.
- Handle loading, empty, success, error, retry and interrupted states. Preserve
  Android/iOS behavior and explicitly test platform differences where affected.
- Focus time/completion derives from reliable timestamps and lifecycle state,
  not UI interval ticks alone. Persistence errors, background/foreground changes,
  restarts, idempotent completion, duplicate processing and recovery are correctness
  concerns. Do not fake success or swallow failed writes.
- Optimize rendering/memory and use lazy loading when appropriate; avoid needless
  re-renders. Measure consequential performance changes. Decorative effects must
  not compromise clarity, smooth interaction, battery or accessibility.

## UI and accessibility

- Consult component library and UI specification before introducing patterns;
  reuse/extend existing components first. Respect approved color, typography,
  spacing, radii, icons, states, layout, animation and tokens; no arbitrary global
  redesign or hard-coded design value when an approved token exists.
- Calm hierarchy, minimal cognitive load and responsive layouts. Support specified
  light/dark behavior, localization, dynamic text, sufficient contrast, screen
  readers, logical focus order, keyboard behavior where applicable and adequate
  touch targets. Never convey meaning through color alone.
- Respect reduced motion; animations are optional enhancement, not a prerequisite
  for using the feature. Accessibility is part of acceptance, not a later phase.

## Security and privacy

- Never expose/commit/log secrets, API keys, private tokens/credentials or sensitive
  user data. Do not request secrets unnecessarily. Provider private keys stay in
  trusted infrastructure, never mobile bundles or public Expo variables.
- Authentication credentials use the approved secure-storage mechanism. Domain
  storage is not credential storage. Configuration/backup/key policy requires its
  own approved contract; choosing SecureStore or SQLite does not resolve it.
- Treat all client input and external/AI responses as untrusted. Validate at the
  proper boundary. Trusted infrastructure enforces authentication, ownership,
  authorization, entitlements/rewards and protected operations; never trust a
  client-supplied owner ID or a hidden UI control as access enforcement.
- Least privilege, secure defaults, HTTPS, data minimization, safe errors,
  rate limits and replay/duplicate protection where relevant. No sensitive data
  leakage through errors, analytics, screenshots, clipboard, logs or fixtures.
- Follow approved sign-out, account/data deletion, retention, export, sync and
  recovery contracts in security/data/API specifications. Require real negative
  ownership, failure and recovery tests for affected behavior; diagrams and DTO
  checks are not authorization proof. Production policies are not guessed defaults.

## Product AI, rewards, ads and commitment

- Core focus works without AI/network whenever practical. AI is optional,
  private, transparent, explainable, dismissible and user-controlled; uncertain
  suggestions are not facts. Send only minimal approved context, validate outputs
  and fail safely. Never create dependency on AI or silently change settings.
- Plans, task breakdowns, task/goal/reminder/schedule/settings changes are proposals
  until the user explicitly confirms the exact shown actions; apply through normal
  validation/authorization. No AI security-critical or irreversible decisions.
- Canonical V1 requires `Plan My Day`; `Break Down This Task` and `Review My Day
  Lite` remain conditional on V1 guardrails. Voice/long chat/automatic rescheduling/
  weekly AI planning remain post-V1 absent explicit promotion.
- Trusted usage/reward grants and rewarded-ad completion require server verification;
  no client-only completion claim. No advertisements during active focus or True
  Zen Break, no unrequested interruption. Launch ads are required but format,
  provider, age eligibility and limits remain open; the free/paid AI direction
  does not approve prices or quotas.
- Pre-session ordinary-exit configurability coexists with a separate retained
  Emergency exit. Do not promise an unbreakable lock or remove the emergency path.
  Exact interaction rules remain in the safety contract/approval record.

## Maintenance and handoff

Preserve truthful documented versus implemented status. Update affected contracts
and changelog for meaningful completed changes, not speculative features. Follow
[execution](AI_EXECUTION_POLICY.md) and [DoD](DEFINITION_OF_DONE.md) for tests,
diff review, explicit assumptions/risks and evidence. Never claim tests or security
verification that did not occur; never hide known defects or uncertainty.

When committing is authorized, do not include generated/temporary/secret files,
known broken code or unexplained unfinished experiments. Use small meaningful
Conventional Commits; authorization and focused diff review still apply.
