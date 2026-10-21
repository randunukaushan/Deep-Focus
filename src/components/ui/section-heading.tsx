import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing, Typography } from '@/theme/tokens';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

/** Presentation only: translated content belongs to each screen's existing copy. */
export function SectionHeading({ eyebrow, title, subtitle, icon }: SectionHeadingProps) {
  const theme = useTheme();

  return (
    <View style={styles.heading}>
      <View style={styles.kicker}>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.icon, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <Ionicons color={theme.primary} name={icon} size={20} />
        </View>
        <ThemedText style={[styles.eyebrow, { color: theme.textSecondary }]} type="smallBold">{eyebrow}</ThemedText>
      </View>
      <ThemedText accessibilityRole="header" style={styles.title} type="title">{title}</ThemedText>
      <ThemedText themeColor="textSecondary">{subtitle}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { gap: Spacing.sm },
  kicker: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  icon: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 },
  eyebrow: { flex: 1 },
  title: { fontSize: Typography.heading1.fontSize, lineHeight: 40 },
});
