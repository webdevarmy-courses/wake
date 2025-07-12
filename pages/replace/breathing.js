import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import BreathingCalendarModal from "../../components/BreathingCalendarModal";
import MindfulBackground from "../../components/MindfulBackground";
import { saveBreathingSession } from "../../utils/breathingManager";
import { addXP } from "../../utils/xpManager";

const BreathingPage = () => {
  const [phase, setPhase] = useState("ready"); // ready, inhale, hold, exhale, complete
  const [breathCount, setBreathCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(4);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  const totalBreaths = 5;
  const timings = {
    inhale: 4,
    hold: 4,
    exhale: 6,
  };

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handlePhaseComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, phase]);

  useEffect(() => {
    if (phase === "inhale") {
      animateInhale();
    } else if (phase === "exhale") {
      animateExhale();
    } else if (phase === "hold") {
      animateHold();
    }
  }, [phase]);

  const animateInhale = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: timings.inhale * 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: timings.inhale * 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateExhale = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: timings.exhale * 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: timings.exhale * 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateHold = () => {
    // Keep current scale during hold
    Animated.timing(opacityAnim, {
      toValue: 0.9,
      duration: timings.hold * 1000,
      useNativeDriver: true,
    }).start();
  };

  const handlePhaseComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (phase) {
      case "inhale":
        setPhase("hold");
        setTimeLeft(timings.hold);
        break;
      case "hold":
        setPhase("exhale");
        setTimeLeft(timings.exhale);
        break;
      case "exhale":
        const newCount = breathCount + 1;
        setBreathCount(newCount);

        if (newCount >= totalBreaths) {
          completeSession();
        } else {
          setPhase("inhale");
          setTimeLeft(timings.inhale);
        }
        break;
    }
  };

  const startBreathing = () => {
    setIsActive(true);
    setPhase("inhale");
    setTimeLeft(timings.inhale);
    setBreathCount(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const completeSession = async () => {
    setIsActive(false);
    setPhase("complete");

    try {
      // Save session with actual breath count
      await saveBreathingSession(totalBreaths);

      // Award XP
      await addXP(5);

      // Celebration effect
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Show completion modal after a brief delay
      setTimeout(() => {
        setShowCompletionModal(true);
      }, 500);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error completing session:", error);
      setShowCompletionModal(true);
    }
  };

  const handleCalendarPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCalendarModalVisible(true);
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case "ready":
        return "Ready to begin your breathing session?";
      case "inhale":
        return "Breathe in slowly...";
      case "hold":
        return "Hold your breath...";
      case "exhale":
        return "Breathe out slowly...";
      case "complete":
        return "Well done! You completed your breathing session.";
      default:
        return "";
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "rgba(147, 213, 225, 0.3)"; // Semi-transparent ice blue
      case "hold":
        return "rgba(255, 227, 125, 0.3)"; // Semi-transparent golden yellow
      case "exhale":
        return "rgba(244, 216, 254, 0.3)"; // Semi-transparent lavender pink
      default:
        return "transparent";
    }
  };

  const handleReturn = () => {
    router.back();
  };

  if (showCompletionModal) {
    return (
      <MindfulBackground>
        <SafeAreaView style={[styles.container, styles.successContainer]}>
          <View style={styles.successContent}>
            <Text style={styles.successEmoji}>🧘</Text>
            <Text style={styles.successTitle}>Breathing Complete!</Text>
            <Text style={styles.successSubtitle}>+5 XP Earned</Text>
            <Text style={styles.successMessage}>
              You've completed your breathing exercise. Taking time to breathe
              mindfully helps reduce stress and brings peace to your mind.
            </Text>
            <Text style={styles.successStats}>
              {totalBreaths} breaths completed
            </Text>
          </View>
        </SafeAreaView>
      </MindfulBackground>
    );
  }

  return (
    <MindfulBackground>
      {/* Phase-specific overlay */}
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: getPhaseColor() }]}
      />

      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleReturn}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.calendarButton}
            onPress={handleCalendarPress}
          >
            <Text style={styles.calendarButtonText}>📅</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>🧘 Breathing Exercise</Text>

          {phase !== "ready" && phase !== "complete" && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Breath {breathCount + 1} of {totalBreaths}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(breathCount / totalBreaths) * 100}%` },
                  ]}
                />
              </View>
            </View>
          )}

          <View style={styles.breathingContainer}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <View style={styles.innerCircle}>
                {phase !== "ready" && phase !== "complete" && (
                  <Text style={styles.timer}>{timeLeft}</Text>
                )}
              </View>
            </Animated.View>
          </View>

          <Text style={styles.instruction}>{getPhaseInstruction()}</Text>

          {phase === "ready" && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startBreathing}
            >
              <Text style={styles.startButtonText}>Start Breathing</Text>
            </TouchableOpacity>
          )}

          {phase !== "ready" && phase !== "complete" && (
            <TouchableOpacity style={styles.skipButton} onPress={handleReturn}>
              <Text style={styles.skipButtonText}>Skip this session</Text>
            </TouchableOpacity>
          )}
        </View>

        <BreathingCalendarModal
          visible={calendarModalVisible}
          onClose={() => setCalendarModalVisible(false)}
        />
      </SafeAreaView>
    </MindfulBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  calendarButton: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#121111",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 40,
    textAlign: "center",
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 8,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: "rgba(18, 17, 17, 0.2)",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#121111",
    borderRadius: 2,
  },
  breathingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(18, 17, 17, 0.3)",
  },
  innerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  timer: {
    fontSize: 48,
    fontWeight: "700",
    color: "#121111",
  },
  instruction: {
    fontSize: 20,
    fontWeight: "600",
    color: "#121111",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 28,
  },
  startButton: {
    backgroundColor: "#93D5E1",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
  },
  successContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  successContent: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 12,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 24,
    opacity: 0.8,
  },
  successMessage: {
    fontSize: 16,
    color: "#121111",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.8,
  },
  successStats: {
    fontSize: 14,
    color: "#121111",
    textAlign: "center",
    opacity: 0.6,
    fontWeight: "500",
  },
  skipButton: {
    marginTop: 20,
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.6,
    textDecorationLine: "underline",
  },
});

export default BreathingPage;
