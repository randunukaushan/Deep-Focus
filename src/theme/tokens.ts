/**
 * Deep Focus design tokens.
 *
 * Canonical roles and dated palette reconciliation: docs/COLOR_SYSTEM.md.
 * Keep October preview values and compatibility names for existing consumers.
 */

export const Palette = {
  // October preview palette; primary blue, teal progress, navy surfaces.
  deepNavy: '#0F2537',
  navySurface: '#17354A',
  navySurfaceElevated: '#1B3B54',
  // Compatibility accent for screens not yet converted to semantic primary.
  mintPrimary: '#3B82F6',
  previewAction: '#2165DF',
  darkAction: '#8BB8FF',
  tealAccent: '#14B8A6',
  focusBlue: '#3B82F6',
  focusBlueDark: '#2982F6',
  focusBluePressed: '#2563EB',
  progressTeal: '#14B8A6',
  achievementPurple: '#A78BFA',
  aiAccent: '#A78BFA',

  success: '#22C55E',
  warning: '#F59E0B',
  warningText: '#B45309',
  error: '#EF4444',
  achievement: '#FBBF24',

  lightBackground: '#F6F9FD',
  lightSurface: '#FFFFFF',
  lightBorder: '#DBE5F0',
  lightTextPrimary: '#142E48',
  lightTextSecondary: '#526981',
  lightTextMuted: '#526981',

  // Home light-mode atmosphere: soft sky canvas with a calm blue-teal action tone.
  homeLightBackground: '#F6F9FD',
  homeMorningBackground: '#F8FAFC',
  homeMorningAccent: '#E4773C',
  homeEveningBackground: '#F5D8D1',
  homeLightSurface: '#FFFFFF',
  homeLightBorder: '#DBE5F0',
  homeLightAction: '#3B82F6',
  homeLightActionSoft: '#EAF2FF',

  darkBackground: '#07182B',
  darkSurface: '#10253D',
  darkSurfaceElevated: '#162F4C',
  darkTextPrimary: '#ECF4FF',
  darkTextSecondary: '#A6BBD4',
  darkTextMuted: '#A6BBD4',
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

    primary: Palette.previewAction,
    primaryPressed: Palette.focusBluePressed,
    borderFocus: Palette.previewAction,
    progress: Palette.progressTeal,
    info: Palette.aiAccent,
    danger: Palette.error,
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

    primary: Palette.darkAction,
    primaryPressed: Palette.focusBluePressed,
    borderFocus: Palette.darkAction,
    progress: Palette.progressTeal,
    info: Palette.aiAccent,
    danger: Palette.error,
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
