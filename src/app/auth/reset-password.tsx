import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { AuthFrame } from '@/components/ui/auth-frame';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useFormAction } from '@/hooks/use-form-action';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function ResetPasswordRoute() {
  const router = useRouter();
  const auth = useAuth();
  const theme = useTheme();
  const { copy } = useAppLocale();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const confirmationRef = useRef<TextInput>(null);
  const { busy, run } = useFormAction(() => setMessage(copy.recovery.recoveryError));
  const mismatch = submitted && password !== confirmation;
  function submit() {
    setSubmitted(true);
    if (!password || password !== confirmation) return;
    run(() => { setMessage(''); return auth.updatePassword(password); }, result => {
      if (result.status === 'signed_in') router.replace('/(tabs)/home');
      else if (result.status === 'error') setMessage(copy.recovery.recoveryError);
    });
  }
  return <AuthFrame title={copy.recovery.newPasswordTitle} subtitle={copy.recovery.newPasswordSubtitle} busy={busy}>
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <ThemedText type="smallBold">{copy.recovery.newPassword}</ThemedText>
      <TextInput accessibilityLabel={copy.recovery.newPassword} editable={!busy} autoCorrect={false} returnKeyType="next" onSubmitEditing={() => confirmationRef.current?.focus()} autoCapitalize="none" autoComplete="new-password" onChangeText={setPassword} placeholder={copy.recovery.newPassword} placeholderTextColor={theme.textMuted} secureTextEntry style={[styles.input, { borderColor: theme.border, color: theme.text }]} textContentType="newPassword" value={password} />
      <ThemedText type="smallBold">{copy.recovery.confirmNewPassword}</ThemedText>
      <TextInput accessibilityLabel={copy.recovery.confirmNewPassword} editable={!busy} autoCorrect={false} ref={confirmationRef} returnKeyType="done" onSubmitEditing={submit} autoCapitalize="none" autoComplete="new-password" onChangeText={setConfirmation} placeholder={copy.recovery.confirmNewPassword} placeholderTextColor={theme.textMuted} secureTextEntry style={[styles.input, { borderColor: mismatch ? Palette.error : theme.border, color: theme.text }]} textContentType="newPassword" value={confirmation} />
      {mismatch ? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert">{copy.recovery.mismatch}</ThemedText> : null}
      {message ? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert">{message}</ThemedText> : null}
      <Button disabled={busy || !password || password !== confirmation} fullWidth label={busy ? copy.recovery.saving : copy.recovery.savePassword} onPress={submit} />
    </View>
  </AuthFrame>;
}
const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: Radius.card, gap: Spacing.md, padding: Spacing.lg },
  input: { minHeight: 56, borderWidth: 1, borderRadius: 12, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: Typography.body.fontSize },
});
