import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MindfulBackground from "../../components/MindfulBackground";
import ReflectionCalendarModal from "../../components/ReflectionCalendarModal";
import {
  getTodaysReflections,
  saveReflection,
} from "../../utils/reflectionManager";
import { addXP } from "../../utils/xpManager";

const reflectionPrompts = [
  "What am I grateful for right now?",
  "What am I grateful for right now?",
  "How am I feeling in my body at this moment?",
  "What emotion was I trying to escape by scrolling?",
  "What would bring me more peace than this screen?",
  "What's one thing that went well today?",
  "How can I show myself compassion right now?",
  "What do I truly need in this moment?",
  "What would my wisest self choose to do right now?",
  "What's weighing on my mind that I could let go of?",
  "How do I want to spend my time today?",
  "What brings me genuine joy beyond digital distractions?",
  "What intention do I want to set for the next hour?",
  "What am I avoiding that might need my attention?",
  "How can I be kinder to myself today?",
  "What would make this moment more meaningful?",
];

const ReflectPage = () => {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todaysCount, setTodaysCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    loadTodaysReflections();
    setRandomPrompt();
  }, []);

  const loadTodaysReflections = async () => {
    try {
      const reflections = await getTodaysReflections();
      setTodaysCount(reflections.length);
    } catch (error) {
      console.error("Error loading today's reflections:", error);
    }
  };

  const setRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * reflectionPrompts.length);
    setCurrentPrompt(reflectionPrompts[randomIndex]);
  };

  const handleSubmit = async () => {
    if (reflection.trim().length < 10) {
      Alert.alert(
        "Reflection too short",
        "Please write at least a few words to capture your thoughts.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Save reflection
      await saveReflection(reflection.trim());

      // Award XP for reflection
      const newXP = await addXP(3);

      // Update today's count
      setTodaysCount((prev) => prev + 1);

      // Show success state
      setShowSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate back after a brief delay
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error("Error saving reflection:", error);
      Alert.alert("Error", "Failed to save your reflection. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewPrompt = () => {
    setRandomPrompt();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCalendarPress = () => {
    setShowCalendar(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleReturn = () => {
    router.back();
  };

  if (showSuccess) {
    return (
      <MindfulBackground>
        <SafeAreaView style={[styles.container, styles.successContainer]}>
          <View style={styles.successContent}>
            <Text style={styles.successEmoji}>🌟</Text>
            <Text style={styles.successTitle}>Reflection Saved!</Text>
            <Text style={styles.successSubtitle}>+3 XP Earned</Text>
            <Text style={styles.successMessage}>
              Your thoughts have been saved. Taking time to reflect helps build
              self-awareness and emotional intelligence.
            </Text>
            <Text style={styles.successStats}>
              {todaysCount} reflection{todaysCount !== 1 ? "s" : ""} today
            </Text>
          </View>
        </SafeAreaView>
      </MindfulBackground>
    );
  }

  return (
    <MindfulBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleReturn}
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

            <View style={styles.content}>
              <Text style={styles.title}>💭 Quick Reflection</Text>

              {todaysCount > 0 && (
                <View style={styles.streakContainer}>
                  <Text style={styles.streakText}>
                    {todaysCount} reflection{todaysCount !== 1 ? "s" : ""} today
                    🔥
                  </Text>
                </View>
              )}

              <View style={styles.promptContainer}>
                <Text style={styles.promptLabel}>Reflection Prompt:</Text>
                <View style={styles.promptBox}>
                  <Text style={styles.promptText}>{currentPrompt}</Text>
                  <TouchableOpacity
                    style={styles.newPromptButton}
                    onPress={handleNewPrompt}
                  >
                    <Text style={styles.newPromptText}>🎲 New prompt</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Your thoughts:</Text>
                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={8}
                  placeholder="Take a moment to reflect on the prompt above. Write whatever comes to mind - there's no right or wrong answer..."
                  placeholderTextColor="rgba(18, 17, 17, 0.5)"
                  value={reflection}
                  onChangeText={setReflection}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>
                  {reflection.length} characters
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  reflection.trim().length < 10 && styles.submitButtonDisabled,
                  isSubmitting && styles.submitButtonSubmitting,
                ]}
                onPress={handleSubmit}
                disabled={reflection.trim().length < 10 || isSubmitting}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    reflection.trim().length < 10 &&
                      styles.submitButtonTextDisabled,
                  ]}
                >
                  {isSubmitting ? "Saving..." : "Save Reflection (+3 XP)"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.privacyNote}>
                🔒 Your reflections are stored privately on your device
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <ReflectionCalendarModal
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
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
  successContainer: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 20,
    textAlign: "center",
  },
  streakContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  streakText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  promptContainer: {
    marginBottom: 30,
  },
  promptLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 12,
  },
  promptBox: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    padding: 20,
  },
  promptText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#121111",
    lineHeight: 26,
    marginBottom: 15,
    fontStyle: "italic",
  },
  newPromptButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(147, 213, 225, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  newPromptText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 20,
    fontSize: 16,
    color: "#121111",
    lineHeight: 24,
    minHeight: 150,
    borderWidth: 2,
    borderColor: "rgba(18, 17, 17, 0.1)",
  },
  characterCount: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.6,
    textAlign: "right",
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: "#93D5E1",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "rgba(147, 213, 225, 0.4)",
  },
  submitButtonSubmitting: {
    backgroundColor: "rgba(147, 213, 225, 0.6)",
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
  },
  submitButtonTextDisabled: {
    opacity: 0.5,
  },
  privacyNote: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 20,
  },
  successContent: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 20,
  },
  successMessage: {
    fontSize: 16,
    color: "#121111",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
    opacity: 0.8,
  },
  successStats: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.7,
  },
});

export default ReflectPage;
