import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { accentTextColor } from '@/theme/action-colors';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { completeTask, loadTasks, saveTasks } from '@/features/tasks/task-storage';
import type { Task } from '@/features/tasks/task-types';
import { createStableId } from '@/features/identity/stable-ids';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { useAppLocale } from '@/features/localization/app-locale-context';
import type { AppLocaleCopy } from '@/features/localization/app-locale';

// Called only by the submit handler, never while rendering the task list.
function createTask(title: string): Task {
  const timestamp = Date.now();
  const now = new Date(timestamp).toISOString();
  return { id: createStableId(), title, status: 'pending', createdAt: now, updatedAt: now };
}

export default function TasksRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = theme.primary;
  const { copy } = useAppLocale();
  const text = copy.tasks;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const writing = useRef(false);
  const retryLoad = useRef<() => void>(() => {});

  useFocusEffect(useCallback(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const stored = await loadTasks();
        if (mounted) setTasks(stored);
      } catch { if (mounted) setLoadError(true); }
      finally { if (mounted) setLoading(false); }
    };
    retryLoad.current = () => { void load(); };
    void load();
    return () => { mounted = false; retryLoad.current = () => {}; };
  }, []));

  async function persistTasks(next: Task[]) {
    if (writing.current || loading || loadError) return false;
    writing.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      await saveTasks(next);
      setTasks(next);
      return true;
    } catch {
      setSaveError(text.saveError);
      return false;
    } finally {
      writing.current = false;
      setSaving(false);
    }
  }

  async function addTask() {
    const trimmed = title.trim();
    if (!trimmed) return;
    const task = createTask(trimmed);
    const next = [task, ...tasks];
    if (await persistTasks(next)) { setTitle(''); setShowComposer(false); }
  }

  async function completeTaskItem(task: Task) {
    if (writing.current || loading || loadError) return;
    writing.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await completeTask(task.id, task.updatedAt);
      if (!result) {
        setSaveError(text.saveError);
        return;
      }
      setTasks((current) => current.map((item) => item.id === task.id ? result.task : item));
    } catch {
      setSaveError(text.saveError);
    } finally {
      writing.current = false;
      setSaving(false);
    }
  }

  const activeTasks = tasks.filter((task) => !task.archivedAt);
  const pending = activeTasks.filter((task) => task.status !== 'completed' && task.status !== 'cancelled');
  const completed = activeTasks.filter((task) => task.status === 'completed');
  const archived = tasks.filter((task) => Boolean(task.archivedAt));

  if (loading || loadError) return <SafeAreaView style={[styles.screen, { backgroundColor: background }]}><ScrollView contentContainerStyle={styles.scroll}><View style={styles.content}>
    <ThemedText accessibilityRole={loadError ? 'alert' : 'text'}>{loadError ? text.loadError : text.loading}</ThemedText>
    {loadError ? <Button label={text.retry} onPress={() => retryLoad.current()} /> : null}
  </View></ScrollView></SafeAreaView>;

  return <SafeAreaView style={[styles.screen, { backgroundColor: background }]}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}><View style={styles.content}>
    <SectionHeading eyebrow={text.eyebrow} icon="checkbox-outline" title={text.title} subtitle={text.subtitle} />
    {saving ? <ThemedText accessibilityLiveRegion="polite">{text.saving}</ThemedText> : null}
    {saveError ? <ThemedText accessibilityRole="alert">{saveError}</ThemedText> : null}
    {!showComposer ? <Button accentColor={action} fullWidth label={text.add} onPress={() => setShowComposer(true)} style={{ backgroundColor: action, borderColor: action }} /> : <ThemedView style={[styles.composer, { backgroundColor: surface, borderColor: border }]}><ThemedText type="smallBold">{text.newTask}</ThemedText><ThemedText type="smallBold">{text.titleLabel}</ThemedText><TextInput accessibilityLabel={text.titleLabel} editable={!saving} autoFocus maxLength={120} onChangeText={setTitle} onSubmitEditing={() => void addTask()} placeholder={text.placeholder} placeholderTextColor={theme.textMuted} returnKeyType="done" style={[styles.input, { color: theme.text, borderColor: border }]} value={title} /><View style={styles.composerActions}><Button accentColor={action} label={text.save} loading={saving} onPress={() => void addTask()} style={{ backgroundColor: action, borderColor: action }} /><Button label={text.cancel} disabled={saving} onPress={() => { setTitle(''); setShowComposer(false); }} variant="ghost" /></View></ThemedView>}
    <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">{text.upNext}</ThemedText>{pending.length === 0 ? <EmptyState action={action} border={border} icon="checkmark-circle-outline" text={activeTasks.length === 0 ? text.noActive : text.cleared} /> : pending.map((task) => <TaskRow action={action} border={border} disabled={saving} key={task.id} task={task} text={text} onComplete={() => void completeTaskItem(task)} onOpen={() => router.push({ pathname: '/tasks/[taskId]', params: { taskId: task.id } })} />)}</View>
    {completed.length > 0 ? <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">{text.completed}</ThemedText>{completed.map((task) => <TaskRow action={action} border={border} text={text} key={task.id} task={task} onOpen={() => router.push({ pathname: '/tasks/[taskId]', params: { taskId: task.id } })} />)}</View> : null}
    {archived.length > 0 ? <><Button accentColor={action} label={`${showArchived ? text.hideArchived : text.showArchived} (${archived.length})`} onPress={() => setShowArchived((current) => !current)} variant="secondary" />{showArchived ? <View style={styles.section}><ThemedText accessibilityRole="header" style={[styles.sectionLabel, { color: action }]} type="smallBold">{text.archived}</ThemedText>{archived.map((task) => <TaskRow action={action} border={border} text={text} key={task.id} task={task} onOpen={() => router.push({ pathname: '/tasks/[taskId]', params: { taskId: task.id } })} />)}</View> : null}</> : null}
  </View></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

function TaskRow({ action, border, disabled = false, onComplete, onOpen, task, text }: { disabled?: boolean; action: string; border: string; onComplete?: () => void; onOpen: () => void; task: Task; text: AppLocaleCopy['tasks'] }) {
  const theme = useTheme();
  const complete = task.status === 'completed';
  const onAction = accentTextColor(action);
  const archived = Boolean(task.archivedAt);
  const statusLabel = archived ? text.archivedState : complete ? text.completedState : text.ready;

  return (
    <View style={[styles.taskRow, { backgroundColor: theme.surface, borderColor: border }]}>
      <Pressable accessibilityLabel={complete ? `${task.title} ${text.completedState.toLowerCase()}` : `${text.complete} ${task.title}`} accessibilityRole="checkbox" accessibilityState={{ checked: complete, disabled: archived || complete || disabled }} disabled={archived || complete || disabled} onPress={onComplete} style={[styles.check, { borderColor: complete ? action : theme.textMuted, backgroundColor: complete ? action : 'transparent' }]}>
        {complete ? <Ionicons accessible={false} color={onAction} name="checkmark" size={18} /> : null}
      </Pressable>
      <Pressable accessibilityLabel={`${task.title}, ${statusLabel.toLowerCase()}`} accessibilityRole="button" onPress={onOpen} style={({ pressed }) => [styles.openTask, pressed && styles.pressed]}>
        <View style={styles.taskCopy}><ThemedText style={complete ? styles.completedTitle : undefined}>{task.title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{statusLabel}</ThemedText></View>
        <Ionicons accessible={false} color={action} name="chevron-forward" size={19} />
      </Pressable>
    </View>
  );
}
function EmptyState({ action, border, icon, text }: { action: string; border: string; icon: keyof typeof Ionicons.glyphMap; text: string }) { return <ThemedView accessibilityLabel={text} style={[styles.empty, { borderColor: border }]}><Ionicons color={action} name={icon} size={24} /><ThemedText style={styles.emptyText} themeColor="textSecondary" type="small">{text}</ThemedText></ThemedView>; }

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.lg },
  content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' },
  composer: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg },
  input: { borderRadius: Radius.card, borderWidth: 1, fontSize: 16, minHeight: 52, paddingHorizontal: Spacing.md },
  composerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  section: { gap: Spacing.sm },
  sectionLabel: { letterSpacing: 1.1 },
  taskRow: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.sm, minHeight: 76, paddingLeft: Spacing.sm },
  check: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  openTask: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: Spacing.sm, minHeight: 76, paddingRight: Spacing.md, paddingVertical: Spacing.md },
  taskCopy: { flex: 1, gap: Spacing.xs, minWidth: 0 },
  completedTitle: { textDecorationLine: 'line-through' },
  empty: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.sm, minHeight: 64, padding: Spacing.md },
  emptyText: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.78 },
});
