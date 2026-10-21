import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { DeepFocusScene } from '@/components/deep-focus-scene';
import { FocusDial } from '@/components/ui/focus-dial';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { useFocusSession } from '@/features/focus/use-focus-session';
import { persistTerminalSession } from '@/features/focus/session-storage';
import { getSessionCopy } from '@/features/localization/session-copy';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { usePresentation } from '@/features/settings/presentation-context';
import { SteadyFocusWords } from '@/features/focus/steady-focus-words';
import { getPreviewHomeCopy } from '@/features/localization/preview-home-copy';

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function ActiveSessionRoute() {
  const router = useRouter();
  const { locale } = useAppLocale();
  const text = getSessionCopy(locale);
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const homeSurface = isDark ? theme.surface : Palette.homeLightSurface;
  const homeBorder = isDark ? theme.border : Palette.homeLightBorder;
  const homeAction = theme.primary;
  const { durationMinutes, resume, taskName, taskId } = useLocalSearchParams<{ durationMinutes?: string; resume?: string; taskName?: string; taskId?: string }>();
  const requestedDuration = durationMinutes === undefined ? 25 : Number(durationMinutes);
  const duration = Number.isInteger(requestedDuration) && requestedDuration >= 5 && requestedDuration <= 180 ? requestedDuration : NaN;
  const task = typeof taskName === 'string' ? taskName : '';
  const { session, projection, pause, resume: resumeSession, complete, cancel, hydrated, error, canRetrySave, retrySave } = useFocusSession(duration, task, typeof taskId === 'string' ? taskId : undefined, { recoveryError: text.recoveryError, taskUnavailable: text.taskUnavailable, saveFailure: text.saveFailure });
  const resumedFromBreak = useRef(false);
  const terminalSaveLock = useRef(false);
  const routeMounted = useRef(false);
  const [terminalSaveError, setTerminalSaveError] = useState<string | null>(null);
  const [terminalSaving, setTerminalSaving] = useState(false);
  const [activeRetrying, setActiveRetrying] = useState(false);
  const presentation = usePresentation();
  const preferences = presentation?.preferences;

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
        router.replace({ pathname: '/focus/summary', params: { sessionId: terminalSession.id } });
      }
    } catch {
      if (routeMounted.current) setTerminalSaveError(text.terminalSaveFailure);
    } finally {
      terminalSaveLock.current = false;
      if (routeMounted.current) setTerminalSaving(false);
    }
  }, [router, text.terminalSaveFailure]);

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
        Alert.alert(text.title, `${formatTime(projection.remainingSeconds)} ${text.remaining}. ${text.continue}`);
        return;
      }
      complete();
    }
    else cancel();
  }

  const sessionStatusLabel = session?.status === 'paused'
    ? text.paused
    : session?.status === 'completed'
      ? text.complete
      : session?.status === 'cancelled'
        ? text.ended
        : text.inFocus;

  if (!hydrated || error || !session || !projection) {
    return <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}><ScrollView contentContainerStyle={styles.errorContent}>
      <ThemedText accessibilityRole="header" type="subtitle">{error ? text.sessionAttention : text.loading}</ThemedText>
      {error ? <ThemedText accessibilityRole="alert">{error}</ThemedText> : null}
      {canRetrySave ? <Button label={text.retrySave} loading={activeRetrying} onPress={retryActiveSave} /> : null}
      <Button label={text.returnHome} onPress={() => router.replace('/')} />
    </ScrollView></SafeAreaView>;
  }

  return (
      <SafeAreaView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.sessionScroll}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText themeColor="textSecondary" type="smallBold">{text.eyebrow}</ThemedText>
          <ThemedText accessibilityRole="header" type="subtitle">{text.title}</ThemedText>
          <ThemedText themeColor="textSecondary">{session.taskName || text.chosenBlock}</ThemedText>
        </View>
        <ThemedView accessibilityLabel={`${formatTime(projection.remainingSeconds)} ${text.remaining}, ${sessionStatusLabel}, ${Math.round(projection.progress * 100)}${text.percentOfBlock}`} accessibilityRole="timer" style={[styles.timerCard, { backgroundColor: homeSurface, borderColor: homeBorder }]}>
          <FocusDial value={formatTime(projection.remainingSeconds)} caption={sessionStatusLabel} progress={projection.progress} />
          {preferences && !presentation?.loading ? <SteadyFocusWords key={session.id} preferences={preferences} fallback={getPreviewHomeCopy(locale).encouragement} /> : null}
        </ThemedView>
        {terminalSaving ? <ThemedText accessibilityRole="text">{text.saving}</ThemedText> : null}
        {terminalSaveError ? <>
          <ThemedText accessibilityRole="alert">{terminalSaveError}</ThemedText>
          <Button fullWidth label={text.retrySave} loading={terminalSaving} onPress={() => { void saveTerminalSession(session); }} />
        </> : null}
        <View style={styles.actions}>
          {session.status === 'paused' ? <Button accentColor={homeAction} fullWidth label={text.resume} onPress={resumeSession} style={{ backgroundColor: homeAction, borderColor: homeAction }} /> : session.status === 'active' ? <Button accentColor={homeAction} fullWidth label={text.pause} onPress={pause} style={{ backgroundColor: homeAction, borderColor: homeAction }} /> : null}
          {session.status === 'active' ? <Button accentColor={homeAction} fullWidth label={text.break} onPress={() => { if (pause()) router.push('/focus/break'); }} variant="secondary" /> : null}
          {session.status === 'active' || session.status === 'paused' ? <>
            <Button accentColor={homeAction} fullWidth label={text.completeSession} onPress={() => finish('completed')} variant="secondary" />
            <Button fullWidth label={text.endSession} onPress={() => Alert.alert(text.endTitle, text.endDetail, [{ text: text.continue, style: 'cancel' }, { text: text.endSession, style: 'destructive', onPress: () => finish('cancelled') }])} variant="destructive" />
          </> : null}
        </View>
        <View style={styles.scenery}><DeepFocusScene dark={isDark} /></View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  sessionScroll: { flexGrow: 1 },
  errorContent: { alignSelf: 'center', flexGrow: 1, justifyContent: 'center', gap: Spacing.md, maxWidth: 560, padding: Spacing.lg, width: '100%' },
  scenery: { minHeight: 190, overflow: 'hidden', borderRadius: Radius.card },
  content: { alignSelf: 'center', flexGrow: 1, gap: Spacing.xl, justifyContent: 'center', maxWidth: 560, padding: Spacing.lg, width: '100%', zIndex: 1 },
  header: { alignItems: 'center', gap: Spacing.xs },
  timerCard: { alignItems: 'center', borderRadius: Radius.card, gap: Spacing.md },
  timerIcon: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  timer: { fontSize: 64, fontWeight: '700', letterSpacing: -1, lineHeight: 72 },
  track: { borderRadius: 999, height: 8, overflow: 'hidden', width: '100%' },
  fill: { height: '100%' },
  actions: { gap: Spacing.sm },
});
