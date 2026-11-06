import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LEVEL_THEMES, LEVELS_PER_THEME } from '../constants';

interface Props {
  width: number;
  height: number;
  level?: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface NebulaPos {
  x: number;
  y: number;
  size: number;
}

type Theme = (typeof LEVEL_THEMES)[number];

const THEME_FADE_MS = 1000;

function makeStars(width: number, height: number, count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 1 + Math.random() * 2,
    opacity: 0.25 + Math.random() * 0.65,
  }));
}

// Deterministic per-theme drift so each level's scene isn't just a recolor —
// the nebula composition itself shifts a bit too.
function getNebulaPositions(themeIdx: number, width: number, height: number): NebulaPos[] {
  const driftX = Math.sin(themeIdx * 1.7) * width * 0.1;
  const driftY = Math.cos(themeIdx * 1.3) * height * 0.07;
  const sizeWobble = 1 + ((themeIdx * 37) % 10) * 0.012;
  return [
    { x: width * 0.15 + driftX, y: height * 0.15 + driftY, size: Math.max(width, 220) * sizeWobble },
    { x: width * 0.85 - driftX, y: height * 0.55 + driftY * 0.5, size: Math.max(width, 260) / sizeWobble },
    { x: width * 0.3 + driftY * 0.5, y: height * 0.85 - driftX * 0.4, size: Math.max(width, 200) * sizeWobble },
  ];
}

export default function Starfield({ width, height, level = 0 }: Props) {
  const themeIndex = Math.floor(level / LEVELS_PER_THEME) % LEVEL_THEMES.length;
  const theme = LEVEL_THEMES[themeIndex];
  const moonSize = 64 + Math.min(level, 10) * 4;

  const stars = useMemo(() => makeStars(width, height, 70), [width, height]);

  // Crossfade between themes instead of snapping, so leveling into a new
  // palette feels like a scene change rather than a flicker.
  const themeIndexRef = useRef(themeIndex);
  const fade = useRef(new Animated.Value(1)).current;
  const [prevTheme, setPrevTheme] = useState<{ theme: Theme; idx: number } | null>(null);

  useEffect(() => {
    if (themeIndexRef.current === themeIndex) return;
    setPrevTheme({ theme: LEVEL_THEMES[themeIndexRef.current], idx: themeIndexRef.current });
    themeIndexRef.current = themeIndex;
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: THEME_FADE_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => setPrevTheme(null));
  }, [themeIndex, fade]);

  const fadeIn = fade;
  const fadeOut = fade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  const renderLayer = (
    t: Theme,
    themeIdx: number,
    opacity: Animated.AnimatedInterpolation<number> | number,
    key: string
  ) => (
    <Animated.View key={key} style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      {getNebulaPositions(themeIdx, width, height).map((p, i) => (
        <View
          key={i}
          style={[
            styles.nebula,
            {
              left: p.x - p.size / 2,
              top: p.y - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: t.nebula[i],
              shadowColor: t.nebula[i],
            },
          ]}
        />
      ))}
      <View
        style={[
          styles.moonGlow,
          {
            width: moonSize * 2,
            height: moonSize * 2,
            borderRadius: moonSize,
            right: -moonSize * 0.6,
            top: 18,
            backgroundColor: t.moon,
            shadowColor: t.moon,
          },
        ]}
      />
      <View
        style={[
          styles.moon,
          {
            width: moonSize,
            height: moonSize,
            borderRadius: moonSize / 2,
            right: moonSize * 0.4,
            top: 18 + moonSize * 0.3,
            backgroundColor: t.moon,
          },
        ]}
      >
        <View
          style={[
            styles.moonShadow,
            {
              width: moonSize * 0.75,
              height: moonSize * 0.95,
              borderRadius: moonSize / 2,
              right: -moonSize * 0.22,
            },
          ]}
        />
      </View>
    </Animated.View>
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {prevTheme && renderLayer(prevTheme.theme, prevTheme.idx, fadeOut, 'prev')}
      {renderLayer(theme, themeIndex, prevTheme ? fadeIn : 1, 'current')}
      {stars.map((s, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              opacity: s.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nebula: {
    position: 'absolute',
    opacity: 0.12,
    shadowOpacity: 1,
    shadowRadius: 120,
    shadowOffset: { width: 0, height: 0 },
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
  },
  moonGlow: {
    position: 'absolute',
    opacity: 0.18,
    shadowOpacity: 1,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  moon: {
    position: 'absolute',
    overflow: 'hidden',
    opacity: 0.9,
  },
  moonShadow: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#05030f',
    opacity: 0.85,
  },
});
