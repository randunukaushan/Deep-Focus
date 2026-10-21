import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('resource type choices expose localized radio labels as a group', () => {
  const source = readFileSync('src/app/resources/index.tsx', 'utf8');

  assert.match(source, /<View accessibilityRole="radiogroup" style=\{styles\.choiceRow\}>/);
  assert.match(source, /accessibilityLabel=\{copy\.resourcesPage\.typeReference\} accessibilityRole="radio"/);
  assert.match(source, /accessibilityLabel=\{copy\.resourcesPage\.typeLink\} accessibilityRole="radio"/);
});

test('resource mutation errors are announced assertively while success stays polite', () => {
  const source = readFileSync('src/app/resources/index.tsx', 'utf8');

  assert.match(source, /const \[messageIsError, setMessageIsError\]/);
  assert.match(source, /accessibilityLiveRegion=\{messageIsError \? 'assertive' : 'polite'\}/);
  assert.match(source, /accessibilityRole=\{messageIsError \? 'alert' : undefined\}/);
});

test('resource rename uses localized labels and preserves the stored reference', () => {
  const source = readFileSync('src/app/resources/index.tsx', 'utf8');

  assert.match(source, /getResourceRuntimeCopy/);
  assert.match(source, /renameResource\(resource\.id, resource\.updatedAt, renameTitle\)/);
  assert.match(source, /accessibilityLabel=\{runtimeCopy\.renameTitle\}/);
});
