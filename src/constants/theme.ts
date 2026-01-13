export const colors = {
  primary: '#6B8E6B',
  primaryLight: '#8FB08F',
  primaryDark: '#4A6B4A',
  secondary: '#E8D5B7',
  background: '#FBF9F6',
  surface: '#FFFFFF',
  text: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#B2BEC3',
  healthy: '#7CB342',
  dueSoon: '#FFB74D',
  overdue: '#E57373',
  border: '#E0E0E0',
  error: '#E53935',
  success: '#43A047',
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
