import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAssessmentFlow } from '@/features/assessment/assessment-flow-context';
import { buildAssessmentProfile } from '@/features/assessment/assessment-definition';
import { buildAssessmentSettingsSuggestion } from '@/features/assessment/assessment-personalization';
import { applyAssessmentSettings } from '@/features/assessment/assessment-settings-application';
import { useState } from 'react';
import { getAppLocaleCopy } from '@/features/localization/app-locale';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function ProductivityProfileRoute() {
  const router = useRouter();
  const { copy } = useAppLocale();
  const profileCopy = copy.onboarding?.profile ?? getAppLocaleCopy('en').onboarding!.profile;
  const { answers, clearAnswers, flowState, errorMessage, retryPersistence } = useAssessmentFlow();
  const [applyState, setApplyState] = useState<'idle' | 'applying' | 'applied' | 'error'>('idle');
  const [applyError, setApplyError] = useState(false);
  const profile = buildAssessmentProfile(answers);
  const settingsSuggestion = buildAssessmentSettingsSuggestion(answers);
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
          <Pressable accessibilityLabel={profileCopy.back} accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Ionicons color={action} name="arrow-back" size={20} /><ThemedText style={{ color: action }} type="smallBold">{profileCopy.back}</ThemedText></Pressable>
          <View style={styles.headerRow}><View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="person-circle-outline" size={32} /></View><View style={styles.headerCopy}><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{profileCopy.eyebrow}</ThemedText><ThemedText accessibilityRole="header" style={styles.title} type="title">{profileCopy.title}</ThemedText></View></View>
          {!profile ? <>
            <ThemedView accessibilityLabel={profileCopy.noAnswers} style={[styles.noteCard, { backgroundColor: surface, borderColor: border }]}><Ionicons color={action} name="information-circle-outline" size={22} /><View style={styles.noteCopy}><ThemedText type="smallBold">{profileCopy.noAnswers}</ThemedText><ThemedText themeColor="textSecondary" type="small">{profileCopy.noAnswersDetail}</ThemedText></View></ThemedView>
            <Button accentColor={action} fullWidth label={profileCopy.start} onPress={() => router.push('/onboarding/assessment')} style={{ backgroundColor: action, borderColor: action }} />
            <Button label={profileCopy.continueDefaults} onPress={() => router.replace('/(tabs)/home')} variant="ghost" />
          </> : <>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>{profileCopy.subtitle}</ThemedText>
            <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">{profileCopy.shared}</ThemedText>{profile.sharedPreferences.map((item, index) => <ProfileCard action={action} border={border} detail={profileCopy.sharedDetail} icon={index === 2 ? 'cafe-outline' : 'checkmark-circle-outline'} key={item.questionId} surface={surface} title={item.label} value={item.value} />)}</View>
            <View style={styles.section}><ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">{profileCopy.suggestions}</ThemedText>{profile.suggestions.map((item) => <ProfileCard action={action} border={border} detail={profileCopy.suggestionDetail} icon="sparkles-outline" key={item.title} surface={surface} title={item.title} value={item.text} />)}</View>
            <ThemedView style={[styles.noteCard, { backgroundColor: surface, borderColor: border }]}><Ionicons color={action} name="shield-checkmark-outline" size={22} /><View style={styles.noteCopy}><ThemedText type="smallBold">{profileCopy.saved}</ThemedText><ThemedText themeColor="textSecondary" type="small">{profileCopy.savedDetail}</ThemedText>{flowState === 'saving' ? <ThemedText themeColor="textSecondary" type="small">{profileCopy.saving}</ThemedText> : null}{errorMessage ? <ThemedText accessibilityRole="alert" themeColor="textSecondary" type="small">{profileCopy.saveError}</ThemedText> : null}</View></ThemedView>
            {errorMessage ? <Button accentColor={action} label={profileCopy.retry} onPress={retryPersistence} variant="secondary" /> : null}
            {settingsSuggestion ? <>
              <ThemedView accessibilityLabel={profileCopy.review} style={[styles.noteCard, { backgroundColor: surface, borderColor: border }]}><Ionicons color={action} name="options-outline" size={22} /><View style={styles.noteCopy}><ThemedText type="smallBold">{profileCopy.review}</ThemedText><ThemedText themeColor="textSecondary" type="small">{profileCopy.reviewDetail.replace('{focus}', String(settingsSuggestion.defaultFocusDurationMinutes)).replace('{break}', String(settingsSuggestion.defaultBreakDurationMinutes))}</ThemedText>{applyState === 'applied' ? <ThemedText type="smallBold">{profileCopy.applied}</ThemedText> : null}{applyState === 'error' ? <ThemedText accessibilityRole="alert" type="small">{profileCopy.applyError}</ThemedText> : null}</View></ThemedView>
              <Button accentColor={action} disabled={applyState === 'applying' || flowState === 'saving' || flowState === 'error'} fullWidth label={applyState === 'applied' ? profileCopy.appliedButton : profileCopy.apply} onPress={() => { setApplyState('applying'); setApplyError(false); void applyAssessmentSettings(answers).then(() => setApplyState('applied')).catch(() => { setApplyState('error'); setApplyError(true); }); }} style={{ backgroundColor: action, borderColor: action }} />
              {applyError ? <ThemedText accessibilityRole="alert" themeColor="textSecondary" type="small">{profileCopy.applyError}</ThemedText> : null}
            </> : null}
            <Button accentColor={action} fullWidth label={profileCopy.startFocus} onPress={() => router.push('/focus/setup')} style={{ backgroundColor: action, borderColor: action }} />
            <Button label={profileCopy.useDefaults} onPress={() => { clearAnswers(); router.replace('/(tabs)/home'); }} variant="ghost" />
          </>}
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
