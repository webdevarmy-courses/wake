import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { addCatchScrollTap, getXPHistory } from "../utils/xpManager";
import MindfulInterventionModal from "./MindfulInterventionModal";

const { width } = Dimensions.get("window");

const CatchScrollButton = ({ onXPGained }) => {
  const [animatedValue] = useState(new Animated.Value(1));
  const [sparkleValue] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);

  // New animation values for enhancements
  const [pulseValue] = useState(new Animated.Value(1));
  const [emojiValue] = useState(new Animated.Value(1));
  const [emojiRotateValue] = useState(new Animated.Value(0));
  const [breathingRingValue] = useState(new Animated.Value(1));
  const [shadowValue] = useState(new Animated.Value(1));
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    // Start continuous pulsating animation (soft breath effect)
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.03,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Start breathing ring animation
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingRingValue, {
          toValue: 1.1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingRingValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    breathingAnimation.start();

    // Start emoji gentle bounce animation
    const emojiAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(emojiValue, {
          toValue: 1.1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(emojiValue, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );
    emojiAnimation.start();

    // Load streak count
    loadStreakCount();

    return () => {
      pulseAnimation.stop();
      breathingAnimation.stop();
      emojiAnimation.stop();
    };
  }, []);

  const loadStreakCount = async () => {
    try {
      const history = await getXPHistory();
      // Count consecutive days in the last 7 days where user caught themselves scrolling
      const today = new Date();
      let streak = 0;

      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateString = checkDate.toDateString();

        const dayEntry = history.find((entry) => entry.date === dateString);
        if (dayEntry && dayEntry.xp > 0) {
          streak++;
        } else {
          break;
        }
      }
      setStreakCount(streak);
    } catch (error) {
      console.error("Error loading streak:", error);
    }
  };

  const handlePress = async () => {
    // Enhanced haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Enhanced button press animation with shadow lift
    Animated.parallel([
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.92,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(shadowValue, {
          toValue: 1.5,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(shadowValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // Enhanced emoji animation (wave effect)
    Animated.sequence([
      Animated.timing(emojiRotateValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(emojiRotateValue, {
        toValue: -1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(emojiRotateValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Enhanced multi-sparkle effect
    Animated.sequence([
      Animated.timing(sparkleValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(sparkleValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Show intervention modal
    setModalVisible(true);

    // Award XP for catching yourself scrolling and track tap
    try {
      const tapsToday = await addCatchScrollTap();
      console.log("Catch scroll taps today:", tapsToday);

      if (onXPGained) {
        onXPGained(1); // Still pass the XP gained amount
      }

      // Update streak count
      loadStreakCount();
    } catch (error) {
      console.error("Error adding catch scroll tap:", error);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleNavigateToBreathing = () => {
    // Navigate to breathing exercise using Expo Router
    router.push("/replace/breathing");
  };

  const handleNavigateToReflect = () => {
    // Navigate to reflection screen using Expo Router
    router.push("/replace/reflect");
  };

  // Animation interpolations
  const sparkleOpacity = sparkleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const sparkleScale = sparkleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const sparkleTranslateY = sparkleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const emojiRotate = emojiRotateValue.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-15deg", "15deg"],
  });

  const shadowElevation = shadowValue.interpolate({
    inputRange: [1, 1.5],
    outputRange: [8, 20],
  });

  const shadowOpacity = shadowValue.interpolate({
    inputRange: [1, 1.5],
    outputRange: [0.15, 0.3],
  });

  return (
    <>
      <View style={styles.container}>
        {/* Breathing Ring Background */}
        <Animated.View
          style={[
            styles.breathingRing,
            {
              transform: [{ scale: breathingRingValue }],
            },
          ]}
        />

        {/* Main Button Container with Pulse */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              transform: [
                { scale: Animated.multiply(animatedValue, pulseValue) },
              ],
            },
          ]}
        >
          {/* Streak Indicator - moved outside and positioned top-right */}
          {streakCount > 0 && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>{streakCount} day streak</Text>
            </View>
          )}

          {/* Enhanced Button with Better Clickable Appearance */}
          <Animated.View
            style={[
              styles.button,
              {
                shadowOpacity: shadowOpacity,
                elevation: shadowElevation,
              },
            ]}
          >
            {/* Inner gradient-like layer */}
            <View style={styles.buttonInnerLayer} />

            <TouchableOpacity
              style={styles.touchArea}
              onPress={handlePress}
              activeOpacity={0.85}
            >
              <View style={styles.innerButton}>
                {/* Animated Emoji */}
                <Animated.View
                  style={{
                    transform: [{ scale: emojiValue }, { rotate: emojiRotate }],
                  }}
                >
                  <Text style={styles.emoji}>✋</Text>
                </Animated.View>

                <Text style={styles.buttonText}>CATCH ME{"\n"}SCROLLING</Text>
                <Text style={styles.xpText}>+1 XP</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Enhanced Multi-Sparkle Effect */}
          <Animated.View
            style={[
              styles.sparkle1,
              {
                opacity: sparkleOpacity,
                transform: [
                  { scale: sparkleScale },
                  { translateY: sparkleTranslateY },
                ],
              },
            ]}
          >
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.sparkle2,
              {
                opacity: sparkleOpacity,
                transform: [
                  { scale: sparkleScale },
                  { translateY: sparkleTranslateY },
                  { translateX: 20 },
                ],
              },
            ]}
          >
            <Text style={styles.sparkleText}>⭐</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.sparkle3,
              {
                opacity: sparkleOpacity,
                transform: [
                  { scale: sparkleScale },
                  { translateY: sparkleTranslateY },
                  { translateX: -20 },
                ],
              },
            ]}
          >
            <Text style={styles.sparkleText}>💫</Text>
          </Animated.View>
        </Animated.View>

        {/* Microcopy */}
        <View style={styles.microcopyContainer}>
          <Text style={styles.microcopyText}>
            Tap this when you catch yourself scrolling
          </Text>
        </View>
      </View>

      {/* Mindful Intervention Modal */}
      <MindfulInterventionModal
        visible={modalVisible}
        onClose={handleModalClose}
        onNavigateToBreathing={handleNavigateToBreathing}
        onNavigateToReflect={handleNavigateToReflect}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 30,
  },
  breathingRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: "rgba(147, 213, 225, 0.3)",
    backgroundColor: "rgba(147, 213, 225, 0.1)",
  },
  buttonContainer: {
    position: "relative",
    marginBottom: 15,
  },
  button: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#93D5E1",
    // Much more elevated appearance - floating above screen
    shadowColor: "#93D5E1",
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 25,
    // Better border for definition
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    // Add subtle outer ring
    borderTopColor: "rgba(255, 255, 255, 0.6)",
    borderLeftColor: "rgba(255, 255, 255, 0.6)",
    borderBottomColor: "rgba(18, 17, 17, 0.1)",
    borderRightColor: "rgba(18, 17, 17, 0.1)",
  },
  buttonInnerLayer: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 86,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    // Create gradient-like inner highlight
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.4)",
    borderLeftColor: "rgba(255, 255, 255, 0.4)",
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
  },
  touchArea: {
    width: "100%",
    height: "100%",
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    // Add subtle pressed state background
    backgroundColor: "transparent",
  },
  innerButton: {
    alignItems: "center",
    justifyContent: "center",
    // Add subtle inner shadow effect
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
    textShadowColor: "rgba(255, 255, 255, 0.9)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#121111",
    textAlign: "center",
    letterSpacing: 1,
    lineHeight: 20,
    textShadowColor: "rgba(255, 255, 255, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  xpText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
    marginTop: 8,
    opacity: 0.9,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  streakContainer: {
    position: "absolute",
    top: -8,
    right: -8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 227, 125, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 227, 125, 1)",
    shadowColor: "#FFE37D",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  streakEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  streakText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#121111",
    opacity: 0.9,
  },
  sparkle1: {
    position: "absolute",
    top: -15,
    right: -10,
  },
  sparkle2: {
    position: "absolute",
    top: -5,
    right: 20,
  },
  sparkle3: {
    position: "absolute",
    top: -5,
    left: 20,
  },
  sparkleText: {
    fontSize: 24,
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  microcopyContainer: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  microcopyText: {
    fontSize: 13,
    color: "#121111",
    opacity: 0.6,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 18,
  },
});

export default CatchScrollButton;
