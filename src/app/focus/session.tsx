import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { useFocusSession } from '@/features/focus/use-focus-session';
import { appendSessionHistory, clearActiveSession } from '@/features/focus/session-storage';

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
  const duration = Math.max(5, Number(durationMinutes) || 25);
  const task = typeof taskName === 'string' ? taskName : '';
  const { session, projection, pause, resume: resumeSession, complete, cancel, hydrated } = useFocusSession(duration, task);
  const resumedFromBreak = useRef(false);

  useEffect(() => {
    if (resume !== '1' || !hydrated || resumedFromBreak.current || session.status !== 'paused') return;
    resumedFromBreak.current = true;
    resumeSession();
  }, [hydrated, resume, resumeSession, session.status]);

  useEffect(() => {
    if (session.status !== 'completed' && session.status !== 'cancelled') return;
    let mounted = true;
    async function finishPersistence() {
      await clearActiveSession();
      await appendSessionHistory(session);
    if (mounted) router.replace({ pathname: '/focus/summary', params: { status: session.status, focusedSeconds: String(session.focusedDurationSeconds), plannedSeconds: String(session.plannedDurationSeconds), plannedMinutes: String(session.plannedDurationSeconds / 60), taskName: task } });
    }
    void finishPersistence();
    return () => { mounted = false; };
  }, [router, session, task]);

  function finish(status: 'completed' | 'cancelled') {
    if (status === 'completed') complete();
    else cancel();
  }

  return (
      <ThemedView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText themeColor="textSecondary" type="smallBold">FOCUS SESSION</ThemedText>
          <ThemedText accessibilityRole="header" type="subtitle">Stay with one thing.</ThemedText>
          <ThemedText themeColor="textSecondary">{task || 'Your chosen focus block'}</ThemedText>
        </View>
        <ThemedView accessibilityLabel={`${formatTime(projection.remainingSeconds)} remaining, ${session.status}, ${Math.round(projection.progress * 100)} percent complete`} style={[styles.timerCard, { backgroundColor: homeSurface, borderColor: homeBorder }]}>
          <View style={[styles.timerIcon, { backgroundColor: Palette.homeLightActionSoft }]}><Ionicons color={homeAction} name="timer-outline" size={24} /></View>
          <ThemedText style={[styles.timer, { color: theme.text }]}>{formatTime(projection.remainingSeconds)}</ThemedText>
          <ThemedText themeColor="textSecondary" type="smallBold">{session.status === 'paused' ? 'PAUSED' : 'IN FOCUS'}</ThemedText>
          <View accessibilityElementsHidden style={[styles.track, { backgroundColor: homeBorder }]}><View style={[styles.fill, { backgroundColor: homeAction, width: `${Math.round(projection.progress * 100)}%` }]} /></View>
          <ThemedText themeColor="textSecondary" type="small">{Math.round(projection.progress * 100)}% of your focus block</ThemedText>
        </ThemedView>
        <View style={styles.actions}>
          {session.status === 'paused' ? <Button accentColor={homeAction} fullWidth label="Resume Focus" onPress={resumeSession} style={{ backgroundColor: homeAction, borderColor: homeAction }} /> : session.status === 'active' ? <Button accentColor={homeAction} fullWidth label="Pause Focus" onPress={pause} style={{ backgroundColor: homeAction, borderColor: homeAction }} /> : null}
          {session.status === 'active' ? <Button accentColor={homeAction} fullWidth label="Take a Break" onPress={() => { pause(); router.push('/focus/break'); }} variant="secondary" /> : null}
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
