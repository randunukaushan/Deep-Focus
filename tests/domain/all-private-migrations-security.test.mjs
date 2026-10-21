import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const migrationsDir = path.join(root, 'supabase/migrations');
const files = fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();

function hasTableClause(sql, table, clause) {
  return new RegExp(`${clause}[^;]*df_private\\.${table}\\b`, 'i').test(sql)
    || new RegExp(`${clause}[^;]*df_private\\.%I`, 'i').test(sql);
}

function hasRowLevelSecurity(sql, table) {
  return new RegExp(`alter\\s+table[^;]*df_private\\.${table}\\b[^;]*enable\\s+row\\s+level\\s+security`, 'i').test(sql)
    || /alter\s+table[^;]*df_private\.%I[^;]*enable\s+row\s+level\s+security/i.test(sql);
}

function hasServiceGrant(sql, table) {
  return sql.split(';').some((statement) => /grant\s+[^;]*\bto\s+service_role\b/i.test(statement)
    && new RegExp(`df_private\\.${table}\\b|df_private\\.%I`, 'i').test(statement));
}

test('every private migration table has RLS and service-only table grants', () => {
  const findings = [];
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const tables = [...sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?df_private\.(\w+)/gi)].map((match) => match[1]);
    for (const table of tables) {
      assert.match(sql, new RegExp(`df_private\\.${table}\\b`, 'i'));
      const rls = hasRowLevelSecurity(sql, table);
      const revoke = hasTableClause(sql, table, 'revoke\\s+all\\s+on\\s+table');
      const serviceGrant = hasServiceGrant(sql, table);
      if (!rls || !revoke || !serviceGrant) findings.push({ file, table, rls, revoke, serviceGrant });
    }
    assert.doesNotMatch(sql, /grant\s+[^;]+\s+to\s+(?:public|anon|authenticated)\b/i, `${file} grants a private table to a client role`);
  }
  assert.deepEqual(findings, [], 'private migration table security clauses are incomplete');
  assert.ok(files.length > 0);
});
