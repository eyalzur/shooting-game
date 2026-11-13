import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';
import { COLORS, EXPLOSION_MS } from '../constants';
import { TargetState } from '../types';
import { shadeColor } from '../utils/color';

interface Props {
  target: TargetState;
}

const SPARK_ANGLES_DEG = [0, 60, 120, 180, 240, 300];
const SHATTER_ANGLES_DEG = [10, 55, 95, 140, 180, 220, 265, 310];
const IMPLODE_ANGLES_DEG = [30, 100, 170, 230, 300];

export default function Target({ target }: Props) {
  const isHit = target.hitAt !== null;
  const glowSize = target.size * 1.9;
  // The explosion is colored by whoever's bullet landed it, not the
  // planet's own tier color — that's the whole point: it reads as "who
  // scored this" at a glance.
  const explosionColor = target.hitColor ?? target.color;
  const variant = target.explosionVariant % 3;
  // A golden planet is the same tier shape, just recolored gold and given an
  // extra pulsing ring, so it reads as special at a glance without a new
  // sprite. The pulse is derived straight from the spin phase the game loop
  // already advances every tick, not a standalone Animated loop.
  const baseColor = target.isGolden ? COLORS.gold : target.color;
  const goldenPulse = target.isGolden ? 0.4 + 0.4 * Math.abs(Math.sin(target.spin * Math.PI * 4)) : 0;
  // A gradient-shaded little planet — a lit sphere with a couple of darker
  // surface patches and a soft highlight, like a spinning moon or Mars —
  // shaded entirely from the tier/gold color via shadeColor, no second
  // color defined anywhere.
  const planetLight = shadeColor(baseColor, 45);
  const planetDark = shadeColor(baseColor, -35);
  const planetGradId = `planet-${target.id}`;

  // One-shot explosion, triggered on the instant a hit lands. It's a finite
  // animation (not a loop), so it can't drift or stall the way an
  // always-running per-target loop could. Which shape it plays (burst,
  // shatter, implode) is picked per-hit for variety, but all three ride the
  // same single timeline.
  const explode = useRef(new Animated.Value(0)).current;
  const prevHitAt = useRef<number | null>(null);
  useEffect(() => {
    if (target.hitAt !== null && target.hitAt !== prevHitAt.current) {
      explode.setValue(0);
      Animated.timing(explode, {
        toValue: 1,
        duration: EXPLOSION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
    prevHitAt.current = target.hitAt;
  }, [target.hitAt, explode]);

  // CSS rotateX/rotateY spins the whole flat circle as a rigid plane, which
  // inevitably flattens to a thin line edge-on — reads as a spinning disc,
  // not a ball. Instead the outer circle never rotates at all; "spin" is
  // faked the way 2D globe sprites always have, by sweeping the surface
  // detail (craters + meridian mesh lines below) across a fixed, always-
  // round silhouette, so it reads as a solid 3D ball at every frame. Driven
  // straight from the target's own spin phase, which the main game loop
  // advances every tick — no independent animation clock to fall out of
  // sync or silently stop.
  const spinAngle = target.spin * Math.PI * 2;
  const SPHERE_R = 46;
  // Craters: orbit across the face, foreshortening (narrowing) and fading
  // as they near the limb and swing onto the far side — exactly how a
  // marking on a rotating globe behaves — then reappear on the other edge.
  const craters = [
    { phase: 0, cy: 40, baseRx: 10, ry: 6 },
    { phase: 2.3, cy: 64, baseRx: 7, ry: 5 },
    { phase: 4.4, cy: 52, baseRx: 6, ry: 4 },
  ].map(({ phase, cy, baseRx, ry }) => {
    const angle = spinAngle + phase;
    const cosA = Math.cos(angle);
    const facing = Math.max(0, cosA);
    return {
      cx: 50 + Math.sin(angle) * SPHERE_R * 0.58,
      cy,
      rx: baseRx * facing,
      ry,
      opacity: 0.32 * facing,
    };
  });
  // Meridian lines: the classic fake-3D-globe mesh — arcs anchored at the
  // top and bottom pole that bulge out to one side or the other, the bulge
  // growing and shrinking with the spin phase, same as lines of longitude
  // sweeping across a turning globe. Built as SVG arc paths (not ellipses)
  // so each one is naturally a single curve from pole to pole, always
  // inside the sphere's own circle — nothing to clip.
  const meridians = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((phase) => {
    const angle = spinAngle + phase;
    const bulge = Math.sin(angle) * SPHERE_R;
    const sweep = bulge >= 0 ? 1 : 0;
    return {
      d: `M 50 ${50 - SPHERE_R} A ${Math.abs(bulge)} ${SPHERE_R} 0 0 ${sweep} 50 ${50 + SPHERE_R}`,
      opacity: 0.18 + 0.12 * Math.max(0, Math.cos(angle)),
    };
  });

  // Variant 0 — Burst: ring expands outward, round sparks fly out, core
  // blooms and fades.
  const burstSparkOpacity = explode.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] });
  const burstCoreOpacity = explode.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const burstCoreScale = explode.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const burstRingScale = explode.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.6] });
  const burstRingOpacity = explode.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] });

  // Variant 1 — Shatter: the planet cracks into little spinning shards
  // instead of a round burst; the core crumbles away fast rather than
  // blooming.
  const shatterCoreOpacity = explode.interpolate({ inputRange: [0, 0.4, 1], outputRange: [1, 0.5, 0] });
  const shatterCoreScale = explode.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] });
  const shardOpacity = explode.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] });

  // Variant 2 — Implode: everything collapses inward and winks out, instead
  // of flying apart.
  const implodeRingScale = explode.interpolate({ inputRange: [0, 1], outputRange: [2.4, 0.15] });
  const implodeRingOpacity = explode.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.9, 0.5, 0] });
  const implodeCoreScale = explode.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.55, 0] });
  const implodeCoreOpacity = explode.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 0.85, 0] });
  const implodeDotOpacity = explode.interpolate({ inputRange: [0, 0.65, 1], outputRange: [1, 1, 0] });

  return (
    <View
      style={{
        position: 'absolute',
        left: target.x - glowSize / 2,
        top: target.y - glowSize / 2,
        width: glowSize,
        height: glowSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isHit && variant === 0 && (
        <>
          <Animated.View
            style={[
              styles.ring,
              {
                width: glowSize,
                height: glowSize,
                borderRadius: glowSize / 2,
                borderColor: explosionColor,
                opacity: burstRingOpacity,
                transform: [{ scale: burstRingScale }],
              },
            ]}
          />
          {SPARK_ANGLES_DEG.map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const dist = glowSize * 0.7;
            const translateX = explode.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * dist] });
            const translateY = explode.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * dist] });
            return (
              <Animated.View
                key={angle}
                style={[
                  styles.spark,
                  {
                    backgroundColor: explosionColor,
                    shadowColor: explosionColor,
                    opacity: burstSparkOpacity,
                    transform: [{ translateX }, { translateY }],
                  },
                ]}
              />
            );
          })}
        </>
      )}

      {isHit && variant === 1 &&
        SHATTER_ANGLES_DEG.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const dist = glowSize * 0.85;
          const translateX = explode.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * dist] });
          const translateY = explode.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * dist] });
          const spin = explode.interpolate({
            inputRange: [0, 1],
            outputRange: [`${angle}deg`, `${angle + (i % 2 === 0 ? 540 : -540)}deg`],
          });
          return (
            <Animated.View
              key={angle}
              style={[
                styles.shard,
                {
                  height: 6 + (i % 3) * 3,
                  backgroundColor: explosionColor,
                  shadowColor: explosionColor,
                  opacity: shardOpacity,
                  transform: [{ translateX }, { translateY }, { rotate: spin }],
                },
              ]}
            />
          );
        })}

      {isHit && variant === 2 && (
        <>
          <Animated.View
            style={[
              styles.ring,
              {
                width: glowSize,
                height: glowSize,
                borderRadius: glowSize / 2,
                borderColor: explosionColor,
                opacity: implodeRingOpacity,
                transform: [{ scale: implodeRingScale }],
              },
            ]}
          />
          {IMPLODE_ANGLES_DEG.map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const dist = glowSize * 0.75;
            const translateX = explode.interpolate({ inputRange: [0, 1], outputRange: [Math.cos(rad) * dist, 0] });
            const translateY = explode.interpolate({ inputRange: [0, 1], outputRange: [Math.sin(rad) * dist, 0] });
            return (
              <Animated.View
                key={angle}
                style={[
                  styles.spark,
                  {
                    backgroundColor: explosionColor,
                    shadowColor: explosionColor,
                    opacity: implodeDotOpacity,
                    transform: [{ translateX }, { translateY }],
                  },
                ]}
              />
            );
          })}
        </>
      )}

      {!isHit && (
        <>
          <View
            style={[
              styles.glow,
              {
                width: glowSize,
                height: glowSize,
                borderRadius: glowSize / 2,
                backgroundColor: baseColor,
                shadowColor: baseColor,
              },
            ]}
          />
          {target.isGolden && (
            <View
              pointerEvents="none"
              style={[
                styles.goldRing,
                {
                  width: target.size * 1.55,
                  height: target.size * 1.55,
                  borderRadius: target.size * 0.78,
                  borderColor: COLORS.gold,
                  opacity: goldenPulse,
                },
              ]}
            />
          )}
          <View style={[styles.spinWrap, { width: target.size, height: target.size }]}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
              <Defs>
                <RadialGradient id={planetGradId} cx="0.36" cy="0.32" r="0.75">
                  <Stop offset="0" stopColor={planetLight} />
                  <Stop offset="0.6" stopColor={baseColor} />
                  <Stop offset="1" stopColor={planetDark} />
                </RadialGradient>
              </Defs>
              {/* The silhouette itself never rotates — always a perfect
                  circle, so it can never flatten into a thin disc. */}
              <Circle cx={50} cy={50} r={SPHERE_R} fill={`url(#${planetGradId})`} stroke={planetDark} strokeWidth={2} />
              {/* Longitude mesh lines, sweeping across the fixed silhouette. */}
              {meridians.map((m, i) => (
                <Path key={i} d={m.d} fill="none" stroke={planetLight} strokeWidth={1} opacity={m.opacity} />
              ))}
              {/* Craters/continents orbiting across the face, foreshortening
                  and fading as they swing around toward the far side. */}
              {craters.map((c, i) => (
                <Ellipse key={i} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill={planetDark} opacity={c.opacity} />
              ))}
              {/* Soft specular highlight, like sunlight catching the surface. */}
              <Ellipse cx={34} cy={30} rx={10} ry={6} fill="#ffffff" opacity={0.3} />
            </Svg>
          </View>
        </>
      )}

      <Animated.View
        style={[
          styles.core,
          {
            // Idle, the planet sphere above is the whole visible body — this
            // dot only matters for the explosion's crumbling-core look, so
            // it's invisible until a hit starts it.
            width: target.size,
            height: target.size,
            borderRadius: target.size / 2,
            backgroundColor: isHit ? explosionColor : baseColor,
            shadowColor: isHit ? explosionColor : baseColor,
            opacity: isHit ? (variant === 1 ? shatterCoreOpacity : variant === 2 ? implodeCoreOpacity : burstCoreOpacity) : 0,
            transform: [
              {
                scale: isHit
                  ? variant === 1
                    ? shatterCoreScale
                    : variant === 2
                      ? implodeCoreScale
                      : burstCoreScale
                  : 1,
              },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    opacity: 0.22,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
  goldRing: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  spark: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  shard: {
    position: 'absolute',
    width: 2.5,
    borderRadius: 1.5,
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  spinWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
});
