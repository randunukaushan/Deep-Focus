import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { loadTasks } from '@/features/tasks/task-storage';
import type { Task } from '@/features/tasks/task-types';
import { cancelActivePlan, loadActivePlan, saveConfirmedPlan } from '@/features/planning/plan-storage';
import type { SavedPlan } from '@/features/planning/plan-types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { getConfiguredPlanningModel } from '@/features/planning/planning-config';

export default function PlanMyDayRoute() {
  const router = useRouter();
  const { copy } = useAppLocale();
  const planningModel = getConfiguredPlanningModel();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? theme.background : Palette.homeLightActionSoft;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [availableMinutes, setAvailableMinutes] = useState('120');
  const [hasPlan, setHasPlan] = useState(false);
  const [confirmedPlanKey, setConfirmedPlanKey] = useState<string | null>(null);
  const [savedPlan, setSavedPlan] = useState<SavedPlan | null>(null);
  const [planSaveError, setPlanSaveError] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [taskLoadState, setTaskLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const taskLoadRevision = useRef(0);

  const refreshTasks = useCallback(async () => {
    const revision = ++taskLoadRevision.current;
    setTaskLoadState('loading');
    try {
      const [stored, activePlan] = await Promise.all([loadTasks(), loadActivePlan()]);
      if (revision !== taskLoadRevision.current) return;
      const available = stored.filter((task) => !task.archivedAt && task.status !== 'completed' && task.status !== 'cancelled');
      setTasks(available);
      const availableIds = new Set(available.map((task) => task.id));
      const restoredIds = activePlan?.items.slice().sort((a, b) => a.position - b.position).map((item) => item.taskId).filter((id) => availableIds.has(id)) ?? [];
      setSelectedIds(restoredIds.length ? restoredIds : available.slice(0, 3).map((task) => task.id));
      setSavedPlan(activePlan && restoredIds.length === activePlan.items.length ? activePlan : null);
      setHasPlan(Boolean(activePlan && restoredIds.length === activePlan.items.length));
      setConfirmedPlanKey(activePlan && restoredIds.length === activePlan.items.length ? restoredIds.join('|') : null);
      setPlanSaveError(false);
      setTaskLoadState('ready');
    } catch {
      if (revision === taskLoadRevision.current) setTaskLoadState('error');
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void refreshTasks();
    return () => { taskLoadRevision.current += 1; };
  }, [refreshTasks]));
  const selectedTasks = useMemo(() => {
    const tasksById = new Map(tasks.map((task) => [task.id, task]));
    return selectedIds.map((id) => tasksById.get(id)).filter((task): task is Task => task !== undefined);
  }, [selectedIds, tasks]);
  const availableMinutesValue = Number(availableMinutes);
  const availableMinutesValid = Number.isSafeInteger(availableMinutesValue) && availableMinutesValue >= 25;
  const availabilityError = !availableMinutesValid
    ? Number.isSafeInteger(availableMinutesValue) ? copy.planner.minError : copy.planner.numberError
    : null;
  const blockCount = Math.max(1, Math.min(selectedTasks.length || 1, Math.floor((availableMinutesValue || 0) / 30) || 1));
  const planTasks = selectedTasks.slice(0, blockCount);

  const proposalKey = planTasks.map((task) => task.id).join('|');

  function toggleTask(id: string) { setHasPlan(false); setConfirmedPlanKey(null); setSavedPlan(null); setPlanSaveError(false); setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }

  function moveSelectedTask(id: string, offset: -1 | 1) {
    setConfirmedPlanKey(null); setSavedPlan(null); setPlanSaveError(false);
    setSelectedIds((current) => {
      const visibleIds = planTasks.map((task) => task.id);
      const index = visibleIds.indexOf(id);
      const destination = index + offset;
      if (index < 0 || destination < 0 || destination >= visibleIds.length) return current;
      [visibleIds[index], visibleIds[destination]] = [visibleIds[destination], visibleIds[index]];
      const hiddenSelectedIds = current.filter((taskId) => !visibleIds.includes(taskId));
      return [...visibleIds, ...hiddenSelectedIds];
    });
  }

  return <ThemedView style={[styles.screen, { backgroundColor: background }]}><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><View style={styles.content}>
    <Pressable accessibilityLabel={copy.planner.back} accessibilityRole="button" onPress={() => router.replace('/(tabs)/home')} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Ionicons color={action} name="arrow-back" size={20} /><ThemedText style={{ color: action }} type="smallBold">{copy.planner.back}</ThemedText></Pressable>
    <View style={styles.header}><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{copy.planner.eyebrow}</ThemedText><ThemedText accessibilityRole="header" type="title" style={styles.title}>{copy.planner.title}</ThemedText><ThemedText themeColor="textSecondary">{copy.planner.subtitle}</ThemedText></View>
    <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}><ThemedText type="smallBold">{copy.planner.timeAvailable}</ThemedText><View style={styles.timeInput}><TextInput accessibilityLabel={copy.planner.availableMinutes} keyboardType="number-pad" onChangeText={(value) => { setHasPlan(false); setAvailableMinutes(value.replace(/[^0-9]/g, '')); }} style={[styles.input, { color: theme.text }]} value={availableMinutes} /><ThemedText themeColor="textSecondary">{copy.planner.minutes}</ThemedText></View>{availabilityError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary">{availabilityError}</ThemedText> : <ThemedText themeColor="textSecondary" type="small">{copy.planner.breakHint}</ThemedText>}</ThemedView>
    <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">{copy.planner.chooseTasks}</ThemedText>{taskLoadState === 'loading' ? <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">{copy.planner.loading}</ThemedText> : taskLoadState === 'error' ? <ThemedView style={[styles.empty, { backgroundColor: surface, borderColor: border }]}><ThemedText accessibilityRole="alert" themeColor="textSecondary">{copy.planner.loadError}</ThemedText><Button accentColor={action} label={copy.planner.retry} onPress={() => void refreshTasks()} variant="secondary" /></ThemedView> : tasks.length === 0 ? <ThemedView style={[styles.empty, { backgroundColor: surface, borderColor: border }]}><ThemedText themeColor="textSecondary">{copy.planner.empty}</ThemedText><Button accentColor={action} label={copy.planner.addTask} onPress={() => router.push('/tasks')} variant="secondary" /></ThemedView> : tasks.map((task) => { const selected = selectedIds.includes(task.id); return <Pressable accessibilityLabel={`${task.title}, ${selected ? copy.planner.selected : copy.planner.notSelected}`} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} key={task.id} onPress={() => toggleTask(task.id)} style={({ pressed }) => [styles.task, { backgroundColor: selected ? softAction : surface, borderColor: selected ? action : border }, pressed && styles.pressed]}><View style={[styles.check, { backgroundColor: selected ? action : 'transparent', borderColor: selected ? action : border }]}>{selected ? <Ionicons color={Palette.deepNavy} name="checkmark" size={18} /> : null}</View><View style={styles.taskCopy}><ThemedText type="smallBold">{task.title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{selected ? copy.planner.included : copy.planner.notSelected}</ThemedText></View></Pressable>; })}</View>
    {!hasPlan ? <Button accentColor={action} fullWidth disabled={taskLoadState !== 'ready' || tasks.length === 0 || selectedTasks.length === 0 || !availableMinutesValid} label={copy.planner.suggest} onPress={() => { setConfirmedPlanKey(null); setSavedPlan(null); setPlanSaveError(false); setHasPlan(true); }} style={{ backgroundColor: action, borderColor: action }} /> : <ThemedView accessibilityLabel={`${planTasks.length} ${copy.planner.suggestion}`} style={[styles.proposal, { backgroundColor: surface, borderColor: border }]}><View style={styles.proposalHeader}><View><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{copy.planner.suggestion}</ThemedText><ThemedText type="subtitle" style={styles.proposalTitle}>{copy.planner.startingPoint}</ThemedText></View><Ionicons color={action} name="sparkles-outline" size={28} /></View>{planTasks.map((task, index) => <View style={styles.planRow} key={task.id}><View style={[styles.step, { backgroundColor: action }]}><ThemedText style={{ color: Palette.deepNavy }} type="smallBold">{index + 1}</ThemedText></View><View style={styles.taskCopy}><ThemedText type="smallBold">{task.title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{copy.planner.blockDuration}</ThemedText></View><View style={styles.reorderActions}><Pressable accessibilityLabel={`${copy.planner.moveEarlier} ${task.title} ${copy.planner.moveEarlierSuffix}`} accessibilityRole="button" accessibilityState={{ disabled: index === 0 }} disabled={index === 0 || savingPlan} onPress={() => moveSelectedTask(task.id, -1)} style={({ pressed }) => [styles.reorderButton, { borderColor: border }, pressed && styles.pressed]}><Ionicons color={index === 0 ? theme.textMuted : action} name="chevron-up" size={20} /></Pressable><Pressable accessibilityLabel={`${copy.planner.moveLater} ${task.title} ${copy.planner.moveLaterSuffix}`} accessibilityRole="button" accessibilityState={{ disabled: index === planTasks.length - 1 }} disabled={index === planTasks.length - 1 || savingPlan} onPress={() => moveSelectedTask(task.id, 1)} style={({ pressed }) => [styles.reorderButton, { borderColor: border }, pressed && styles.pressed]}><Ionicons color={index === planTasks.length - 1 ? theme.textMuted : action} name="chevron-down" size={20} /></Pressable></View><Button accentColor={action} disabled={confirmedPlanKey !== proposalKey || savingPlan} label={copy.planner.start} onPress={() => router.push({ pathname: '/focus/setup', params: { taskId: task.id } })} variant="secondary" /></View>)}<ThemedText themeColor="textSecondary" type="small">{savedPlan ? copy.planner.saved : copy.planner.proposalNote}</ThemedText>{planSaveError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary">{copy.planner.saveError}</ThemedText> : null}{confirmedPlanKey === proposalKey ? <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">{copy.planner.confirmed}</ThemedText> : <Button accentColor={action} fullWidth disabled={savingPlan} label={copy.planner.confirm} onPress={() => { const timestamp = new Date().toISOString(); setSavingPlan(true); setPlanSaveError(false); void saveConfirmedPlan({ id: `local-plan:${timestamp}`, provider: 'mock', model: planningModel, createdAt: timestamp, confirmedAt: timestamp, status: 'active', items: planTasks.map((task, index) => ({ taskId: task.id, position: index, focusDurationSeconds: 25 * 60, breakDurationSeconds: 5 * 60 })) }).then(() => { setConfirmedPlanKey(proposalKey); setSavedPlan({ id: `local-plan:${timestamp}`, provider: 'mock', model: planningModel, createdAt: timestamp, confirmedAt: timestamp, status: 'active', items: planTasks.map((task, index) => ({ taskId: task.id, position: index, focusDurationSeconds: 25 * 60, breakDurationSeconds: 5 * 60 })) }); }).catch(() => setPlanSaveError(true)).finally(() => setSavingPlan(false)); }} /> }<Button accentColor={action} fullWidth disabled={savingPlan} label={copy.planner.adjust} onPress={() => { setConfirmedPlanKey(null); setSavedPlan(null); setPlanSaveError(false); setHasPlan(false); void cancelActivePlan(); }} variant="ghost" /></ThemedView>}
  </View></ScrollView></ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' }, back: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: Spacing.xs, minHeight: 44, paddingRight: Spacing.md }, header: { gap: Spacing.xs }, title: { fontSize: 38, lineHeight: 44 }, eyebrow: { letterSpacing: 1.2 }, card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.sm, padding: Spacing.lg }, timeInput: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm }, input: { borderBottomColor: Palette.homeLightAction, borderBottomWidth: 2, fontSize: 28, fontWeight: '700', minWidth: 74, paddingVertical: Spacing.xs, textAlign: 'center' }, section: { gap: Spacing.sm }, sectionLabel: { letterSpacing: 1.1 }, task: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 72, padding: Spacing.md }, check: { alignItems: 'center', borderRadius: 18, borderWidth: 1, height: 36, justifyContent: 'center', width: 36 }, taskCopy: { flex: 1, gap: 2 }, empty: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, proposal: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, proposalHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, proposalTitle: { fontSize: 26, lineHeight: 34 }, planRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm }, reorderActions: { flexDirection: 'row', gap: Spacing.xs }, reorderButton: { alignItems: 'center', borderRadius: 12, borderWidth: 1, height: 48, justifyContent: 'center', width: 48 }, step: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 }, pressed: { opacity: 0.78 } });
