import React, { useEffect, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getTodaysXP, validateAndFixStreak } from "../utils/xpManager";

const XPJar = ({ currentXP, onPress }) => {
  const [animatedValue] = useState(new Animated.Value(0));
  const [displayXP, setDisplayXP] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Update display when currentXP prop changes
    if (currentXP !== undefined && currentXP !== null) {
      setDisplayXP(currentXP);
      animateJar(currentXP);
      // Also refresh streak when XP changes
      loadStreak();
    }
  }, [currentXP]);

  const loadStreak = async () => {
    try {
      // Validate and fix streak to ensure accuracy
      const validatedStreak = await validateAndFixStreak();
      setStreak(validatedStreak);
    } catch (error) {
      console.error("Error loading streak:", error);
    }
  };

  const loadData = async () => {
    try {
      const todaysXP = await getTodaysXP();
      await loadStreak();

      // Only set if currentXP prop is not provided or is 0
      if (currentXP === undefined || currentXP === null) {
        setDisplayXP(todaysXP);
        animateJar(todaysXP);
      }
    } catch (error) {
      console.error("Error loading XP data:", error);
    }
  };

  const animateJar = (xpValue = displayXP) => {
    const fillLevel = Math.min(xpValue / 100, 1); // Fill based on today's XP, max at 100
    Animated.timing(animatedValue, {
      toValue: fillLevel,
      duration: 800,
      useNativeDriver: false,
    }).start();
  };

  const jarHeight = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "80%"],
  });

  const jarOpacity = animatedValue.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0.3, 0.6, 1],
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.jarContainer}>
        {/* Jar liquid fill */}
        <Animated.View
          style={[
            styles.jarLiquid,
            {
              height: jarHeight,
              opacity: jarOpacity,
            },
          ]}
        />

        {/* Jar outline */}
        <View style={styles.jarOutline} />

        {/* Sparkle effects */}
        <View style={styles.sparkles}>
          <Text style={[styles.sparkle, styles.sparkle1]}>✨</Text>
          <Text style={[styles.sparkle, styles.sparkle2]}>⭐</Text>
          <Text style={[styles.sparkle, styles.sparkle3]}>✨</Text>
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.xpText}>{displayXP} XP Today</Text>
        <Text style={styles.streakText}>
          {streak > 0 ? `${streak} day streak! 🔥` : "Start your streak!"}
        </Text>
        <Text style={styles.tapText}>Tap to view details</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 30,
    marginBottom: 40,
  },
  jarContainer: {
    width: 120,
    height: 140,
    position: "relative",
    marginBottom: 16,
  },
  jarLiquid: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "#93D5E1",
    borderRadius: 50,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  jarOutline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    borderWidth: 4,
    borderColor: "#121111",
    borderRadius: 60,
    borderTopWidth: 0,
    backgroundColor: "transparent",
  },
  sparkles: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle: {
    position: "absolute",
    fontSize: 16,
  },
  sparkle1: {
    top: 20,
    left: 20,
  },
  sparkle2: {
    top: 40,
    right: 15,
  },
  sparkle3: {
    top: 60,
    left: 30,
  },
  textContainer: {
    alignItems: "center",
  },
  xpText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 8,
    opacity: 0.8,
  },
  tapText: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.6,
    fontStyle: "italic",
  },
});

export default XPJar;
