# Usage and allowance state integrity — 2026-10-12

## Implemented

The PostgreSQL usage adapter now validates stored reservation units, period and
policy values before settlement. It also validates allowance counters as safe,
non-negative values whose consumed-plus-reserved total does not exceed the
limit. Malformed receipt data therefore cannot be used to increase reserved
quota through a negative settlement delta. Unknown settlement actions are
rejected before receipt reads or quota writes.

## Actual checks

- PostgreSQL usage adapter focused suite: **21/21 PASS**.
- Malformed negative receipt units: rejected before allowance update SQL.
- Inconsistent allowance counters: rejected before a grant is returned.
- Unknown settlement action: rejected before receipt access.
- No provider, payment, remote database or production migration was run.

## Gates

Live concurrent PostgreSQL reservation/settlement, RLS, provider billing and
independent security review remain `NOT_RUN` / `REVIEW_PENDING`.
