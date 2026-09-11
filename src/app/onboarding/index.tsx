import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export default function OnboardingRoute() {
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Pressable accessibilityLabel="Back to welcome" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons color={action} name="arrow-back" size={20} />
            <ThemedText style={{ color: action }} type="smallBold">Welcome</ThemedText>
          </Pressable>
          <View style={[styles.heroIcon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="compass-outline" size={34} /></View>
          <ThemedText accessibilityRole="header" style={styles.title} type="title">Build a focus practice that fits.</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>A few thoughtful questions help Deep Focus make the experience more useful without adding pressure.</ThemedText>

          <View style={styles.steps}>
            <Step action={action} border={border} icon="create-outline" number="01" title="Share what helps" detail="Tell us about your preferred pace and focus environment." surface={surface} />
            <Step action={action} border={border} icon="options-outline" number="02" title="Shape your setup" detail="Review the suggestions before anything is applied." surface={surface} />
            <Step action={action} border={border} icon="leaf-outline" number="03" title="Start gently" detail="Begin with a calm, reliable session when you are ready." surface={surface} />
          </View>
          <Button accentColor={action} fullWidth label="Start Personal Assessment" onPress={() => router.push('/onboarding/assessment')} style={{ backgroundColor: action, borderColor: action }} />
          <Button label="Skip for now" onPress={() => router.replace('/(tabs)/home')} variant="ghost" />
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">You stay in control. Your answers are suggestions, not commitments.</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Step({ action, border, detail, icon, number, surface, title }: { action: string; border: string; detail: string; icon: keyof typeof Ionicons.glyphMap; number: string; surface: string; title: string }) {
  return <ThemedView style={[styles.step, { backgroundColor: surface, borderColor: border }]}><View style={[styles.stepIcon, { backgroundColor: Palette.homeLightActionSoft }]}><Ionicons color={action} name={icon} size={22} /></View><View style={styles.stepCopy}><ThemedText style={{ color: action }} type="smallBold">{number}</ThemedText><ThemedText type="smallBold">{title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{detail}</ThemedText></View></ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', padding: Spacing.lg },
  content: { width: '100%', maxWidth: 560, gap: Spacing.md },
  back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  heroIcon: { alignItems: 'center', borderRadius: 40, borderWidth: 1, height: 72, justifyContent: 'center', marginTop: Spacing.sm, width: 72 },
  title: { marginTop: Spacing.sm },
  subtitle: { lineHeight: Typography.body.fontSize * 1.5 },
  steps: { gap: Spacing.sm, marginTop: Spacing.sm },
  step: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 88, padding: Spacing.md },
  stepIcon: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  stepCopy: { flex: 1, gap: 2 },
  privacy: { marginTop: Spacing.sm, textAlign: 'center' },
});
