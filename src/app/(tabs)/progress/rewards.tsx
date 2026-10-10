import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatSessionDuration, getHistoricalSessions, getSessionTimestamp } from '@/features/focus/session-history';
import { loadSessionHistory } from '@/features/focus/session-storage';
import { getRewardsCopy } from '@/features/localization/rewards-copy';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function RewardsRoute() {
  const router = useRouter();
  const { locale } = useAppLocale();
  const text = getRewardsCopy(locale);
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? theme.background : Palette.homeLightActionSoft;
  const [sessions, setSessions] = useState<ReturnType<typeof getHistoricalSessions>>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const readRevision = useRef(0);

  const refresh = useCallback(async () => {
    const revision = ++readRevision.current;
    setLoadState('loading');
    try {
      const history = await loadSessionHistory();
      if (revision !== readRevision.current) return;
      setSessions(getHistoricalSessions(history).filter((session) => session.status === 'completed'));
      setLoadState('ready');
    } catch {
      if (revision === readRevision.current) setLoadState('error');
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void refresh();
    return () => { readRevision.current += 1; };
  }, [refresh]));

  const focusedSeconds = sessions.reduce((total, session) => total + session.focusedDurationSeconds, 0);
  const milestones = [
    { icon: 'leaf-outline' as const, title: text.firstTitle, detail: text.firstDetail, unlocked: sessions.length >= 1 },
    { icon: 'layers-outline' as const, title: text.fiveTitle, detail: text.fiveDetail, unlocked: sessions.length >= 5 },
    { icon: 'time-outline' as const, title: text.hourTitle, detail: text.hourDetail, unlocked: focusedSeconds >= 60 * 60 },
  ];
  const unlocked = milestones.filter((milestone) => milestone.unlocked).length;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{text.eyebrow}</ThemedText>
            <ThemedText accessibilityRole="header" type="title" style={styles.title}>{text.title}</ThemedText>
            <ThemedText themeColor="textSecondary">{text.subtitle}</ThemedText>
          </View>

          {loadState === 'loading' ? <View accessibilityLabel={text.loading} style={styles.loading}><ActivityIndicator color={action} /></View> : null}
          {loadState === 'error' ? <ThemedView accessibilityRole="alert" style={[styles.errorCard, { backgroundColor: surface, borderColor: border }]}><ThemedText type="smallBold">{text.errorTitle}</ThemedText><ThemedText themeColor="textSecondary">{text.errorDetail}</ThemedText><Pressable accessibilityLabel={text.retry} accessibilityRole="button" onPress={() => { void refresh(); }} style={({ pressed }) => [styles.primaryButton, { backgroundColor: action, borderColor: action }, pressed && styles.pressed]}><ThemedText style={{ color: Palette.deepNavy }} type="smallBold">{text.tryAgain}</ThemedText></Pressable></ThemedView> : null}
          {loadState === 'ready' ? (
            <>
              <ThemedView accessibilityLabel={`${unlocked}/${milestones.length} ${text.unlockedSummary}`} style={[styles.summaryCard, { backgroundColor: surface, borderColor: border }]}>
                <View style={[styles.summaryIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="ribbon-outline" size={27} /></View>
                <View style={styles.summaryCopy}><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{text.yourMilestones}</ThemedText><ThemedText style={styles.summaryTitle} type="subtitle">{unlocked}/{milestones.length} {text.unlockedSummary}</ThemedText><ThemedText themeColor="textSecondary" type="small">{sessions.length} {sessions.length === 1 ? text.completedSession : text.completedSessions} · {formatSessionDuration(focusedSeconds)} {text.focused}</ThemedText></View>
              </ThemedView>
              <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">{text.milestones}</ThemedText>{milestones.map((milestone) => <Milestone action={action} border={border} key={milestone.title} text={text} {...milestone} />)}</View>
              {sessions.length === 0 ? <ThemedView accessibilityLabel={text.emptyLabel} style={[styles.emptyCard, { backgroundColor: surface, borderColor: border }]}><ThemedText type="smallBold">{text.emptyTitle}</ThemedText><ThemedText themeColor="textSecondary">{text.emptyDetail}</ThemedText><Pressable accessibilityLabel={text.startFocus} accessibilityRole="button" onPress={() => router.push('/focus/setup')} style={({ pressed }) => [styles.primaryButton, { backgroundColor: action, borderColor: action }, pressed && styles.pressed]}><ThemedText style={{ color: Palette.deepNavy }} type="smallBold">{text.startFocus}</ThemedText></Pressable></ThemedView> : null}
              {sessions.length > 0 ? <ThemedText accessibilityLabel={`Latest completed session on ${getSessionTimestamp(sessions[0])}`} themeColor="textSecondary" type="small">{text.latestDetail}</ThemedText> : null}
            </>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Milestone({ action, border, detail, icon, title, text, unlocked }: { action: string; border: string; detail: string; icon: keyof typeof Ionicons.glyphMap; title: string; text: ReturnType<typeof getRewardsCopy>; unlocked: boolean }) {
  return <ThemedView accessibilityLabel={`${title}. ${unlocked ? text.unlocked : detail}`} style={[styles.milestone, { borderColor: border, opacity: unlocked ? 1 : 0.72 }]}><View style={[styles.milestoneIcon, { backgroundColor: unlocked ? action : 'transparent', borderColor: unlocked ? action : border }]}><Ionicons color={unlocked ? Palette.deepNavy : action} name={unlocked ? 'checkmark' : icon} size={22} /></View><View style={styles.milestoneCopy}><ThemedText type="smallBold">{title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{unlocked ? text.unlockedDetail : detail}</ThemedText></View></ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' }, header: { gap: Spacing.xs }, title: { fontSize: 38, lineHeight: 44 }, eyebrow: { letterSpacing: 1.2 }, loading: { alignItems: 'center', minHeight: 180, justifyContent: 'center' }, errorCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, summaryCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg }, summaryIcon: { alignItems: 'center', borderRadius: 25, height: 50, justifyContent: 'center', width: 50 }, summaryCopy: { flex: 1, gap: Spacing.xs }, summaryTitle: { fontSize: 26, lineHeight: 34 }, section: { gap: Spacing.sm }, sectionLabel: { letterSpacing: 1.1 }, milestone: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 76, padding: Spacing.md }, milestoneIcon: { alignItems: 'center', borderRadius: 22, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 }, milestoneCopy: { flex: 1, gap: 2 }, emptyCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, primaryButton: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, justifyContent: 'center', minHeight: 48, paddingHorizontal: Spacing.md }, pressed: { opacity: 0.78 },
});
