# Classroom Edge/database bridge — EB-00

2026-10-01. **DRAFT / HIGH / REVIEW_PENDING. NO SQL EXECUTION.**

Started October 1; local verification/handoff completed October 2 (Asia/Colombo).

සිංහල: Edge එක request එක validate කර crypto වැඩ කරයි. Database එක අවසාන
අවසර, වෙනස් වී ඇති state සහ duplicate requests පරීක්ෂා කර එක transaction
එකකින් save කරයි. කලින් සූදානම් කළ request එකක් අවසරයක් නොවේ. Invitation
replay එකේදී ලැබෙන්නේ database එකේ commit වූ එකම token එකයි.

Owner accepted this bounded continuation of [FA-00](45-CLASSROOM-ADAPTER-FEASIBILITY-REVIEW.md).
This explicitly revises the **draft** internal placement/signatures in 42–44;
it does not adopt production security or change [40's public wire](40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md).
FA-F1's missing transport now has a concrete candidate. **ADAPTER_HOLD remains**
until qualified review, compatible shared DDL/key policy and real integration.
No new public endpoint, provider, installed library or SQL file is introduced.

## 1. Call inventory and exact transport

Internal DTO authority: [bridge schema](contracts/classroom-bridge.schema.json).
Every object is closed; no unknown fields, SQL NULL arguments, defaults or overloads.
UUIDs in bridge metadata are lowercase; public payload strings are not rewritten.
The public raw-decoding/size/duplicate/NUL guards in 40/44 remain mandatory.

One new server-only entry, **df_api.classroom_prepare_v1**, has positional args:

```text
p_actor_id uuid, p_provider_session_id uuid, p_token_expires_at timestamptz,
p_operation text, p_selectors jsonb, p_input jsonb RETURNS jsonb
```

p_operation is exactly one of the thirteen mutation CW IDs; selectors are the
exact camelCase UUID path fields of that operation, or {}. p_input is its complete
unchanged public command. Resolve a static allowlist, never dynamic SQL. Result
is Preparation. The existing nine reads do not call this preparation entry.

For each of 43's thirteen MUTATION entries append **p_bridge jsonb** after p_input;
its type is MutationMaterial. Each of the nine READ signatures stays unchanged.
Only CW-05's result changes to **BridgeInviteResult**. Other 21 operation results
remain their public success schemas. HTTP CW-05 still returns InviteViewResponse.
43's matrix labels public input, internal result and effect; there are **23**
gateway-callable signatures: 22 operations plus preparation, not 23 public routes.

Preparation fields: bridgeVersion=1, operation, commandId, scope, mode=fresh|replay,
policyRevision, digest={version:1,keyId}, issue=IssuePlan|null,
deliveryKeyId=KeyId|null. Scope is creator/actor for CW-01 and resolved class for
all others (including token-resolved CW-08 and own-submission CW-16).
IssuePlan contains inviteId/classId/issuerId/expiresAt/keyId. It is present only
for fresh CW-05; deliveryKeyId is present only for replay of still usable CW-05.
Closed/expired receipts fail COMMAND_EXPIRED, not a Preparation success.

MutationMaterial fields: bridgeVersion=1, operation, commandId, scope,
policyRevision, digest={version:1,keyId,macHex}, issue=PreparedInvite|null.
PreparedInvite is IssuePlan plus encryptionVersion=1, tokenDigestHex, nonceHex,
ciphertextHex and tagHex. Non-CW-05 material requires issue=null. Preparation's
mode is deliberately absent: a stale hint cannot select the final branch.

KeyId: 1–64 ASCII letters/digits/underscore/hyphen, case-sensitive opaque reference,
never the key. policyRevision: immutable positive configuration revision up to
2147483647, not the learner's consent policyVersion. A changed security setting
increments it; missing configuration fails closed. All hex lowercase: mac/digest
32 bytes, nonce 12 bytes, ciphertext 32 bytes, tag 16 bytes. No raw key/JWT/token.
Issue expiry is server-proposed UTC with exactly six fractional digits; preserve
that spelling for AAD/storage/replay, not a JavaScript Date round trip.

## 2. Preparation is an authorized read, not a reservation

Run preparation in its own short transaction, validate its result then finish
that transaction before key loading/encryption. It creates no domain/receipt/
delivery row, consumes no invitation and does not reserve a command or nonce.
“Read-only” describes its data effects, not a PostgreSQL READ ONLY transaction
setting: its reviewed guard helper may need row locks, with no domain mutation.
It enforces fresh verified actor/session/account and 41's current read/own rights;
guarded reads recheck after waits and release all locks before returning to crypto.
CW-16 own-withdrawal and CW-20 recovery rights after leaving remain unchanged.

Look up the scoped receipt and CW-14's cross-assignment unique command identity.
Conflict there denies without exposing another assignment. Closed/expired receipt
denies before key lookup; active replay selects its recorded digest version/key.
Absent receipt selects active command key and current policy revision. An active
replay need not satisfy old expectedVersion/fresh lifecycle preconditions. Resolve
CW-08 from the retained invite identity; consumption by the same recorded command
must not accidentally block its authorized replay. Unknown/other-consumed tokens
retain the neutral unavailable response. Receipt purge rules in 44 are unchanged.

Fresh CW-05 additionally checks issuance eligibility/configuration and proposes
a new server UUID, current class/issuer, expiry=server preparation time+configured
TTL and active delivery key ID. A replay instead supplies its stored delivery key
reference only when still usable. No ciphertext or token is disclosed in preparation.
No arbitrary production TTL, price, retention or eligibility rule is selected here.

## 3. Local crypto and authoritative final transaction

Edge validates Preparation bindings to the current actor, operation, commandId
and known selectors. It calculates 44's JCS/HMAC over the original validated intent
and resolved scope, using the indicated key; no SQL jsonb serialization. For fresh
CW-05 only, generate 32 token bytes, lookup digest and GCM envelope before locks.
Read-old/write-new keys are loaded before the final transaction. A missing key or
unsupported version fails 503, never a replacement command/token or weaker mode.

Final entry uses 42's same identity/lock order and current clock, then:

1. Revalidate public DTO and strict bridge shape, operation/command/selector/scope
   bindings. Re-resolve current scope and authority. Forged/mismatched bindings
   fail closed; preparation never overrides revoked membership/session or ownership.
2. Resolve actual receipt and cross-assignment identity under locks. Closed/expired
   receipt => COMMAND_EXPIRED. An active receipt with differing version/key reference
   => internal PREPARATION_STALE. Same key but different MAC => COMMAND_CONFLICT.
   Matching MAC => current authorized replay; ignore any unused prepared issue.
3. For no receipt, require current policyRevision and active digest key/version.
   Changed references => PREPARATION_STALE before writes. Then enforce actual
   fresh expectedVersion/lifecycle/eligibility/domain uniqueness, not hints.
4. Fresh CW-05 requires issue, matching class/issuer, supported encryption version
   and current delivery key. Require serverNow < expiresAt <= serverNow+currentTTL
   and unchanged policy revision. Do not rewrite identity or expiry after AEAD.
   Expired proposal/key rotation => PREPARATION_STALE. A token/ID/nonce uniqueness
   collision aborts the whole attempt; it never overwrites a stored envelope.
5. Persist domain + full encrypted delivery + receipt together. Store binary
   digest/nonce/ciphertext/tag, immutable expiry/AAD identity, and key/version refs.
   No token plaintext/canonical command body in SQL receipt or logs. The key never
   crosses to SQL. Duplicate-command race re-enters receipt resolution; a winner's
   envelope takes precedence over a loser's ephemeral preparation.

SQL compares the asserted MAC; it does not independently verify Edge's HMAC or
decrypt GCM. Like 42's actor assertion, crypto material is trusted **only from the
restricted gateway**. Validate lengths/bindings in SQL, but do not claim these
checks protect against a compromised gateway deliberately lying about content.
Key custody/least privilege and independent review remain required controls.

### Nonce boundary

This transport does not solve GCM nonce allocation. Encryption is disabled unless
a separately reviewed key-scoped nonce/use-limit allocator can issue a unique
12-byte nonce across workers, retries and restore. Its work completes before
domain locks; retries must not reuse a consumed allocation for new plaintext.
That allocator/provider is **not selected** here. A DB unique (keyId, nonce) guard
is defense-in-depth only: checking after encryption cannot itself guarantee safe
nonce use. No improvised Math.random, timestamp IV or unchecked random-use quota.

## 4. Encrypted result to unchanged public response

BridgeInviteResult is {bridgeVersion:1, view:InviteMetadata, delivery:PreparedInvite|null}.
InviteMetadata is the public invite's inviteId/classId/version/state/expiresAt,
without token. State issued requires delivery; consumed/revoked/expired requires
null. Every delivery identity/expiry must match view; issuer must match verified
actor. This result is gateway-only and must never be serialized directly to HTTP.

SQL returns the currently authorized **stored** delivery, including for a fresh
command. Edge validates internal shape and all bindings; imports the already
available key and authenticates 44's exact JCS AAD. For Web Crypto, ciphertext and
128-bit tag are concatenated for decrypt; encrypt's final 16 bytes are the tag.
The plaintext must be exactly 32 bytes and its purpose-separated lookup digest
must equal tokenDigestHex. Only then encode the canonical 43-character token.
The Web Crypto ciphertext/tag format follows the
[W3C AES-GCM definition](https://www.w3.org/TR/2017/REC-WebCryptoAPI-20170126/#aes-gcm-operations);
our envelope, trust split and transaction rules are application design choices.

Explicitly construct {data:{inviteId,classId,version,state,expiresAt,token}}; no
object spread from bridge/delivery. Closed state uses token=null without decrypt.
Expired issued storage projects expired, never issued/null. Validate the exact
public response **before COMMIT**; commit before releasing any HTTP success/token.
Failure/tampering/missing key rolls back and yields safe 503. Never fetch keys over
the network under locks. If a concurrent winner requires an unloaded historical
key, rollback, re-prepare/load, then retry the original intent within policy bounds.

The linearization point is the authorized committed transaction. Later revocation
cannot recall an already authorized in-flight response; no stronger claim is made.
Reads and all other mutations retain 43's validated-response-before-commit rule.

## 5. Failure and recovery contract

Add internal SQLSTATE **DF012 = PREPARATION_STALE**. It is not a public Error.code.
Raise before domain writes or roll back the whole transaction. Edge re-verifies
identity, re-prepares, reloads needed keys and retries the exact original command.
Its budget/timeout is reviewed configuration; exhausted/missing budget => existing
503 DEPENDENCY_UNAVAILABLE, not infinite retry or a new command ID. Authentication,
authorization, expiry, intent conflict and version errors are not retryable hints.

40001/40P01 remain whole-attempt rollback. A recognized fresh candidate uniqueness
collision may re-prepare within the same bounded policy; an unknown constraint
error is safe dependency failure. Connection loss during COMMIT is indeterminate:
discard the connection, retain the original confirmed intent, and recover/replay
with that command. Never return buffered success or treat uncertainty as rollback.
Mobile local-save failure after server success remains a separate recovery step.
No raw payload, ciphertext, token, AAD, key, connection string or SQL errors in logs.

## 6. Privilege and migration reconciliation

classroom_prepare_v1: PL/pgSQL SECURITY DEFINER, VOLATILE, PARALLEL UNSAFE,
CALLED ON NULL INPUT with explicit rejection; fixed search_path pg_catalog,pg_temp,
qualified relations, no dynamic SQL. New owner **df_class_prepare** is NOLOGIN,
non-superuser, not BYPASSRLS/table owner; no role inheritance/escalation.

| Principal | Exact additional capability | Excluded |
| --- | --- | --- |
| df_edge_gateway | EXECUTE preparation signature and revised 13 mutation signatures; existing nine reads | Old mutation overloads, internal helpers, direct table DML/SELECT, SET ROLE |
| df_class_prepare | Scoped SELECT of class ID/state, membership class/user/role/state, invite ID/class/issuer/state/digest/redeemed identity/expiry, own submission ID/class/author; own command actor/scope/operation/commandId/key/version/state/expiry; delivery invite/key ID; policy revision/active key refs/TTL | Task/acceptance content, assignments/instructions, report selections/feedback, receipt result/MAC, ciphertext/nonce/tag or key bytes; no domain/auxiliary writes |
| Seven operation owners in 43 | Existing capability plus MutationMaterial validation; invite owner calls restricted storage/delivery helper for CW-05 | No new raw Task access or SQL decryption/key access |
| PUBLIC/anon/authenticated | None | All 23 calls, overloads, helper/table access |

Preparation reads receipt metadata through a scoped command helper enforcing own
actor and CW-14 uniqueness; no permission to enumerate another actor's receipts.
Identity/lock access stays in 43's constrained shared guard helper; necessary
row-lock privileges do not become arbitrary UPDATE. Exact physical column names/
DDL must match reviewed core schema, not guessed from semantic names in this table.
No account/session enrollment or eligibility-grant operation is added.

Cursor generation/lookup remains in the constrained DB helper: pgcrypto CSPRNG
and SHA-256 over bytea inputs, with 44's registry bindings. Invitation lookup uses
the same bytea hash boundary; SQL never receives an AEAD key. The domain separator's
zero byte is bytea, not a NUL-containing PostgreSQL text value. Command JCS/HMAC and
invitation AEAD are Edge-only. Exact installed extension/grants remain unverified.

SF-M01 inventories the eighth owner; M02 includes delivery immutable AAD identity
and key/nonce uniqueness; M03 shared guard/receipt/storage helpers; M05 now includes
22 operations plus one preparation; M06 grants only those exact signatures and
removes any legacy overload in an authorized migration. All remain UNCREATED.
This is a draft replacement, not authority to drop deployed functions.

## 7. Evidence and implementation handoff

[Read-only bridge checker](check-classroom-bridge.mjs) checks strict DTOs, operation
coupling, forbidden extra fields, result projection and pure retry/commit models.
The existing classroom checker verifies the revised CW-05 result mapping and
mutation argument rule. No checker executes a SQL transaction, JWT verifier,
Deno AES adapter, allocator, grant or device. All 40 TX/TI scenarios remain NOT_RUN.

Required real extensions: TX-01/02/18/19 duplicate preparation and winner delivery;
TX-04/24 changed AAD/tag/key and no plaintext leakage; TI-T09–16 preparation/final
auth changes, forged context, pool reuse and denied legacy/client/helper calls;
TX-21 retention/restore with nonce allocator quarantine. Include no-network-under-
locks tracing, failed public projection before COMMIT, indeterminate commit and
replay without fresh-action preconditions. These are probes, not passing evidence.

EB-00 resolves the missing **draft interface**, not key custody/nonce allocation,
closed-command retention, core Task/auth/DDL dependencies or independent review.
Next safe step: review/admit these named shared dependencies and crypto policy,
not another feature expansion or automatic app/SQL implementation. See the
[audit](09-COVERAGE-AND-AUDIT.md) for actual checks and preserved limitations.
