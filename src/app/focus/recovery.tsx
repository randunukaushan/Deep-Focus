import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { loadActiveSession } from '@/features/focus/session-storage';
import { checkSessionRecovery } from '@/features/focus/session-recovery-state';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export default function SessionRecoveryRoute() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const [recoveryState, setRecoveryState] = useState<'checking' | 'empty' | 'error'>('checking');
  const check = useCallback(async () => {
    setRecoveryState('checking');
    const result = await checkSessionRecovery(loadActiveSession);
    if (result.state === 'error') {
      setRecoveryState('error');
      return;
    }
    if (result.session) {
      router.replace({ pathname: '/focus/session', params: { durationMinutes: String(result.session.plannedDurationSeconds / 60), taskName: result.session.taskName ?? '' } });
    } else {
      setRecoveryState('empty');
    }
  }, [router]);
  useEffect(() => {
    const handle = setTimeout(() => { void check(); }, 0);
    return () => clearTimeout(handle);
  }, [check]);
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;
  if (recoveryState === 'checking') return <ThemedView style={[styles.screen, { backgroundColor: background }]}><View accessibilityLiveRegion="polite" style={styles.loading}><View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="refresh-outline" size={30} /></View><ThemedText accessibilityRole="header" type="subtitle">Checking your focus session.</ThemedText><ThemedText themeColor="textSecondary">Restoring safely if your session was interrupted.</ThemedText></View></ThemedView>;
  if (recoveryState === 'error') return <ThemedView style={[styles.screen, { backgroundColor: background }]}><View accessibilityLiveRegion="polite" style={styles.loading}><View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="alert-circle-outline" size={30} /></View><ThemedText accessibilityRole="header" type="subtitle">We couldn’t check your saved session.</ThemedText><ThemedText themeColor="textSecondary">Your saved data hasn’t been changed. Try again, or return home and check later.</ThemedText><Button accentColor={action} fullWidth label="Try again" onPress={() => { void check(); }} style={{ backgroundColor: action, borderColor: action }} /><Button accentColor={action} fullWidth label="Return Home" onPress={() => router.replace('/(tabs)/home')} variant="secondary" /></View></ThemedView>;
  return <ThemedView style={[styles.screen, { backgroundColor: background }]}><ScrollView contentContainerStyle={styles.scrollContent}><View style={styles.content}><Pressable accessibilityLabel="Back to home" accessibilityRole="button" onPress={() => router.replace('/(tabs)/home')} style={styles.back}><Ionicons color={action} name="arrow-back" size={20} /><ThemedText style={{ color: action }} type="smallBold">Home</ThemedText></Pressable><View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="checkmark-circle-outline" size={32} /></View><ThemedText accessibilityRole="header" style={styles.title} type="title">You are ready when you are.</ThemedText><ThemedText themeColor="textSecondary" style={styles.subtitle}>There is no interrupted session waiting to be recovered. You can start fresh, without losing the progress already saved on this device.</ThemedText><ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}><Ionicons color={action} name="shield-checkmark-outline" size={24} /><ThemedText type="subtitle">Your progress is safe.</ThemedText><ThemedText themeColor="textSecondary">Deep Focus checks for an active session before showing this screen. If one is found, it opens automatically so you can continue.</ThemedText></ThemedView><Button accentColor={action} fullWidth label="Start a New Session" onPress={() => router.push('/focus/setup')} style={{ backgroundColor: action, borderColor: action }} /><Button accentColor={action} fullWidth label="Return Home" onPress={() => router.replace('/(tabs)/home')} variant="secondary" /></View></ScrollView></ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, loading: { alignItems: 'center', flex: 1, gap: Spacing.md, justifyContent: 'center', padding: Spacing.lg }, scrollContent: { flexGrow: 1, alignItems: 'center', padding: Spacing.lg }, content: { width: '100%', maxWidth: 560, gap: Spacing.md }, back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, icon: { alignItems: 'center', borderRadius: 40, borderWidth: 1, height: 72, justifyContent: 'center', marginTop: Spacing.sm, width: 72 }, title: { marginTop: Spacing.sm }, subtitle: { lineHeight: Typography.body.fontSize * 1.5 }, card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, marginTop: Spacing.sm, padding: Spacing.lg },
});
