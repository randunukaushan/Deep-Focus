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

export default function SignInRoute() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
          <Pressable accessibilityLabel="Back to welcome" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons color={action} name="arrow-back" size={20} />
            <ThemedText style={{ color: action }} type="smallBold">Welcome</ThemedText>
          </Pressable>
          <View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="lock-closed-outline" size={28} /></View>
          <ThemedText accessibilityRole="header" style={styles.title} type="title">Welcome back.</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>Sign in to continue protecting your attention and keep your progress together.</ThemedText>

          <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText style={styles.label} type="smallBold">EMAIL</ThemedText>
            <TextInput accessibilityLabel="Email address" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={theme.textMuted} style={[styles.input, { borderColor: emailInvalid ? Palette.error : border, color: theme.text }]} textContentType="emailAddress" value={email} />
            {emailInvalid ? <ThemedText style={styles.error} type="small">Enter your email address.</ThemedText> : null}
            <ThemedText style={[styles.label, styles.passwordLabel]} type="smallBold">PASSWORD</ThemedText>
            <View style={styles.passwordWrap}>
              <TextInput accessibilityLabel="Password" autoCapitalize="none" autoComplete="password" onChangeText={setPassword} placeholder="Your password" placeholderTextColor={theme.textMuted} secureTextEntry={!showPassword} style={[styles.input, styles.passwordInput, { borderColor: passwordInvalid ? Palette.error : border, color: theme.text }]} textContentType="password" value={password} />
              <Pressable accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} accessibilityRole="button" onPress={() => setShowPassword((visible) => !visible)} style={styles.eyeButton}><Ionicons color={theme.textSecondary} name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} /></Pressable>
            </View>
            {passwordInvalid ? <ThemedText style={styles.error} type="small">Enter your password.</ThemedText> : null}
            <Button accentColor={action} disabled={!email.trim() || !password} fullWidth label="Sign In" onPress={() => setSubmitted(true)} style={{ backgroundColor: action, borderColor: action }} />
            {submitted && email.trim() && password ? <ThemedText themeColor="textSecondary" style={styles.providerNote} type="small">Sign-in will be enabled after an approved authentication provider is connected.</ThemedText> : null}
          </ThemedView>
          <Button accentColor={action} fullWidth label="Forgot Password" onPress={() => router.push('/auth/forgot-password')} variant="secondary" />
          <View style={styles.createRow}><ThemedText themeColor="textSecondary" type="small">New to Deep Focus?</ThemedText><Button label="Create account" onPress={() => router.push('/auth/sign-up')} variant="ghost" /></View>
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">Your focus history stays private and under your control.</ThemedText>
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
