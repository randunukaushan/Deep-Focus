# Account portal privacy controls — 2026-10-09

Signed-in local portal users can download a small JSON account summary. It
contains only the email currently verified by the provider, export time and an
explicit `privateDataSync: not_enabled` status. It does not include access
tokens, private app records or local-device data. Account deletion is shown as
unavailable until a reviewed server-side identity/data workflow exists.

## සත්‍ය පරීක්ෂණ

- Website tests: `18/18 PASS`.
- සම්පූර්ණ bundled Node domain/component/navigation/website suite:
  `259/259 PASS` at this slice checkpoint.
- Portal source test confirms the export boundary, filename, deletion disabled
  state and absence of `access_token`.
- Provider session, private sync, deletion authorization, browser accessibility
  and deployment remain `REVIEW_PENDING` / `NOT_RUN`.
