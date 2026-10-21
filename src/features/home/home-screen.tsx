import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { DeepFocusScene } from '@/components/deep-focus-scene';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Palette, Radius, Spacing, Typography } from '@/theme/tokens';
import { loadActiveSession, loadSessionHistory } from '@/features/focus/session-storage';
import { loadTasks } from '@/features/tasks/task-storage';
import { localPlanningDate, summarizeTaskPlan } from '@/features/tasks/task-planning';
import type { Task } from '@/features/tasks/task-types';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { getPreviewHomeCopy } from '@/features/localization/preview-home-copy';
import { getProgressCopy } from '@/features/localization/progress-copy';
import { usePresentation } from '@/features/settings/presentation-context';
import { defaultPresentationPreferences, motivationPhrase } from '@/features/settings/presentation-preferences';

function formatFocusTime(totalSeconds: number, units: { hour: string; minute: string }) {
  const minutes = Math.floor(totalSeconds / 60);
  return minutes < 60 ? `${minutes} ${units.minute}` : `${Math.floor(minutes / 60)} ${units.hour} ${minutes % 60} ${units.minute}`;
}

export function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const dark = useColorScheme() === 'dark';
  const { copy, locale } = useAppLocale();
  const text = getPreviewHomeCopy(locale);
  const presentation = usePresentation();
  const encouragement = motivationPhrase(presentation?.preferences ?? defaultPresentationPreferences, text.encouragement);
  const progressText = getProgressCopy(locale);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskLoading, setTaskLoading] = useState(true);
  const [taskError, setTaskError] = useState(false);
  const retryTasks = useRef<() => void>(() => {});
  const [todayProgress, setTodayProgress] = useState({ focusedSeconds: 0, sessionsCompleted: 0 });
  const [progressError, setProgressError] = useState(false);
  const [progressLoading, setProgressLoading] = useState(true);
  const [recoverableSession, setRecoverableSession] = useState<Awaited<ReturnType<typeof loadActiveSession>>>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const planRoute = '/(tabs)/plan' as const;

  useFocusEffect(useCallback(() => {
    let active = true;
    setSessionLoading(true);
    setProgressLoading(true);
    void loadActiveSession(true).then((session) => {
      if (active) setRecoverableSession(session?.status === 'active' || session?.status === 'paused' ? session : null);
    }).catch(() => { if (active) router.replace('/focus/recovery'); })
      .finally(() => { if (active) setSessionLoading(false); });
    const readTasks = async () => {
      setTaskLoading(true); setTaskError(false);
      try { const stored = await loadTasks(); if (active) setTasks(stored); }
      catch { if (active) setTaskError(true); }
      finally { if (active) setTaskLoading(false); }
    };
    retryTasks.current = () => { void readTasks(); };
    void readTasks();
    void loadSessionHistory().then((sessions) => {
      if (!active) return;
      const today = new Date().toDateString();
      const completedToday = sessions.filter(session => session.status === 'completed' && session.completedAt && new Date(session.completedAt).toDateString() === today);
      setTodayProgress({ focusedSeconds: completedToday.reduce((sum, session) => sum + session.focusedDurationSeconds, 0), sessionsCompleted: completedToday.length });
      setProgressError(false);
    }).catch(() => { if (active) setProgressError(true); }).finally(() => { if (active) setProgressLoading(false); });
    return () => { active = false; retryTasks.current = () => {}; };
  }, [router]));

  const visible = summarizeTaskPlan(tasks, 'today', localPlanningDate()).tasks;
  const priority = visible.find(task => task.status !== 'completed');
  const others = visible.filter(task => task.id !== priority?.id).slice(0, 2);
  const units = { hour: copy.home.hoursUnit, minute: copy.home.minutesUnit };
  const quickActions: { label: string; detail: string; icon: keyof typeof Ionicons.glyphMap; route: Href }[] = [
    { label: copy.home.tasks, detail: copy.home.tasksDetail, icon: 'checkbox-outline', route: '/tasks' },
    { label: copy.home.goals, detail: copy.home.goalsDetail, icon: 'flag-outline', route: '/goals' },
    { label: copy.home.plan, detail: copy.home.planDetail, icon: 'sparkles-outline', route: '/plan-my-day' },
  ];

  function returnToSession() {
    if (!recoverableSession) return;
    router.push({ pathname: '/focus/session', params: {
      durationMinutes: String(recoverableSession.plannedDurationSeconds / 60),
      taskName: recoverableSession.taskName || '',
      ...(recoverableSession.status === 'paused' ? { resume: '1' } : {}),
    } });
  }

  return <ThemedView style={styles.screen}>
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><View style={styles.content}>
      <View style={styles.topBar}>
        <View style={styles.brand}><Image accessible={false} source={require('@/assets/branding/deep-focus-logo.png')} style={styles.logo} /><ThemedText type="smallBold" style={styles.wordmark}>DEEP FOCUS</ThemedText></View>
        <Pressable accessibilityLabel={copy.home.settings} accessibilityRole="button" onPress={() => router.push('/profile/settings')} style={[styles.iconButton, { borderColor: theme.border, backgroundColor: theme.surface }]}><Ionicons accessible={false} name="settings-outline" size={20} color={theme.text} /></Pressable>
      </View>
      <View style={styles.heading}><ThemedText type="small" themeColor="textSecondary">{text.greeting}</ThemedText><ThemedText accessibilityRole="header" type="title" style={styles.title}>{text.title}</ThemedText></View>
      <View style={styles.hero}>
        <DeepFocusScene dark={dark} />
        <View style={styles.heroCopy}><ThemedText style={{ color: theme.textSecondary }} type="smallBold">{text.chapter}</ThemedText><ThemedText style={[styles.heroTitle, { color: theme.text }]} type="subtitle">{text.hero}</ThemedText></View>
        <View style={styles.heroNote}><ThemedText type="small" style={styles.noteText}>{text.note}</ThemedText></View>
      </View>
      <View style={styles.sectionRow}><ThemedText accessibilityRole="header" type="smallBold">{recoverableSession ? copy.home.focusSession : text.next}</ThemedText><Button label={text.viewPlan} variant="ghost" onPress={() => router.push(planRoute)} /></View>
      <ThemedView style={[styles.priority, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {recoverableSession ? <>
          <ThemedText type="smallBold" themeColor="textSecondary">{recoverableSession.status === 'paused' ? copy.home.pausedKicker : copy.home.focusSession}</ThemedText>
          <ThemedText type="subtitle" style={styles.priorityTitle}>{recoverableSession.taskName || copy.home.focusSession}</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">{formatFocusTime(Math.max(0, recoverableSession.plannedDurationSeconds - recoverableSession.focusedDurationSeconds), units)} {copy.home.remaining}</ThemedText>
          <Button fullWidth label={text.returnToFocus} onPress={returnToSession} />
        </> : taskLoading || sessionLoading ? <ThemedText accessibilityLiveRegion="polite">{copy.tasks.loading}</ThemedText> : taskError ? <>
          <ThemedText accessibilityRole="alert">{copy.tasks.loadError}</ThemedText><Button label={copy.tasks.retry} onPress={() => retryTasks.current()} />
        </> : <>
          <View style={[styles.badge, { backgroundColor: dark ? theme.surfaceElevated : Palette.homeLightActionSoft }]}><ThemedText type="small" style={{ color: theme.textSecondary }}>{text.oneThing}</ThemedText></View>
          <ThemedText type="subtitle" style={styles.priorityTitle}>{priority?.title ?? text.breathingRoom}</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">{priority?.estimatedMinutes ? `${priority.estimatedMinutes} ${copy.focus.minutes}` : priority ? copy.tasks.ready : text.clear}</ThemedText>
          <Button accessibilityLabel={priority ? copy.home.startFocusAccessibility : text.planNew} fullWidth label={priority ? text.start : text.planNew} onPress={() => priority ? router.push({ pathname: '/focus/setup', params: { taskId: priority.id } }) : router.push(planRoute)} />
        </>}
      </ThemedView>
      <View style={styles.sectionRow}><ThemedText accessibilityRole="header" type="smallBold">{text.also}</ThemedText><Button label={text.add} variant="ghost" onPress={() => router.push(planRoute)} /></View>
      {!taskLoading && !taskError ? others.length ? others.map(task => <Pressable key={task.id} accessibilityRole="button" accessibilityLabel={`${task.title}. ${task.status === 'completed' ? copy.tasks.completedState : copy.tasks.ready}`} onPress={() => router.push(task.status === 'completed' ? { pathname: '/tasks/[taskId]', params: { taskId: task.id } } : { pathname: '/focus/setup', params: { taskId: task.id } })} style={[styles.taskRow, { borderColor: theme.border }]}>
        <Ionicons accessible={false} name={task.status === 'completed' ? 'checkmark-circle-outline' : 'ellipse-outline'} size={22} color={theme.textMuted} />
        <View style={styles.taskCopy}><ThemedText style={task.status === 'completed' ? styles.completed : undefined}>{task.title}</ThemedText><ThemedText type="small" themeColor="textSecondary">{task.estimatedMinutes ? `${task.estimatedMinutes} ${copy.focus.minutes}` : copy.tasks.ready}</ThemedText></View><Ionicons accessible={false} name="chevron-forward" size={18} color={theme.textSecondary} />
      </Pressable>) : <ThemedText themeColor="textSecondary" type="small">{text.nothingElse}</ThemedText> : null}
      {encouragement ? <Pressable accessibilityRole="button" accessibilityLabel={encouragement} onPress={() => router.push('/(tabs)/profile')} style={[styles.encouragement, { backgroundColor: dark ? theme.surfaceElevated : Palette.homeLightActionSoft }]}><Ionicons accessible={false} name="leaf-outline" size={22} color={theme.textSecondary} /><ThemedText type="small" style={styles.taskCopy}>{encouragement}</ThemedText></Pressable> : null}
      <View style={styles.secondary}>
        <ThemedText accessibilityRole="header" type="smallBold">{copy.home.quickActions}</ThemedText>
        {quickActions.map(action => <Pressable key={action.label} accessibilityLabel={action.label} accessibilityHint={action.detail} accessibilityRole="button" onPress={() => router.push(action.route)} style={[styles.quickAction, { borderColor: theme.border }]}><Ionicons accessible={false} name={action.icon} size={22} color={theme.primary} /><View style={styles.taskCopy}><ThemedText type="smallBold">{action.label}</ThemedText><ThemedText type="small" themeColor="textSecondary">{action.detail}</ThemedText></View><Ionicons accessible={false} name="chevron-forward" size={18} color={theme.textSecondary} /></Pressable>)}
        <Button accessibilityLabel={copy.home.startFocusAccessibility} label={copy.home.startFocus} variant="secondary" disabled={sessionLoading} onPress={() => recoverableSession ? returnToSession() : router.push('/focus/setup')} />
        {progressLoading ? <ThemedText accessibilityLiveRegion="polite">{progressText.loading}</ThemedText> : progressError ? <ThemedText accessibilityRole="alert">{progressText.loadErrorDetail}</ThemedText> : <Pressable accessibilityLabel={copy.home.focusSoFar} accessibilityRole="button" onPress={() => router.push('/(tabs)/progress')} style={styles.progress}><ThemedText type="small" themeColor="textSecondary">{copy.home.focusSoFar}</ThemedText><ThemedText type="smallBold">{formatFocusTime(todayProgress.focusedSeconds, units)} · {todayProgress.sessionsCompleted} {copy.home.blocks}</ThemedText></Pressable>}
      </View>
    </View></ScrollView>
  </ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: Spacing.md },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  brand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, logo: { width: 36, height: 36 }, wordmark: { letterSpacing: 1.5 },
  iconButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { gap: Spacing.xs }, title: { fontSize: Typography.heading1.fontSize, lineHeight: 40, fontWeight: '700' },
  hero: { borderRadius: Radius.card, overflow: 'hidden', minHeight: 230, marginTop: Spacing.sm },
  heroCopy: { padding: Spacing.lg, paddingBottom: 100, width: '80%', gap: Spacing.sm }, heroTitle: { fontSize: Typography.heading3.fontSize, lineHeight: 32 },
  heroNote: { alignSelf: 'flex-start', position: 'absolute', left: Spacing.md, bottom: Spacing.md, borderRadius: Radius.card, backgroundColor: '#163D62', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs }, noteText: { color: '#FFFFFF' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.sm },
  priority: { borderRadius: Radius.card, borderWidth: 1, padding: Spacing.md, gap: Spacing.md }, priorityTitle: { fontSize: Typography.heading4.fontSize, lineHeight: 28 },
  badge: { alignSelf: 'flex-start', borderRadius: Spacing.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  taskRow: { flexDirection: 'row', gap: Spacing.md, minHeight: 76, alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1 },
  taskCopy: { flex: 1, gap: Spacing.xs }, completed: { textDecorationLine: 'line-through', opacity: 0.65 },
  encouragement: { borderRadius: Radius.card, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  secondary: { gap: Spacing.md, marginTop: Spacing.lg }, quickAction: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: 76, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  progress: { minHeight: 64, justifyContent: 'center', gap: Spacing.xs },
});
