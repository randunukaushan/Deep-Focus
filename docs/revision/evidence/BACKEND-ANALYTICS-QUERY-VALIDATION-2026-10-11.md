# Analytics query validation foundation — 2026-10-11

The local EX-17 foundation validates exactly `start`, `end` and `timeZone`,
checks IANA timezone membership through the runtime formatter, rejects malformed
or reversed periods, and requires an explicit reviewed maximum range. It keeps
the input timestamp strings and returns parsed bounds for a half-open query;
freshness and projection status are deliberately not invented here.

Focused tests, typecheck and source lint are the implementation evidence. The
analytics projection route, reviewed range policy, live database execution and
freshness evidence remain `REVIEW_PENDING`/`NOT_RUN`.
