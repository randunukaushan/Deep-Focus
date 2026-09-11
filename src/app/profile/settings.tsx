import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function SettingsRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? theme.background : Palette.homeLightActionSoft;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Pressable accessibilityLabel="Back to Profile" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
            <Ionicons color={action} name="arrow-back" size={20} />
            <ThemedText style={{ color: action }} type="smallBold">Profile</ThemedText>
          </Pressable>
          <View style={styles.header}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">SETTINGS</ThemedText>
            <ThemedText accessibilityRole="header" type="title" style={styles.title}>Set a calmer default.</ThemedText>
            <ThemedText themeColor="textSecondary">Choose how Deep Focus should support your attention.</ThemedText>
          </View>

          <SettingsSection action={action} label="FOCUS" />
          <SettingsRow action={action} border={border} icon="timer-outline" label="Default focus duration" detail="25 minutes · used for new sessions" onPress={() => router.push('/focus/setup')} />
          <SettingsRow action={action} border={border} icon="cafe-outline" label="Default break duration" detail="5 minutes · break setup is not configured yet" />

          <SettingsSection action={action} label="APPEARANCE & ACCESSIBILITY" />
          <ThemedView accessibilityLabel="Appearance follows system settings" style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.infoIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="contrast-outline" size={22} /></View>
            <View style={styles.rowCopy}><ThemedText type="smallBold">Appearance</ThemedText><ThemedText themeColor="textSecondary" type="small">System · follows your device theme</ThemedText></View>
          </ThemedView>
          <SettingsRow action={action} border={border} icon="sparkles-outline" label="Reduced motion" detail="Follows your device accessibility preference" />

          <SettingsSection action={action} label="NOTIFICATIONS & FEEDBACK" />
          <SettingsRow action={action} border={border} icon="notifications-outline" label="Notifications" detail="Notification scheduling is not configured yet" />
          <SettingsRow action={action} border={border} icon="volume-medium-outline" label="Sound & haptics" detail="Feedback controls will be available with session feedback" />

          <SettingsSection action={action} label="PRIVACY & ACCOUNT" />
          <ThemedView accessibilityLabel="Focus data is stored locally" style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.infoIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="shield-checkmark-outline" size={22} /></View>
            <View style={styles.rowCopy}><ThemedText type="smallBold">Local-first data</ThemedText><ThemedText themeColor="textSecondary" type="small">Your focus sessions remain on this device while sync is not configured.</ThemedText></View>
          </ThemedView>
          <SettingsRow action={action} border={border} icon="log-in-outline" label="Account" detail="Sign-in and secure account controls are not configured yet" />
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
  screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.sm, maxWidth: 560, paddingBottom: Spacing.lg, width: '100%' },
  back: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: Spacing.xs, minHeight: 44, paddingRight: Spacing.md }, header: { gap: Spacing.xs, marginBottom: Spacing.md }, title: { fontSize: 38, lineHeight: 44 }, eyebrow: { letterSpacing: 1.2 }, sectionLabel: { letterSpacing: 1.1, marginTop: Spacing.md, paddingHorizontal: Spacing.xs },
  row: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 72, padding: Spacing.md }, rowIcon: { alignItems: 'center', borderRadius: 20, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 }, rowCopy: { flex: 1, gap: 2 }, infoCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 76, padding: Spacing.md }, infoIcon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 }, pressed: { opacity: 0.78 },
});
