# Classroom command, cursor and invitation helpers — HC-00

2026-09-30. **DRAFT / HIGH / REVIEW_PENDING. NO SQL EXECUTION.**

සිංහල: එකම request එක නැවත යැවූ විට වැඩ දෙවරක් නොකිරීම, list එකේ ඊළඟ page
එක ආරක්ෂිතව ලබාදීම සහ invitation එක එක්වරක් පමණක් භාවිත කිරීම මෙහි සකස්
කර ඇත. මෙය app/backend implementation එකක් නොවේ. Synthetic test values සැබෑ
users සඳහා මිල, කාලසීමා හෝ ආරක්ෂක policy ලෙස භාවිත කරන්න බැහැ.

Authority: accepted continuation of [SF-00](43-CLASSROOM-SQL-FUNCTION-AND-RUNNER-SPEC.md).
[40](40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md) remains public DTO authority;
[41](41-CLASSROOM-RECONCILIATION-AND-SQL-TEST-PREPARATION.md) and
[42](42-PRIVATE-TASK-TOMBSTONE-AND-IDENTITY-BRIDGE.md) retain authorization,
identity, lock, deletion and privacy rules. No new public endpoint/body field.
Names and structures below are proposed internal contracts, not created functions.

## 1. Canonical command identity — digest version 1

Input to the internal commandDigest helper is exactly:

```text
{
  digestVersion: 1,
  actorId: verified actor UUID,
  operation: one of the thirteen mutation CW IDs,
  scope: {kind: "creator" | "class", id: resolved UUID},
  selectors: exact UUID path selectors for that operation (or {}),
  command: {contractVersion: 1, commandId, expectedVersion, payload}
}
```

CW-01 uses creator/actor scope, not the not-yet-created class ID. Every other
mutation uses its resolved class ID, including CW-08 resolved from invitation and
CW-16 resolved from own submission. An inaccessible selector/token fails before
its existence is revealed. A current own-privacy action may resolve scope without
requiring current class membership, as specified in 41. Read operations have no
command digest. Never derive actor/role/scope from a client identity field.

Actor, scope, path-selector and commandId UUIDs are lowercase canonical forms.
Payload strings, including payload UUID spellings, are otherwise preserved exactly
after validation: no trimming, case folding, Unicode normalization, date-string
rewriting or enrichment from current Task data. Object key order/JSON whitespace
and equivalent escape spellings are not intent differences. A changed string,
expectedVersion, path, actor, scope, operation or command ID changes the digest.
Exclude access token/session/expiry, HTTP request ID, retry count and device time;
renewing a valid session must not change a confirmed command's identity.

Serialize with RFC 8785 JCS, then UTF-8 without BOM. Validate the unchanged DTO
before serialization. Reject duplicate decoded member names at **every depth**
before ordinary JSON parsing/jsonb conversion, invalid Unicode/lone surrogates,
decoded U+0000 in keys or string values, nonfinite numbers and values outside
schema numeric bounds. NUL exclusion is our PostgreSQL storage profile, not a JCS
requirement; preserve literal backslash-u text and never strip/replace characters.
The present schemas
use bounded integers; the local reference checker deliberately supports only safe
integers, not a general-purpose JCS implementation. Do not use database jsonb text
output, locale sorting or a request's original byte order as canonical encoding.

Digest = full 32-byte HMAC-SHA-256 with a purpose-specific server key over:
`UTF8("deep-focus/classroom-command/v1") || 0x00 || UTF8(JCS(input))`.
Production key material must be independently generated with at least 256 bits
and never shared with invitation encryption, JWT signing or other purposes. The
HMAC limits offline guessing of low-entropy content from a leaked receipt; it is
not authorization or encryption of the request. Canonical bytes/raw payload are
ephemeral and never receipt/log fields. Compare digests without early byte exits.

Refine private_classroom_commands with digest_key_id and replay_state (active or
closed), in addition to existing digest_version/digest/result identity/expiry.
Store full binary digest, not a shortened prefix; result is an identity pointer,
not private content. A new receipt uses the active key; replay uses **that receipt's**
recorded version/key. Missing old key/version fails DEPENDENCY_UNAVAILABLE, never
falls back to a current key and treats the request as new. Rotation requires a
reviewed read-old/write-new key schedule; compromised-key response is a separate
security action, not automatic reprocessing. No key/provider is created here.

### Replay decision order (inside the authorized atomic operation)

1. Validate transport/DTO and fresh verified account/session/own or membership
   authority. Acquire/recheck 42's guards; receipts never substitute for authority.
2. Locate the scoped key (actor, scope, operation, commandId). For CW-14, enforce
   additional uniqueness (actor, operation, commandId) across assignments first;
   reuse for another assignment conflicts without disclosing the other assignment.
