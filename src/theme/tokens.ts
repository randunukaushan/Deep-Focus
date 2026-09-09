/**
 * Deep Focus design tokens.
 *
 * Values in this file come from the approved
 * UI/UX Design Specification and Component Library.
 */

export const Palette = {
  // Deep Focus brand palette: grounding navy surfaces with a mint action accent.
  deepNavy: '#0F2537',
  navySurface: '#17354A',
  navySurfaceElevated: '#1B3B54',
  mintPrimary: '#7FE5B6',
  aiAccent: '#A78BFA',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  achievement: '#FBBF24',

  lightBackground: '#F4FBF8',
  lightSurface: '#FFFFFF',
  lightBorder: '#B9D9CB',
  lightTextPrimary: '#0F2537',
  lightTextSecondary: '#476578',
  lightTextMuted: '#668493',

  darkBackground: '#0F2537',
  darkSurface: '#17354A',
  darkSurfaceElevated: '#1B3B54',
  darkTextPrimary: '#FFFFFF',
  darkTextSecondary: '#A2BCCF',
  darkTextMuted: '#8FAABD',
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

    primary: Palette.mintPrimary,
    secondary: Palette.navySurface,
    aiAccent: Palette.aiAccent,

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

    primary: Palette.mintPrimary,
    secondary: Palette.navySurfaceElevated,
    aiAccent: Palette.aiAccent,

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
