import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { DEBRIS_POP_MS, DEBRIS_SIZE } from '../constants';
import { DebrisState } from '../types';

interface Props {
  debris: DebrisState;
}

const POP_ANGLES_DEG = [20, 100, 200, 300];

// A small chunk a planet broke into — scatters on its own momentum, no
// spin/shading of its own, just a plain glowing rock. Pops with a quick
// spark burst when it's shot, reusing the same finite burst-and-fade
// pattern as Target's explosion, just smaller and single-variant since
// debris doesn't need the full variety a planet does.
export default function Debris({ debris }: Props) {
  const isPopped = debris.poppedAt !== null;
  const pop = useRef(new Animated.Value(0)).current;
  const prevPoppedAt = useRef<number | null>(null);
  useEffect(() => {
    if (debris.poppedAt !== null && debris.poppedAt !== prevPoppedAt.current) {
      pop.setValue(0);
      Animated.timing(pop, {
        toValue: 1,
        duration: DEBRIS_POP_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
    prevPoppedAt.current = debris.poppedAt;
  }, [debris.poppedAt, pop]);

  const sparkOpacity = pop.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] });
  const rockOpacity = pop.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const rockScale = pop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });

  return (
    <View
      style={{
        position: 'absolute',
        left: debris.x - DEBRIS_SIZE,
        top: debris.y - DEBRIS_SIZE,
        width: DEBRIS_SIZE * 2,
        height: DEBRIS_SIZE * 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isPopped &&
        POP_ANGLES_DEG.map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const dist = DEBRIS_SIZE * 2.2;
          const translateX = pop.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * dist] });
          const translateY = pop.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * dist] });
          return (
            <Animated.View
              key={angle}
              style={[
                styles.spark,
                {
                  backgroundColor: debris.color,
                  shadowColor: debris.color,
                  opacity: sparkOpacity,
                  transform: [{ translateX }, { translateY }],
                },
              ]}
            />
          );
        })}
      <Animated.View
        style={[
          styles.rock,
          {
            width: DEBRIS_SIZE,
            height: DEBRIS_SIZE,
            borderRadius: DEBRIS_SIZE / 2,
            backgroundColor: debris.color,
            shadowColor: debris.color,
            opacity: isPopped ? rockOpacity : 1,
            transform: [{ scale: isPopped ? rockScale : 1 }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rock: {
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  spark: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
});
