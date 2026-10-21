# Optional break settings recovery — 2026-10-07

```text
TASK: SP-02 subset / break screen local-setting read recovery
STATE: IMPLEMENTED; REVIEW_PENDING with Settings storage slice
DELIVERABLE: safe optional-break behavior when saved local setting is unavailable
REQUIREMENT / PHASE: Settings / local preference use; no new field
APPROVALS: Existing saved 5/10/15-minute break options and 5-minute initial fallback. No permission prompt or preference write from this screen.
RISK / REASON: HIGH in combination with persisted preference ownership; this isolated route change performs no write.
REVIEW GATE: self-review complete; independent review pending; Android/iOS accessibility and process-lifecycle checks NOT_RUN.
READ: docs/AI_RULES.md; docs/ai/AI_EXECUTION_POLICY.md; docs/ai/DEFINITION_OF_DONE.md; docs/ai/ENGINEERING_GUARDRAILS.md; docs/TESTING_STRATEGY.md; docs/DOCUMENTATION_MAP.md; docs/revision/20-SETTINGS-PROGRESS-AND-UNITS.md §1–2; docs/revision/15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md §3–4.
INSPECT: focus break route, local Settings adapter and SQLite settings read.
BASELINE: combined full suite before this route: 148/148; prior dirty user work preserved.
ALLOWED FILES: src/app/focus/break.tsx; tests/components/focus-break.test.mjs (new); docs/CHANGELOG.md; this evidence file.
NON-GOALS: no focus-session timing/persistence changes, no default-setting writes, schema/migration, new setting, sync, OS permission, provider or release action.

BEHAVIOR: Read the saved break length once when the break screen opens. A successful read selects the saved value. A failed read shows a recoverable explanation and retry; no saved option is falsely selected. The user may choose a duration for this break only, which is explicitly not persisted and does not overwrite account/device preference. Starting is disabled until a stored setting loads or the user makes that explicit manual choice. Manual choice is preserved when retry later succeeds.
PERSISTENCE: none. Uses the existing read-only Settings API and never calls `saveSettings`.
FAILURES / EDGES: storage rejection is caught; retry does not replace a newer manual choice; user can return to the paused focus session without starting a break.
SECURITY / PRIVACY / ACCESSIBILITY: no private error detail surfaced. Loading/read-error status is textual; controls expose radio selected/disabled semantics. Device voice-over/TalkBack and background/foreground behavior are NOT_RUN.
ACCEPTANCE: saved setting preselects; read error is not unhandled; no silent default on error; manual selection allows this break only; retry restores read status without overwriting manual choice.
VERIFICATION: focused `node --test tests/components/focus-break.test.mjs` — 3/3 PASS; current full `node --test` — 156/156 PASS; `node node_modules/typescript/bin/tsc --noEmit` — PASS; direct installed ESLint for affected files — PASS; latest docs checker — PASS (79 markdown files, 928 links); `git diff --check` — PASS with existing line-ending warnings. npm/npx PATH limitation is documented in the adjacent Settings evidence.
ROLLBACK / RECOVERY: no persisted change; revert the route behavior if review rejects it, preserving session and preference data.
STOP / OPEN DECISIONS: independent review, Android device and accessibility verification remain pending.
```
