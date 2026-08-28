import '@/global.css';

import { Platform } from 'react-native';

import {
  Colors as DesignColors,
  Spacing as DesignSpacing,
  LetterSpacingEm,
  LineHeightRatio,
  Palette,
  Radius,
  Typography,
} from '@/theme/tokens';

export {
  LetterSpacingEm,
  LineHeightRatio,
  Palette,
  Radius,
  Typography
};

/**
 * Deep Focus semantic colors with temporary compatibility
 * aliases for the existing Expo Starter components.
 */
export const Colors = {
  light: {
    ...DesignColors.light,

    // Existing component compatibility aliases
    text: DesignColors.light.textPrimary,
    backgroundElement: DesignColors.light.surface,
    backgroundSelected: DesignColors.light.border,
  },

  dark: {
    ...DesignColors.dark,

    // Existing component compatibility aliases
    text: DesignColors.dark.textPrimary,
    backgroundElement: DesignColors.dark.surface,
    backgroundSelected: DesignColors.dark.surfaceElevated,
  },
} as const;

export type ThemeColor =
  keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/**
 * Semantic Deep Focus spacing tokens plus temporary aliases
 * used by existing components.
 */
export const Spacing = {
  ...DesignSpacing,

  // Existing component compatibility aliases
  one: DesignSpacing.xs,
  two: DesignSpacing.sm,
  three: DesignSpacing.md,
  four: DesignSpacing.lg,
  five: DesignSpacing.xl,
  six: DesignSpacing.xxxl,
} as const;

export const BottomTabInset =
  Platform.select({
    ios: 50,
    android: 80,
  }) ?? 0;

export const MaxContentWidth = 800;