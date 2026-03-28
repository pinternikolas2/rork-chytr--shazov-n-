export const Colors = {
  gold: '#F4C430',
  black: '#0A0A0A',
  white: '#FFFFFF',
  lightGray: '#F5F5F7',
  mediumGray: '#E5E5EA',
  darkGray: '#8E8E93',
  textPrimary: '#1D1D1F',
  textSecondary: '#86868B',
  textLight: '#AEAEB2',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  accent: '#FFD700',
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F7',
    card: '#FFFFFF',
  },
  text: {
    primary: '#1D1D1F',
    secondary: '#86868B',
    tertiary: '#AEAEB2',
  },
  border: {
    light: '#E5E5EA',
    medium: '#D1D1D6',
  },
  shadow: {
    light: 'rgba(0, 0, 0, 0.04)',
    medium: 'rgba(0, 0, 0, 0.08)',
    strong: 'rgba(0, 0, 0, 0.12)',
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
