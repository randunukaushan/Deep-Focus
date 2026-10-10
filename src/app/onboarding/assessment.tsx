import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAssessmentFlow } from '@/features/assessment/assessment-flow-context';
import { ASSESSMENT_QUESTIONS } from '@/features/assessment/assessment-definition';
import { getAppLocaleCopy } from '@/features/localization/app-locale';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function AssessmentRoute() {
  const router = useRouter();
  const { copy } = useAppLocale();
  const assessmentCopy = copy.onboarding?.assessment ?? getAppLocaleCopy('en').onboarding!.assessment;
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const { answers, clearAnswers, setAnswers, flowState, errorMessage, retryPersistence } = useAssessmentFlow();
  const isReady = flowState === undefined || flowState === 'ready' || flowState === 'saving' || flowState === 'error';
  const [step, setStep] = useState(0);
  const question = ASSESSMENT_QUESTIONS[step];
  const selected = answers[question.id] ?? null;
  const progress = useMemo(() => `${step + 1} of ${ASSESSMENT_QUESTIONS.length}`, [step]);
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;

  const choose = (id: string) => { if (isReady) setAnswers({ ...answers, [question.id]: id }); };
  const next = () => step === ASSESSMENT_QUESTIONS.length - 1 ? router.push('/onboarding/productivity-profile') : setStep((current) => current + 1);

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Pressable accessibilityLabel={assessmentCopy.backOnboarding} accessibilityRole="button" onPress={() => step === 0 ? router.back() : setStep((current) => current - 1)} style={styles.back}>
            <Ionicons color={action} name="arrow-back" size={20} />
            <ThemedText style={{ color: action }} type="smallBold">{step === 0 ? assessmentCopy.backOnboarding : assessmentCopy.previous}</ThemedText>
          </Pressable>
          <View style={styles.headerRow}><View><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{assessmentCopy.eyebrow}</ThemedText><ThemedText accessibilityRole="header" style={styles.title} type="title">{assessmentCopy.title}</ThemedText></View><ThemedText style={{ color: action }} type="smallBold">{progress}</ThemedText></View>
          <View accessibilityLabel={`${assessmentCopy.eyebrow}: ${progress}`} accessibilityLiveRegion="polite" style={[styles.track, { backgroundColor: softAction }]}><View style={[styles.fill, { backgroundColor: action, width: `${((step + 1) / ASSESSMENT_QUESTIONS.length) * 100}%` }]} /></View>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>{assessmentCopy.subtitle}</ThemedText>

          <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText type="subtitle" style={styles.prompt}>{question.prompt}</ThemedText>
            {!isReady ? <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">{assessmentCopy.loading}</ThemedText> : null}
            {errorMessage ? <ThemedText accessibilityRole="alert" themeColor="textSecondary">{assessmentCopy.error}</ThemedText> : null}
            <View accessibilityLabel={assessmentCopy.choices} accessibilityRole="radiogroup" style={styles.options}>{question.options.map((option) => { const isSelected = selected === option.id; return <Pressable accessibilityLabel={option.label} accessibilityRole="radio" accessibilityState={{ disabled: !isReady, selected: isSelected }} key={option.id} onPress={() => choose(option.id)} style={({ pressed }) => [styles.option, { backgroundColor: isSelected ? softAction : 'transparent', borderColor: isSelected ? action : border }, pressed && styles.pressed]}><View style={[styles.radio, { borderColor: isSelected ? action : border, backgroundColor: isSelected ? action : 'transparent' }]}>{isSelected ? <Ionicons color={Palette.deepNavy} name="checkmark" size={15} /> : null}</View><ThemedText style={isSelected ? { color: isDark ? theme.text : Palette.deepNavy } : undefined}>{option.label}</ThemedText></Pressable>; })}</View>
          </ThemedView>
          <Button accentColor={action} disabled={selected === null || !isReady} fullWidth label={step === ASSESSMENT_QUESTIONS.length - 1 ? assessmentCopy.viewProfile : assessmentCopy.next} onPress={next} style={{ backgroundColor: action, borderColor: action }} />
          {errorMessage ? <Button accentColor={action} label={assessmentCopy.retry} onPress={retryPersistence} variant="secondary" /> : null}
          <Button label={assessmentCopy.skip} onPress={() => { clearAnswers(); router.replace('/(tabs)/home'); }} variant="ghost" />
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">{assessmentCopy.privacy}</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', padding: Spacing.lg },
  content: { width: '100%', maxWidth: 560, gap: Spacing.md },
  back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerRow: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  eyebrow: { letterSpacing: 1.1 },
  title: { marginTop: Spacing.sm },
  track: { borderRadius: 8, height: 8, overflow: 'hidden' },
  fill: { borderRadius: 8, height: '100%' },
  subtitle: { lineHeight: Typography.body.fontSize * 1.5 },
  card: { marginTop: Spacing.sm, padding: Spacing.lg, gap: Spacing.lg, borderWidth: 1, borderRadius: Radius.card },
  prompt: { lineHeight: 32 },
  options: { gap: Spacing.sm },
  option: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 56, paddingHorizontal: Spacing.md },
  radio: { alignItems: 'center', borderRadius: 12, borderWidth: 1, height: 24, justifyContent: 'center', width: 24 },
  pressed: { opacity: 0.78 },
  privacy: { marginTop: Spacing.sm, textAlign: 'center' },
});
