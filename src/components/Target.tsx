import { StyleSheet, View } from 'react-native';
import { LaneConfig, TargetState } from '../types';

interface Props {
  target: TargetState;
  lane: LaneConfig;
  laneY: number;
}

export default function Target({ target, lane, laneY }: Props) {
  const isHit = target.hitAt !== null;
  const glowSize = lane.size * 1.7;

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
        opacity: isHit ? 0.2 : 1,
        transform: [{ scale: isHit ? 1.5 : 1 }],
      }}
    >
      <View
        style={[
          styles.glow,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            backgroundColor: lane.color,
            shadowColor: lane.color,
          },
        ]}
      />
      <View
        style={[
          styles.core,
          {
            width: lane.size,
            height: lane.size,
            borderRadius: lane.size / 2,
            backgroundColor: lane.color,
            shadowColor: lane.color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    opacity: 0.25,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  core: {
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
});
