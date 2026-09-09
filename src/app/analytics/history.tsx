import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { MaxContentWidth } from '@/constants/theme';
import { formatSessionDate, formatSessionDuration, getHistoricalSessions } from '@/features/focus/session-history';
import { loadSessionHistory } from '@/features/focus/session-storage';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function SessionHistoryRoute() {
  const router = useRouter();
  const theme = useTheme();
  const [sessions, setSessions] = useState<ReturnType<typeof getHistoricalSessions>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const filteredSessions = filter === 'all' ? sessions : sessions.filter((session) => session.status === filter);
  const completedSessions = sessions.filter((session) => session.status === 'completed');
  const totalFocusedSeconds = completedSessions.reduce((total, session) => total + session.focusedDurationSeconds, 0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    void loadSessionHistory().then((history) => {
      if (!active) return;
      setSessions(getHistoricalSessions(history));
      setLoading(false);
    });
    return () => { active = false; };
  }, []));

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.navigation}>
            <Button label="Back to Analytics" onPress={() => router.replace('/analytics')} variant="ghost" />
          </View>
          <View style={styles.titleBlock}>
            <ThemedText accessibilityRole="header" type="subtitle">Session History</ThemedText>
            <ThemedText themeColor="textSecondary">A quiet record of the time you chose to protect.</ThemedText>
          </View>
          {loading ? (
            <View accessibilityLabel="Loading session history" style={styles.state}><ActivityIndicator color={Palette.mintPrimary} /></View>
          ) : sessions.length === 0 ? (
            <ThemedView accessibilityLabel="No focus sessions recorded yet" style={styles.emptyCard} type="surface">
              <ThemedText type="smallBold">NO SESSIONS YET</ThemedText>
              <ThemedText themeColor="textSecondary">Completed focus sessions will appear here.</ThemedText>
              <Button label="Start Focus Session" onPress={() => router.push('/focus/setup')} />
            </ThemedView>
          ) : (
            <>
              <ThemedView accessibilityLabel={`${formatSessionDuration(totalFocusedSeconds)} focused across ${completedSessions.length} completed sessions`} style={styles.summaryCard}>
                <View style={styles.summaryIcon}><Ionicons color={Palette.deepNavy} name="time-outline" size={22} /></View>
                <View style={styles.summaryMetric}>
                  <ThemedText style={styles.summaryLabel} type="smallBold">FOCUS TIME</ThemedText>
                  <ThemedText style={styles.summaryValue} type="subtitle">{formatSessionDuration(totalFocusedSeconds)}</ThemedText>
                </View>
                <View style={styles.summaryMetric}>
                  <ThemedText style={styles.summaryLabel} type="smallBold">COMPLETED</ThemedText>
                  <ThemedText style={styles.summaryValue} type="subtitle">{completedSessions.length}</ThemedText>
                </View>
              </ThemedView>
              <ScrollView contentContainerStyle={styles.filters} horizontal showsHorizontalScrollIndicator={false}>
                {(['all', 'completed', 'cancelled'] as const).map((value) => {
                  const selected = filter === value;
                  const label = value === 'all' ? 'All sessions' : value === 'completed' ? 'Completed' : 'Cancelled';
                  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} key={value} onPress={() => setFilter(value)} style={[styles.filterChip, { backgroundColor: selected ? Palette.deepNavy : theme.surface, borderColor: selected ? Palette.deepNavy : theme.border }]}><ThemedText style={{ color: selected ? Palette.lightSurface : theme.text }} type="smallBold">{label}</ThemedText></Pressable>;
                })}
              </ScrollView>
              {filteredSessions.length === 0 ? (
                <ThemedView accessibilityLabel={`No ${filter} sessions`} style={styles.emptyFilterCard} type="surface">
                  <ThemedText type="smallBold">NO MATCHING SESSIONS</ThemedText>
                  <ThemedText themeColor="textSecondary">Try another filter to review your focus history.</ThemedText>
                </ThemedView>
              ) : <View accessibilityLabel={`${filteredSessions.length} focus sessions`} style={styles.list}>
              <ThemedText style={styles.sectionLabel} type="smallBold">RECENT SESSIONS</ThemedText>
              {filteredSessions.map((session) => {
                const cancelled = session.status === 'cancelled';
                return (
                  <Pressable
                    accessibilityHint="Open session details"
                    accessibilityLabel={`${session.taskName || 'Focus session'}, ${formatSessionDuration(session.focusedDurationSeconds)}, ${cancelled ? 'cancelled' : 'completed'}`}
                    accessibilityRole="button"
                    key={session.id}
                    onPress={() => router.push({ pathname: '/analytics/history/[sessionId]', params: { sessionId: session.id } })}
                    style={({ pressed }) => [styles.sessionCard, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}>
                    <View style={styles.sessionIcon}><Ionicons color={cancelled ? Palette.warning : Palette.success} name={cancelled ? 'close-circle-outline' : 'checkmark-circle-outline'} size={22} /></View>
                    <View style={styles.sessionBody}>
                      <View style={styles.sessionHeader}>
                        <ThemedText numberOfLines={1} style={styles.sessionTitle}>{session.taskName || 'Focus session'}</ThemedText>
                        <View style={[styles.statusPill, { backgroundColor: cancelled ? theme.background : Palette.mintPrimary, borderColor: cancelled ? Palette.warning : Palette.mintPrimary }]}><ThemedText style={{ color: cancelled ? Palette.warning : Palette.deepNavy }} type="smallBold">{cancelled ? 'CANCELLED' : 'COMPLETED'}</ThemedText></View>
                      </View>
                      <View style={styles.sessionMeta}>
                        <ThemedText type="smallBold">{formatSessionDuration(session.focusedDurationSeconds)} focused</ThemedText>
                        <ThemedText themeColor="textSecondary" type="small">of {formatSessionDuration(session.plannedDurationSeconds)}</ThemedText>
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
  emptyCard: { borderRadius: Radius.card, gap: Spacing.md, padding: Spacing.lg },
  summaryCard: { alignItems: 'center', backgroundColor: Palette.deepNavy, borderRadius: Radius.card, flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg },
  summaryIcon: { alignItems: 'center', backgroundColor: Palette.mintPrimary, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  summaryMetric: { flex: 1, gap: Spacing.xs },
  summaryLabel: { color: Palette.darkTextSecondary },
  summaryValue: { color: Palette.darkTextPrimary },
  filters: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  filterChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  emptyFilterCard: { borderRadius: Radius.card, gap: Spacing.sm, padding: Spacing.lg },
  list: { gap: Spacing.sm },
  sectionLabel: { color: Palette.mintPrimary, letterSpacing: 1.1, marginTop: Spacing.sm },
  sessionCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg },
  sessionIcon: { alignItems: 'center', height: 32, justifyContent: 'center', width: 32 },
  sessionBody: { flex: 1, gap: Spacing.xs },
  sessionHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm, justifyContent: 'space-between' },
  statusPill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  sessionMeta: { alignItems: 'baseline', flexDirection: 'row', gap: Spacing.xs },
  sessionTitle: { flex: 1 },
  pressed: { opacity: 0.8 },
});
