import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { SectionHeading } from '@/components/ui/section-heading';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { accentTextColor } from '@/theme/action-colors';
import { formatSessionDuration, getHistoricalSessions } from '@/features/focus/session-history';
import { loadSessionHistory } from '@/features/focus/session-storage';
import { getAchievementCopy, getRewardsCopy } from '@/features/localization/rewards-copy';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { ACHIEVEMENT_IDS, type AchievementId } from '@/features/progress/progression-rules';
import { loadAchievementUnlocks, type LocalAchievementUnlock } from '@/features/storage/local-database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import type { AppLocale } from '@/features/settings/settings-storage';

export default function RewardsRoute() {
  const router = useRouter();
  const { locale, copy } = useAppLocale();
  const text = getRewardsCopy(locale);
  const formatDuration = (seconds: number): string => formatSessionDuration(seconds, { hour: text.hoursUnit, minute: text.minutesUnit });
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = theme.primary;
  const onAction = accentTextColor(action);
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;
  const [sessions, setSessions] = useState<ReturnType<typeof getHistoricalSessions>>([]);
  const [unlocks, setUnlocks] = useState<LocalAchievementUnlock[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const readRevision = useRef(0);

  const refresh = useCallback(async () => {
    const revision = ++readRevision.current;
    setLoadState('loading');
    try {
      const [history, storedUnlocks] = await Promise.all([loadSessionHistory(), loadAchievementUnlocks()]);
      if (revision !== readRevision.current) return;
      setSessions(getHistoricalSessions(history).filter((session) => session.status === 'completed'));
      setUnlocks(storedUnlocks);
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
  const unlockById = new Map(unlocks.map((unlock) => [unlock.achievementId, unlock]));
  const milestonesWithState = ACHIEVEMENT_IDS.map((id) => ({
    id,
    icon: achievementIcon(id),
    ...getAchievementCopy(locale, id),
    unlock: unlockById.get(id) ?? null,
  }));
  const unlocked = milestonesWithState.filter((milestone) => milestone.unlock !== null).length;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Button accentColor={action} label={copy.historyPage.back} onPress={() => router.replace('/progress')} variant="ghost" />
          <SectionHeading eyebrow={text.eyebrow} title={text.title} subtitle={text.subtitle} icon="ribbon-outline" />

          {loadState === 'loading' ? <View accessibilityLabel={text.loading} accessibilityLiveRegion="polite" style={styles.loading}><ActivityIndicator color={action} /></View> : null}
          {loadState === 'error' ? <ThemedView accessibilityRole="alert" style={[styles.errorCard, { backgroundColor: surface, borderColor: border }]}><ThemedText type="smallBold">{text.errorTitle}</ThemedText><ThemedText themeColor="textSecondary">{text.errorDetail}</ThemedText><Button accessibilityLabel={text.retry} accentColor={action} fullWidth label={text.tryAgain} onPress={() => { void refresh(); }} /></ThemedView> : null}
          {loadState === 'ready' ? (
            <>
              <ThemedView accessibilityLabel={`${unlocked}/${milestonesWithState.length} ${text.unlockedSummary}`} style={[styles.summaryCard, { backgroundColor: surface, borderColor: border }]}>
                <View style={[styles.summaryIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="ribbon-outline" size={27} /></View>
                <View style={styles.summaryCopy}><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{text.yourMilestones}</ThemedText><ThemedText style={styles.summaryTitle} type="subtitle">{unlocked}/{milestonesWithState.length} {text.unlockedSummary}</ThemedText><ThemedText themeColor="textSecondary" type="small">{sessions.length} {sessions.length === 1 ? text.completedSession : text.completedSessions} · {formatDuration(focusedSeconds)} {text.focused}</ThemedText></View>
              </ThemedView>
              <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">{text.milestones}</ThemedText>{milestonesWithState.map((milestone) => <Milestone action={action} onAction={onAction} border={border} key={milestone.id} locale={locale} text={text} unlocked={Boolean(milestone.unlock)} unlockedAt={milestone.unlock?.unlockedAt ?? null} {...milestone} />)}</View>
              {sessions.length === 0 ? <ThemedView accessibilityLabel={text.emptyLabel} style={[styles.emptyCard, { backgroundColor: surface, borderColor: border }]}><ThemedText type="smallBold">{text.emptyTitle}</ThemedText><ThemedText themeColor="textSecondary">{text.emptyDetail}</ThemedText><Button accentColor={action} fullWidth label={text.startFocus} onPress={() => router.push('/focus/setup')} /></ThemedView> : null}
              {sessions.length > 0 ? <ThemedText accessibilityLabel={text.latestDetail} themeColor="textSecondary" type="small">{text.latestDetail}</ThemedText> : null}
            </>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function achievementIcon(id: AchievementId): keyof typeof Ionicons.glyphMap {
  if (id.includes('streak')) return 'flame-outline';
  if (id.includes('goal')) return 'flag-outline';
  if (id.includes('minutes')) return 'time-outline';
  return 'leaf-outline';
}

function Milestone({ action, onAction, border, detail, icon, locale, title, text, unlocked, unlockedAt }: { action: string; onAction: string; border: string; detail: string; icon: keyof typeof Ionicons.glyphMap; locale: AppLocale; title: string; text: ReturnType<typeof getRewardsCopy>; unlocked: boolean; unlockedAt: string | null }) {
  const dateLocale = locale === 'si' ? 'si-LK' : locale === 'ta' ? 'ta-LK' : 'en-US';
  const unlockDetail = unlockedAt ? `${text.unlockedDetail} · ${new Date(unlockedAt).toLocaleDateString(dateLocale)}` : text.unlockedDetail;
  return <ThemedView accessibilityLabel={`${title}. ${unlocked ? unlockDetail : detail}`} style={[styles.milestone, { borderColor: border }]}><View style={[styles.milestoneIcon, { backgroundColor: unlocked ? action : 'transparent', borderColor: unlocked ? action : border }]}><Ionicons color={unlocked ? onAction : action} name={unlocked ? 'checkmark' : icon} size={22} /></View><View style={styles.milestoneCopy}><ThemedText type="smallBold">{title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{unlocked ? unlockDetail : detail}</ThemedText></View></ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.lg },
  content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' },
  eyebrow: { letterSpacing: 1.2 },
  loading: { alignItems: 'center', minHeight: 180, justifyContent: 'center' },
  errorCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg },
  summaryCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg },
  summaryIcon: { alignItems: 'center', borderRadius: 25, height: 50, justifyContent: 'center', width: 50 },
  summaryCopy: { flex: 1, gap: Spacing.xs, minWidth: 0 },
  summaryTitle: { fontSize: 26, lineHeight: 34 },
  section: { gap: Spacing.sm },
  sectionLabel: { letterSpacing: 1.1 },
  milestone: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 76, padding: Spacing.md },
  milestoneIcon: { alignItems: 'center', borderRadius: 22, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  milestoneCopy: { flex: 1, gap: 2, minWidth: 0 },
  emptyCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg },
});
