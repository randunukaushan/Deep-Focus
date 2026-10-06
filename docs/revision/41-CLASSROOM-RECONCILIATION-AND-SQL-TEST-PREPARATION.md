# Classroom canonical reconciliation and isolated SQL preparation — CR-00

2026-09-30. **DRAFT / HIGH / REVIEW_PENDING. SQL EXECUTION NOT AUTHORIZED.**

සිංහල: මෙය classroom data කවුද බලන්නේ/වෙනස් කරන්නේ, පැරණි contracts සමඟ
වෙනස් වන තැන් සහ වෙනම test database එකක ඒවා ඔප්පු කරන පියවර පැහැදිලි කරනවා.
Canonical documents වල pointers එකතු කිරීමෙන් draft එක approved හෝ app එක
implemented වෙන්නේ නැහැ. [Audit](09-COVERAGE-AND-AUDIT.md) හි CR-00 evidence ඇත.

## 1. Authority and reconciliation boundary

The [September 29 owner amendment](01-REQUIREMENTS-AND-DECISIONS.md) admits bounded
classrooms, not a full LMS. [39](39-BOUNDED-CLASSROOM-SHARING-CONTRACT.md) owns the
product/lifecycle proposal; [40](40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md)
owns exact draft wire/data and TX-01–24. This packet supplies access/integrity
review inputs and reconciles references, not approval of migrations or policy.
G1–G6 in 39 remain applicable. No role/provider/dependency is installed or created.

Current source: Task is an ownerless JSON-file prototype without server versions,
classroom provenance or atomic Task/link/receipt storage. Save failures are swallowed;
web persistence is a no-op. Do not attach classroom access to that array.
Shared core identity, reliable private Task storage and reviewed migration come first.

| Existing reference | Classroom-specific reconciliation / unchanged boundary |
| --- | --- |
| API §§5–6/18 | CW collections use top-level nextCursor, not meta.nextCursor; safe Error uses code/messageKey/requestId/retryable, not free-form details. CW success uses 200 after durable commit/read, not generic creation/deletion examples. Other endpoint contracts are unchanged |
| API §§19–21 | Exact mutation envelope and null/positive expectedVersion from 40; no second Idempotency-Key transport; no timestamp-only overwrite. Private offline work continues, first assignment acceptance is online |
| API §7 and Security §§6/8 | Personal owner checks remain. Class access additionally needs current scoped membership/role and state. Membership never grants access to private Tasks |
| Data Model §§7/13–16 | One private Task per learner/assignment acceptance; selected report is a separate snapshot, not Task status or verified focus time; deleting private work never recreates it via replay |
| Database §§14/16–18 | Composite class/owner references, unique acceptance and command receipt, immutable revisions, no class-to-private-Task cascade |
| Database §§21–23 | Reviewed migrations/grants/functions and disposable rehearsal required; no production schema inferred from JSON DTOs |
| Security §12 / export 28 §§3–4 | Classroom retained data must appear in coverage inventory. Existing fourteen-section export cannot silently gain classroom rows or falsely mark shared_workspaces not_collected |
| Testing strategy / 40 §6 | DTO/ref checks remain separate from grants/RLS/HTTP/race/device/restore proof. All 24 TX cases remain NOT_RUN |

These are scoped reference amendments, not a declaration that every backend
contract is reconciled. Old personal API drafts keep their existing inventories.
Canonical files point here; they do not duplicate all 22 operations. Final adoption
requires the named design/diff review and resolution of affected policy gates.

## 2. Actor predicates and operation matrix

Predicates below are requirements for the future trusted handler, **not evaluated
by the local document checker**:

- Auth: verified current account/session; actor derived by trusted infrastructure.
- E: active educator membership in the selected class plus admitted educator authority.
- L: active learner membership in the selected class.
- M: E or L; class is active or read-only archived as allowed below.
- Own: resource author/receipt owner equals authenticated actor, independently of
  current class membership; retained-data policy still governs available fields.
- Active: class accepts new work; Open: assignment is published, not closed/withdrawn.
- Shared: selected submission still visible, correct class/member and sharing episode.
- Preview: exact user-confirmed intent; client confirmation never substitutes for Auth.

Every row also requires strict DTO/path/query validation, current policy where
applicable, safe errors and bounded responses. Mutations apply 40's transaction,
version and receipt rules. Foreign/not-visible IDs are neutral unavailable; do not
return constraint names, guessed owner IDs or raw database exception text.

