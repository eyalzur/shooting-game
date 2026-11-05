import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../constants';

interface Props {
  width: number;
  height: number;
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

export default function Starfield({ width, height }: Props) {
  const stars = useMemo(() => makeStars(width, height, 70), [width, height]);
  const nebulae = useMemo<Nebula[]>(
    () => [
      { x: width * 0.15, y: height * 0.15, size: Math.max(width, 220), color: COLORS.purple },
      { x: width * 0.85, y: height * 0.55, size: Math.max(width, 260), color: COLORS.pink },
      { x: width * 0.3, y: height * 0.85, size: Math.max(width, 200), color: COLORS.cyan },
    ],
    [width, height]
  );

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
});
