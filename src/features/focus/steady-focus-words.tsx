import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { motivationPhrase, type PresentationPreferences } from '@/features/settings/presentation-preferences';

/** Mount once per session; personal text never enters the persisted session. */
export function SteadyFocusWords({ preferences, fallback }: { preferences: PresentationPreferences; fallback: string }) {
  const enabled = preferences.showDuringFocus && preferences.motivation !== 'off';
  const [phrase, setPhrase] = useState(() => enabled ? motivationPhrase(preferences, fallback) : '');
  // Once disabled, the phrase stays absent until the next session.
  if (!enabled && phrase) setPhrase('');
  return enabled && phrase ? <ThemedText style={{ textAlign: 'center' }} themeColor="textSecondary">{phrase}</ThemedText> : null;
}
