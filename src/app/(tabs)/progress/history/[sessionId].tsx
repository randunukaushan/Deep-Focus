import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { MaxContentWidth } from '@/constants/theme';
import { loadSessionHistory } from '@/features/focus/session-storage';
import { readProgressHistory } from '@/features/progress/progress-state';
import { formatSessionDate, formatSessionDuration, getHistoricalSessions } from '@/features/focus/session-history';
import type { FocusSession } from '@/features/focus/session-types';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function SessionDetailRoute() {
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
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const [session, setSession] = useState<FocusSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const retryLoad = useRef<() => void>(() => {});

  useFocusEffect(useCallback(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      const result = await readProgressHistory(loadSessionHistory);
      if (!active) return;
      if (result.status === 'error') setLoadError(true);
      else setSession(getHistoricalSessions(result.sessions).find((item) => item.id === sessionId) ?? null);
      setLoading(false);
    };
    retryLoad.current = () => { void load(); };
    void load();
    return () => { active = false; retryLoad.current = () => {}; };
  }, [sessionId]));

  const cancelled = session?.status === 'cancelled';
  const progress = session ? Math.min(1, session.plannedDurationSeconds === 0 ? 0 : session.focusedDurationSeconds / session.plannedDurationSeconds) : 0;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator accessibilityLabel={text.detailLoading} color={action} /> : loadError ? (
          <ThemedView accessibilityRole="alert" style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText accessibilityRole="header" type="subtitle">{text.detailLoadErrorTitle}</ThemedText>
            <ThemedText themeColor="textSecondary">{text.detailLoadErrorDetail}</ThemedText>
            <Button label={text.detailRetry} onPress={() => retryLoad.current()} />
            <Button accentColor={action} label={text.back} onPress={() => router.replace('/progress/history')} variant="secondary" />
          </ThemedView>
        ) : session ? (
          <>
            <View style={styles.navigation}>
              <Button accentColor={action} label={text.back} onPress={() => router.replace('/progress/history')} variant="ghost" />
            </View>
            <View style={styles.titleBlock}><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{text.detailEyebrow}</ThemedText><ThemedText accessibilityRole="header" type="title" style={styles.title}>{cancelled ? text.detailCancelledTitle : text.detailCompletedTitle}</ThemedText><ThemedText themeColor="textSecondary">{text.detailSubtitle}</ThemedText></View>
            <ThemedView accessibilityLabel={`${cancelled ? text.cancelled : text.completedStatus} ${text.focusSession}: ${session.taskName || text.focusSession}`} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
              <View style={styles.detailTop}><View style={[styles.detailIcon, { backgroundColor: cancelled ? '#FFF1D6' : softAction }]}><Ionicons color={cancelled ? Palette.warning : action} name={cancelled ? 'close-circle-outline' : 'checkmark-circle-outline'} size={30} /></View><View style={[styles.statusPill, { backgroundColor: cancelled ? '#FFF1D6' : softAction, borderColor: cancelled ? Palette.warning : action }]}><ThemedText style={{ color: cancelled ? Palette.warning : action }} type="smallBold">{cancelled ? text.cancelled : text.completedStatus}</ThemedText></View></View>
              <ThemedText type="subtitle" style={styles.taskTitle}>{session.taskName || text.focusSession}</ThemedText>
              <View style={styles.detailDate}><Ionicons color={action} name="calendar-outline" size={18} /><ThemedText themeColor="textSecondary" type="small">{formatSessionDate(session)}</ThemedText></View>
              <View style={styles.detailGrid}>
                <View style={styles.detailMetric}><ThemedText themeColor="textSecondary" type="smallBold">{text.focusedLabel}</ThemedText><ThemedText style={styles.metricValue} type="subtitle">{formatSessionDuration(session.focusedDurationSeconds)}</ThemedText></View>
                <View style={styles.detailMetric}><ThemedText themeColor="textSecondary" type="smallBold">{text.plannedLabel}</ThemedText><ThemedText style={styles.metricValue} type="subtitle">{formatSessionDuration(session.plannedDurationSeconds)}</ThemedText></View>
              </View>
              <View accessibilityLabel={`${Math.round(progress * 100)}% ${text.progressAccessibility}`} style={styles.progressBlock}><View style={styles.progressHeader}><ThemedText themeColor="textSecondary" type="smallBold">{text.progressLabel}</ThemedText><ThemedText style={{ color: action }} type="smallBold">{Math.round(progress * 100)}%</ThemedText></View><View style={[styles.progressTrack, { backgroundColor: softAction }]}><View style={[styles.progressFill, { backgroundColor: action, width: `${Math.round(progress * 100)}%` }]} /></View></View>
            </ThemedView>
          </>
        ) : (
          <>
            <ThemedText accessibilityRole="header" type="subtitle">{text.detailUnavailableTitle}</ThemedText>
            <ThemedText themeColor="textSecondary">{text.detailUnavailableDetail}</ThemedText>
          </>
        )}
        {!loading && !loadError && !session ? <Button accentColor={action} label={text.back} onPress={() => router.replace('/progress/history')} variant="secondary" /> : null}
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
