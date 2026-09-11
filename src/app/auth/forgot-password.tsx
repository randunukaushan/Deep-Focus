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

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
          <Pressable accessibilityLabel="Back to sign in" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons color={action} name="arrow-back" size={20} />
            <ThemedText style={{ color: action }} type="smallBold">Sign In</ThemedText>
          </Pressable>
          <View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="key-outline" size={28} /></View>
          <ThemedText accessibilityRole="header" style={styles.title} type="title">Reset your password.</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>Enter the email connected to your account and we’ll help you get back to your focus practice.</ThemedText>

          <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <ThemedText style={styles.label} type="smallBold">ACCOUNT EMAIL</ThemedText>
            <TextInput accessibilityLabel="Account email address" autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={(value) => { setEmail(value); setSubmitted(false); }} placeholder="you@example.com" placeholderTextColor={theme.textMuted} style={[styles.input, { borderColor: invalid ? Palette.error : border, color: theme.text }]} textContentType="emailAddress" value={email} />
            {invalid ? <ThemedText style={styles.error} type="small">Enter your email address.</ThemedText> : null}
            <Button accentColor={action} disabled={!email.trim()} fullWidth label="Send Reset Link" onPress={() => setSubmitted(true)} style={{ backgroundColor: action, borderColor: action }} />
            {submitted && email.trim() ? <ThemedText themeColor="textSecondary" style={styles.providerNote} type="small">Password recovery will be enabled after an approved authentication provider is connected.</ThemedText> : null}
          </ThemedView>
          <Button accentColor={action} fullWidth label="Back to Sign In" onPress={() => router.push('/auth/sign-in')} variant="secondary" />
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">We won’t reveal whether an email is registered.</ThemedText>
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
