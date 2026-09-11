import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { loadActiveSession } from '@/features/focus/session-storage';
import { Palette, Radius, Spacing } from '@/theme/tokens';

export default function FocusRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const homeSurface = isDark ? theme.surface : Palette.homeLightSurface;
  const homeBorder = isDark ? theme.border : Palette.homeLightBorder;
  const homeAction = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const homeActionSoft = isDark ? theme.background : Palette.homeLightActionSoft;
  const [activeSession, setActiveSession] = useState<Awaited<ReturnType<typeof loadActiveSession>>>(null);

  useFocusEffect(useCallback(() => {
    let mounted = true;
    void loadActiveSession().then((session) => {
      if (mounted) setActiveSession(session);
    });
    return () => { mounted = false; };
  }, []));

  const sessionPath = activeSession
    ? { pathname: '/focus/session' as const, params: { durationMinutes: String(activeSession.plannedDurationSeconds / 60), taskName: activeSession.taskName || '' } }
    : '/focus/setup' as const;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={[styles.eyebrow, { color: homeAction }]} type="smallBold">FOCUS</ThemedText>
            <ThemedText accessibilityRole="header" type="title">Make space for one thing.</ThemedText>
            <ThemedText themeColor="textSecondary">Choose a calm focus block and begin when you are ready.</ThemedText>
          </View>

          {activeSession ? (
            <ThemedView accessibilityLabel={`Focus session ${activeSession.status}. ${activeSession.taskName || 'Your focus block'}.`} style={[styles.card, { backgroundColor: homeSurface, borderColor: homeBorder }]}>
              <View style={[styles.icon, { backgroundColor: homeAction }]}><Ionicons color={Palette.deepNavy} name="timer-outline" size={24} /></View>
              <ThemedText style={[styles.eyebrow, { color: homeAction }]} type="smallBold">{activeSession.status === 'paused' ? 'SESSION PAUSED' : 'SESSION ACTIVE'}</ThemedText>
              <ThemedText type="subtitle">{activeSession.taskName || 'Your focus block'}</ThemedText>
              <ThemedText themeColor="textSecondary">{activeSession.status === 'paused' ? 'Your session is ready to continue.' : 'Your focus session is in progress.'}</ThemedText>
              <Button accentColor={homeAction} fullWidth label={activeSession.status === 'paused' ? 'Resume Session' : 'Return to Session'} onPress={() => router.push(sessionPath)} style={{ backgroundColor: homeAction, borderColor: homeAction }} />
            </ThemedView>
          ) : (
            <ThemedView accessibilityLabel="Start a recommended 25 minute focus session" style={[styles.card, { backgroundColor: homeSurface, borderColor: homeBorder }]}>
              <View style={[styles.icon, { backgroundColor: homeActionSoft }]}><Ionicons color={homeAction} name="leaf-outline" size={24} /></View>
              <ThemedText style={[styles.eyebrow, { color: homeAction }]} type="smallBold">RECOMMENDED START</ThemedText>
              <ThemedText type="subtitle">A calm 25-minute block.</ThemedText>
              <ThemedText themeColor="textSecondary">Pick one meaningful task and protect the time to work on it.</ThemedText>
              <Button accentColor={homeAction} fullWidth label="Start Focus Session" onPress={() => router.push('/focus/setup')} style={{ backgroundColor: homeAction, borderColor: homeAction }} />
            </ThemedView>
          )}

          {!activeSession ? <View style={[styles.optionsCard, { backgroundColor: homeActionSoft, borderColor: homeBorder }]}>
            <View style={styles.optionCopy}>
              <ThemedText style={[styles.eyebrow, { color: homeAction }]} type="smallBold">FLEXIBLE TIMING</ThemedText>
              <ThemedText type="subtitle">Choose your own duration.</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">Set any focus block between 5 and 180 minutes.</ThemedText>
            </View>
            <Button accentColor={homeAction} label="Configure" onPress={() => router.push('/focus/setup')} variant="secondary" />
          </View> : null}

          <View style={styles.guidance}>
            <Ionicons color={homeAction} name="shield-checkmark-outline" size={20} />
            <ThemedText themeColor="textSecondary" type="small">Your session stays saved locally if the app is interrupted.</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.lg },
  content: { alignSelf: 'center', gap: Spacing.lg, justifyContent: 'center', maxWidth: 560, width: '100%' },
  header: { gap: Spacing.xs },
  eyebrow: { letterSpacing: 1.2 },
  card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.sm, padding: Spacing.lg },
  icon: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  optionsCard: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.md },
  optionCopy: { flex: 1, gap: Spacing.xs },
  guidance: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center', paddingHorizontal: Spacing.sm },
});
