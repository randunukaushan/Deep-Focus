import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { useFocusSession } from '@/features/focus/use-focus-session';
import { persistTerminalSession } from '@/features/focus/session-storage';

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function ActiveSessionRoute() {
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const homeSurface = isDark ? theme.surface : Palette.homeLightSurface;
  const homeBorder = isDark ? theme.border : Palette.homeLightBorder;
  const homeAction = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const { durationMinutes, resume, taskName } = useLocalSearchParams<{ durationMinutes?: string; resume?: string; taskName?: string }>();
  const requestedDuration = durationMinutes === undefined ? 25 : Number(durationMinutes);
  const duration = Number.isInteger(requestedDuration) && requestedDuration >= 5 && requestedDuration <= 180 ? requestedDuration : NaN;
  const task = typeof taskName === 'string' ? taskName : '';
  const { session, projection, pause, resume: resumeSession, complete, cancel, hydrated, error, canRetrySave, retrySave } = useFocusSession(duration, task);
  const resumedFromBreak = useRef(false);
  const terminalSaveLock = useRef(false);
  const routeMounted = useRef(false);
  const [terminalSaveError, setTerminalSaveError] = useState<string | null>(null);
  const [terminalSaving, setTerminalSaving] = useState(false);
  const [activeRetrying, setActiveRetrying] = useState(false);

  useEffect(() => {
    routeMounted.current = true;
    return () => { routeMounted.current = false; };
  }, []);

  useEffect(() => {
    if (resume !== '1' || !hydrated || error || resumedFromBreak.current || session?.status !== 'paused') return;
    resumedFromBreak.current = true;
    resumeSession();
  }, [hydrated, error, resume, resumeSession, session?.status]);

  const saveTerminalSession = useCallback(async (terminalSession: NonNullable<typeof session>) => {
    if (terminalSaveLock.current || (terminalSession.status !== 'completed' && terminalSession.status !== 'cancelled')) return;
    terminalSaveLock.current = true;
    setTerminalSaving(true);
    setTerminalSaveError(null);
    try {
      await persistTerminalSession(terminalSession);
      if (routeMounted.current) {
        router.replace({ pathname: '/focus/summary', params: { status: terminalSession.status, focusedSeconds: String(terminalSession.focusedDurationSeconds), plannedSeconds: String(terminalSession.plannedDurationSeconds), plannedMinutes: String(terminalSession.plannedDurationSeconds / 60), taskName: terminalSession.taskName ?? '' } });
      }
    } catch {
      if (routeMounted.current) setTerminalSaveError(TERMINAL_SAVE_FAILURE_MESSAGE);
    } finally {
      terminalSaveLock.current = false;
      if (routeMounted.current) setTerminalSaving(false);
    }
  }, [router]);

  useEffect(() => {
    if (!hydrated || error || !session || (session.status !== 'completed' && session.status !== 'cancelled')) return;
    void saveTerminalSession(session);
  }, [hydrated, error, session, saveTerminalSession]);

  function retryActiveSave() {
    setActiveRetrying(true);
    void retrySave().finally(() => setActiveRetrying(false));
  }

  function finish(status: 'completed' | 'cancelled') {
    if (status === 'completed') {
      if (projection && projection.remainingSeconds > 0) {
        Alert.alert('Focus time remaining', 'Continue focusing, or choose End Session to stop early.');
        return;
      }
      complete();
    }
    else cancel();
  }

  if (!hydrated || error || !session || !projection) {
    return <ThemedView style={styles.screen}><View style={styles.content}>
      <ThemedText accessibilityRole="header" type="subtitle">{error ? 'Session needs attention' : 'Loading session…'}</ThemedText>
      {error ? <ThemedText accessibilityRole="alert">{error}</ThemedText> : null}
      {canRetrySave ? <Button label="Retry Save" loading={activeRetrying} onPress={retryActiveSave} /> : null}
      <Button label="Return Home" onPress={() => router.replace('/')} />
    </View></ThemedView>;
  }

  return (
      <ThemedView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText themeColor="textSecondary" type="smallBold">FOCUS SESSION</ThemedText>
          <ThemedText accessibilityRole="header" type="subtitle">Stay with one thing.</ThemedText>
          <ThemedText themeColor="textSecondary">{session.taskName || 'Your chosen focus block'}</ThemedText>
        </View>
        <ThemedView accessibilityLabel={`${formatTime(projection.remainingSeconds)} remaining, ${session.status}, ${Math.round(projection.progress * 100)} percent complete`} style={[styles.timerCard, { backgroundColor: homeSurface, borderColor: homeBorder }]}>
          <View style={[styles.timerIcon, { backgroundColor: Palette.homeLightActionSoft }]}><Ionicons color={homeAction} name="timer-outline" size={24} /></View>
          <ThemedText style={[styles.timer, { color: theme.text }]}>{formatTime(projection.remainingSeconds)}</ThemedText>
          <ThemedText themeColor="textSecondary" type="smallBold">{session.status === 'paused' ? 'PAUSED' : session.status === 'completed' ? 'COMPLETE' : session.status === 'cancelled' ? 'ENDED' : 'IN FOCUS'}</ThemedText>
          <View accessibilityElementsHidden style={[styles.track, { backgroundColor: homeBorder }]}><View style={[styles.fill, { backgroundColor: homeAction, width: `${Math.round(projection.progress * 100)}%` }]} /></View>
          <ThemedText themeColor="textSecondary" type="small">{Math.round(projection.progress * 100)}% of your focus block</ThemedText>
        </ThemedView>
        {terminalSaving ? <ThemedText accessibilityRole="text">Saving session…</ThemedText> : null}
        {terminalSaveError ? <>
          <ThemedText accessibilityRole="alert">{terminalSaveError}</ThemedText>
          <Button fullWidth label="Retry Save" loading={terminalSaving} onPress={() => { void saveTerminalSession(session); }} />
        </> : null}
        <View style={styles.actions}>
          {session.status === 'paused' ? <Button accentColor={homeAction} fullWidth label="Resume Focus" onPress={resumeSession} style={{ backgroundColor: homeAction, borderColor: homeAction }} /> : session.status === 'active' ? <Button accentColor={homeAction} fullWidth label="Pause Focus" onPress={pause} style={{ backgroundColor: homeAction, borderColor: homeAction }} /> : null}
          {session.status === 'active' ? <Button accentColor={homeAction} fullWidth label="Take a Break" onPress={() => { if (pause()) router.push('/focus/break'); }} variant="secondary" /> : null}
          {session.status === 'active' || session.status === 'paused' ? <>
            <Button accentColor={homeAction} fullWidth label="Complete Session" onPress={() => finish('completed')} variant="secondary" />
            <Button fullWidth label="End Session" onPress={() => Alert.alert('End Focus Session?', 'Your planned focus period has not been completed.', [{ text: 'Continue Focusing', style: 'cancel' }, { text: 'End Session', style: 'destructive', onPress: () => finish('cancelled') }])} variant="destructive" />
          </> : null}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignSelf: 'center', flex: 1, gap: Spacing.xl, justifyContent: 'center', maxWidth: 560, padding: Spacing.lg, width: '100%' },
  header: { gap: Spacing.xs },
  timerCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.xl },
  timerIcon: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  timer: { fontSize: 64, fontWeight: '700', letterSpacing: -1, lineHeight: 72 },
  track: { borderRadius: 999, height: 8, overflow: 'hidden', width: '100%' },
  fill: { height: '100%' },
  actions: { gap: Spacing.sm },
});

const TERMINAL_SAVE_FAILURE_MESSAGE = 'Session history could not be saved. Your active recovery record is being kept. Retry the save before leaving this screen.';
