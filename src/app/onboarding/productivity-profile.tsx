import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export default function ProductivityProfileRoute() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Pressable accessibilityLabel="Back to assessment" accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Ionicons color={action} name="arrow-back" size={20} /><ThemedText style={{ color: action }} type="smallBold">Assessment</ThemedText></Pressable>
          <View style={styles.headerRow}><View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="person-circle-outline" size={32} /></View><View style={styles.headerCopy}><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">YOUR PROFILE</ThemedText><ThemedText accessibilityRole="header" style={styles.title} type="title">A steady, flexible rhythm.</ThemedText></View></View>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>Here is a starting point based on your answers. Keep what feels useful and change anything that does not.</ThemedText>
          <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">SUGGESTED PREFERENCES</ThemedText><ProfileCard action={action} border={border} detail="Short, steady blocks with a clear finish." icon="timer-outline" surface={surface} title="Focus pace" value="Steady blocks" /><ProfileCard action={action} border={border} detail="A small pause helps you return with more clarity." icon="cafe-outline" surface={surface} title="Recovery" value="Short breaks" /><ProfileCard action={action} border={border} detail="Gentle prompts only, so your attention stays yours." icon="notifications-off-outline" surface={surface} title="Guidance" value="Low interruption" /></View>
          <ThemedView style={[styles.noteCard, { backgroundColor: surface, borderColor: border }]}><Ionicons color={action} name="sparkles-outline" size={22} /><View style={styles.noteCopy}><ThemedText type="smallBold">Suggestions, not rules.</ThemedText><ThemedText themeColor="textSecondary" type="small">Nothing here changes your settings or tasks until you explicitly choose to apply it.</ThemedText></View></ThemedView>
          <Button accentColor={action} fullWidth label="Start a Focus Session" onPress={() => router.push('/focus/setup')} style={{ backgroundColor: action, borderColor: action }} /><Button label="Back to Home" onPress={() => router.replace('/(tabs)/home')} variant="ghost" />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function ProfileCard({ action, border, detail, icon, surface, title, value }: { action: string; border: string; detail: string; icon: keyof typeof Ionicons.glyphMap; surface: string; title: string; value: string }) {
  return <ThemedView style={[styles.profileCard, { backgroundColor: surface, borderColor: border }]}><View style={[styles.cardIcon, { backgroundColor: Palette.homeLightActionSoft }]}><Ionicons color={action} name={icon} size={22} /></View><View style={styles.cardCopy}><ThemedText themeColor="textSecondary" type="small">{title}</ThemedText><ThemedText type="subtitle" style={styles.value}>{value}</ThemedText><ThemedText themeColor="textSecondary" type="small">{detail}</ThemedText></View><Ionicons color={action} name="chevron-forward" size={19} /></ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scrollContent: { flexGrow: 1, alignItems: 'center', padding: Spacing.lg }, content: { width: '100%', maxWidth: 560, gap: Spacing.md }, back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }, headerRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm }, icon: { alignItems: 'center', borderRadius: 40, borderWidth: 1, height: 72, justifyContent: 'center', width: 72 }, headerCopy: { flex: 1, gap: Spacing.xs }, eyebrow: { letterSpacing: 1.1 }, title: { fontSize: 30, lineHeight: 36 }, subtitle: { lineHeight: Typography.body.fontSize * 1.5 }, section: { gap: Spacing.sm, marginTop: Spacing.sm }, sectionLabel: { letterSpacing: 1.1, marginBottom: Spacing.xs }, profileCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 88, padding: Spacing.md }, cardIcon: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 }, cardCopy: { flex: 1, gap: 2 }, value: { fontSize: 19, lineHeight: 25 }, noteCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.md }, noteCopy: { flex: 1, gap: Spacing.xs },
});
