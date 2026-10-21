import { Image } from 'expo-image';
import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { focusDialArt } from '@/features/focus/focus-dial-art';
import { Spacing } from '@/theme/tokens';

export function FocusDial({ value, caption, progress = 0 }: { value: string; caption: string; progress?: number }) {
  const theme = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const size = Math.max(160, Math.min(300, width - Spacing.lg * 2));
  // A new SVG is decoded only when a whole percentage changes, not every timer tick.
  const percent = Math.floor(Math.max(0, Math.min(1, progress)) * 100);
  const source = useMemo(() => ({ uri: `data:image/svg+xml;utf8,${encodeURIComponent(focusDialArt(percent / 100, theme.border, theme.primary))}` }), [percent, theme.border, theme.primary]);
  const fontSize = Math.min(56, (size - 40) / (Math.max(5, value.length) * 0.62 * Math.max(1, fontScale)));
  return <View style={[styles.dial, { width: size, minHeight: size }]}>
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={StyleSheet.absoluteFill}><Image accessible={false} source={source} style={StyleSheet.absoluteFill} contentFit="contain" transition={0} cachePolicy="none" /></View>
    <ThemedText style={[styles.value, { fontSize, lineHeight: fontSize * 1.25 }]}>{value}</ThemedText>
    <ThemedText style={styles.caption} themeColor="textSecondary" type="small">{caption}</ThemedText>
  </View>;
}
const styles = StyleSheet.create({
  dial: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, gap: Spacing.sm },
  value: { fontWeight: '600', fontVariant: ['tabular-nums'], textAlign: 'center' },
  caption: { textAlign: 'center' },
});
