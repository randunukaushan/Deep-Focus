import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

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
import { getAuthServiceCopy } from '@/features/localization/auth-service-copy';

export default function SignInRoute() {
  const router = useRouter();
  const theme = useTheme();
  const auth = useAuth();
  const { copy, locale } = useAppLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const { busy, run } = useFormAction(() => setMessage(getAuthRuntimeCopy(locale).genericError));
  const passwordRef = useRef<TextInput>(null);

  const surface = theme.surface;
  const border = theme.border;
  const action = theme.primary;
  const emailInvalid = submitted && !isValidEmail(email);
  const passwordInvalid = submitted && !password;

  function submit() {
    setSubmitted(true);
    if (!isValidEmail(email) || !password) return;
    run(() => { setMessage(''); return auth.signInWithPassword(email, password); }, result => { if (result.status === 'error') setMessage(result.message); });
  }

  return (
    <AuthFrame title={copy.signIn.title} subtitle={copy.signIn.subtitle} backLabel={copy.signIn.back} onBack={() => router.back()} busy={busy}>
          <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText style={styles.label} type="smallBold">{copy.signIn.email}</ThemedText>
            <TextInput editable={!busy} autoCorrect={false} accessibilityLabel={copy.signIn.email} returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={(value) => { setEmail(value); setMessage(''); }} placeholder={copy.signIn.emailPlaceholder} placeholderTextColor={theme.textMuted} style={[styles.input, { borderColor: emailInvalid ? Palette.error : border, color: theme.text }]} textContentType="emailAddress" value={email} />
            {emailInvalid ? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert" themeColor="textPrimary" type="small">{copy.signIn.emailError}</ThemedText> : null}
            <ThemedText style={[styles.label, styles.passwordLabel]} type="smallBold">{copy.signIn.password}</ThemedText>
            <View style={styles.passwordWrap}>
              <TextInput editable={!busy} autoCorrect={false} accessibilityLabel={copy.signIn.password} ref={passwordRef} returnKeyType="done" onSubmitEditing={submit} autoCapitalize="none" autoComplete="password" onChangeText={(value) => { setPassword(value); setMessage(''); }} placeholder={copy.signIn.passwordPlaceholder} placeholderTextColor={theme.textMuted} secureTextEntry={!showPassword} style={[styles.input, styles.passwordInput, { borderColor: passwordInvalid ? Palette.error : border, color: theme.text }]} textContentType="password" value={password} />
              <Pressable accessibilityLabel={showPassword ? copy.signIn.hidePassword : copy.signIn.showPassword} accessibilityRole="button" disabled={busy} onPress={() => setShowPassword((visible) => !visible)} style={styles.eyeButton}><Ionicons color={theme.textSecondary} name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} /></Pressable>
            </View>
            {passwordInvalid ? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert" themeColor="textPrimary" type="small">{copy.signIn.passwordError}</ThemedText> : null}
            <Button accentColor={action} disabled={busy || !email.trim() || !password} fullWidth label={busy ? copy.signIn.signingIn : copy.signIn.signIn} onPress={submit} style={{ backgroundColor: action, borderColor: action }} />
            <Button accentColor={action} disabled={busy} fullWidth label={copy.signIn.google} onPress={() => run(() => { setMessage(''); return auth.signInWithGoogle(); }, result => { if (result.status === 'error') setMessage(result.message); })} variant="secondary" />
            {Platform.OS === 'ios' ? <Button accentColor={action} disabled={busy} fullWidth label={copy.signIn.apple} onPress={() => run(() => { setMessage(''); return auth.signInWithApple(); }, result => { if (result.status === 'error') setMessage(result.message); })} variant="secondary" /> : null}
            {message ? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert" themeColor="textPrimary" type="small">{message}</ThemedText> : null}
            {message === getAuthServiceCopy(locale).invalidCredentials ? <Button accentColor={action} disabled={busy} fullWidth label={copy.signIn.createAccount} onPress={() => router.push('/auth/sign-up')} variant="secondary" /> : null}
            {auth.snapshot.status === 'configuration_error' ? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert" themeColor="textPrimary" type="small">{auth.snapshot.message}</ThemedText> : null}
          </ThemedView>
          <Button accentColor={action} fullWidth label={copy.signIn.forgotPassword} disabled={busy} onPress={() => router.push('/auth/forgot-password')} variant="secondary" />
          <View style={styles.createRow}><ThemedText style={styles.createPrompt} themeColor="textSecondary" type="small">{copy.signIn.newToApp}</ThemedText><Button label={copy.signIn.createAccount} disabled={busy} onPress={() => router.push('/auth/sign-up')} variant="ghost" /></View>
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">{copy.signIn.privacy}</ThemedText>
    </AuthFrame>
  );
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const styles = StyleSheet.create({
  card: { marginTop: Spacing.sm, padding: Spacing.lg, gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.card },
  label: { letterSpacing: 0.7 },
  passwordLabel: { marginTop: Spacing.sm },
  input: { minHeight: 56, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderRadius: 12, fontSize: Typography.body.fontSize },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 52 },
  eyeButton: { position: 'absolute', right: 4, top: 3, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  createRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  createPrompt: { flexShrink: 1 },
  privacy: { textAlign: 'center', marginTop: Spacing.sm },
});