3. Existing closed/expired receipt: COMMAND_EXPIRED, even when payload is unchanged.
   Do not replay old mutation or silently generate a replacement command.
4. Existing active receipt: derive digest with its key/version. Mismatch gives
   COMMAND_CONFLICT; match returns a **current authorized** projection. A withdrawn
   report stays withdrawn; deleted acceptance stays deleted; revoked auth denies.
   Replay does not extend expiry or issue a second invitation.
5. No receipt: run fresh-action lifecycle/version/policy checks, domain uniqueness
   and the atomic mutation + receipt. A known closed command must never reach this
   branch. Rollback leaves no committed success receipt. A duplicate race loser
   re-enters receipt resolution, not a second independent mutation.

Current read authority comes before replay; fresh mutation preconditions apply
only to branch 5. Thus a legitimate replay need not pretend expectedVersion is
still current. Receipt absence after a failed transaction is different from an
expired receipt. CW-20 recovery follows the same authenticated expiry rule; a new
authorized CW-14 command still resolves the durable existing/deleted acceptance.

### Cleanup cannot reset command identity

An expired UUID command carries no trustworthy creation time. Deleting its only
receipt would let some old operations (especially class creation/invite issuance)
run again. Proposed closed marker retains actor/scope/operation/commandId and
closed state; raw payload is never present. Removing digest/result fields after
closure requires the reviewed privacy policy and must not remove this denial key.
This is a refinement of receipt storage, **not approval of indefinite retention**.

For active accounts, a TTL alone cannot prove an old UUID is unusable. Before
purging denial keys, require an independent permanent admission barrier (such as
completed account erasure that cannot be rebootstraped) or an explicitly reviewed
future protocol change. The current protocol has no timestamp-based purge proof.
If retention obligations conflict, stop activation and resolve policy/protocol;
do not invent a retention period or silently weaken dedupe. 42's separate deleted
Task acceptance identity remains necessary even for **fresh** commands.

## 2. Opaque cursor handles and stable keyset pagination

Chosen draft: a random 32-byte server-side cursor handle, base64url without padding
(43 characters), backed by a small private registry. This fits the existing
1–512-character Cursor schema; it does not make all syntactically valid strings
valid handles. It avoids embedding user/class IDs or private data in a URL and
does not introduce custom signed/encrypted client tokens. Handle possession alone
is insufficient: authenticate and enforce all recorded bindings/current rights.

Digest lookup = SHA-256 of ASCII `deep-focus/classroom-cursor/v1`, one zero byte,
then the decoded 32 token bytes. Store no plaintext handle. This unkeyed digest is
for a uniformly random 256-bit secret, unlike the keyed low-entropy command input.
Generation requires a server CSPRNG; UUIDs, timestamps, Math.random and short PINs
are not substitutes. Decode strictly and re-encode to verify canonical base64url;
otherwise alternative final padding-bit spellings can identify the same bytes.

New **auxiliary** registry candidate: private_classroom_cursor_handles, with
handle_digest unique, cursor_version=1, actor_id, provider_session_id, operation,
scope_kind/id, selectors, filter_version=1, filter={} (no public filters yet),
page_limit, order_version=1, last_created_at, last_id, issued_at, expires_at.
No names, assignment content, selected progress or token plaintext. Cursor rows
are immutable; no sliding expiry. This is additional private security storage,
not one of 40's eleven domain tables. Inventory retention/export/deletion and
account-session cleanup alongside invitation delivery and account/session guards.

| Operation | Scope / selectors bound | Fixed sort key |
| --- | --- | --- |
| CW-02 | actor; {} | classrooms.created_at DESC, classrooms.id DESC |
| CW-18 | class; {classId, assignmentId} | classroom_submissions.created_at DESC, classroom_submissions.id DESC |
| CW-19 | class; {classId} | classroom_assignments.created_at DESC, classroom_assignments.id DESC |
| CW-22 | class; {classId} | classroom_memberships.created_at DESC, classroom_memberships.id DESC |

Creation timestamp and UUID are immutable; UUID comparison uses PostgreSQL UUID
ordering, not localized string sorting. Preserve exact DB timestamp precision
in registry boundaries (do not round through JavaScript Date). On each page:

1. Authenticate current session; authorize endpoint/scope. For a supplied handle,
   validate format/lookup, actor/session/operation/scope/selectors/filter/limit/order
   bindings and issued_at <= serverNow < expires_at. Never trust a client timestamp.
   Bind selector/scope UUIDs in canonical lowercase form, not raw URL spelling.
2. Query only currently authorized visible rows. Apply keyset tuple strictly less
   than (last_created_at,last_id) for continuation, with identical fixed ordering.
   Permission predicates and content projection belong to the same read snapshot.
