import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function WelcomeRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const softAction = isDark ? theme.background : Palette.homeLightActionSoft;

  return <ThemedView style={[styles.screen, { backgroundColor: background }]}><View style={styles.content}><View style={[styles.mark, { backgroundColor: softAction, borderColor: action }]}><Ionicons color={action} name="leaf-outline" size={42} /></View><ThemedText style={[styles.eyebrow, { color: action }]} type="smallBold">DEEP FOCUS</ThemedText><ThemedText accessibilityRole="header" type="title" style={styles.title}>Focus on what matters.</ThemedText><ThemedText themeColor="textSecondary" style={styles.subtitle}>A calm space to protect your attention, complete meaningful work, and recover well.</ThemedText><ThemedView style={[styles.promise, { backgroundColor: surface, borderColor: border }]}><PromiseRow action={action} icon="timer-outline" text="Reliable focus sessions" /><PromiseRow action={action} icon="shield-checkmark-outline" text="Private, local-first progress" /><PromiseRow action={action} icon="leaf-outline" text="Sustainable pace, no pressure" /></ThemedView><View style={styles.actions}><Button accentColor={action} fullWidth label="Get Started" onPress={() => router.push('/onboarding')} style={{ backgroundColor: action, borderColor: action }} /><Button accentColor={action} fullWidth label="Sign In" onPress={() => router.push('/auth/sign-in')} variant="secondary" /></View></View></ThemedView>;
}

function PromiseRow({ action, icon, text }: { action: string; icon: keyof typeof Ionicons.glyphMap; text: string }) { return <View style={styles.promiseRow}><Ionicons color={action} name={icon} size={21} /><ThemedText type="smallBold">{text}</ThemedText></View>; }

const styles = StyleSheet.create({ screen: { flex: 1 }, content: { alignItems: 'center', alignSelf: 'center', gap: Spacing.md, justifyContent: 'center', maxWidth: 520, padding: Spacing.lg, width: '100%' }, mark: { alignItems: 'center', borderRadius: 40, borderWidth: 1, height: 80, justifyContent: 'center', marginBottom: Spacing.sm, width: 80 }, eyebrow: { letterSpacing: 1.3 }, title: { fontSize: 42, lineHeight: 48, textAlign: 'center' }, subtitle: { maxWidth: 420, textAlign: 'center' }, promise: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, marginTop: Spacing.sm, padding: Spacing.lg, width: '100%' }, promiseRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md }, actions: { gap: Spacing.sm, marginTop: Spacing.md, width: '100%' } });
