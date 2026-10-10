import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { loadSettings } from '@/features/settings/settings-storage';
import { getBreakCopy } from '@/features/localization/break-copy';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function TrueZenBreakRoute() {
  const router = useRouter();
  const { locale } = useAppLocale();
  const text = getBreakCopy(locale);
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const [duration, setDuration] = useState<5 | 10 | 15>(5);
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [chosenManually, setChosenManually] = useState(false);
  const chosenManuallyRef = useRef(false);
  const retrySettings = useRef<() => void>(() => {});
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;

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

  useEffect(() => {
    if (!started || remaining <= 0) return;
    const interval = setInterval(() => setRemaining((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(interval);
  }, [remaining, started]);

  const startBreak = () => {
    if (settingsLoading || (!settingsLoaded && !chosenManually)) return;
    setRemaining(duration * 60);
    setStarted(true);
  };
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Pressable accessibilityLabel={text.back} accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Ionicons color={action} name="arrow-back" size={20} /><ThemedText style={{ color: action }} type="smallBold">{text.back}</ThemedText></Pressable>
          <View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="leaf-outline" size={32} /></View>
          <ThemedText accessibilityRole="header" style={styles.title} type="title">{text.title}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>{text.subtitle}</ThemedText>

          <ThemedView accessibilityLabel={started ? `${formatTime(remaining)} ${text.remaining}` : text.durationLabel} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{text.eyebrow}</ThemedText>
            <ThemedText type="subtitle">{started ? (remaining === 0 ? text.complete : text.settle) : text.choose}</ThemedText>
            {settingsLoading && !started ? <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary" type="small">{text.loading}</ThemedText> : null}
            {settingsError && !started ? <ThemedView accessibilityRole="alert" style={[styles.settingsNotice, { borderColor: border }]}><ThemedText themeColor="textSecondary" type="small">{text.error}</ThemedText><Button accentColor={action} label={text.retry} loading={settingsLoading} onPress={() => retrySettings.current()} variant="secondary" /></ThemedView> : null}
            {started ? <ThemedText accessibilityRole="timer" style={[styles.timer, { color: action }]}>{formatTime(remaining)}</ThemedText> : <View accessibilityRole="radiogroup" style={styles.durationRow}>{[5, 10, 15].map((value) => { const selected = (settingsLoaded || chosenManually) && value === duration; return <Pressable accessibilityLabel={`${value} ${text.minuteUnit}`} accessibilityRole="radio" accessibilityState={{ selected, disabled: settingsLoading }} disabled={settingsLoading} key={value} onPress={() => { setDuration(value as 5 | 10 | 15); setChosenManually(true); chosenManuallyRef.current = true; }} style={({ pressed }) => [styles.duration, { backgroundColor: selected ? action : 'transparent', borderColor: selected ? action : border }, pressed && styles.pressed]}><ThemedText style={selected ? { color: Palette.deepNavy } : undefined} type="smallBold">{value} {text.minuteUnit}</ThemedText></Pressable>; })}</View>}
            <View style={styles.guidance}><Guidance action={action} icon="water-outline" text={text.water} /><Guidance action={action} icon="walk-outline" text={text.move} /><Guidance action={action} icon="eye-outline" text={text.rest} /></View>
          </ThemedView>
          {!started ? <Button accentColor={action} disabled={settingsLoading || (!settingsLoaded && !chosenManually)} fullWidth label={`${text.start} ${duration}-${text.minuteUnit}`} onPress={startBreak} style={{ backgroundColor: action, borderColor: action }} /> : <Button accentColor={action} fullWidth label={text.resume} onPress={() => router.replace({ pathname: '/focus/session', params: { resume: '1' } })} style={{ backgroundColor: action, borderColor: action }} />}
          {!started ? <Button accentColor={action} fullWidth label={text.skip} onPress={() => router.replace({ pathname: '/focus/session', params: { resume: '1' } })} variant="secondary" /> : null}
          <ThemedText style={styles.note} themeColor="textMuted" type="small">{text.note}</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Guidance({ action, icon, text }: { action: string; icon: keyof typeof Ionicons.glyphMap; text: string }) { return <View style={styles.guidanceRow}><Ionicons color={action} name={icon} size={20} /><ThemedText themeColor="textSecondary" type="small">{text}</ThemedText></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1 }, scrollContent: { flexGrow: 1, alignItems: 'center', padding: Spacing.lg }, content: { width: '100%', maxWidth: 560, gap: Spacing.md }, back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, icon: { alignItems: 'center', borderRadius: 40, borderWidth: 1, height: 72, justifyContent: 'center', marginTop: Spacing.sm, width: 72 }, title: { marginTop: Spacing.sm }, subtitle: { lineHeight: Typography.body.fontSize * 1.5 }, card: { marginTop: Spacing.sm, borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, settingsNotice: { borderWidth: 1, borderRadius: Radius.card, gap: Spacing.sm, padding: Spacing.md }, eyebrow: { letterSpacing: 1.1 }, durationRow: { flexDirection: 'row', gap: Spacing.sm }, duration: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 48 }, timer: { fontSize: 48, fontWeight: '700', lineHeight: 56, textAlign: 'center' }, guidance: { gap: Spacing.sm, marginTop: Spacing.sm }, guidanceRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm }, pressed: { opacity: 0.78 }, note: { marginTop: Spacing.sm, textAlign: 'center' },
});
