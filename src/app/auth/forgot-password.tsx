import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { AuthFrame } from '@/components/ui/auth-frame';
import { useFormAction } from '@/hooks/use-form-action';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/features/auth/auth-context';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const theme = useTheme();
  const auth = useAuth();
  const { copy } = useAppLocale();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const { busy, run } = useFormAction(() => { setMessageIsError(true); setMessage(copy.recovery.recoveryError); });

  const surface = theme.surface;
  const border = theme.border;
  const action = theme.primary;
  const invalid = submitted && !email.trim();

  function submit() {
    setSubmitted(true);
    if (!email.trim()) return;
    run(() => { setMessage(''); setMessageIsError(false); return auth.requestPasswordReset(email); }, result => {
      const failed = result.status === 'error'; setMessageIsError(failed);
      setMessage(failed ? copy.recovery.recoveryError : copy.recovery.resetSent);
    });
  }

  return (
    <AuthFrame title={copy.recovery.resetTitle} subtitle={copy.recovery.resetSubtitle} backLabel={copy.recovery.backSignIn} onBack={() => router.back()} busy={busy}>
          <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText style={styles.label} type="smallBold">{copy.recovery.accountEmail}</ThemedText>
            <TextInput editable={!busy} autoCorrect={false} returnKeyType="done" onSubmitEditing={submit} accessibilityLabel={copy.recovery.accountEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={(value) => { setEmail(value); setSubmitted(false); }} placeholder={copy.recovery.emailPlaceholder} placeholderTextColor={theme.textMuted} style={[styles.input, { borderColor: invalid ? Palette.error : border, color: theme.text }]} textContentType="emailAddress" value={email} />
            {invalid ? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert" themeColor="textPrimary" type="small">{copy.recovery.emailError}</ThemedText> : null}
            <Button accentColor={action} disabled={busy || !email.trim()} fullWidth label={busy ? copy.recovery.sending : copy.recovery.sendLink} onPress={submit} style={{ backgroundColor: action, borderColor: action }} />
            {message ? <ThemedText accessibilityLiveRegion={messageIsError ? 'assertive' : 'polite'} accessibilityRole={messageIsError ? 'alert' : undefined} themeColor="textSecondary" style={styles.providerNote} type="small">{message}</ThemedText> : null}
          </ThemedView>
          <Button accentColor={action} fullWidth label={copy.recovery.backToSignIn} disabled={busy} onPress={() => router.push('/auth/sign-in')} variant="secondary" />
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">{copy.recovery.privacy}</ThemedText>
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: Spacing.sm, padding: Spacing.lg, gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.card },
  label: { letterSpacing: 0.7 },
  input: { minHeight: 56, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderRadius: 12, fontSize: Typography.body.fontSize },
  providerNote: { textAlign: 'center', lineHeight: Typography.bodySmall.fontSize * 1.4 },
  privacy: { textAlign: 'center', marginTop: Spacing.sm },
});
