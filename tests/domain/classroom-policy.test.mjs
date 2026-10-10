import assert from 'node:assert/strict';
import test from 'node:test';

const { previewInvite, canUseClassroom, canAcceptInvite } = await import('../../src/features/education/classroom-policy.ts');

const NOW = '2026-10-09T06:00:00.000Z';
const invite = { inviteId: 'invite-1', classId: 'class-1', state: 'issued', expiresAt: '2026-10-10T06:00:00.000Z', token: 'bounded-token', version: 1 };

test('invite preview returns only safe class metadata and never the token', () => {
  assert.deepEqual(previewInvite(invite, NOW), { available: true, classId: 'class-1', inviteId: 'invite-1', reason: 'available' });
});

test('expired, revoked and malformed invites fail closed', () => {
  assert.equal(previewInvite({ ...invite, expiresAt: NOW }, NOW).reason, 'expired');
  assert.equal(previewInvite({ ...invite, state: 'revoked', token: null }, NOW).reason, 'not_issued');
  assert.equal(previewInvite({ ...invite, expiresAt: 'not-a-date' }, NOW).reason, 'invalid_data');
});

test('development fixtures can use classroom policy without enabling real-minor access', () => {
  assert.equal(canUseClassroom({ fixture: 'synthetic', legalReviewComplete: false, pilotEnabled: false }), true);
  assert.equal(canUseClassroom({ fixture: 'adult_test', legalReviewComplete: false, pilotEnabled: false }), true);
  assert.equal(canUseClassroom({ fixture: 'real_minor', legalReviewComplete: true, pilotEnabled: false }), false);
  assert.equal(canUseClassroom({ fixture: 'real_minor', legalReviewComplete: false, pilotEnabled: true }), false);
});

test('real-minor classroom access requires an explicit 15–17 age band as well as legal review', () => {
  const base = { fixture: 'real_minor', legalReviewComplete: true, pilotEnabled: true };
  assert.equal(canUseClassroom(base), false);
  assert.equal(canUseClassroom({ ...base, ageBand: 'minor_15_17' }), true);
  assert.equal(canUseClassroom({ ...base, ageBand: 'adult' }), false);
});

test('invite acceptance requires explicit policy-version agreement', () => {
  const adult = { fixture: 'adult_test', legalReviewComplete: false, pilotEnabled: false };
  assert.equal(canAcceptInvite(invite, NOW, adult, 1), true);
  assert.equal(canAcceptInvite(invite, NOW, adult, 2), false);
  assert.equal(canAcceptInvite(invite, NOW, { ...adult, fixture: 'real_minor', ageBand: 'minor_15_17', legalReviewComplete: true, pilotEnabled: true }, 1), true);
});

test('missing invite and invalid policy inputs never grant access', () => {
  const adult = { fixture: 'adult_test', legalReviewComplete: false, pilotEnabled: false };
  assert.equal(canAcceptInvite(null, NOW, adult, 1), false);
  assert.equal(canAcceptInvite(invite, NOW, adult, 0), false);
  assert.equal(canAcceptInvite({ ...invite, token: null }, NOW, adult, 1), false);
});
