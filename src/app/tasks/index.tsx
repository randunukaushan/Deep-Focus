import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { loadTasks, saveTasks } from '@/features/tasks/task-storage';
import type { Task } from '@/features/tasks/task-types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

// Called only by the submit handler, never while rendering the task list.
function createTask(title: string): Task {
  const timestamp = Date.now();
  const now = new Date(timestamp).toISOString();
  return { id: `${timestamp}-${Math.random().toString(36).slice(2, 8)}`, title, status: 'pending', createdAt: now, updatedAt: now };
}

export default function TasksRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [showComposer, setShowComposer] = useState(false);
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
      setSaveError('Your changes could not be saved. Your task list and draft were kept. Try the action again.');
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

  async function completeTask(task: Task) {
    const now = new Date().toISOString();
    const next = tasks.map((item) => item.id === task.id ? { ...item, status: 'completed' as const, completedAt: now, updatedAt: now } : item);
    await persistTasks(next);
  }

  const pending = tasks.filter((task) => task.status !== 'completed' && task.status !== 'cancelled');
  const completed = tasks.filter((task) => task.status === 'completed');

  if (loading || loadError) return <ThemedView style={[styles.screen, { backgroundColor: background }]}><View style={styles.content}>
    <ThemedText accessibilityRole={loadError ? 'alert' : 'text'}>{loadError ? 'Your tasks could not be loaded. Your saved data has not been reset.' : 'Loading tasks…'}</ThemedText>
    {loadError ? <Button label="Retry loading tasks" onPress={() => retryLoad.current()} /> : null}
  </View></ThemedView>;

  return <ThemedView style={[styles.screen, { backgroundColor: background }]}><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><View style={styles.content}>
    <View style={styles.header}><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">TASKS</ThemedText><ThemedText accessibilityRole="header" type="title" style={styles.title}>Choose what matters next.</ThemedText><ThemedText themeColor="textSecondary">Keep your next steps clear and ready for focus.</ThemedText></View>
    {saving ? <ThemedText accessibilityLiveRegion="polite">Saving changes…</ThemedText> : null}
    {saveError ? <ThemedText accessibilityRole="alert">{saveError}</ThemedText> : null}
    {!showComposer ? <Button accentColor={action} fullWidth label="Add a task" onPress={() => setShowComposer(true)} style={{ backgroundColor: action, borderColor: action }} /> : <ThemedView style={[styles.composer, { backgroundColor: surface, borderColor: border }]}><ThemedText type="smallBold">NEW TASK</ThemedText><TextInput accessibilityLabel="Task title" editable={!saving} autoFocus onChangeText={setTitle} onSubmitEditing={() => void addTask()} placeholder="What needs your attention?" placeholderTextColor={theme.textMuted} returnKeyType="done" style={[styles.input, { color: theme.text, borderColor: border }]} value={title} /><View style={styles.composerActions}><Button accentColor={action} label="Save task" loading={saving} onPress={() => void addTask()} style={{ backgroundColor: action, borderColor: action }} /><Button label="Cancel" disabled={saving} onPress={() => { setTitle(''); setShowComposer(false); }} variant="ghost" /></View></ThemedView>}
    <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">UP NEXT</ThemedText>{pending.length === 0 ? <EmptyState border={border} icon="checkmark-circle-outline" text={tasks.length === 0 ? 'Add one task to begin.' : 'You have cleared your task list.'} /> : pending.map((task) => <TaskRow action={action} border={border} disabled={saving} key={task.id} task={task} onComplete={() => void completeTask(task)} onOpen={() => router.push({ pathname: '/tasks/[taskId]', params: { taskId: task.id, taskTitle: task.title } })} />)}</View>
    {completed.length > 0 ? <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">COMPLETED</ThemedText>{completed.map((task) => <TaskRow action={action} border={border} key={task.id} task={task} onOpen={() => router.push({ pathname: '/tasks/[taskId]', params: { taskId: task.id, taskTitle: task.title } })} />)}</View> : null}
  </View></ScrollView></ThemedView>;
}

function TaskRow({ action, border, disabled = false, onComplete, onOpen, task }: { disabled?: boolean; action: string; border: string; onComplete?: () => void; onOpen: () => void; task: Task }) { const complete = task.status === 'completed'; return <Pressable accessibilityLabel={`${task.title}, ${complete ? 'completed' : 'pending'}`} accessibilityRole="button" onPress={onOpen} style={({ pressed }) => [styles.taskRow, { borderColor: border }, pressed && styles.pressed]}><Pressable accessibilityLabel={complete ? `${task.title} completed` : `Complete ${task.title}`} accessibilityRole="checkbox" accessibilityState={{ checked: complete, disabled: complete || disabled }} disabled={complete || disabled} onPress={onComplete} style={[styles.check, { borderColor: complete ? action : border, backgroundColor: complete ? action : 'transparent' }]}><Ionicons color={Palette.deepNavy} name="checkmark" size={18} /></Pressable><View style={styles.taskCopy}><ThemedText numberOfLines={2} style={complete ? styles.completedTitle : undefined}>{task.title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{complete ? 'Completed' : 'Ready for focus'}</ThemedText></View><Ionicons color={action} name="chevron-forward" size={19} /></Pressable>; }
function EmptyState({ border, icon, text }: { border: string; icon: keyof typeof Ionicons.glyphMap; text: string }) { return <ThemedView accessibilityLabel={text} style={[styles.empty, { borderColor: border }]}><Ionicons color={Palette.homeLightAction} name={icon} size={24} /><ThemedText themeColor="textSecondary" type="small">{text}</ThemedText></ThemedView>; }

const styles = StyleSheet.create({ screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' }, header: { gap: Spacing.xs }, title: { fontSize: 38, lineHeight: 44 }, eyebrow: { letterSpacing: 1.2 }, composer: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, input: { borderRadius: Radius.card, borderWidth: 1, fontSize: 16, minHeight: 52, paddingHorizontal: Spacing.md }, composerActions: { flexDirection: 'row', gap: Spacing.sm }, section: { gap: Spacing.sm }, sectionLabel: { letterSpacing: 1.1 }, taskRow: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 76, padding: Spacing.md }, check: { alignItems: 'center', borderRadius: 18, borderWidth: 1, height: 36, justifyContent: 'center', width: 36 }, taskCopy: { flex: 1, gap: 2 }, completedTitle: { textDecorationLine: 'line-through', opacity: 0.65 }, empty: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.sm, minHeight: 64, padding: Spacing.md }, pressed: { opacity: 0.78 } });
