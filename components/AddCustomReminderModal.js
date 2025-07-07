import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { scheduleReminderNotification } from "../utils/notificationManager";

const { width, height } = Dimensions.get("window");

const AddCustomReminderModal = ({ visible, onClose, onSuccess }) => {
  const [message, setMessage] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [selectedHour, setSelectedHour] = useState("08");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedEmoji, setSelectedEmoji] = useState("🌱");
  const [selectedDays, setSelectedDays] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  const frequencies = ["Once", "Daily", "Weekly"];
  const emojis = ["🌱", "🔔", "☀️", "💫"];
  const daysOfWeek = [
    { key: "monday", label: "Mon" },
    { key: "tuesday", label: "Tue" },
    { key: "wednesday", label: "Wed" },
    { key: "thursday", label: "Thu" },
    { key: "friday", label: "Fri" },
    { key: "saturday", label: "Sat" },
    { key: "sunday", label: "Sun" },
  ];

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only handle vertical gestures
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animations when touch starts
        panY.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If pulled down far enough, close the modal
        if (gestureState.dy > 100) {
          handleClose();
        } else {
          // Otherwise, reset position
          resetPositionAnim.start();
        }
      },
      onPanResponderTerminate: () => {
        // Reset position if gesture is interrupted
        resetPositionAnim.start();
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const requestNotificationPermissions = async () => {
    if (Platform.OS !== "ios") {
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        "Notifications Disabled",
        "Please enable notifications in Settings to receive reminders.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go to Settings",
            onPress: () => Notifications.openSystemPreferencesAsync(),
          },
        ]
      );
      return false;
    }

    return true;
  };

  const saveReminder = async (reminderData) => {
    try {
      const existingReminders = await AsyncStorage.getItem("customReminders");
      const reminders = existingReminders ? JSON.parse(existingReminders) : [];

      reminders.push(reminderData);

      await AsyncStorage.setItem("customReminders", JSON.stringify(reminders));
      console.log("Reminder saved:", reminderData);
    } catch (error) {
      console.error("Error saving reminder:", error);
      throw error;
    }
  };

  const handleHourChange = (text) => {
    // Allow empty or numeric input
    if (text === "") {
      setSelectedHour("");
      return;
    }

    // Remove non-numeric characters
    text = text.replace(/[^0-9]/g, "");

    // Convert to number for validation
    let hour = parseInt(text);

    // Handle single digit or double digit input
    if (hour >= 0 && hour <= 23) {
      setSelectedHour(text);
    }
  };

  const handleMinuteChange = (text) => {
    // Allow empty or numeric input
    if (text === "") {
      setSelectedMinute("");
      return;
    }

    // Remove non-numeric characters
    text = text.replace(/[^0-9]/g, "");

    // Convert to number for validation
    let minute = parseInt(text);

    // Handle single digit or double digit input
    if (minute >= 0 && minute <= 59) {
      setSelectedMinute(text);
    }
  };

  const handleHourBlur = () => {
    if (selectedHour === "") {
      setSelectedHour("00");
    } else {
      // Pad with zero if single digit
      setSelectedHour((prev) => parseInt(prev).toString().padStart(2, "0"));
    }
  };

  const handleMinuteBlur = () => {
    if (selectedMinute === "") {
      setSelectedMinute("00");
    } else {
      // Pad with zero if single digit
      setSelectedMinute((prev) => parseInt(prev).toString().padStart(2, "0"));
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert("Missing Information", "Please enter a reminder message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const reminderData = {
        id: generateId(),
        message: message.trim(),
        frequency,
        time: `${selectedHour}:${selectedMinute}`,
        emoji: selectedEmoji,
        selectedDays: [],
        createdAt: new Date().toISOString(),
      };

      await saveReminder(reminderData);

      // Use the notification manager to schedule notifications
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        await scheduleReminderNotification(reminderData);
      }

      // Show success message
      Alert.alert(
        "✨ Reminder Created",
        "Your mindful reminder has been saved. We'll gently nudge you at the right time.",
        [{ text: "Perfect", onPress: handleClose }]
      );

      if (onSuccess) {
        onSuccess(reminderData);
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
      Alert.alert("Oops!", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    setFrequency("Daily");
    setSelectedHour("08");
    setSelectedMinute("00");
    setSelectedEmoji("🌱");
    setSelectedDays([]);
    onClose();
  };

  const renderFrequencySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>When should we remind you?</Text>
      <View style={styles.segmentedControl}>
        {frequencies.map((freq) => (
          <TouchableOpacity
            key={freq}
            style={[
              styles.segmentButton,
              frequency === freq && styles.segmentButtonActive,
            ]}
            onPress={() => setFrequency(freq)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentButtonText,
                frequency === freq && styles.segmentButtonTextActive,
              ]}
            >
              {freq}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTimeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>What time works best?</Text>
      <View style={styles.timeContainer}>
        <View style={styles.timeInputWrapper}>
          <View style={styles.timeFieldContainer}>
            <TextInput
              style={styles.timeInput}
              value={selectedHour}
              onChangeText={handleHourChange}
              onBlur={handleHourBlur}
              placeholder="00"
              placeholderTextColor="rgba(18, 17, 17, 0.4)"
              keyboardType="numeric"
              maxLength={2}
              selectTextOnFocus={true}
            />
            <Text style={styles.timeLabel}>hr</Text>
          </View>
          <Text style={styles.timeSeparator}>:</Text>
          <View style={styles.timeFieldContainer}>
            <TextInput
              style={styles.timeInput}
              value={selectedMinute}
              onChangeText={handleMinuteChange}
              onBlur={handleMinuteBlur}
              placeholder="00"
              placeholderTextColor="rgba(18, 17, 17, 0.4)"
              keyboardType="numeric"
              maxLength={2}
              selectTextOnFocus={true}
            />
            <Text style={styles.timeLabel}>min</Text>
          </View>
        </View>
        <Text style={styles.timeHint}>
          Use 24-hour format (e.g., 14:30 for 2:30 PM)
        </Text>
      </View>
    </View>
  );

  const renderEmojiSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Pick your mindful symbol</Text>
      <View style={styles.emojiContainer}>
        {emojis.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.emojiButton,
              selectedEmoji === emoji && styles.emojiButtonActive,
            ]}
            onPress={() => setSelectedEmoji(emoji)}
            activeOpacity={0.7}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }, { translateY: panY }],
              opacity: fadeAnim,
            },
          ]}
        >
          <LinearGradient
            colors={["#FFFDE9", "#F7F4FF"]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <SafeAreaView style={styles.safeArea}>
              {/* Drag Handle - now just visual indicator */}
              <View style={styles.dragHandle}>
                <View style={styles.dragIndicator} />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Text style={styles.headerTitle}>Create Your Reminder</Text>
                  <Text style={styles.headerSubtitle}>
                    Set a gentle nudge for mindful moments
                  </Text>
                </View>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                onScrollBeginDrag={() => panY.setValue(0)} // Reset pan position when scrolling starts
                scrollEventThrottle={16}
              >
                {/* Message Input */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    What should we remind you?
                  </Text>
                  <View style={styles.messageInputContainer}>
                    <TextInput
                      style={styles.messageInput}
                      value={message}
                      onChangeText={setMessage}
                      placeholder="Stay grounded and breathe deeply..."
                      placeholderTextColor="rgba(18, 17, 17, 0.4)"
                      multiline
                      maxLength={100}
                    />
                    <Text style={styles.characterCount}>
                      {message.length}/100
                    </Text>
                  </View>
                </View>

                {renderFrequencySelector()}
                {renderTimeSelector()}
                {renderEmojiSelector()}

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      isSubmitting
                        ? ["#E0E0E0", "#D0D0D0"]
                        : ["#93D5E1", "#A8E6CF"]
                    }
                    style={styles.submitButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text
                      style={[
                        styles.submitButtonText,
                        isSubmitting && styles.submitButtonTextDisabled,
                      ]}
                    >
                      {isSubmitting ? "Creating..." : "✨ Create Reminder"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    height: height * 0.92,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#121111",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#121111",
    opacity: 0.7,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 12,
  },
  messageInputContainer: {
    position: "relative",
  },
  messageInput: {
    fontSize: 16,
    color: "#121111",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  characterCount: {
    position: "absolute",
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: "#121111",
    opacity: 0.5,
  },
  segmentedControl: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 18,
    padding: 4,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
  segmentButtonActive: {
    backgroundColor: "rgba(147, 213, 225, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#121111",
    opacity: 0.7,
  },
  segmentButtonTextActive: {
    opacity: 1,
    fontWeight: "600",
  },
  timeContainer: {
    alignItems: "center",
  },
  timeInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  timeFieldContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    minWidth: 70,
  },
  timeInput: {
    fontSize: 22,
    color: "#121111",
    fontWeight: "600",
    textAlign: "center",
    padding: 0,
    minWidth: 35,
  },
  timeLabel: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.5,
    marginTop: 2,
    fontWeight: "500",
  },
  timeSeparator: {
    fontSize: 24,
    color: "#121111",
    fontWeight: "600",
    marginHorizontal: 4,
    opacity: 0.7,
  },
  timeHint: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.6,
    marginTop: 12,
    textAlign: "center",
  },
  emojiContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  emojiButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  emojiButtonActive: {
    backgroundColor: "rgba(255, 227, 125, 0.8)",
    borderColor: "rgba(255, 227, 125, 1)",
    transform: [{ scale: 1.1 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  emojiText: {
    fontSize: 24,
  },
  submitButton: {
    marginTop: 12,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.05,
    elevation: 2,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
  },
  submitButtonTextDisabled: {
    opacity: 0.6,
  },
  dragHandle: {
    width: "100%",
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 2,
  },
});

export default AddCustomReminderModal;
