import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SessionSetupScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <ThemedText accessibilityRole="header" type="title">
        Session Setup
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.description}>
        Configure your focus session before you begin.
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to Home"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <ThemedText type="smallBold">Back to Home</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  description: {
    maxWidth: 360,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
