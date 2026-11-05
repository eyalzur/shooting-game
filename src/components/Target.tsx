import { StyleSheet, View } from 'react-native';
import { LaneConfig, TargetState } from '../types';

interface Props {
  target: TargetState;
  lane: LaneConfig;
  laneY: number;
}

export default function Target({ target, lane, laneY }: Props) {
  const isHit = target.hitAt !== null;
  return (
    <View
      style={[
        styles.target,
        {
          width: lane.size,
          height: lane.size,
          borderRadius: lane.size / 2,
          backgroundColor: lane.color,
          left: target.x - lane.size / 2,
          top: laneY - lane.size / 2,
          opacity: isHit ? 0.25 : 1,
          transform: [{ scale: isHit ? 1.4 : 1 }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  target: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.25)',
  },
});
