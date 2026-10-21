import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

/** Materialize the project's existing artwork, not the prototype's demo logic. */
export function createPreviewSceneAssets() {
  const html = readFileSync(new URL('../artifacts/ui-prototype/index.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../artifacts/ui-prototype/motion.css', import.meta.url), 'utf8');
  const start = html.indexOf('function scene(){');
  const end = html.indexOf('function quoteCard()', start);
  if (start < 0 || end < 0) throw new Error('PREVIEW_SCENE_NOT_FOUND');
  const original = new Script(`let sceneId=0; ${html.slice(start, end)} scene();`).runInNewContext({}, { timeout: 1000 });
  const assets = {};
  for (const dark of [false, true]) {
    const block = css.match(dark ? /\.phone\[data-theme=dark\]\s*\{([^}]+)\}/ : /\.phone\s*\{([^}]+)\}/)?.[1];
    if (!block) throw new Error('PREVIEW_PALETTE_NOT_FOUND');
    const palette = Object.fromEntries([...block.matchAll(/--([\w-]+):([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));
    let svg = original.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" ')
      .replace(/var\(--([\w-]+)\)/g, (_, key) => {
        if (!palette[key]) throw new Error(`PREVIEW_COLOR_MISSING:${key}`);
        return palette[key];
      })
      .replace('class="art-stars"', `class="art-stars" opacity="${dark ? '.75' : '0'}"`)
      .replace('class="moon-detail" fill="#99bcdc" opacity=".25"', `class="moon-detail" fill="#99bcdc" opacity="${dark ? '.25' : '0'}"`);
    svg = svg.trim() + '\n';
    assets[`preview-scene-${dark ? 'dark' : 'light'}.svg`] = svg;
  }
  return assets;
}
