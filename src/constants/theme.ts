export const colors = {
  // Primary: Terminal green
  primary: '#22CC22',
  primaryLight: '#33FF33',
  primaryDark: '#1A9A1A',

  // Secondary: Amber
  secondary: '#FFAA00',

  // CRT black backgrounds
  background: '#000000',
  surface: '#0A0A0A',
  surfaceElevated: '#111111',

  // CRT text colors - green based (darker than healthy status)
  text: '#22CC22',           // Darker green for main text
  textSecondary: '#1A9A1A',  // Dimmer green
  textLight: '#117711',      // Muted green

  // Status colors (high contrast CRT)
  healthy: '#33FF33',    // Green only for healthy status
  dueSoon: '#FFAA00',    // Amber
  overdue: '#FF3333',    // Bright red

  // System
  border: '#1A9A1A',     // Green border (matches textSecondary)
  error: '#FF3333',
  success: '#33FF33',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  full: 0,  // Sharp corners everywhere - DOS style
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: colors.text,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.text,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textLight,
  },
};
