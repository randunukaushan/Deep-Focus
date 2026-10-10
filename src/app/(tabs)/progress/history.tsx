import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { MaxContentWidth } from '@/constants/theme';
import { formatSessionDate, formatSessionDuration, getHistoricalSessions } from '@/features/focus/session-history';
import { loadSessionHistory } from '@/features/focus/session-storage';
import { readProgressHistory } from '@/features/progress/progress-state';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function SessionHistoryRoute() {
  const router = useRouter();
  const { copy } = useAppLocale();
  const text = copy.historyPage;
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? theme.background : Palette.homeLightActionSoft;
  const [sessions, setSessions] = useState<ReturnType<typeof getHistoricalSessions>>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const retryLoad = useRef<() => void>(() => {});
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const filteredSessions = filter === 'all' ? sessions : sessions.filter((session) => session.status === filter);
  const completedSessions = sessions.filter((session) => session.status === 'completed');
  const totalFocusedSeconds = completedSessions.reduce((total, session) => total + session.focusedDurationSeconds, 0);

  useFocusEffect(useCallback(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      const result = await readProgressHistory(loadSessionHistory);
      if (!active) return;
      if (result.status === 'error') setLoadError(true);
      else setSessions(getHistoricalSessions(result.sessions));
      setLoading(false);
    };
    retryLoad.current = () => { void load(); };
    void load();
    return () => { active = false; retryLoad.current = () => {}; };
  }, []));

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.navigation}>
              <Button accentColor={action} label={text.back} onPress={() => router.replace('/progress')} variant="ghost" />
          </View>
          <View style={styles.titleBlock}>
            <ThemedText accessibilityRole="header" type="subtitle">{text.title}</ThemedText>
            <ThemedText themeColor="textSecondary">{text.subtitle}</ThemedText>
          </View>
          {loading ? (
            <View accessibilityLabel={text.loading} style={styles.state}><ActivityIndicator color={Palette.mintPrimary} /></View>
          ) : loadError ? (
            <ThemedView accessibilityRole="alert" style={[styles.emptyCard, { backgroundColor: surface, borderColor: border }]}>
              <ThemedText accessibilityRole="header" type="smallBold">{text.loadErrorTitle}</ThemedText>
              <ThemedText themeColor="textSecondary">{text.loadErrorDetail}</ThemedText>
              <Button accentColor={action} label={text.retry} onPress={() => retryLoad.current()} />
            </ThemedView>
          ) : sessions.length === 0 ? (
            <ThemedView accessibilityLabel={text.noSessionsLabel} style={[styles.emptyCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={[styles.emptyIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="time-outline" size={26} /></View>
              <ThemedText type="smallBold">{text.noSessionsTitle}</ThemedText>
              <ThemedText themeColor="textSecondary">{text.noSessionsDetail}</ThemedText>
              <Button accentColor={action} label={text.startFocus} onPress={() => router.push('/focus/setup')} style={{ backgroundColor: action, borderColor: action }} />
            </ThemedView>
          ) : (
            <>
              <ThemedView accessibilityLabel={`${formatSessionDuration(totalFocusedSeconds)} ${text.focusTime}, ${completedSessions.length} ${text.focusSession}`} style={styles.summaryCard}>
                <View style={styles.summaryIcon}><Ionicons color={Palette.deepNavy} name="time-outline" size={22} /></View>
                <View style={styles.summaryMetric}>
                  <ThemedText style={styles.summaryLabel} type="smallBold">{text.focusTime}</ThemedText>
                  <ThemedText style={styles.summaryValue} type="subtitle">{formatSessionDuration(totalFocusedSeconds)}</ThemedText>
                </View>
                <View style={styles.summaryMetric}>
                  <ThemedText style={styles.summaryLabel} type="smallBold">{text.completed}</ThemedText>
                  <ThemedText style={styles.summaryValue} type="subtitle">{completedSessions.length}</ThemedText>
                </View>
              </ThemedView>
              <ScrollView contentContainerStyle={styles.filters} horizontal showsHorizontalScrollIndicator={false}>
                {(['all', 'completed', 'cancelled'] as const).map((value) => {
                  const selected = filter === value;
                  const label = value === 'all' ? text.allSessions : value === 'completed' ? text.completedFilter : text.cancelledFilter;
                  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} key={value} onPress={() => setFilter(value)} style={[styles.filterChip, { backgroundColor: selected ? action : surface, borderColor: selected ? action : border }]}><ThemedText style={{ color: selected ? Palette.deepNavy : theme.text }} type="smallBold">{label}</ThemedText></Pressable>;
                })}
              </ScrollView>
              {filteredSessions.length === 0 ? (
              <ThemedView accessibilityLabel={text.noMatchingTitle} style={[styles.emptyFilterCard, { backgroundColor: surface, borderColor: border }]}>
                  <ThemedText type="smallBold">{text.noMatchingTitle}</ThemedText>
                  <ThemedText themeColor="textSecondary">{text.noMatchingDetail}</ThemedText>
                </ThemedView>
              ) : <View accessibilityLabel={`${filteredSessions.length} ${text.focusSession}`} style={styles.list}>
              <ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">{text.recent}</ThemedText>
              {filteredSessions.map((session) => {
                const cancelled = session.status === 'cancelled';
                return (
                  <Pressable
                    accessibilityHint={text.openDetailsHint}
                    accessibilityLabel={`${session.taskName || text.focusSession}, ${formatSessionDuration(session.focusedDurationSeconds)}, ${cancelled ? text.cancelled.toLowerCase() : text.completedStatus.toLowerCase()}`}
                    accessibilityRole="button"
                    key={session.id}
                    onPress={() => router.push({ pathname: '/progress/history/[sessionId]', params: { sessionId: session.id } })}
                    style={({ pressed }) => [styles.sessionCard, { backgroundColor: surface, borderColor: border }, pressed && styles.pressed]}>
                    <View style={styles.sessionIcon}><Ionicons color={cancelled ? Palette.warning : Palette.success} name={cancelled ? 'close-circle-outline' : 'checkmark-circle-outline'} size={22} /></View>
                    <View style={styles.sessionBody}>
                      <View style={styles.sessionHeader}>
                        <ThemedText numberOfLines={1} style={styles.sessionTitle}>{session.taskName || text.focusSession}</ThemedText>
                        <View style={[styles.statusPill, { backgroundColor: cancelled ? theme.background : Palette.mintPrimary, borderColor: cancelled ? Palette.warning : Palette.mintPrimary }]}><ThemedText style={{ color: cancelled ? Palette.warning : Palette.deepNavy }} type="smallBold">{cancelled ? text.cancelled : text.completedStatus}</ThemedText></View>
                      </View>
                      <View style={styles.sessionMeta}>
                        <ThemedText type="smallBold">{formatSessionDuration(session.focusedDurationSeconds)} {text.focused}</ThemedText>
                        <ThemedText themeColor="textSecondary" type="small">{text.of} {formatSessionDuration(session.plannedDurationSeconds)}</ThemedText>
                      </View>
                      <ThemedText themeColor="textSecondary" type="small">{formatSessionDate(session)}</ThemedText>
                    </View>
                    <Ionicons color={theme.textMuted} name="chevron-forward" size={18} />
                  </Pressable>
                );
              })}
              </View>}
            </>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', padding: Spacing.lg },
  content: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.md },
  navigation: { alignItems: 'flex-start', marginLeft: -Spacing.md },
  titleBlock: { gap: Spacing.xs },
  state: { alignItems: 'center', minHeight: 120, justifyContent: 'center' },
  emptyCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg },
  emptyIcon: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  summaryCard: { alignItems: 'center', backgroundColor: Palette.deepNavy, borderRadius: Radius.card, flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg },
  summaryIcon: { alignItems: 'center', backgroundColor: Palette.mintPrimary, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  summaryMetric: { flex: 1, gap: Spacing.xs },
  summaryLabel: { color: Palette.darkTextSecondary },
  summaryValue: { color: Palette.darkTextPrimary },
  filters: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  filterChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  emptyFilterCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.sm, padding: Spacing.lg },
  list: { gap: Spacing.sm },
  sectionLabel: { letterSpacing: 1.1, marginTop: Spacing.sm },
  sessionCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg },
  sessionIcon: { alignItems: 'center', height: 32, justifyContent: 'center', width: 32 },
  sessionBody: { flex: 1, gap: Spacing.xs },
  sessionHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm, justifyContent: 'space-between' },
  statusPill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  sessionMeta: { alignItems: 'baseline', flexDirection: 'row', gap: Spacing.xs },
  sessionTitle: { flex: 1 },
  pressed: { opacity: 0.8 },
});
