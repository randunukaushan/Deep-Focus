# Classroom adapter feasibility self-review — FA-00

2026-10-01. **DRAFT / HIGH / REVIEW_PENDING. NO SQL EXECUTION.**

සිංහල: classroom සැලැස්මේ encryption කොටස කලින් සඳහන් SQL interface එකට
ඒ ආකාරයෙන්ම ගැලපෙන්නේ නැහැ. මෙය හමු වූ සැබෑ design ගැටලුවක්; feature එක
අත්හැරීමක් නොවේ. Edge Functions තුළ crypto කර, database transaction එකෙන්
අවසර සහ atomic writes පාලනය කරන මාර්ගයක් පහත යෝජනා කරනවා. මෙය තවම
implementation-ready contract එකක් හෝ independent security review එකක් නොවේ.

Authority: the owner's accepted continuation of HC-00 and September 29 ordinary
design delegation. [39](39-BOUNDED-CLASSROOM-SHARING-CONTRACT.md) owns feature scope;
[40](40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md) owns public wire and
[41](41-CLASSROOM-RECONCILIATION-AND-SQL-TEST-PREPARATION.md) owns access/admission;
[42](42-PRIVATE-TASK-TOMBSTONE-AND-IDENTITY-BRIDGE.md) owns identity/locks.
This review places the affected combination of [43](43-CLASSROOM-SQL-FUNCTION-AND-RUNNER-SPEC.md)
and [44](44-CLASSROOM-COMMAND-CURSOR-INVITATION-HELPERS.md) on **ADAPTER_HOLD**.
It does not replace the 22 public operations or authorize SQL/app writes.

Subsequent EB-00: [46](46-CLASSROOM-EDGE-DATABASE-BRIDGE.md) supplies the typed
draft bridge and reconciles 42–44. The unresolved-interface list below is the
FA-00 checkpoint, not an instruction to duplicate that work. Its counted mutation
set is corrected to thirteen (nine reads) against unchanged OpenAPI. ADAPTER_HOLD
still applies to runtime compatibility, key/nonce policy and independent review.

## 1. Findings and disposition

| ID | Finding | Disposition / implementation consequence |
| --- | --- | --- |
| FA-F1 | 44 requires AES-256-GCM invitation delivery inside a SQL helper, while 43 has unchanged inputs and public-only response JSON. Documented stock pgcrypto does not expose that GCM interface. | **ADAPTER_HOLD**. Do not implement that combination or silently substitute raw CBC/PGP. Draft a separate internal Edge/DB transport contract first. |
| FA-F2 | Valid JSON/JCS can contain decoded U+0000; PostgreSQL jsonb cannot represent it. Existing synthetic parser admitted it. | Draft transport correction applied in 40/44 and reference parser/vectors. Reject decoded NUL in keys/values before jsonb; no stripping or intent-changing replacement. Actual Edge handling NOT_RUN. |
| FA-F3 | HMAC exists in pgcrypto, but that does not supply JCS serialization, safe key custody or read-old/write-new rotation. | **OPEN adapter obligation**. Neither jsonb::text nor the Node fixture parser proves a SQL JCS implementation. Do not declare digest feasibility complete. |
| FA-F4 | Closed command identities cannot simply expire away while arbitrary old UUID commands remain admissible. | **OPEN retention/protocol decision**, already identified in 44. No arbitrary TTL or indefinite-retention approval; resolve before activation. |
| FA-F5 | Source Task storage has no durable owner/version/tombstone/transaction foundation. | **OPEN implementation dependency**, not solved by classroom contracts. Follow core migration/identity sequence before classroom SQL. |

