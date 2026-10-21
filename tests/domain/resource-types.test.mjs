import assert from 'node:assert/strict';
import test from 'node:test';

const { validateResourceInput, validateResourceId, validateWorkSlice, validateResourceRevision, validateLinkPosition } = await import('../../src/features/resources/resource-types.ts');

test('local reference accepts bounded user-entered text without network access', () => {
  assert.deepEqual(validateResourceInput({ kind: 'reference', title: 'Maths paper', reference: 'Questions 1–10, page 3' }), { kind: 'reference', title: 'Maths paper', reference: 'Questions 1–10, page 3' });
});

test('external resources accept HTTPS links only and reject credential or active schemes', () => {
  assert.equal(validateResourceInput({ kind: 'external_link', title: 'Study link', reference: 'https://example.com/path?topic=focus' }).kind, 'external_link');
  for (const reference of ['http://example.com', 'javascript:alert(1)', 'file:///private.txt', 'https://user:pass@example.com']) {
    assert.throws(() => validateResourceInput({ kind: 'external_link', title: 'Unsafe', reference }), /INVALID_RESOURCE/);
  }
});

test('resource metadata bounds reject control characters, empty values and invalid link fields', () => {
  assert.throws(() => validateResourceInput({ kind: 'reference', title: ' ', reference: 'page 1' }), /INVALID_RESOURCE/);
  assert.throws(() => validateResourceInput({ kind: 'reference', title: 'ok', reference: 'line\nvalue' }), /INVALID_RESOURCE/);
  assert.throws(() => validateResourceId(''), /INVALID_RESOURCE/);
  assert.throws(() => validateResourceRevision(0), /INVALID_RESOURCE/);
  assert.throws(() => validateLinkPosition(-1), /INVALID_RESOURCE/);
  assert.equal(validateWorkSlice(undefined), undefined);
});
