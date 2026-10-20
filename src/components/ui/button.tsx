import type { ReactNode } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    type PressableProps,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { accentTextColor } from '@/theme/action-colors';
import { Fonts } from '@/constants/theme';
import {
    LetterSpacingEm,
    Palette,
    Radius,
    Spacing,
    Typography,
} from '@/theme/tokens';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'destructive';

export type ButtonProps = Omit<
  PressableProps,
  'children' | 'disabled' | 'style'
> & {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  accentColor?: string;
  loadingAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  accentColor,
  loadingAccessibilityLabel,
  style,
  accessibilityLabel,
  accessibilityState,
  onPress,
  ...pressableProps
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const actionColor = accentColor ?? theme.primary ?? Palette.mintPrimary;
  const containerStyle = getContainerStyle(variant, actionColor);
  const labelColor = getLabelColor(variant, theme.text, actionColor);
  const disabledBackground = theme.backgroundElement;
  const disabledText = theme.textSecondary;
  const accessibleName = accessibilityLabel ?? label;

  return (
    <Pressable
      {...pressableProps}
      accessibilityLabel={loading ? loadingAccessibilityLabel ?? accessibleName : accessibleName}
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        busy: loading || accessibilityState?.busy === true,
        disabled: isDisabled || accessibilityState?.disabled === true,
      }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        containerStyle,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && {
          backgroundColor: disabledBackground,
          borderColor: disabledBackground,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          accessibilityElementsHidden
          color={disabledText}
          size="small"
        />
      ) : (
        icon
      )}

      <Text
        style={[
          styles.label,
          { color: isDisabled ? disabledText : labelColor },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

function getContainerStyle(variant: ButtonVariant, accentColor: string = Palette.mintPrimary): ViewStyle {
  switch (variant) {
    case 'secondary':
      return {
        backgroundColor: 'transparent',
        borderColor: accentColor,
      };

    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      };

    case 'destructive':
      return {
        backgroundColor: Palette.error,
        borderColor: Palette.error,
      };

    case 'primary':
    default:
      return {
        backgroundColor: accentColor,
        borderColor: accentColor,
      };
  }
}

function getLabelColor(variant: ButtonVariant, themeText: string, accentColor: string = Palette.mintPrimary) {
  switch (variant) {
    case 'secondary':
      return accentColor;

    case 'ghost':
      return themeText;

    case 'primary':
      return accentTextColor(accentColor);

    case 'destructive':
    default:
      return Palette.lightSurface;
  }
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    minWidth: 44,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    fontFamily: Fonts.sans,
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'center',
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
    lineHeight: 24,
    letterSpacing:
      Typography.button.fontSize * LetterSpacingEm.button,
  },
});
