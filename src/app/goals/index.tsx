import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { loadSessionHistory } from '@/features/focus/session-storage';
import type { FocusSession } from '@/features/focus/session-types';
import { formatGoalValue, getGoalProgress } from '@/features/goals/goal-progress';
import { loadGoals, saveGoals } from '@/features/goals/goal-storage';
import type { Goal, GoalType } from '@/features/goals/goal-types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function GoalsRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('5');
  const [type, setType] = useState<GoalType>('session_count');

  useFocusEffect(useCallback(() => { let mounted = true; void Promise.all([loadGoals(), loadSessionHistory()]).then(([storedGoals, history]) => { if (mounted) { setGoals(storedGoals); setSessions(history); } }); return () => { mounted = false; }; }, []));

  async function addGoal() {
    const trimmed = title.trim();
    const targetValue = Number(target);
    if (!trimmed || !Number.isFinite(targetValue) || targetValue <= 0) return;
    const now = new Date().toISOString();
    const goal: Goal = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title: trimmed, type, period: 'weekly', status: 'active', targetValue, createdAt: now, updatedAt: now };
    const next = [goal, ...goals];
    setGoals(next); setTitle(''); setTarget('5'); setShowComposer(false); await saveGoals(next);
  }

  return <ThemedView style={[styles.screen, { backgroundColor: background }]}><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><View style={styles.content}>
    <View style={styles.header}><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">GOALS</ThemedText><ThemedText accessibilityRole="header" type="title" style={styles.title}>Keep your direction clear.</ThemedText><ThemedText themeColor="textSecondary">Set one measurable intention and let completed focus sessions move it forward.</ThemedText></View>
    {!showComposer ? <Button accentColor={action} fullWidth label="Create a goal" onPress={() => setShowComposer(true)} style={{ backgroundColor: action, borderColor: action }} /> : <ThemedView style={[styles.composer, { backgroundColor: surface, borderColor: border }]}><ThemedText type="smallBold">NEW WEEKLY GOAL</ThemedText><TextInput accessibilityLabel="Goal title" autoFocus onChangeText={setTitle} placeholder="What do you want to achieve?" placeholderTextColor={theme.textMuted} style={[styles.input, { borderColor: border, color: theme.text }]} value={title} /><View style={styles.typeRow}>{(['session_count', 'focus_time'] as const).map((value) => <Pressable accessibilityRole="radio" accessibilityState={{ selected: type === value }} key={value} onPress={() => { setType(value); setTarget(value === 'session_count' ? '5' : '120'); }} style={[styles.typeChip, { backgroundColor: type === value ? action : 'transparent', borderColor: type === value ? action : border }]}><ThemedText style={type === value ? { color: Palette.deepNavy } : undefined} type="smallBold">{value === 'session_count' ? 'Sessions' : 'Focus minutes'}</ThemedText></Pressable>)}</View><TextInput accessibilityLabel={type === 'session_count' ? 'Target sessions' : 'Target focus minutes'} keyboardType="number-pad" onChangeText={setTarget} placeholder="Target" placeholderTextColor={theme.textMuted} style={[styles.input, { borderColor: border, color: theme.text }]} value={target} /><View style={styles.actions}><Button accentColor={action} label="Save goal" onPress={() => void addGoal()} style={{ backgroundColor: action, borderColor: action }} /><Button label="Cancel" onPress={() => setShowComposer(false)} variant="ghost" /></View></ThemedView>}
    <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">ACTIVE GOALS</ThemedText>{goals.length === 0 ? <ThemedView accessibilityLabel="No goals yet" style={[styles.empty, { backgroundColor: surface, borderColor: border }]}><Ionicons color={action} name="flag-outline" size={25} /><ThemedText themeColor="textSecondary">Create a simple goal when you are ready.</ThemedText></ThemedView> : goals.map((goal) => { const result = getGoalProgress(goal, sessions); return <Pressable accessibilityLabel={`${goal.title}. ${Math.round(result.progress * 100)} percent complete`} accessibilityRole="button" key={goal.id} onPress={() => router.push({ pathname: '/goals/[goalId]', params: { goalId: goal.id, goalTitle: goal.title } })} style={({ pressed }) => [styles.goalCard, { backgroundColor: surface, borderColor: border }, pressed && styles.pressed]}><View style={styles.goalTop}><View style={[styles.goalIcon, { backgroundColor: Palette.homeLightActionSoft }]}><Ionicons color={action} name="flag-outline" size={22} /></View><ThemedText style={{ color: action }} type="smallBold">WEEKLY</ThemedText></View><ThemedText type="subtitle" style={styles.goalTitle}>{goal.title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{formatGoalValue(goal, result.currentValue)} of {formatGoalValue(goal, goal.targetValue)}</ThemedText><View style={[styles.track, { backgroundColor: Palette.homeLightActionSoft }]}><View style={[styles.fill, { backgroundColor: action, width: `${Math.round(result.progress * 100)}%` }]} /></View></Pressable>; })}</View>
  </View></ScrollView></ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' }, header: { gap: Spacing.xs }, eyebrow: { letterSpacing: 1.2 }, title: { fontSize: 38, lineHeight: 44 }, composer: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, input: { borderRadius: Radius.card, borderWidth: 1, fontSize: 16, minHeight: 52, paddingHorizontal: Spacing.md }, typeRow: { flexDirection: 'row', gap: Spacing.sm }, typeChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }, actions: { flexDirection: 'row', gap: Spacing.sm }, section: { gap: Spacing.sm }, sectionLabel: { letterSpacing: 1.1 }, empty: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg }, goalCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.sm, padding: Spacing.lg }, goalTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, goalIcon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 }, goalTitle: { fontSize: 25, lineHeight: 32 }, track: { borderRadius: 999, height: 8, overflow: 'hidden' }, fill: { borderRadius: 999, height: '100%' }, pressed: { opacity: 0.78 } });