| Operation | Trusted admission / scope | Result boundary and decisive negative |
| --- | --- | --- |
| CW-01 | Auth + creator eligibility | Atomic class + E membership; profile-selected teacher mode cannot grant authority |
| CW-02 | Auth + M for each returned class | Only current own memberships; no class discovery or total learner counts |
| CW-03 | Auth + current M | Minimal class + own membership; foreign class denied |
| CW-04 | Auth + E, expected class version | Archive; never delete private learner Tasks |
| CW-05 | Auth + E + Active, expected class version | Single-use invite; issuance disabled if required key/expiry/limits unconfigured |
| CW-06 | Auth + E, invite in selected class | Versioned revoke; cannot undo a consumed membership |
| CW-07 | Auth + eligible token preview | Minimal identity only; no signed-out class/roster disclosure |
| CW-08 | Auth + eligibility + Active + usable token + Preview | Atomic learner membership/redemption; no role from token payload/client |
| CW-09 | Auth + E, target learner in same class | Revoke learner only; cannot remove educator or affect private account |
| CW-10 | Auth + L, own membership/version | Leave even if archived; no educator-transfer/orphan-class shortcut |
| CW-11 | Auth + E + Active; existing assignment must be Open | Publish new content revision; cannot modify accepted private copies |
| CW-12 | Auth + E, matching assignment/version | Close/withdraw; no reopen or private-data cascade |
| CW-13 | Auth + M, class-bound published revision | Only permitted published content; no educator drafts/private Task links |
| CW-14 | Auth + L + Active + Open + Preview for fresh acceptance | Atomic own Task/link/receipt; replay cannot create another Task or resurrect deletion |
| CW-15 | Auth + L + Active + Open + private accepted revision + Preview | Own categorical snapshot only; no foreign submission, private-field spread or reward |
| CW-16 | Auth + Own submission, expected version | Withdrawal remains an own-data control after leave/revoke/archive; no new class content |
| CW-17 | Auth + E + Active + Shared + Open, exact current submission version | Versioned feedback; withdrawn, stale or foreign target denied |
| CW-18 | Auth + M; E gets permitted current members, L only own | Shared reports/allowed feedback; withdrawn content absent, no private acceptance query |
| CW-19 | Auth + current M | Class-bound published assignments including permitted read-only lifecycle states |
| CW-20 | Auth + Own acceptance receipt | Private pointer only even after membership loss; same accept command across assignments conflicts |
| CW-21 | Auth + Own submission | Own permitted report/feedback; old references cannot restore forbidden class content |
| CW-22 | Auth + current E | Minimal permitted membership list; learners cannot enumerate classmates |

Fresh actions and duplicate replays are separate branches. After checking current
read/own rights, an existing receipt can return only the current permitted result;
it never re-runs the original mutation. An archived class blocks new work, not
required leave/revoke/withdraw or permitted historical reads. Authentication
revocation is never bypassed by a receipt. Eligibility removal may require a
separate privacy-access route; exact G1 policy must not silently disable rights.

One current educator, no class transfer/restore in this subset. Assignment close
and withdrawal do not erase a student's already copied private work. Historical
revision reads must carry revision identity rather than masquerade as current.

## 3. Database role boundary and table obligations

Proposed boundary: mobile uses authenticated Edge API; classroom tables live in
a non-client-exposed schema. No direct table SELECT/INSERT/UPDATE/DELETE,
TRUNCATE/REFERENCES/TRIGGER or schema-CREATE grant for anon/authenticated/PUBLIC.
Read access described below means an authorized **projection through a reviewed
handler**, not granting a learner raw-table access. Existing personal core grants
are unaffected; no blanket revocation across unrelated schemas.

Separate migration owner, narrow runtime execution principal and test oracle.
Runtime must not be a superuser/table-owner/BYPASSRLS catch-all. Exact connection
adapter, role names, verified-identity binding and grant DDL remain SQL review
inputs, not supplied production configuration. If the selected platform cannot
support this boundary as proposed, STOP and review the alternative; do not
quietly replace it with unrestricted service-role SQL.

For each function: list exact signature, caller/owner, tables/columns, invoker or
definer behavior, trusted identity source and transaction role. Prefer invoker
where it can satisfy least privilege. A necessary definer function requires a
narrow non-login owner, reviewed RLS interaction, fixed safe search_path and
schema-qualified relations, no caller-controlled SQL, restricted EXECUTE and
negative tests through every exposed callable path. Revoke implicit PUBLIC
EXECUTE for the new functions; inspect creator-specific default privileges.
Do not assume a function's being absent from the UI prevents direct RPC calls.

A JWT claim or request body set by an untrusted caller is not a database identity
bridge. The chosen adapter must validate identity before entering privileged
execution, bind it per transaction, and prevent pooled connection identity leaks.
Test a reused connection from A to B and an unset actor. Do not accept a body
actorId as a fallback. This bridge must be frozen before producing runnable RPC SQL.

