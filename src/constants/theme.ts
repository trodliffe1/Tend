export const colors = {
  // Primary: Cosmic purple
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#6D28D9',

  // Secondary: Stardust
  secondary: '#E0E7FF',

  // Dark space backgrounds
  background: '#0F0B1A',
  surface: '#1A1625',
  surfaceElevated: '#252136',

  // Light text for dark backgrounds
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textLight: '#64748B',

  // Status colors (vibrant for dark mode)
  healthy: '#10B981',    // Emerald
  dueSoon: '#FBBF24',    // Amber
  overdue: '#EF4444',    // Red

  // System
  border: '#2D2640',
  error: '#EF4444',
  success: '#10B981',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
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
