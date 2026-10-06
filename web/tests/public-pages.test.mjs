import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { getPublicPage, publicPages } from '../src/content/public-pages.ts';

function contrastRatio(foreground, background) {
  const luminance = hex => hex.slice(1).match(/../g).map(v => parseInt(v, 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const [high, low] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (high + 0.05) / (low + 0.05);
}

test('Plans navigation and footer note use readable normal-text colors in both themes', () => {
  const styles = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
  const light = styles.match(/:root\s*\{([^}]*)\}/s)[1];
  const dark = styles.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([^}]*)\}/s)[1];
  const token = (root, name) => root.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1]
    ?? light.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
  // Assert the selectors actually consume these tokens, not just palette ratios.
  assert.match(styles, /\.site-header \.nav-cta\s*\{[^}]*color:\s*var\(--ink\)/);
  assert.match(styles, /\.footer-note\s*\{[^}]*color:\s*var\(--muted\)/);
  for (const [name, root, footer] of [['light', light, '#edf1f7'], ['dark', dark, '#111c2d']]) {
    assert.ok(contrastRatio(token(root, '--ink'), token(root, '--paper')) >= 4.5, `${name} Plans label`);
    assert.ok(contrastRatio(token(root, '--muted'), footer) >= 4.5, `${name} footer note`);
  }
});

test('public route catalogue is complete for the unblocked website content lane', () => {
  for (const route of [
    'features', 'solutions/personal', 'solutions/education', 'plans', 'roadmap',
    'updates', 'help', 'contact', 'privacy', 'terms', 'data-deletion', 'accessibility',
  ]) assert.ok(getPublicPage(route), `${route} has a page`);
  assert.equal(getPublicPage('account'), undefined, 'private portal routes are not faked as public pages');
});

test('commercial, legal and accessibility pages disclose that required decisions/review are pending', () => {
  for (const route of ['plans', 'contact', 'privacy', 'terms', 'data-deletion', 'accessibility']) {
    const page = getPublicPage(route);
    assert.ok(page);
    assert.equal(page.reviewPending, true, `${route} carries a visible review-pending marker`);
  }
  assert.match(getPublicPage('plans').description, /No prices/);
  assert.match(getPublicPage('privacy').description, /not a privacy policy/);
});

test('public copy does not mislabel the development preview as a released product', () => {
  assert.match(getPublicPage('features').description, /still in development/);
  assert.match(getPublicPage('updates').description, /verified release/);
  assert.equal(Object.keys(publicPages).length, 12);
});

test('navigation includes skip, main and footer paths that resolve to admitted public pages', () => {
  const shell = readFileSync(new URL('../src/components/site-shell.tsx', import.meta.url), 'utf8');
  const home = readFileSync(new URL('../src/app/page.tsx', import.meta.url), 'utf8');
  const content = readFileSync(new URL('../src/components/content-page.tsx', import.meta.url), 'utf8');
  const notFound = readFileSync(new URL('../src/app/not-found.tsx', import.meta.url), 'utf8');
  assert.match(shell, /Skip to content/);
  assert.match(shell, /href="#main-content"/);
  assert.match(shell, /aria-label="Main navigation"/);
  for (const [route, source] of [['home', home], ['public content', content], ['not found', notFound]]) {
    assert.match(source, /<main[^>]*id="main-content"[^>]*tabIndex=\{-1\}/, `${route} skip target is its programmatically focusable main landmark`);
  }
  const routes = [...`${shell}\n${home}`.matchAll(/(?:href:\s*|href=)["'](\/[^"']*)["']/g)].map((match) => match[1]);
  for (const route of routes) {
    if (route === '/') continue;
    assert.ok(getPublicPage(route.slice(1)), `${route} resolves to a public page`);
  }
});

test('responsive themes preserve visible focus and honor reduced motion', () => {
  const styles = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /prefers-color-scheme:\s*dark/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.match(styles, /max-width:\s*800px/);
  assert.match(styles, /max-width:\s*560px/);
});

test('accent text meets 4.5:1 contrast in light and dark page surfaces', () => {
  const styles = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
  const lightRoot = styles.match(/:root\s*\{([^}]*)\}/s)?.[1];
  const darkRoot = styles.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([^}]*)\}/s)?.[1];
  const token = (root, name) => root?.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
  const luminance = (hex) => hex.slice(1).match(/../g).map((value) => parseInt(value, 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const contrast = (foreground, background) => {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };

  const themes = [
    { name: 'light', root: lightRoot, backgrounds: ['#f5f7fb', '#ffffff', '#f2f6fc', '#e8eef8'] },
    { name: 'dark', root: darkRoot, backgrounds: ['#0c1525', '#131f32', '#142137', '#101b2d', '#17253a'] },
  ];
  for (const theme of themes) {
    const accent = token(theme.root, '--accent-text');
    assert.ok(accent, `${theme.name} theme defines the text accent token`);
    for (const background of theme.backgrounds) {
      assert.ok(contrast(accent, background) >= 4.5, `${theme.name} ${accent} on ${background} meets 4.5:1`);
    }
  }
  assert.match(styles, /\.eyebrow[^}]*color:\s*var\(--accent-text\)/);
  assert.match(styles, /\.number[^}]*color:\s*var\(--accent-text\)/);
});
