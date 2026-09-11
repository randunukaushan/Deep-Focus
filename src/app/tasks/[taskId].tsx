import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { loadTasks, saveTasks } from '@/features/tasks/task-storage';
import type { Task } from '@/features/tasks/task-types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function TaskDetailRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const [task, setTask] = useState<Task | null>(null);
  const { taskId, taskTitle } = useLocalSearchParams<{ taskId?: string | string[]; taskTitle?: string | string[] }>();
  const normalizedTaskId = Array.isArray(taskId) ? taskId[0] : taskId;
  const normalizedTaskTitle = Array.isArray(taskTitle) ? taskTitle[0] : taskTitle;

  useFocusEffect(useCallback(() => { let mounted = true; void loadTasks().then((tasks) => { if (!mounted) return; const stored = tasks.find((item) => item.id === normalizedTaskId); if (stored) { setTask(stored); return; } if (normalizedTaskId && normalizedTaskTitle) { const now = new Date().toISOString(); setTask({ id: normalizedTaskId, title: normalizedTaskTitle, status: 'pending', createdAt: now, updatedAt: now }); } else setTask(null); }); return () => { mounted = false; }; }, [normalizedTaskId, normalizedTaskTitle]));

  async function complete() {
    if (!task) return;
    const next = { ...task, status: 'completed' as const, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setTask(next);
    const tasks = await loadTasks();
    await saveTasks(tasks.some((item) => item.id === next.id) ? tasks.map((item) => item.id === next.id ? next : item) : [next, ...tasks]);
  }

  return <ThemedView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}><View style={styles.content}><Button accentColor={action} label="Back to Tasks" onPress={() => router.replace('/tasks')} variant="ghost" />{!task ? <><ThemedText accessibilityRole="header" type="subtitle">Task unavailable</ThemedText><ThemedText themeColor="textSecondary">This task could not be found on this device.</ThemedText></> : <ThemedView accessibilityLabel={`Task detail: ${task.title}`} style={[styles.card, { backgroundColor: surface, borderColor: border }]}><View style={[styles.icon, { backgroundColor: task.status === 'completed' ? action : Palette.homeLightActionSoft }]}><Ionicons color={task.status === 'completed' ? Palette.deepNavy : action} name={task.status === 'completed' ? 'checkmark' : 'checkmark-circle-outline'} size={28} /></View><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">TASK DETAIL</ThemedText><ThemedText accessibilityRole="header" type="subtitle" style={styles.title}>{task.title}</ThemedText><ThemedText themeColor="textSecondary">{task.status === 'completed' ? 'Completed. You made space for this.' : 'Ready to become your next focus block.'}</ThemedText><View style={styles.actions}>{task.status !== 'completed' ? <Button accentColor={action} fullWidth label="Complete task" onPress={() => void complete()} style={{ backgroundColor: action, borderColor: action }} /> : null}<Button accentColor={action} fullWidth label="Focus on this task" onPress={() => router.push({ pathname: '/focus/setup', params: { taskName: task.title } })} variant="secondary" /></View></ThemedView>}</View></ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, content: { alignSelf: 'center', flex: 1, gap: Spacing.lg, justifyContent: 'center', maxWidth: 560, padding: Spacing.lg, width: '100%' }, card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, icon: { alignItems: 'center', borderRadius: 26, height: 52, justifyContent: 'center', width: 52 }, eyebrow: { letterSpacing: 1.2 }, title: { fontSize: 30, lineHeight: 38 }, actions: { gap: Spacing.sm } });
