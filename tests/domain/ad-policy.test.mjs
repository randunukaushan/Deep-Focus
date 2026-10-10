import assert from 'node:assert/strict';
import test from 'node:test';

const { mayRenderAd } = await import('../../src/features/monetization/ad-policy.ts');

const base = (overrides = {}) => ({
  surface: 'home', eligibility: 'adult_eligible', consent: 'granted', isActiveFocus: false, isTrueZenBreak: false, ...overrides,
});

test('ad policy allows only consented adult-safe non-core surfaces', () => {
  assert.equal(mayRenderAd(base()), true);
  assert.equal(mayRenderAd(base({ surface: 'progress' })), true);
  assert.equal(mayRenderAd(base({ surface: 'resources' })), true);
});

test('ad policy fails closed for unknown or minor eligibility and missing consent', () => {
  assert.equal(mayRenderAd(base({ eligibility: 'unknown' })), false);
  assert.equal(mayRenderAd(base({ eligibility: 'minor' })), false);
  assert.equal(mayRenderAd(base({ consent: 'unknown' })), false);
  assert.equal(mayRenderAd(base({ consent: 'denied' })), false);
});

test('ad policy never interrupts focus, recovery or true zen break', () => {
  assert.equal(mayRenderAd(base({ surface: 'focus' })), false);
  assert.equal(mayRenderAd(base({ surface: 'recovery' })), false);
  assert.equal(mayRenderAd(base({ isActiveFocus: true })), false);
  assert.equal(mayRenderAd(base({ isTrueZenBreak: true })), false);
});
