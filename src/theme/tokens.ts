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
  mintPrimary: '#3B82F6',
  tealAccent: '#14B8A6',
  aiAccent: '#A78BFA',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  achievement: '#FBBF24',

  lightBackground: '#F8FAFC',
  lightSurface: '#FFFFFF',
  lightBorder: '#E5E7EB',
  lightTextPrimary: '#111827',
  lightTextSecondary: '#475569',
  lightTextMuted: '#64748B',

  // Home light-mode atmosphere: soft sky canvas with a calm blue-teal action tone.
  homeLightBackground: '#F8FAFC',
  homeMorningBackground: '#F8FAFC',
  homeMorningAccent: '#E4773C',
  homeEveningBackground: '#F5D8D1',
  homeLightSurface: '#FFFFFF',
  homeLightBorder: '#E5E7EB',
  homeLightAction: '#3B82F6',
  homeLightActionSoft: '#EFF6FF',

  darkBackground: '#0B1220',
  darkSurface: '#111827',
  darkSurfaceElevated: '#1F2937',
  darkTextPrimary: '#FFFFFF',
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
