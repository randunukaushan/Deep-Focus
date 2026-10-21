import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { AuthFrame } from '@/components/ui/auth-frame';
import { useFormAction } from '@/hooks/use-form-action';
import { getAuthRuntimeCopy } from '@/features/localization/auth-runtime-copy';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/features/auth/auth-context';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function SignUpRoute() {
  const router = useRouter();
  const theme = useTheme();
  const auth = useAuth();
  const { copy, locale } = useAppLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const { busy, run } = useFormAction(() => setMessage(getAuthRuntimeCopy(locale).genericError));
  const passwordRef = useRef<TextInput>(null);
  const confirmationRef = useRef<TextInput>(null);

  const surface = theme.surface;
  const border = theme.border;
  const action = theme.primary;
  const emailInvalid = submitted && !isValidEmail(email);
  const passwordInvalid = submitted && !password;
  const confirmationInvalid = submitted && confirmation !== password;

  function submit() {
    setSubmitted(true);
    if (!isValidEmail(email) || !password || confirmation !== password) return;
    run(() => { setMessage(''); return auth.signUpWithPassword(email, password); }, result => { if (result.status === 'verification_required') router.replace({ pathname: '/auth/verify-email', params: { email: email.trim() } }); else if (result.status === 'error') setMessage(result.message); });
  }

  return (
    <AuthFrame title={copy.signUp.title} subtitle={copy.signUp.subtitle} backLabel={copy.signUp.back} onBack={() => router.back()} busy={busy}>
          <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText style={styles.label} type="smallBold">{copy.signUp.email}</ThemedText>
            <TextInput editable={!busy} autoCorrect={false} accessibilityLabel={copy.signUp.email} returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={(value) => { setEmail(value); setMessage(''); }} placeholder={copy.signUp.emailPlaceholder} placeholderTextColor={theme.textMuted} style={[styles.input, { borderColor: emailInvalid ? Palette.error : border, color: theme.text }]} textContentType="emailAddress" value={email} />
            {emailInvalid ? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert" themeColor="textPrimary" type="small">{copy.signUp.emailError}</ThemedText> : null}
            <ThemedText style={[styles.label, styles.nextLabel]} type="smallBold">{copy.signUp.password}</ThemedText>
            <View style={styles.passwordWrap}>
              <TextInput editable={!busy} autoCorrect={false} accessibilityLabel={copy.signUp.password} ref={passwordRef} returnKeyType="next" onSubmitEditing={() => confirmationRef.current?.focus()} autoCapitalize="none" autoComplete="new-password" onChangeText={setPassword} placeholder={copy.signUp.passwordPlaceholder} placeholderTextColor={theme.textMuted} secureTextEntry={!showPassword} style={[styles.input, styles.passwordInput, { borderColor: passwordInvalid ? Palette.error : border, color: theme.text }]} textContentType="newPassword" value={password} />
              <Pressable accessibilityLabel={showPassword ? copy.signUp.hidePassword : copy.signUp.showPassword} accessibilityRole="button" disabled={busy} onPress={() => setShowPassword((visible) => !visible)} style={styles.eyeButton}><Ionicons color={theme.textSecondary} name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} /></Pressable>
            </View>
            {passwordInvalid ? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert" themeColor="textPrimary" type="small">{copy.signUp.passwordError}</ThemedText> : null}
            <ThemedText style={[styles.label, styles.nextLabel]} type="smallBold">{copy.signUp.confirmPassword}</ThemedText>
            <TextInput editable={!busy} autoCorrect={false} accessibilityLabel={copy.signUp.confirmPassword} ref={confirmationRef} returnKeyType="done" onSubmitEditing={submit} autoCapitalize="none" autoComplete="new-password" onChangeText={setConfirmation} placeholder={copy.signUp.confirmPlaceholder} placeholderTextColor={theme.textMuted} secureTextEntry={!showPassword} style={[styles.input, { borderColor: confirmationInvalid ? Palette.error : border, color: theme.text }]} textContentType="newPassword" value={confirmation} />
            {confirmationInvalid ? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert" themeColor="textPrimary" type="small">{copy.signUp.confirmationError}</ThemedText> : null}
            <Button accentColor={action} disabled={busy || !email.trim() || !password || confirmation !== password} fullWidth label={busy ? copy.signUp.creatingAccount : copy.signUp.createAccount} onPress={submit} style={{ backgroundColor: action, borderColor: action }} />
            <Button accentColor={action} disabled={busy} fullWidth label={copy.signUp.google} onPress={() => run(() => { setMessage(''); return auth.signInWithGoogle(); }, result => { if (result.status === 'error') setMessage(result.message); })} variant="secondary" />
            {message ? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert" themeColor="textPrimary" type="small">{message}</ThemedText> : null}
          </ThemedView>
          <Button accentColor={action} fullWidth label={`${copy.signUp.existingAccount} ${copy.signUp.signIn}`} disabled={busy} onPress={() => router.push('/auth/sign-in')} variant="secondary" />
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">{copy.signUp.privacy}</ThemedText>
    </AuthFrame>
  );
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const styles = StyleSheet.create({
  card: { marginTop: Spacing.sm, padding: Spacing.lg, gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.card },
  label: { letterSpacing: 0.7 },
  nextLabel: { marginTop: Spacing.sm },
  input: { minHeight: 56, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderRadius: 12, fontSize: Typography.body.fontSize },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 52 },
  eyeButton: { position: 'absolute', right: 4, top: 3, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  privacy: { textAlign: 'center', marginTop: Spacing.sm },
});
