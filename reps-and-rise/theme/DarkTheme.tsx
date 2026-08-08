/**
 * ember design tokens.
 *
 * One source of truth for both palettes. The warm tan/amber tokens the app already
 * used are kept; a single hot "ember" accent is added for actions.
 *
 * Accent discipline: `accent` is only ever the one primary action on a screen.
 * Never decoration, never data — numbers use `secondary`/`primary`.
 */

const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

const radius = {
  xs: 1,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 16,
  xxl: 22,
  pill: 999,
};

/** Font family names must match the keys loaded by useFonts in app/_layout.tsx. */
const family = {
  display: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  body: 'Barlow_400Regular',
  bodyMedium: 'Barlow_500Medium',
  bodySemibold: 'Barlow_600SemiBold',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
};

const font = {
  title: 24,
  subtitle: 18,
  body: 16,
  small: 14,
  tiny: 12,
  label: 11,
  weight: {
    regular: '400',
    semibold: '600',
    bold: '700',
  },
  family,
};

export const DarkTheme = {
  colors: {
    // Surfaces, darkest to lightest
    background: '#141210',
    surfaceSunken: '#1A1816',
    card: '#1F1D1B',
    rowItem: '#1F1D1B',
    iconBackground: '#211E1C',
    key: '#2B2825',
    keyPressed: '#3A3632',
    // Lines
    border: '#2C2926',
    hairline: '#262320',
    // Text
    text: '#FAFAF8',
    subtext: '#8F887F',
    muted: '#6B655E',
    placeholder: '#6B655E',
    white: '#FAFAF8',
    // Brand
    accent: '#F2762E',
    accentHover: '#FF8A45',
    accentSoft: 'rgba(242,118,46,0.09)',
    accentSoftBorder: 'rgba(242,118,46,0.28)',
    onAccent: '#141210',
    secondary: '#B8956A',
    primary: '#8B7355',
    // Feedback
    danger: '#FF6B4A',
    dangerSoft: 'rgba(255,107,74,0.10)',
    dangerSoftBorder: 'rgba(255,107,74,0.35)',
    success: '#7FB069',
    // Selected exercise chip in the logger
    selectedCard: '#2B2521',
  },
  spacing,
  radius,
  font,
};

export const DefaultTheme = {
  colors: {
    background: '#FAFAF8',
    surfaceSunken: '#F5F1EB',
    card: '#FFFFFF',
    rowItem: '#FAFAF8',
    iconBackground: '#F5F1EB',
    key: '#FFFFFF',
    keyPressed: '#F5F1EB',
    border: '#E6E2DA',
    hairline: '#E6E2DA',
    text: '#1A1A1A',
    subtext: '#6B7280',
    muted: '#9CA3AF',
    placeholder: '#A3A3A3',
    white: '#FAFAF8',
    accent: '#F2762E',
    accentHover: '#D9601C',
    accentSoft: 'rgba(242,118,46,0.08)',
    accentSoftBorder: 'rgba(242,118,46,0.25)',
    onAccent: '#FFFFFF',
    secondary: '#B8956A',
    primary: '#8B7355',
    danger: '#D9601C',
    dangerSoft: 'rgba(217,96,28,0.08)',
    dangerSoftBorder: 'rgba(217,96,28,0.30)',
    success: '#4F7942',
    selectedCard: '#FFF3EA',
  },
  spacing,
  radius,
  font,
};

export type Theme = typeof DarkTheme;
