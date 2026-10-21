export type PresentationPreferences = {
  appearance: 'system' | 'light' | 'dark';
  reduceMotion: boolean;
  motivation: 'default' | 'personal' | 'off';
  personalPhrase: string;
  showDuringFocus: boolean;
};

export const defaultPresentationPreferences: PresentationPreferences = {
  appearance: 'system', reduceMotion: false, motivation: 'default', personalPhrase: '', showDuringFocus: false,
};

export function validPresentationPreferences(value: unknown): value is PresentationPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const p = value as Record<string, unknown>;
  return Object.keys(p).length === 5
    && ['system', 'light', 'dark'].includes(p.appearance as string)
    && typeof p.reduceMotion === 'boolean'
    && ['default', 'personal', 'off'].includes(p.motivation as string)
    && typeof p.personalPhrase === 'string' && [...p.personalPhrase].length <= 240
    && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(p.personalPhrase)
    && typeof p.showDuringFocus === 'boolean';
}

export function motivationPhrase(p: PresentationPreferences, fallback: string): string {
  return p.motivation === 'off' ? '' : p.motivation === 'personal' ? p.personalPhrase.trim() : fallback;
}
