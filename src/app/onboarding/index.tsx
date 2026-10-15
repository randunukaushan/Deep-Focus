import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAssessmentFlow } from '@/features/assessment/assessment-flow-context';
import { getAppLocaleCopy } from '@/features/localization/app-locale';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { loadSettings, saveSettings, type AppLocale } from '@/features/settings/settings-storage';

export default function OnboardingRoute() {
  const router = useRouter();
  const { copy, locale, setLocale } = useAppLocale();
  const introCopy = copy.onboarding?.intro ?? getAppLocaleCopy('en').onboarding!.intro;
  const settingsPageCopy = copy.settingsPage ?? getAppLocaleCopy('en').settingsPage!;
  const { clearAnswers } = useAssessmentFlow();
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [languageSaveError, setLanguageSaveError] = useState(false);

  async function updateLanguage(value: AppLocale) {
    if (savingLanguage || value === locale) return;
    setSavingLanguage(true);
    setLanguageSaveError(false);
    try {
      const settings = await loadSettings();
      await saveSettings({ ...settings, uiLocale: value });
      setLocale(value);
    } catch {
      setLanguageSaveError(true);
    } finally {
      setSavingLanguage(false);
    }
  }

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Pressable accessibilityLabel="Back to welcome" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons color={action} name="arrow-back" size={20} />
            <ThemedText style={{ color: action }} type="smallBold">{introCopy.back}</ThemedText>
          </Pressable>
          <View style={[styles.heroIcon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="compass-outline" size={34} /></View>
          <ThemedText accessibilityRole="header" style={styles.title} type="title">{introCopy.title}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>{introCopy.subtitle}</ThemedText>

          <View style={styles.steps}>
            <Step action={action} border={border} icon="create-outline" number="01" title={introCopy.stepOneTitle} detail={introCopy.stepOneDetail} surface={surface} />
            <Step action={action} border={border} icon="options-outline" number="02" title={introCopy.stepTwoTitle} detail={introCopy.stepTwoDetail} surface={surface} />
            <Step action={action} border={border} icon="leaf-outline" number="03" title={introCopy.stepThreeTitle} detail={introCopy.stepThreeDetail} surface={surface} />
          </View>
          <ThemedView accessibilityLabel={`${copy.settings.language}: ${locale}`} style={[styles.languageCard, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText type="smallBold">{copy.settings.language}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">{savingLanguage ? settingsPageCopy.saving : copy.settings.languageHint}</ThemedText>
            <View accessibilityRole="radiogroup" style={styles.languageOptions}>
              {([{ value: 'si', label: 'සිංහල' }, { value: 'ta', label: 'தமிழ்' }, { value: 'en', label: 'English' }] as const).map((option) => {
                const selected = option.value === locale;
                return <Pressable accessibilityLabel={`${copy.settings.language}: ${option.label}`} accessibilityRole="radio" accessibilityState={{ disabled: savingLanguage, selected }} disabled={savingLanguage} key={option.value} onPress={() => { void updateLanguage(option.value); }} style={({ pressed }) => [styles.languageOption, { backgroundColor: selected ? action : 'transparent', borderColor: selected ? action : border }, pressed && styles.pressed]}><ThemedText style={selected ? { color: Palette.deepNavy } : undefined} type="smallBold">{option.label}</ThemedText></Pressable>;
              })}
            </View>
            {languageSaveError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary" type="small">{settingsPageCopy.saveError}</ThemedText> : null}
          </ThemedView>
          <Button accentColor={action} fullWidth label={introCopy.start} onPress={() => { clearAnswers(); router.push('/onboarding/assessment'); }} style={{ backgroundColor: action, borderColor: action }} />
          <Button label={introCopy.skip} onPress={() => router.replace('/(tabs)/home')} variant="ghost" />
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">{introCopy.privacy}</ThemedText>
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
  languageCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.xs, padding: Spacing.md },
  languageOptions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  languageOption: { alignItems: 'center', borderRadius: 10, borderWidth: 1, justifyContent: 'center', minHeight: 44, minWidth: 78, paddingHorizontal: Spacing.sm },
  pressed: { opacity: 0.78 },
  privacy: { marginTop: Spacing.sm, textAlign: 'center' },
});
