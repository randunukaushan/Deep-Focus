import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatSessionDuration, getHistoricalSessions } from '@/features/focus/session-history';
import { loadSessionHistory } from '@/features/focus/session-storage';
import { summarizeProgress, type ProgressWindow } from '@/features/progress/progress-analytics';
import { loadGoals } from '@/features/goals/goal-storage';
import { getProgressCopy } from '@/features/localization/progress-copy';
import { useAppLocale } from '@/features/localization/app-locale-context';
import type { Goal } from '@/features/goals/goal-types';
import { loadTasks } from '@/features/tasks/task-storage';
import type { Task } from '@/features/tasks/task-types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function ProgressRoute() {
  const router = useRouter();
  const { locale } = useAppLocale();
  const text = getProgressCopy(locale);
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? theme.background : Palette.homeLightActionSoft;
  const [sessions, setSessions] = useState<ReturnType<typeof getHistoricalSessions>>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [window, setWindow] = useState<ProgressWindow>('week');
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const retryRef = useRef<() => void>(() => {});

  useFocusEffect(useCallback(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const [storedSessions, storedTasks, storedGoals] = await Promise.all([loadSessionHistory(), loadTasks(), loadGoals()]);
        if (!mounted) return;
        setSessions(getHistoricalSessions(storedSessions));
        setTasks(storedTasks);
        setGoals(storedGoals);
        setNow(Date.now());
        setLoading(false);
      } catch {
        if (!mounted) return;
        setLoadError(true);
        setLoading(false);
      }
    };
    retryRef.current = () => { void load(); };
    void load();
    return () => { mounted = false; retryRef.current = () => {}; };
  }, []));

  let summary = null;
  if (!loading && !loadError) {
    try {
      summary = summarizeProgress(sessions, tasks, goals, { window, now, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' });
    } catch {
      // Corrupt or conflicting local snapshots are shown as unavailable, never as a fabricated zero.
    }
  }

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{text.eyebrow}</ThemedText>
            <ThemedText accessibilityRole="header" type="title" style={styles.title}>{text.title}</ThemedText>
            <ThemedText themeColor="textSecondary">{text.subtitle}</ThemedText>
          </View>

          {loading ? <View accessibilityLabel={text.loading} accessibilityLiveRegion="polite" style={styles.loading}><ActivityIndicator color={action} /></View> : loadError ? (
            <ThemedView accessibilityLabel={text.loadErrorLabel} accessibilityLiveRegion="polite" style={[styles.emptyCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={[styles.largeIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="cloud-offline-outline" size={28} /></View>
              <ThemedText accessibilityRole="header" type="subtitle" style={styles.cardTitle}>{text.loadErrorTitle}</ThemedText>
              <ThemedText themeColor="textSecondary">{text.loadErrorDetail}</ThemedText>
              <Pressable accessibilityLabel={text.retry} accessibilityRole="button" onPress={() => retryRef.current()} style={({ pressed }) => [styles.outlineButton, { borderColor: action }, pressed && styles.pressed]}><ThemedText style={{ color: action }} type="smallBold">{text.retry}</ThemedText></Pressable>
            </ThemedView>
          ) : summary === null ? (
            <ThemedView accessibilityLabel={text.unavailableLabel} style={[styles.emptyCard, { backgroundColor: surface, borderColor: border }]}>
              <ThemedText type="subtitle" style={styles.cardTitle}>{text.unavailableTitle}</ThemedText>
              <ThemedText themeColor="textSecondary">{text.unavailableDetail}</ThemedText>
              <Pressable accessibilityLabel={text.retry} accessibilityRole="button" onPress={() => retryRef.current()} style={[styles.outlineButton, { borderColor: action }]}><ThemedText style={{ color: action }} type="smallBold">{text.retry}</ThemedText></Pressable>
            </ThemedView>
          ) : sessions.length === 0 && tasks.length === 0 && goals.length === 0 ? (
            <ThemedView accessibilityLabel={text.emptyLabel} style={[styles.emptyCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={[styles.largeIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="bar-chart-outline" size={28} /></View>
              <ThemedText type="subtitle" style={styles.cardTitle}>{text.emptyTitle}</ThemedText>
              <ThemedText themeColor="textSecondary">{text.emptyDetail}</ThemedText>
              <Pressable accessibilityLabel={text.viewHistory} accessibilityRole="button" onPress={() => router.push('/progress/history')} style={({ pressed }) => [styles.outlineButton, { borderColor: action }, pressed && styles.pressed]}><ThemedText style={{ color: action }} type="smallBold">{text.viewHistory}</ThemedText></Pressable>
            </ThemedView>
          ) : (
            <>
              <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary" type="small">{text.calendar.replace('{zone}', Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')}</ThemedText>
              <View accessibilityRole="tablist" accessibilityLabel={text.title} style={styles.filters}>
                {(['week', 'month', 'all'] as const).map((option) => <Pressable key={option} accessibilityRole="tab" accessibilityState={{ selected: window === option }} onPress={() => setWindow(option)} style={[styles.filter, { borderColor: action, backgroundColor: window === option ? action : 'transparent' }]}><ThemedText type="smallBold" style={{ color: window === option ? Palette.deepNavy : action }}>{option === 'week' ? text.week : option === 'month' ? text.month : text.allTime}</ThemedText></Pressable>)}
              </View>
              <View style={styles.metrics}>
                <Metric action={action} border={border} icon="time-outline" label={text.focusTime} value={formatSessionDuration(summary.focusedSeconds)} />
                <Metric action={action} border={border} icon="checkmark-circle-outline" label={text.sessions} value={String(summary.completedSessions)} />
                <Metric action={action} border={border} icon="checkbox-outline" label={text.tasksDone} value={String(summary.completedTasks)} />
              </View>
              <ThemedView accessibilityLabel={`${summary.completedSessions} ${text.sessionsWord}; ${formatSessionDuration(summary.focusedSeconds)} ${text.focusTime}`} style={[styles.insightCard, { backgroundColor: surface, borderColor: border }]}>
                <View style={[styles.largeIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="leaf-outline" size={25} /></View>
                <View style={styles.insightCopy}><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{text.insightEyebrow}</ThemedText><ThemedText type="subtitle" style={styles.cardTitle}>{summary.completedSessions === 1 ? text.oneBlock : `${summary.completedSessions} ${text.blocks}`}</ThemedText><ThemedText themeColor="textSecondary">{text.insightDetail}</ThemedText></View>
              </ThemedView>
              {window === 'week' && <ThemedView style={[styles.chartCard, { backgroundColor: surface, borderColor: border }]}><ThemedText accessibilityRole="header" type="subtitle">{text.weekFocus}</ThemedText><View style={styles.chart}>{summary.activityDays.map((day) => { const max = Math.max(1, ...summary!.activityDays.map((entry) => entry.focusedSeconds)); const height = day.focusedSeconds ? Math.max(6, Math.round((day.focusedSeconds / max) * 84)) : 2; return <View key={day.date} accessibilityLabel={`${day.date}, ${day.focusedSeconds} ${text.focusTime}`} style={styles.chartDay}><View style={[styles.barTrack, { backgroundColor: softAction }]}><View style={[styles.bar, { height, backgroundColor: action }]} /></View><ThemedText type="small">{day.day}</ThemedText><ThemedText type="small">{formatSessionDuration(day.focusedSeconds)}</ThemedText></View>; })}</View></ThemedView>}
              {summary.goals.length > 0 && <ThemedView style={[styles.goalCard, { backgroundColor: surface, borderColor: border }]}><ThemedText accessibilityRole="header" type="subtitle">{text.goals}</ThemedText>{summary.goals.map((goal) => <View key={goal.id} accessibilityLabel={`${goal.title}, ${text.goals}, ${Math.round(goal.progress * 100)}%`} style={styles.goalRow}><View style={styles.goalCopy}><ThemedText type="smallBold">{goal.title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{goal.type === 'focus_time' ? formatSessionDuration(goal.currentValue) : `${goal.currentValue} ${text.sessionsWord}`} of {goal.type === 'focus_time' ? formatSessionDuration(goal.targetValue) : `${goal.targetValue} ${text.sessionsWord}`}</ThemedText></View><ThemedText style={{ color: action }} type="smallBold">{Math.round(goal.progress * 100)}%</ThemedText></View>)}</ThemedView>}
              <Pressable accessibilityLabel={text.viewHistory} accessibilityRole="button" onPress={() => router.push('/progress/history')} style={({ pressed }) => [styles.historyButton, { backgroundColor: action, borderColor: action }, pressed && styles.pressed]}><ThemedText style={{ color: Palette.deepNavy }} type="smallBold">{text.viewHistory}</ThemedText><Ionicons color={Palette.deepNavy} name="arrow-forward" size={18} /></Pressable>
            </>
          )}
          <Pressable accessibilityLabel={text.viewRewards} accessibilityRole="button" onPress={() => router.push('/progress/rewards')} style={({ pressed }) => [styles.outlineButton, { borderColor: action }, pressed && styles.pressed]}><ThemedText style={{ color: action }} type="smallBold">{text.viewRewards}</ThemedText><Ionicons color={action} name="ribbon-outline" size={18} /></Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Metric({ action, border, icon, label, value }: { action: string; border: string; icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return <ThemedView accessibilityLabel={`${label}: ${value}`} style={[styles.metric, { borderColor: border }]}><Ionicons color={action} name={icon} size={21} /><ThemedText style={styles.metricLabel} themeColor="textSecondary" type="smallBold">{label}</ThemedText><ThemedText style={styles.metricValue} type="subtitle">{value}</ThemedText></ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' }, header: { gap: Spacing.xs }, title: { fontSize: 38, lineHeight: 44 }, eyebrow: { letterSpacing: 1.2 }, loading: { alignItems: 'center', minHeight: 180, justifyContent: 'center' }, filters: { flexDirection: 'row', gap: Spacing.sm }, filter: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: Spacing.xs }, metrics: { flexDirection: 'row', gap: Spacing.sm }, metric: { borderRadius: Radius.card, borderWidth: 1, flex: 1, gap: Spacing.xs, minHeight: 128, padding: Spacing.md }, metricLabel: { fontSize: 11, letterSpacing: 0.7 }, metricValue: { fontSize: 22, lineHeight: 28 }, emptyCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, largeIcon: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 }, cardTitle: { fontSize: 25, lineHeight: 32 }, outlineButton: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, justifyContent: 'center', minHeight: 48, paddingHorizontal: Spacing.md }, insightCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg }, insightCopy: { flex: 1, gap: Spacing.xs }, chartCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.md }, chart: { flexDirection: 'row', gap: Spacing.xs, justifyContent: 'space-between' }, chartDay: { alignItems: 'center', flex: 1, gap: 4 }, barTrack: { borderRadius: 5, height: 88, justifyContent: 'flex-end', overflow: 'hidden', width: '100%' }, bar: { borderRadius: 5, minHeight: 2, width: '100%' }, goalCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.md }, goalRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm }, goalCopy: { flex: 1, gap: 2 }, historyButton: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center', minHeight: 48, paddingHorizontal: Spacing.md }, pressed: { opacity: 0.78 },
});
