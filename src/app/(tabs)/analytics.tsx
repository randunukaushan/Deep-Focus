import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatSessionDuration, getHistoricalSessions } from '@/features/focus/session-history';
import { loadSessionHistory } from '@/features/focus/session-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function AnalyticsRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? theme.background : Palette.homeLightActionSoft;
  const [sessions, setSessions] = useState<ReturnType<typeof getHistoricalSessions>>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let mounted = true;
    setLoading(true);
    void loadSessionHistory().then((history) => {
      if (!mounted) return;
      setSessions(getHistoricalSessions(history));
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []));

  const completed = sessions.filter((session) => session.status === 'completed');
  const focusedSeconds = completed.reduce((total, session) => total + session.focusedDurationSeconds, 0);
  const plannedSeconds = completed.reduce((total, session) => total + session.plannedDurationSeconds, 0);
  const completionRate = plannedSeconds > 0 ? Math.round((focusedSeconds / plannedSeconds) * 100) : 0;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">ANALYTICS</ThemedText>
            <ThemedText accessibilityRole="header" type="title" style={styles.title}>Notice your rhythm.</ThemedText>
            <ThemedText themeColor="textSecondary">A clear view of the focus time you have protected.</ThemedText>
          </View>

          {loading ? <View accessibilityLabel="Loading analytics" style={styles.loading}><ActivityIndicator color={action} /></View> : sessions.length === 0 ? (
            <ThemedView accessibilityLabel="No analytics available yet" style={[styles.emptyCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={[styles.largeIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="bar-chart-outline" size={28} /></View>
              <ThemedText type="subtitle" style={styles.cardTitle}>Your pattern will appear here.</ThemedText>
              <ThemedText themeColor="textSecondary">Complete a focus session to start building a quiet, useful record of your work.</ThemedText>
              <Pressable accessibilityLabel="Open session history" accessibilityRole="button" onPress={() => router.push('/analytics/history')} style={({ pressed }) => [styles.outlineButton, { borderColor: action }, pressed && styles.pressed]}><ThemedText style={{ color: action }} type="smallBold">View session history</ThemedText></Pressable>
            </ThemedView>
          ) : (
            <>
              <View style={styles.metrics}>
                <Metric action={action} border={border} icon="time-outline" label="FOCUS TIME" value={formatSessionDuration(focusedSeconds)} />
                <Metric action={action} border={border} icon="checkmark-circle-outline" label="COMPLETED" value={String(completed.length)} />
                <Metric action={action} border={border} icon="trending-up-outline" label="FOCUS / PLAN" value={`${completionRate}%`} />
              </View>
              <ThemedView accessibilityLabel={`You completed ${completed.length} focus sessions and focused for ${formatSessionDuration(focusedSeconds)}`} style={[styles.insightCard, { backgroundColor: surface, borderColor: border }]}>
                <View style={[styles.largeIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="leaf-outline" size={25} /></View>
                <View style={styles.insightCopy}><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">YOUR PROGRESS</ThemedText><ThemedText type="subtitle" style={styles.cardTitle}>{completed.length === 1 ? 'One block protected.' : `${completed.length} blocks protected.`}</ThemedText><ThemedText themeColor="textSecondary">Progress is based on completed sessions saved on this device.</ThemedText></View>
              </ThemedView>
              <Pressable accessibilityLabel="Open session history" accessibilityRole="button" onPress={() => router.push('/analytics/history')} style={({ pressed }) => [styles.historyButton, { backgroundColor: action, borderColor: action }, pressed && styles.pressed]}><ThemedText style={{ color: Palette.deepNavy }} type="smallBold">View session history</ThemedText><Ionicons color={Palette.deepNavy} name="arrow-forward" size={18} /></Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Metric({ action, border, icon, label, value }: { action: string; border: string; icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return <ThemedView accessibilityLabel={`${label}: ${value}`} style={[styles.metric, { borderColor: border }]}><Ionicons color={action} name={icon} size={21} /><ThemedText style={styles.metricLabel} themeColor="textSecondary" type="smallBold">{label}</ThemedText><ThemedText style={styles.metricValue} type="subtitle">{value}</ThemedText></ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' }, header: { gap: Spacing.xs }, title: { fontSize: 38, lineHeight: 44 }, eyebrow: { letterSpacing: 1.2 }, loading: { alignItems: 'center', minHeight: 180, justifyContent: 'center' }, metrics: { flexDirection: 'row', gap: Spacing.sm }, metric: { borderRadius: Radius.card, borderWidth: 1, flex: 1, gap: Spacing.xs, minHeight: 128, padding: Spacing.md }, metricLabel: { fontSize: 11, letterSpacing: 0.7 }, metricValue: { fontSize: 22, lineHeight: 28 }, emptyCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, largeIcon: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 }, cardTitle: { fontSize: 25, lineHeight: 32 }, outlineButton: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, justifyContent: 'center', minHeight: 48, paddingHorizontal: Spacing.md }, insightCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg }, insightCopy: { flex: 1, gap: Spacing.xs }, historyButton: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center', minHeight: 48, paddingHorizontal: Spacing.md }, pressed: { opacity: 0.78 },
});
