import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { AuthFrame } from '@/components/ui/auth-frame';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/theme/tokens';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function WelcomeRoute() {
  const router = useRouter();
  const theme = useTheme();
  const { copy } = useAppLocale();
  const action = theme.primary;

  return <AuthFrame title={copy.welcome.title} subtitle={copy.welcome.subtitle}>
    <ThemedText style={{ color: theme.textSecondary }} type="smallBold">{copy.welcome.eyebrow}</ThemedText>
    <ThemedView style={[styles.promise, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <PromiseRow action={action} icon="timer-outline" text={copy.welcome.promiseSessions} />
      <PromiseRow action={action} icon="shield-checkmark-outline" text={copy.welcome.promisePrivacy} />
      <PromiseRow action={action} icon="leaf-outline" text={copy.welcome.promisePace} />
    </ThemedView>
    <View style={styles.actions}>
      <Button accentColor={action} fullWidth label={copy.welcome.createAccount} onPress={() => router.push('/auth/sign-up')} />
      <Button accentColor={action} fullWidth label={copy.welcome.signIn} onPress={() => router.push('/auth/sign-in')} variant="secondary" />
    </View>
  </AuthFrame>;
}

function PromiseRow({ action, icon, text }: { action: string; icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return <View style={styles.promiseRow}>
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><Ionicons color={action} name={icon} size={21} /></View>
    <ThemedText style={styles.promiseText} type="smallBold">{text}</ThemedText>
  </View>;
}

const styles = StyleSheet.create({
  promise: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg },
  promiseRow: { alignItems: 'flex-start', flexDirection: 'row', gap: Spacing.md },
  promiseText: { flex: 1, minWidth: 0 },
  actions: { gap: Spacing.sm, marginTop: Spacing.sm },
});
