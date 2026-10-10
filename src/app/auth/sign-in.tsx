import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/features/auth/auth-context';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function SignInRoute() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const auth = useAuth();
  const { copy } = useAppLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Pressable accessibilityLabel={copy.signIn.back} accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons color={action} name="arrow-back" size={20} />
            <ThemedText style={{ color: action }} type="smallBold">{copy.signIn.back}</ThemedText>
          </Pressable>
          <View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="lock-closed-outline" size={28} /></View>
          <ThemedText accessibilityRole="header" style={styles.title} type="title">{copy.signIn.title}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>{copy.signIn.subtitle}</ThemedText>

          <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText style={styles.label} type="smallBold">{copy.signIn.email}</ThemedText>
            <TextInput accessibilityLabel={copy.signIn.email} autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder={copy.signIn.emailPlaceholder} placeholderTextColor={theme.textMuted} style={[styles.input, { borderColor: emailInvalid ? Palette.error : border, color: theme.text }]} textContentType="emailAddress" value={email} />
            {emailInvalid ? <ThemedText style={styles.error} type="small">{copy.signIn.emailError}</ThemedText> : null}
            <ThemedText style={[styles.label, styles.passwordLabel]} type="smallBold">{copy.signIn.password}</ThemedText>
            <View style={styles.passwordWrap}>
              <TextInput accessibilityLabel={copy.signIn.password} autoCapitalize="none" autoComplete="password" onChangeText={setPassword} placeholder={copy.signIn.passwordPlaceholder} placeholderTextColor={theme.textMuted} secureTextEntry={!showPassword} style={[styles.input, styles.passwordInput, { borderColor: passwordInvalid ? Palette.error : border, color: theme.text }]} textContentType="password" value={password} />
              <Pressable accessibilityLabel={showPassword ? copy.signIn.hidePassword : copy.signIn.showPassword} accessibilityRole="button" onPress={() => setShowPassword((visible) => !visible)} style={styles.eyeButton}><Ionicons color={theme.textSecondary} name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} /></Pressable>
            </View>
            {passwordInvalid ? <ThemedText style={styles.error} type="small">{copy.signIn.passwordError}</ThemedText> : null}
            <Button accentColor={action} disabled={busy || !email.trim() || !password} fullWidth label={busy ? copy.signIn.signingIn : copy.signIn.signIn} onPress={() => { setSubmitted(true); if (!email.trim() || !password) return; setBusy(true); setMessage(''); void auth.signInWithPassword(email, password).then((result) => { if (result.status === 'error') setMessage(result.message); }).finally(() => setBusy(false)); }} style={{ backgroundColor: action, borderColor: action }} />
            <Button accentColor={action} disabled={busy} fullWidth label={copy.signIn.google} onPress={() => { setBusy(true); setMessage(''); void auth.signInWithGoogle().then((result) => { if (result.status === 'error') setMessage(result.message); }).finally(() => setBusy(false)); }} variant="secondary" />
            {Platform.OS === 'ios' ? <Button accentColor={action} disabled={busy} fullWidth label={copy.signIn.apple} onPress={() => { setBusy(true); setMessage(''); void auth.signInWithApple().then((result) => { if (result.status === 'error') setMessage(result.message); }).finally(() => setBusy(false)); }} variant="secondary" /> : null}
            {message ? <ThemedText accessibilityLiveRegion="polite" style={styles.error} type="small">{message}</ThemedText> : null}
            {auth.snapshot.status === 'configuration_error' ? <ThemedText accessibilityLiveRegion="polite" style={styles.error} type="small">{auth.snapshot.message}</ThemedText> : null}
          </ThemedView>
          <Button accentColor={action} fullWidth label={copy.signIn.forgotPassword} onPress={() => router.push('/auth/forgot-password')} variant="secondary" />
          <View style={styles.createRow}><ThemedText themeColor="textSecondary" type="small">{copy.signIn.newToApp}</ThemedText><Button label={copy.signIn.createAccount} onPress={() => router.push('/auth/sign-up')} variant="ghost" /></View>
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">{copy.signIn.privacy}</ThemedText>
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
  passwordLabel: { marginTop: Spacing.sm },
  input: { minHeight: 50, paddingHorizontal: Spacing.md, borderWidth: 1, borderRadius: 12, fontSize: Typography.body.fontSize },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 52 },
  eyeButton: { position: 'absolute', right: 4, top: 3, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  error: { color: Palette.error },
  providerNote: { textAlign: 'center', lineHeight: Typography.bodySmall.fontSize * 1.4 },
  createRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  privacy: { textAlign: 'center', marginTop: Spacing.sm },
});
