/** Finite, decorative SVG; progress comes only from the existing session projection. */
export function focusDialArt(progress: number, track: string, accent: string): string {
  if (!/^#[\da-f]{6}$/i.test(track) || !/^#[\da-f]{6}$/i.test(accent)) throw new RangeError('INVALID_DIAL_COLOR');
  const percent = Math.floor(Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0)) * 100);
  const length = 2 * Math.PI * 110;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><circle cx="120" cy="120" r="110" fill="none" stroke="${track}" stroke-width="5"/><circle cx="120" cy="120" r="110" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${length}" stroke-dashoffset="${length * (1 - percent / 100)}" transform="rotate(-90 120 120)"/></svg>`;
}
