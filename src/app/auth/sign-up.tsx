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

export default function SignUpRoute() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const auth = useAuth();
  const { copy } = useAppLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;
  const emailInvalid = submitted && !email.trim();
  const passwordInvalid = submitted && !password;
  const confirmationInvalid = submitted && confirmation !== password;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Pressable accessibilityLabel={copy.signUp.back} accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons color={action} name="arrow-back" size={20} />
            <ThemedText style={{ color: action }} type="smallBold">{copy.signUp.back}</ThemedText>
          </Pressable>
          <View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="person-add-outline" size={28} /></View>
          <ThemedText accessibilityRole="header" style={styles.title} type="title">{copy.signUp.title}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>{copy.signUp.subtitle}</ThemedText>

          <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText style={styles.label} type="smallBold">{copy.signUp.email}</ThemedText>
            <TextInput accessibilityLabel={copy.signUp.email} autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder={copy.signUp.emailPlaceholder} placeholderTextColor={theme.textMuted} style={[styles.input, { borderColor: emailInvalid ? Palette.error : border, color: theme.text }]} textContentType="emailAddress" value={email} />
            {emailInvalid ? <ThemedText style={styles.error} type="small">{copy.signUp.emailError}</ThemedText> : null}
            <ThemedText style={[styles.label, styles.nextLabel]} type="smallBold">{copy.signUp.password}</ThemedText>
            <View style={styles.passwordWrap}>
              <TextInput accessibilityLabel={copy.signUp.password} autoCapitalize="none" autoComplete="new-password" onChangeText={setPassword} placeholder={copy.signUp.passwordPlaceholder} placeholderTextColor={theme.textMuted} secureTextEntry={!showPassword} style={[styles.input, styles.passwordInput, { borderColor: passwordInvalid ? Palette.error : border, color: theme.text }]} textContentType="newPassword" value={password} />
              <Pressable accessibilityLabel={showPassword ? copy.signUp.hidePassword : copy.signUp.showPassword} accessibilityRole="button" onPress={() => setShowPassword((visible) => !visible)} style={styles.eyeButton}><Ionicons color={theme.textSecondary} name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} /></Pressable>
            </View>
            {passwordInvalid ? <ThemedText style={styles.error} type="small">{copy.signUp.passwordError}</ThemedText> : null}
            <ThemedText style={[styles.label, styles.nextLabel]} type="smallBold">{copy.signUp.confirmPassword}</ThemedText>
            <TextInput accessibilityLabel={copy.signUp.confirmPassword} autoCapitalize="none" autoComplete="new-password" onChangeText={setConfirmation} placeholder={copy.signUp.confirmPlaceholder} placeholderTextColor={theme.textMuted} secureTextEntry={!showPassword} style={[styles.input, { borderColor: confirmationInvalid ? Palette.error : border, color: theme.text }]} textContentType="newPassword" value={confirmation} />
            {confirmationInvalid ? <ThemedText style={styles.error} type="small">{copy.signUp.confirmationError}</ThemedText> : null}
            <Button accentColor={action} disabled={busy || !email.trim() || !password || confirmation !== password} fullWidth label={busy ? copy.signUp.creatingAccount : copy.signUp.createAccount} onPress={() => { setSubmitted(true); if (!email.trim() || !password || confirmation !== password) return; setBusy(true); setMessage(''); void auth.signUpWithPassword(email, password).then((result) => { if (result.status === 'verification_required') router.replace({ pathname: '/auth/verify-email', params: { email: email.trim() } }); else if (result.status === 'error') setMessage(result.message); }).finally(() => setBusy(false)); }} style={{ backgroundColor: action, borderColor: action }} />
            <Button accentColor={action} disabled={busy} fullWidth label={copy.signUp.google} onPress={() => { setBusy(true); setMessage(''); void auth.signInWithGoogle().then((result) => { if (result.status === 'error') setMessage(result.message); }).finally(() => setBusy(false)); }} variant="secondary" />
            {message ? <ThemedText accessibilityLiveRegion="polite" style={styles.error} type="small">{message}</ThemedText> : null}
          </ThemedView>
          <Button accentColor={action} fullWidth label={`${copy.signUp.existingAccount} ${copy.signUp.signIn}`} onPress={() => router.push('/auth/sign-in')} variant="secondary" />
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">{copy.signUp.privacy}</ThemedText>
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
  nextLabel: { marginTop: Spacing.sm },
  input: { minHeight: 50, paddingHorizontal: Spacing.md, borderWidth: 1, borderRadius: 12, fontSize: Typography.body.fontSize },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 52 },
  eyeButton: { position: 'absolute', right: 4, top: 3, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  error: { color: Palette.error },
  privacy: { textAlign: 'center', marginTop: Spacing.sm },
});
