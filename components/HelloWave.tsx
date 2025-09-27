import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

// Conditionally import reanimated to prevent Expo Go crashes
let Animated: any = null;
let useAnimatedStyle: any = null;
let useSharedValue: any = null;
let withRepeat: any = null;
let withSequence: any = null;
let withTiming: any = null;

try {
  const reanimated = require('react-native-reanimated');
  Animated = reanimated.default;
  useAnimatedStyle = reanimated.useAnimatedStyle;
  useSharedValue = reanimated.useSharedValue;
  withRepeat = reanimated.withRepeat;
  withSequence = reanimated.withSequence;
  withTiming = reanimated.withTiming;
} catch (e) {
  console.warn('react-native-reanimated not available, using fallback animation');
}

export function HelloWave() {
  // Check if reanimated is available
  const hasReanimated = Animated && useSharedValue && useAnimatedStyle;
  
  if (hasReanimated) {
    // Use reanimated if available
    const rotationAnimation = useSharedValue(0);

    useEffect(() => {
      try {
        rotationAnimation.value = withRepeat(
          withSequence(withTiming(25, { duration: 150 }), withTiming(0, { duration: 150 })),
          4 // Run the animation 4 times
        );
      } catch (e) {
        console.warn('Error running reanimated animation:', e);
      }
    }, [rotationAnimation]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotationAnimation.value}deg` }],
    }));

    return (
      <Animated.View style={animatedStyle}>
        <ThemedText style={styles.text}>👋</ThemedText>
      </Animated.View>
    );
  }

  // Fallback for Expo Go or when reanimated is not available
  return (
    <View>
      <ThemedText style={styles.text}>👋</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
