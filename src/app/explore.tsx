import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText accessibilityRole="header" type="title">
        Explore
      </ThemedText>
      <ThemedText style={styles.description} themeColor="textSecondary">
        Discover ways to support your focus practice.
      </ThemedText>
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
});
