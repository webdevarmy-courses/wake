import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const FloatingTabBar = ({ state, descriptors, navigation }) => {
  const animValues = useRef(
    state.routes.map(() => ({
      scale: new Animated.Value(1),
      translateY: new Animated.Value(0),
      glow: new Animated.Value(0),
    }))
  ).current;

  const tabConfig = [
    { name: "index", icon: "🌱", label: "Mindful" },
    { name: "progress", icon: "📈", label: "Progress" },
    { name: "focus", icon: "➶", label: "Focus" },
  ];

  useEffect(() => {
    // Animate tabs based on focus state
    state.routes.forEach((route, index) => {
      const isFocused = state.index === index;
      const animValue = animValues[index];

      if (!animValue) return; // Safety check

      const { scale, translateY, glow } = animValue;

      Animated.parallel([
        Animated.spring(scale, {
          toValue: isFocused ? 1.1 : 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: isFocused ? -4 : 0,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: isFocused ? 1 : 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    });
  }, [state.index]);

  const handleTabPress = (index, route) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBarContainer}>
        {/* Glassmorphism background */}
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={40}
            tint="extraLight"
            style={styles.blurBackground}
          />
        ) : (
          <View style={styles.androidBackground} />
        )}
        <View style={styles.tabBarInner}>
          {state.routes.map((route, index) => {
            // Skip settings tab - only show mindful, progress, focus
            const tabInfo = tabConfig.find((tab) => tab.name === route.name);
            if (!tabInfo) return null;

            const isFocused = state.index === index;
            const animValue = animValues[index];

            if (!animValue) return null; // Safety check

            const { scale, translateY, glow } = animValue;

            const glowOpacity = glow.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.4],
            });

            return (
              <Pressable
                key={route.key}
                onPress={() => handleTabPress(index, route)}
                style={styles.tabButton}
                accessibilityRole="button"
                accessibilityLabel={`${tabInfo.label} tab`}
                accessibilityState={{ selected: isFocused }}
              >
                <Animated.View
                  style={[
                    styles.tabContent,
                    {
                      transform: [{ scale }, { translateY }],
                    },
                  ]}
                >
                  {/* Glowing background for active tab */}
                  <Animated.View
                    style={[
                      styles.glowBackground,
                      {
                        opacity: glowOpacity,
                      },
                    ]}
                  />

                  {/* Border for active background */}
                  <Animated.View
                    style={[
                      styles.glowBorder,
                      {
                        opacity: glowOpacity,
                      },
                    ]}
                  />

                  {/* Icon */}
                  <Text
                    style={[styles.tabIcon, isFocused && styles.tabIconActive]}
                  >
                    {tabInfo.icon}
                  </Text>

                  {/* Label */}
                  <Text
                    style={[
                      styles.tabLabel,
                      isFocused && styles.tabLabelActive,
                    ]}
                  >
                    {tabInfo.label}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 34 : 30, // 30-36px above bottom
    left: "15%", // Center with 70% width
    right: "15%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  tabBarContainer: {
    width: "100%",
    height: 68,
    borderRadius: 34, // Fully rounded corners
    overflow: "hidden",
    shadowColor: "rgba(0, 0, 0, 0.06)", // Very light shadow
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)", // Light glass border
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Very light fallback
  },
  androidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.12)", // Slightly more opaque for Android
    backdropFilter: "blur(20px)",
  },
  tabBarInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48, // Minimum 48px tap area
    minWidth: 48,
    paddingVertical: 4,
    paddingHorizontal: 0,
    position: "relative",
    marginHorizontal: 2,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
    height: "100%",
    zIndex: 2,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  glowBackground: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: -8,
    right: -8,
    borderRadius: 24,
    backgroundColor: "#93D5E1", // Ice blue glow
    zIndex: 1,
  },
  glowBorder: {
    position: "absolute",
    top: -1,
    bottom: -1,
    left: -9,
    right: -9,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(147, 213, 225, 0.6)",
    backgroundColor: "transparent",
    zIndex: 0,
  },
  tabIcon: {
    fontSize: 28, // Bigger icons
    marginBottom: 2, // Back to normal spacing
    opacity: 0.7,
    textAlign: "center",
  },
  tabIconActive: {
    opacity: 1,
    fontSize: 30, // Even bigger when active
    // No text effects for crisp appearance
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(18, 17, 17, 0.6)",
    letterSpacing: 0.3,
    textAlign: "center",
    // Removed marginTop since no yellow dot
  },
  tabLabelActive: {
    color: "#121111",
    fontWeight: "700",
    fontSize: 12, // Slightly bigger when active
    // No text effects for crisp appearance
  },
});

export default FloatingTabBar;
