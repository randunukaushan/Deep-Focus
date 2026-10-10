import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('home and settings duration labels use localized minute copy', () => {
  const home = readFileSync(new URL('../../src/features/home/home-screen.tsx', import.meta.url), 'utf8');
  const settings = readFileSync(new URL('../../src/app/profile/settings.tsx', import.meta.url), 'utf8');
  assert.match(home, /25 \{copy\.focus\.minutes\}/);
  assert.match(home, /5–180 \{copy\.focus\.minutes\}/);
  assert.doesNotMatch(home, />25 min<|>5–180 min/);
  assert.match(settings, /\$\{settingsCopy\.focusDuration\}: \$\{value\}m/);
  assert.match(settings, /\$\{settingsCopy\.breakDuration\}: \$\{value\}m/);
});
