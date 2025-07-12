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
import JournalCalendarModal from "../../components/JournalCalendarModal";
import MindfulBackground from "../../components/MindfulBackground";
import PaywallModal from "../../components/PaywallModal";
import useRevenueCat from "../../hooks/useRevenueCat";
import {
  getTodaysJournalEntries,
  saveJournalEntry,
} from "../../utils/journalManager";
import { addXP } from "../../utils/xpManager";

const JournalPage = () => {
  const [journalText, setJournalText] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [todaysEntryCount, setTodaysEntryCount] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [calendarClickDisabled, setCalendarClickDisabled] = useState(false);

  // Revenue Cat hook to check premium status
  const { isPremiumMember } = useRevenueCat();

  const moodOptions = [
    { emoji: "😌", label: "Calm" },
    { emoji: "😕", label: "Confused" },
    { emoji: "😠", label: "Frustrated" },
    { emoji: "😄", label: "Grateful" },
    { emoji: "🤯", label: "Overwhelmed" },
  ];

  const characterLimit = 500;

  useEffect(() => {
    loadTodaysEntries();
  }, []);

  const loadTodaysEntries = async () => {
    try {
      const entries = await getTodaysJournalEntries();
      setTodaysEntryCount(entries.length);
    } catch (error) {
      console.error("Error loading today's journal entries:", error);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTextChange = (text) => {
    if (text.length <= characterLimit) {
      setJournalText(text);
    }
  };

  const canSave = () => {
    return journalText.trim().length > 0 && selectedMood !== null;
  };

  const handleSave = async () => {
    if (!canSave()) {
      Alert.alert(
        "Complete Your Entry",
        "Please write something and select a mood to save your journal entry.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Save journal entry
      await saveJournalEntry(journalText, selectedMood);

      // Award XP
      const newXP = await addXP(3);

      // Update today's count
      setTodaysEntryCount((prev) => prev + 1);

      // Show success state
      setShowSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate back after a brief delay
      setTimeout(() => {
        router.back();
      }, 2500);
    } catch (error) {
      console.error("Error saving journal entry:", error);
      Alert.alert(
        "Error",
        "Failed to save your journal entry. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCalendarPress = () => {
    if (calendarClickDisabled) return;
    
    setCalendarClickDisabled(true);
    setTimeout(() => setCalendarClickDisabled(false), 1000); // 1 second debounce
    
    if (isPremiumMember) {
      setShowCalendar(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowPaywall(true);
    }
  };

  const handleCloseCalendar = () => {
    setShowCalendar(false);
  };

  const handleReturn = () => {
    router.back();
  };

  if (showSuccess) {
    return (
      <MindfulBackground>
        <SafeAreaView style={[styles.container, styles.successContainer]}>
          <View style={styles.successContent}>
            <Text style={styles.successEmoji}>✨</Text>
            <Text style={styles.successTitle}>You've journaled today</Text>
            <Text style={styles.successSubtitle}>+3 XP Earned</Text>
            <Text style={styles.successMessage}>
              Writing frees the mind. Your thoughts have been captured and your
              mindfulness journey continues.
            </Text>
            <Text style={styles.successStats}>
              {todaysEntryCount} journal entr
              {todaysEntryCount !== 1 ? "ies" : "y"} today
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
            keyboardShouldPersistTaps="handled"
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
              <Text style={styles.title}>📝 Quick Journal</Text>
              <Text style={styles.subtitle}>
                Empty your mind. No prompt. Just you and your thoughts.
              </Text>

              {todaysEntryCount > 0 && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    {todaysEntryCount} entr
                    {todaysEntryCount !== 1 ? "ies" : "y"} today 🔥
                  </Text>
                </View>
              )}

              {/* Mood Selection */}
              <View style={styles.moodContainer}>
                <Text style={styles.moodLabel}>How are you feeling?</Text>
                <View style={styles.moodOptions}>
                  {moodOptions.map((mood) => (
                    <TouchableOpacity
                      key={mood.emoji}
                      style={[
                        styles.moodOption,
                        selectedMood === mood.emoji &&
                          styles.moodOptionSelected,
                      ]}
                      onPress={() => handleMoodSelect(mood.emoji)}
                    >
                      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                      <Text
                        style={[
                          styles.moodText,
                          selectedMood === mood.emoji &&
                            styles.moodTextSelected,
                        ]}
                      >
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Text Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Your thoughts:</Text>
                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={8}
                  placeholder="What's on your mind today?"
                  placeholderTextColor="rgba(18, 17, 17, 0.5)"
                  value={journalText}
                  onChangeText={handleTextChange}
                  textAlignVertical="top"
                  maxLength={characterLimit}
                />
                <View style={styles.characterCountContainer}>
                  <Text
                    style={[
                      styles.characterCount,
                      journalText.length >= characterLimit * 0.9 &&
                        styles.characterCountWarning,
                    ]}
                  >
                    {journalText.length}/{characterLimit} characters
                  </Text>
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !canSave() && styles.saveButtonDisabled,
                  isSubmitting && styles.saveButtonSubmitting,
                ]}
                onPress={handleSave}
                disabled={!canSave() || isSubmitting}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    !canSave() && styles.saveButtonTextDisabled,
                  ]}
                >
                  {isSubmitting ? "Saving..." : "Save & Reflect (+3 XP)"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.privacyNote}>
                🔒 Your journal entries are stored privately on your device
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        {showCalendar && (
          <JournalCalendarModal
            visible={showCalendar}
            onClose={handleCloseCalendar}
          />
        )}

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
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  calendarButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  calendarButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#121111",
    opacity: 0.8,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
    fontStyle: "italic",
  },
  progressContainer: {
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
  moodContainer: {
    marginBottom: 30,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 15,
    textAlign: "center",
  },
  moodOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  moodOption: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 8,
    flex: 1,
    marginHorizontal: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  moodOptionSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderColor: "#121111",
    transform: [{ scale: 1.05 }],
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.7,
    textAlign: "center",
  },
  moodTextSelected: {
    opacity: 1,
    fontWeight: "700",
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
  characterCountContainer: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.6,
  },
  characterCountWarning: {
    color: "#FF6B6B",
    opacity: 1,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#F3FBCB",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#F3FBCB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "rgba(243, 251, 203, 0.4)",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonSubmitting: {
    backgroundColor: "rgba(243, 251, 203, 0.6)",
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
  },
  saveButtonTextDisabled: {
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
    textAlign: "center",
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

export default JournalPage;
