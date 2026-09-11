import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatSessionDuration, getHistoricalSessions, getSessionTimestamp } from '@/features/focus/session-history';
import { loadSessionHistory } from '@/features/focus/session-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function RewardsRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? theme.background : Palette.homeLightActionSoft;
  const [sessions, setSessions] = useState<ReturnType<typeof getHistoricalSessions>>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let mounted = true;
    setLoading(true);
    void loadSessionHistory().then((history) => {
      if (!mounted) return;
      setSessions(getHistoricalSessions(history).filter((session) => session.status === 'completed'));
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []));

  const focusedSeconds = sessions.reduce((total, session) => total + session.focusedDurationSeconds, 0);
  const milestones = [
    { icon: 'leaf-outline' as const, title: 'First protected block', detail: 'Complete your first focus session.', unlocked: sessions.length >= 1 },
    { icon: 'layers-outline' as const, title: 'Five steady blocks', detail: 'Complete five focus sessions.', unlocked: sessions.length >= 5 },
    { icon: 'time-outline' as const, title: 'One hour of focus', detail: 'Protect 60 minutes of focused time.', unlocked: focusedSeconds >= 60 * 60 },
  ];
  const unlocked = milestones.filter((milestone) => milestone.unlocked).length;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">REWARDS</ThemedText>
            <ThemedText accessibilityRole="header" type="title" style={styles.title}>Notice the work you protect.</ThemedText>
            <ThemedText themeColor="textSecondary">Small milestones for sustainable focus, without pressure.</ThemedText>
          </View>

          {loading ? <View accessibilityLabel="Loading rewards" style={styles.loading}><ActivityIndicator color={action} /></View> : (
            <>
              <ThemedView accessibilityLabel={`${unlocked} of ${milestones.length} milestones unlocked`} style={[styles.summaryCard, { backgroundColor: surface, borderColor: border }]}>
                <View style={[styles.summaryIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="ribbon-outline" size={27} /></View>
                <View style={styles.summaryCopy}><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">YOUR MILESTONES</ThemedText><ThemedText style={styles.summaryTitle} type="subtitle">{unlocked} of {milestones.length} unlocked</ThemedText><ThemedText themeColor="textSecondary" type="small">{sessions.length} completed {sessions.length === 1 ? 'session' : 'sessions'} · {formatSessionDuration(focusedSeconds)} focused</ThemedText></View>
              </ThemedView>
              <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">MILESTONES</ThemedText>{milestones.map((milestone) => <Milestone action={action} border={border} key={milestone.title} {...milestone} />)}</View>
              {sessions.length === 0 ? <ThemedView accessibilityLabel="No rewards unlocked yet" style={[styles.emptyCard, { backgroundColor: surface, borderColor: border }]}><ThemedText type="smallBold">YOUR FIRST MILESTONE IS CLOSE</ThemedText><ThemedText themeColor="textSecondary">Start one calm focus session to begin your progress.</ThemedText><Pressable accessibilityLabel="Start focus session" accessibilityRole="button" onPress={() => router.push('/focus/setup')} style={({ pressed }) => [styles.primaryButton, { backgroundColor: action, borderColor: action }, pressed && styles.pressed]}><ThemedText style={{ color: Palette.deepNavy }} type="smallBold">Start Focus Session</ThemedText></Pressable></ThemedView> : null}
              {sessions.length > 0 ? <ThemedText accessibilityLabel={`Latest completed session on ${getSessionTimestamp(sessions[0])}`} themeColor="textSecondary" type="small">Milestones are based on completed sessions saved locally.</ThemedText> : null}
            </>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Milestone({ action, border, detail, icon, title, unlocked }: { action: string; border: string; detail: string; icon: keyof typeof Ionicons.glyphMap; title: string; unlocked: boolean }) {
  return <ThemedView accessibilityLabel={`${title}. ${unlocked ? 'Unlocked' : detail}`} style={[styles.milestone, { borderColor: border, opacity: unlocked ? 1 : 0.72 }]}><View style={[styles.milestoneIcon, { backgroundColor: unlocked ? action : 'transparent', borderColor: unlocked ? action : border }]}><Ionicons color={unlocked ? Palette.deepNavy : action} name={unlocked ? 'checkmark' : icon} size={22} /></View><View style={styles.milestoneCopy}><ThemedText type="smallBold">{title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{unlocked ? 'Unlocked · a meaningful step forward.' : detail}</ThemedText></View></ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' }, header: { gap: Spacing.xs }, title: { fontSize: 38, lineHeight: 44 }, eyebrow: { letterSpacing: 1.2 }, loading: { alignItems: 'center', minHeight: 180, justifyContent: 'center' }, summaryCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg }, summaryIcon: { alignItems: 'center', borderRadius: 25, height: 50, justifyContent: 'center', width: 50 }, summaryCopy: { flex: 1, gap: Spacing.xs }, summaryTitle: { fontSize: 26, lineHeight: 34 }, section: { gap: Spacing.sm }, sectionLabel: { letterSpacing: 1.1 }, milestone: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 76, padding: Spacing.md }, milestoneIcon: { alignItems: 'center', borderRadius: 22, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 }, milestoneCopy: { flex: 1, gap: 2 }, emptyCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, primaryButton: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, justifyContent: 'center', minHeight: 48, paddingHorizontal: Spacing.md }, pressed: { opacity: 0.78 },
});
