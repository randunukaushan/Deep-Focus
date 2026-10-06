// Read-only document checks, not rendered UI or application-route tests.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (file) => fs.readFileSync(path.join(here, file), 'utf8');
const tokens = JSON.parse(read('contracts/experience-tokens.json'));
const navigation = JSON.parse(read('contracts/mobile-navigation.json'));
const map = read('../V1_SCREEN_MAP.md');
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const luminance = (hex) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`Not an opaque sRGB token: ${hex}`);
  const values = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
};
const contrast = (a, b) => {
  const x = luminance(a); const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
assert(contrast('#000000', '#FFFFFF') === 21, 'Contrast formula black/white fixture');
assert(contrast('#FFFFFF', '#FFFFFF') === 1, 'Contrast formula identical fixture');
assert(tokens.status === 'proposed-values-not-production-approval', 'Token approval status must remain explicit');
assert(tokens.minimumContrast.text >= 4.5 && tokens.minimumContrast.nonText >= 3, 'Contrast targets must not be weakened');
const pairs = [];
for (const [theme, palette] of Object.entries(tokens.themes)) {
  for (const color of Object.values(palette)) luminance(color);
  const add = (fg, bg, minimum) => {
    const ratio = contrast(palette[fg], palette[bg]);
    const pass = ratio >= minimum; // Never round before comparing with the threshold.
    pairs.push({ theme, foreground: fg, background: bg, ratio, minimum, pass });
    assert(pass, `${theme}:${fg}/${bg} ${ratio.toFixed(4)} < ${minimum}`);
  };
  for (const bg of tokens.surfaces) {
    for (const fg of tokens.textOnSurfaces) add(fg, bg, tokens.minimumContrast.text);
    for (const fg of tokens.nonTextOnSurfaces) add(fg, bg, tokens.minimumContrast.nonText);
  }
  for (const [fg, bg] of tokens.filledTextPairs) add(fg, bg, tokens.minimumContrast.text);
}
const routes = navigation.routes.map((r) => r.route);
assert(routes.length === 27 && new Set(routes).size === 27, 'Expected 27 unique full-screen routes');
assert(navigation.routes.filter((r) => r.required).length === 24, 'Expected 24 required routes');
assert(navigation.routes.filter((r) => !r.required).length === 3, 'Expected 3 conditional routes');
assert(navigation.tabs.map((r) => r.label).join('/') === 'Home/Plan/Focus/Progress/Profile', 'Approved tab order changed');
assert(new Set(navigation.tabs.map((r) => r.route)).size === 5, 'Tabs must be unique');
assert(navigation.tabs.every((r) => routes.includes(r.route)), 'Tab must be a full-screen route');
const canonicalRows = [...map.matchAll(/^\| (\d{2}) \| `([^`]+)`[^|]*\|[^|]*\| ([^|]+) \|/gm)];
assert(canonicalRows.length === 27, 'Canonical Markdown must contain exactly 27 numbered routes');
for (const [i, route] of navigation.routes.entries()) {
  assert(route.id === String(i + 1).padStart(2, '0'), `Nonsequential route ID: ${route.id}`);
  const row = canonicalRows.find((match) => match[1] === route.id);
  assert(row?.[2] === route.route, `Canonical route mismatch: ${route.id}`);
  assert(Boolean(row?.[3].trim().startsWith('Required')) === route.required, `Canonical status mismatch: ${route.id}`);
}
assert(new Set(navigation.aliases.map((a) => a.from)).size === navigation.aliases.length, 'Duplicate alias');
const tabLabels = navigation.tabs.map((r) => r.label).join('/');
const lists = [
  ['../ARCHITECTURE.md', 'The owner-approved V1 primary navigation, in order, is:'],
  ['../ARCHITECTURE.md', 'The primary mobile experience uses the owner-approved five bottom-navigation destinations:'],
  ['../COMPONENT_LIBRARY.md', 'For the current Deep Focus navigation architecture, the primary destinations are:'],
  ['../UI_UX_DESIGN_SPECIFICATION.md', 'The primary mobile application uses a Bottom Navigation Bar for access to the five main destinations:'],
];
for (const [file, anchor] of lists) {
  const body = read(file);
  const position = body.indexOf(anchor);
  assert(position >= 0, `Missing canonical navigation anchor in ${file}`);
  const next = body.slice(position + anchor.length).trimStart();
  const labels = next.split(/\r?\n/).slice(0, 5).map((line) => line.replace(/^- /, '')).join('/');
  assert(labels === tabLabels, `Canonical navigation list mismatch in ${file}`);
}
const uiSpec = read('../UI_UX_DESIGN_SPECIFICATION.md');
for (const obsolete of ['`Analytics` should appear as the active destination.',
  '`Rewards` should appear as the selected destination.',
  'The Rewards screen is a primary application destination.',
  'Home | Focus | Analytics | Rewards | Profile']) {
  assert(!uiSpec.includes(obsolete), `Obsolete UI navigation instruction: ${obsolete}`);
}
for (const alias of navigation.aliases) {
  assert(!routes.includes(alias.from) && routes.includes(alias.to), `Alias must resolve directly without loop: ${alias.from}`);
  const params = (s) => [...s.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]).join(',');
  assert(params(alias.from) === params(alias.to), `Alias loses parameters: ${alias.from}`);
  assert(map.includes('`' + alias.from + '`') && map.includes('`' + alias.to + '`'), `Undocumented alias: ${alias.from}`);
}
console.log(JSON.stringify({
  status: errors.length ? 'FAIL' : 'PASS',
  scope: 'Document tokens, route inventory and redirects only; no rendered/runtime verification',
  contrastPairs: pairs.length, routes: routes.length, aliases: navigation.aliases.length,
  canonicalNavigationLists: lists.length,
  minimumTextRatio: Math.min(...pairs.filter((p) => p.minimum === 4.5).map((p) => p.ratio)),
  minimumNonTextRatio: Math.min(...pairs.filter((p) => p.minimum === 3).map((p) => p.ratio)),
  errors, ...(process.argv.includes('--details') ? { pairs } : {}),
}, null, 2));
process.exitCode = errors.length ? 1 : 0;
