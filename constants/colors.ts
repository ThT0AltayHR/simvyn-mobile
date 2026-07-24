/**
 * Simvyn Mobile — dark glass theme (always dark, matching Simvyn dashboard)
 */
const darkPalette = {
  text: '#e8e8ee',
  tint: '#77b3f0',

  background: '#141420',
  foreground: '#e8e8ee',

  surface: '#1c1c2a',
  elevated: '#232333',

  card: '#1c1c2a',
  cardForeground: '#e8e8ee',

  primary: '#77b3f0',
  primaryForeground: '#141420',

  secondary: '#232333',
  secondaryForeground: '#e8e8ee',

  muted: '#232333',
  mutedForeground: '#8e8e9c',

  accent: '#a47ff5',
  accentForeground: '#e8e8ee',

  teal: '#4cc2cf',
  tealForeground: '#141420',

  destructive: '#f07a7a',
  destructiveForeground: '#141420',

  border: 'rgba(255,255,255,0.08)',
  borderHover: 'rgba(255,255,255,0.18)',
  input: '#232333',

  glass: 'rgba(35,35,51,0.6)',
  glassBorder: 'rgba(255,255,255,0.08)',

  statusBooted: '#4cc2cf',
  statusShutdown: '#8e8e9c',
  statusIos: '#77b3f0',
  statusAndroid: '#a4e07a',
};

const colors = {
  // Simvyn is always dark — use same palette for both schemes
  light: darkPalette,
  dark: darkPalette,
  radius: 10,
};

export default colors;
