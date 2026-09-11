import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export default function VerifyEmailRoute() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const theme = useTheme();
  const [requested, setRequested] = useState(false);

  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? Palette.navySurfaceElevated : Palette.homeLightActionSoft;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Pressable accessibilityLabel="Back to sign up" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons color={action} name="arrow-back" size={20} />
            <ThemedText style={{ color: action }} type="smallBold">Sign Up</ThemedText>
          </Pressable>
          <View style={[styles.icon, { backgroundColor: softAction, borderColor: border }]}><Ionicons color={action} name="mail-open-outline" size={29} /></View>
          <ThemedText accessibilityRole="header" style={styles.title} type="title">Check your inbox.</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>Email verification helps keep your account secure and your focus data connected to the right person.</ThemedText>

          <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.statusIcon, { backgroundColor: softAction }]}><Ionicons color={action} name="mail-outline" size={24} /></View>
            <ThemedText type="subtitle">Verification is waiting.</ThemedText>
            <ThemedText themeColor="textSecondary">Open the message from Deep Focus and follow its secure verification link. You can return here when you are ready.</ThemedText>
            <Button accentColor={action} fullWidth label="Resend Verification Email" onPress={() => setRequested(true)} variant="secondary" />
            {requested ? <ThemedText themeColor="textSecondary" style={styles.note} type="small">Resending will be available after an approved authentication provider is connected.</ThemedText> : null}
          </ThemedView>
          <Button accentColor={action} fullWidth label="Continue to Onboarding" onPress={() => router.push('/onboarding')} style={{ backgroundColor: action, borderColor: action }} />
          <ThemedText style={styles.privacy} themeColor="textMuted" type="small">You can continue exploring the local focus experience without completing account setup.</ThemedText>
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
  card: { marginTop: Spacing.sm, padding: Spacing.lg, gap: Spacing.md, borderWidth: 1, borderRadius: Radius.card },
  statusIcon: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  note: { lineHeight: Typography.bodySmall.fontSize * 1.4, textAlign: 'center' },
  privacy: { marginTop: Spacing.sm, textAlign: 'center' },
});
