import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { SCORE_POPUP_MS } from '../constants';
import { ScorePopupState } from '../types';

interface Props {
  popup: ScorePopupState;
}

// A one-shot float-up-and-fade, same safe pattern as the target explosion:
// finite animation triggered once on mount, never a loop, so it can't stall.
export default function ScorePopup({ popup }: Props) {
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rise, {
      toValue: 1,
      duration: SCORE_POPUP_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [rise]);

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [0, -58] });
  const opacity = rise.interpolate({ inputRange: [0, 0.12, 0.7, 1], outputRange: [0, 1, 1, 0] });
  const scale = rise.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.4, 1.25, 1] });

  return (
    <Animated.View
      style={[
        styles.wrap,
        { left: popup.x - 34, top: popup.y - 16, opacity, transform: [{ translateY }, { scale }] },
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.text, { color: popup.color, textShadowColor: popup.color }]}>
        +{popup.value}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: 68,
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
});
