import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { FocusDial } from '@/components/ui/focus-dial';
import { accentTextColor } from '@/theme/action-colors';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { loadSettings } from '@/features/settings/settings-storage';
import { getBreakCopy } from '@/features/localization/break-copy';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { useBreakRecovery } from '@/features/focus/use-break-recovery';

export default function TrueZenBreakRoute() {
  const router = useRouter();
  const { locale } = useAppLocale();
  const text = getBreakCopy(locale);
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const [duration, setDuration] = useState<5 | 10 | 15>(5);
  const recovery = useBreakRecovery();
  const breakTimer = recovery.record?.activeBreak ?? null;
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [chosenManually, setChosenManually] = useState(false);
  const chosenManuallyRef = useRef(false);
  const retrySettings = useRef<() => void>(() => {});
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = theme.primary;
  const onAction = accentTextColor(action);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setSettingsLoading(true);
      setSettingsError(false);
      try {
        const settings = await loadSettings();
        if (!mounted) return;
        if (!chosenManuallyRef.current) setDuration(settings.defaultBreakDurationMinutes);
        setSettingsLoaded(true);
      } catch {
        if (mounted) setSettingsError(true);
      } finally {
        if (mounted) setSettingsLoading(false);
      }
    };
    retrySettings.current = () => { void load(); };
    void load();
    return () => { mounted = false; retrySettings.current = () => {}; };
  }, []);

  const started = breakTimer !== null;
  const remaining = recovery.projection?.remainingSeconds ?? 0;

  const startBreak = () => {
    if (settingsLoading || (!settingsLoaded && !chosenManually)) return;
    void recovery.start(duration);
  };
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Pressable accessibilityLabel={text.back} accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Ionicons color={action} name="arrow-back" size={20} /><ThemedText style={{ color: action }} type="smallBold">{text.back}</ThemedText></Pressable>
          <SectionHeading eyebrow={text.eyebrow} title={text.title} subtitle={text.subtitle} icon="leaf-outline" />

          {recovery.loading ? <ThemedText accessibilityLiveRegion="polite">{text.recoveryLoading}</ThemedText> : null}
          {recovery.failed || recovery.clockError ? <ThemedView accessibilityRole="alert" style={[styles.settingsNotice, { borderColor: border }]}><ThemedText>{recovery.clockError ? text.clockError : text.recoveryError}</ThemedText><Button accentColor={action} label={text.recoveryRetry} loading={recovery.loading || recovery.saving} onPress={() => { void recovery.retry(); }} variant="secondary" /></ThemedView> : null}
          {!recovery.loading && !recovery.failed && !recovery.record?.session ? <ThemedText accessibilityLiveRegion="polite">{text.noSession}</ThemedText> : null}
          {started && recovery.projection ? <View accessible accessibilityRole="timer" accessibilityLabel={`${formatTime(remaining)} ${text.remaining}`}><FocusDial value={formatTime(remaining)} caption={text.remaining} progress={recovery.projection.progress} /></View> : null}

          <ThemedView accessibilityLabel={started ? `${formatTime(remaining)} ${text.remaining}` : text.durationLabel} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{text.eyebrow}</ThemedText>
            <ThemedText type="subtitle">{started ? (recovery.projection && remaining === 0 ? text.complete : text.settle) : text.choose}</ThemedText>
            {settingsLoading && !started ? <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary" type="small">{text.loading}</ThemedText> : null}
            {settingsError && !started ? <ThemedView accessibilityRole="alert" style={[styles.settingsNotice, { borderColor: border }]}><ThemedText themeColor="textSecondary" type="small">{text.error}</ThemedText><Button accentColor={action} label={text.retry} loading={settingsLoading} onPress={() => retrySettings.current()} variant="secondary" /></ThemedView> : null}
            {!started ? <View accessibilityRole="radiogroup" style={styles.durationRow}>{[5, 10, 15].map((value) => { const selected = (settingsLoaded || chosenManually) && value === duration; return <Pressable accessibilityLabel={`${value} ${text.minuteUnit}`} accessibilityRole="radio" accessibilityState={{ selected, checked: selected, disabled: settingsLoading }} disabled={settingsLoading} key={value} onPress={() => { setDuration(value as 5 | 10 | 15); setChosenManually(true); chosenManuallyRef.current = true; }} style={({ pressed }) => [styles.duration, { backgroundColor: selected ? action : 'transparent', borderColor: selected ? action : border }, pressed && styles.pressed]}><ThemedText style={selected ? { color: onAction } : undefined} type="smallBold">{value} {text.minuteUnit}</ThemedText></Pressable>; })}</View> : null}
            <View style={styles.guidance}><Guidance action={action} icon="water-outline" text={text.water} /><Guidance action={action} icon="walk-outline" text={text.move} /><Guidance action={action} icon="eye-outline" text={text.rest} /></View>
          </ThemedView>
          {!started ? <Button accentColor={action} disabled={!recovery.ready || settingsLoading || (!settingsLoaded && !chosenManually)} loading={recovery.saving} fullWidth label={`${text.start} ${duration}-${text.minuteUnit}`} onPress={startBreak} style={{ backgroundColor: action, borderColor: action }} /> : <Button accentColor={action} disabled={recovery.loading || recovery.saving} fullWidth label={text.resume} onPress={() => router.replace({ pathname: '/focus/session', params: { resume: '1' } })} style={{ backgroundColor: action, borderColor: action }} />}
          {!started ? <Button accentColor={action} disabled={recovery.loading || recovery.saving || !recovery.record?.session} fullWidth label={text.skip} onPress={() => router.replace({ pathname: '/focus/session', params: { resume: '1' } })} variant="secondary" /> : null}
          <ThemedText style={styles.note} themeColor="textMuted" type="small">{text.note}</ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Guidance({ action, icon, text }: { action: string; icon: keyof typeof Ionicons.glyphMap; text: string }) { return <View style={styles.guidanceRow}><Ionicons color={action} name={icon} size={20} /><ThemedText style={styles.guidanceText} themeColor="textSecondary" type="small">{text}</ThemedText></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1 }, scrollContent: { flexGrow: 1, alignItems: 'center', padding: Spacing.lg }, content: { width: '100%', maxWidth: 560, gap: Spacing.md }, back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, card: { marginTop: Spacing.sm, borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, settingsNotice: { borderWidth: 1, borderRadius: Radius.card, gap: Spacing.sm, padding: Spacing.md }, eyebrow: { letterSpacing: 1.1 }, durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }, duration: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexBasis: 84, flexGrow: 1, justifyContent: 'center', minHeight: 48, minWidth: 84 }, guidance: { gap: Spacing.sm, marginTop: Spacing.sm }, guidanceRow: { alignItems: 'flex-start', flexDirection: 'row', gap: Spacing.sm }, guidanceText: { flex: 1, minWidth: 0 }, pressed: { opacity: 0.78 }, note: { marginTop: Spacing.sm, textAlign: 'center' },
});