3. Fetch limit+1 **visible** rows, return at most limit. If an extra row exists,
   create a new handle bound to the last **returned**, not extra, row; otherwise
   nextCursor=null. No total counts, private-acceptance joins or lookahead leakage.

Omitted limit resolves to 20 on every request; to continue a page issued at 50,
send 50 again. Changing limit restarts pagination. Replaying an unexpired handle
is permitted but rechecks rights and queries current rows; it is not a cached
snapshot. Concurrent changes may remove rows or add newly visible older rows;
no frozen-roster/export consistency promise. Newer rows normally appear on refresh.
With unchanged visibility/rows, pages neither repeat nor skip equal-time UUIDs.

All handle syntax/unknown/expired/mismatch cases return generic VALIDATION_FAILED
(400) after authentication/current endpoint authority, without naming the mismatch.
Missing auth remains 401; inaccessible class remains neutral 404. Missing registry
or required configuration is 503, not empty successful pagination. UI offers a
first-page refresh; it never broadens scope or auto-logs another account in.

Only an internal cursor helper owner may INSERT/SELECT exact registry fields under
verified context; per-operation entry roles get scoped helper EXECUTE, not raw
registry rights. Client/gateway roles get no direct helper/table access. These
public READ operations may write auxiliary cursor state, **never domain state**;
43's effect flags remain about product mutations. Expired handles can be removed
because missing handles always reject, unlike missing command receipts. Cleanup
must not resurrect handles from backup; renewed auth/access is checked regardless.
No raw cursor/query URLs in telemetry. Bound issuance/rate/storage via reviewed
configuration; if limit is reached return safe 429/503, not an unbound cursor.

## 3. Invitation helper contract

Token = base64url-no-padding of 32 CSPRNG bytes; strict canonical decoding as above.
Lookup = SHA-256 of ASCII `deep-focus/classroom-invite/v1`, one zero byte, then
the 32 decoded bytes. Cursor and invitation digests cannot be interchanged. An
invitation is a single-use admission credential, not educator verification, age
consent or permission to read a roster. A malformed token is 400; a well-formed
unknown/expired/revoked/other-consumed token is generic INVITATION_UNAVAILABLE.

Internal helper seams (typed behavior, not installed SQL signatures):

| Helper | Input | Result / effect |
| --- | --- | --- |
| commandDigestV1 | Validated canonical input + purpose-specific key/version reference | Exactly 32 digest bytes, no persisted plaintext |
| cursorIssueV1 | Verified context + bound query + exact last tuple + current policy | New 43-character handle after durable registry write; never exposes registry fields |
| cursorResolveV1 | Verified context + handle + expected query bindings + trusted now | Exact continuation tuple or safe failure; never grants endpoint access |
| inviteIssueV1 | Authorized class/issuer + confirmed CW-05 command + policy/key config | One invite, encrypted delivery record and command receipt in one atomic group |
| inviteDeliveryV1 | Current authorized issuer + invite identity + trusted now | Same token only while issued and unexpired; otherwise token=null |
| inviteConsumeV1 | Fresh verified learner + canonical token + CW-08 confirmed payload | One membership + consumed invite + receipt, or all rolled back |

Issue: validate required policy/key readiness before mutation; serialize class and
receipt lookup. Per 46, Edge may prepare ephemeral candidates after a fresh hint;
only an **actually fresh** command persists one. Discard losing candidates and
deliver only the database-selected envelope. Collision with an
existing token digest aborts the attempt and retries fresh randomness within a
reviewed bound before commit, never overwrites another invite. Encrypted delivery
must commit atomically with invite/receipt. A key-service/network failure cannot
leave an acknowledged invite with no recoverable delivery copy.

Delivery record minimum: invite_id, class_id, issuer_id, encryption_version,
encryption_key_id, nonce, ciphertext, authentication_tag, expires_at. Proposed
cryptographic profile: vetted AES-256-GCM, 96-bit nonce, 128-bit tag, no nonce reuse
under the same key, plaintext is the 32 token bytes. Authenticate immutable record
identity, version, key ID and expiry as associated data using the same canonical
encoding rules. Do not implement raw AES, omit tag verification or use a fixed IV.
Exact associated-data object: {purpose:"deep-focus/classroom-invite-delivery/v1",
encryptionVersion:1, keyId, inviteId, classId, issuerId, expiresAt}; UUIDs canonical
lowercase, expiresAt the immutable stored UTC representation. Both encryption and
decryption use its identical UTF-8 JCS bytes. Moving ciphertext to another record
or changing identity/expiry must fail authentication, not return another token.
Provider/key custody/rotation and a compatible reviewed server implementation are
**not selected or installed**. This is a required adapter contract, not a claim
that stock PostgreSQL exposes this primitive or that a crypto library is approved.

