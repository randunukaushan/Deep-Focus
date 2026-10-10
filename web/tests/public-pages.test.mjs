import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { getPublicPage, publicPages } from '../src/content/public-pages.ts';
import { accountCopy, isLocale, resolveLocale, safeLocalReturnPath, sharedCopy } from '../src/content/locale.ts';
import { homeCopy } from '../src/content/home-copy.ts';
import { getLocalizedPublicPage } from '../src/content/localized-public-pages.ts';
import { accountPrivacyCopy } from '../src/content/account-privacy-copy.ts';

test('website locale preference accepts only approved locales and safely falls back', () => {
  assert.deepEqual(['en', 'si', 'ta'].map(resolveLocale), ['en', 'si', 'ta']);
  for (const invalid of [undefined, null, '', 'fr', 'si;admin', 3]) assert.equal(resolveLocale(invalid), 'en');
  assert.equal(isLocale('ta'), true);
  assert.equal(isLocale('fr'), false);
});

test('website locale return path stays local and rejects redirect-shaped input', () => {
  assert.equal(safeLocalReturnPath('/privacy'), '/privacy');
  assert.equal(safeLocalReturnPath('/help?topic=account#recovery'), '/help?topic=account#recovery');
  for (const unsafe of ['https://example.com', '//example.com', '/\\\\example.com', '/help\\\\..\\\\admin', undefined]) {
    assert.equal(safeLocalReturnPath(unsafe), '/');
  }
});

test('website stores only the supported locale in an HTTP-only same-site cookie and redirects locally', () => {
  const action = readFileSync(new URL('../src/app/actions.ts', import.meta.url), 'utf8');
  assert.match(action, /const locale = isLocale\(requested\) \? requested : 'en'/);
  assert.match(action, /httpOnly:\s*true/);
  assert.match(action, /sameSite:\s*'lax'/);
  assert.match(action, /secure:\s*process\.env\.NODE_ENV === 'production'/);
  assert.match(action, /redirect\(safeLocalReturnPath\(formData\.get\('returnPath'\)\)\)/);
});

test('shared website shell labels follow locale while page catalogue remains explicitly separate', () => {
  assert.match(sharedCopy.si.skip, /අන්තර්ගතයට/);
  assert.match(sharedCopy.ta.skip, /உள்ளடக்கத்திற்குச்/);
  assert.equal(sharedCopy.en.navLabel, 'Main navigation');
  const shell = readFileSync(new URL('../src/components/site-shell.tsx', import.meta.url), 'utf8');
  const layout = readFileSync(new URL('../src/app/layout.tsx', import.meta.url), 'utf8');
  assert.match(shell, /<LocaleSelector locale=\{locale\} \/>/);
  assert.match(layout, /<html lang=\{locale\}>/);
  assert.match(shell, /<LocaleSelector/);
  assert.equal(Object.keys(publicPages).length, 12, 'this slice does not claim that page bodies are translated');
});