| Table | Permitted projection / controlled writes | Required database integrity oracle |
| --- | --- | --- |
| classrooms | M minimal read; E archive; admitted creator insert | One education scope; creator + educator membership atomic; active/archived enum |
| classroom_memberships | Own membership or E minimal roster; invite/join/leave/revoke handlers | Unique class+subject and class+id; one current educator; no learner self-promotion |
| classroom_invites | Issuer safe delivery only while usable; preview/join/revoke handlers | Unique digest, single-use redemption; failed join rolls back consumption |
| classroom_assignments | M permitted read; E publish/lifecycle handlers | Class+id unique; valid current content revision; no unsupported reopen |
| classroom_assignment_revisions | M authorized edition; append through publish | Composite class+assignment binding; immutable content; due instant/zone both null or both present |
| private_classroom_acceptances | Own pointer only; acceptance handler writes | Unique learner+assignment; Task owner/workspace match; retained deleted-link identity; no educator reads |
| classroom_submissions | E permitted selected copy or Own; share/withdraw handlers | Class+assignment+learner membership agree; unique assignment+membership; versions monotonic |
| classroom_submission_revisions | Only projected permitted selection; append through share | Submission/class/assignment revision FK alignment; sharing_epoch; no private Task content |
| classroom_feedback | Current permitted feedback only; E feedback handler | Same class/educator/submission revision/epoch; immutable row ID; correction version unique |
| private_classroom_commands | Own minimal recovered result via handler; trusted receipt writer | Scoped command uniqueness + extra accept actor/operation/command uniqueness; digest immutable |
| private_classroom_share_receipts | Own reviewed privacy route/minimal audit only | Author matches submission; selected fields allowlisted; no blanket ongoing sharing consent |

Head-to-revision references need explicit composite FKs and unique referenced
keys, including class identity; a UUID existing somewhere is insufficient.
The migration design must specify insertion order or reviewed deferred constraints
for heads/revisions, plus negative cross-class fixtures. Do not disable constraints
to make bootstrap pass. No business rule is accepted merely because the column
names match the JSON schema.

[TI-00 refinement](42-PRIVATE-TASK-TOMBSTONE-AND-IDENTITY-BRIDGE.md) selects the
nullable live FK plus immutable private Task identity/deleted-link representation
as the design candidate. It also selects a narrow server-only PostgreSQL gateway
and transaction-bound verified actor/session arguments, preserving 14's server-only
boundary. This replaces the previously open design alternatives, not the SQ-02/03
review/testing gates. No dangling FK, permanent-retention approval or teacher
access is introduced; exact roles, policies and runtime remain unimplemented.

The separate encrypted invitation delivery store and existing account/policy
guards are additional security dependencies, not secretly implemented by these
eleven tables. Inventory their keys, access, expiry and erasure too. No plaintext
token in command receipts, exports, logs, client mirrors or test evidence.

## 4. Privacy/export reconciliation

Existing export 28 has fourteen strict sections and eight deferred families.
Do not extend its JSON schema implicitly. Before classroom data can be collected,
inventory each table above and delivery/security dependencies against:

| Data group | Required coverage decision, not a legal conclusion |
| --- | --- |
| Class/membership, educator assignments, own selected reports and permitted feedback | shared_workspaces; reviewed versioned serializer or functioning authenticated separate process |
| Private Task created on acceptance | Existing tasks serializer only for its approved Task fields; provenance/link is not automatically included |
| Private acceptance/link and share acknowledgements | Map user-accessible portions explicitly across shared_workspaces / consent_history without duplicate or foreign disclosure |
| Command digests, invitation delivery, security audit | Restricted internal_security handling; no raw secrets; separately assess applicable access duties |
| Withdrawn/left/revoked/deleted records and backups | Reviewed retention/deletion and restore suppression; do not turn inaccessible data into not_collected |

An educator export is not an unrestricted class dump; a learner export must not
contain peers' identities. Classroom activation cannot label shared_workspaces
not_collected once retained records exist. A separate_process entry is allowed
only with reviewed policy and a functioning verified access path, never an
invented policyRef or generic email placeholder. If neither serializer nor
reviewed access process exists, block the feature/export success as applicable.
This is not approval to charge for privacy access or a determination of legal
consent/retention. G1 remains owner/qualified-review work.

## 5. Isolated test admission and execution sequence

No target selected. Read-only PATH discovery on this date found no psql, supabase
or docker command. They may exist elsewhere; no filesystem-wide search, installation
or service start was attempted. Do not paste commands from provider examples and
call them tested here. The current task creates no SQL executable or DB harness.

Before a future test run, record all admission fields:

