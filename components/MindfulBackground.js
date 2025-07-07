import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Generate random bokeh circles with different sizes and positions
const generateBokehData = () => {
  const bokehCount = 12; // Nice balance of whimsy without being overwhelming
  const circles = [];

  for (let i = 0; i < bokehCount; i++) {
    circles.push({
      id: i,
      size: Math.random() * 120 + 80, // 80px to 200px diameter
      x: Math.random() * (screenWidth + 200) - 100, // Allow some overflow
      y: Math.random() * (screenHeight + 200) - 100,
      opacity: Math.random() * 0.08 + 0.02, // 0.02 to 0.1 opacity range
      animationDelay: Math.random() * 4000, // Stagger animations
      floatDirection: Math.random() > 0.5 ? 1 : -1, // Some float up, some down
      floatRange: Math.random() * 30 + 20, // 20-50px float range
    });
  }

  return circles;
};

const BokehCircle = ({
  size,
  x,
  y,
  opacity,
  animationDelay,
  floatDirection,
  floatRange,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animation with delay
    const entranceAnimation = Animated.sequence([
      Animated.delay(animationDelay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Continuous floating animation
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: floatDirection * floatRange,
          duration: 3000 + Math.random() * 2000, // 3-5 second cycles
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle breathing opacity animation
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    // Start all animations
    entranceAnimation.start(() => {
      floatingAnimation.start();
      breathingAnimation.start();
    });

    return () => {
      translateY.stopAnimation();
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.bokehCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: x,
          top: y,
          opacity: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, opacity],
          }),
          transform: [{ translateY }, { scale: scaleAnim }],
        },
      ]}
    />
  );
};

const MindfulBackground = ({ children, style }) => {
  const bokehData = useRef(generateBokehData()).current;

  return (
    <View style={[styles.container, style]}>
      {/* Gradient Background */}
      <LinearGradient
        colors={["#FFFDE9", "#F7F4FF"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Bokeh Overlay */}
      <View style={styles.bokehContainer}>
        {bokehData.map((circle) => (
          <BokehCircle
            key={circle.id}
            size={circle.size}
            x={circle.x}
            y={circle.y}
            opacity={circle.opacity}
            animationDelay={circle.animationDelay}
            floatDirection={circle.floatDirection}
            floatRange={circle.floatRange}
          />
        ))}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bokehContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  bokehCircle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "rgba(255, 255, 255, 0.6)",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 0,
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },
});

export default MindfulBackground;
