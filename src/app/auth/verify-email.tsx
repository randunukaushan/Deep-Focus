import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { AuthFrame } from '@/components/ui/auth-frame';
import { useFormAction } from '@/hooks/use-form-action';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/features/auth/auth-context';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function VerifyEmailRoute() {
  const router = useRouter();
  const theme = useTheme();
  const auth = useAuth();
  const { copy } = useAppLocale();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : auth.snapshot.email ?? '';
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const { busy, run } = useFormAction(() => { setMessageIsError(true); setMessage(copy.recovery.recoveryError); });

  const surface = theme.surface;
  const border = theme.border;
  const action = theme.primary;
  const softAction = theme.backgroundElement;

  return (
    <AuthFrame title={copy.recovery.verifyTitle} subtitle={copy.recovery.verifySubtitle} backLabel={copy.recovery.backSignUp} onBack={() => router.back()} busy={busy}>
          <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.statusIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="mail-outline" size={24} /></View>
            <ThemedText type="subtitle">{copy.recovery.waitingTitle}</ThemedText>
            <ThemedText themeColor="textSecondary">{copy.recovery.waitingBody}</ThemedText>
            <Button accentColor={action} disabled={busy || !email} fullWidth label={busy ? copy.recovery.sending : copy.recovery.resend} onPress={() => run(() => { setMessage(''); setMessageIsError(false); return auth.resendVerification(email); }, result => { const failed = result.status === 'error'; setMessageIsError(failed); setMessage(result.status === 'error' ? result.message : copy.recovery.verificationSent); })} variant="secondary" />
            {message ? <ThemedText accessibilityLiveRegion={messageIsError ? 'assertive' : 'polite'} accessibilityRole={messageIsError ? 'alert' : undefined} themeColor="textSecondary" style={styles.note} type="small">{message}</ThemedText> : null}
          </ThemedView>
          <Button accentColor={action} fullWidth label={copy.recovery.backToSignIn} disabled={busy} onPress={() => router.replace('/auth/sign-in')} style={{ backgroundColor: action, borderColor: action }} />
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">{copy.recovery.verifiedPrivacy}</ThemedText>
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: Spacing.sm, padding: Spacing.lg, gap: Spacing.md, borderWidth: 1, borderRadius: Radius.card },
  statusIcon: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  note: { lineHeight: Typography.bodySmall.fontSize * 1.4, textAlign: 'center' },
  privacy: { marginTop: Spacing.sm, textAlign: 'center' },
});
