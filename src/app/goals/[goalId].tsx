import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { loadSessionHistory } from '@/features/focus/session-storage';
import type { FocusSession } from '@/features/focus/session-types';
import { formatGoalValue, getGoalProgress } from '@/features/goals/goal-progress';
import { loadGoals } from '@/features/goals/goal-storage';
import type { Goal } from '@/features/goals/goal-types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function GoalDetailRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const { goalId } = useLocalSearchParams<{ goalId?: string | string[] }>();
  const normalizedId = Array.isArray(goalId) ? goalId[0] : goalId;
  const [goal, setGoal] = useState<Goal | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  useFocusEffect(useCallback(() => { let mounted = true; void Promise.all([loadGoals(), loadSessionHistory()]).then(([goals, history]) => { if (mounted) { setGoal(goals.find((item) => item.id === normalizedId) ?? null); setSessions(history); } }); return () => { mounted = false; }; }, [normalizedId]));
  const result = goal ? getGoalProgress(goal, sessions) : null;

  return <ThemedView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}><View style={styles.content}><Button accentColor={action} label="Back to Goals" onPress={() => router.replace('/goals')} variant="ghost" />{goal && result ? <ThemedView accessibilityLabel={`${goal.title}. ${Math.round(result.progress * 100)} percent complete`} style={[styles.card, { backgroundColor: surface, borderColor: border }]}><View style={[styles.icon, { backgroundColor: Palette.homeLightActionSoft }]}><Ionicons color={action} name="flag-outline" size={28} /></View><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">WEEKLY GOAL</ThemedText><ThemedText accessibilityRole="header" style={styles.title} type="subtitle">{goal.title}</ThemedText><View style={styles.metrics}><View style={styles.metric}><ThemedText themeColor="textSecondary" type="smallBold">PROGRESS</ThemedText><ThemedText style={styles.metricValue} type="subtitle">{formatGoalValue(goal, result.currentValue)}</ThemedText></View><View style={styles.metric}><ThemedText themeColor="textSecondary" type="smallBold">TARGET</ThemedText><ThemedText style={styles.metricValue} type="subtitle">{formatGoalValue(goal, goal.targetValue)}</ThemedText></View></View><View style={styles.progressHeader}><ThemedText themeColor="textSecondary" type="smallBold">COMPLETION</ThemedText><ThemedText style={{ color: action }} type="smallBold">{Math.round(result.progress * 100)}%</ThemedText></View><View style={[styles.track, { backgroundColor: Palette.homeLightActionSoft }]}><View style={[styles.fill, { backgroundColor: action, width: `${Math.round(result.progress * 100)}%` }]} /></View><ThemedText themeColor="textSecondary" type="small">Progress updates from completed focus sessions saved on this device.</ThemedText><Button accentColor={action} fullWidth label="Start a focus session" onPress={() => router.push('/focus/setup')} style={{ backgroundColor: action, borderColor: action }} /></ThemedView> : <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}><ThemedText accessibilityRole="header" type="subtitle">Goal unavailable</ThemedText><ThemedText themeColor="textSecondary">This goal could not be found on this device.</ThemedText></ThemedView>}</View></ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, content: { alignSelf: 'center', flex: 1, gap: Spacing.lg, justifyContent: 'center', maxWidth: 560, padding: Spacing.lg, width: '100%' }, card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, icon: { alignItems: 'center', borderRadius: 26, height: 52, justifyContent: 'center', width: 52 }, eyebrow: { letterSpacing: 1.2 }, title: { fontSize: 30, lineHeight: 38 }, metrics: { flexDirection: 'row', gap: Spacing.md }, metric: { flex: 1, gap: Spacing.xs }, metricValue: { fontSize: 22, lineHeight: 29 }, progressHeader: { flexDirection: 'row', justifyContent: 'space-between' }, track: { borderRadius: 999, height: 8, overflow: 'hidden' }, fill: { borderRadius: 999, height: '100%' } });
