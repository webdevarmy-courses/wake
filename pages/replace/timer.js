import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  AppState,
  BackHandler,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MindfulBackground from "../../components/MindfulBackground";
import PaywallModal from "../../components/PaywallModal";
import TimerCalendarModal from "../../components/TimerCalendarModal";
import useRevenueCat from "../../hooks/useRevenueCat";
import {
  getTodaysTimerSessions,
  saveTimerSession,
} from "../../utils/timerManager";
import { addXP } from "../../utils/xpManager";

const TimerPage = () => {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);
  const [todaysSessionCount, setTodaysSessionCount] = useState(0);
  const [calendarClickDisabled, setCalendarClickDisabled] = useState(false);

  // Revenue Cat hook to check premium status
  const { isPremiumMember } = useRevenueCat();

  const timerRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const leafAnim = useRef(new Animated.Value(0)).current;

  const timerOptions = [
    { minutes: 10, label: "10 min", color: "#93D5E1" },
    { minutes: 15, label: "15 min", color: "#F4D8FE" },
    { minutes: 40, label: "40 min", color: "#FFE37D" },
  ];

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    // Start peaceful animation
    startLeafAnimation();
    loadTodaysSessions();

    return () => {
      subscription?.remove();
      backHandler.remove();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isTimerActive && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            completeTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive, remainingSeconds]);

  const loadTodaysSessions = async () => {
    try {
      const sessions = await getTodaysTimerSessions();
      setTodaysSessionCount(sessions.length);
    } catch (error) {
      console.error("Error loading today's timer sessions:", error);
    }
  };

  const startLeafAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(leafAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleAppStateChange = (nextAppState) => {
    setAppStateVisible(nextAppState);
  };

  const handleBackPress = () => {
    if (isTimerActive) {
      confirmExit();
      return true;
    }
    return false;
  };

  const selectTimer = (minutes) => {
    setSelectedMinutes(minutes);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const startTimer = () => {
    setRemainingSeconds(selectedMinutes * 60);
    setIsTimerActive(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Start countdown animation
    Animated.timing(scaleAnim, {
      toValue: 1.1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const confirmExit = () => {
    Alert.alert(
      "Leave Screen-Free Time?",
      "You're doing great! Are you sure you want to end your mindful break early?",
      [
        {
          text: "Keep Going",
          style: "cancel",
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          text: "End Early",
          style: "destructive",
          onPress: () => {
            cancelTimer();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const cancelTimer = () => {
    setIsTimerActive(false);
    setRemainingSeconds(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const completeTimer = async () => {
    setIsTimerActive(false);

    try {
      // Save timer session first
      await saveTimerSession(selectedMinutes);

      // Award XP for completing the timer
      const newXP = await addXP(4);

      // Update today's session count
      setTodaysSessionCount((prev) => prev + 1);

      setShowCompletionModal(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Celebration animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error("Error completing timer:", error);
      setShowCompletionModal(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleReturn = () => {
    setShowCompletionModal(false);
    router.back();
  };

  const handleCalendarPress = () => {
    if (calendarClickDisabled) return;
    
    setCalendarClickDisabled(true);
    setTimeout(() => setCalendarClickDisabled(false), 1000); // 1 second debounce
    
    // Open calendar for all users (no paywall)
    setShowCalendar(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getProgressPercentage = () => {
    if (selectedMinutes === 0) return 0;
    const totalSeconds = selectedMinutes * 60;
    const elapsed = totalSeconds - remainingSeconds;
    return (elapsed / totalSeconds) * 100;
  };

  if (showCompletionModal) {
    return (
      <SafeAreaView style={[styles.container, styles.completionContainer]}>
        <Animated.View
          style={[styles.completionContent, { opacity: fadeAnim }]}
        >
          <Text style={styles.completionEmoji}>🌿</Text>
          <Text style={styles.completionTitle}>You did it!</Text>
          <Text style={styles.completionSubtitle}>Your mind thanks you.</Text>
          <Text style={styles.completionXP}>+4 XP earned</Text>
          <Text style={styles.completionMessage}>
            You've just given yourself the gift of presence. Take this mindful
            energy with you.
          </Text>

          <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
            <Text style={styles.returnButtonText}>Return Mindfully</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (isTimerActive) {
    return (
      <SafeAreaView style={[styles.container, styles.timerContainer]}>
        <View style={styles.timerContent}>
          {/* Floating leaves animation */}
          <Animated.View
            style={[
              styles.leafContainer,
              {
                transform: [
                  {
                    translateY: leafAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, -20],
                    }),
                  },
                ],
                opacity: leafAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
              },
            ]}
          >
            <Text style={styles.leafEmoji}>🍃</Text>
            <Text style={[styles.leafEmoji, styles.leaf2]}>🌿</Text>
            <Text style={[styles.leafEmoji, styles.leaf3]}>🍃</Text>
          </Animated.View>

          <Animated.View
            style={[styles.timerDisplay, { transform: [{ scale: scaleAnim }] }]}
          >
            <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${getProgressPercentage()}%` },
                  ]}
                />
              </View>
            </View>
          </Animated.View>

          <Text style={styles.encouragementText}>
            Enjoy the world around you.{"\n"}We'll see you soon.
          </Text>

          <View style={styles.timerActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={confirmExit}>
              <Text style={styles.cancelButtonText}>End Early</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <MindfulBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.calendarButton}
              onPress={handleCalendarPress}
            >
              <Text style={styles.calendarButtonText}>📅</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mainContent}>
            <Text style={styles.title}>🌿 Screen-Free Timer</Text>
            <Text style={styles.subtitle}>
              Step away. Recharge. Be present.
            </Text>

            {/* Today's progress indicator */}
            {todaysSessionCount > 0 && (
              <View style={styles.progressIndicator}>
                <Text style={styles.progressText}>
                  {todaysSessionCount} session
                  {todaysSessionCount !== 1 ? "s" : ""} completed today 🔥
                </Text>
              </View>
            )}

            {/* Timer Picker */}
            <View style={styles.timerPicker}>
              <Text style={styles.pickerLabel}>Choose your mindful break:</Text>
              <View style={styles.timerOptions}>
                {timerOptions.map((option) => (
                  <TouchableOpacity
                    key={option.minutes}
                    style={[
                      styles.timerOption,
                      selectedMinutes === option.minutes &&
                        styles.timerOptionSelected,
                      { backgroundColor: option.color },
                    ]}
                    onPress={() => selectTimer(option.minutes)}
                  >
                    <Text
                      style={[
                        styles.timerOptionText,
                        selectedMinutes === option.minutes &&
                          styles.timerOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom 25 min option */}
              <TouchableOpacity
                style={[
                  styles.customOption,
                  selectedMinutes === 25 && styles.customOptionSelected,
                ]}
                onPress={() => selectTimer(25)}
              >
                <Text
                  style={[
                    styles.customOptionText,
                    selectedMinutes === 25 && styles.customOptionTextSelected,
                  ]}
                >
                  25 min (Pomodoro)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>What you'll gain:</Text>
              <View style={styles.benefitsList}>
                <Text style={styles.benefitItem}>
                  • Mental clarity and focus
                </Text>
                <Text style={styles.benefitItem}>
                  • Reduced digital overwhelm
                </Text>
                <Text style={styles.benefitItem}>
                  • Connection with your surroundings
                </Text>
                <Text style={styles.benefitItem}>• +4 XP for completion</Text>
              </View>
            </View>

            {/* Start Button */}
            <TouchableOpacity style={styles.startButton} onPress={startTimer}>
              <Text style={styles.startButtonText}>Begin Screen-Free Time</Text>
              <Text style={styles.startButtonSubtext}>
                ({selectedMinutes} minutes)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TimerCalendarModal
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
        />

        <PaywallModal
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
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
  completionContainer: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    background: "linear-gradient(135deg, #F3FBCB 0%, #F4D8FE 100%)",
    backgroundColor: "#F3FBCB",
  },
  content: {
    flex: 1,
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
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  calendarButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarButtonText: {
    fontSize: 20,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#121111",
    opacity: 0.8,
    textAlign: "center",
    marginBottom: 40,
    fontStyle: "italic",
  },
  progressIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  timerPicker: {
    marginBottom: 30,
  },
  pickerLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 15,
    textAlign: "center",
  },
  timerOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  timerOption: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  timerOptionSelected: {
    borderColor: "#121111",
    transform: [{ scale: 1.05 }],
  },
  timerOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.8,
  },
  timerOptionTextSelected: {
    fontWeight: "700",
    opacity: 1,
  },
  customOption: {
    backgroundColor: "rgba(147, 213, 225, 0.6)",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  customOptionSelected: {
    borderColor: "#121111",
    backgroundColor: "#93D5E1",
  },
  customOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.8,
  },
  customOptionTextSelected: {
    fontWeight: "700",
    opacity: 1,
  },
  benefitsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 12,
    textAlign: "center",
  },
  benefitsList: {
    alignItems: "flex-start",
  },
  benefitItem: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.8,
    marginBottom: 6,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: "#93D5E1",
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#93D5E1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 4,
  },
  startButtonSubtext: {
    fontSize: 14,
    fontWeight: "500",
    color: "#121111",
    opacity: 0.7,
  },
  timerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    position: "relative",
  },
  leafContainer: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  leafEmoji: {
    fontSize: 24,
    opacity: 0.6,
  },
  leaf2: {
    fontSize: 28,
  },
  leaf3: {
    fontSize: 20,
  },
  timerDisplay: {
    alignItems: "center",
    marginBottom: 40,
  },
  timerText: {
    fontSize: 72,
    fontWeight: "300",
    color: "#121111",
    marginBottom: 20,
    fontFamily: "monospace",
  },
  progressContainer: {
    width: 200,
    alignItems: "center",
  },
  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(18, 17, 17, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#93D5E1",
    borderRadius: 4,
  },
  encouragementText: {
    fontSize: 18,
    color: "#121111",
    textAlign: "center",
    lineHeight: 26,
    opacity: 0.8,
    marginBottom: 60,
    fontStyle: "italic",
  },
  timerActions: {
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.7,
  },
  completionContent: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  completionEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 8,
    textAlign: "center",
  },
  completionSubtitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#121111",
    marginBottom: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  completionXP: {
    fontSize: 24,
    fontWeight: "700",
    color: "#93D5E1",
    marginBottom: 20,
  },
  completionMessage: {
    fontSize: 16,
    color: "#121111",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
    marginBottom: 40,
  },
  returnButton: {
    backgroundColor: "#93D5E1",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: "#93D5E1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  returnButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
  },
});

export default TimerPage;
