# Single development Auth account retirement — 2026-10-20

TASK: Retire only the owner-specified existing Auth identity so the owner can
register again with a new password themselves. This is not implementation or
acceptance of the application's general account-deletion feature.
STATE: OPERATION_EXECUTED; RISK: HIGH — irreversible retirement of one Auth identity.
AUTHORITY: Owner explicitly requested removal of their exact email account only,
after being warned that removal may be permanent. Target was resolved read-only
by exact normalized email in the confirmed deep-focus-dev project
`wffyrevlhnqiycoybqia`; matching user UUID is
`b4cf15f2-37ed-4255-9c02-e243ab5f73ea`. Do not store email/password/token values
in this record. No permission to remove other accounts, domain data or local data.

READ: AI_RULES, execution policy, DoD, engineering guardrails, task brief/map;
SECURITY Data Deletion / Account Deletion / Backups and Deleted Data;
Supabase skill and current managing-user-data / Storage ownership documentation.
INSPECTION: One matching verified Auth user, one session and one identity;
zero df_private.profiles rows and zero owned storage.objects. Auth-user FKs were
inspected; the only application reference is profiles with ON DELETE RESTRICT.
No non-internal triggers exist on auth.users/auth.sessions. Other Auth identities:
four, fingerprint `24353f1b62380cf1bf7252d2523031cd` (sorted UUID MD5 only).
Dirty application/backend work is preserved, no source/config/migration change.

ALLOWED: Only this evidence record locally; remotely, exact target Auth sessions,
refresh credentials and user identity with its FK-dependent Auth rows.
NON-GOALS: No profile/workspace/task/history/file/local SQLite deletion; no SMTP
change, RLS/schema change, disabling confirmation, user recreation, new password,
backup/log erasure, deployment, production rollout or new deletion API.
ACCEPTANCE: Target absent; target sessions/refresh credentials/identities absent;
other Auth user count/fingerprint unchanged; stop if target ID/email mismatch,
new profile/storage ownership or unexpected dependent data appears.
METHOD: Exact UUID and email guard, row lock, current dependency checks and
row-count assertions in one transaction. Revoke sessions/refresh before identity
retirement. Abort/roll back on any mismatch; never disable constraints/triggers.
Recovery: rollback before commit on failed assertions; committed identity
retirement is not promised recoverable. Provider backups/audit may retain records.
JWT caveat: an already-issued JWT may remain cryptographically valid until expiry;
session-bound gateway rejection is not the same as changing token signatures.
CHECKS: Read-only project/account/FK/trigger/storage preflight above passed.
Executed one guarded transactional DO statement: exact target UUID/email lock,
dependency and other-account baseline assertions, session/refresh retirement,
exactly-one Auth user deletion and final absence/isolation assertions. No SQL
error returned. A separate subsequent SELECT confirmed zero target users,
sessions, refresh credentials and identities. Four other users remain with the
same sorted UUID fingerprint. No other accounts/local data were deleted.
Recovery: committed deletion is not recoverable through the app; no guarantee
is made about provider backup/audit retention or cryptographic JWT expiry.
Owner will recreate their account themselves; signup/inbox delivery NOT_TESTED
by this operation. Independent review was not performed; this is not general
account-deletion feature acceptance or security/release certification.
