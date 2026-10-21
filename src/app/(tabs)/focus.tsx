import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { loadActiveSession } from '@/features/focus/session-storage';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { getSessionCopy } from '@/features/localization/session-copy';
import { getProgressCopy } from '@/features/localization/progress-copy';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

/** Enter the real focus screen; this gate never starts or resumes a timer. */
export default function FocusRoute() {
  const router = useRouter();
  const { locale } = useAppLocale();
  const text = getSessionCopy(locale);
  const common = getProgressCopy(locale);
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const retry = useRef<() => void>(() => {});
  useFocusEffect(useCallback(() => {
    let current = true;
    const enter = async () => {
      setFailed(false);
      try {
        const session = await loadActiveSession(true);
        if (!current) return;
        if (session?.status === 'active' || session?.status === 'paused') {
          router.replace({ pathname: '/focus/session', params: { durationMinutes: String(session.plannedDurationSeconds / 60), taskName: session.taskName ?? '' } });
        } else router.replace('/focus/setup');
      } catch { if (current) setFailed(true); }
    };
    retry.current = () => { void enter(); };
    void enter();
    return () => { current = false; retry.current = () => {}; };
  }, [router]));
  return <ThemedView style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    {failed ? <><ThemedText accessibilityRole="alert">{text.recoveryError}</ThemedText><Button label={common.retry} onPress={() => retry.current()} /></> : <View accessibilityLabel={text.loading} accessibilityLiveRegion="polite"><ActivityIndicator color={theme.primary} /></View>}
  </ScrollView></ThemedView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignSelf: 'center', flexGrow: 1, justifyContent: 'center', padding: Spacing.lg, width: '100%', maxWidth: 560, gap: Spacing.md },
});
