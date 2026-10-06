// Read-only inventory. Structural findings are not API/runtime/security proof.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'contracts');
const files = fs.readdirSync(root).filter(n => n.endsWith('.openapi.json')).sort();
const verbs = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);
const cache = new Map();
const errors = [];
const operations = [];
const components = new Map();
const references = new Set();
const documents = [];
const schemaIds = new Map();
function read(file) {
  if (!cache.has(file)) cache.set(file, JSON.parse(fs.readFileSync(file, 'utf8')));
  return cache.get(file);
}
function target(from, ref) {
  const [name, fragment = ''] = ref.split('#');
  const uri = /^[a-z][a-z0-9+.-]*:/i.test(name);
  if (uri && !schemaIds.has(name)) throw new Error(`Unregistered schema URI: ${ref}`);
  const file = uri ? schemaIds.get(name) : name ? path.resolve(path.dirname(from), name) : from;
  const relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Out-of-directory ref: ${ref}`);
  let value = read(file);
  if (fragment) {
    if (!fragment.startsWith('/')) throw new Error(`Unsupported fragment: ${ref}`);
    for (const part of fragment.slice(1).split('/')) {
      const key = decodeURIComponent(part).replace(/~1/g, '/').replace(/~0/g, '~');
      if (value === null || typeof value !== 'object' || !Object.hasOwn(value, key)) throw new Error(`Unresolved ref: ${ref}`);
      value = value[key];
    }
  }
  return { file, value };
}
function dereference(file, value, seen = new Set()) {
  if (!value?.$ref) return value;
  const key = `${file}#${value.$ref}`;
  if (seen.has(key)) throw new Error(`Reference cycle in parameter/response: ${key}`);
  seen.add(key);
  const next = target(file, value.$ref);
  return dereference(next.file, next.value, seen);
}
function walk(file, value) {
  if (!value || typeof value !== 'object') return;
  if (typeof value.$ref === 'string') {
    const key = `${file}#${value.$ref}`;
    if (!references.has(key)) {
      references.add(key);
      try { const next = target(file, value.$ref); walk(next.file, next.value); }
      catch (error) { errors.push(`${path.basename(file)}: ${error.message}`); }
    }
  }
  for (const child of Object.values(value)) walk(file, child);
}
for (const name of fs.readdirSync(root).filter(n => n.endsWith('.schema.json'))) {
  const file = path.join(root, name);
  const id = read(file).$id;
  if (id) {
    if (schemaIds.has(id)) errors.push(`Duplicate schema $id: ${id}`);
    schemaIds.set(id, file);
  }
}
for (const name of files) {
  const file = path.join(root, name);
  const doc = read(file);
  const start = operations.length;
  walk(file, doc);
  for (const [group, entries] of Object.entries(doc.components ?? {})) {
    for (const [key, value] of Object.entries(entries)) {
      const id = `${group}/${key}`;
      if (!components.has(id)) components.set(id, []);
      components.get(id).push({ file: name, value });
    }
  }
  for (const [route, item] of Object.entries(doc.paths ?? {})) {
    for (const [method, op] of Object.entries(item)) {
      if (!verbs.has(method)) continue;
      const row = { source: name, method: method.toUpperCase(), path: route, operationId: op.operationId,
        responses: Object.keys(op.responses ?? {}), queries: [], pathParameters: [] };
      try {
        const params = new Map();
        for (const p of [...(item.parameters ?? []), ...(op.parameters ?? [])]) {
          const v = dereference(file, p); params.set(`${v.in}/${v.name}`, v);
        }
        row.queries = [...params.values()].filter(p => p.in === 'query').map(p => p.name);
        row.pathParameters = [...params.values()].filter(p => p.in === 'path').map(p => p.name);
        for (const match of route.matchAll(/\{([^}]+)\}/g)) {
          const p = params.get(`path/${match[1]}`);
          if (!p || p.required !== true) errors.push(`${op.operationId}: missing required path parameter ${match[1]}`);
        }
        if (!row.responses.some(s => /^2\d\d$/.test(s))) errors.push(`${op.operationId}: missing success response`);
        for (const [status, response] of Object.entries(op.responses ?? {})) {
          const r = dereference(file, response);
          if (!r?.description) errors.push(`${op.operationId}/${status}: missing description`);
          if (/^2\d\d$/.test(status) && !['204', '205'].includes(status) &&
              !Object.values(r.content ?? {}).some(media => media.schema)) {
            errors.push(`${op.operationId}/${status}: missing success body schema`);
          }
        }
      } catch (error) { errors.push(`${op.operationId}: ${error.message}`); }
      operations.push(row);
    }
  }
  documents.push({ file: name, openapi: doc.openapi, servers: doc.servers?.map(s => s.url), operations: operations.length - start });
}
function duplicates(key) {
  const groups = new Map();
  for (const op of operations) {
    const k = key(op);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(op.source);
  }
  return [...groups].filter(([, values]) => values.length > 1).map(([identity, sources]) => ({ identity, sources }));
}
const duplicateRoutes = duplicates(op => `${op.method} ${op.path.replace(/\{[^}]+\}/g, '{}')}`);
const duplicateOperationIds = duplicates(op => op.operationId);
for (const op of operations) if (!op.operationId) errors.push(`Missing operationId: ${op.source}/${op.path}`);
if (!files.length || !operations.length) errors.push('Empty inventory');
if (duplicateRoutes.length || duplicateOperationIds.length) errors.push('Duplicate public operation ownership');
const componentNameCollisions = [...components].filter(([, values]) => values.length > 1)
  .map(([name, values]) => ({ name, sources: values.map(v => v.file),
    identicalRawJson: new Set(values.map(v => JSON.stringify(v.value))).size === 1 }));
console.log(JSON.stringify({ status: errors.length ? 'FINDINGS' : 'PASS', documents,
  operationCount: operations.length, registeredSchemaIds: schemaIds.size,
  referenceLocationsInspected: references.size,
  duplicateRoutes, duplicateOperationIds, componentNameCollisions, errors,
  operations: process.argv.includes('--operations') ? operations : undefined,
  limitation: 'Source ownership and reference/parameter/response presence only. Same-named components stay document-scoped; no bundling, full OAS validation, runtime or security proof.' }, null, 2));
process.exitCode = errors.length ? 1 : 0;
