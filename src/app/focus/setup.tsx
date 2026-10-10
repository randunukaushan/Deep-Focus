import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing, Typography } from '@/theme/tokens';
import { loadTasks } from '@/features/tasks/task-storage';
import type { Task } from '@/features/tasks/task-types';
import { loadSettings } from '@/features/settings/settings-storage';
import { useAppLocale } from '@/features/localization/app-locale-context';

const PRESETS = [25, 45, 60] as const;
const MINUTES_MIN = 5;
const MINUTES_MAX = 180;

export default function SessionSetupRoute() {
  const router = useRouter();
  const { taskId: routeTaskId } = useLocalSearchParams<{ taskId?: string | string[] }>();
  const taskId = Array.isArray(routeTaskId) ? routeTaskId[0] : routeTaskId;
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const homeSurface = isDark ? theme.surface : Palette.homeLightSurface;
  const homeBorder = isDark ? theme.border : Palette.homeLightBorder;
  const homeAction = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const { copy } = useAppLocale();
  const text = copy.focus;
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState<number>(25);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState(false);
  const [customDuration, setCustomDuration] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [linkedTask, setLinkedTask] = useState<Task | null>(null);
  const [taskLoading, setTaskLoading] = useState(Boolean(taskId));
  const [taskError, setTaskError] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadSettings().then((settings) => {
      if (mounted) { setDuration(settings.defaultFocusDurationMinutes); setSettingsError(false); }
    }).catch(() => { if (mounted) setSettingsError(true); }).finally(() => { if (mounted) setSettingsLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!taskId) return;
    let mounted = true;
    void loadTasks().then((stored) => {
      if (!mounted) return;
      const match = stored.find((candidate) => candidate.id === taskId && !candidate.archivedAt && candidate.status !== 'completed' && candidate.status !== 'cancelled');
      if (match) { setLinkedTask(match); setTaskError(false); }
      else setTaskError(true);
    }).catch(() => { if (mounted) setTaskError(true); }).finally(() => { if (mounted) setTaskLoading(false); });
    return () => { mounted = false; };
  }, [taskId]);
  const custom = !PRESETS.includes(duration as (typeof PRESETS)[number]);
  const durationValue = custom ? Number(customDuration) : duration;
  const valid = Number.isInteger(durationValue) && durationValue >= MINUTES_MIN && durationValue <= MINUTES_MAX;

  function choosePreset(value: number) { setDuration(value); setCustomDuration(''); setSubmitted(false); }
  function start() {
    setSubmitted(true);
    if (!valid || settingsLoading || taskLoading || taskError || (taskId && !linkedTask)) return;
    router.push({ pathname: '/focus/session', params: { durationMinutes: String(durationValue), taskName: linkedTask?.title ?? taskName.trim(), ...(linkedTask ? { taskId: linkedTask.id } : {}) } });
  }

  return <ThemedView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}>
    <StatusBar style="auto" />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText accessibilityRole="header" type="subtitle">{text.setupTitle}</ThemedText>
            <ThemedText themeColor="textSecondary">{text.setupSubtitle}</ThemedText>
          </View>
          <View style={styles.group}>
            <ThemedText type="smallBold">{text.taskOptional}</ThemedText>
            {linkedTask ? <ThemedText accessibilityLabel={`${text.linkedTask}: ${linkedTask.title}`} type="subtitle">{linkedTask.title}</ThemedText> : <TextInput accessibilityLabel={text.taskOptional} autoCapitalize="sentences" maxLength={120} onChangeText={setTaskName} placeholder={text.taskPlaceholder} placeholderTextColor={theme.textMuted} style={[styles.input, { backgroundColor: homeSurface, borderColor: homeBorder, color: theme.text }]} value={taskName} />}
            {taskLoading ? <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">{text.taskLoading}</ThemedText> : null}
            {taskError ? <ThemedText accessibilityRole="alert" style={styles.error}>{text.taskUnavailable}</ThemedText> : null}
          </View>
          <View style={styles.group}>
            <ThemedText type="smallBold">{text.duration}</ThemedText>
            <View accessibilityRole="radiogroup" style={styles.options}>
              {PRESETS.map((value) => <Pressable accessibilityLabel={`${value} ${text.minutes}`} accessibilityRole="radio" accessibilityState={{ selected: duration === value }} key={value} onPress={() => choosePreset(value)} style={({ pressed }) => [styles.option, { borderColor: duration === value ? homeAction : homeBorder }, duration === value && { backgroundColor: homeAction }, pressed && styles.pressed]}><ThemedText style={duration === value ? styles.selected : undefined}>{value} {text.minutes}</ThemedText></Pressable>)}
              <Pressable accessibilityLabel={text.custom} accessibilityRole="radio" accessibilityState={{ selected: custom }} onPress={() => { setDuration(0); setSubmitted(false); }} style={({ pressed }) => [styles.option, { borderColor: custom ? homeAction : homeBorder }, custom && { backgroundColor: homeAction }, pressed && styles.pressed]}><ThemedText style={custom ? styles.selected : undefined}>{text.custom}</ThemedText></Pressable>
            </View>
            {custom ? <TextInput accessibilityLabel={`${text.custom} ${text.minutes}`} keyboardType="number-pad" maxLength={3} onChangeText={setCustomDuration} placeholder={text.minutes} placeholderTextColor={theme.textMuted} style={[styles.input, { backgroundColor: homeSurface, borderColor: homeBorder, color: theme.text }]} value={customDuration} /> : null}
            <ThemedText themeColor="textSecondary" type="small">{text.durationHint}</ThemedText>
            {settingsError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary">{text.settingsError}</ThemedText> : null}
            {submitted && !valid ? <ThemedText accessibilityLiveRegion="polite" style={styles.error}>{text.durationError}</ThemedText> : null}
          </View>
          <View style={styles.actions}>
            <Button accentColor={homeAction} accessibilityLabel={text.startSession} disabled={settingsLoading || taskLoading || taskError} fullWidth label={text.startSession} onPress={start} style={{ backgroundColor: homeAction, borderColor: homeAction }} />
            <Button accentColor={homeAction} fullWidth label={text.backHome} onPress={() => router.dismissTo('/(tabs)/home')} variant="secondary" />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, flex: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: Spacing.xl }, header: { gap: Spacing.sm }, group: { gap: Spacing.sm },
  input: { minHeight: 48, borderWidth: 1, borderRadius: Radius.card, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: Typography.body.fontSize },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }, option: { minHeight: 48, minWidth: 84, borderWidth: 1, borderRadius: Radius.card, paddingHorizontal: Spacing.md, justifyContent: 'center', alignItems: 'center' },
  selected: { color: Palette.deepNavy }, pressed: { opacity: 0.8 }, error: { color: Palette.error }, actions: { gap: Spacing.sm },
});
