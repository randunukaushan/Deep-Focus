import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { useAppLocale } from '@/features/localization/app-locale-context';

function formatMinutes(seconds: number, minuteLabel: string) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} ${minuteLabel}`;
}

export default function SessionSummaryRoute() {
  const router = useRouter();
  const { status, focusedSeconds, plannedSeconds, plannedMinutes, taskName } = useLocalSearchParams<{ status?: string; focusedSeconds?: string; plannedSeconds?: string; plannedMinutes?: string; taskName?: string }>();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const homeSurface = isDark ? theme.surface : Palette.homeLightSurface;
  const homeBorder = isDark ? theme.border : Palette.homeLightBorder;
  const homeAction = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const { copy } = useAppLocale();
  const text = copy.focus;
  const completed = status === 'completed';
  const focused = Math.max(0, Number(focusedSeconds) || 0);
  const planned = Math.max(0, Number(plannedSeconds) || (Number(plannedMinutes) || 0) * 60);

  function goHome() {
    router.dismissTo('/(tabs)/home');
  }

  return (
    <ThemedView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}>
      <View style={styles.content}>
        <View style={styles.heading}>
          <View style={[styles.statusIcon, { backgroundColor: completed ? homeAction : Palette.error }]}>
            <Ionicons color={completed ? Palette.deepNavy : Palette.lightSurface} name={completed ? 'checkmark' : 'close'} size={26} />
          </View>
          <ThemedText themeColor="textSecondary" type="smallBold">{text.summaryEyebrow}</ThemedText>
          <ThemedText accessibilityRole="header" type="title">{completed ? text.sessionComplete : text.sessionEnded}</ThemedText>
          <ThemedText themeColor="textSecondary">{completed ? text.focusedWork : text.endedBeforePlan}</ThemedText>
        </View>
        <ThemedView accessibilityLabel={`${completed ? text.completed : text.cancelled} session. ${formatMinutes(focused, text.minutes)} focused of ${formatMinutes(planned, text.minutes)} planned${taskName ? ` ${text.task} ${taskName}` : ''}.`} style={[styles.card, { backgroundColor: homeSurface, borderColor: homeBorder }]}>
          <ThemedText style={[styles.cardEyebrow, { color: homeAction }]} type="smallBold">{text.focusSummary}</ThemedText>
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <ThemedText themeColor="textSecondary" type="smallBold">{text.focusTime}</ThemedText>
              <ThemedText style={styles.metricValue}>{formatMinutes(focused, text.minutes)}</ThemedText>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: homeBorder }]} />
            <View style={styles.metric}>
              <ThemedText themeColor="textSecondary" type="smallBold">{text.planned}</ThemedText>
              <ThemedText style={styles.metricValue}>{formatMinutes(planned, text.minutes)}</ThemedText>
            </View>
          </View>
          <View style={[styles.statusRow, { borderTopColor: homeBorder }]}>
            <ThemedText themeColor="textSecondary" type="smallBold">{text.status}</ThemedText>
            <ThemedText style={{ color: completed ? homeAction : Palette.error }} type="smallBold">{completed ? text.completed : text.cancelled}</ThemedText>
          </View>
          {taskName ? <ThemedText themeColor="textSecondary">{text.task} {taskName}</ThemedText> : null}
        </ThemedView>
        <View style={styles.actions}>
          <Button accentColor={homeAction} fullWidth label={text.anotherSession} onPress={() => router.replace('/focus/setup')} style={{ backgroundColor: homeAction, borderColor: homeAction }} />
          <Button accentColor={homeAction} fullWidth label={text.backHome} onPress={goHome} variant="secondary" />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignSelf: 'center', flex: 1, gap: Spacing.lg, justifyContent: 'center', maxWidth: 560, padding: Spacing.lg, width: '100%' },
  heading: { gap: Spacing.xs },
  statusIcon: { alignItems: 'center', borderRadius: 28, height: 56, justifyContent: 'center', marginBottom: Spacing.sm, width: 56 },
  card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg },
  cardEyebrow: { letterSpacing: 1.2 },
  metricRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  metric: { flex: 1, gap: Spacing.xs },
  metricValue: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  metricDivider: { height: 48, width: 1 },
  statusRow: { borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.md },
  actions: { gap: Spacing.sm },
});
