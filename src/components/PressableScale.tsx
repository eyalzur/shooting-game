import { ReactNode, useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /** How far it shrinks on press, as a scale factor — lower = more pronounced. */
  scaleTo?: number;
  children?: ReactNode;
}

// A quick, consistent spring scale-down on touch, then a little overshoot
// bounce back past 1 on release — the same punchy feel every tappable
// control in the app should have. Disabled controls get no animation, since
// there's nothing to confirm.
export default function PressableScale({ onPress, style, disabled, scaleTo = 0.9, children }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  };
  const onPressOut = () => {
    if (disabled) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.08, useNativeDriver: true, speed: 30, bounciness: 0 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }),
    ]).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}
