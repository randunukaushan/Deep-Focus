import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { useEffect, useRef } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/features/auth/auth-context';
import { loadActiveSession } from '@/features/focus/session-storage';
import { authRouteDecision } from '@/features/auth/auth-routing';
import { AppLocaleProvider, useAppLocale } from '@/features/localization/app-locale-context';

export default function RootLayout() {
  return <AppLocaleProvider><AuthProvider><RootNavigator /></AuthProvider></AppLocaleProvider>;
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { snapshot } = useAuth();
  const { copy } = useAppLocale();
  const recoveredForUser = useRef<string | null>(null);

  useEffect(() => {
    const decision = authRouteDecision(snapshot.status, segments);
    if (decision.redirect) router.replace(decision.redirect as never);
  }, [router, segments, snapshot.status]);

  useEffect(() => {
    if (snapshot.status !== 'signed_in' || !snapshot.userId || recoveredForUser.current === snapshot.userId) return;
    recoveredForUser.current = snapshot.userId;
    loadActiveSession().then((session) => {
      if (!session) return;
      router.replace({ pathname: '/focus/session', params: { durationMinutes: String(session.plannedDurationSeconds / 60), taskName: session.taskName ?? '' } });
    }).catch(() => router.replace('/focus/recovery'));
  }, [router, snapshot.status, snapshot.userId]);

  const blocked = authRouteDecision(snapshot.status, segments).blocked;

  if (blocked) {
    return <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemedView style={styles.loading}>
        <ActivityIndicator accessibilityLabel={copy.signIn.signingIn} />
        <ThemedText accessibilityLiveRegion="polite" type="small">{copy.signIn.signingIn}</ThemedText>
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
