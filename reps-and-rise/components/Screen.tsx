import { useThemeMode } from '@/theme/ThemeContext';
import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ScreenEdge = 'top' | 'bottom';

/**
 * Minimum padding applied even when the device reports a zero inset.
 *
 * This is what makes the layouts work on Android as well as iOS: `SafeAreaView`
 * from `react-native` is a plain View on Android, and with `edgeToEdgeEnabled`
 * turned on in app.json content otherwise runs under the status bar and the
 * gesture/navigation bar. Devices with gesture navigation also report a very
 * small (or zero) bottom inset, so a floor keeps content off the very edge.
 */
export const MIN_TOP_PAD = 12;
export const MIN_BOTTOM_PAD = 16;

/** Height of the tab bar content, excluding the bottom safe-area inset. */
export const TAB_BAR_CONTENT_HEIGHT = 58;

interface ScreenProps {
  children: ReactNode;
  /** Which safe-area edges to pad. Defaults to both. */
  edges?: ScreenEdge[];
  /** Horizontal padding applied to the content. */
  pad?: number;
  /** Extra space added below the safe-area bottom inset (e.g. to clear a tab bar). */
  extraBottom?: number;
  /** Render the content inside a ScrollView, keeping the bottom inset on the content. */
  scroll?: boolean;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle' | 'style'>;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Override the background; defaults to the theme background. */
  backgroundColor?: string;
}

/**
 * Screen container that applies real safe-area padding on both iOS and Android.
 *
 * Always use this instead of `SafeAreaView` from `react-native`.
 */
export function Screen({
  children,
  edges = ['top', 'bottom'],
  pad = 0,
  extraBottom = 0,
  scroll = false,
  scrollProps,
  style,
  contentStyle,
  backgroundColor,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeMode();

  const paddingTop = edges.includes('top') ? Math.max(insets.top, MIN_TOP_PAD) : 0;
  const paddingBottom = edges.includes('bottom')
    ? Math.max(insets.bottom, MIN_BOTTOM_PAD) + extraBottom
    : extraBottom;

  const background = backgroundColor ?? theme.colors.background;

  if (scroll) {
    return (
      <View style={[styles.flex, { backgroundColor: background, paddingTop }, style]}>
        <ScrollView
          style={styles.flex}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
          {...scrollProps}
          contentContainerStyle={[{ paddingHorizontal: pad, paddingBottom }, contentStyle]}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.flex,
        { backgroundColor: background, paddingTop, paddingBottom, paddingHorizontal: pad },
        style,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * Bottom offset for controls that float above the tab bar (FABs, back buttons),
 * so they clear the gesture bar on Android and the home indicator on iOS.
 */
export function useFloatingBottomOffset(overTabBar = true) {
  const insets = useSafeAreaInsets();
  const base = Math.max(insets.bottom, MIN_BOTTOM_PAD);
  return overTabBar ? base + TAB_BAR_CONTENT_HEIGHT + 16 : base + 16;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