test('public home content has separate Sinhala, Tamil and English copy with truthful preview status', () => {
  assert.match(homeCopy.si.title, /වැදගත් දේට අවධානය/);
  assert.match(homeCopy.ta.title, /முக்கியமானவற்றில் கவனம்/);
  assert.equal(homeCopy.en.principles.length, 3);
  for (const locale of ['en', 'si', 'ta']) {
    assert.equal(homeCopy[locale].principles.length, 3);
    assert.match(homeCopy[locale].statusTitle, /./);
  }
  const source = readFileSync(new URL('../src/app/page.tsx', import.meta.url), 'utf8');
  assert.match(source, /homeCopy\[resolveLocale/);
});

test('public-safe information pages have translated copy and untranslated pages remain explicit', () => {
  for (const slug of ['solutions/personal', 'solutions/education', 'roadmap', 'updates', 'help']) {
    assert.ok(getLocalizedPublicPage(slug, 'si'), `${slug} has Sinhala copy`);
    assert.ok(getLocalizedPublicPage(slug, 'ta'), `${slug} has Tamil copy`);
  }
  for (const slug of ['features', 'plans', 'contact', 'privacy', 'terms', 'data-deletion', 'accessibility']) {
    assert.equal(getLocalizedPublicPage(slug, 'si'), undefined, `${slug} waits for translation/review`);
  }
  assert.match(sharedCopy.si.pageEnglishNotice, /ඉංග්‍රීසියෙන්/);
  assert.match(sharedCopy.ta.pageEnglishNotice, /ஆங்கிலத்தில்/);
  const component = readFileSync(new URL('../src/components/content-page.tsx', import.meta.url), 'utf8');
  assert.match(component, /translation-note/);
});

test('account portal uses provider verification without exposing privileged credentials or private data', () => {
  const page = readFileSync(new URL('../src/app/account/page.tsx', import.meta.url), 'utf8');
  const component = readFileSync(new URL('../src/components/account-portal.tsx', import.meta.url), 'utf8');
  const client = readFileSync(new URL('../src/lib/supabase-browser.ts', import.meta.url), 'utf8');
  assert.match(page, /AccountPortal/);
  assert.match(component, /getUser\(\)/);
  assert.match(component, /signInWithPassword/);
  assert.match(component, /signInWithOAuth/);
  assert.match(component, /resetPasswordForEmail/);
  assert.match(accountCopy.en.resetSentMessage, /If an account uses this address/);
  assert.match(accountCopy.en.safetyDescription, /public project key/);
  assert.match(accountCopy.si.retrySession, /නැවත/);
  assert.match(component, /window\.location\.reload\(\)/);
  assert.doesNotMatch(component, /access_token/);
  assert.doesNotMatch(client, /service_role|secret/i);
  assert.match(client, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
});

test('account portal has complete Sinhala and Tamil copy and receives the selected locale', () => {
  for (const locale of ['en', 'si', 'ta']) {
    for (const [key, value] of Object.entries(accountCopy[locale])) assert.match(value, /./, `${locale}.${key} is not empty`);
  }
  assert.match(accountCopy.si.title, /ගිණුම්/);
  assert.match(accountCopy.ta.title, /கணக்கு/);
  const page = readFileSync(new URL('../src/app/account/page.tsx', import.meta.url), 'utf8');
  const component = readFileSync(new URL('../src/components/account-portal.tsx', import.meta.url), 'utf8');
  assert.match(page, /resolveLocale\(cookieStore\.get\(LOCALE_COOKIE\)\?\.value\)/);
  assert.match(page, /<AccountPortal locale=/);
  assert.match(component, /accountCopy\[locale\]/);
});

test('account portal privacy controls export only portal-visible status and keep deletion pending', () => {
  for (const locale of ['en', 'si', 'ta']) {
    assert.match(accountPrivacyCopy[locale].title, /./);
    assert.match(accountPrivacyCopy[locale].deletionPending, /./);
  }
  const component = readFileSync(new URL('../src/components/account-portal.tsx', import.meta.url), 'utf8');
  assert.match(component, /privateDataSync: 'not_enabled'/);
  assert.match(component, /deep-focus-account-summary\.json/);
  assert.match(component, /disabled type="button">\{privacyCopy\.deletionPending\}/);
  assert.doesNotMatch(component, /access_token/);
});

test('account portal clears password state on sign-out and exposes busy state', () => {
  const component = readFileSync(new URL('../src/components/account-portal.tsx', import.meta.url), 'utf8');
  assert.match(component, /async function signOut\(\)[\s\S]*?setPassword\(''\)/);
  assert.match(component, /<main aria-busy=\{busy\}/);
});

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

test('feature status registry is current, evidenced, and makes no unreleased availability claims', () => {
  const page = getPublicPage('features');
  assert.ok(page?.reviewPending);
  assert.equal(page.featureStatuses?.length, 4);
  const ids = new Set();
  for (const feature of page.featureStatuses) {
    assert.ok(feature.featureId && !ids.has(feature.featureId), 'feature identifiers are present and unique');
    ids.add(feature.featureId);
    assert.ok(['in_development', 'prototype', 'planned'].includes(feature.status));
    assert.ok(feature.surfaces.length > 0);
    assert.equal(feature.releaseVersion, null);
    assert.match(feature.statusAsOf, /^2026-10-07$/);
    assert.ok(readFileSync(new URL(`../../${feature.evidenceRef}`, import.meta.url), 'utf8').length > 0, `${feature.featureId} points to existing evidence`);
  }
  const component = readFileSync(new URL('../src/components/content-page.tsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
  assert.match(component, /aria-labelledby="feature-readiness-title"/);
  assert.match(component, /Release version: \{feature\.releaseVersion \?\? 'Not released'\}/);
  assert.match(styles, /\.feature-status-grid\s*\{[^}]*grid-template-columns/);
  assert.match(styles, /@media \(max-width: 800px\)[\s\S]*?\.feature-status-grid \{ grid-template-columns: 1fr; \}/);
});

test('navigation includes skip, main and footer paths that resolve to admitted public pages', () => {
  const shell = readFileSync(new URL('../src/components/site-shell.tsx', import.meta.url), 'utf8');
  const home = readFileSync(new URL('../src/app/page.tsx', import.meta.url), 'utf8');
  const content = readFileSync(new URL('../src/components/content-page.tsx', import.meta.url), 'utf8');
  const notFound = readFileSync(new URL('../src/app/not-found.tsx', import.meta.url), 'utf8');
  assert.match(shell, /className="skip-link" href="#main-content">\{copy\.skip\}/);
  assert.match(shell, /href="#main-content"/);
  assert.match(shell, /aria-label=\{copy\.navLabel\}/);
  for (const [route, source] of [['home', home], ['public content', content], ['not found', notFound]]) {
    assert.match(source, /<main[^>]*id="main-content"[^>]*tabIndex=\{-1\}/, `${route} skip target is its programmatically focusable main landmark`);
  }
  const routes = [...`${shell}\n${home}`.matchAll(/(?:href:\s*|href=)["'](\/[^"']*)["']/g)].map((match) => match[1]);
  for (const route of routes) {
    if (route === '/' || route === '/account') continue;
    assert.ok(getPublicPage(route.slice(1)), `${route} resolves to a public page`);
  }
});

test('small-screen navigation uses a native keyboard-operable disclosure with full-size links', () => {
  const shell = readFileSync(new URL('../src/components/site-shell.tsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
  assert.match(shell, /<details className="mobile-menu">\s*<summary>\{copy\.menu\}<\/summary>/);
  assert.match(shell, /<nav aria-label=\{copy\.navLabel\}>\s*\{links\.map/);
  assert.match(shell, /label: 1/);
  assert.equal(sharedCopy.si.navLinks[1], 'ඔබ වෙනුවෙන්');
  assert.match(styles, /\.site-header \.mobile-menu summary\s*\{[^}]*min-width:\s*48px[^}]*min-height:\s*48px/);
  assert.match(styles, /\.site-header \.mobile-menu summary:focus-visible/);
  assert.match(styles, /\.site-header \.mobile-menu nav a\s*\{[^}]*min-height:\s*48px/);
  assert.match(styles, /\.site-header \.desktop-nav\s*\{\s*display:\s*none/);
  assert.match(styles, /\.site-header \.mobile-menu \{[^}]*display:\s*block/);
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
    const ink = token(theme.root, '--ink');
    const paper = token(theme.root, '--paper');
    assert.ok(accent, `${theme.name} theme defines the text accent token`);
    assert.ok(contrast(ink, paper) >= 4.5, `${theme.name} status-card text meets 4.5:1`);
    for (const background of theme.backgrounds) {
      assert.ok(contrast(accent, background) >= 4.5, `${theme.name} ${accent} on ${background} meets 4.5:1`);
    }
  }
  assert.match(styles, /\.eyebrow[^}]*color:\s*var\(--accent-text\)/);
  assert.match(styles, /\.number[^}]*color:\s*var\(--accent-text\)/);
});
