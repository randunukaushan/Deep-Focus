import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { getSessionCopy } from '@/features/localization/session-copy';
import { getAchievementCopy } from '@/features/localization/rewards-copy';
import { claimTerminalAchievementPresentation, clearPendingSummaryHandoff, loadFinalizedSession, loadSessionHistory, loadTerminalProgression } from '@/features/focus/session-storage';
import { loadPersistedFinalizedSession } from '@/features/focus/session-summary-data';
import type { FocusSession } from '@/features/focus/session-types';
import { completeTask, loadTasks } from '@/features/tasks/task-storage';
import type { Task } from '@/features/tasks/task-types';
import { calculateStreak, type StreakSummary } from '@/features/progress/streak';
import type { AchievementId } from '@/features/progress/progression-rules';
import type { TerminalProgressionResult } from '@/features/storage/local-database';

function formatMinutes(seconds: number, minuteLabel: string) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} ${minuteLabel}`;
}

export default function SessionSummaryRoute() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const homeSurface = isDark ? theme.surface : Palette.homeLightSurface;
  const homeBorder = isDark ? theme.border : Palette.homeLightBorder;
  const homeAction = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const { locale, copy } = useAppLocale();
  const text = copy.focus;
  const sessionText = getSessionCopy(locale);
  const [session, setSession] = useState<FocusSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [linkedTask, setLinkedTask] = useState<Task | null>(null);
  const [taskCompleting, setTaskCompleting] = useState(false);
  const [taskCompleteError, setTaskCompleteError] = useState(false);
  const [streak, setStreak] = useState<StreakSummary | null>(null);
  const [progression, setProgression] = useState<TerminalProgressionResult | null>(null);
  const [newlyPresentedAchievements, setNewlyPresentedAchievements] = useState<AchievementId[]>([]);

  useEffect(() => {
    let mounted = true;
    void loadPersistedFinalizedSession(sessionId, loadFinalizedSession)
      .then(async (saved) => {
        if (!mounted) return;
        setSession(saved);
        setLoadError(false);
        if (saved) {
          await clearPendingSummaryHandoff(saved.id).catch(() => undefined);
        }
        if (saved?.status === 'completed') {
          try {
            const savedProgression = await loadTerminalProgression(saved.id);
            if (mounted) {
              setProgression(savedProgression);
              setNewlyPresentedAchievements([]);
            }
            if (savedProgression) {
              try {
                const claimedAchievements = await claimTerminalAchievementPresentation(saved.id);
                if (mounted) setNewlyPresentedAchievements(claimedAchievements);
              } catch {
                // A failed receipt remains unconsumed and is safe to retry later.
                if (mounted) setNewlyPresentedAchievements([]);
              }
            }
          } catch {
            if (mounted) {
              setProgression(null);
              setNewlyPresentedAchievements([]);
            }
          }
        } else if (mounted) {
          setProgression(null);
          setNewlyPresentedAchievements([]);
        }
        if (saved?.taskId) {
          try {
            const task = (await loadTasks()).find((item) => item.id === saved.taskId) ?? null;
            if (mounted) setLinkedTask(task);
          } catch {
            if (mounted) setLinkedTask(null);
          }
        } else {
          setLinkedTask(null);
        }
        try {
          const history = await loadSessionHistory();
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
          if (mounted) setStreak(calculateStreak(history, { now: Date.now(), timeZone }));
        } catch {
          if (mounted) setStreak(null);
        }
      })
      .catch(() => { if (mounted) setLoadError(true); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [attempt, sessionId]);

  const completed = session?.status === 'completed';
  const focused = session?.focusedDurationSeconds ?? 0;
  const planned = session?.plannedDurationSeconds ?? 0;

  async function markTaskComplete() {
    if (!linkedTask || linkedTask.status === 'completed' || taskCompleting) return;
    setTaskCompleting(true);
    setTaskCompleteError(false);
    try {
      const result = await completeTask(linkedTask.id, linkedTask.updatedAt);
      if (!result) throw new Error('TASK_COMPLETION_UNAVAILABLE');
      setLinkedTask(result.task);
    } catch {
      setTaskCompleteError(true);
    } finally {
      setTaskCompleting(false);
    }
  }

  function goHome() {
    router.dismissTo('/(tabs)/home');
  }

  if (loading || loadError || !session) {
    return (
      <ThemedView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}>
        <View style={styles.content}>
          <ThemedText accessibilityRole={loadError ? 'alert' : 'text'} type="subtitle">{loadError ? sessionText.summaryUnavailable : sessionText.loading}</ThemedText>
          {loadError ? <Button accentColor={homeAction} fullWidth label={sessionText.retryLoad} onPress={() => { setLoading(true); setLoadError(false); setAttempt((value) => value + 1); }} style={{ backgroundColor: homeAction, borderColor: homeAction }} /> : null}
          <Button accentColor={homeAction} fullWidth label={sessionText.returnHome} onPress={goHome} variant="secondary" />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}>
      <View style={styles.content}>
        <View style={styles.heading}>
          <View style={[styles.statusIcon, { backgroundColor: completed ? homeAction : Palette.error }]}>
            <Ionicons color={completed ? Palette.deepNavy : Palette.lightSurface} name={completed ? 'checkmark' : 'close'} size={26} />
          </View>
          <ThemedText themeColor="textSecondary" type="smallBold">{text.summaryEyebrow}</ThemedText>
          <ThemedText accessibilityRole="header" type="title">{completed ? text.sessionComplete : text.sessionEnded}</ThemedText>
          <ThemedText themeColor="textSecondary">{completed ? text.focusedWork : text.endedBeforePlan}</ThemedText>
        </View>
        <ThemedView accessibilityLabel={`${completed ? text.completed : text.cancelled}. ${text.focusTime}: ${formatMinutes(focused, text.minutes)}. ${text.planned}: ${formatMinutes(planned, text.minutes)}${session.taskName ? `. ${text.task} ${session.taskName}` : ''}.`} style={[styles.card, { backgroundColor: homeSurface, borderColor: homeBorder }]}>
          <ThemedText style={[styles.cardEyebrow, { color: homeAction }]} type="smallBold">{text.focusSummary}</ThemedText>
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <ThemedText themeColor="textSecondary" type="smallBold">{text.focusTime}</ThemedText>
              <ThemedText style={styles.metricValue}>{formatMinutes(focused, text.minutes)}</ThemedText>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: homeBorder }]} />
            <View style={styles.metric}>
              <ThemedText themeColor="textSecondary" type="smallBold">{text.planned}</ThemedText>
              <ThemedText style={styles.metricValue}>{formatMinutes(planned, text.minutes)}</ThemedText>
            </View>
          </View>
          <View style={[styles.statusRow, { borderTopColor: homeBorder }]}>
            <ThemedText themeColor="textSecondary" type="smallBold">{text.status}</ThemedText>
            <ThemedText style={[styles.statusValue, { color: completed ? homeAction : Palette.error }]} type="smallBold">{completed ? text.completed : text.cancelled}</ThemedText>
          </View>
          {session.taskName ? <ThemedText themeColor="textSecondary">{text.task} {session.taskName}</ThemedText> : null}
          {completed && progression?.xpEarned && progression.xpEarned > 0 ? <View accessibilityLabel={`${sessionText.xpEarned}: ${progression.xpEarned}`} style={[styles.statusRow, { borderTopColor: homeBorder }]}><ThemedText themeColor="textSecondary" type="smallBold">{sessionText.xpEarned}</ThemedText><ThemedText style={{ color: homeAction }} type="smallBold">+{progression.xpEarned}</ThemedText></View> : null}
          {completed && progression ? <ThemedText accessibilityLabel={`${sessionText.currentLevel}: ${progression.level}`} themeColor="textSecondary">{sessionText.currentLevel}: {progression.level}</ThemedText> : null}
          {completed && newlyPresentedAchievements.length > 0 ? <View accessibilityLiveRegion="polite" accessibilityLabel={`${sessionText.achievementsUnlocked}: ${newlyPresentedAchievements.map((id) => getAchievementCopy(locale, id).title).join(', ')}`} style={[styles.statusRow, { borderTopColor: homeBorder }]}><ThemedText themeColor="textSecondary" type="smallBold">{sessionText.achievementsUnlocked}</ThemedText><ThemedText style={[styles.statusValue, { color: homeAction }]} type="smallBold">{newlyPresentedAchievements.map((id) => getAchievementCopy(locale, id).title).join(', ')}</ThemedText></View> : null}
          {linkedTask && linkedTask.status !== 'completed' && completed ? <Button accentColor={homeAction} fullWidth label={sessionText.markTaskComplete} loading={taskCompleting} onPress={() => { void markTaskComplete(); }} style={{ backgroundColor: homeAction, borderColor: homeAction }} /> : null}
          {linkedTask?.status === 'completed' ? <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">{sessionText.taskCompleted}</ThemedText> : null}
          {taskCompleteError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary">{sessionText.taskCompleteError}</ThemedText> : null}
          {streak ? <ThemedText accessibilityLabel={`${sessionText.currentStreak}: ${streak.currentStreakDays}`} themeColor="textSecondary">{sessionText.currentStreak}: {streak.currentStreakDays}</ThemedText> : null}
        </ThemedView>
        <View style={styles.actions}>
          <Button accentColor={homeAction} fullWidth label={text.anotherSession} onPress={() => router.replace('/focus/setup')} style={{ backgroundColor: homeAction, borderColor: homeAction }} />
          <Button accentColor={homeAction} fullWidth label={text.backHome} onPress={goHome} variant="secondary" />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignSelf: 'center', flex: 1, gap: Spacing.lg, justifyContent: 'center', maxWidth: 560, padding: Spacing.lg, width: '100%' },
  heading: { gap: Spacing.xs },
  statusIcon: { alignItems: 'center', borderRadius: 28, height: 56, justifyContent: 'center', marginBottom: Spacing.sm, width: 56 },
  card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg },
  cardEyebrow: { letterSpacing: 1.2 },
  metricRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  metric: { flex: 1, gap: Spacing.xs, minWidth: 0 },
  metricValue: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  metricDivider: { height: 48, width: 1 },
  statusRow: { borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, justifyContent: 'space-between', paddingTop: Spacing.md },
  statusValue: { flexShrink: 1, textAlign: 'right' },
  actions: { gap: Spacing.sm },
});
