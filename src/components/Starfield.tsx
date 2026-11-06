import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
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

interface Nebula {
  x: number;
  y: number;
  size: number;
  color: string;
}

function makeStars(width: number, height: number, count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 1 + Math.random() * 2,
    opacity: 0.25 + Math.random() * 0.65,
  }));
}

export default function Starfield({ width, height, level = 0 }: Props) {
  const theme = LEVEL_THEMES[Math.floor(level / LEVELS_PER_THEME) % LEVEL_THEMES.length];
  const stars = useMemo(() => makeStars(width, height, 70), [width, height]);
  const nebulae = useMemo<Nebula[]>(
    () => [
      { x: width * 0.15, y: height * 0.15, size: Math.max(width, 220), color: theme.nebula[0] },
      { x: width * 0.85, y: height * 0.55, size: Math.max(width, 260), color: theme.nebula[1] },
      { x: width * 0.3, y: height * 0.85, size: Math.max(width, 200), color: theme.nebula[2] },
    ],
    [width, height, theme]
  );
  const moonSize = 64 + Math.min(level, 10) * 4;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {nebulae.map((n, i) => (
        <View
          key={i}
          style={[
            styles.nebula,
            {
              left: n.x - n.size / 2,
              top: n.y - n.size / 2,
              width: n.size,
              height: n.size,
              borderRadius: n.size / 2,
              backgroundColor: n.color,
              shadowColor: n.color,
            },
          ]}
        />
      ))}
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
      <View
        style={[
          styles.moonGlow,
          {
            width: moonSize * 2,
            height: moonSize * 2,
            borderRadius: moonSize,
            right: -moonSize * 0.6,
            top: 18,
            backgroundColor: theme.moon,
            shadowColor: theme.moon,
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
            backgroundColor: theme.moon,
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