**October 1 EB-00 amendment:** the earlier SQL-only placement with unchanged 43
arguments is replaced by [46's bridge](46-CLASSROOM-EDGE-DATABASE-BRIDGE.md): Edge
JCS/HMAC/AEAD, SQL authorization/atomic storage and restricted cursor/lookup hashing.
43 now has mutation material and an internal CW-05 delivery result. ADAPTER_HOLD
remains for policy, shared dependencies, qualified review and actual integration.
Public payloads never carry trusted flags, keys or internal ciphertext. Retain
the AEAD profile and atomic persistence above; no external key-service network
work under locks and no downgrade to unauthenticated encryption. Neither this
checker nor the proposed direction establishes a working adapter.

Replay of CW-05 returns the same token only to a currently authorized issuer while
issued/unexpired and within command recovery validity. Closed invite returns null
token; expired command returns COMMAND_EXPIRED. Missing/corrupted delivery for an
otherwise usable invite fails 503; never silently issues a replacement. Key/tag
failure reveals no plaintext. Closed ciphertext removal follows reviewed cleanup;
ordinary reads stop revealing token immediately regardless of cleanup progress.
An expired issued row projects the existing expired wire state with token=null,
not an invalid issued-state/null-token combination; it need not wait for a cleanup job.

Preview does not consume or reserve. Consume rechecks current account/eligibility,
class state, canonical token, server expiry and membership restrictions under the
same class guard; no role taken from request. Exactly one eligible learner wins.
Failure after membership insert/redemption/receipt rolls back all. Same successful
command may recover current permitted membership without consuming again; a new
command using a consumed token is unavailable and cannot revive left/revoked
membership. No automatic rejoin or teacher-profile self-promotion.

Initial transport candidate is authenticated in-app token entry/paste with an
explicit user copy/share action by the issuer, no automatic clipboard read/write.
No token-bearing public preview, search index, analytics, referrer or URL query.
Signed-out handling is generic. Public deep-link transport needs separate reviewed
redaction/landing handling; this packet does not invent a safe link implementation.

## 4. Synthetic policy and verification boundaries

[Vectors](contracts/classroom-helper-vectors.json) use syntheticOnly=true and
executionAuthorized=false. Fixture-only time constants: cursor 600 seconds,
invite 900 seconds, active command recovery 86400 seconds. Boundary tests use a
fixed epoch and now==expiry is expired. These values are **not recommendations or
defaults** for production. Eligibility is synthetic allow/deny, not an age/legal
claim. No production price, rate, roster cap, key location or retention is selected.

[Read-only helper checker](check-classroom-helpers.mjs) runs restricted canonical
encoding/HMAC reference vectors, canonical token decoding/domain separation and
small pure replay/cursor/invitation predicate models. One command HMAC golden was
computed independently using .NET HMACSHA256; an RFC 4231 primitive vector is also
checked. This is two-library vector agreement, **not independent security review**.
No app imports, actual randomness quality test, SQL/HTTP/provider/native access,
cryptographic delivery adapter or production configuration is exercised.

Required real extensions to existing TX/TI cases, all **NOT_RUN**:

- TX-01/08/12/19: concurrent duplicate and altered intent; expiry marker survives
  cleanup/restore; retired/missing key and unsupported digest version fail closed.
- TX-20/TI-T11: actual cursor registry/helper grants; changed actor/session/scope/
  limit; revocation between pages; equal timestamp boundaries and account switch.
- TX-02/03/04/18/24: real CSPRNG and canonical token validation; encryption tag/
  nonce/associated-data negatives; failure at every delivery/redemption write;
  expired-token replay, safe copy/paste and no token in logs/exports.
- TX-21/TI-T07/08: registry/delivery/denial-marker inventory, lawful cleanup,
  erasure and isolated restore with current authority; no replay resurrection.

Next safe step is review of the consolidated 39–44 design and specific adapter/
shared-schema feasibility, not another feature expansion. Production policy and
independent review need their named authority. No SQL/app execution follows merely
because reference vectors pass. Evidence: [HC-00 audit](09-COVERAGE-AND-AUDIT.md).

## 5. Research sources and limits

- Deterministic JSON encoding, duplicate-name exclusion and Unicode preservation:
  [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785). Our envelope/key policy is an
  application design, not part of that RFC; the checker is a restricted reference.
- Public primitive test vector: [RFC 4231](https://www.rfc-editor.org/rfc/rfc4231).
- Cryptographically generated, time-limited, single-use token precautions are
  analogous to reset-token handling; this is not a password reset feature.
  [OWASP token guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).
- Authenticated encryption and key separation/custody require deliberate design.
  [OWASP cryptographic storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html).

Sources checked September 30. None validates our deployed security or establishes
Sri Lankan eligibility/retention law. HIGH independent review remains PENDING.