FA-F1 evidence: PostgreSQL documents raw encryption modes CBC, CFB and ECB, and
warns that those raw functions provide no integrity check. Its PGP functions use
a different message format. Neither is the AES-GCM envelope defined in 44.
This finding concerns the documented interface, not every possible PostgreSQL
extension. No such extension is selected or installed here.
[PostgreSQL pgcrypto](https://www.postgresql.org/docs/18/pgcrypto.html).

FA-F2 evidence: jsonb rejects the zero Unicode code point because PostgreSQL text
cannot represent it. This is a storage-profile restriction, not a claim that JCS
or all JSON forbids NUL. JSON Schema validation alone does not preserve duplicate
member evidence or enforce this raw-decoding stage.
[PostgreSQL JSON types](https://www.postgresql.org/docs/16/datatype-json.html).

## 2. Corrective direction — Edge crypto, database authority

**Recommendation, not an adopted adapter contract:** retain the selected
Supabase platform; use the Edge runtime's Web Crypto for AEAD and canonical
command preparation, and retain PostgreSQL for fresh authorization, locks,
uniqueness, immutable record bindings and atomic domain/receipt writes.
Deno documents built-in AES-GCM encryption/decryption with a 256-bit key. This
makes the placement plausible, not proven in our exact Supabase runtime/version.
[Deno AES example](https://docs.deno.com/examples/aes_encryption/).

Supabase documents direct Postgres connections from Edge Functions, including
transaction-pooler use with prepared statements disabled. This supports exploring
one explicitly bounded transaction, but does not prove compatibility of our
custom gateway role, grants, TLS verification or chosen driver/runtime.
No example's postgres superuser connection becomes the application's role.
[Supabase Edge/Postgres integration](https://supabase.com/docs/guides/functions/connect-to-postgres).

The separation below is a design inference from those capabilities. It requires
reconciliation, not a new provider or a weaker public API:

| Work | Proposed place | Non-negotiable constraint |
| --- | --- | --- |
| Raw JSON validation, JCS, purpose-separated HMAC | Trusted Edge, before mutation entry | Verify actor first as required by existing transport rules; reject duplicate names/NUL; bind exact validated intent and resolved scope; no payload logs |
| Key loading and active/read-old key selection | Trusted Edge, before acquiring domain locks | Reviewed custody/rotation; never fetch a key over a network while DB locks are held; no secret in SQL parameters/public DTOs |
| Resolve scope/receipt metadata needed for preparation | New narrowly granted internal preparation seam, if required | Fresh authorization; no domain mutation; no raw-table gateway access; result is a hint, never durable authorization |
| Recheck authorization, key/version expectations and prepared-record bindings | Atomic SQL entry under 42's lock order | Preparation cannot bypass revoked session, changed policy, replay conflict or scope checks |
| Encrypt/decrypt invitation token | Trusted Edge Web Crypto | 44's GCM key/nonce/tag/AAD profile retained; only DB-selected currently authorized record may be delivered |
| Domain change + delivery envelope + receipt | One database transaction | All commit or all roll back; uniqueness resolves races; only one committed invitation for one command |
| Public response construction/validation | Edge, inside bounded transaction before COMMIT | Validate internal result first; verify/decrypt locally with already available key; produce exact 40 response; release only after successful COMMIT |

This does **not** mean that request preparation is fully possible before every
database read. CW-08 and CW-16 need authorized scope resolution; a replay needs
the receipt's recorded digest key. The internal preparation seam must have
concrete inputs/results/grants and neutral error behavior, followed by a final
locked recheck. Do not add an undocumented service-role table query to fill that
gap. A race or missing locally loaded historical key causes rollback and bounded
re-preparation/fail-closed, never a network lookup under locks or a new command ID.

## 3. Exact contract changes that must precede bodies

These are **unresolved internal interfaces**, not optional implementation details.
43's signature matrix stays a historical candidate with its hold notice; public
schemas do not acquire these fields. A subsequent bounded bridge specification
must replace affected signatures/mappings and update their checker together.

1. **Digest material:** choose typed internal digest inputs for all fourteen
   mutations, including version/key ID and original receipt-key reconciliation.
   Canonical intent includes resolved scope, so define preparation-to-entry binding
   and recheck. If Edge supplies a MAC, explicitly document that SQL trusts this
   assertion from its already trusted gateway, not from an authenticated client.
   A compromised gateway is not contained by client RLS alone; no contrary claim.
2. **Invitation issuance:** define prepared token digest, candidate immutable
   invite identity/expiry, AEAD envelope and policy/key revision bindings. Only
   the final entry can admit a fresh command. It must compare prepared identities
   against actual actor/class and current policy; it cannot silently change AAD
   expiry or IDs after encryption. A stale proposal rolls back/re-prepares.
3. **Replay result:** CW-05 must return an internal delivery envelope/record
   reference under current authorization, rather than requiring SQL to decrypt
   into the public InviteView. Edge must decrypt the **stored winner**, not return
   its own losing prepared token. Closed/expired invitation projects null token;
   expired command remains COMMAND_EXPIRED. No public ciphertext/key metadata.
4. **Return boundary:** separate internal result schema from public response
   schema, with exact allowlisted projection, size/version checks and no accidental
   passthrough. Specify closed-state projection without inventing a token, and
   failures as safe DEPENDENCY_UNAVAILABLE, not successful empty delivery.
5. **Shared helpers/grants:** locate cursor CSPRNG/hash helpers, digest/AEAD
   helpers and internal preparation owners explicitly. Retain 42/43's no direct
   gateway table access and no public/client function EXECUTE. Update exact grants,
   helper signatures, tests and migration inventory together; no hidden privilege.
6. **Nonce and key lifetime:** choose a reviewed per-key nonce allocation/bound
   and rotation scheme. Randomness alone is not a proof of no reuse across
   isolates, retries and restores. Collision handling must never overwrite a
   committed record. Retired key loss must not issue a replacement invitation.

Prepared candidates may be discarded without persistence. This proposed Edge
path would refine 44's SQL-only “generate/encrypt only for fresh command” wording:
only **admitted fresh commands persist** new tokens/envelopes; duplicate preparation
is ephemeral and never delivered. That refinement is not activated by this review.
No operation may commit the domain mutation first and add its delivery record in
a later transaction. No external encryption/KMS call belongs under database locks.

## 4. Consolidated consistency check — document evidence only

| Invariant | Source / review outcome | Remaining proof |
| --- | --- | --- |
| Bounded private education flow, not LMS/chat/files | 39/40/41 aligned in reviewed contracts | Real API/UI scope and leakage tests |
| No private Task/acceptance/focus-history fields or joins in educator output | 40 projections + 41 access predicates + 42 private-link boundary aligned | Actual grants/RLS/direct-access negatives |
| Deleting Task never recreates it on replay/fresh acceptance; does not withdraw a separately shared report | 42 durable identity + 44 replay aligned | Core delete/erasure races and restore execution |
| Revocation/session expiry is checked after lock waits; replay is not authorization | 42 + 43 + 44 aligned | Pool reuse, revocation race and privilege tests |
| Cursor binds actor/session/scope/query, uses visible-row keyset ordering | 40 list wire + 44 auxiliary registry aligned | Exact DB timestamp/UUID ordering and cross-account pages |
| Invitation and command replay return only current authorized state | Public semantics aligned; SQL/Edge crypto placement conflicts | FA-F1 bridge correction plus concurrent issue/redeem tests |
| No acknowledgement before committed receipt and validated public response | 40/43 aligned; Edge crypto proposal must preserve it | Forced rollback, lost response and unknown-commit recovery |
| Auxiliary security data belongs in deletion/retention/export inventory | 41/44 identify storage; no automatic public export fields | Approved policy, serializer/access process and restore tests |

“Aligned” means no contradiction found in these selected clauses, not a complete
audit of every project document and not independent acceptance. Current app source
does not implement these invariants. No new participant data is collected here.

## 5. Concrete verification handoff

The existing [helper checker](check-classroom-helpers.mjs) now exercises decoded
NUL rejection in a direct value, nested array value and object key, and preserves
literal backslash-u text. Existing Unicode, equivalent-escape and canonical HMAC
vectors must still pass. It remains a restricted fixture parser, not an approved
production JSON package or proof of SQL/Deno execution.

Before adapter acceptance, extend the existing TX/TI execution packet with these
specific probes; each is **NOT_RUN**, not an additional completed test count:

- Actual Edge rejects raw duplicate/decoded-NUL inputs as VALIDATION_FAILED before
  invoking jsonb; literal backslash-u text survives unchanged into digest/storage.
- Two prepared CW-05 requests with the same command commit one stored envelope;
  both successful replies deliver its same token, never a loser's token.
- Revocation/policy/key/receipt changes between preparation and locked entry deny
  or re-prepare without a second mutation; no network work occurs under locks.
- Alter ciphertext/tag/nonce/AAD/record binding: no token is disclosed. Check
  real Deno AES-GCM tag layout against a fixed external oracle and SQL encoding.
- Force envelope write/response validation/COMMIT failure: no premature success;
  unknown commit recovers with original command. Lost or retired key fails closed.
- Verify exact runtime/version, pool transaction affinity, TLS, custom login/grants,
  raw-data/log redaction and fixed function resolution in an authorized disposable
  environment. Include account-switch and denied direct-client access probes.

Next dependency-safe documentation task: define that narrow Edge/SQL bridge and
reconcile 43/44 plus their signature/grant tests. Key custody, retention/eligibility
facts, production quotas, qualified independent review and isolated execution
authority remain separate gates. No purchase, installation, agent or live test
was performed. Actual local evidence is in [FA-00 audit](09-COVERAGE-AND-AUDIT.md).

Sources checked October 1, 2026. PostgreSQL versions cited document capabilities;
they are not a discovered deployed server version. Research does not validate
our production security or establish legal facts.
