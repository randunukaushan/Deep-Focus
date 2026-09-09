import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { MaxContentWidth } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing, Typography } from '@/theme/tokens';
import { loadSessionHistory } from '@/features/focus/session-storage';

type QuickAction = {
  label: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Tasks', detail: 'Choose what matters next', icon: 'checkbox-outline', route: '/tasks/index' },
  { label: 'Goals', detail: 'Keep your direction clear', icon: 'flag-outline', route: '/goals/index' },
  { label: 'Plan My Day', detail: 'Create a calm starting point', icon: 'sparkles-outline', route: '/plan-my-day' },
];

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatFocusTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
}

export function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { height } = useWindowDimensions();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refreshClock = () => setNow(new Date());
    const interval = setInterval(refreshClock, 60_000);
    return () => clearInterval(interval);
  }, []);
  const hour = now.getHours();
  const isNight = hour >= 18 || hour < 6;
  const isMorning = hour >= 6 && hour < 12;
  const calmGreeting = isMorning
    ? 'A calmer start to the day.'
    : isNight
      ? 'Make space for a quieter evening.'
      : 'Make room for the work that matters today.';
  // Keep the complete home overview visible on common phone viewports while
  // retaining the scroll fallback for smaller screens and larger text sizes.
  const compact = height < 900;
  const homeBackground = isDark
    ? theme.background
    : isNight
      ? Palette.homeLightBackground
      : isMorning
        ? Palette.homeMorningBackground
        : hour >= 17
          ? Palette.homeEveningBackground
          : Palette.homeLightBackground;
  const homeSurface = isDark ? theme.surface : Palette.homeLightSurface;
  const homeBorder = isDark ? theme.border : Palette.homeLightBorder;
  const homeAction = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const homeActionSoft = isDark ? theme.background : Palette.homeLightActionSoft;
  const greeting = getGreeting(now.getHours());
  const dateLabel = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const [todayProgress, setTodayProgress] = useState({ focusedSeconds: 0, sessionsCompleted: 0 });

  useFocusEffect(useCallback(() => {
    let active = true;
    void loadSessionHistory().then((sessions) => {
      if (!active) return;
      const today = new Date().toDateString();
      const completedToday = sessions.filter((session) => session.status === 'completed'
        && session.completedAt
        && new Date(session.completedAt).toDateString() === today);
      setTodayProgress({
        focusedSeconds: completedToday.reduce((total, session) => total + session.focusedDurationSeconds, 0),
        sessionsCompleted: completedToday.length,
      });
    });
    return () => { active = false; };
  }, []));

  const hasProgress = todayProgress.sessionsCompleted > 0;
  const progressLabel = hasProgress
    ? `${formatFocusTime(todayProgress.focusedSeconds)} focused · ${todayProgress.sessionsCompleted} ${todayProgress.sessionsCompleted === 1 ? 'session' : 'sessions'} completed.`
    : 'No sessions completed yet — your first focused block starts the day.';

  return (
    <ThemedView style={[styles.screen, { backgroundColor: homeBackground }]}>
      <View accessibilityElementsHidden pointerEvents="none" style={styles.landscape}>
        <View style={[styles.sun, isMorning && styles.morningSun, { backgroundColor: isDark || isNight ? Palette.navySurfaceElevated : isMorning ? '#FFD08A' : Palette.lightSurface }]} />
        {isNight ? <Ionicons color={isDark ? '#A9C8E6' : '#7EAED2'} name="moon" size={42} style={styles.moon} /> : null}
        <View style={[styles.mountainBack, { backgroundColor: isDark || isNight ? Palette.navySurface : Palette.homeLightBorder }]} />
        <View style={[styles.mountainFront, { backgroundColor: isDark || isNight ? Palette.navySurfaceElevated : Palette.homeLightActionSoft }]} />
      </View>
      <ScrollView contentContainerStyle={[styles.scrollContent, compact && styles.scrollContentCompact]} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        <View style={[styles.content, compact && styles.contentCompact]}>
          <View style={styles.topBar}>
            <View style={styles.brandBlock}><ThemedText style={[styles.eyebrow, { color: homeAction }]}>DEEP FOCUS</ThemedText>{!compact ? <ThemedText themeColor="textSecondary" type="small">A calmer, more intentional you.</ThemedText> : null}</View>
            <Pressable accessibilityLabel="Open settings" accessibilityRole="button" onPress={() => router.push('/profile/settings')} style={({ pressed }) => [styles.settingsButton, { backgroundColor: homeSurface, borderColor: homeBorder }, pressed && styles.pressed]}><Ionicons color={theme.text} name="settings-outline" size={22} /></Pressable>
          </View>
          <View style={[styles.introduction, compact && styles.introductionCompact]}>
            <ThemedText style={[styles.greeting, compact && styles.greetingCompact, { color: isMorning && !isDark ? Palette.homeMorningAccent : theme.text }]} accessibilityRole="header">{greeting.toUpperCase()}</ThemedText>
            <ThemedText themeColor="textSecondary">{calmGreeting}</ThemedText>
            {!compact ? <ThemedText style={styles.dateLabel} themeColor="textMuted" type="small">{dateLabel}</ThemedText> : null}
          </View>

          <View accessibilityLabel="Start a new focus session" style={[styles.heroCard, { backgroundColor: homeSurface, borderColor: homeBorder }]}>
            <View style={[styles.heroGlow, { backgroundColor: isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft }]} />
            <View style={[styles.heroContent, compact && styles.heroContentCompact]}>
              <View style={styles.heroHeader}>
                <View style={[styles.heroIcon, { backgroundColor: homeAction }]}><Ionicons color={Palette.deepNavy} name="timer-outline" size={22} /></View>
                <View style={styles.heroLabelGroup}>
                  <ThemedText style={[styles.heroKicker, { color: isDark ? Palette.darkTextSecondary : Palette.lightTextSecondary }]}>YOUR NEXT FOCUS BLOCK</ThemedText>
                  <ThemedText style={[styles.heroMeta, { color: homeAction }]}>25 MIN · RECOMMENDED</ThemedText>
                </View>
              </View>
              <ThemedText style={[styles.heroTitle, compact && styles.heroTitleCompact, { color: isDark ? Palette.darkTextPrimary : Palette.lightTextPrimary }]}>A calm 25-minute start.</ThemedText>
              <ThemedText numberOfLines={compact ? 1 : undefined} style={[styles.heroCopy, { color: isDark ? Palette.darkTextSecondary : Palette.lightTextSecondary }]}>Choose one meaningful task. We will take care of the rest.</ThemedText>
              <Button
                accessibilityLabel="Start a 25 minute focus session"
                fullWidth
                label="Start Focus Session"
                onPress={() => router.push('/focus/setup')}
                style={{ backgroundColor: homeAction, borderColor: homeAction }}
              />
              <View style={[styles.heroFacts, { borderTopColor: homeBorder }, compact && styles.heroFactsCompact]}>
                <View style={styles.heroFact}><Ionicons color={homeAction} name="timer-outline" size={compact ? 18 : 20} /><ThemedText type="smallBold">25 min</ThemedText>{!compact ? <ThemedText themeColor="textSecondary" type="small">Suggested</ThemedText> : null}</View>
                <View style={[styles.heroFactDivider, { backgroundColor: homeBorder }]} />
                <View style={styles.heroFact}><Ionicons color={homeAction} name="options-outline" size={compact ? 18 : 20} /><ThemedText type="smallBold">5–180 min</ThemedText>{!compact ? <ThemedText themeColor="textSecondary" type="small">Flexible</ThemedText> : null}</View>
                <View style={[styles.heroFactDivider, { backgroundColor: homeBorder }]} />
                <View style={styles.heroFact}><Ionicons color={homeAction} name="shield-checkmark-outline" size={compact ? 18 : 20} /><ThemedText type="smallBold">Local</ThemedText>{!compact ? <ThemedText themeColor="textSecondary" type="small">Private</ThemedText> : null}</View>
              </View>
            </View>
          </View>

          <ThemedView accessibilityLabel={`Today’s focus progress. ${progressLabel}`} style={[styles.progressCard, { backgroundColor: homeSurface, borderColor: homeBorder }, compact && styles.progressCardCompact]}>
            <View style={styles.cardHeading}>
              <View>
                <ThemedText style={[styles.sectionEyebrow, { color: homeAction }]} type="smallBold">TODAY’S RHYTHM</ThemedText>
                <ThemedText style={compact && styles.cardTitleCompact} type="subtitle">{hasProgress ? 'Steady progress.' : 'Begin with one block.'}</ThemedText>
              </View>
              <View style={[styles.statusIcon, { backgroundColor: homeActionSoft }]}><Ionicons color={homeAction} name="leaf-outline" size={20} /></View>
            </View>
            <View style={styles.progressMetrics}>
              <View style={styles.progressMetric}><ThemedText themeColor="textSecondary" type="smallBold">FOCUS TIME</ThemedText><ThemedText style={compact && styles.metricValueCompact} type="subtitle">{formatFocusTime(todayProgress.focusedSeconds)}</ThemedText></View>
              <View style={[styles.progressDivider, { backgroundColor: homeBorder }]} />
              <View style={styles.progressMetric}><ThemedText themeColor="textSecondary" type="smallBold">BLOCKS</ThemedText><ThemedText style={compact && styles.metricValueCompact} type="subtitle">{todayProgress.sessionsCompleted}</ThemedText></View>
            </View>
            {!compact ? <ThemedText themeColor="textSecondary" type="small">{progressLabel}</ThemedText> : null}
          </ThemedView>

          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionEyebrow, { color: homeAction }]} type="smallBold">QUICK ACTIONS</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">Keep your day clear.</ThemedText>
          </View>

          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable accessibilityHint={action.detail} accessibilityLabel={action.label} accessibilityRole="button" key={action.label} onPress={() => router.push(action.route)} style={({ pressed }) => [styles.quickAction, { backgroundColor: homeSurface, borderColor: homeBorder }, compact && styles.quickActionCompact, pressed && styles.pressed]}>
                <View style={[styles.actionIcon, { backgroundColor: homeActionSoft }]}><Ionicons color={homeAction} name={action.icon} size={22} /></View>
                <View style={styles.actionCopy}>
                  <ThemedText type="smallBold">{action.label}</ThemedText>
                  <ThemedText numberOfLines={compact ? 1 : 2} themeColor="textSecondary" type="small">{action.detail}</ThemedText>
                </View>
                <Ionicons color={theme.textMuted} name="chevron-forward" size={18} style={styles.quickActionChevron} />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  landscape: { height: 360, left: 0, overflow: 'hidden', position: 'absolute', right: 0, top: 0 },
  sun: { borderRadius: 56, height: 112, opacity: 0.65, position: 'absolute', right: 42, shadowColor: '#6D9FC4', shadowOffset: { height: 8, width: 0 }, shadowOpacity: 0.18, shadowRadius: 18, top: 82, width: 112 },
  morningSun: { right: 30, top: 42 },
  moon: { opacity: 0.85, position: 'absolute', right: 78, top: 112 },
  mountainBack: { borderRadius: 48, height: 280, opacity: 0.28, position: 'absolute', right: -60, top: 155, transform: [{ rotate: '42deg' }], width: 330 },
  mountainFront: { borderRadius: 56, height: 250, left: 45, opacity: 0.72, position: 'absolute', top: 220, transform: [{ rotate: '38deg' }], width: 360 },
  scrollContent: { flexGrow: 1, alignItems: 'center', padding: Spacing.lg, paddingBottom: Spacing.xxl },
  scrollContentCompact: { paddingBottom: Spacing.md, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  content: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.lg },
  contentCompact: { gap: Spacing.sm },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  brandBlock: { gap: 2 },
  settingsButton: { alignItems: 'center', borderRadius: 24, borderWidth: 1, height: 48, justifyContent: 'center', width: 48 },
  introduction: { gap: Spacing.xs, paddingVertical: Spacing.md },
  introductionCompact: { paddingVertical: Spacing.xs },
  greeting: { fontSize: Typography.caption.fontSize, fontWeight: '800', letterSpacing: 2.2, lineHeight: 20 },
  greetingCompact: { fontSize: Typography.caption.fontSize, lineHeight: 20 },
  dateLabel: { marginTop: Spacing.xs },
  eyebrow: { color: Palette.mintPrimary, fontSize: Typography.caption.fontSize, fontWeight: '700', letterSpacing: 1.6 },
  heroCard: { borderRadius: Radius.card, borderWidth: 1, elevation: 2, overflow: 'hidden', position: 'relative', shadowColor: '#6A9DC2', shadowOffset: { height: 5, width: 0 }, shadowOpacity: 0.12, shadowRadius: 12 },
  heroContent: { gap: Spacing.md, padding: Spacing.lg, zIndex: 1 },
  heroContentCompact: { gap: Spacing.xs, padding: Spacing.md },
  heroGlow: { borderRadius: 180, height: 260, opacity: 0.75, position: 'absolute', right: -90, top: -120, width: 260 },
  heroHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  heroIcon: { alignItems: 'center', backgroundColor: Palette.mintPrimary, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  heroLabelGroup: { gap: 2 },
  heroKicker: { color: Palette.darkTextSecondary, fontSize: Typography.caption.fontSize, fontWeight: '700', letterSpacing: 1.3 },
  heroMeta: { color: Palette.mintPrimary, fontSize: Typography.caption.fontSize, fontWeight: '700', letterSpacing: 0.8 },
  heroTitle: { color: Palette.darkTextPrimary, fontSize: 28, fontWeight: '700', lineHeight: 34 },
  heroTitleCompact: { fontSize: 22, lineHeight: 27 },
  heroCopy: { color: Palette.darkTextSecondary, fontSize: Typography.body.fontSize, lineHeight: 24 },
  heroFacts: { alignItems: 'center', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs, paddingTop: Spacing.md },
  heroFactsCompact: { marginTop: 0, paddingTop: Spacing.sm },
  heroFact: { alignItems: 'center', flex: 1, gap: 2 },
  heroFactDivider: { height: 48, width: 1 },
  progressCard: { borderRadius: Radius.card, borderWidth: 1, elevation: 1, gap: Spacing.md, padding: Spacing.lg, shadowColor: '#6A9DC2', shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.08, shadowRadius: 8 },
  progressCardCompact: { gap: Spacing.sm, padding: Spacing.md },
  cardTitleCompact: { fontSize: 23, lineHeight: 28 },
  cardHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  statusIcon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  progressMetrics: { alignItems: 'center', flexDirection: 'row', gap: Spacing.lg },
  progressMetric: { flex: 1, gap: Spacing.xs },
  metricValueCompact: { fontSize: 24, lineHeight: 30 },
  progressDivider: { height: 48, width: 1 },
  sectionEyebrow: { color: Palette.mintPrimary, letterSpacing: 1.2 },
  sectionHeader: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.xs },
  quickActions: { flexDirection: 'row', gap: Spacing.sm },
  quickAction: { borderRadius: Radius.card, borderWidth: 1, flex: 1, gap: Spacing.sm, minHeight: 154, padding: Spacing.md, position: 'relative' },
  quickActionCompact: { minHeight: 88, padding: Spacing.sm },
  quickActionChevron: { position: 'absolute', right: Spacing.sm, top: Spacing.md },
  actionIcon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  actionCopy: { flex: 1, gap: 2, justifyContent: 'flex-end' },
  pressed: { opacity: 0.8 },
});
