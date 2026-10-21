import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { DeepFocusScene } from '@/components/deep-focus-scene';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { getSetupCopy } from './setup-copy';
import { useSetup } from './setup-context';

export function SetupFrame({ children, step, onBack, scene = false }: PropsWithChildren<{ step?: number; onBack?: () => void; scene?: boolean }>) {
  const theme = useTheme();
  const dark = useColorScheme() === 'dark';
  const { locale } = useAppLocale();
  const copy = getSetupCopy(locale);
  const progress = step ? copy.step.replace('{current}', String(step)) : copy.review;
  return <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <View style={styles.toolbar}>
          {onBack ? <Pressable accessibilityRole="button" accessibilityLabel={copy.back} onPress={onBack} style={styles.back}><Ionicons name="arrow-back" size={22} color={theme.primary} /><ThemedText type="smallBold">{copy.back}</ThemedText></Pressable> : <ThemedText type="smallBold" style={{ color: theme.primary }}>Deep Focus</ThemedText>}
          <ThemedText type="small" themeColor="textSecondary">{progress}</ThemedText>
        </View>
        {step ? <View accessibilityRole="progressbar" accessibilityLabel={progress} accessibilityValue={{ min: 1, max: 5, now: step }} style={[styles.track, { backgroundColor: theme.border }]}><View style={[styles.fill, { backgroundColor: theme.primary, width: `${step / 5 * 100}%` }]} /></View> : null}
        {scene ? <View style={[styles.scene, { borderColor: theme.border }]}><DeepFocusScene dark={dark} /></View> : null}
        {children}
        <ThemedText type="small" themeColor="textSecondary" style={styles.privacy}>{copy.privacy}</ThemedText>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

export function SetupChoice({ label, selected, onPress, disabled = false, checkbox = false, detail }: { label: string; selected: boolean; onPress(): void; disabled?: boolean; checkbox?: boolean; detail?: string }) {
  const theme = useTheme();
  const dark = useColorScheme() === 'dark';
  return <Pressable accessibilityRole={checkbox ? 'checkbox' : 'radio'} accessibilityLabel={detail ? `${label}. ${detail}` : label} accessibilityState={{ checked: selected, disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.choice, { backgroundColor: selected ? theme.backgroundElement : theme.surface, borderColor: selected ? theme.primary : theme.border }, pressed && styles.pressed, disabled && styles.disabled]}>
    <View style={styles.choiceCopy}><ThemedText>{label}</ThemedText>{detail ? <ThemedText themeColor="textSecondary" type="small">{detail}</ThemedText> : null}</View>
    <View style={[styles.mark, { borderColor: selected ? theme.primary : theme.textSecondary, backgroundColor: selected ? theme.primary : 'transparent', borderRadius: checkbox ? 6 : 12 }]}>{selected ? <Ionicons name="checkmark" size={16} color={dark ? Palette.deepNavy : Palette.lightSurface} /> : null}</View>
  </Pressable>;
}

export function SetupFeedback() {
  const flow = useSetup();
  const { locale } = useAppLocale();
  const copy = getSetupCopy(locale);
  if (flow.status === 'loading' || flow.status === 'saving') return <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">{flow.status === 'loading' ? copy.loading : copy.saving}</ThemedText>;
  if (flow.error) return <View style={styles.feedback}><ThemedText accessibilityRole="alert">{flow.error === 'conflict' ? copy.conflict : copy.failed}</ThemedText><Button label={copy.retry} variant="secondary" onPress={() => { void flow.retry(); }} /></View>;
  return null;
}

/** A synchronous lock covers taps before React has rendered its busy state. */
export function useSetupAction() {
  const lock = useRef(false);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  return { busy, error, run: async (work: (active: () => boolean) => Promise<void>) => {
    if (!mounted.current || lock.current) return;
    lock.current = true; setBusy(true); setError(false);
    try { await work(() => mounted.current); }
    catch { if (mounted.current) setError(true); }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  } };
}

export const setupStyles = StyleSheet.create({
  title: { fontSize: 30, lineHeight: 43, marginTop: Spacing.sm },
  detail: { marginBottom: Spacing.sm },
  options: { gap: Spacing.sm, marginVertical: Spacing.sm },
  actions: { gap: Spacing.sm, marginTop: Spacing.md },
  card: { padding: Spacing.md, borderWidth: 1, borderRadius: Radius.card, gap: Spacing.sm },
});
const styles = StyleSheet.create({
  screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg, alignItems: 'center' },
  content: { width: '100%', maxWidth: 520, gap: Spacing.md },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  back: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingRight: Spacing.sm },
  track: { height: 4, borderRadius: 4, overflow: 'hidden' }, fill: { height: '100%' },
  scene: { height: 185, borderRadius: Radius.card, overflow: 'hidden', borderWidth: 1 },
  choice: { minHeight: 64, borderWidth: 1, borderRadius: Radius.card, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  choiceCopy: { flex: 1, minWidth: 0, gap: Spacing.xs }, mark: { width: 24, height: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  privacy: { marginTop: Spacing.md, paddingTop: Spacing.md }, feedback: { gap: Spacing.sm },
  pressed: { opacity: 0.78 }, disabled: { opacity: 0.7 },
});
