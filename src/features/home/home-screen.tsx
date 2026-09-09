import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing, Typography } from '@/theme/tokens';

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

export function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const greeting = getGreeting(new Date().getHours());

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.introduction}>
            <ThemedText style={styles.eyebrow}>DEEP FOCUS</ThemedText>
            <ThemedText accessibilityRole="header" type="subtitle">{greeting}.</ThemedText>
            <ThemedText themeColor="textSecondary">Make room for the work that matters today.</ThemedText>
          </View>

          <View accessibilityLabel="Start a new focus session" style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroIcon}><Ionicons color={Palette.deepNavy} name="timer-outline" size={22} /></View>
              <ThemedText style={styles.heroKicker}>YOUR NEXT FOCUS BLOCK</ThemedText>
            </View>
            <ThemedText style={styles.heroTitle}>A calm 25-minute start.</ThemedText>
            <ThemedText style={styles.heroCopy}>Choose one meaningful task. We will take care of the rest.</ThemedText>
            <Button
              accessibilityLabel="Start a 25 minute focus session"
              fullWidth
              label="Start Focus Session"
              onPress={() => router.push('/focus/setup')}
            />
          </View>

          <ThemedView accessibilityLabel="Today’s focus progress. No sessions completed yet." style={[styles.progressCard, { borderColor: theme.border }]} type="surface">
            <View style={styles.cardHeading}>
              <View>
                <ThemedText type="smallBold">TODAY’S FOCUS</ThemedText>
                <ThemedText type="subtitle">Begin with one block.</ThemedText>
              </View>
              <View style={[styles.statusIcon, { backgroundColor: theme.background }]}><Ionicons color={Palette.mintPrimary} name="leaf-outline" size={20} /></View>
            </View>
            <View accessibilityElementsHidden style={[styles.progressTrack, { backgroundColor: theme.backgroundElement }]}><View style={styles.progressEmpty} /></View>
            <ThemedText themeColor="textSecondary" type="small">No sessions completed yet — your first focused block starts the day.</ThemedText>
          </ThemedView>

          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">QUICK ACTIONS</ThemedText>
            <ThemedText type="subtitle">Keep your day clear.</ThemedText>
          </View>

          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable accessibilityHint={action.detail} accessibilityLabel={action.label} accessibilityRole="button" key={action.label} onPress={() => router.push(action.route)} style={({ pressed }) => [styles.quickAction, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}>
                <View style={[styles.actionIcon, { backgroundColor: theme.background }]}><Ionicons color={Palette.mintPrimary} name={action.icon} size={22} /></View>
                <View style={styles.actionCopy}>
                  <ThemedText type="smallBold">{action.label}</ThemedText>
                  <ThemedText numberOfLines={1} themeColor="textSecondary" type="small">{action.detail}</ThemedText>
                </View>
                <Ionicons color={theme.textMuted} name="chevron-forward" size={18} />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', padding: Spacing.lg },
  content: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.lg },
  introduction: { gap: Spacing.xs, paddingTop: Spacing.sm },
  eyebrow: { color: Palette.mintPrimary, fontSize: Typography.caption.fontSize, fontWeight: '700', letterSpacing: 1.6 },
  heroCard: { backgroundColor: Palette.deepNavy, borderRadius: Radius.card, gap: Spacing.md, padding: Spacing.lg },
  heroHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  heroIcon: { alignItems: 'center', backgroundColor: Palette.mintPrimary, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  heroKicker: { color: Palette.darkTextSecondary, fontSize: Typography.caption.fontSize, fontWeight: '700', letterSpacing: 1.3 },
  heroTitle: { color: Palette.darkTextPrimary, fontSize: 28, fontWeight: '700', lineHeight: 34 },
  heroCopy: { color: Palette.darkTextSecondary, fontSize: Typography.body.fontSize, lineHeight: 24 },
  progressCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg },
  cardHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  statusIcon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  progressTrack: { borderRadius: 999, height: 8, overflow: 'hidden', width: '100%' },
  progressEmpty: { backgroundColor: Palette.mintPrimary, height: '100%', width: 0 },
  sectionHeader: { gap: Spacing.xs, paddingTop: Spacing.xs },
  quickActions: { gap: Spacing.sm },
  quickAction: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 76, padding: Spacing.md },
  actionIcon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  actionCopy: { flex: 1, gap: 2 },
  pressed: { opacity: 0.8 },
});
