# Revocation worker result boundary — 2026-10-14

## Scope

The PostgreSQL session-revocation worker now validates every returned result as
a dense plain-JSON row array before listing due jobs or changing a lease state.
Sparse or runtime-confused rows fail closed.

## Evidence

- Focused revocation-worker suite: **6/6 pass**
- Full domain suite: **1431/1431 pass**
- TypeScript `node node_modules/typescript/bin/tsc --noEmit`: **PASS**
- Lint `npm run lint`: **PASS**
- Documentation checker `node docs/revision/check-docs.mjs`: **PASS** (598 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Gates not established here

- Live provider revocation: `REVIEW_PENDING`
- Independent security review: `REVIEW_PENDING`
- Android/device verification: `NOT_RUN`
- Production deployment: `NOT_RUN`
