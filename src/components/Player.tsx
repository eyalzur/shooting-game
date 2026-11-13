import { Animated, StyleSheet } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Polygon, RadialGradient, Stop } from 'react-native-svg';
import { COLORS, PLAYER_SIZE } from '../constants';
import { shadeColor } from '../utils/color';

interface Props {
  x: number | Animated.Value;
  y: number;
  color?: string;
  /** Grows/shrinks the whole cannon around its own center — driven by the
   * Giant pickup. Plain number or an Animated.Value for a springy pop. */
  scale?: number | Animated.Value;
  /** Vertical recoil kick on fire — a small downward nudge that springs back,
   * independent of scale so Giant and recoil never fight over one transform. */
  kick?: Animated.Value;
}

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

// A hand-drawn fighter-ship silhouette (nose, swept wings, twin tail fins),
// not a photo — this app has no image-generation or asset pipeline, so the
// "art" is a vector drawing built from a single polygon plus a gradient,
// shaded from the ship's own color via shadeColor rather than a second
// color defined anywhere. Color defaults to the player's blue; a bot
// opponent passes its own red so both ships read as clearly different on
// one board. x is positioned via transform (not left) so the live player's
// slide animation can drive it as an Animated.Value while the bot keeps
// using a plain number.
export default function Player({ x, y, color = COLORS.blue, scale = 1, kick }: Props) {
  const translateX = typeof x === 'number' ? x - PLAYER_SIZE / 2 : Animated.subtract(x, PLAYER_SIZE / 2);
  const transform: any[] = [{ translateX }, { scale }];
  if (kick) transform.push({ translateY: kick });
  const hullLight = shadeColor(color, 35);
  const hullDark = shadeColor(color, -30);
  const gradId = `hull-${color.replace('#', '')}`;
  const glowId = `glow-${color.replace('#', '')}`;
  const engineId = `engine-${color.replace('#', '')}`;

  return (
    <AnimatedSvg
      width={PLAYER_SIZE}
      height={PLAYER_SIZE}
      viewBox="0 0 100 100"
      style={[styles.wrap, { top: y - PLAYER_SIZE / 2, transform }]}
    >
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={hullLight} />
          <Stop offset="0.55" stopColor={color} />
          <Stop offset="1" stopColor={hullDark} />
        </LinearGradient>
        <RadialGradient id={glowId} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={color} stopOpacity={0.45} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={engineId} cx="0.5" cy="0.3" r="0.7">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
          <Stop offset="0.5" stopColor={hullLight} stopOpacity={0.8} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* Ambient glow behind the hull. */}
      <Ellipse cx={50} cy={52} rx={46} ry={46} fill={`url(#${glowId})`} />

      {/* Twin engine flares, drawn first so the hull overlaps their tops. */}
      <Ellipse cx={41} cy={86} rx={7} ry={11} fill={`url(#${engineId})`} />
      <Ellipse cx={59} cy={86} rx={7} ry={11} fill={`url(#${engineId})`} />

      {/* Hull: nose, flared fuselage, swept wings, twin tail fins. */}
      <Polygon
        points="50,2 60,26 60,46 94,72 66,62 62,94 50,82 38,94 34,62 6,72 40,46 40,26"
        fill={`url(#${gradId})`}
        stroke={hullDark}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Cockpit canopy. */}
      <Ellipse cx={50} cy={21} rx={6.5} ry={9.5} fill="#eaf6ff" opacity={0.88} />
      <Ellipse cx={48} cy={17} rx={2.4} ry={3.4} fill="#ffffff" opacity={0.75} />
    </AnimatedSvg>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
  },
});
