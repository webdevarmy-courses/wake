import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TimeAwarenessPage() {
  const [currentYear] = useState(new Date().getFullYear());
  const [percentage, setPercentage] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const clockAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Calculate percentage of year gone
    const now = new Date();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);
    
    const totalDays = Math.ceil((endOfYear - startOfYear) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now - startOfYear) / (1000 * 60 * 60 * 24));
    
    const calculatedPercentage = Math.round((daysElapsed / totalDays) * 100);
    setPercentage(calculatedPercentage);

    // Animate the content in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Clock animation
    Animated.loop(
      Animated.timing(clockAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push("/onboarding/letter-future");
  };

  const clockRotation = clockAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <Animated.View 
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {/* Clock Animation */}
            <Animated.View 
              style={[
                styles.clockContainer,
                { transform: [{ rotate: clockRotation }] }
              ]}
            >
              <Text style={styles.clockEmoji}>⏰</Text>
            </Animated.View>

            {/* Dynamic Year Text */}
            <View style={styles.textContainer}>
              <Text style={styles.yearText}>
                <Text style={styles.yearNumber}>{currentYear}</Text> is already{" "}
                <Text style={styles.percentageText}>{percentage}%</Text> gone.
              </Text>
              
              <Text style={styles.motivationalText}>
                Here's how Wake Scroll will help you make{" "}
                <Text style={styles.yearHighlight}>{currentYear}</Text>{" "}
                your best year ever.
              </Text>
            </View>

            {/* Progress Visualization */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Year Progress</Text>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${percentage}%`,
                      opacity: fadeAnim 
                    }
                  ]} 
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabelText}>Jan 1</Text>
                <Text style={styles.progressLabelText}>Dec 31</Text>
              </View>
            </View>

            {/* Time Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{Math.round((365 * percentage) / 100)}</Text>
                <Text style={styles.statLabel}>Days Gone</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{365 - Math.round((365 * percentage) / 100)}</Text>
                <Text style={styles.statLabel}>Days Left</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        <View style={styles.bottomArea}>
          <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleContinue}>
            <LinearGradient
              colors={["#9575CD", "#7B68EE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Text style={styles.buttonIcon}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const serifFamily = Platform.select({ ios: "Georgia", android: "serif", default: undefined });

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 30 : 0,
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "300",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  contentContainer: {
    alignItems: "center",
    width: "100%",
  },
  clockContainer: {
    marginBottom: 40,
  },
  clockEmoji: {
    fontSize: 80,
    textAlign: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  yearText: {
    fontSize: 24,
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 20,
    fontFamily: serifFamily,
    lineHeight: 32,
  },
  yearNumber: {
    fontWeight: "700",
    color: "#9575CD",
  },
  percentageText: {
    fontWeight: "700",
    color: "#FF6B6B",
    fontSize: 28,
  },
  motivationalText: {
    fontSize: 16,
    textAlign: "center",
    color: "#ffffff",
    opacity: 0.9,
    lineHeight: 22,
    maxWidth: 280,
    fontStyle: "italic",
  },
  yearHighlight: {
    fontWeight: "600",
    color: "#9575CD",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 30,
  },
  progressLabel: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B6B",
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabelText: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    maxWidth: 280,
  },
  statBox: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    minWidth: 100,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#9575CD",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "center",
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  button: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 28,
    shadowColor: "#9575CD",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
    marginRight: 8,
  },
  buttonIcon: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
  },
});
