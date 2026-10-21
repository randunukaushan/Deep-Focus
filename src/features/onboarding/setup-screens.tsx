import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { usePresentation } from '@/features/settings/presentation-context';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from './onboarding-context';
import { useSetup } from './setup-context';
import { SETUP_QUESTIONS, setupReview, type SetupField } from './setup-definition';
import { getSetupCopy, setupValueLabel } from './setup-copy';
import { SetupChoice, SetupFeedback, SetupFrame, setupStyles as styles, useSetupAction } from './setup-ui';

export function SetupWelcomeScreen() {
  const router = useRouter();
  const { locale, setLocale } = useAppLocale();
  const copy = getSetupCopy(locale);
  const flow = useSetup();
  const onboarding = useOnboarding();
  const action = useSetupAction();
  const disabled = action.busy || flow.status !== 'ready';
  return <SetupFrame step={1} scene>
    <ThemedText accessibilityRole="header" type="title" style={styles.title}>{copy.welcome}</ThemedText>
    <ThemedText themeColor="textSecondary">{copy.intro}</ThemedText>
    <ThemedText type="smallBold">{copy.language}</ThemedText>
    <View accessibilityRole="radiogroup" accessibilityLabel={copy.language} style={styles.options}>
      {([{ id: 'si', label: 'සිංහල' }, { id: 'ta', label: 'தமிழ்' }, { id: 'en', label: 'English' }] as const).map(option => <SetupChoice key={option.id} label={option.label} selected={locale === option.id} disabled={disabled} onPress={() => { void action.run(async active => { if (!await flow.saveLocale(option.id)) throw new Error('SETUP_LANGUAGE_FAILED'); if (active()) setLocale(option.id); }); }} />)}
    </View>
    <ThemedText type="small" themeColor="textSecondary">{copy.languageHint}</ThemedText>
    <SetupFeedback />
    {action.error ? <ThemedText accessibilityRole="alert">{copy.navError}</ThemedText> : null}
    <View style={styles.actions}>
      <Button label={copy.next} disabled={disabled} loading={action.busy} onPress={() => { void action.run(async active => {
        if (!await flow.saveLocale(locale) || !active()) throw new Error('SETUP_LANGUAGE_FAILED');
        if (!await flow.ensureDraft() || !active()) return;
        await onboarding.beginAssessment();
        if (active()) router.replace('/onboarding/assessment');
      }); }} />
      <Button label={copy.skip} variant="ghost" disabled={action.busy} onPress={() => { void action.run(async active => {
        if (!await flow.saveLocale(locale) || !active()) throw new Error('SETUP_LANGUAGE_FAILED');
        await onboarding.skip(); if (active()) router.replace('/(tabs)/home');
      }); }} />
    </View>
  </SetupFrame>;
}

export function SetupQuestionsScreen() {
  const router = useRouter();
  const { locale } = useAppLocale();
  const copy = getSetupCopy(locale);
  const flow = useSetup();
  const onboarding = useOnboarding();
  const action = useSetupAction();
  const question = SETUP_QUESTIONS[flow.questionIndex];
  const text = copy.questions[question.id];
  const disabled = action.busy || flow.status !== 'ready';
  const advance = async (active: () => boolean) => {
    if (!active()) return;
    if (flow.questionIndex < SETUP_QUESTIONS.length - 1) { flow.move(flow.questionIndex + 1); return; }
    await onboarding.setStep('profile');
    if (active()) router.replace('/onboarding/productivity-profile');
  };
  return <SetupFrame step={flow.questionIndex + 2} onBack={() => { if (disabled) return; if (flow.questionIndex > 0) flow.move(flow.questionIndex - 1); else void action.run(async active => { await onboarding.setStep('intro'); if (active()) router.replace('/onboarding'); }); }}>
    <ThemedText accessibilityRole="header" accessibilityLiveRegion="polite" type="title" style={styles.title}>{text.title}</ThemedText>
    <ThemedText themeColor="textSecondary" style={styles.detail}>{text.detail}</ThemedText>
    <View accessibilityRole="radiogroup" accessibilityLabel={text.title} style={styles.options}>
      {question.options.map(option => <SetupChoice key={option} label={option === 'keep' ? copy.keep : text.options[option]} selected={flow.answers[question.id] === option} disabled={disabled} onPress={() => { void flow.answer(question.id, option); }} />)}
    </View>
    <SetupFeedback />
    {action.error ? <ThemedText accessibilityRole="alert">{copy.navError}</ThemedText> : null}
    <View style={styles.actions}>
      <Button label={flow.questionIndex === SETUP_QUESTIONS.length - 1 ? copy.review : copy.next} disabled={disabled || flow.answers[question.id] === undefined} loading={action.busy} onPress={() => { void action.run(advance); }} />
      <Button label={copy.skipQuestion} variant="secondary" disabled={disabled} onPress={() => { void action.run(async active => { if (await flow.answer(question.id, 'keep')) await advance(active); }); }} />
      <Button label={copy.skip} variant="ghost" disabled={action.busy || flow.status === 'saving'} onPress={() => { void action.run(async active => { await onboarding.skip(); if (active()) router.replace('/(tabs)/home'); }); }} />
    </View>
  </SetupFrame>;
}

