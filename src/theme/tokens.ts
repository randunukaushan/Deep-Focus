/**
 * Deep Focus design tokens.
 *
 * Canonical color values are defined in docs/COLOR_SYSTEM.md.
 * Components should prefer semantic values from `Colors` rather than hard-coded
 * hex values or legacy palette names.
 */

export const Palette = {
  // Canonical brand colors.
  focusBlue: '#3B82F6',
  focusBlueDark: '#2982F6',
  focusBluePressed: '#2563EB',
  progressTeal: '#14B8A6',
  achievementPurple: '#8B5CF6',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  achievement: '#8B5CF6',

  // Light theme.
  lightBackground: '#F8FAFC',
  lightSurface: '#FFFFFF',
  lightSurfaceElevated: '#FFFFFF',
  lightBorder: '#E2E8F0',
  lightTextPrimary: '#0F172A',
  lightTextSecondary: '#64748B',
  lightTextMuted: '#94A3B8',
  lightPrimarySoft: '#DBEAFE',
  lightSecondarySoft: '#CCFBF1',

  // Dark theme.
  darkBackground: '#0B1220',
  darkSurface: '#111827',
  darkSurfaceElevated: '#1F2937',
  darkBorder: '#1F2937',
  darkTextPrimary: '#F8FAFC',
  darkTextSecondary: '#94A3B8',
  darkTextMuted: '#64748B',
  darkPrimarySoft: '#102A56',
  darkSecondarySoft: '#0F3D3A',

  /**
   * Legacy compatibility aliases.
   *
   * Keep these while existing components migrate to semantic theme tokens.
   * New code should not introduce new dependencies on these names.
   */
  deepNavy: '#0B1220',
  navySurface: '#111827',
  navySurfaceElevated: '#1F2937',
  mintPrimary: '#3B82F6',
  aiAccent: '#8B5CF6',

  // Legacy Home aliases now map back to the canonical fixed theme.
  // Time-of-day copy may change, but the approved palette must not.
  homeLightBackground: '#F8FAFC',
  homeMorningBackground: '#F8FAFC',
  homeMorningAccent: '#3B82F6',
  homeEveningBackground: '#F8FAFC',
  homeLightSurface: '#FFFFFF',
  homeLightBorder: '#E2E8F0',
  homeLightAction: '#3B82F6',
  homeLightActionSoft: '#DBEAFE',
} as const;

export const Colors = {
  light: {
    background: Palette.lightBackground,
    surface: Palette.lightSurface,
    surfaceElevated: Palette.lightSurfaceElevated,
    border: Palette.lightBorder,
    borderFocus: Palette.focusBlue,

    textPrimary: Palette.lightTextPrimary,
    textSecondary: Palette.lightTextSecondary,
    textMuted: Palette.lightTextMuted,

    primary: Palette.focusBlue,
    primaryPressed: Palette.focusBluePressed,
    secondary: Palette.progressTeal,
    progress: Palette.progressTeal,
    aiAccent: Palette.achievementPurple,
    info: Palette.achievementPurple,

    success: Palette.success,
    warning: Palette.warning,
    error: Palette.error,
    danger: Palette.error,
    achievement: Palette.achievementPurple,
  },

  dark: {
    background: Palette.darkBackground,
    surface: Palette.darkSurface,
    surfaceElevated: Palette.darkSurfaceElevated,
    border: Palette.darkBorder,
    borderFocus: Palette.focusBlueDark,

    textPrimary: Palette.darkTextPrimary,
    textSecondary: Palette.darkTextSecondary,
    textMuted: Palette.darkTextMuted,

    primary: Palette.focusBlueDark,
    primaryPressed: Palette.focusBluePressed,
    secondary: Palette.progressTeal,
    progress: Palette.progressTeal,
    aiAccent: Palette.achievementPurple,
    info: Palette.achievementPurple,

    success: Palette.success,
    warning: Palette.warning,
    error: Palette.error,
    danger: Palette.error,
    achievement: Palette.achievementPurple,
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
