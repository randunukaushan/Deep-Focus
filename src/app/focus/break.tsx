import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export default function TrueZenBreakRoute() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const [duration, setDuration] = useState(5);
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;

  useEffect(() => {
    if (!started || remaining <= 0) return;
    const interval = setInterval(() => setRemaining((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(interval);
  }, [remaining, started]);

  const startBreak = () => {
    setRemaining(duration * 60);
    setStarted(true);
  };
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Pressable accessibilityLabel="Back to focus session" accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Ionicons color={action} name="arrow-back" size={20} /><ThemedText style={{ color: action }} type="smallBold">Focus Session</ThemedText></Pressable>
          <View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="leaf-outline" size={32} /></View>
          <ThemedText accessibilityRole="header" style={styles.title} type="title">Make room to recover.</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>A break is part of the work. Step away, breathe, and return when your attention feels ready.</ThemedText>

          <ThemedView accessibilityLabel={started ? `${formatTime(remaining)} remaining in break` : 'Choose a break duration'} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">OPTIONAL BREAK</ThemedText>
            <ThemedText type="subtitle">{started ? (remaining === 0 ? 'Break complete.' : 'Let your attention settle.') : 'Choose a gentle pause.'}</ThemedText>
            {started ? <ThemedText accessibilityRole="timer" style={[styles.timer, { color: action }]}>{formatTime(remaining)}</ThemedText> : <View accessibilityRole="radiogroup" style={styles.durationRow}>{[5, 10, 15].map((value) => { const selected = value === duration; return <Pressable accessibilityLabel={`${value} minute break`} accessibilityRole="radio" accessibilityState={{ selected }} key={value} onPress={() => setDuration(value)} style={({ pressed }) => [styles.duration, { backgroundColor: selected ? action : 'transparent', borderColor: selected ? action : border }, pressed && styles.pressed]}><ThemedText style={selected ? { color: Palette.deepNavy } : undefined} type="smallBold">{value} min</ThemedText></Pressable>; })}</View>}
            <View style={styles.guidance}><Guidance action={action} icon="water-outline" text="Drink some water" /><Guidance action={action} icon="walk-outline" text="Move away from the screen" /><Guidance action={action} icon="eye-outline" text="Let your eyes rest" /></View>
          </ThemedView>
          {!started ? <Button accentColor={action} fullWidth label={`Start ${duration}-minute break`} onPress={startBreak} style={{ backgroundColor: action, borderColor: action }} /> : <Button accentColor={action} fullWidth label="Resume Focus" onPress={() => router.replace({ pathname: '/focus/session', params: { resume: '1' } })} style={{ backgroundColor: action, borderColor: action }} />}
          {!started ? <Button accentColor={action} fullWidth label="Skip Break" onPress={() => router.replace({ pathname: '/focus/session', params: { resume: '1' } })} variant="secondary" /> : null}
          <ThemedText style={styles.note} themeColor="textMuted" type="small">Your focus session remains paused until you choose to resume.</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Guidance({ action, icon, text }: { action: string; icon: keyof typeof Ionicons.glyphMap; text: string }) { return <View style={styles.guidanceRow}><Ionicons color={action} name={icon} size={20} /><ThemedText themeColor="textSecondary" type="small">{text}</ThemedText></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1 }, scrollContent: { flexGrow: 1, alignItems: 'center', padding: Spacing.lg }, content: { width: '100%', maxWidth: 560, gap: Spacing.md }, back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, icon: { alignItems: 'center', borderRadius: 40, borderWidth: 1, height: 72, justifyContent: 'center', marginTop: Spacing.sm, width: 72 }, title: { marginTop: Spacing.sm }, subtitle: { lineHeight: Typography.body.fontSize * 1.5 }, card: { marginTop: Spacing.sm, borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, eyebrow: { letterSpacing: 1.1 }, durationRow: { flexDirection: 'row', gap: Spacing.sm }, duration: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 48 }, timer: { fontSize: 48, fontWeight: '700', lineHeight: 56, textAlign: 'center' }, guidance: { gap: Spacing.sm, marginTop: Spacing.sm }, guidanceRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm }, pressed: { opacity: 0.78 }, note: { marginTop: Spacing.sm, textAlign: 'center' },
});
