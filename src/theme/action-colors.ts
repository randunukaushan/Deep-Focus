import { Palette } from './tokens';

/** The shared button/selected-control foreground rule; no new palette values. */
export function accentTextColor(background: string): string {
  function luminance(hex: string) {
    const channels = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  if (!/^#[\da-f]{6}$/i.test(background)) return Palette.lightSurface;
  const light = luminance(Palette.lightSurface), dark = luminance(Palette.deepNavy), fill = luminance(background);
  const contrast = (value: number) => (Math.max(value, fill) + 0.05) / (Math.min(value, fill) + 0.05);
  return contrast(light) >= contrast(dark) ? Palette.lightSurface : Palette.deepNavy;
}
