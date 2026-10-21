import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View, type AccessibilityProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PropsWithChildren } from 'react';
import { DeepFocusScene } from '@/components/deep-focus-scene';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Radius, Spacing } from '@/theme/tokens';

export function AuthFrame({ title, subtitle, subtitleAccessibility, backLabel, onBack, busy = false, children }: PropsWithChildren<{ title: string; subtitle: string; subtitleAccessibility?: Pick<AccessibilityProps, 'accessibilityRole' | 'accessibilityLiveRegion'>; backLabel?: string; onBack?: () => void; busy?: boolean }>) {
  const theme = useTheme();
  const dark = useColorScheme() === 'dark';
  return <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={styles.content}>
          <View style={styles.toolbar}>
            {onBack ? <Pressable accessibilityRole="button" accessibilityLabel={backLabel} accessibilityState={{ disabled: busy }} disabled={busy} onPress={onBack} style={styles.back}>
              <Ionicons name="arrow-back" color={theme.primary} size={22} /><ThemedText type="smallBold">{backLabel}</ThemedText>
            </Pressable> : null}
            <ThemedText type="smallBold" style={{ color: theme.primary }}>Deep Focus</ThemedText>
          </View>
          <View style={[styles.scene, { borderColor: theme.border }]}><DeepFocusScene dark={dark} /></View>
          <View style={styles.heading}>
            <ThemedText accessibilityRole="header" type="title" style={styles.title}>{title}</ThemedText>
            <ThemedText {...subtitleAccessibility} themeColor="textSecondary">{subtitle}</ThemedText>
          </View>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg, alignItems: 'center' },
  content: { width: '100%', maxWidth: 520, gap: Spacing.md },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  back: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingRight: Spacing.sm },
  scene: { height: 128, borderWidth: 1, borderRadius: Radius.card, overflow: 'hidden' },
  heading: { gap: Spacing.sm }, title: { fontSize: 30, lineHeight: 43 },
});
