# Backend evidence — safe gateway diagnostics (2026-10-10)

The gateway now accepts an optional diagnostic callback. It receives only the
allowlisted event, mapped status/code, retryability and a validated request ID.
It never serializes the original error, stack, SQL detail, token or request
body. Diagnostic callback failures are swallowed so the public error boundary
remains stable.

## Actual checks

- Error-boundary and gateway diagnostic checks: **14/14 PASS**.
- Full bundled-runtime suite: **670/670 PASS**; TypeScript, affected ESLint
  and docs checker: **PASS** (228 Markdown, 936 links, 80/80 requirements).
- Remote logging sink, retention/redaction configuration, independent security
  review and Android verification: **NOT_RUN / REVIEW_PENDING**.

## Boundaries

No credentials, remote logs, Supabase project, production data, deployment,
commit or push was touched.
