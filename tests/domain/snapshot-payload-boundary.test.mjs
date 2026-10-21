import assert from 'node:assert/strict';
import test from 'node:test';

const { MAX_SNAPSHOT_PAGE_PAYLOAD_BYTES, boundedSnapshotPagePayloadJson } = await import('../../supabase/functions/_shared/snapshot-payload-boundary.ts');

test('snapshot payload boundary accepts a bounded UTF-8 JSON payload', () => {
  const value = { data: [{ title: 'සිංහල' }] };
  const json = boundedSnapshotPagePayloadJson(value);
  assert.equal(typeof json, 'string');
  assert.ok(new TextEncoder().encode(json).byteLength <= MAX_SNAPSHOT_PAGE_PAYLOAD_BYTES);
});

test('snapshot payload boundary rejects oversized JSON before storage', () => {
  assert.equal(boundedSnapshotPagePayloadJson({ data: [{ title: 'x'.repeat(MAX_SNAPSHOT_PAGE_PAYLOAD_BYTES) }] }), null);
});

test('snapshot payload boundary rejects non-finite numbers before storage', () => {
  assert.equal(boundedSnapshotPagePayloadJson({ data: [{ elapsedSeconds: Number.NaN }] }), null);
  assert.equal(boundedSnapshotPagePayloadJson({ data: [{ elapsedSeconds: Number.POSITIVE_INFINITY }] }), null);
});

test('snapshot payload boundary rejects values that JSON.stringify would coerce or omit', () => {
  class CustomValue { constructor() { this.title = 'custom'; } }
  const cyclic = {};
  cyclic.self = cyclic;
  assert.equal(boundedSnapshotPagePayloadJson({ data: [{ at: new Date('2026-10-10T00:00:00.000Z') }] }), null);
  assert.equal(boundedSnapshotPagePayloadJson({ data: [{ value: new CustomValue() }] }), null);
  assert.equal(boundedSnapshotPagePayloadJson({ data: [{ value: undefined }] }), null);
  assert.equal(boundedSnapshotPagePayloadJson({ data: [{ value: 1n }] }), null);
  assert.equal(boundedSnapshotPagePayloadJson(cyclic), null);
});
