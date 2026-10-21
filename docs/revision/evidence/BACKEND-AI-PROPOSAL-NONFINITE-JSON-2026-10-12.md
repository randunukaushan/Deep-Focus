# AI proposal JSON integrity — 2026-10-12

## Implemented

The PostgreSQL AI proposal adapter now validates `input_versions` and
`operations` through strict canonical JSON before returning or comparing a
proposal. Non-finite nested numbers are rejected instead of becoming JSON
`null`, preserving proposal replay and apply intent.

## Actual checks

- AI proposal adapter focused suite: **5/5 PASS**.
- Non-finite stored operation payload: rejected as `DEPENDENCY_UNAVAILABLE`.
- No provider call, remote database or production migration was run.

## Gates

Live AI provider/database execution, proposal apply integration, independent
security review and device verification remain `NOT_RUN` / `REVIEW_PENDING`.
