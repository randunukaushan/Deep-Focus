import { useState } from 'react';
import { Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { getPresentationCopy } from '@/features/localization/presentation-copy';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/theme/tokens';
import { usePresentation } from './presentation-context';
import { validPresentationPreferences, type PresentationPreferences } from './presentation-preferences';

export function PresentationPanel() {
  const state = usePresentation();
  const { locale } = useAppLocale();
  const t = getPresentationCopy(locale);
  if (!state || state.loading) return <ThemedText accessibilityLiveRegion="polite">{t.loading}</ThemedText>;
  if (state.error) return <View><ThemedText accessibilityRole="alert">{t.unavailable}</ThemedText><Button label={t.retry} onPress={state.retry} /></View>;
  return <PreferenceEditor initial={state.preferences} saving={state.saving} save={state.save} />;
}

function PreferenceEditor({ initial, saving, save }: { initial: PresentationPreferences; saving: boolean; save: (p: PresentationPreferences) => Promise<boolean> }) {
  const [draft, setDraft] = useState(initial);
  const [message, setMessage] = useState('');
  const theme = useTheme();
  const { locale } = useAppLocale();
  const t = getPresentationCopy(locale);
  const change = <K extends keyof PresentationPreferences>(key: K, value: PresentationPreferences[K]) => { setMessage(''); setDraft(p => ({ ...p, [key]: value })); };
  const choice = <K extends 'appearance' | 'motivation'>(key: K, value: PresentationPreferences[K], label: string) => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ checked: draft[key] === value, disabled: saving }} disabled={saving} onPress={() => change(key, value)} style={[styles.choice, { borderColor: draft[key] === value ? theme.primary : theme.border, backgroundColor: draft[key] === value ? theme.surfaceElevated : theme.surface }]}><ThemedText>{label}</ThemedText></Pressable>;
  return <View style={styles.section}>
    <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <ThemedText accessibilityRole="header" type="subtitle">{t.look}</ThemedText>
      <View accessibilityRole="radiogroup" accessibilityLabel={t.look} style={styles.choices}>{choice('appearance', 'system', t.system)}{choice('appearance', 'light', t.light)}{choice('appearance', 'dark', t.dark)}</View>
      <View style={styles.row}><View style={styles.label}><ThemedText>{t.motion}</ThemedText><ThemedText type="small" themeColor="textSecondary">{t.motionHint}</ThemedText></View><Switch accessibilityLabel={t.motion} disabled={saving} value={draft.reduceMotion} onValueChange={v => change('reduceMotion', v)} /></View>
    </View>
    <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <ThemedText accessibilityRole="header" type="subtitle">{t.words}</ThemedText>
      <View accessibilityRole="radiogroup" accessibilityLabel={t.words} style={styles.choices}>{choice('motivation', 'default', t.default)}{choice('motivation', 'personal', t.personal)}{choice('motivation', 'off', t.off)}</View>
      {draft.motivation === 'personal' ? <><ThemedText>{t.phrase}</ThemedText><TextInput accessibilityLabel={t.phrase} multiline editable={!saving} value={draft.personalPhrase} onChangeText={v => change('personalPhrase', v)} style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]} /><ThemedText type="small" themeColor="textSecondary">{[...draft.personalPhrase].length} / 240</ThemedText></> : null}
      <View style={styles.row}><View style={styles.label}><ThemedText>{t.focus}</ThemedText><ThemedText type="small" themeColor="textSecondary">{t.focusHint}</ThemedText></View><Switch accessibilityLabel={t.focus} disabled={saving} value={draft.showDuringFocus} onValueChange={v => change('showDuringFocus', v)} /></View>
      <ThemedText type="small" themeColor="textSecondary">{t.privacy}</ThemedText>
    </View>
    <Button label={t.save} loading={saving} disabled={saving} onPress={() => {
      if (!validPresentationPreferences(draft)) { setMessage(t.invalid); return; }
      void save(draft).then(ok => setMessage(ok ? t.saved : t.failed));
    }} />
    {message ? <ThemedText accessibilityLiveRegion="polite">{message}</ThemedText> : null}
  </View>;
}
const styles = StyleSheet.create({ section: { gap: Spacing.md }, card: { gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.card, borderWidth: 1 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }, choice: { minHeight: 48, padding: Spacing.sm, borderWidth: 1, borderRadius: Radius.card, justifyContent: 'center' }, row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, label: { flex: 1, gap: Spacing.xs }, input: { borderWidth: 1, borderRadius: Radius.card, padding: Spacing.md, minHeight: 100, fontSize: 16, textAlignVertical: 'top' } });
