import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function ProfileRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? theme.background : Palette.homeLightActionSoft;

  const open = (path: '/onboarding/productivity-profile' | '/analytics/history' | '/goals' | '/tasks' | '/profile/settings' | '/auth/sign-in' | '/focus/recovery') => router.push(path);

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">PROFILE</ThemedText>
            <ThemedText accessibilityRole="header" type="title" style={styles.title}>Make focus work for you.</ThemedText>
            <ThemedText themeColor="textSecondary">Keep your preferences and progress in one calm place.</ThemedText>
          </View>

          <ThemedView accessibilityLabel="Your productivity profile" style={[styles.profileCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.avatar, { backgroundColor: softAction }]}>
              <Ionicons color={action} name="person-outline" size={28} />
            </View>
            <View style={styles.profileCopy}>
              <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">YOUR PROFILE</ThemedText>
              <ThemedText type="subtitle" style={styles.profileTitle}>A more personal focus practice.</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">Review your focus preferences and the profile created from your onboarding answers.</ThemedText>
            </View>
            <Pressable accessibilityLabel="Open productivity profile" accessibilityRole="button" onPress={() => open('/onboarding/productivity-profile')} style={({ pressed }) => [styles.profileAction, { borderColor: action }, pressed && styles.pressed]}>
              <ThemedText style={{ color: action }} type="smallBold">Review profile</ThemedText>
              <Ionicons color={action} name="chevron-forward" size={18} />
            </Pressable>
          </ThemedView>

          <View style={styles.section}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">YOUR FOCUS</ThemedText>
            <ProfileRow action={action} border={border} icon="time-outline" label="Focus history" detail="See the time you chose to protect." onPress={() => open('/analytics/history')} />
            <ProfileRow action={action} border={border} icon="flag-outline" label="Goals" detail="Keep meaningful progress visible." onPress={() => open('/goals')} />
            <ProfileRow action={action} border={border} icon="checkmark-circle-outline" label="Tasks" detail="Choose what deserves your attention." onPress={() => open('/tasks')} />
            <ProfileRow action={action} border={border} icon="refresh-outline" label="Session recovery" detail="Check for an interrupted focus session." onPress={() => open('/focus/recovery')} />
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">PREFERENCES</ThemedText>
            <ProfileRow action={action} border={border} icon="settings-outline" label="Settings" detail="Manage supported app preferences." onPress={() => open('/profile/settings')} />
            <ProfileRow action={action} border={border} icon="log-in-outline" label="Sign In" detail="Access your Deep Focus account when authentication is enabled." onPress={() => open('/auth/sign-in')} />
          </View>

          <View style={styles.privateNote}>
            <Ionicons color={action} name="shield-checkmark-outline" size={20} />
            <ThemedText themeColor="textSecondary" type="small">Your focus data stays local while synchronization is not configured.</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function ProfileRow({ action, border, detail, icon, label, onPress }: { action: string; border: string; detail: string; icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={`${label}. ${detail}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, { borderColor: border }, pressed && styles.pressed]}>
      <View style={[styles.rowIcon, { backgroundColor: Palette.homeLightActionSoft }]}><Ionicons color={action} name={icon} size={21} /></View>
      <View style={styles.rowCopy}><ThemedText type="smallBold">{label}</ThemedText><ThemedText themeColor="textSecondary" type="small">{detail}</ThemedText></View>
      <Ionicons color={action} name="chevron-forward" size={19} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.lg },
  content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' },
  header: { gap: Spacing.xs },
  title: { fontSize: 38, lineHeight: 44 },
  eyebrow: { letterSpacing: 1.2 },
  profileCard: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg },
  avatar: { alignItems: 'center', borderRadius: 28, height: 56, justifyContent: 'center', width: 56 },
  profileCopy: { gap: Spacing.xs },
  profileTitle: { fontSize: 25, lineHeight: 32 },
  profileAction: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.xs, justifyContent: 'center', minHeight: 48, paddingHorizontal: Spacing.md },
  section: { gap: Spacing.sm },
  row: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 72, padding: Spacing.md },
  rowIcon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  rowCopy: { flex: 1, gap: 2 },
  privateNote: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center', paddingHorizontal: Spacing.sm },
  pressed: { opacity: 0.78 },
});
