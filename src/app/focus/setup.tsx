import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing, Typography } from '@/theme/tokens';

const PRESETS = [25, 45, 60] as const;
const MINUTES_MIN = 5;
const MINUTES_MAX = 180;

export default function SessionSetupRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const homeSurface = isDark ? theme.surface : Palette.homeLightSurface;
  const homeBorder = isDark ? theme.border : Palette.homeLightBorder;
  const homeAction = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState<number>(25);
  const [customDuration, setCustomDuration] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const custom = !PRESETS.includes(duration as (typeof PRESETS)[number]);
  const durationValue = custom ? Number(customDuration) : duration;
  const valid = Number.isInteger(durationValue) && durationValue >= MINUTES_MIN && durationValue <= MINUTES_MAX;

  function choosePreset(value: number) { setDuration(value); setCustomDuration(''); setSubmitted(false); }
  function start() {
    setSubmitted(true);
    if (!valid) return;
    router.push({ pathname: '/focus/session', params: { durationMinutes: String(durationValue), taskName: taskName.trim() } });
  }

  return <ThemedView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}>
    <StatusBar style="auto" />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText accessibilityRole="header" type="subtitle">Session Setup</ThemedText>
            <ThemedText themeColor="textSecondary">Configure your focus session before you begin.</ThemedText>
          </View>
          <View style={styles.group}>
            <ThemedText type="smallBold">Task name (optional)</ThemedText>
            <TextInput accessibilityLabel="Task name, optional" autoCapitalize="sentences" maxLength={120} onChangeText={setTaskName} placeholder="What would you like to focus on?" placeholderTextColor={theme.textMuted} style={[styles.input, { backgroundColor: homeSurface, borderColor: homeBorder, color: theme.text }]} value={taskName} />
          </View>
          <View style={styles.group}>
            <ThemedText type="smallBold">Focus duration</ThemedText>
            <View accessibilityRole="radiogroup" style={styles.options}>
              {PRESETS.map((value) => <Pressable accessibilityLabel={`${value} minutes`} accessibilityRole="radio" accessibilityState={{ selected: duration === value }} key={value} onPress={() => choosePreset(value)} style={({ pressed }) => [styles.option, { borderColor: duration === value ? homeAction : homeBorder }, duration === value && { backgroundColor: homeAction }, pressed && styles.pressed]}><ThemedText style={duration === value ? styles.selected : undefined}>{value} min</ThemedText></Pressable>)}
              <Pressable accessibilityLabel="Custom duration" accessibilityRole="radio" accessibilityState={{ selected: custom }} onPress={() => { setDuration(0); setSubmitted(false); }} style={({ pressed }) => [styles.option, { borderColor: custom ? homeAction : homeBorder }, custom && { backgroundColor: homeAction }, pressed && styles.pressed]}><ThemedText style={custom ? styles.selected : undefined}>Custom</ThemedText></Pressable>
            </View>
            {custom ? <TextInput accessibilityLabel="Custom duration in minutes" keyboardType="number-pad" maxLength={3} onChangeText={setCustomDuration} placeholder="Minutes" placeholderTextColor={theme.textMuted} style={[styles.input, { backgroundColor: homeSurface, borderColor: homeBorder, color: theme.text }]} value={customDuration} /> : null}
            <ThemedText themeColor="textSecondary" type="small">Choose between 5 and 180 minutes.</ThemedText>
            {submitted && !valid ? <ThemedText accessibilityLiveRegion="polite" style={styles.error}>Session duration must be between 5 and 180 minutes.</ThemedText> : null}
          </View>
          <View style={styles.actions}>
            <Button accentColor={homeAction} accessibilityLabel="Start Focus Session" fullWidth label="Start Focus Session" onPress={start} style={{ backgroundColor: homeAction, borderColor: homeAction }} />
            <Button accentColor={homeAction} fullWidth label="Back to Home" onPress={() => router.dismissTo('/(tabs)/home')} variant="secondary" />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, flex: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: Spacing.xl }, header: { gap: Spacing.sm }, group: { gap: Spacing.sm },
  input: { minHeight: 48, borderWidth: 1, borderRadius: Radius.card, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: Typography.body.fontSize },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }, option: { minHeight: 48, minWidth: 84, borderWidth: 1, borderRadius: Radius.card, paddingHorizontal: Spacing.md, justifyContent: 'center', alignItems: 'center' },
  selected: { color: Palette.deepNavy }, pressed: { opacity: 0.8 }, error: { color: Palette.error }, actions: { gap: Spacing.sm },
});
