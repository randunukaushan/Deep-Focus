import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, accessibilityRole, accessibilityLiveRegion, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return <View accessibilityLiveRegion={accessibilityLiveRegion ?? (accessibilityRole === 'alert' ? 'assertive' : undefined)} accessibilityRole={accessibilityRole} style={[{ backgroundColor: theme[type ?? 'background'] }, style]} {...otherProps} />;
}
