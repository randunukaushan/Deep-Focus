import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { MaxContentWidth } from '@/constants/theme';
import { loadSessionHistory } from '@/features/focus/session-storage';
import { formatSessionDate, formatSessionDuration, getHistoricalSessions } from '@/features/focus/session-history';
import type { FocusSession } from '@/features/focus/session-types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function SessionDetailRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? theme.background : Palette.homeLightActionSoft;
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const [session, setSession] = useState<FocusSession | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    void loadSessionHistory().then((history) => {
      if (!active) return;
      setSession(getHistoricalSessions(history).find((item) => item.id === sessionId) ?? null);
      setLoading(false);
    });
    return () => { active = false; };
  }, [sessionId]));

  const cancelled = session?.status === 'cancelled';
  const progress = session ? Math.min(1, session.plannedDurationSeconds === 0 ? 0 : session.focusedDurationSeconds / session.plannedDurationSeconds) : 0;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={action} /> : session ? (
          <>
            <View style={styles.navigation}>
              <Button accentColor={action} label="Back to Session History" onPress={() => router.replace('/analytics/history')} variant="ghost" />
            </View>
            <View style={styles.titleBlock}><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">SESSION DETAIL</ThemedText><ThemedText accessibilityRole="header" type="title" style={styles.title}>{cancelled ? 'A block completed your way.' : 'A block worth remembering.'}</ThemedText><ThemedText themeColor="textSecondary">A quiet record of one protected focus block.</ThemedText></View>
            <ThemedView accessibilityLabel={`${cancelled ? 'Cancelled' : 'Completed'} session for ${session.taskName || 'Focus session'}`} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
              <View style={styles.detailTop}><View style={[styles.detailIcon, { backgroundColor: cancelled ? '#FFF1D6' : softAction }]}><Ionicons color={cancelled ? Palette.warning : action} name={cancelled ? 'close-circle-outline' : 'checkmark-circle-outline'} size={30} /></View><View style={[styles.statusPill, { backgroundColor: cancelled ? '#FFF1D6' : softAction, borderColor: cancelled ? Palette.warning : action }]}><ThemedText style={{ color: cancelled ? Palette.warning : action }} type="smallBold">{cancelled ? 'CANCELLED' : 'COMPLETED'}</ThemedText></View></View>
              <ThemedText type="subtitle" style={styles.taskTitle}>{session.taskName || 'Focus session'}</ThemedText>
              <View style={styles.detailDate}><Ionicons color={action} name="calendar-outline" size={18} /><ThemedText themeColor="textSecondary" type="small">{formatSessionDate(session)}</ThemedText></View>
              <View style={styles.detailGrid}>
                <View style={styles.detailMetric}><ThemedText themeColor="textSecondary" type="smallBold">FOCUSED</ThemedText><ThemedText style={styles.metricValue} type="subtitle">{formatSessionDuration(session.focusedDurationSeconds)}</ThemedText></View>
                <View style={styles.detailMetric}><ThemedText themeColor="textSecondary" type="smallBold">PLANNED</ThemedText><ThemedText style={styles.metricValue} type="subtitle">{formatSessionDuration(session.plannedDurationSeconds)}</ThemedText></View>
              </View>
              <View accessibilityLabel={`${Math.round(progress * 100)} percent of planned focus completed`} style={styles.progressBlock}><View style={styles.progressHeader}><ThemedText themeColor="textSecondary" type="smallBold">PROGRESS</ThemedText><ThemedText style={{ color: action }} type="smallBold">{Math.round(progress * 100)}%</ThemedText></View><View style={[styles.progressTrack, { backgroundColor: softAction }]}><View style={[styles.progressFill, { backgroundColor: action, width: `${Math.round(progress * 100)}%` }]} /></View></View>
            </ThemedView>
          </>
        ) : (
          <>
            <ThemedText accessibilityRole="header" type="subtitle">Session unavailable</ThemedText>
            <ThemedText themeColor="textSecondary">This session could not be found in local history.</ThemedText>
          </>
        )}
        {!loading && !session ? <Button accentColor={action} label="Back to Session History" onPress={() => router.replace('/analytics/history')} variant="secondary" /> : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignSelf: 'center', flex: 1, gap: Spacing.lg, justifyContent: 'center', maxWidth: MaxContentWidth, padding: Spacing.lg, width: '100%' },
  navigation: { alignItems: 'flex-start', marginLeft: -Spacing.md },
  titleBlock: { gap: Spacing.xs },
  eyebrow: { letterSpacing: 1.2 },
  title: { fontSize: 38, lineHeight: 44 },
  card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg },
  detailIcon: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  detailTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  statusPill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  taskTitle: { fontSize: 28, lineHeight: 36 },
  detailDate: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  detailGrid: { flexDirection: 'row', gap: Spacing.lg },
  detailMetric: { flex: 1, gap: Spacing.xs },
  metricValue: { fontSize: 24, lineHeight: 32 },
  progressBlock: { gap: Spacing.xs },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTrack: { borderRadius: 999, height: 8, overflow: 'hidden' },
  progressFill: { borderRadius: 999, height: '100%' },
});
