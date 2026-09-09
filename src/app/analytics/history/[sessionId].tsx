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
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function SessionDetailRoute() {
  const router = useRouter();
  const theme = useTheme();
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

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={Palette.mintPrimary} /> : session ? (
          <>
            <View style={styles.navigation}>
              <Button label="Back to Session History" onPress={() => router.replace('/analytics/history')} variant="ghost" />
            </View>
            <ThemedText accessibilityRole="header" type="subtitle">Session Detail</ThemedText>
            <ThemedText themeColor="textSecondary">A record of one protected block.</ThemedText>
            <ThemedView style={styles.card} type="surface">
              <View style={styles.detailTop}><View style={[styles.detailIcon, { backgroundColor: theme.background }]}><Ionicons color={cancelled ? Palette.warning : Palette.success} name={cancelled ? 'close-circle-outline' : 'checkmark-circle-outline'} size={30} /></View><View style={[styles.statusPill, { backgroundColor: theme.background }]}><ThemedText style={{ color: cancelled ? Palette.warning : Palette.success }} type="smallBold">{cancelled ? 'CANCELLED' : 'COMPLETED'}</ThemedText></View></View>
              <ThemedText type="subtitle">{session.taskName || 'Focus session'}</ThemedText>
              <View style={styles.detailGrid}>
                <View style={styles.detailMetric}><ThemedText themeColor="textSecondary" type="smallBold">FOCUSED</ThemedText><ThemedText type="subtitle">{formatSessionDuration(session.focusedDurationSeconds)}</ThemedText></View>
                <View style={styles.detailMetric}><ThemedText themeColor="textSecondary" type="smallBold">PLANNED</ThemedText><ThemedText type="subtitle">{formatSessionDuration(session.plannedDurationSeconds)}</ThemedText></View>
              </View>
              <ThemedText themeColor="textSecondary" type="small">{formatSessionDate(session)}</ThemedText>
            </ThemedView>
          </>
        ) : (
          <>
            <ThemedText accessibilityRole="header" type="subtitle">Session unavailable</ThemedText>
            <ThemedText themeColor="textSecondary">This session could not be found in local history.</ThemedText>
          </>
        )}
        {!loading && !session ? <Button label="Back to Session History" onPress={() => router.replace('/analytics/history')} variant="secondary" /> : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignSelf: 'center', flex: 1, gap: Spacing.md, justifyContent: 'center', maxWidth: MaxContentWidth, padding: Spacing.lg, width: '100%' },
  navigation: { alignItems: 'flex-start', marginLeft: -Spacing.md },
  card: { borderRadius: Radius.card, gap: Spacing.md, padding: Spacing.lg },
  detailIcon: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  detailTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  statusPill: { borderRadius: 999, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  detailGrid: { flexDirection: 'row', gap: Spacing.lg },
  detailMetric: { flex: 1, gap: Spacing.xs },
});
