# Billing Visibility Route Evidence — 2026-10-11

EX-28 `GET /v1/billing/entitlements` and EX-29 `GET /v1/billing/catalog` now
have local gateway candidates. Both require the active app session inside the
transaction and return the canonical `unavailable` shape while provider,
pricing, catalog and entitlement policy remain open. They do not fabricate
rights, prices, currencies, offers or provider claims.

Checks: billing route/handler **14/14 PASS**; latest combined repository suite
**925/925 PASS**; TypeScript, affected ESLint, docs checker and `git diff
--check` **PASS**.

Live provider verification, RLS execution, paid services, Android checks and
independent security review remain **REVIEW_PENDING / NOT_RUN**.
