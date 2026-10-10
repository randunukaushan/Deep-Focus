import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/features/auth/auth-context';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function VerifyEmailRoute() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const auth = useAuth();
  const { copy } = useAppLocale();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : auth.snapshot.email ?? '';
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Pressable accessibilityLabel={copy.recovery.backSignUp} accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons color={action} name="arrow-back" size={20} />
            <ThemedText style={{ color: action }} type="smallBold">{copy.recovery.backSignUp}</ThemedText>
          </Pressable>
          <View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="mail-open-outline" size={29} /></View>
          <ThemedText accessibilityRole="header" style={styles.title} type="title">{copy.recovery.verifyTitle}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>{copy.recovery.verifySubtitle}</ThemedText>

          <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.statusIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="mail-outline" size={24} /></View>
            <ThemedText type="subtitle">{copy.recovery.waitingTitle}</ThemedText>
            <ThemedText themeColor="textSecondary">{copy.recovery.waitingBody}</ThemedText>
            <Button accentColor={action} disabled={busy || !email} fullWidth label={busy ? copy.recovery.sending : copy.recovery.resend} onPress={() => { setBusy(true); setMessage(''); void auth.resendVerification(email).then((result) => { setMessage(result.status === 'error' ? result.message : 'If this address can receive a verification link, it has been sent.'); }).finally(() => setBusy(false)); }} variant="secondary" />
            {message ? <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary" style={styles.note} type="small">{message}</ThemedText> : null}
          </ThemedView>
          <Button accentColor={action} fullWidth label={copy.recovery.backToSignIn} onPress={() => router.replace('/auth/sign-in')} style={{ backgroundColor: action, borderColor: action }} />
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">{copy.recovery.verifiedPrivacy}</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', padding: Spacing.lg },
  content: { width: '100%', maxWidth: 520, gap: Spacing.md },
  back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: Radius.card },
  title: { marginTop: Spacing.sm },
  subtitle: { lineHeight: Typography.body.fontSize * 1.5 },
  card: { marginTop: Spacing.sm, padding: Spacing.lg, gap: Spacing.md, borderWidth: 1, borderRadius: Radius.card },
  statusIcon: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  note: { lineHeight: Typography.bodySmall.fontSize * 1.4, textAlign: 'center' },
  privacy: { marginTop: Spacing.sm, textAlign: 'center' },
});
