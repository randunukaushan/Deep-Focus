import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { loadGoals } from '@/features/goals/goal-storage';
import type { Goal } from '@/features/goals/goal-types';
import { linkResourceToTask, loadResources, loadTaskResourceLinks, unlinkResourceFromTask } from '@/features/resources/resource-storage';
import type { LocalResource, TaskResourceLink } from '@/features/resources/resource-types';
import { deleteTask, loadTasks, saveTasks, updateTaskArchive, updateTaskDetails } from '@/features/tasks/task-storage';
import { formatTaskDueDate, parseTaskDueDate } from '@/features/tasks/task-date';
import type { Task, TaskPriority } from '@/features/tasks/task-types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { getAppLocaleCopy } from '@/features/localization/app-locale';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function TaskDetailRoute() {
  const router = useRouter();
  const { copy } = useAppLocale();
  const resourceCopy = copy.resourcesPage;
  const taskCopy = copy.taskDetail ?? getAppLocaleCopy('en').taskDetail!;
  const priorities = [
    { label: taskCopy.noPriority, value: undefined },
    { label: taskCopy.low, value: 'low' as const },
    { label: taskCopy.medium, value: 'medium' as const },
    { label: taskCopy.high, value: 'high' as const },
  ];
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftDueDate, setDraftDueDate] = useState('');
  const [draftPriority, setDraftPriority] = useState<TaskPriority | undefined>(undefined);
  const [draftGoalId, setDraftGoalId] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goalsLoadError, setGoalsLoadError] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [resources, setResources] = useState<LocalResource[]>([]);
  const [resourceLinks, setResourceLinks] = useState<TaskResourceLink[]>([]);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [resourceBusy, setResourceBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const retryLoad = useRef<() => void>(() => {});
  const retryGoalsLoad = useRef<() => void>(() => {});
  const savingRef = useRef(false);
  const { taskId } = useLocalSearchParams<{ taskId?: string | string[] }>();
  const normalizedTaskId = Array.isArray(taskId) ? taskId[0] : taskId;

  useFocusEffect(useCallback(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      setSaveError(false);
      try {
        const tasks = await loadTasks();
        const found = tasks.find((item) => item.id === normalizedTaskId) ?? null;
        if (mounted) setTask(found);
        if (found && normalizedTaskId) {
          try {
            const [available, links] = await Promise.all([loadResources(), loadTaskResourceLinks(normalizedTaskId)]);
            if (mounted) { setResources(available); setResourceLinks(links); setResourceError(null); }
          } catch { if (mounted) setResourceError(resourceCopy.loadError); }
        }
      } catch {
        if (mounted) setLoadError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    retryLoad.current = () => { void load(); };
    void load();
    return () => { mounted = false; retryLoad.current = () => {}; };
  }, [normalizedTaskId, resourceCopy.loadError]));

  async function toggleResource(resource: LocalResource) {
    if (!task || resourceBusy) return;
    setResourceBusy(true); setResourceError(null);
    try {
      const linked = resourceLinks.some((link) => link.resourceId === resource.id);
      const changed = linked
        ? await unlinkResourceFromTask(task.id, resource.id)
        : await linkResourceToTask(task.id, resource.id, resource.revision);
      if (!changed) { setResourceError(resourceCopy.linkChangedError); return; }
      setResourceLinks(await loadTaskResourceLinks(task.id));
    } catch { setResourceError(resourceCopy.linkUnavailableError); }
    finally { setResourceBusy(false); }
  }

  async function complete() {
    if (!task || savingRef.current) return;
    const now = new Date().toISOString();
    const next = { ...task, status: 'completed' as const, completedAt: now, updatedAt: now };
    savingRef.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      const tasks = await loadTasks();
      if (!tasks.some((item) => item.id === next.id)) {
        setTask(null);
        return;
      }
      await saveTasks(tasks.map((item) => item.id === next.id ? next : item));
      setTask(next);
    } catch {
      setSaveError(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function beginEdit() {
    if (!task) return;
    setDraftTitle(task.title);
    setDraftDescription(task.description ?? '');
    setDraftDueDate(task.dueAt?.slice(0, 10) ?? '');
    setDraftPriority(task.priority);
    setDraftGoalId(task.goalId ?? null);
    setEditError(null);
    setEditing(true);
    const loadAvailableGoals = async () => {
      setGoalsLoading(true);
      setGoalsLoadError(false);
      try {
        setGoals(await loadGoals());
      } catch {
        setGoalsLoadError(true);
      } finally {
        setGoalsLoading(false);
      }
    };
    retryGoalsLoad.current = () => { void loadAvailableGoals(); };
    void loadAvailableGoals();
  }

  async function saveDetails() {
    const title = draftTitle.trim();
    if (!task || savingRef.current || !title || title.length > 120 || task.status === 'completed' || task.status === 'cancelled') return;
    const dueDate = parseTaskDueDate(draftDueDate, task.dueAt);
    if (!dueDate.valid) {
      setEditError('Enter a valid calendar date as YYYY-MM-DD, or leave it blank to remove the deadline.');
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setEditError(null);
    try {
      const updatedAt = await updateTaskDetails(task.id, task.updatedAt, title, draftDescription, draftPriority, draftGoalId, dueDate.dueAt);
      if (!updatedAt) {
        setEditError('This task changed elsewhere. Reload it before editing so newer details are not overwritten.');
        return;
      }
      const updatedTask = { ...task, title, description: draftDescription.trim() || undefined, priority: draftPriority, goalId: draftGoalId ?? undefined, updatedAt };
      if (dueDate.dueAt === null) delete updatedTask.dueAt;
      else if (typeof dueDate.dueAt === 'string') updatedTask.dueAt = dueDate.dueAt;
      setTask(updatedTask);
      setEditing(false);
    } catch {
      setEditError('This task could not be saved. Your saved task is unchanged; try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function reloadTask() {
    retryLoad.current();
    setEditing(false);
    setEditError(null);
    setConfirmDelete(false);
    setDeleteError(null);
  }

  async function confirmTaskDeletion() {
    if (!task || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setDeleteError(null);
    try {
      const deleted = await deleteTask(task.id, task.updatedAt);
      if (!deleted) {
        setDeleteError('This task changed elsewhere. Reload it before deleting so newer details are not removed.');
        return;
      }
      setConfirmDelete(false);
      router.replace('/tasks');
    } catch {
      setDeleteError('This task could not be deleted. Your task and focus history are unchanged; try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function toggleArchive() {
    if (!task || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setArchiveError(null);
    const archivedAt = task.archivedAt ? null : new Date().toISOString();
    try {
      const updatedAt = await updateTaskArchive(task.id, task.updatedAt, archivedAt);
      if (!updatedAt) {
        setArchiveError('This task changed elsewhere. Reload it before changing its archive state.');
        return;
      }
      const next = { ...task, updatedAt };
      if (archivedAt) next.archivedAt = archivedAt;
      else delete next.archivedAt;
      setTask(next);
    } catch {
      setArchiveError('This task could not be updated. Its saved archive state is unchanged; try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <ThemedView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Button accentColor={action} label={taskCopy.back} onPress={() => router.replace('/tasks')} variant="ghost" />
          {loading ? <View accessibilityLabel={taskCopy.eyebrow} accessibilityLiveRegion="polite" style={styles.loading}><ActivityIndicator color={action} /></View>
            : loadError ? <ThemedView accessibilityRole="alert" style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
              <ThemedText accessibilityRole="header" type="subtitle">{taskCopy.loadErrorTitle}</ThemedText>
              <ThemedText themeColor="textSecondary">{taskCopy.loadErrorDetail}</ThemedText>
              <Button label={taskCopy.retryLoad} onPress={() => retryLoad.current()} />
            </ThemedView>
              : !task ? <ThemedView accessibilityRole="alert" style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
                <ThemedText accessibilityRole="header" type="subtitle">{taskCopy.unavailableTitle}</ThemedText>
                <ThemedText themeColor="textSecondary">{taskCopy.unavailableDetail}</ThemedText>
              </ThemedView>
                : <ThemedView accessibilityLabel={`${taskCopy.eyebrow}: ${task.title}`} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
                  <View style={[styles.icon, { backgroundColor: task.status === 'completed' ? action : Palette.homeLightActionSoft }]}>
                    <Ionicons color={task.status === 'completed' ? Palette.deepNavy : action} name={task.status === 'completed' ? 'checkmark' : 'checkmark-circle-outline'} size={28} />
                  </View>
                  <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{taskCopy.eyebrow}</ThemedText>
                  {editing ? <>
                    <TextInput accessibilityLabel={taskCopy.editTitle} editable={!saving} maxLength={120} onChangeText={setDraftTitle} returnKeyType="next" value={draftTitle} style={[styles.titleInput, { color: theme.text, borderColor: border }]} />
                    <TextInput accessibilityLabel={taskCopy.descriptionPlaceholder} editable={!saving} multiline onChangeText={setDraftDescription} placeholder={taskCopy.descriptionPlaceholder} placeholderTextColor={theme.textMuted} value={draftDescription} style={[styles.descriptionInput, { color: theme.text, borderColor: border }]} />
                    <ThemedText themeColor="textSecondary" type="small">{taskCopy.dueDateLabel}</ThemedText>
                    <TextInput accessibilityLabel={taskCopy.dueDateLabel} editable={!saving} keyboardType="numbers-and-punctuation" maxLength={10} onChangeText={setDraftDueDate} placeholder="YYYY-MM-DD" placeholderTextColor={theme.textMuted} value={draftDueDate} style={[styles.input, { color: theme.text, borderColor: border }]} />
                    <ThemedText themeColor="textSecondary" type="small">{taskCopy.blankDateHint}</ThemedText>
                    <View accessibilityRole="radiogroup" style={styles.priorityGroup}>
                      <ThemedText type="smallBold">{taskCopy.priorityLabel}</ThemedText>
                      <View style={styles.priorityOptions}>{priorities.map(({ label, value }) => {
                        const selected = draftPriority === value;
                        return <Pressable accessibilityLabel={label} accessibilityRole="radio" accessibilityState={{ selected }} key={label} onPress={() => setDraftPriority(value)} style={({ pressed }) => [styles.priorityOption, { borderColor: selected ? action : border, backgroundColor: selected ? Palette.homeLightActionSoft : 'transparent' }, pressed && styles.pressed]}>
                          <ThemedText type="smallBold">{label}</ThemedText>
                        </Pressable>;
                      })}</View>
                    </View>
                    <View accessibilityRole="radiogroup" style={styles.priorityGroup}>
                      <ThemedText type="smallBold">{taskCopy.goalLabel}</ThemedText>
                      {goalsLoading ? <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">{taskCopy.loadingGoals}</ThemedText> : null}
                      {goalsLoadError ? <ThemedView accessibilityRole="alert" style={[styles.goalError, { borderColor: border }]}>
                        <ThemedText themeColor="textSecondary">{taskCopy.goalsLoadError}</ThemedText>
                        <Button disabled={goalsLoading} label={taskCopy.retryGoals} onPress={() => retryGoalsLoad.current()} variant="secondary" />
                      </ThemedView> : null}
                      {!goalsLoading && !goalsLoadError ? <View style={styles.priorityOptions}>
                        <Pressable accessibilityLabel={taskCopy.noGoal} accessibilityRole="radio" accessibilityState={{ selected: draftGoalId === null }} onPress={() => setDraftGoalId(null)} style={({ pressed }) => [styles.priorityOption, { borderColor: draftGoalId === null ? action : border, backgroundColor: draftGoalId === null ? Palette.homeLightActionSoft : 'transparent' }, pressed && styles.pressed]}>
                          <ThemedText type="smallBold">{taskCopy.noGoal}</ThemedText>
                        </Pressable>
                        {goals.filter((goal) => goal.status === 'active' || goal.id === task.goalId).map((goal) => {
                          const selected = draftGoalId === goal.id;
                          const label = goal.status === 'active' ? goal.title : `${goal.title} (${goal.status})`;
                          return <Pressable accessibilityLabel={label} accessibilityRole="radio" accessibilityState={{ selected }} key={goal.id} onPress={() => setDraftGoalId(goal.id)} style={({ pressed }) => [styles.priorityOption, { borderColor: selected ? action : border, backgroundColor: selected ? Palette.homeLightActionSoft : 'transparent' }, pressed && styles.pressed]}>
                            <ThemedText type="smallBold">{label}</ThemedText>
                          </Pressable>;
                        })}
                        {goals.length === 0 ? <ThemedText themeColor="textSecondary" type="small">{taskCopy.createGoalFirst}</ThemedText> : null}
                      </View> : null}
                    </View>
                  </> : <>
                    <ThemedText accessibilityRole="header" type="subtitle" style={styles.title}>{task.title}</ThemedText>
                    {task.description ? <ThemedText themeColor="textSecondary">{task.description}</ThemedText> : null}
                    {task.dueAt ? <ThemedText accessibilityLabel={`${taskCopy.dueDatePrefix}: ${formatTaskDueDate(task.dueAt)}`} themeColor="textSecondary">{taskCopy.dueDatePrefix} {formatTaskDueDate(task.dueAt)}</ThemedText> : null}
                    {task.priority ? <ThemedText accessibilityLabel={`${taskCopy.priorityPrefix}: ${task.priority}`} themeColor="textSecondary" type="small">{taskCopy.priorityPrefix}: {task.priority}</ThemedText> : null}
                  </>}
                  <ThemedText themeColor="textSecondary">{task.archivedAt ? taskCopy.archivedStatus : task.status === 'completed' ? taskCopy.completedStatus : task.status === 'cancelled' ? taskCopy.cancelledStatus : taskCopy.readyStatus}</ThemedText>
                  {saveError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary">{taskCopy.pendingSave}</ThemedText> : null}
                  {editError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary">{editError}</ThemedText> : null}
                  {deleteError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary">{deleteError}</ThemedText> : null}
                  {archiveError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary">{archiveError}</ThemedText> : null}
                  <ThemedView style={[styles.resourceCard, { borderColor: border }]}>
                    <ThemedText type="smallBold">{resourceCopy.taskSection}</ThemedText>
                    <ThemedText themeColor="textSecondary" type="small">{resourceCopy.taskSectionDetail}</ThemedText>
                    {resourceError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary">{resourceError}</ThemedText> : null}
                    {resources.length === 0 ? <ThemedText themeColor="textSecondary" type="small">{resourceCopy.taskEmpty}</ThemedText> : resources.map((resource) => {
                      const linked = resourceLinks.some((link) => link.resourceId === resource.id);
                      return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: linked, disabled: resource.lifecycle !== 'active' || resourceBusy }} disabled={resource.lifecycle !== 'active' || resourceBusy} key={resource.id} onPress={() => void toggleResource(resource)} style={({ pressed }) => [styles.resourceRow, { borderColor: linked ? action : border }, pressed && styles.pressed]}><View style={styles.resourceText}><ThemedText type="smallBold">{resource.title}</ThemedText><ThemedText numberOfLines={1} themeColor="textSecondary" type="small">{resource.reference}</ThemedText></View><ThemedText style={{ color: action }} type="smallBold">{linked ? resourceCopy.linked : resourceCopy.link}</ThemedText></Pressable>;
                    })}
                  </ThemedView>
                  {deleteError?.startsWith('This task changed elsewhere') ? <Button disabled={saving} fullWidth label={taskCopy.reload} onPress={reloadTask} variant="secondary" /> : null}
                  {archiveError?.startsWith('This task changed elsewhere') ? <Button disabled={saving} fullWidth label={taskCopy.reload} onPress={reloadTask} variant="secondary" /> : null}
                  {confirmDelete ? <ThemedView accessibilityRole="alert" style={[styles.confirmCard, { borderColor: border }]}>
                    <ThemedText type="smallBold">{taskCopy.deleteTitle}</ThemedText>
                    <ThemedText themeColor="textSecondary">{taskCopy.deleteDetail}</ThemedText>
                    <Button accentColor={action} disabled={saving} fullWidth label={taskCopy.deleteConfirm} loading={saving} onPress={() => void confirmTaskDeletion()} style={{ backgroundColor: action, borderColor: action }} />
                    <Button disabled={saving} fullWidth label={taskCopy.keepTask} onPress={() => { setConfirmDelete(false); setDeleteError(null); }} variant="ghost" />
                  </ThemedView> : null}
                  <View style={styles.actions}>
                    {editing ? <>
                      <Button accentColor={action} disabled={!draftTitle.trim()} fullWidth label={taskCopy.saveDetails} loading={saving} onPress={() => void saveDetails()} style={{ backgroundColor: action, borderColor: action }} />
                      <Button disabled={saving} fullWidth label={taskCopy.cancelEditing} onPress={() => setEditing(false)} variant="ghost" />
                      {editError?.startsWith('This task changed elsewhere') ? <Button disabled={saving} fullWidth label={taskCopy.reload} onPress={reloadTask} variant="secondary" /> : null}
                    </> : <>
                      {!task.archivedAt && task.status !== 'completed' && task.status !== 'cancelled' ? <Button accentColor={action} fullWidth label={taskCopy.editDetails} onPress={beginEdit} variant="secondary" /> : null}
                      {!task.archivedAt && task.status !== 'completed' ? <Button accentColor={action} fullWidth label={taskCopy.complete} loading={saving} onPress={() => void complete()} style={{ backgroundColor: action, borderColor: action }} /> : null}
                      {!task.archivedAt && task.status !== 'completed' && task.status !== 'cancelled' ? <Button accentColor={action} disabled={saving} fullWidth label={taskCopy.focus} onPress={() => router.push({ pathname: '/focus/setup', params: { taskId: task.id } })} variant="secondary" /> : null}
                      <Button accentColor={action} disabled={saving} fullWidth label={task.archivedAt ? taskCopy.restore : taskCopy.archive} loading={saving} onPress={() => void toggleArchive()} variant="secondary" />
                      <Button disabled={saving} fullWidth label={taskCopy.delete} onPress={() => { setConfirmDelete(true); setDeleteError(null); }} variant="ghost" />
                    </>}
                  </View>
                </ThemedView>}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' },
  loading: { alignItems: 'center', minHeight: 180, justifyContent: 'center' }, card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg },
  icon: { alignItems: 'center', borderRadius: 26, height: 52, justifyContent: 'center', width: 52 }, eyebrow: { letterSpacing: 1.2 }, title: { fontSize: 30, lineHeight: 38 },
  titleInput: { borderWidth: 1, borderRadius: Radius.card, fontSize: 22, minHeight: 52, paddingHorizontal: Spacing.md }, descriptionInput: { borderWidth: 1, borderRadius: Radius.card, minHeight: 92, padding: Spacing.md, textAlignVertical: 'top' }, input: { borderWidth: 1, borderRadius: Radius.card, fontSize: 18, minHeight: 48, paddingHorizontal: Spacing.md },
  priorityGroup: { gap: Spacing.sm }, priorityOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs }, priorityOption: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: Spacing.md },
  actions: { gap: Spacing.sm }, confirmCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.sm, padding: Spacing.md }, goalError: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.sm, padding: Spacing.sm }, resourceCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.sm, padding: Spacing.md }, resourceRow: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.sm, minHeight: 56, padding: Spacing.sm }, resourceText: { flex: 1, gap: 2 }, pressed: { opacity: 0.78 },
});
