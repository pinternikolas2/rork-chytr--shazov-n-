export const Colors = {
  gold: '#D4AF37',
  black: '#000000',
  white: '#FFFFFF',
  lightGray: '#F8F8F8',
  mediumGray: '#E8E8E8',
  darkGray: '#8E8E93',
  textPrimary: '#1C1C1E',
  textSecondary: '#6E6E73',
  textLight: '#AEAEB2',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  accent: '#D4AF37',
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F8F8',
    card: '#FFFFFF',
  },
  text: {
    primary: '#1C1C1E',
    secondary: '#6E6E73',
    tertiary: '#AEAEB2',
  },
  border: {
    light: '#E8E8E8',
    medium: '#D1D1D6',
  },
} as const;

export default {
  light: {
    text: Colors.textPrimary,
    background: Colors.white,
    tint: Colors.accent,
    tabIconDefault: Colors.textLight,
    tabIconSelected: Colors.accent,
  },
};
