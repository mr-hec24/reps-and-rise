import { useThemeMode } from '@/theme/ThemeContext';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

/**
 * The ember mark — option A, "cartoon coal".
 *
 * One flat faceted chunk with irregular orange shards glowing between the
 * facets. Hard edges only, no gradients or blur, so it stays crisp at 20px and
 * prints flat. Coordinates are on a 100x100 grid and are shared verbatim with
 * scripts/generate-icons.py, which rasterises the same shape into the app icon.
 */
export const EMBER_POLYGONS: { points: string; fill: string }[] = [
  // Body facets, dark to light
  { points: '26,6 66,2 94,26 98,62 72,94 30,96 4,66 8,30', fill: '#3B2D24' },
  { points: '52,12 94,26 98,62 72,94 42,92', fill: '#221913' },
  { points: '26,10 52,12 40,34 14,36', fill: '#4A392E' },
  // Hot shards
  { points: '28,42 52,32 62,46 42,56', fill: '#F2762E' },
  { points: '56,50 78,44 82,60 60,66', fill: '#FFB04D' },
  { points: '22,62 40,58 38,74 24,72', fill: '#D9541A' },
  { points: '44,38 54,36 54,45 45,47', fill: '#FFE9C4' },
  { points: '62,72 74,68 72,80 62,80', fill: '#F2762E' },
];

interface EmberMarkProps {
  size?: number;
  /** Warm drop shadow behind the mark. Off for small sizes. */
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function EmberMark({ size = 24, glow = false, style }: EmberMarkProps) {
  return (
    <View style={[{ width: size, height: size }, styles.center, style]}>
      {/* Heat halo drawn as stacked translucent circles rather than a platform
          shadow: shadow/elevation props need an opaque background, so on a
          transparent view they render as a hard rectangle on web and Android. */}
      {glow && (
        <>
          <View
            pointerEvents='none'
            style={[
              styles.halo,
              {
                width: size * 1.6,
                height: size * 1.6,
                borderRadius: size,
                backgroundColor: 'rgba(242,118,46,0.07)',
              },
            ]}
          />
          <View
            pointerEvents='none'
            style={[
              styles.halo,
              {
                width: size * 1.24,
                height: size * 1.24,
                borderRadius: size,
                backgroundColor: 'rgba(242,118,46,0.10)',
              },
            ]}
          />
        </>
      )}
      <Svg width={size} height={size} viewBox='0 0 100 100'>
        {EMBER_POLYGONS.map(polygon => (
          <Polygon key={polygon.points} points={polygon.points} fill={polygon.fill} />
        ))}
      </Svg>
    </View>
  );
}

interface EmberWordmarkProps {
  size?: number;
  /** Hide the coal and show the wordmark alone. */
  markOnly?: boolean;
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The coal plus the lowercase "ember" wordmark. */
export function EmberWordmark({ size = 19, glow = false, style }: EmberWordmarkProps) {
  const { theme } = useThemeMode();

  return (
    <View style={[styles.row, { gap: size * 0.58 }, style]}>
      <EmberMark size={size * 0.85} glow={glow} />
      <Text
        style={{
          fontFamily: theme.font.family.display,
          fontSize: size,
          letterSpacing: -size * 0.02,
          color: theme.colors.text,
        }}
      >
        ember
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute' },
});
