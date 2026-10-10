import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { useAuth } from '@/features/auth/auth-context';
import { useEffect, useState } from 'react';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { loadPendingOutbox } from '@/features/storage/local-database';

export default function ProfileRoute() {
  const router = useRouter();
  const { copy, locale } = useAppLocale();
  const theme = useTheme();
  const auth = useAuth();
  const [accountMessage, setAccountMessage] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number | null>(null);
  const [syncStatusUnavailable, setSyncStatusUnavailable] = useState(false);
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? theme.background : Palette.homeLightActionSoft;

  useEffect(() => {
    let active = true;
    void loadPendingOutbox()
      .then((pending) => {
        if (active) setPendingSyncCount(pending.length);
      })
      .catch(() => {
        if (active) setSyncStatusUnavailable(true);
      });
    return () => { active = false; };
  }, []);

  const education = locale === 'si'
    ? { label: 'අධ්‍යාපන කාර්ය', detail: 'දේශීයව ගුරුවරුන්ගේ assignment draft සකස් කරන්න.' }
    : locale === 'ta'
      ? { label: 'கல்விப் பணி', detail: 'உள்ளூரில் ஆசிரியர் assignment draft-ஐ உருவாக்கவும்.' }
      : { label: 'Education assignments', detail: 'Create a local teacher assignment draft.' };
  const open = (path: '/onboarding/productivity-profile' | '/progress/history' | '/goals' | '/tasks' | '/resources' | '/education/teacher-assignment' | '/profile/settings' | '/auth/sign-in' | '/focus/recovery') => router.push(path as never);

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{copy.profile.eyebrow}</ThemedText>
            <ThemedText accessibilityRole="header" type="title" style={styles.title}>{copy.profile.title}</ThemedText>
            <ThemedText themeColor="textSecondary">{copy.profile.subtitle}</ThemedText>
          </View>

          <ThemedView accessibilityLabel={copy.profile.cardLabel} style={[styles.profileCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.avatar, { backgroundColor: softAction }]}>
              <Ionicons color={action} name="person-outline" size={28} />
            </View>
            <View style={styles.profileCopy}>
              <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{copy.profile.cardLabel}</ThemedText>
              <ThemedText type="subtitle" style={styles.profileTitle}>{copy.profile.cardTitle}</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">{copy.profile.cardDetail}</ThemedText>
            </View>
            <Pressable accessibilityLabel={copy.profile.review} accessibilityRole="button" onPress={() => open('/onboarding/productivity-profile')} style={({ pressed }) => [styles.profileAction, { borderColor: action }, pressed && styles.pressed]}>
            <ThemedText style={{ color: action }} type="smallBold">{copy.profile.review}</ThemedText>
              <Ionicons color={action} name="chevron-forward" size={18} />
            </Pressable>
          </ThemedView>

          <View style={styles.section}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{copy.profile.focusSection}</ThemedText>
            <ProfileRow action={action} border={border} icon="time-outline" label={copy.profile.history} detail={copy.profile.historyDetail} onPress={() => open('/progress/history')} />
            <ProfileRow action={action} border={border} icon="flag-outline" label={copy.profile.goals} detail={copy.profile.goalsDetail} onPress={() => open('/goals')} />
            <ProfileRow action={action} border={border} icon="checkmark-circle-outline" label={copy.profile.tasks} detail={copy.profile.tasksDetail} onPress={() => open('/tasks')} />
            <ProfileRow action={action} border={border} icon="book-outline" label={copy.profile.resources} detail={copy.profile.resourcesDetail} onPress={() => open('/resources')} />
            <ProfileRow action={action} border={border} icon="school-outline" label={education.label} detail={education.detail} onPress={() => open('/education/teacher-assignment')} />
            <ProfileRow action={action} border={border} icon="refresh-outline" label={copy.profile.recovery} detail={copy.profile.recoveryDetail} onPress={() => open('/focus/recovery')} />
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">{copy.profile.preferences}</ThemedText>
            <ProfileRow action={action} border={border} icon="settings-outline" label={copy.profile.settings} detail={copy.profile.settingsDetail} onPress={() => open('/profile/settings')} />
            {auth.snapshot.status === 'signed_in' ? <>
              <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary" type="small">{copy.profile.signedIn}{auth.snapshot.email ? `: ${auth.snapshot.email}` : ''}. {copy.profile.offlineAccount}</ThemedText>
              <Pressable accessibilityLabel={signingOut ? copy.profile.signingOut : copy.profile.signOut} accessibilityRole="button" disabled={signingOut} onPress={() => { setSigningOut(true); setAccountMessage(''); void auth.signOut().then((result) => { if (result.status === 'error') setAccountMessage(result.message); }).finally(() => setSigningOut(false)); }} style={({ pressed }) => [styles.row, { borderColor: border }, pressed && styles.pressed]}>
                <View style={[styles.rowIcon, { backgroundColor: Palette.homeLightActionSoft }]}><Ionicons color={action} name="log-out-outline" size={21} /></View>
                <View style={styles.rowCopy}><ThemedText type="smallBold">{signingOut ? copy.profile.signingOut : copy.profile.signOut}</ThemedText><ThemedText themeColor="textSecondary" type="small">{copy.profile.signOutDetail}</ThemedText></View>
              </Pressable>
              {accountMessage ? <ThemedText accessibilityLiveRegion="polite" style={{ color: Palette.error }} type="small">{accountMessage}</ThemedText> : null}
            </> : <ProfileRow action={action} border={border} icon="log-in-outline" label={copy.profile.signIn} detail={copy.profile.signInDetail} onPress={() => open('/auth/sign-in')} />}
          </View>

          <ThemedView accessibilityLabel={copy.profile.syncStatus} style={[styles.syncCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.rowIcon, { backgroundColor: softAction }]}>
              <Ionicons color={action} name="cloud-offline-outline" size={21} />
            </View>
            <View style={styles.rowCopy}>
              <ThemedText type="smallBold">{copy.profile.syncStatus}</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                {syncStatusUnavailable
                  ? copy.profile.syncStatusUnavailable
                  : pendingSyncCount === null
                    ? copy.profile.syncStatusLoading
                    : pendingSyncCount > 0
                      ? copy.profile.syncStatusPendingDetail.replace('{count}', String(pendingSyncCount))
                      : copy.profile.syncStatusLocalDetail}
              </ThemedText>
            </View>
          </ThemedView>

          <View style={styles.privateNote}>
            <Ionicons color={action} name="shield-checkmark-outline" size={20} />
            <ThemedText themeColor="textSecondary" type="small">{copy.profile.privateNote}</ThemedText>
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
  syncCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.md },
  pressed: { opacity: 0.78 },
});
