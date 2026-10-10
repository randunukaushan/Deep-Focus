import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/features/auth/auth-context';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const auth = useAuth();
  const { copy } = useAppLocale();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;
  const invalid = submitted && !email.trim();

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Pressable accessibilityLabel={copy.recovery.backSignIn} accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons color={action} name="arrow-back" size={20} />
            <ThemedText style={{ color: action }} type="smallBold">{copy.recovery.backSignIn}</ThemedText>
          </Pressable>
          <View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="key-outline" size={28} /></View>
          <ThemedText accessibilityRole="header" style={styles.title} type="title">{copy.recovery.resetTitle}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>{copy.recovery.resetSubtitle}</ThemedText>

          <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText style={styles.label} type="smallBold">{copy.recovery.accountEmail}</ThemedText>
            <TextInput accessibilityLabel={copy.recovery.accountEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={(value) => { setEmail(value); setSubmitted(false); }} placeholder={copy.recovery.emailPlaceholder} placeholderTextColor={theme.textMuted} style={[styles.input, { borderColor: invalid ? Palette.error : border, color: theme.text }]} textContentType="emailAddress" value={email} />
            {invalid ? <ThemedText style={styles.error} type="small">{copy.recovery.emailError}</ThemedText> : null}
            <Button accentColor={action} disabled={busy || !email.trim()} fullWidth label={busy ? copy.recovery.sending : copy.recovery.sendLink} onPress={() => { setSubmitted(true); if (!email.trim()) return; setBusy(true); setMessage(''); void auth.requestPasswordReset(email).then((result) => { setMessage(result.status === 'error' ? copy.recovery.recoveryError : copy.recovery.resetSent); }).finally(() => setBusy(false)); }} style={{ backgroundColor: action, borderColor: action }} />
            {message ? <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary" style={styles.providerNote} type="small">{message}</ThemedText> : null}
          </ThemedView>
          <Button accentColor={action} fullWidth label={copy.recovery.backToSignIn} onPress={() => router.push('/auth/sign-in')} variant="secondary" />
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">{copy.recovery.privacy}</ThemedText>
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
  card: { marginTop: Spacing.sm, padding: Spacing.lg, gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.card },
  label: { letterSpacing: 0.7 },
  input: { minHeight: 50, paddingHorizontal: Spacing.md, borderWidth: 1, borderRadius: 12, fontSize: Typography.body.fontSize },
  error: { color: Palette.error },
  providerNote: { textAlign: 'center', lineHeight: Typography.bodySmall.fontSize * 1.4 },
  privacy: { textAlign: 'center', marginTop: Spacing.sm },
});
