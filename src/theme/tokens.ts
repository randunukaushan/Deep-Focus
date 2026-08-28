/**
 * Deep Focus design tokens.
 *
 * Values in this file come from the approved
 * UI/UX Design Specification and Component Library.
 */

export const Palette = {
  deepIndigo: '#4F46E5',
  calmTeal: '#14B8A6',
  softPurple: '#8B5CF6',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  achievement: '#FBBF24',

  lightBackground: '#F8FAFC',
  lightSurface: '#FFFFFF',
  lightBorder: '#E2E8F0',
  lightTextPrimary: '#0F172A',
  lightTextSecondary: '#475569',
  lightTextMuted: '#64748B',

  darkBackground: '#0F172A',
  darkSurface: '#1E293B',
  darkSurfaceElevated: '#334155',
  darkTextPrimary: '#F8FAFC',
  darkTextSecondary: '#CBD5E1',
  darkTextMuted: '#94A3B8',
} as const;

export const Colors = {
  light: {
    background: Palette.lightBackground,
    surface: Palette.lightSurface,
    surfaceElevated: Palette.lightSurface,
    border: Palette.lightBorder,

    textPrimary: Palette.lightTextPrimary,
    textSecondary: Palette.lightTextSecondary,
    textMuted: Palette.lightTextMuted,

    primary: Palette.deepIndigo,
    secondary: Palette.calmTeal,
    aiAccent: Palette.softPurple,

    success: Palette.success,
    warning: Palette.warning,
    error: Palette.error,
    achievement: Palette.achievement,
  },

  dark: {
    background: Palette.darkBackground,
    surface: Palette.darkSurface,
    surfaceElevated: Palette.darkSurfaceElevated,
    border: Palette.darkSurfaceElevated,

    textPrimary: Palette.darkTextPrimary,
    textSecondary: Palette.darkTextSecondary,
    textMuted: Palette.darkTextMuted,

    primary: Palette.deepIndigo,
    secondary: Palette.calmTeal,
    aiAccent: Palette.softPurple,

    success: Palette.success,
    warning: Palette.warning,
    error: Palette.error,
    achievement: Palette.achievement,
  },
} as const;

export type ThemeName = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ThemeName];
export type ThemeColorName = keyof ThemeColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const Radius = {
  card: 16,
} as const;

export const Typography = {
  display: {
    fontSize: 40,
    fontWeight: '800',
  },
  heading1: {
    fontSize: 32,
    fontWeight: '700',
  },
  heading2: {
    fontSize: 28,
    fontWeight: '700',
  },
  heading3: {
    fontSize: 24,
    fontWeight: '600',
  },
  heading4: {
    fontSize: 20,
    fontWeight: '600',
  },
  heading5: {
    fontSize: 18,
    fontWeight: '600',
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
} as const;

export const LineHeightRatio = {
  heading: 1.2,
  body: 1.5,
  caption: 1.4,
} as const;

export const LetterSpacingEm = {
  heading: -0.02,
  body: 0,
  button: 0.02,
  caption: 0.03,
} as const;