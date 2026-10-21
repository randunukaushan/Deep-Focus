import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { createPreviewSceneAssets } from '../../scripts/preview-scene-assets.mjs';

test('bundled scenery matches original preview paths and resolved light/dark palette', () => {
  const assets = createPreviewSceneAssets();
  for (const [name, expected] of Object.entries(assets)) {
    const actual = readFileSync(`src/assets/branding/${name}`, 'utf8');
    // Git's Windows checkout may use CRLF; compare the actual SVG content.
    assert.equal(actual.replace(/\r\n/g, '\n').trim(), expected.replace(/\r\n/g, '\n').trim());
    assert.match(actual, /viewBox="0 0 600 340"/);
    assert.match(actual, /art-forest/);
    assert.doesNotMatch(actual, /var\(--|<script|<animate|href=|https:/);
  }
  assert.match(assets['preview-scene-dark.svg'], /art-stars" opacity=".75"/);
  assert.match(assets['preview-scene-light.svg'], /art-stars" opacity="0"/);
  const source = readFileSync('src/components/deep-focus-scene.tsx', 'utf8');
  // @/assets is deliberately mapped to root assets, not src/assets.
  // Resolve every scene require from its real importer, like Metro must do.
  const imports = [...source.matchAll(/require\('([^']+\.svg)'\)/g)];
  assert.equal(imports.length, 2);
  for (const [, relative] of imports) {
    assert.ok(relative.startsWith('../assets/'));
    assert.match(readFileSync(resolve(dirname('src/components/deep-focus-scene.tsx'), relative), 'utf8'), /<svg/);
  }
  assert.match(source, /transition=\{0\}/);
  assert.match(source, /importantForAccessibility="no-hide-descendants"/);
});
