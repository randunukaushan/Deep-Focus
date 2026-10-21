// Isolated, in-memory PostgreSQL (PGlite). No remote connection is accepted.
// Set DEEP_FOCUS_PGLITE_MODULE to a pinned, external PGlite dist/index.js.
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { createPostgresMigrationRunnerStore } from '../../supabase/functions/_shared/postgres-migration-runner-adapter.ts';
import { runMigrations } from '../../supabase/functions/_shared/migration-runner.ts';

const pgliteModule = process.env.DEEP_FOCUS_PGLITE_MODULE;
const { PGlite } = pgliteModule ? await import(pathToFileURL(pgliteModule).href) : {};
const isolatedTest = pgliteModule ? test : test.skip;
const root = new URL('../../supabase/migrations/', import.meta.url);
const files = await Promise.all((await readdir(root)).filter((name) => name.endsWith('.sql')).sort()
  .map(async (name) => ({ name, text: await readFile(new URL(name, root), 'utf8') })));
const first = files[0];

async function fixture(t) {
  const db = await PGlite.create();
  t.after(() => db.close());
  // Supabase role/auth scaffolding only, not provider authentication evidence.
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;`);
  return db;
}

function store(db, failReceipt = false) {
  return createPostgresMigrationRunnerStore({ runner: {
    withTransaction: (operation) => db.transaction((tx) => operation({
      query: async (sql, params = []) => {
        if (failReceipt && sql.startsWith('insert into df_private.schema_migration_receipts')) throw new Error('injected receipt failure');
        // PGlite's extended query API accepts one statement; migration DDL uses
        // its simple protocol, without parameters, within the same transaction.
        if (params.length === 0) return (await tx.exec(sql)).at(-1);
        return tx.query(sql, params);
      },
    })),
  } });
}

isolatedTest('full candidate chain bootstraps and replays unchanged receipts', async (t) => {
  const db = await fixture(t);
  const input = { files, schemaVersion: 1, store: store(db) };
  const applied = await runMigrations(input);
  assert.equal(applied.length, files.length);
  assert.ok(applied.every((entry) => entry.status === 'applied'));
  const replay = await runMigrations(input);
  assert.ok(replay.every((entry) => entry.status === 'replayed'));
  assert.equal((await db.query('select count(*)::integer as n from df_private.schema_migration_receipts')).rows[0].n, files.length);
  assert.equal((await db.query(`select is_nullable from information_schema.columns
    where table_schema='df_private' and table_name='usage_reservation_receipts' and column_name='remaining_units'`)).rows[0].is_nullable, 'NO');
  // Direct client access remains denied after both receipt-table migrations.
  for (const role of ['anon', 'authenticated']) {
    await assert.rejects(() => db.transaction(async (tx) => {
      await tx.exec(`set local role ${role}`);
      await tx.query('select * from df_private.schema_migration_receipts');
    }), (error) => error.code === '42501');
  }
});

isolatedTest('every private table has no client table privileges after the full candidate chain', async (t) => {
  const db = await fixture(t);
  await runMigrations({ files, schemaVersion: 1, store: store(db) });
  const tables = (await db.query(`select classes.relname as table_name, classes.relrowsecurity,
    has_table_privilege('anon', format('%I.%I', namespaces.nspname, classes.relname), 'SELECT') as anon_can_select,
    has_table_privilege('anon', format('%I.%I', namespaces.nspname, classes.relname), 'INSERT') as anon_can_insert,
    has_table_privilege('anon', format('%I.%I', namespaces.nspname, classes.relname), 'UPDATE') as anon_can_update,
    has_table_privilege('anon', format('%I.%I', namespaces.nspname, classes.relname), 'DELETE') as anon_can_delete,
    has_table_privilege('anon', format('%I.%I', namespaces.nspname, classes.relname), 'TRUNCATE') as anon_can_truncate,
    has_table_privilege('anon', format('%I.%I', namespaces.nspname, classes.relname), 'REFERENCES') as anon_can_references,
    has_table_privilege('anon', format('%I.%I', namespaces.nspname, classes.relname), 'TRIGGER') as anon_can_trigger,
    has_table_privilege('authenticated', format('%I.%I', namespaces.nspname, classes.relname), 'SELECT') as authenticated_can_select,
    has_table_privilege('authenticated', format('%I.%I', namespaces.nspname, classes.relname), 'INSERT') as authenticated_can_insert,
    has_table_privilege('authenticated', format('%I.%I', namespaces.nspname, classes.relname), 'UPDATE') as authenticated_can_update,
    has_table_privilege('authenticated', format('%I.%I', namespaces.nspname, classes.relname), 'DELETE') as authenticated_can_delete,
    has_table_privilege('authenticated', format('%I.%I', namespaces.nspname, classes.relname), 'TRUNCATE') as authenticated_can_truncate,
    has_table_privilege('authenticated', format('%I.%I', namespaces.nspname, classes.relname), 'REFERENCES') as authenticated_can_references,
    has_table_privilege('authenticated', format('%I.%I', namespaces.nspname, classes.relname), 'TRIGGER') as authenticated_can_trigger
    from pg_catalog.pg_class classes
    join pg_catalog.pg_namespace namespaces on namespaces.oid = classes.relnamespace
    where namespaces.nspname='df_private' and classes.relkind='r' order by classes.relname`)).rows;
  assert.ok(tables.length > 0);
  for (const table of tables) {
    assert.equal(table.relrowsecurity, true, `RLS must be enabled for ${table.table_name}`);
    for (const [privilege, granted] of Object.entries(table)) {
      if (privilege.startsWith('anon_can_') || privilege.startsWith('authenticated_can_')) {
        assert.equal(granted, false, `${privilege} must be false for ${table.table_name}`);
      }
    }
  }
});

isolatedTest('personal-core composite foreign keys reject cross-owner links', async (t) => {
  const db = await fixture(t);
  await runMigrations({ files, schemaVersion: 1, store: store(db) });
  const ownerA = '10000000-0000-4000-8000-000000000001';
  const ownerB = '10000000-0000-4000-8000-000000000002';
  const workspaceA = '10000000-0000-4000-8000-000000000003';
  const workspaceB = '10000000-0000-4000-8000-000000000004';
  const goalB = '10000000-0000-4000-8000-000000000005';
  const taskB = '10000000-0000-4000-8000-000000000006';
  const sessionB = '10000000-0000-4000-8000-000000000007';
  for (const owner of [ownerA, ownerB]) {
    await db.query('insert into auth.users(id) values($1)', [owner]);
    await db.query('insert into df_private.profiles(owner_id,display_name) values($1,$2)', [owner, 'Fixture']);
  }
  await db.query('insert into df_private.workspaces(id,owner_id) values($1,$2),($3,$4)', [workspaceA, ownerA, workspaceB, ownerB]);
  await db.query(`insert into df_private.goals(id,owner_id,workspace_id,title,type,period,target_value,target_unit,starts_at,ends_at,time_zone)
    values($1,$2,$3,'Goal','focus_time','daily',1,'ms',now(),now()+interval '1 day','UTC')`, [goalB, ownerB, workspaceB]);
  await db.query(`insert into df_private.tasks(id,owner_id,workspace_id,title)
    values($1,$2,$3,'Task')`, [taskB, ownerB, workspaceB]);
  await db.query(`insert into df_private.focus_sessions(id,owner_id,workspace_id,task_id,status,contract_version,planned_ms,focused_ms,paused_ms,started_at,ended_at,recorded_at)
    values($1,$2,$3,$4,'cancelled',2,1,0,0,now()-interval '1 minute',now()+interval '1 minute',now()+interval '1 minute')`, [sessionB, ownerB, workspaceB, taskB]);

  await assert.rejects(() => db.query(`insert into df_private.tasks(id,owner_id,workspace_id,goal_id,title)
    values('10000000-0000-4000-8000-000000000008',$1,$2,$3,'Foreign goal')`, [ownerA, workspaceA, goalB]), (error) => error.code === '23503');
  await assert.rejects(() => db.query(`insert into df_private.focus_sessions(id,owner_id,workspace_id,task_id,status,contract_version,planned_ms,focused_ms,paused_ms,started_at,ended_at,recorded_at)
    values('10000000-0000-4000-8000-000000000009',$1,$2,$3,'cancelled',2,1,0,0,now(),now(),now())`, [ownerA, workspaceA, taskB]), (error) => error.code === '23503');
});

isolatedTest('authenticated RLS policies isolate task rows after a test-only grant', async (t) => {
  const db = await fixture(t);
  await runMigrations({ files, schemaVersion: 1, store: store(db) });
  const ownerA = '20000000-0000-4000-8000-000000000001';
  const ownerB = '20000000-0000-4000-8000-000000000002';
  const workspaceA = '20000000-0000-4000-8000-000000000003';
  const workspaceB = '20000000-0000-4000-8000-000000000004';
  const taskA = '20000000-0000-4000-8000-000000000005';
  const taskB = '20000000-0000-4000-8000-000000000006';
  for (const [owner, workspace, task] of [[ownerA, workspaceA, taskA], [ownerB, workspaceB, taskB]]) {
    await db.query('insert into auth.users(id) values($1)', [owner]);
    await db.query('insert into df_private.profiles(owner_id,display_name) values($1,$2)', [owner, 'Fixture']);
    await db.query('insert into df_private.workspaces(id,owner_id) values($1,$2)', [workspace, owner]);
    await db.query('insert into df_private.tasks(id,owner_id,workspace_id,title) values($1,$2,$3,$4)', [task, owner, workspace, owner]);
  }
  // The candidate intentionally grants clients nothing. These transaction-local
  // test fixtures expose only SELECT, so the RLS predicate itself is exercised.
  await db.exec(`grant usage on schema df_private to anon, authenticated;
    grant select on df_private.tasks to anon, authenticated;`);
  for (const [owner, expectedTask] of [[ownerA, taskA], [ownerB, taskB]]) {
    const rows = await db.transaction(async (tx) => {
      await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [owner]);
      await tx.exec('set local role authenticated');
      return (await tx.query('select id from df_private.tasks order by id')).rows;
    });
    assert.deepEqual(rows.map((row) => row.id), [expectedTask]);
  }

  await db.transaction(async (tx) => {
    await tx.exec('set local role anon');
    const rows = (await tx.query('select id from df_private.tasks order by id')).rows;
    assert.deepEqual(rows, []);
  });
});

isolatedTest('failed bootstrap receipt rolls back schema; retry succeeds and changed checksum fails', async (t) => {
  const db = await fixture(t);
  await assert.rejects(() => runMigrations({ files: [first], schemaVersion: 1, store: store(db, true) }), /injected receipt failure/);
  assert.equal((await db.query("select to_regnamespace('df_private') as schema")).rows[0].schema, null);
  const applied = await runMigrations({ files: [first], schemaVersion: 1, store: store(db) });
  assert.equal(applied[0].status, 'applied');
  await assert.rejects(() => runMigrations({ files: [{ ...first, text: '-- changed checksum\n' + first.text }], schemaVersion: 1, store: store(db) }), /MIGRATION_CHECKSUM_MISMATCH/);
  assert.equal((await db.query('select count(*)::integer as n from df_private.schema_migration_receipts')).rows[0].n, 1);
});

isolatedTest('missing receipts on an existing private schema fail closed', async (t) => {
  const db = await fixture(t);
  await db.exec('create schema df_private; create table df_private.sentinel(id integer);');
  await assert.rejects(() => runMigrations({ files: [first], schemaVersion: 1, store: store(db) }), /DEPENDENCY_UNAVAILABLE/);
  assert.notEqual((await db.query("select to_regclass('df_private.sentinel') as table_name")).rows[0].table_name, null);
  assert.equal((await db.query("select to_regclass('df_private.profiles') as table_name")).rows[0].table_name, null);
});

isolatedTest('revocation outbox rejects cross-owner inserts and updates even as service_role', async (t) => {
  const db = await fixture(t);
  await runMigrations({ files, schemaVersion: 1, store: store(db) });
  const ownerA = '00000000-0000-4000-8000-000000000001';
  const ownerB = '00000000-0000-4000-8000-000000000002';
  const session = '00000000-0000-4000-8000-000000000003';
  const revocation = '00000000-0000-4000-8000-000000000004';
  for (const owner of [ownerA, ownerB]) {
    await db.query('insert into auth.users(id) values($1)', [owner]);
    await db.query('insert into df_private.profiles(owner_id,display_name) values($1,$2)', [owner, 'Fixture']);
  }
  await db.query(`insert into df_private.app_sessions(session_id,owner_id,issued_at,expires_at)
    values($1,$2,now(),now()+interval '1 hour')`, [session, ownerA]);
  const insert = (owner) => db.transaction(async (tx) => {
    await tx.exec('set local role service_role');
    await tx.query('insert into df_private.app_session_revocation_outbox(revocation_id,owner_id,session_id) values($1,$2,$3)', [revocation, owner, session]);
  });
  await assert.rejects(() => insert(ownerB), (error) => error.code === '23503');
  await insert(ownerA);
  await assert.rejects(() => db.transaction(async (tx) => {
    await tx.exec('set local role service_role');
    await tx.query('update df_private.app_session_revocation_outbox set owner_id=$1 where revocation_id=$2', [ownerB, revocation]);
  }), (error) => error.code === '23503');
  assert.equal((await db.query('select owner_id from df_private.app_session_revocation_outbox')).rows[0].owner_id, ownerA);
});

isolatedTest('legacy remaining_units addition preserves NULL instead of inventing a balance', async (t) => {
  const db = await fixture(t);
  await db.exec('create schema df_private; create table df_private.usage_reservation_receipts(id integer); insert into df_private.usage_reservation_receipts values(1);');
  const decision = files.find((file) => file.name === '20261010190000_usage_receipt_decision_v1.sql');
  await db.exec(decision.text);
  await db.exec(decision.text);
  assert.deepEqual((await db.query('select * from df_private.usage_reservation_receipts')).rows, [{ id: 1, remaining_units: null }]);
  await assert.rejects(() => db.query('update df_private.usage_reservation_receipts set remaining_units=-1'), (error) => error.code === '23514');
});

isolatedTest('migration advisory lock is held inside the transaction and released on commit or rollback', async (t) => {
  const db = await fixture(t);
  const lockSQL = `select count(*)::integer as n from pg_locks
    where locktype='advisory' and classid=1145457987 and objid=1 and granted`;
  for (const fail of [false, true]) {
    const lockedStore = createPostgresMigrationRunnerStore({ runner: {
      withTransaction: (operation) => db.transaction(async (tx) => {
        const result = await operation({ query: async (sql, params = []) => params.length
          ? tx.query(sql, params) : (await tx.exec(sql)).at(-1) });
        assert.equal((await tx.query(lockSQL)).rows[0].n, 1);
        if (fail) throw new Error('forced rollback');
        return result;
      }),
    } });
    const run = () => lockedStore.withMigrationTransaction(first.name.slice(0, -4), (tx) => tx.loadReceipt(first.name.slice(0, -4)));
    if (fail) await assert.rejects(run, /forced rollback/);
    else assert.equal(await run(), null);
    assert.equal((await db.query(lockSQL)).rows[0].n, 0);
  }
});

isolatedTest('reward progression tables preserve owner binding, terminal eligibility and one-time receipts', async (t) => {
  const db = await fixture(t);
  await runMigrations({ files, schemaVersion: 1, store: store(db) });
  const ownerA = '30000000-0000-4000-8000-000000000001';
  const ownerB = '30000000-0000-4000-8000-000000000002';
  const workspaceA = '30000000-0000-4000-8000-000000000003';
  const workspaceB = '30000000-0000-4000-8000-000000000004';
  const completedA = '30000000-0000-4000-8000-000000000005';
  const cancelledB = '30000000-0000-4000-8000-000000000006';
  const completedB = '30000000-0000-4000-8000-000000000007';
  for (const [owner, workspace] of [[ownerA, workspaceA], [ownerB, workspaceB]]) {
    await db.query('insert into auth.users(id) values($1)', [owner]);
    await db.query('insert into df_private.profiles(owner_id,display_name) values($1,$2)', [owner, 'Fixture']);
    await db.query('insert into df_private.workspaces(id,owner_id) values($1,$2)', [workspace, owner]);
  }
  await db.query(`insert into df_private.focus_sessions(id,owner_id,workspace_id,status,contract_version,planned_ms,focused_ms,paused_ms,started_at,ended_at,recorded_at)
    values($1,$2,$3,'completed',2,60000,60000,0,now()-interval '1 minute',now(),now())`, [completedA, ownerA, workspaceA]);
  await db.query(`insert into df_private.focus_sessions(id,owner_id,workspace_id,status,contract_version,planned_ms,focused_ms,paused_ms,started_at,ended_at,recorded_at)
    values($1,$2,$3,'cancelled',2,60000,0,0,now()-interval '1 minute',now(),now())`, [cancelledB, ownerB, workspaceB]);
  await db.query(`insert into df_private.focus_sessions(id,owner_id,workspace_id,status,contract_version,planned_ms,focused_ms,paused_ms,started_at,ended_at,recorded_at)
    values($1,$2,$3,'completed',2,60000,60000,0,now()-interval '1 minute',now(),now())`, [completedB, ownerB, workspaceB]);
  const operationKey = `terminal:${completedA}`;
  await db.query(`insert into df_private.progression_events(owner_id,consumer,source_operation_key,source_type,source_id,xp_delta,rules_version)
    values($1,'rewards:v1',$2,'focus_session',$3,1,'v1')`, [ownerA, operationKey, completedA]);
  await assert.rejects(() => db.query(`insert into df_private.progression_events(owner_id,consumer,source_operation_key,source_type,source_id,xp_delta,rules_version)
    values($1,'rewards:v1',$2,'focus_session',$3,1,'v1')`, [ownerA, operationKey, completedA]), (error) => error.code === '23505');
  await assert.rejects(() => db.query(`insert into df_private.progression_events(owner_id,consumer,source_operation_key,source_type,source_id,xp_delta,rules_version)
    values($1,'rewards:v1',$2,'focus_session',$3,1,'v1')`, [ownerA, `terminal:${completedB}`, completedB]),
  // BEFORE INSERT eligibility checks run before the composite FK. A completed
  // foreign session must still be denied, with no ledger row left behind.
  (error) => error.code === '23514' && error.message === 'progression event requires a completed owner-bound focus session');
  await assert.rejects(() => db.query(`insert into df_private.progression_events(owner_id,consumer,source_operation_key,source_type,source_id,xp_delta,rules_version)
    values($1,'rewards:v1',$2,'focus_session',$3,0,'v1')`, [ownerB, `terminal:${cancelledB}`, cancelledB]), (error) => error.code === '23514');
  assert.equal((await db.query('select count(*)::integer as n from df_private.progression_events')).rows[0].n, 1);
  await db.query(`insert into df_private.user_achievements(owner_id,achievement_id,unlocked_at,source_operation_key,rules_version)
    values($1,'first_focus_session',now(),$2,'v1')`, [ownerA, operationKey]);
  await db.query(`update df_private.user_achievements set summary_presented_at = unlocked_at where owner_id=$1 and achievement_id='first_focus_session'`, [ownerA]);
  await assert.rejects(() => db.query(`update df_private.user_achievements set summary_presented_at = now() where owner_id=$1 and achievement_id='first_focus_session'`, [ownerA]), (error) => error.code === '23514');
  await assert.rejects(() => db.query(`insert into df_private.user_achievements(owner_id,achievement_id,unlocked_at,rules_version,backfill_marker)
    values($1,'focus_sessions_5',now(),'v1',true)`, [ownerA]), (error) => error.code === '23514');
});
