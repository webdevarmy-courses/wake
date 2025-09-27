import type { PropsWithChildren, ReactElement } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

// Conditionally import reanimated to prevent Expo Go crashes
let Animated: any = null;
let interpolate: any = null;
let useAnimatedRef: any = null;
let useAnimatedStyle: any = null;
let useScrollViewOffset: any = null;

try {
  const reanimated = require('react-native-reanimated');
  Animated = reanimated.default;
  interpolate = reanimated.interpolate;
  useAnimatedRef = reanimated.useAnimatedRef;
  useAnimatedStyle = reanimated.useAnimatedStyle;
  useScrollViewOffset = reanimated.useScrollViewOffset;
} catch (e) {
  console.warn('react-native-reanimated not available in ParallaxScrollView, using fallback');
}

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const bottom = useBottomTabOverflow();
  
  // Check if reanimated is available
  const hasReanimated = Animated && useAnimatedRef && useScrollViewOffset && useAnimatedStyle;

  if (hasReanimated) {
    // Use reanimated if available
    const scrollRef = useAnimatedRef<any>();
    const scrollOffset = useScrollViewOffset(scrollRef);
    const headerAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: interpolate(
              scrollOffset.value,
              [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
              [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
            ),
          },
          {
            scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
          },
        ],
      };
    });

    return (
      <ThemedView style={styles.container}>
        <Animated.ScrollView
          ref={scrollRef}
          scrollEventThrottle={16}
          scrollIndicatorInsets={{ bottom }}
          contentContainerStyle={{ paddingBottom: bottom }}>
          <Animated.View
            style={[
              styles.header,
              { backgroundColor: headerBackgroundColor[colorScheme] },
              headerAnimatedStyle,
            ]}>
            {headerImage}
          </Animated.View>
          <ThemedView style={styles.content}>{children}</ThemedView>
        </Animated.ScrollView>
      </ThemedView>
    );
  }

  // Fallback for Expo Go or when reanimated is not available
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}>
        <View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
          ]}>
          {headerImage}
        </View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
