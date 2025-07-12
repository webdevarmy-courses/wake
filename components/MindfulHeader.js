import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MindfulHeader = ({ todaysXP = 0 }) => {
  const bellRotation = useRef(new Animated.Value(0)).current;
  
  // Create animated values for sparkles
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the bell ringing animation when component mounts
    const startRinging = () => {
      // Reset sparkle values
      sparkle1.setValue(0);
      sparkle2.setValue(0);
      sparkle3.setValue(0);

      // Animate bell and sparkles
      Animated.parallel([
        // Bell animation
        Animated.sequence([
          Animated.loop(
            Animated.sequence([
              Animated.timing(bellRotation, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
              }),
              Animated.timing(bellRotation, {
                toValue: -1,
                duration: 120,
                useNativeDriver: true,
              }),
              Animated.timing(bellRotation, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
              }),
              Animated.timing(bellRotation, {
                toValue: -1,
                duration: 120,
                useNativeDriver: true,
              }),
              Animated.timing(bellRotation, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
              }),
            ]),
            { iterations: 4 }
          ),
        ]),
        // Sparkle animations
        Animated.stagger(200, [
          // First sparkle
          Animated.sequence([
            Animated.timing(sparkle1, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle1, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          // Second sparkle
          Animated.sequence([
            Animated.timing(sparkle2, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle2, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          // Third sparkle
          Animated.sequence([
            Animated.timing(sparkle3, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle3, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]).start(),
      ]).start();
    };

    // Start ringing after a small delay to ensure component is mounted
    const timer = setTimeout(startRinging, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNotificationPress = () => {
    router.push("/notifications");
  };

  // Convert rotation value to degrees
  const rotateInterpolate = bellRotation.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left side with text */}
        <View style={styles.leftContent}>
          <Text style={styles.title}>🧘 Mindful Space</Text>
          <Text style={styles.xpText}>✨ {todaysXP} XP today</Text>
        </View>

        {/* Right side with notification bell */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleNotificationPress}
          activeOpacity={0.7}
        >
          {/* Sparkles */}
          <Animated.Text 
            style={[
              styles.sparkle,
              styles.sparkle1,
              {
                opacity: sparkle1,
                transform: [
                  { scale: sparkle1 },
                  { translateX: -15 },
                  { translateY: -10 },
                ],
              },
            ]}
          >
            ✨
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.sparkle,
              styles.sparkle2,
              {
                opacity: sparkle2,
                transform: [
                  { scale: sparkle2 },
                  { translateX: 15 },
                  { translateY: -5 },
                ],
              },
            ]}
          >
            ✨
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.sparkle,
              styles.sparkle3,
              {
                opacity: sparkle3,
                transform: [
                  { scale: sparkle3 },
                  { translateX: 0 },
                  { translateY: -15 },
                ],
              },
            ]}
          >
            ✨
          </Animated.Text>

          {/* Bell Icon */}
          <Animated.Text 
            style={[
              styles.bellIcon,
              {
                transform: [{ rotate: rotateInterpolate }],
              },
            ]}
          >
            🔔
          </Animated.Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  leftContent: {
    flex: 1,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 23,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  xpText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#121111",
    opacity: 0.8,
    letterSpacing: 0.2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 4,
  },
  bellIcon: {
    fontSize: 20,
    color: "#121111",
    opacity: 0.7,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 14,
    zIndex: 1,
  },
  sparkle1: {
    fontSize: 12,
  },
  sparkle2: {
    fontSize: 14,
  },
  sparkle3: {
    fontSize: 16,
  },
});

export default MindfulHeader;
