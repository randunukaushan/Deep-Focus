import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/theme/tokens';

function formatMinutes(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

export default function SessionSummaryRoute() {
  const router = useRouter();
  const { status, focusedSeconds, taskName } = useLocalSearchParams<{ status?: string; focusedSeconds?: string; taskName?: string }>();
  const completed = status !== 'cancelled';
  const focused = Math.max(0, Number(focusedSeconds) || 0);

  function goHome() {
    router.dismissTo('/(tabs)/home');
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.content}>
        <ThemedText themeColor="textSecondary" type="smallBold">SESSION SUMMARY</ThemedText>
        <ThemedText accessibilityRole="header" type="subtitle">{completed ? 'Well done.' : 'Session ended.'}</ThemedText>
        <ThemedText themeColor="textSecondary">{completed ? 'You made space for focused work.' : 'Your session was cancelled. Your progress is kept honest.'}</ThemedText>
        <ThemedView style={styles.card} type="surface">
          <ThemedText type="smallBold">FOCUSED TIME</ThemedText>
          <ThemedText type="subtitle">{formatMinutes(focused)}</ThemedText>
          {taskName ? <ThemedText themeColor="textSecondary">Task: {taskName}</ThemedText> : null}
        </ThemedView>
        <View style={styles.actions}>
          <Button fullWidth label="Start Another Session" onPress={() => router.replace('/focus/setup')} />
          <Button fullWidth label="Return Home" onPress={goHome} variant="secondary" />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignSelf: 'center', flex: 1, gap: Spacing.lg, justifyContent: 'center', maxWidth: 560, padding: Spacing.lg, width: '100%' },
  card: { borderRadius: Radius.card, gap: Spacing.sm, padding: Spacing.lg },
  actions: { gap: Spacing.sm },
});
