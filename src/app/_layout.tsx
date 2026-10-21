import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PresentationProvider } from '@/features/settings/presentation-context';
import { useEffect, useRef, useState } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/features/auth/auth-context';
import { captureFocusRecoveryStore } from '@/features/storage/local-database';
import { authRouteDecision, type RecoveryState } from '@/features/auth/auth-routing';
import { AppLocaleProvider, useAppLocale } from '@/features/localization/app-locale-context';
import { getAppLocaleCopy } from '@/features/localization/app-locale';
import { OnboardingProvider, useOnboarding } from '@/features/onboarding/onboarding-context';

export default function RootLayout() {
  return <AppLocaleProvider><AuthProvider><PresentationProvider><OnboardingProvider><RootNavigator /></OnboardingProvider></PresentationProvider></AuthProvider></AppLocaleProvider>;
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
      const handle = setTimeout(() => setRecovery('none'), 0);
      return () => clearTimeout(handle);
    }
    if (onboardingLoading || !onboarding || !['completed', 'skipped'].includes(onboarding.status)) return;
    if (recoveredForUser.current === snapshot.userId) return;
    let cancelled = false;
    const store = captureFocusRecoveryStore();
    const current = () => !cancelled && store.isCurrent();
    recoveredForUser.current = snapshot.userId;
    setRecovery('pending');
    store.loadFocusRecovery().then(async ({ session, activeBreak }) => {
      if (!current()) return;
      if (!session) {
        const summarySessionId = await store.loadPendingSummaryHandoff();
        if (!current()) return;
        if (!summarySessionId) { setRecovery('none'); return; }
        setRecovery('found');
        router.replace({ pathname: '/focus/summary', params: { sessionId: summarySessionId } });
        return;
      }
      setRecovery('found');
      if (activeBreak) router.replace('/focus/break');
      else router.replace({ pathname: '/focus/session', params: { durationMinutes: String(session.plannedDurationSeconds / 60), taskName: session.taskName ?? '' } });
    }).catch(() => { if (current()) { setRecovery('error'); router.replace('/focus/recovery'); } });
    return () => { cancelled = true; recoveredForUser.current = null; };
  }, [onboarding, onboardingLoading, router, snapshot.status, snapshot.userId]);

  useEffect(() => {
    if (recovery === 'found' && segments[0] === 'focus') {
      const handle = setTimeout(() => setRecovery('none'), 0);
      return () => clearTimeout(handle);
    }
  }, [recovery, segments]);

  const blocked = authRouteDecision(snapshot.status, segments, onboardingLoading ? null : onboarding, recovery).blocked;
  const statusBar = <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />;

  if (onboardingError && snapshot.status === 'signed_in') {
    return <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {statusBar}
      <ThemedView style={styles.loading}>
        <ThemedText accessibilityLiveRegion="assertive">{settingsCopy.loadErrorDetail}</ThemedText>
        <Button label={settingsCopy.retry} onPress={retryOnboarding} />
      </ThemedView>
    </ThemeProvider>;
  }

  if (blocked) {
    return <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {statusBar}
      <ThemedView style={styles.loading}>
        <ActivityIndicator accessibilityLabel={snapshot.status === 'signed_in' ? settingsCopy.loading : copy.signIn.signingIn} />
        <ThemedText accessibilityLiveRegion="polite" type="small">{snapshot.status === 'signed_in' ? settingsCopy.loading : copy.signIn.signingIn}</ThemedText>
      </ThemedView>
    </ThemeProvider>;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {statusBar}
      <AnimatedSplashOverlay />
      <Stack key={snapshot.userId ?? snapshot.status} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md } });
