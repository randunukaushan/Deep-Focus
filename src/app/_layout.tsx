import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useEffect, useRef } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { clearActiveBreak, loadActiveBreak } from '@/features/focus/break-storage';
import { loadActiveSession } from '@/features/focus/session-storage';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const recoveryChecked = useRef(false);

  useEffect(() => {
    if (recoveryChecked.current) return;
    recoveryChecked.current = true;

    void (async () => {
      const [session, activeBreak] = await Promise.all([
        loadActiveSession(),
        loadActiveBreak(),
      ]);

      if (activeBreak && session?.status === 'paused' && activeBreak.sessionId === session.id) {
        router.replace({ pathname: '/focus/break', params: { sessionId: session.id } });
        return;
      }

      if (activeBreak) await clearActiveBreak();

      if (!session) return;
      router.replace({
        pathname: '/focus/session',
        params: {
          durationMinutes: String(session.plannedDurationSeconds / 60),
          taskName: session.taskName ?? '',
        },
      });
    })();
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
