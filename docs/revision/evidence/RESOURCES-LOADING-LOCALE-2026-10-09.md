# Resources loading locale boundary — 2026-10-09

The native Resources route now uses resource-specific localized loading copy in
Sinhala, Tamil and English. It no longer reuses the unrelated Tasks loading
message. Resource persistence, error recovery and local-only behavior are
unchanged.

## Evidence

- Focused source/accessibility test: **1/1 PASS**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint check: **PASS**.
- Current bundled-runtime suite: **301/301 PASS**, 0 failures.

Human translation review and Android screen-reader/text-scaling verification
remain pending.
