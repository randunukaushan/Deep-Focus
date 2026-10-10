import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { loadSessionHistory } from '@/features/focus/session-storage';
import type { FocusSession } from '@/features/focus/session-types';
import { formatGoalValue, getGoalProgress } from '@/features/goals/goal-progress';
import { readGoalData } from '@/features/goals/goal-read-state';
import { deleteGoal, loadGoals, updateGoalDefinition } from '@/features/goals/goal-storage';
import type { Goal } from '@/features/goals/goal-types';
import { getGoalDetailCopy } from '@/features/localization/goal-detail-copy';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function GoalDetailRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const { locale } = useAppLocale();
  const text = getGoalDetailCopy(locale);
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const { goalId } = useLocalSearchParams<{ goalId?: string | string[] }>();
  const normalizedId = Array.isArray(goalId) ? goalId[0] : goalId;
  const [goal, setGoal] = useState<Goal | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftTarget, setDraftTarget] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const retryLoad = useRef<() => void>(() => {});
  const savingRef = useRef(false);
  const originalTarget = useRef('');

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
        setGoal(result.goals.find((item) => item.id === normalizedId) ?? null);
        setSessions(result.sessions);
      }
      setLoading(false);
    };
    retryLoad.current = () => { void load(); };
    void load();
    return () => { mounted = false; retryLoad.current = () => {}; };
  }, [normalizedId]));

  function beginEdit() {
    if (!goal || goal.status !== 'active' || goal.legacyOpenPeriod) return;
    const target = goal.type === 'focus_time' ? String(goal.targetValue / 60) : String(goal.targetValue);
    originalTarget.current = target;
    setDraftTitle(goal.title);
    setDraftTarget(target);
    setSaveError(null);
    setEditing(true);
  }

  async function saveDefinition() {
    if (!goal || savingRef.current || goal.status !== 'active' || goal.legacyOpenPeriod) return;
    const title = draftTitle.trim();
    const enteredTarget = Number(draftTarget);
    const targetValue = goal.type === 'focus_time'
      ? draftTarget === originalTarget.current ? goal.targetValue : Math.round(enteredTarget * 60)
      : enteredTarget;
    if (!title || !Number.isSafeInteger(targetValue) || targetValue <= 0) {
      setSaveError(goal.type === 'session_count' ? text.invalidSessions : text.invalidMinutes);
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const updatedGoal = await updateGoalDefinition(goal.id, goal.updatedAt, title, targetValue);
      if (!updatedGoal) {
        setSaveError(text.conflictSave);
        return;
      }
      setGoal(updatedGoal);
      setEditing(false);
    } catch {
      setSaveError(text.saveError);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function reloadGoal() {
    retryLoad.current();
    setEditing(false);
    setConfirmDelete(false);
    setSaveError(null);
  }

  async function confirmGoalDeletion() {
    if (!goal || savingRef.current || goal.legacyOpenPeriod) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const deleted = await deleteGoal(goal.id, goal.updatedAt);
      if (!deleted) {
        setSaveError(text.conflictDelete);
        return;
      }
      setConfirmDelete(false);
      router.replace('/goals');
    } catch {
      setSaveError(text.deleteError);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  const result = goal ? getGoalProgress(goal, sessions) : null;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}>
      <View style={styles.content}>
        <Button accentColor={action} label={text.back} onPress={() => router.replace('/goals')} variant="ghost" />
        {loading ? <View accessibilityLabel={text.loading} accessibilityLiveRegion="polite" style={styles.loading}><ActivityIndicator color={action} /></View>
          : loadError ? <ThemedView accessibilityRole="alert" style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText accessibilityRole="header" type="subtitle">{text.loadErrorTitle}</ThemedText>
            <ThemedText themeColor="textSecondary">{text.loadErrorDetail}</ThemedText>
            <Button label={text.retryLoad} onPress={() => retryLoad.current()} />
          </ThemedView>
            : goal && result ? <ThemedView accessibilityLabel={`${goal.title}. ${Math.round(result.progress * 100)} percent complete`} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
              <View style={[styles.icon, { backgroundColor: Palette.homeLightActionSoft }]}><Ionicons color={action} name="flag-outline" size={28} /></View>
              <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{goal.period.toUpperCase()} {text.goalSuffix}</ThemedText>
              {editing ? <>
                <TextInput accessibilityLabel={text.titleLabel} editable={!saving} onChangeText={setDraftTitle} returnKeyType="next" value={draftTitle} style={[styles.titleInput, { borderColor: border, color: theme.text }]} />
                <ThemedText themeColor="textSecondary" type="small">{goal.type === 'session_count' ? text.sessionTarget : text.focusTarget}</ThemedText>
                <TextInput accessibilityLabel={goal.type === 'session_count' ? text.targetSessions : text.targetMinutes} editable={!saving} keyboardType={goal.type === 'session_count' ? 'number-pad' : 'decimal-pad'} onChangeText={setDraftTarget} value={draftTarget} style={[styles.input, { borderColor: border, color: theme.text }]} />
                {saveError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary">{saveError}</ThemedText> : null}
                <View style={styles.actions}>
                  <Button accentColor={action} fullWidth label={text.save} loading={saving} onPress={() => void saveDefinition()} style={{ backgroundColor: action, borderColor: action }} />
                  <Button disabled={saving} fullWidth label={text.cancel} onPress={() => { setEditing(false); setSaveError(null); }} variant="ghost" />
                  {saveError === text.conflictSave ? <Button disabled={saving} fullWidth label={text.reload} onPress={reloadGoal} variant="secondary" /> : null}
                </View>
              </> : <>
                <ThemedText accessibilityRole="header" style={styles.title} type="subtitle">{goal.title}</ThemedText>
                {goal.status === 'completed' ? <ThemedText accessibilityLabel={text.completed} themeColor="textSecondary">{text.completedDetail}</ThemedText> : goal.status !== 'active' ? <ThemedText accessibilityLabel={`${text.statusDetail} ${goal.status}`} themeColor="textSecondary">{text.statusDetail} {goal.status}.</ThemedText> : null}
                <View style={styles.metrics}>
                  <View style={styles.metric}><ThemedText themeColor="textSecondary" type="smallBold">{text.progress}</ThemedText><ThemedText style={styles.metricValue} type="subtitle">{formatGoalValue(goal, result.currentValue)}</ThemedText></View>
                  <View style={styles.metric}><ThemedText themeColor="textSecondary" type="smallBold">{text.target}</ThemedText><ThemedText style={styles.metricValue} type="subtitle">{formatGoalValue(goal, goal.targetValue)}</ThemedText></View>
                </View>
                <View style={styles.progressHeader}><ThemedText themeColor="textSecondary" type="smallBold">{text.completion}</ThemedText><ThemedText style={{ color: action }} type="smallBold">{Math.round(result.progress * 100)}%</ThemedText></View>
                <View style={[styles.track, { backgroundColor: Palette.homeLightActionSoft }]}><View style={[styles.fill, { backgroundColor: action, width: `${Math.round(result.progress * 100)}%` }]} /></View>
                <ThemedText themeColor="textSecondary" type="small">{text.progressDetail}</ThemedText>
                {goal.status === 'active' && !goal.legacyOpenPeriod ? <Button accentColor={action} fullWidth label={text.edit} onPress={beginEdit} variant="secondary" /> : null}
                {!goal.legacyOpenPeriod ? <>
                  {confirmDelete ? <ThemedView accessibilityRole="alert" style={[styles.confirmCard, { borderColor: border }]}>
                    <ThemedText type="smallBold">{text.deleteConfirmTitle}</ThemedText>
                    <ThemedText themeColor="textSecondary">{text.deleteDetail}</ThemedText>
                    {saveError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary">{saveError}</ThemedText> : null}
                    <Button accentColor={action} disabled={saving} fullWidth label={text.deleteAndKeepTasks} loading={saving} onPress={() => void confirmGoalDeletion()} style={{ backgroundColor: action, borderColor: action }} />
                    <Button disabled={saving} fullWidth label={text.keepGoal} onPress={() => { setConfirmDelete(false); setSaveError(null); }} variant="ghost" />
                    {saveError === text.conflictDelete ? <Button disabled={saving} fullWidth label={text.reload} onPress={reloadGoal} variant="secondary" /> : null}
                  </ThemedView> : <Button accentColor={action} fullWidth label={text.delete} onPress={() => { setConfirmDelete(true); setSaveError(null); }} variant="ghost" />}
                </> : null}
                <Button accentColor={action} fullWidth label={text.startFocus} onPress={() => router.push('/focus/setup')} style={{ backgroundColor: action, borderColor: action }} />
              </>}
            </ThemedView>
              : <ThemedView accessibilityRole="alert" style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
                <ThemedText accessibilityRole="header" type="subtitle">{text.unavailable}</ThemedText>
                <ThemedText themeColor="textSecondary">{text.unavailableDetail}</ThemedText>
              </ThemedView>}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, content: { alignSelf: 'center', flex: 1, gap: Spacing.lg, justifyContent: 'center', maxWidth: 560, padding: Spacing.lg, width: '100%' },
  loading: { alignItems: 'center', minHeight: 180, justifyContent: 'center' }, card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg },
  icon: { alignItems: 'center', borderRadius: 26, height: 52, justifyContent: 'center', width: 52 }, eyebrow: { letterSpacing: 1.2 }, title: { fontSize: 30, lineHeight: 38 },
  titleInput: { borderWidth: 1, borderRadius: Radius.card, fontSize: 22, minHeight: 52, paddingHorizontal: Spacing.md }, input: { borderWidth: 1, borderRadius: Radius.card, fontSize: 18, minHeight: 48, paddingHorizontal: Spacing.md },
  metrics: { flexDirection: 'row', gap: Spacing.md }, metric: { flex: 1, gap: Spacing.xs }, metricValue: { fontSize: 22, lineHeight: 29 }, progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { borderRadius: 999, height: 8, overflow: 'hidden' }, fill: { borderRadius: 999, height: '100%' }, actions: { gap: Spacing.sm },
  confirmCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.sm, padding: Spacing.md },
});
