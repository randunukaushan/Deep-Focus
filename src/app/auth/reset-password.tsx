import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function ResetPasswordRoute() {
  const router = useRouter();
  const auth = useAuth();
  const theme = useTheme();
  const { copy } = useAppLocale();
  const dark = useColorScheme() === 'dark';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const action = dark ? Palette.mintPrimary : Palette.homeLightAction;
  const mismatch = submitted && password !== confirmation;

  return <ThemedView style={[styles.screen, { backgroundColor: theme.background }]}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <ThemedText accessibilityRole="header" type="title">{copy.recovery.newPasswordTitle}</ThemedText>
      <ThemedText themeColor="textSecondary">{copy.recovery.newPasswordSubtitle}</ThemedText>
      <TextInput accessibilityLabel={copy.recovery.newPassword} autoCapitalize="none" autoComplete="new-password" onChangeText={setPassword} placeholder={copy.recovery.newPassword} placeholderTextColor={theme.textMuted} secureTextEntry style={[styles.input, { borderColor: theme.border, color: theme.text }]} textContentType="newPassword" value={password} />
      <TextInput accessibilityLabel={copy.recovery.confirmNewPassword} autoCapitalize="none" autoComplete="new-password" onChangeText={setConfirmation} placeholder={copy.recovery.confirmNewPassword} placeholderTextColor={theme.textMuted} secureTextEntry style={[styles.input, { borderColor: mismatch ? Palette.error : theme.border, color: theme.text }]} textContentType="newPassword" value={confirmation} />
      {mismatch ? <ThemedText style={styles.error}>{copy.recovery.mismatch}</ThemedText> : null}
      {message ? <ThemedText accessibilityLiveRegion="polite" style={styles.error}>{message}</ThemedText> : null}
      <Button accentColor={action} disabled={busy || !password || password !== confirmation} fullWidth label={busy ? copy.recovery.saving : copy.recovery.savePassword} onPress={() => { setSubmitted(true); if (!password || password !== confirmation) return; setBusy(true); setMessage(''); void auth.updatePassword(password).then((result) => { if (result.status === 'signed_in') router.replace('/(tabs)/home'); else if (result.status === 'error') setMessage(copy.recovery.recoveryError); }).finally(() => setBusy(false)); }} style={{ backgroundColor: action, borderColor: action }} />
    </ScrollView>
  </ThemedView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg, width: '100%', maxWidth: 560, alignSelf: 'center' },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: Spacing.md, fontSize: Typography.body.fontSize },
  error: { color: Palette.error },
});