| Gate | Required evidence | Current state |
| --- | --- | --- |
| SQ-01 | Owner-authorized disposable target identity, no production/shared data, installation/spend permission if necessary | OPEN |
| SQ-02 | Exact PostgreSQL/Supabase/runtime versions, connection method, reviewed identity bridge and role/grant matrix | OPEN |
| SQ-03 | Reviewed core owner/Task/erasure contract; selected tombstone representation; schema/function hashes | OPEN |
| SQ-04 | Explicit synthetic-only policy configuration and deterministic token/time/limit fixtures; no production defaults inferred | OPEN |
| SQ-05 | Independent review of migration, RPC, grant paths, privacy/export plan and fixture runner before acceptance/integration | OPEN |
| SQ-06 | Isolated migration/rollback-or-forward-recovery plan; captured role/constraint/restore evidence and full TX results | OPEN |

Luna execution order after the affected prerequisites/authority are supplied:

1. **Discovery/admission only.** Verify target identity using read-only metadata,
   environment separation, privileges and versions. Record nonsecret target ID;
   never print connection strings/keys. Reject ambiguous target.
2. **Migration draft in the authorized test branch/files.** Specify the eleven
   tables plus declared dependencies, constraints, default privileges and function
   signatures. No app imports. Keep public routes disabled. Have the qualified
   reviewer inspect the proposed boundary; no automatic extra agent.
3. **Fixture/runner draft.** Use synthetic E1/C1, E2/C2, A, B, outsider O and
   disabled/revoked identities; one valid positive object in each tested scope.
   Add a least-privilege caller and a separate read-only post-commit oracle.
   A migration-owner SELECT proving a row exists is not a caller authorization test.
4. **Disposable rehearsal only when authorized.** Apply exact reviewed migration,
   inspect actual catalog grants/role attributes/RLS/policies/functions and run
   positive and negative API/direct-SQL/RPC/view paths. No test against real minors.
5. **Concurrency.** Two independent connections plus deterministic barriers,
   not sleep-based guesses; run both orders for revocation/withdrawal/archive
   races. Inject failure after every atomic group write, drop successful responses,
   reuse command IDs with same and altered payload, and reuse pooled connection
   across actors. TX-01–24 remain the scenario inventory, not a new pass count.
6. **Recovery/privacy.** Restore only a synthetic backup into another disposable
   target, apply privacy suppression before ordinary access, verify class/private
   export boundaries and Task survival. A restore that resurrects sharing fails.
7. **Evidence and cleanup.** Record case ID, exact build/migration/config hashes,
   actor/role, connection schedule, expected/actual cardinalities, safe DTOs,
   SQLSTATE category and rollback result. Never capture token/plaintext content.
   Cleanup only exact verified test-owned objects after evidence retention;
   no blanket DROP of public/schema/database, reset-project or production reset.

Required negative catalog checks: client role inherits no forbidden grants;
PUBLIC cannot execute new privileged functions; runtime has no owner/BYPASSRLS
shortcut; newly created objects inherit reviewed defaults; views do not widen
access; FK/unique error paths do not disclose foreign records. Then verify the
authorized positive path actually works so total denial is not a false pass.
Test row/column integrity separately from response-schema validation.

## 6. Evidence and remaining work

The existing classroom checker now checks operation/table coverage and canonical
routing in addition to its DTO/reference/test-packet checks. It parses documents,
not SQL, roles or policies. Missing coverage fails the check; correct coverage
does not prove the written predicate is sufficient. No new test dependency.

Commands, from the repo using the installed Node path if needed:

```text
node docs/revision/check-classroom-contracts.mjs
node docs/revision/check-account-export.mjs
node docs/revision/check-docs.mjs
git diff --check
```

Full runtime and TX-01–24 status: **NOT_RUN**. Independent review: **PENDING**.
Production activation: **NOT_READY**. No percentage of app completion inferred.
Canonical reference reconciliation is recorded; detailed design remains draft.

[TI-00](42-PRIVATE-TASK-TOMBSTONE-AND-IDENTITY-BRIDGE.md) now specifies the shared
Task tombstone/identity bridge candidate; next is the exact isolated SQL file/runner
specification for qualified review. Missing target/tooling
does not justify installing, spending or running SQL without authority. Owner legal,
pricing/spending and independent-review decisions remain separate; routine design
can continue within the approved stack without asking classroom placement again.

## 7. Primary-source verification — 2026-09-30

- Grants and RLS are separate controls; service-role authority can bypass RLS.
  This motivates testing actual caller roles and projections, not only policies.
  [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- Invoker/definer execution, search_path and function EXECUTE privileges need
  explicit review. A definer function is not made safe merely by hiding it in UI.
  [Supabase database functions](https://supabase.com/docs/guides/database/functions).
- Owners and BYPASSRLS roles can bypass row policies; integrity constraints and
  whole-table privileges have distinct behavior. Test foreign-key error leakage
  and role attributes in addition to ordinary SELECT restrictions.
  [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

These sources support specific technical cautions. Role architecture and matrices
above are our proposed application design, not provider certification or a legal
opinion. Current PostgreSQL documentation does not establish the deployed version.

