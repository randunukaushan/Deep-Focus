import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { loadActiveSession } from '@/features/focus/session-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export default function SessionRecoveryRoute() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    loadActiveSession().then((session) => {
      if (session) router.replace({ pathname: '/focus/session', params: { durationMinutes: String(session.plannedDurationSeconds / 60), taskName: session.taskName ?? '' } });
      else setChecked(true);
    });
  }, [router]);
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;
  if (!checked) return <ThemedView style={[styles.screen, { backgroundColor: background }]}><View style={styles.loading}><View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="refresh-outline" size={30} /></View><ThemedText accessibilityRole="header" type="subtitle">Checking your focus session.</ThemedText><ThemedText themeColor="textSecondary">Restoring safely if your session was interrupted.</ThemedText></View></ThemedView>;
  return <ThemedView style={[styles.screen, { backgroundColor: background }]}><ScrollView contentContainerStyle={styles.scrollContent}><View style={styles.content}><Pressable accessibilityLabel="Back to home" accessibilityRole="button" onPress={() => router.replace('/(tabs)/home')} style={styles.back}><Ionicons color={action} name="arrow-back" size={20} /><ThemedText style={{ color: action }} type="smallBold">Home</ThemedText></Pressable><View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="checkmark-circle-outline" size={32} /></View><ThemedText accessibilityRole="header" style={styles.title} type="title">You are ready when you are.</ThemedText><ThemedText themeColor="textSecondary" style={styles.subtitle}>There is no interrupted session waiting to be recovered. You can start fresh, without losing the progress already saved on this device.</ThemedText><ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}><Ionicons color={action} name="shield-checkmark-outline" size={24} /><ThemedText type="subtitle">Your progress is safe.</ThemedText><ThemedText themeColor="textSecondary">Deep Focus checks for an active session before showing this screen. If one is found, it opens automatically so you can continue.</ThemedText></ThemedView><Button accentColor={action} fullWidth label="Start a New Session" onPress={() => router.push('/focus/setup')} style={{ backgroundColor: action, borderColor: action }} /><Button accentColor={action} fullWidth label="Return Home" onPress={() => router.replace('/(tabs)/home')} variant="secondary" /></View></ScrollView></ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, loading: { alignItems: 'center', flex: 1, gap: Spacing.md, justifyContent: 'center', padding: Spacing.lg }, scrollContent: { flexGrow: 1, alignItems: 'center', padding: Spacing.lg }, content: { width: '100%', maxWidth: 560, gap: Spacing.md }, back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, icon: { alignItems: 'center', borderRadius: 40, borderWidth: 1, height: 72, justifyContent: 'center', marginTop: Spacing.sm, width: 72 }, title: { marginTop: Spacing.sm }, subtitle: { lineHeight: Typography.body.fontSize * 1.5 }, card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, marginTop: Spacing.sm, padding: Spacing.lg },
});
