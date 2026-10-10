import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { loadSettings, saveSettings, type AppLocale, type AppSettings } from '@/features/settings/settings-storage';
import { getAppLocaleCopy } from '@/features/localization/app-locale';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function SettingsRoute() {
  const { setLocale: setAppLocale, copy } = useAppLocale();
  const settingsCopy = copy.settingsPage ?? getAppLocaleCopy('en').settingsPage!;
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? theme.background : Palette.homeLightActionSoft;
  const [focusDuration, setFocusDuration] = useState<AppSettings['defaultFocusDurationMinutes']>(25);
  const [breakDuration, setBreakDuration] = useState<5 | 10 | 15>(5);
  const [locale, setLocale] = useState<AppLocale>('en');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const retryRef = useRef<() => void>(() => {});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const settings = await loadSettings();
        if (!mounted) return;
        setFocusDuration(settings.defaultFocusDurationMinutes);
        setBreakDuration(settings.defaultBreakDurationMinutes);
        setLocale(settings.uiLocale);
        setAppLocale(settings.uiLocale);
      } catch {
        if (mounted) setLoadError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    retryRef.current = () => { void load(); };
    void load();
    return () => { mounted = false; retryRef.current = () => {}; };
  }, [setAppLocale]);

  async function updateBreakDuration(value: 5 | 10 | 15) {
    if (savingRef.current || saving || loading || loadError || value === breakDuration) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      await saveSettings({ defaultFocusDurationMinutes: focusDuration, defaultBreakDurationMinutes: value, uiLocale: locale });
      setBreakDuration(value);
    } catch {
      setSaveError(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function updateFocusDuration(value: AppSettings['defaultFocusDurationMinutes']) {
    if (savingRef.current || saving || loading || loadError || value === focusDuration) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      await saveSettings({ defaultFocusDurationMinutes: value, defaultBreakDurationMinutes: breakDuration, uiLocale: locale });
      setFocusDuration(value);
    } catch {
      setSaveError(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function updateLocale(value: AppLocale) {
    if (savingRef.current || saving || loading || loadError || value === locale) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      await saveSettings({ defaultFocusDurationMinutes: focusDuration, defaultBreakDurationMinutes: breakDuration, uiLocale: value });
      setLocale(value);
      setAppLocale(value);
    } catch {
      setSaveError(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Pressable accessibilityLabel={settingsCopy.back} accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
            <Ionicons color={action} name="arrow-back" size={20} />
            <ThemedText style={{ color: action }} type="smallBold">{settingsCopy.back}</ThemedText>
          </Pressable>
          <View style={styles.header}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{settingsCopy.eyebrow}</ThemedText>
            <ThemedText accessibilityRole="header" type="title" style={styles.title}>{settingsCopy.title}</ThemedText>
            <ThemedText themeColor="textSecondary">{settingsCopy.subtitle}</ThemedText>
          </View>

          {loading ? <ThemedView accessibilityLabel={settingsCopy.loading} accessibilityLiveRegion="polite" style={[styles.stateCard, { backgroundColor: surface, borderColor: border }]}><ThemedText themeColor="textSecondary">{settingsCopy.loading}</ThemedText></ThemedView> : loadError ? <ThemedView accessibilityRole="alert" accessibilityLabel={settingsCopy.loadErrorTitle} style={[styles.stateCard, { backgroundColor: surface, borderColor: border }]}><ThemedText type="subtitle">{settingsCopy.loadErrorTitle}</ThemedText><ThemedText themeColor="textSecondary">{settingsCopy.loadErrorDetail}</ThemedText><Pressable accessibilityLabel={settingsCopy.retry} accessibilityRole="button" onPress={() => retryRef.current()} style={[styles.retryButton, { borderColor: action }]}><ThemedText style={{ color: action }} type="smallBold">{settingsCopy.retry}</ThemedText></Pressable></ThemedView> : <>
          <SettingsSection action={action} label={settingsCopy.focusSection} />
          <ThemedView accessibilityLabel={`${settingsCopy.focusDuration}: ${focusDuration}`} style={[styles.durationCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.infoIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="timer-outline" size={22} /></View>
            <View style={styles.durationCopy}><ThemedText type="smallBold">{settingsCopy.focusDuration}</ThemedText><ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary" type="small">{saving ? settingsCopy.saving : settingsCopy.focusHint}</ThemedText><View accessibilityRole="radiogroup" style={styles.durationOptions}>{[25, 45, 60].map((value) => { const selected = value === focusDuration; return <Pressable accessibilityLabel={`${settingsCopy.focusDuration}: ${value}m`} accessibilityRole="radio" accessibilityState={{ selected }} key={value} onPress={() => { void updateFocusDuration(value as AppSettings['defaultFocusDurationMinutes']); }} disabled={saving} style={({ pressed }) => [styles.durationOption, { backgroundColor: selected ? action : 'transparent', borderColor: selected ? action : border }, pressed && styles.pressed]}><ThemedText style={selected ? { color: Palette.deepNavy } : undefined} type="smallBold">{value}m</ThemedText></Pressable>; })}</View></View>
          </ThemedView>
          <ThemedView accessibilityLabel={`${settingsCopy.breakDuration}: ${breakDuration}`} style={[styles.durationCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.infoIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="cafe-outline" size={22} /></View>
            <View style={styles.durationCopy}><ThemedText type="smallBold">{settingsCopy.breakDuration}</ThemedText><ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary" type="small">{saving ? settingsCopy.saving : settingsCopy.breakHint}</ThemedText><View accessibilityRole="radiogroup" style={styles.durationOptions}>{[5, 10, 15].map((value) => { const selected = value === breakDuration; return <Pressable accessibilityLabel={`${settingsCopy.breakDuration}: ${value}m`} accessibilityRole="radio" accessibilityState={{ selected }} key={value} onPress={() => { void updateBreakDuration(value as 5 | 10 | 15); }} disabled={saving} style={({ pressed }) => [styles.durationOption, { backgroundColor: selected ? action : 'transparent', borderColor: selected ? action : border }, pressed && styles.pressed]}><ThemedText style={selected ? { color: Palette.deepNavy } : undefined} type="smallBold">{value}m</ThemedText></Pressable>; })}</View>{saveError ? <ThemedText accessibilityLiveRegion="polite" style={{ color: Palette.error }} type="small">{settingsCopy.saveError}</ThemedText> : null}</View>
          </ThemedView>

          <SettingsSection action={action} label={settingsCopy.appearanceSection} />
          <ThemedView accessibilityLabel={`${settingsCopy.appearance}: ${settingsCopy.systemTheme}`} style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.infoIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="contrast-outline" size={22} /></View>
            <View style={styles.rowCopy}><ThemedText type="smallBold">{settingsCopy.appearance}</ThemedText><ThemedText themeColor="textSecondary" type="small">{settingsCopy.systemTheme}</ThemedText></View>
          </ThemedView>
          <SettingsRow action={action} border={border} icon="sparkles-outline" label={settingsCopy.reducedMotion} detail={settingsCopy.reducedMotionDetail} />
          <ThemedView accessibilityLabel={`${copy.settings.language}: ${locale}`} style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.infoIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="language-outline" size={22} /></View>
            <View style={styles.durationCopy}><ThemedText type="smallBold">{copy.settings.language}</ThemedText><ThemedText themeColor="textSecondary" type="small">{copy.settings.languageHint} {settingsCopy.languageDetailSuffix}</ThemedText><View accessibilityRole="radiogroup" style={styles.durationOptions}>{([{ value: 'si', label: 'සිංහල' }, { value: 'ta', label: 'தமிழ்' }, { value: 'en', label: 'English' }] as const).map((option) => { const selected = option.value === locale; return <Pressable accessibilityLabel={`${copy.settings.language}: ${option.label}`} accessibilityRole="radio" accessibilityState={{ selected }} key={option.value} onPress={() => { void updateLocale(option.value); }} disabled={saving} style={({ pressed }) => [styles.durationOption, { backgroundColor: selected ? action : 'transparent', borderColor: selected ? action : border }, pressed && styles.pressed]}><ThemedText style={selected ? { color: Palette.deepNavy } : undefined} type="smallBold">{option.label}</ThemedText></Pressable>; })}</View>{saveError ? <ThemedText accessibilityLiveRegion="polite" style={{ color: Palette.error }} type="small">{settingsCopy.saveError}</ThemedText> : null}</View>
          </ThemedView>

          <SettingsSection action={action} label={settingsCopy.notificationsSection} />
          <SettingsRow action={action} border={border} icon="notifications-outline" label={settingsCopy.notifications} detail={settingsCopy.notificationsDetail} />
          <SettingsRow action={action} border={border} icon="volume-medium-outline" label={settingsCopy.sound} detail={settingsCopy.soundDetail} />

          <SettingsSection action={action} label={settingsCopy.privacySection} />
          <ThemedView accessibilityLabel={`${settingsCopy.localFirst}: ${settingsCopy.localFirstDetail}`} style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.infoIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="shield-checkmark-outline" size={22} /></View>
            <View style={styles.rowCopy}><ThemedText type="smallBold">{settingsCopy.localFirst}</ThemedText><ThemedText themeColor="textSecondary" type="small">{settingsCopy.localFirstDetail}</ThemedText></View>
          </ThemedView>
          <SettingsRow action={action} border={border} icon="log-in-outline" label={settingsCopy.account} detail={settingsCopy.accountDetail} onPress={() => router.push('/auth/sign-in')} />
          </>}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function SettingsSection({ action, label }: { action: string; label: string }) {
  return <ThemedText style={[styles.sectionLabel, { color: action }]} type="smallBold">{label}</ThemedText>;
}

function SettingsRow({ action, border, detail, icon, label, onPress }: { action: string; border: string; detail: string; icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  const content = <>
    <View style={[styles.rowIcon, { borderColor: border }]}><Ionicons color={action} name={icon} size={21} /></View>
    <View style={styles.rowCopy}><ThemedText type="smallBold">{label}</ThemedText><ThemedText themeColor="textSecondary" type="small">{detail}</ThemedText></View>
    {onPress ? <Ionicons color={action} name="chevron-forward" size={19} /> : null}
  </>;
  return onPress ? <Pressable accessibilityLabel={`${label}. ${detail}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, { borderColor: border }, pressed && styles.pressed]}>{content}</Pressable> : <ThemedView accessibilityLabel={`${label}. ${detail}`} style={[styles.row, { backgroundColor: 'transparent', borderColor: border }]}>{content}</ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.sm, maxWidth: 560, paddingBottom: Spacing.lg, width: '100%' }, stateCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, retryButton: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, justifyContent: 'center', minHeight: 48, paddingHorizontal: Spacing.md },
  back: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: Spacing.xs, minHeight: 44, paddingRight: Spacing.md }, header: { gap: Spacing.xs, marginBottom: Spacing.md }, title: { fontSize: 38, lineHeight: 44 }, eyebrow: { letterSpacing: 1.2 }, sectionLabel: { letterSpacing: 1.1, marginTop: Spacing.md, paddingHorizontal: Spacing.xs },
  row: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 72, padding: Spacing.md }, rowIcon: { alignItems: 'center', borderRadius: 20, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 }, rowCopy: { flex: 1, gap: 2 }, infoCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 76, padding: Spacing.md }, durationCard: { alignItems: 'flex-start', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.md }, durationCopy: { flex: 1, gap: Spacing.xs }, durationOptions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs }, durationOption: { alignItems: 'center', borderRadius: 10, borderWidth: 1, minHeight: 40, justifyContent: 'center', minWidth: 54, paddingHorizontal: Spacing.sm }, infoIcon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 }, pressed: { opacity: 0.78 },
});
