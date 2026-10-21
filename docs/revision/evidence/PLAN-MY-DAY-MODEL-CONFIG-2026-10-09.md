# Plan My Day model configuration — 2026-10-09

The local proposal flow now resolves its model label from the optional
`EXPO_PUBLIC_AI_MODEL` build setting. Empty or missing configuration safely uses
`local-heuristic-v1`; non-string, control-character and overlong values are
rejected. The stored proposal provider remains `mock`, and the model label is
metadata only until a reviewed OpenAI adapter, credentials, allowance and cost
policy are approved.

## සත්‍ය පරීක්ෂණ

- Planning configuration and Plan My Day route tests: `8/8 PASS`.
- සම්පූර්ණ bundled Node domain/component/navigation/website suite:
  `260/260 PASS`.
- TypeScript: `node node_modules/typescript/bin/tsc --noEmit` — exit `0`.
- Affected ESLint with `--max-warnings=0` — exit `0`.
- Documentation checker and `git diff --check` are current verification gates.
- No provider request, credential read, charge or remote write was performed.
