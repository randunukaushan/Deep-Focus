import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { accentTextColor } from '@/theme/action-colors';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { loadSessionHistory } from '@/features/focus/session-storage';
import type { FocusSession } from '@/features/focus/session-types';
import { formatGoalValue, getGoalProgress } from '@/features/goals/goal-progress';
import { getDeviceTimeZone, getGoalPeriodRange } from '@/features/goals/goal-period';
import { readGoalData } from '@/features/goals/goal-read-state';
import { loadGoals, saveGoals } from '@/features/goals/goal-storage';
import type { Goal, GoalType } from '@/features/goals/goal-types';
import { createStableId } from '@/features/identity/stable-ids';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function GoalsRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = theme.primary;
  const onAction = accentTextColor(action);
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;
  const { copy } = useAppLocale();
  const text = copy.goals;
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const retryLoad = useRef<() => void>(() => {});
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('5');
  const [type, setType] = useState<GoalType>('session_count');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useFocusEffect(useCallback(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      const result = await readGoalData(loadGoals, loadSessionHistory);
      if (!mounted) return;
      if (result.status === 'error') {
        setLoadError(true);
      } else {
        setGoals(result.goals);
        setSessions(result.sessions);
      }
      setLoading(false);
    };
    retryLoad.current = () => { void load(); };
    void load();
    return () => { mounted = false; retryLoad.current = () => {}; };
  }, []));

  async function addGoal() {
    if (savingRef.current) return;
    const trimmed = title.trim();
    const inputValue = Number(target);
    const targetValue = type === 'focus_time' ? inputValue * 60 : inputValue;
    if (!trimmed || !Number.isSafeInteger(targetValue) || targetValue <= 0) {
      setSaveError(type === 'session_count' ? text.sessionError : text.focusError);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const now = new Date();
      const createdAt = now.toISOString();
      const periodTimeZone = getDeviceTimeZone();
      const range = getGoalPeriodRange('weekly', now.getTime(), periodTimeZone);
      const goal: Goal = {
        id: createStableId(),
        title: trimmed, type, period: 'weekly', status: 'active', targetValue,
        ...range, legacyOpenPeriod: false, createdAt, updatedAt: createdAt,
      };
      const next = [goal, ...goals];
      await saveGoals(next);
      setGoals(next); setTitle(''); setTarget('5'); setSaveError(null); setShowComposer(false);
    } catch {
    setSaveError(text.saveError);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  if (loading || loadError) return <SafeAreaView style={[styles.screen, { backgroundColor: background }]}><ScrollView contentContainerStyle={styles.scroll}><View style={styles.content}>
    {loading ? <View accessibilityLabel={text.loading} accessibilityLiveRegion="polite" style={styles.loading}><ActivityIndicator color={action} /></View> : <ThemedView accessibilityRole="alert" style={[styles.loadError, { backgroundColor: surface, borderColor: border }]}><ThemedText type="subtitle">{text.loadErrorTitle}</ThemedText><ThemedText themeColor="textSecondary">{text.loadErrorBody}</ThemedText><Button label={text.retry} onPress={() => retryLoad.current()} /></ThemedView>}
  </View></ScrollView></SafeAreaView>;

  return <SafeAreaView style={[styles.screen, { backgroundColor: background }]}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}><View style={styles.content}>
    <SectionHeading eyebrow={text.eyebrow} icon="flag-outline" title={text.title} subtitle={text.subtitle} />
    {!showComposer ? <Button accentColor={action} fullWidth label={text.create} onPress={() => { setSaveError(null); setShowComposer(true); }} style={{ backgroundColor: action, borderColor: action }} /> : <ThemedView style={[styles.composer, { backgroundColor: surface, borderColor: border }]}><ThemedText type="smallBold">{text.newWeekly}</ThemedText><ThemedText type="smallBold">{text.titleLabel}</ThemedText><TextInput accessibilityLabel={text.titleLabel} autoFocus editable={!saving} onChangeText={(value) => { setTitle(value); setSaveError(null); }} placeholder={text.titlePlaceholder} placeholderTextColor={theme.textMuted} style={[styles.input, { borderColor: border, color: theme.text }]} value={title} /><View accessibilityRole="radiogroup" style={styles.typeRow}>{(['session_count', 'focus_time'] as const).map((value) => <Pressable accessibilityLabel={value === 'session_count' ? text.sessions : text.focusMinutes} accessibilityRole="radio" accessibilityState={{ selected: type === value, checked: type === value, disabled: saving }} disabled={saving} key={value} onPress={() => { setType(value); setTarget(value === 'session_count' ? '5' : '120'); setSaveError(null); }} style={[styles.typeChip, { backgroundColor: type === value ? action : 'transparent', borderColor: type === value ? action : border }]}><ThemedText style={type === value ? { color: onAction } : undefined} type="smallBold">{value === 'session_count' ? text.sessions : text.focusMinutes}</ThemedText></Pressable>)}</View><ThemedText type="smallBold">{type === 'session_count' ? text.sessions : text.focusMinutes}</ThemedText><TextInput accessibilityLabel={type === 'session_count' ? text.sessions : text.focusMinutes} editable={!saving} keyboardType="number-pad" onChangeText={(value) => { setTarget(value); setSaveError(null); }} placeholder={text.target} placeholderTextColor={theme.textMuted} style={[styles.input, { borderColor: border, color: theme.text }]} value={target} />{saveError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary">{saveError}</ThemedText> : null}<View style={styles.actions}><Button accentColor={action} label={text.save} loading={saving} onPress={() => void addGoal()} style={{ backgroundColor: action, borderColor: action }} /><Button disabled={saving} label={text.cancel} onPress={() => { setShowComposer(false); setSaveError(null); }} variant="ghost" /></View></ThemedView>}
    <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">{text.yourGoals}</ThemedText>{goals.length === 0 ? <ThemedView accessibilityLabel={text.emptyLabel} style={[styles.empty, { backgroundColor: surface, borderColor: border }]}><Ionicons color={action} name="flag-outline" size={25} /><ThemedText style={styles.emptyText} themeColor="textSecondary">{text.empty}</ThemedText></ThemedView> : goals.map((goal) => { const result = getGoalProgress(goal, sessions); const statusLabel = goal.status === 'active' ? (goal.period === 'weekly' ? text.weekly : text.monthly) : text[goal.status]; return <Pressable accessibilityLabel={`${goal.title}. ${statusLabel}. ${Math.round(result.progress * 100)} ${text.percentComplete}`} accessibilityRole="button" key={goal.id} onPress={() => router.push({ pathname: '/goals/[goalId]', params: { goalId: goal.id, goalTitle: goal.title } })} style={({ pressed }) => [styles.goalCard, { backgroundColor: surface, borderColor: border }, pressed && styles.pressed]}><View style={styles.goalTop}><View style={[styles.goalIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="flag-outline" size={22} /></View><ThemedText style={{ color: action }} type="smallBold">{statusLabel}</ThemedText></View><ThemedText type="subtitle" style={styles.goalTitle}>{goal.title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{formatGoalValue(goal, result.currentValue)} {text.of} {formatGoalValue(goal, goal.targetValue)}</ThemedText><View style={[styles.track, { backgroundColor: softAction }]}><View style={[styles.fill, { backgroundColor: action, width: `${Math.round(result.progress * 100)}%` }]} /></View></Pressable>; })}</View>
  </View></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' }, loading: { alignItems: 'center', minHeight: 180, justifyContent: 'center' }, loadError: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, composer: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, input: { borderRadius: Radius.card, borderWidth: 1, fontSize: 16, minHeight: 52, paddingHorizontal: Spacing.md }, typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }, typeChip: { alignItems: 'center', borderRadius: 999, borderWidth: 1, minHeight: 44, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }, section: { gap: Spacing.sm }, sectionLabel: { letterSpacing: 1.1 }, empty: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg }, emptyText: { flex: 1, minWidth: 0 }, goalCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.sm, padding: Spacing.lg }, goalTop: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'space-between' }, goalIcon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 }, goalTitle: { flexShrink: 1, fontSize: 25, lineHeight: 32 }, track: { borderRadius: 999, height: 8, overflow: 'hidden' }, fill: { borderRadius: 999, height: '100%' }, pressed: { opacity: 0.78 } });
