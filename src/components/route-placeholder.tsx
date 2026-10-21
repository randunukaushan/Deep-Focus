import { type Href, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { MaxContentWidth } from '@/constants/theme';
import { Spacing } from '@/theme/tokens';

type PlaceholderAction = {
  label: string;
  href: Href;
  variant?: 'primary' | 'secondary' | 'ghost';
};

type RoutePlaceholderProps = {
  title: string;
  description: string;
  actions?: PlaceholderAction[];
};

export function RoutePlaceholder({
  title,
  description,
  actions = [],
}: RoutePlaceholderProps) {
  const router = useRouter();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <ThemedText accessibilityRole="header" type="subtitle">
            {title}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{description}</ThemedText>

          {actions.length > 0 ? (
            <View accessibilityRole="none" style={styles.actions}>
              {actions.map((action) => (
                <Button
                  key={action.label}
                  fullWidth
                  label={action.label}
                  onPress={() => router.push(action.href)}
                  variant={action.variant}
                />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.md,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