export function SetupReviewScreen() {
  const router = useRouter();
  const { locale } = useAppLocale();
  const copy = getSetupCopy(locale);
  const theme = useTheme();
  const flow = useSetup();
  const onboarding = useOnboarding();
  const presentation = usePresentation();
  const action = useSetupAction();
  const rows = flow.current ? setupReview(flow.answers, flow.current) : [];
  // A reload/conflict changes the review baseline; stale checkboxes cannot confirm it.
  const signature = JSON.stringify(rows);
  const [selection, setSelection] = useState<{ signature: string; fields: SetupField[] }>({ signature: '', fields: [] });
  const selected = selection.signature === signature ? selection.fields : [];
  const disabled = action.busy || flow.status !== 'ready';
  const finish = (fields: readonly SetupField[]) => { void action.run(async active => {
    if (flow.status !== 'applied' && !await flow.apply(fields)) return;
    if (!active()) return;
    presentation?.retry(); // Refresh cached theme/motion without writing again.
    await onboarding.refresh();
    if (active()) router.replace('/(tabs)/home');
  }); };
  return <SetupFrame onBack={() => { if (disabled) return; void action.run(async active => { flow.move(SETUP_QUESTIONS.length - 1); await onboarding.setStep('assessment'); if (active()) router.replace('/onboarding/assessment'); }); }}>
    <ThemedText accessibilityRole="header" type="title" style={styles.title}>{copy.reviewTitle}</ThemedText>
    <ThemedText themeColor="textSecondary">{copy.reviewDetail}</ThemedText>
    <SetupFeedback />
    <View style={styles.options}>
      {rows.map(row => <SetupChoice key={row.field} checkbox label={copy.fields[row.field]} detail={`${copy.current}: ${setupValueLabel(copy, row.field, row.before)}\n${copy.proposed}: ${setupValueLabel(copy, row.field, row.after)}`} selected={selected.includes(row.field)} disabled={disabled} onPress={() => setSelection(previous => {
        const fields = previous.signature === signature ? previous.fields : [];
        return { signature, fields: fields.includes(row.field) ? fields.filter(field => field !== row.field) : [...fields, row.field] };
      })} />)}
    </View>
    {!rows.length && flow.status === 'ready' ? <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText>{copy.unchanged}</ThemedText></View> : null}
    {flow.status === 'applied' ? <ThemedText accessibilityLiveRegion="polite">{copy.applied}</ThemedText> : null}
    {action.error ? <ThemedText accessibilityRole="alert">{copy.navError}</ThemedText> : null}
    <View style={styles.actions}>
      <Button label={flow.status === 'applied' ? copy.next : copy.apply} disabled={flow.status === 'applied' ? action.busy : disabled || !selected.length} loading={action.busy} onPress={() => finish(selected)} />
      <Button label={copy.continue} variant="secondary" disabled={disabled} onPress={() => finish([])} />
      <Button label={copy.reviewAgain} variant="ghost" disabled={action.busy || flow.status === 'saving' || flow.status === 'applied'} onPress={() => { setSelection({ signature, fields: [] }); void flow.reload(); }} />
    </View>
  </SetupFrame>;
}
