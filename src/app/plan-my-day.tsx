import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { loadTasks } from '@/features/tasks/task-storage';
import type { Task } from '@/features/tasks/task-types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function PlanMyDayRoute() {
  const router = useRouter();
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

  useFocusEffect(useCallback(() => { let mounted = true; void loadTasks().then((stored) => { if (mounted) { setTasks(stored.filter((task) => task.status !== 'completed' && task.status !== 'cancelled')); setSelectedIds(stored.filter((task) => task.status !== 'completed' && task.status !== 'cancelled').slice(0, 3).map((task) => task.id)); } }); return () => { mounted = false; }; }, []));
  const selectedTasks = useMemo(() => tasks.filter((task) => selectedIds.includes(task.id)), [selectedIds, tasks]);
  const blockCount = Math.max(1, Math.min(selectedTasks.length || 1, Math.floor((Number(availableMinutes) || 0) / 30) || 1));
  const planTasks = selectedTasks.slice(0, blockCount);

  function toggleTask(id: string) { setHasPlan(false); setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }

  return <ThemedView style={[styles.screen, { backgroundColor: background }]}><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><View style={styles.content}>
    <Pressable accessibilityLabel="Back to Home" accessibilityRole="button" onPress={() => router.replace('/(tabs)/home')} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Ionicons color={action} name="arrow-back" size={20} /><ThemedText style={{ color: action }} type="smallBold">Home</ThemedText></Pressable>
    <View style={styles.header}><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">PLAN MY DAY</ThemedText><ThemedText accessibilityRole="header" type="title" style={styles.title}>Start with what matters.</ThemedText><ThemedText themeColor="textSecondary">Choose the tasks and time you have. We will suggest a simple starting point for your day.</ThemedText></View>
    <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}><ThemedText type="smallBold">TIME AVAILABLE</ThemedText><View style={styles.timeInput}><TextInput accessibilityLabel="Available minutes" keyboardType="number-pad" onChangeText={(value) => { setHasPlan(false); setAvailableMinutes(value.replace(/[^0-9]/g, '')); }} style={[styles.input, { color: theme.text }]} value={availableMinutes} /><ThemedText themeColor="textSecondary">minutes</ThemedText></View><ThemedText themeColor="textSecondary" type="small">Each suggestion leaves space for a short break.</ThemedText></ThemedView>
    <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">CHOOSE TASKS</ThemedText>{tasks.length === 0 ? <ThemedView style={[styles.empty, { backgroundColor: surface, borderColor: border }]}><ThemedText themeColor="textSecondary">Add a task first, then come back to build a plan.</ThemedText><Button accentColor={action} label="Add a task" onPress={() => router.push('/tasks')} variant="secondary" /></ThemedView> : tasks.map((task) => { const selected = selectedIds.includes(task.id); return <Pressable accessibilityLabel={`${task.title}, ${selected ? 'selected' : 'not selected'}`} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} key={task.id} onPress={() => toggleTask(task.id)} style={({ pressed }) => [styles.task, { backgroundColor: selected ? softAction : surface, borderColor: selected ? action : border }, pressed && styles.pressed]}><View style={[styles.check, { backgroundColor: selected ? action : 'transparent', borderColor: selected ? action : border }]}>{selected ? <Ionicons color={Palette.deepNavy} name="checkmark" size={18} /> : null}</View><View style={styles.taskCopy}><ThemedText type="smallBold">{task.title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{selected ? 'Included in your suggestion' : 'Tap to include'}</ThemedText></View></Pressable>; })}</View>
    {!hasPlan ? <Button accentColor={action} fullWidth disabled={tasks.length === 0 || selectedTasks.length === 0 || Number(availableMinutes) < 25} label="Suggest a plan" onPress={() => setHasPlan(true)} style={{ backgroundColor: action, borderColor: action }} /> : <ThemedView accessibilityLabel={`${planTasks.length} focus blocks suggested`} style={[styles.proposal, { backgroundColor: surface, borderColor: border }]}><View style={styles.proposalHeader}><View><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">YOUR SUGGESTION</ThemedText><ThemedText type="subtitle" style={styles.proposalTitle}>A clear starting point.</ThemedText></View><Ionicons color={action} name="sparkles-outline" size={28} /></View>{planTasks.map((task, index) => <View style={styles.planRow} key={task.id}><View style={[styles.step, { backgroundColor: action }]}><ThemedText style={{ color: Palette.deepNavy }} type="smallBold">{index + 1}</ThemedText></View><View style={styles.taskCopy}><ThemedText type="smallBold">{task.title}</ThemedText><ThemedText themeColor="textSecondary" type="small">25 min focus · 5 min break</ThemedText></View><Button accentColor={action} label="Start" onPress={() => router.push({ pathname: '/focus/setup', params: { taskName: task.title } })} variant="secondary" /></View>)}<ThemedText themeColor="textSecondary" type="small">This is a proposal only. Your tasks and schedule have not been changed.</ThemedText><Button accentColor={action} fullWidth label="Adjust selection" onPress={() => setHasPlan(false)} variant="ghost" /></ThemedView>}
  </View></ScrollView></ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' }, back: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: Spacing.xs, minHeight: 44, paddingRight: Spacing.md }, header: { gap: Spacing.xs }, title: { fontSize: 38, lineHeight: 44 }, eyebrow: { letterSpacing: 1.2 }, card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.sm, padding: Spacing.lg }, timeInput: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm }, input: { borderBottomColor: Palette.homeLightAction, borderBottomWidth: 2, fontSize: 28, fontWeight: '700', minWidth: 74, paddingVertical: Spacing.xs, textAlign: 'center' }, section: { gap: Spacing.sm }, sectionLabel: { letterSpacing: 1.1 }, task: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 72, padding: Spacing.md }, check: { alignItems: 'center', borderRadius: 18, borderWidth: 1, height: 36, justifyContent: 'center', width: 36 }, taskCopy: { flex: 1, gap: 2 }, empty: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, proposal: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, proposalHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, proposalTitle: { fontSize: 26, lineHeight: 34 }, planRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm }, step: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 }, pressed: { opacity: 0.78 } });
