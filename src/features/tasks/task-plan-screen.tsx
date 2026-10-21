import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { getTaskPlanCopy } from '@/features/localization/task-plan-copy';
import { createStableId } from '@/features/identity/stable-ids';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing, Typography } from '@/theme/tokens';
import { completeTask, loadTasks, saveTasks } from './task-storage';
import { localPlanningDate, nextPlanningDate, summarizeTaskPlan, validTaskPlanning, type PlanPeriod } from './task-planning';
import type { Task } from './task-types';

export function TaskPlanScreen() {
  const router = useRouter();
  const theme = useTheme();
  const dark = useColorScheme() === 'dark';
  const { copy, locale } = useAppLocale();
  const text = getTaskPlanCopy(locale);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [period, setPeriod] = useState<PlanPeriod>('today');
  const [today, setToday] = useState(() => localPlanningDate());
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const retryLoad = useRef<() => void>(() => {});
  const [composer, setComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('25');
  const [plannedDate, setPlannedDate] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const writing = useRef(false);
  const mounted = useRef(false);
  const background = dark ? theme.background : Palette.homeLightBackground;
  const soft = dark ? theme.surfaceElevated : Palette.homeLightActionSoft;

  useFocusEffect(useCallback(() => {
    let current = true;
    mounted.current = true;
    setSaving(writing.current); setToday(localPlanningDate());
    setLoading(true); setFailed(false);
    const read = async () => {
      try {
        if (Platform.OS === 'web') throw new Error('NATIVE_TASK_STORAGE_REQUIRED');
        const result = await loadTasks();
        if (current) setTasks(result);
      } catch { if (current) setFailed(true); }
      finally { if (current) setLoading(false); }
    };
    retryLoad.current = () => { setLoading(true); setFailed(false); void read(); };
    void read();
    return () => { current = false; mounted.current = false; retryLoad.current = () => {}; };
  }, []));

  function openComposer() {
    if (writing.current || loading || failed) return;
    setPlannedDate(period === 'today' ? today : nextPlanningDate(today));
    setTitle(''); setMinutes('25'); setMessage(''); setComposer(true);
  }

  async function addTask() {
    if (writing.current || loading || failed) return;
    const estimate = minutes.trim() ? Number(minutes) : undefined;
    const plan = { plannedDate: plannedDate.trim(), estimatedMinutes: estimate };
    if (!title.trim() || title.trim().length > 120 || (minutes.trim() && !/^\d+$/.test(minutes.trim())) || !validTaskPlanning(plan)) { setMessage(text.invalid); return; }
    writing.current = true; setSaving(true); setMessage('');
    try {
      const now = new Date().toISOString();
      const task: Task = { id: createStableId(), title: title.trim(), status: 'pending', createdAt: now, updatedAt: now,
        plannedDate: plan.plannedDate, ...(estimate !== undefined ? { estimatedMinutes: estimate } : {}) };
      // Upsert only this new task, never rewrite a stale list snapshot.
      await saveTasks([task]);
      if (mounted.current) {
        setTasks(current => [task, ...current]); setComposer(false); setTitle('');
        setPeriod(plan.plannedDate > today ? 'upcoming' : 'today');
      }
    } catch { if (mounted.current) setMessage(copy.tasks.saveError); }
    finally { writing.current = false; if (mounted.current) setSaving(false); }
  }

  async function finishTask(task: Task) {
    if (writing.current || loading || failed) return;
    writing.current = true; setSaving(true); setMessage('');
    try {
      const result = await completeTask(task.id, task.updatedAt);
      if (!result) throw new Error('TASK_REVISION_CHANGED');
      if (mounted.current) setTasks(current => current.map(item => item.id === task.id ? result.task : item));
    } catch { if (mounted.current) setMessage(copy.tasks.saveError); }
    finally { writing.current = false; if (mounted.current) setSaving(false); }
  }

  const summary = summarizeTaskPlan(tasks, period, today);
  return <ThemedView style={[styles.screen, { backgroundColor: background }]}>
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><View style={styles.content}>
      <View style={styles.topBar}>
        <View style={styles.brand}><Image accessible={false} source={require('@/assets/branding/deep-focus-logo.png')} style={styles.logo} /><ThemedText type="smallBold" style={styles.brandName}>DEEP FOCUS</ThemedText></View>
        <Pressable accessibilityLabel={text.appearance} accessibilityRole="button" onPress={() => router.push('/profile/settings')} style={[styles.iconButton, { borderColor: theme.border, backgroundColor: theme.surface }]}><Ionicons accessible={false} name="settings-outline" color={theme.text} size={20} /></Pressable>
      </View>
      <View style={styles.heading}><ThemedText themeColor="textSecondary" type="small">{text.greeting}</ThemedText><View style={styles.headingRow}>
        <ThemedText accessibilityRole="header" type="title" style={styles.title}>{text.title}</ThemedText>
        <Pressable accessibilityLabel={text.add} accessibilityRole="button" accessibilityState={{ disabled: loading || failed || saving }} disabled={loading || failed || saving} onPress={openComposer} style={[styles.iconButton, { borderColor: theme.border, backgroundColor: theme.surface }]}><Ionicons accessible={false} name="add" color={theme.text} size={24} /></Pressable>
      </View></View>
      <View accessibilityLabel={text.period} accessibilityRole="tablist" style={[styles.segmented, { backgroundColor: soft }]}>
        {(['today', 'upcoming'] as const).map(value => <Pressable key={value} accessibilityRole="tab" accessibilityLabel={text[value]} accessibilityState={{ selected: period === value }} onPress={() => setPeriod(value)} style={[styles.segment, period === value && { backgroundColor: theme.surface }]}><ThemedText style={styles.segmentText} type="smallBold">{text[value]}</ThemedText></Pressable>)}
      </View>
      {loading ? <ThemedText accessibilityLiveRegion="polite">{copy.tasks.loading}</ThemedText> : failed ? <View style={styles.error}><ThemedText accessibilityRole="alert">{copy.tasks.loadError}</ThemedText><Button label={copy.tasks.retry} onPress={() => retryLoad.current()} /></View> : <>
        <View style={[styles.overview, { borderColor: theme.border }]}>
          <View style={styles.metric}><ThemedText style={styles.metricValue}>{summary.pendingCount}</ThemedText><ThemedText type="small" themeColor="textSecondary">{text.things}</ThemedText></View>
          <View style={styles.metric}><ThemedText style={styles.metricValue}>{summary.unestimatedCount === summary.pendingCount && summary.pendingCount > 0 ? '—' : summary.estimatedMinutes} <ThemedText type="small">{text.minute}</ThemedText></ThemedText><ThemedText type="small" themeColor="textSecondary">{text.timeHint}</ThemedText>{summary.unestimatedCount > 0 ? <ThemedText type="small" themeColor="textSecondary">{summary.unestimatedCount} {text.unestimated}</ThemedText> : null}</View>
        </View>
        <View style={styles.sectionRow}><ThemedText accessibilityRole="header" type="smallBold" themeColor="textSecondary">{period === 'today' ? text.priorities : text.lookingAhead}</ThemedText><View style={[styles.badge, { backgroundColor: soft }]}><ThemedText type="small">{summary.completedCount} {text.done}</ThemedText></View></View>
        {summary.tasks.length ? summary.tasks.map(task => <View key={task.id} style={[styles.taskRow, { borderColor: theme.border }]}>
          <Pressable accessibilityRole="checkbox" accessibilityLabel={`${copy.tasks.complete} ${task.title}`} accessibilityState={{ checked: task.status === 'completed', disabled: saving || task.status === 'completed' }} disabled={saving || task.status === 'completed'} onPress={() => void finishTask(task)} style={styles.checkTarget}><View style={[styles.checkShape, { borderColor: theme.textMuted, backgroundColor: task.status === 'completed' ? soft : 'transparent' }]}>{task.status === 'completed' ? <Ionicons accessible={false} name="checkmark" color={theme.text} size={16} /> : null}</View></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`${task.title}. ${task.status === 'completed' ? copy.tasks.completedState : copy.tasks.ready}`} onPress={() => router.push(task.status === 'completed' ? { pathname: '/tasks/[taskId]', params: { taskId: task.id } } : { pathname: '/focus/setup', params: { taskId: task.id } })} style={styles.openTask}>
            <View style={styles.taskCopy}><ThemedText style={task.status === 'completed' ? styles.completed : undefined}>{task.title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{task.estimatedMinutes === undefined ? text.noEstimate : `${task.estimatedMinutes} ${text.minute}`}{period === 'upcoming' ? ` · ${task.plannedDate}` : ''}{task.status === 'completed' ? ` · ${copy.tasks.completedState}` : ''}</ThemedText></View><Ionicons accessible={false} name="chevron-forward" color={theme.textSecondary} size={18} />
          </Pressable>
        </View>) : <ThemedText style={styles.empty} themeColor="textSecondary">{text.empty}</ThemedText>}
        {message && !composer ? <ThemedText accessibilityRole="alert">{message}</ThemedText> : null}
        {saving && !composer ? <ThemedText accessibilityLiveRegion="polite">{copy.tasks.saving}</ThemedText> : null}
        <Button disabled={saving} label={text.add} onPress={openComposer} variant="secondary" style={styles.addButton} icon={<Ionicons accessible={false} name="add" color={theme.primary} size={22} />} />
      </>}
      <View style={[styles.encouragement, { backgroundColor: soft }]}><Ionicons accessible={false} name="leaf-outline" color={theme.textSecondary} size={22} /><ThemedText style={styles.encouragementText} type="small">{text.encouragement}</ThemedText></View>
      <View style={styles.links}><Button label={copy.plan.tasks} variant="ghost" onPress={() => router.push('/tasks')} /><Button label={copy.plan.goals} variant="ghost" onPress={() => router.push('/goals')} /></View>
      <ThemedText type="small" themeColor="textMuted">{text.localOnly}</ThemedText>
    </View></ScrollView>
    <Modal animationType="none" visible={composer} transparent onRequestClose={() => { if (!writing.current) setComposer(false); }}>
      <View style={styles.modalBackdrop}><ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled"><ThemedView accessibilityViewIsModal style={[styles.composer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <ThemedText accessibilityRole="header" type="subtitle">{text.addTitle}</ThemedText><ThemedText themeColor="textSecondary">{text.addHint}</ThemedText>
        <ThemedText type="smallBold">{text.titleField}</ThemedText><TextInput autoFocus accessibilityLabel={text.titleField} maxLength={120} editable={!saving} value={title} onChangeText={setTitle} style={[styles.input, { color: theme.text, borderColor: theme.border }]} />
        <ThemedText type="smallBold">{text.minutesField}</ThemedText><TextInput accessibilityLabel={text.minutesField} keyboardType="number-pad" editable={!saving} value={minutes} onChangeText={setMinutes} style={[styles.input, { color: theme.text, borderColor: theme.border }]} />
        <ThemedText type="smallBold">{text.dateField}</ThemedText><TextInput accessibilityLabel={text.dateField} autoCapitalize="none" maxLength={10} editable={!saving} value={plannedDate} onChangeText={setPlannedDate} style={[styles.input, { color: theme.text, borderColor: theme.border }]} />
        <ThemedText type="small" themeColor="textSecondary">{text.dateHint}</ThemedText>{message ? <ThemedText accessibilityRole="alert">{message}</ThemedText> : null}
        <Button fullWidth label={text.save} loading={saving} loadingAccessibilityLabel={text.saving} onPress={() => void addTask()} /><Button fullWidth label={text.cancel} disabled={saving} onPress={() => { setComposer(false); setMessage(''); }} variant="ghost" />
      </ThemedView></ScrollView></View>
    </Modal>
  </ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', maxWidth: 560, width: '100%', gap: Spacing.lg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm }, brand: { flexDirection: 'row', flex: 1, alignItems: 'center', gap: Spacing.sm }, logo: { width: 36, height: 36 }, brandName: { letterSpacing: 1.5 },
  iconButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, heading: { gap: Spacing.sm }, headingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, title: { flex: 1, fontSize: Typography.heading1.fontSize, lineHeight: 40, fontWeight: '700' },
  segmented: { borderRadius: Radius.card, flexDirection: 'row', padding: Spacing.xs, gap: Spacing.xs }, segment: { minHeight: 44, flex: 1, borderRadius: Radius.card, padding: Spacing.sm, alignItems: 'center', justifyContent: 'center' }, segmentText: { textAlign: 'center' },
  overview: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg, paddingBottom: Spacing.lg, borderBottomWidth: 1 }, metric: { flex: 1, minWidth: 100, gap: Spacing.xs }, metricValue: { fontSize: Typography.heading3.fontSize, fontWeight: '700', lineHeight: 34 }, sectionRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm }, badge: { borderRadius: Spacing.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  taskRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, marginTop: -Spacing.md }, checkTarget: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, checkShape: { width: 22, height: 22, borderRadius: 7, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, openTask: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, minHeight: 76 }, taskCopy: { flex: 1, gap: Spacing.xs }, completed: { textDecorationLine: 'line-through', opacity: 0.65 },
  addButton: { borderStyle: 'dashed' }, encouragement: { borderRadius: Radius.card, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md }, encouragementText: { flex: 1 }, links: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }, empty: { paddingVertical: Spacing.md }, error: { gap: Spacing.md },
  modalBackdrop: { flex: 1, backgroundColor: '#00000080' }, modalScroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg }, composer: { alignSelf: 'center', maxWidth: 560, width: '100%', borderWidth: 1, borderRadius: Radius.card, padding: Spacing.lg, gap: Spacing.md }, input: { minHeight: 48, borderWidth: 1, borderRadius: Radius.card, paddingHorizontal: Spacing.md, fontSize: Typography.body.fontSize },
});
