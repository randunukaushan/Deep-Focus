import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { useEffect, useRef, useState } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/features/auth/auth-context';
import { loadActiveSession, loadPendingSummaryHandoff } from '@/features/focus/session-storage';
import { authRouteDecision, type RecoveryState } from '@/features/auth/auth-routing';
import { AppLocaleProvider, useAppLocale } from '@/features/localization/app-locale-context';
import { getAppLocaleCopy } from '@/features/localization/app-locale';
import { OnboardingProvider, useOnboarding } from '@/features/onboarding/onboarding-context';

export default function RootLayout() {
  return <AppLocaleProvider><AuthProvider><OnboardingProvider><RootNavigator /></OnboardingProvider></AuthProvider></AppLocaleProvider>;
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { snapshot } = useAuth();
  const { copy } = useAppLocale();
  const settingsCopy = copy.settingsPage ?? getAppLocaleCopy('en').settingsPage!;
  const { state: onboarding, loading: onboardingLoading, error: onboardingError, retry: retryOnboarding } = useOnboarding();
  const recoveredForUser = useRef<string | null>(null);
  const [recovery, setRecovery] = useState<RecoveryState>('none');

  useEffect(() => {
    const decision = authRouteDecision(snapshot.status, segments, onboardingLoading ? null : onboarding, recovery);
    if (decision.redirect) router.replace(decision.redirect as never);
  }, [onboarding, onboardingLoading, recovery, router, segments, snapshot.status]);

  useEffect(() => {
    if (snapshot.status !== 'signed_in' || !snapshot.userId) {
      recoveredForUser.current = null;
      return;
    }
    if (recoveredForUser.current === snapshot.userId) return;
    recoveredForUser.current = snapshot.userId;
    setRecovery('pending');
    loadActiveSession(true).then((session) => {
      if (!session) {
        return loadPendingSummaryHandoff().then((summarySessionId) => {
          if (!summarySessionId) { setRecovery('none'); return; }
          setRecovery('found');
          router.replace({ pathname: '/focus/summary', params: { sessionId: summarySessionId } });
        });
      }
      setRecovery('found');
      router.replace({ pathname: '/focus/session', params: { durationMinutes: String(session.plannedDurationSeconds / 60), taskName: session.taskName ?? '' } });
    }).catch(() => { setRecovery('error'); router.replace('/focus/recovery'); });
  }, [router, snapshot.status, snapshot.userId]);

  const blocked = authRouteDecision(snapshot.status, segments, onboardingLoading ? null : onboarding, recovery).blocked;

  if (onboardingError && snapshot.status === 'signed_in') {
    return <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemedView style={styles.loading}>
        <ThemedText accessibilityLiveRegion="assertive">{settingsCopy.loadErrorDetail}</ThemedText>
        <Button label={settingsCopy.retry} onPress={retryOnboarding} />
      </ThemedView>
    </ThemeProvider>;
  }

  if (blocked) {
    return <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemedView style={styles.loading}>
        <ActivityIndicator accessibilityLabel={snapshot.status === 'signed_in' ? settingsCopy.loading : copy.signIn.signingIn} />
        <ThemedText accessibilityLiveRegion="polite" type="small">{snapshot.status === 'signed_in' ? settingsCopy.loading : copy.signIn.signingIn}</ThemedText>
      </ThemedView>
    </ThemeProvider>;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md } });
