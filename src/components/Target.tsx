import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, Polygon, RadialGradient, Stop } from 'react-native-svg';
import { BOUNCE_FLASH_MS, COLORS, EXPLOSION_MS } from '../constants';
import { LaneConfig, TargetState } from '../types';
import { shadeColor } from '../utils/color';
import { playBounce } from '../utils/sound';

// A 5-pointed star outline, as an SVG polygon-points string — the classic
// "connect alternating outer/inner radius points" construction, with the
// first point straight up so the star always has a point at the top.
function starPoints(cx: number, cy: number, outerR: number, innerR: number, spikes = 5): string {
  const step = Math.PI / spikes;
  let angle = -Math.PI / 2;
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
    angle += step;
  }
  return pts.join(' ');
}

const STAR_OUTER_POINTS = starPoints(50, 50, 42, 17);
const STAR_SHADOW_POINTS = starPoints(53, 54, 42, 17);

interface Props {
  target: TargetState;
  lane: LaneConfig;
  laneY: number;
}

const SPARK_ANGLES_DEG = [0, 60, 120, 180, 240, 300];
const SHATTER_ANGLES_DEG = [10, 55, 95, 140, 180, 220, 265, 310];
const IMPLODE_ANGLES_DEG = [30, 100, 170, 230, 300];

export default function Target({ target, lane, laneY }: Props) {
  const isHit = target.hitAt !== null;
  const glowSize = lane.size * 1.9;
  // The explosion is colored by whoever's bullet landed it (blue player,
  // red bot), not the target's own lane color — that's the whole point:
  // it reads as "who scored this" at a glance.
  const explosionColor = target.hitColor ?? lane.color;
  const variant = target.explosionVariant % 3;
  // A golden target is the same lane shape, just recolored gold and given an
  // extra pulsing ring, so it reads as special at a glance without a new
  // sprite. The pulse is derived straight from the spin phase the game loop
  // already advances every tick, not a standalone Animated loop.
  const baseColor = target.isGolden ? COLORS.gold : lane.color;
  const goldenPulse = target.isGolden ? 0.4 + 0.4 * Math.abs(Math.sin(target.spin * Math.PI * 4)) : 0;
  // A gradient-shaded, gently extruded 5-pointed star instead of a flat
  // color fill — shaded entirely from the lane/gold color via shadeColor,
  // no second color defined anywhere.
  const starLight = shadeColor(baseColor, 45);
  const starDark = shadeColor(baseColor, -35);
  const starGradId = `star-${target.id}`;

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

  // A quick bright flash + pop every time the target bounces off a side
  // wall — another finite, one-shot animation triggered off state the game
  // loop already tracks (bounceId), same safe pattern as the explosion.
  const bounce = useRef(new Animated.Value(0)).current;
  const prevBounceId = useRef(target.bounceId);
  useEffect(() => {
    if (target.bounceId !== prevBounceId.current) {
      bounce.setValue(1);
      Animated.timing(bounce, {
        toValue: 0,
        duration: BOUNCE_FLASH_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
      playBounce();
    }
    prevBounceId.current = target.bounceId;
  }, [target.bounceId, bounce]);

  // A real 3D tumble (rotateY + perspective), not a flat in-plane spin — the
  // star turns to face you edge-on and back, like a coin flipping, rather
  // than pinwheeling around a fixed axis. Driven straight from the target's
  // own spin phase, which the main game loop advances every tick — no
  // independent animation clock to fall out of sync or silently stop.
  const spinY = `${target.spin * 360}deg`;

  const bouncePop = bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const bounceFlashOpacity = bounce;

  // Variant 0 — Burst: ring expands outward, round sparks fly out, core
  // blooms and fades.
  const burstSparkOpacity = explode.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] });
  const burstCoreOpacity = explode.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const burstCoreScale = explode.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const burstRingScale = explode.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.6] });
  const burstRingOpacity = explode.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] });

  // Variant 1 — Shatter: the star cracks into little spinning shards instead
  // of a round burst; the core crumbles away fast rather than blooming.
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
        top: laneY - glowSize / 2,
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
                  width: lane.size * 1.55,
                  height: lane.size * 1.55,
                  borderRadius: lane.size * 0.78,
                  borderColor: COLORS.gold,
                  opacity: goldenPulse,
                },
              ]}
            />
          )}
          <View
            style={[
              styles.spinWrap,
              { width: lane.size * 1.6, height: lane.size * 1.6, transform: [{ perspective: 400 }, { rotateY: spinY }] },
            ]}
          >
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
              <Defs>
                <RadialGradient id={starGradId} cx="0.38" cy="0.32" r="0.75">
                  <Stop offset="0" stopColor={starLight} />
                  <Stop offset="0.6" stopColor={baseColor} />
                  <Stop offset="1" stopColor={starDark} />
                </RadialGradient>
              </Defs>
              {/* A duplicate star, offset down-right and darkened, read as the
                  lit one's own cast shadow/thickness — a cheap but effective
                  way to fake extrusion without a real 3D renderer. */}
              <Polygon points={STAR_SHADOW_POINTS} fill={starDark} opacity={0.55} />
              <Polygon points={STAR_OUTER_POINTS} fill={`url(#${starGradId})`} stroke={starDark} strokeWidth={2} strokeLinejoin="round" />
            </Svg>
          </View>
        </>
      )}

      <Animated.View
        style={[
          styles.core,
          {
            // Idle, the star's own gradient already reads as a lit, faceted
            // shape — a full-size solid dot here would just eclipse it. Only
            // the explosion wants the big lane.size crumbling-core look.
            width: isHit ? lane.size : lane.size * 0.3,
            height: isHit ? lane.size : lane.size * 0.3,
            borderRadius: lane.size / 2,
            backgroundColor: isHit ? explosionColor : baseColor,
            shadowColor: isHit ? explosionColor : baseColor,
            opacity: isHit ? (variant === 1 ? shatterCoreOpacity : variant === 2 ? implodeCoreOpacity : burstCoreOpacity) : 1,
            transform: [
              {
                scale: isHit
                  ? variant === 1
                    ? shatterCoreScale
                    : variant === 2
                      ? implodeCoreScale
                      : burstCoreScale
                  : bouncePop,
              },
            ],
          },
        ]}
      />
      {!isHit && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bounceFlash,
            {
              width: lane.size,
              height: lane.size,
              borderRadius: lane.size / 2,
              opacity: bounceFlashOpacity,
              transform: [{ scale: bouncePop }],
            },
          ]}
        />
      )}
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
  bounceFlash: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
});
