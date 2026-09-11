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

const QUESTIONS = [
  { prompt: 'When does focused work feel easiest?', options: ['Early in the day', 'In the afternoon', 'In the evening', 'It changes day to day'] },
  { prompt: 'What kind of pace supports you best?', options: ['Short, steady blocks', 'Longer quiet blocks', 'A flexible mix', 'I am still exploring'] },
  { prompt: 'What would you like more space for?', options: ['Deep work', 'Learning', 'Creative work', 'A calmer daily rhythm'] },
] as const;

export default function AssessmentRoute() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUESTIONS.map(() => null));
  const question = QUESTIONS[step];
  const selected = answers[step];
  const progress = useMemo(() => `${step + 1} of ${QUESTIONS.length}`, [step]);
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;

  const choose = (index: number) => setAnswers((current) => current.map((answer, indexInList) => indexInList === step ? index : answer));
  const next = () => step === QUESTIONS.length - 1 ? router.push('/onboarding/productivity-profile') : setStep((current) => current + 1);

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Pressable accessibilityLabel="Back to onboarding" accessibilityRole="button" onPress={() => step === 0 ? router.back() : setStep((current) => current - 1)} style={styles.back}>
            <Ionicons color={action} name="arrow-back" size={20} />
            <ThemedText style={{ color: action }} type="smallBold">{step === 0 ? 'Onboarding' : 'Previous question'}</ThemedText>
          </Pressable>
          <View style={styles.headerRow}><View><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">PERSONAL ASSESSMENT</ThemedText><ThemedText accessibilityRole="header" style={styles.title} type="title">A few questions, at your pace.</ThemedText></View><ThemedText style={{ color: action }} type="smallBold">{progress}</ThemedText></View>
          <View accessibilityLabel={`Assessment progress: ${progress}`} style={[styles.track, { backgroundColor: softAction }]}><View style={[styles.fill, { backgroundColor: action, width: `${((step + 1) / QUESTIONS.length) * 100}%` }]} /></View>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>There are no wrong answers. Choose what feels closest, or go back and change it.</ThemedText>

          <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText type="subtitle" style={styles.prompt}>{question.prompt}</ThemedText>
            <View style={styles.options}>{question.options.map((option, index) => { const isSelected = selected === index; return <Pressable accessibilityLabel={option} accessibilityRole="radio" accessibilityState={{ selected: isSelected }} key={option} onPress={() => choose(index)} style={({ pressed }) => [styles.option, { backgroundColor: isSelected ? softAction : 'transparent', borderColor: isSelected ? action : border }, pressed && styles.pressed]}><View style={[styles.radio, { borderColor: isSelected ? action : border, backgroundColor: isSelected ? action : 'transparent' }]}>{isSelected ? <Ionicons color={Palette.deepNavy} name="checkmark" size={15} /> : null}</View><ThemedText style={isSelected ? { color: isDark ? theme.text : Palette.deepNavy } : undefined}>{option}</ThemedText></Pressable>; })}</View>
          </ThemedView>
          <Button accentColor={action} disabled={selected === null} fullWidth label={step === QUESTIONS.length - 1 ? 'View My Profile' : 'Next question'} onPress={next} style={{ backgroundColor: action, borderColor: action }} />
          <Button label="Skip assessment" onPress={() => router.replace('/(tabs)/home')} variant="ghost" />
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">Your answers are used to prepare suggestions for your review.</ThemedText>
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
