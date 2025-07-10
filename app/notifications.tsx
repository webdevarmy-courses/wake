import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import AddCustomReminderModal from "@/components/AddCustomReminderModal";
import MindfulBackground from "@/components/MindfulBackground";
import PaywallModal from "@/components/PaywallModal";
import useRevenueCat from "@/hooks/useRevenueCat";
import { deleteCustomReminder, getNotificationsEnabled, getScrollReminderFrequency, handleSleepModeChange, setNotificationsEnabled, setScrollReminderFrequency } from "@/utils/notificationManager";

const { width } = Dimensions.get("window");
const SECTION_WIDTH = width * 0.9;

// Sleep Mode AsyncStorage keys
const SLEEP_MODE_ENABLED = 'sleepModeEnabled';
const SLEEP_START_TIME = 'sleepStartTime';
const SLEEP_END_TIME = 'sleepEndTime';

const FREQUENCY_OPTIONS = [
  { label: "5 min", value: 5, subLabel: "Quick Nudge" },
  { label: "15 min", value: 15, subLabel: "🌬️ Frequent Breaths" },
  { label: "30 min", value: 30, subLabel: "♩ Gentle Rhythm" },
  { label: "45 min", value: 45, subLabel: "🧘 Mindful Cadence" },
  { label: "1 hr", value: 60, subLabel: "🌊 Calm Check-ins" },
  { label: "2 hrs", value: 120, subLabel: "🍃 Subtle Awareness" },
];

interface Reminder {
  id: string;
  emoji: string;
  message: string;
  frequency: string;
  time: string;
  selectedDays?: string[];
}

export default function NotificationsPage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(1)).current;
  const chipAnimations = useRef(
    FREQUENCY_OPTIONS.reduce((acc, option) => {
      acc[option.value] = new Animated.Value(1);
      return acc;
    }, {} as Record<number, Animated.Value>)
  ).current;

  // Sleep Mode state
  const [sleepModeEnabled, setSleepModeEnabled] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState(new Date().setHours(22, 0, 0, 0));
  const [sleepEndTime, setSleepEndTime] = useState(new Date().setHours(7, 0, 0, 0));
  const [activeTimePickerType, setActiveTimePickerType] = useState<'start' | 'end' | null>(null);
  const slideUpAnim = useRef(new Animated.Value(0)).current;
  const [showPaywall, setShowPaywall] = useState(false);

  // Premium checking
  const { isPremiumMember } = useRevenueCat();

  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    const [enabled, frequency, sleepEnabled, startTime, endTime] = await Promise.all([
      getNotificationsEnabled(),
      getScrollReminderFrequency(),
      AsyncStorage.getItem(SLEEP_MODE_ENABLED),
      AsyncStorage.getItem(SLEEP_START_TIME),
      AsyncStorage.getItem(SLEEP_END_TIME)
    ]);
    
    setNotificationsEnabledState(enabled);
    setSelectedFrequency(frequency);
    
    // Set sleep mode state
    setSleepModeEnabled(sleepEnabled === 'true');
    if (startTime) setSleepStartTime(parseInt(startTime));
    if (endTime) setSleepEndTime(parseInt(endTime));
    
    if (enabled) {
      loadReminders();
    }
  };

  const handleFrequencyChange = async (minutes: number) => {
    // Check if user is trying to select a premium frequency (anything other than 45 min)
    if (minutes !== 45 && !isPremiumMember) {
      Alert.alert(
        "Custom frequencies require premium",
        "Upgrade to premium to customize your notification timing and find the perfect rhythm for your mindful awareness.",
        [
          { text: "Maybe Later", style: "cancel" },
          { 
            text: "Upgrade Now", 
            style: "default",
            onPress: () => setShowPaywall(true)
          }
        ]
      );
      return;
    }

    // Animate the chip bounce
    const animation = chipAnimations[minutes];
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedFrequency(minutes);
    
    try {
      await setScrollReminderFrequency(minutes);
      
      // Show brief success feedback
      Alert.alert(
        "Frequency Updated! ✅",
        `Your notifications will now arrive every ${minutes} minute${minutes !== 1 ? 's' : ''}. All scheduled notifications have been updated with the new timing.`,
        [{ text: "Got it", style: "default" }],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error updating frequency:', error);
      Alert.alert(
        "Update Failed",
        "There was an issue updating the notification frequency. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  const loadReminders = async () => {
    try {
      const existingReminders = await AsyncStorage.getItem("customReminders");
      if (existingReminders) {
        setReminders(JSON.parse(existingReminders));
      }
    } catch (error) {
      console.error("Error loading reminders:", error);
    }
  };

  const handleReminderCreated = (newReminder: Reminder) => {
    // Fade out current list
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Update list with new reminder
    setReminders((prev) => [...prev, newReminder]);
    setModalVisible(false);
  };

  const handleDeleteReminder = async (reminderId: string) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedReminders = await deleteCustomReminder(reminderId);
              if (updatedReminders) {
                // Fade out before updating
                Animated.timing(fadeAnim, {
                  toValue: 0.5,
                  duration: 200,
                  useNativeDriver: true,
                }).start(() => {
                  setReminders(updatedReminders);
                  // Fade back in
                  Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                  }).start();
                });
              }
            } catch (error) {
              console.error("Error deleting reminder:", error);
              Alert.alert(
                "Error",
                "Failed to delete reminder. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const formatTime = (time: string | number) => {
    if (typeof time === 'string') {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } else {
      const date = new Date(time);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  };

  const renderReminderCard = ({ item }: { item: Reminder }) => (
    <Animated.View style={[styles.reminderCard, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 255, 255, 0.9)"]}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.reminderHeader}>
          <Text style={styles.reminderEmoji}>{item.emoji}</Text>
          <View style={styles.reminderInfo}>
            <Text style={styles.reminderMessage}>{item.message}</Text>
            <Text style={styles.reminderDetails}>
              {item.frequency} • {formatTime(item.time)}
            </Text>
            {item.frequency === "Specific Days" && item.selectedDays && (
              <Text style={styles.reminderDays}>
                {item.selectedDays
                  .map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3))
                  .join(", ")}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteReminder(item.id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No reminders yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Create your first mindful reminder to get started
      </Text>
    </View>
  );

  const handleToggleNotifications = async () => {
    const newState = !notificationsEnabled;
    
    // Animate sections out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      // Update state and persist
      await setNotificationsEnabled(newState);
      setNotificationsEnabledState(newState);
      
      if (newState) {
        // Load data if enabling
        await loadReminders();
      }
      
      // Animate sections back in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const renderDisabledOverlay = () => (
    <View style={styles.overlayContainer}>
      <BlurView intensity={10} style={styles.blurOverlay}>
        <View style={styles.lockContent}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockText}>Enable notifications to unlock these reminders</Text>
        </View>
      </BlurView>
    </View>
  );

  const renderNotificationsToggle = () => (
    <View style={[styles.toggleCard, !notificationsEnabled && styles.toggleCardTop]}>
      <LinearGradient
        colors={[
          notificationsEnabled ? "rgba(220, 255, 220, 0.95)" : "rgba(255, 220, 220, 0.95)",
          notificationsEnabled ? "rgba(220, 255, 220, 0.85)" : "rgba(255, 220, 220, 0.85)"
        ]}
        style={styles.toggleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.toggleTitle}>
          {notificationsEnabled ? "✅ Notifications are On" : "🔕 Notifications are Off"}
        </Text>
        <Text style={styles.toggleSubtext}>
          {notificationsEnabled 
            ? "You'll receive nudges and custom reminders as configured."
            : "You're missing out on your mindful nudges."}
        </Text>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            notificationsEnabled && styles.toggleButtonDisable
          ]}
          onPress={handleToggleNotifications}
        >
          <Text style={styles.toggleButtonText}>
            {notificationsEnabled ? "Disable Notifications" : "Enable Notifications"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const handleSleepModeToggle = async () => {
    // Check if user is premium
    if (!isPremiumMember) {
      Alert.alert(
        "Sleep Mode requires premium",
        "Upgrade to premium to automatically pause notifications during your sleep hours and maintain healthier digital habits.",
        [
          { text: "Maybe Later", style: "cancel" },
          { 
            text: "Upgrade Now", 
            style: "default",
            onPress: () => setShowPaywall(true)
          }
        ]
      );
      return;
    }

    // Premium users - proceed with normal functionality
    const newState = !sleepModeEnabled;
    setSleepModeEnabled(newState);
    
    // Update sleep mode and reschedule notifications
    await handleSleepModeChange(newState, sleepStartTime, sleepEndTime);
  };

  const handleStartTimeChange = async (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      const timestamp = selectedDate.getTime();
      setSleepStartTime(timestamp);
      
      // Update sleep mode settings if enabled
      if (sleepModeEnabled) {
        await handleSleepModeChange(true, timestamp, sleepEndTime);
      } else {
        await AsyncStorage.setItem(SLEEP_START_TIME, timestamp.toString());
      }
    }
  };

  const handleEndTimeChange = async (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      const timestamp = selectedDate.getTime();
      setSleepEndTime(timestamp);
      
      // Update sleep mode settings if enabled
      if (sleepModeEnabled) {
        await handleSleepModeChange(true, sleepStartTime, timestamp);
      } else {
        await AsyncStorage.setItem(SLEEP_END_TIME, timestamp.toString());
      }
    }
  };

  const showTimePicker = (type: 'start' | 'end') => {
    if (Platform.OS === 'ios') {
      setActiveTimePickerType(type);
      Animated.spring(slideUpAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 100,
      }).start();
    } else {
      // For Android, just show the native picker
      if (type === 'start') {
        setShowStartPicker(true);
      } else {
        setShowEndPicker(true);
      }
    }
  };

  const hideTimePicker = () => {
    Animated.timing(slideUpAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setActiveTimePickerType(null);
    });
  };

  const renderIOSTimePicker = () => {
    if (!activeTimePickerType) return null;

    const currentTime = activeTimePickerType === 'start' ? sleepStartTime : sleepEndTime;

    return (
      <Modal
        transparent
        visible={!!activeTimePickerType}
        animationType="none"
        onRequestClose={hideTimePicker}
        statusBarTranslucent
      >
        <BlurView intensity={10} tint="dark" style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalTouchable}
            activeOpacity={1}
            onPress={hideTimePicker}
          >
            <Animated.View
              style={[
                styles.timePickerModal,
                {
                  transform: [{
                    translateY: slideUpAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.98)']}
                style={styles.timePickerGradient}
              >
                <View style={styles.timePickerHeader}>
                  <TouchableOpacity onPress={hideTimePicker}>
                    <Text style={styles.timePickerCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.timePickerTitle}>
                    {activeTimePickerType === 'start' ? 'Start Time' : 'End Time'}
                  </Text>
                  <TouchableOpacity onPress={hideTimePicker}>
                    <Text style={styles.timePickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.timePickerWrapper}>
                  <DateTimePicker
                    value={new Date(currentTime)}
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    onChange={activeTimePickerType === 'start' ? handleStartTimeChange : handleEndTimeChange}
                    style={styles.iosTimePicker}
                    textColor="#000000"
                  />
                </View>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </BlurView>
      </Modal>
    );
  };

  return (
    <MindfulBackground style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header with Back Button */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              {/* <View style={styles.headerTextContainer}>
                <Text style={styles.pageTitle}>🔔 Notifications</Text>
                <Text style={styles.pageSubtitle}>
                  Manage your mindful reminders
                </Text>
              </View> */}
            </View>

            {/* Toggle only at top when disabled */}
            {!notificationsEnabled && renderNotificationsToggle()}

            {/* Main sections with conditional dimming */}
            <View style={[
              styles.sectionsContainer,
              !notificationsEnabled && styles.sectionsContainerDisabled
            ]}>
              {/* Frequency Section */}
              <View style={styles.frequencySection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>⏰ Notify me every</Text>
                  <Text style={styles.sectionSubtitle}>
                    You'll receive a gentle nudge if you've been mindlessly scrolling
                  </Text>
                </View>
                
                <View style={styles.chipContainer}>
                  {FREQUENCY_OPTIONS.map((option) => (
                    <Animated.View
                      key={option.value}
                      style={{
                        transform: [{ scale: chipAnimations[option.value] }]
                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.chip,
                          selectedFrequency === option.value && styles.chipSelected,
                          option.value !== 45 && !isPremiumMember && styles.chipPremium,
                        ]}
                        onPress={() => notificationsEnabled && handleFrequencyChange(option.value)}
                        disabled={!notificationsEnabled}
                      >
                        <View style={styles.chipContent}>
                          <Text
                            style={[
                              styles.chipText,
                              selectedFrequency === option.value && styles.chipTextSelected,
                            ]}
                          >
                            {option.label}
                            {option.value !== 45 && !isPremiumMember && " 🔒"}
                          </Text>
                          <Text
                            style={[
                              styles.chipSubText,
                              selectedFrequency === option.value && styles.chipSubTextSelected,
                            ]}
                          >
                            {option.subLabel}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
                
                <View style={styles.helperTextContainer}>
                  <Text style={styles.helperText}>
                    💡 
                    We'll gently nudge you to pause and take a mindful breath — especially when you might be scrolling without realizing.
                  </Text>
                </View>
              </View>

              {/* Sleep Mode Section */}
              <View style={styles.sleepModeSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🌙 Sleep Mode</Text>
                  <Text style={styles.sectionSubtitle}>
                    Pause notifications during your rest hours
                  </Text>
                </View>

                <View style={styles.sleepModeContent}>
                  <View style={styles.timePickerContainer}>
                    <TouchableOpacity
                      style={styles.timePickerRow}
                      onPress={() => notificationsEnabled && showTimePicker('start')}
                      disabled={!notificationsEnabled}
                    >
                      <Text style={styles.timeLabel}>Start Time</Text>
                      <View style={styles.timePicker}>
                        <Text style={styles.timeText}>{formatTime(sleepStartTime)}</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.timePickerRow}
                      onPress={() => notificationsEnabled && showTimePicker('end')}
                      disabled={!notificationsEnabled}
                    >
                      <Text style={styles.timeLabel}>End Time</Text>
                      <View style={styles.timePicker}>
                        <Text style={styles.timeText}>{formatTime(sleepEndTime)}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.sleepModeToggle,
                      sleepModeEnabled && styles.sleepModeToggleEnabled
                    ]}
                    onPress={handleSleepModeToggle}
                    disabled={!notificationsEnabled}
                  >
                    <Text style={[
                      styles.sleepModeToggleText,
                      sleepModeEnabled && styles.sleepModeToggleTextEnabled
                    ]}>
                      {sleepModeEnabled 
                        ? '✅ Sleep Mode On' 
                        : `💤 Enable Sleep Mode${!isPremiumMember ? ' (🔒)' : ''}`
                      }
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.helperTextContainer}>
                  <Text style={styles.helperText}>
                    💡 When Sleep Mode is active, you won't receive any notifications during your set rest hours.
                  </Text>
                </View>
              </View>

              {/* Android Time Picker */}
              {Platform.OS === 'android' && (showStartPicker || showEndPicker) && (
                <DateTimePicker
                  value={new Date(showStartPicker ? sleepStartTime : sleepEndTime)}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={showStartPicker ? handleStartTimeChange : handleEndTimeChange}
                />
              )}

              {/* iOS Time Picker Modal */}
              {Platform.OS === 'ios' && renderIOSTimePicker()}

              {/* Overlay when disabled */}
              {!notificationsEnabled && renderDisabledOverlay()}
            </View>

            {/* Toggle at bottom only when enabled */}
            {notificationsEnabled && renderNotificationsToggle()}
          </View>
        </ScrollView>

        <AddCustomReminderModal
          visible={modalVisible && notificationsEnabled}
          onClose={() => setModalVisible(false)}
          onSuccess={handleReminderCreated}
        />

        <PaywallModal
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
        />
      </SafeAreaView>
    </MindfulBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    alignItems: "center",
    width: "100%",
    paddingTop: 20,
  },
  header: {
    width: SECTION_WIDTH,
    marginBottom: 24,
  },
  headerTextContainer: {
    alignItems: "center",
    marginTop: 48,
  },
  backButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    opacity: 0.8,
  },
  frequencySection: {
    width: SECTION_WIDTH,
    backgroundColor: "rgba(244, 216, 254, 0.9)", // Enhanced lavender background
    borderRadius: 28,
    padding: 28,
    marginBottom: 60,
    marginTop: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  sectionHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 15,
    color: "#666",
    opacity: 0.9,
    textAlign: 'center',
    fontWeight: "500",
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  chip: {
    minWidth: 85,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  chipSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 7,
    borderWidth: 2,
    borderColor: "rgba(147, 213, 225, 0.7)",
    transform: [{ scale: 1.02 }],
  },
  chipPremium: {
    opacity: 0.7, // Dim the chip for non-premium users
    backgroundColor: "rgba(255, 255, 255, 0.6)", // Slightly dimmer background
    borderColor: "rgba(200, 200, 200, 0.3)", // Dimmer border
  },
  chipContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "700",
    textAlign: 'center',
    marginBottom: 2,
  },
  chipTextSelected: {
    color: "#333",
    fontWeight: "800",
  },
  chipSubText: {
    fontSize: 11,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    opacity: 0.8,
    fontWeight: "500",
  },
  chipSubTextSelected: {
    color: "#555",
    fontWeight: "600",
    opacity: 1,
  },
  helperTextContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 20,
    fontWeight: "500",
  },
  sectionDescription: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
    opacity: 0.9,
  },
  addButton: {
    backgroundColor: "rgba(244, 216, 254, 0.9)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  remindersContainer: {
    width: "100%",
    minHeight: 200,
  },
  remindersList: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  reminderCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reminderEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderMessage: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  reminderDetails: {
    fontSize: 15,
    color: "#666",
    opacity: 0.9,
  },
  reminderDays: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    opacity: 0.8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  deleteButtonText: {
    fontSize: 22,
    color: "#FF3B30",
    lineHeight: 26,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    opacity: 0.8,
  },
  sectionsContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  sectionsContainerDisabled: {
    opacity: 0.7,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  lockContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    margin: 20,
  },
  lockIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  lockText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  toggleCard: {
    width: SECTION_WIDTH,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleCardTop: {
    marginTop: 24,
  },
  toggleGradient: {
    padding: 24,
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textAlign: 'center',
  },
  toggleSubtext: {
    fontSize: 15,
    color: "#666",
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  toggleButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  toggleButtonDisable: {
    backgroundColor: "rgba(255, 59, 48, 0.15)",
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  sleepModeSection: {
    width: SECTION_WIDTH,
    backgroundColor: "rgba(244, 216, 254, 0.9)", // Enhanced lavender background
    borderRadius: 28,
    padding: 28,
    marginBottom: 60,
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  sleepModeContent: {
    marginTop: 24,
    marginBottom: 24,
  },
  timePickerContainer: {
    gap: 20,
    marginBottom: 24,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  timePicker: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  sleepModeToggle: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'center',
    minWidth: 200,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sleepModeToggleEnabled: {
    backgroundColor: "rgba(220, 255, 220, 0.95)",
  },
  sleepModeToggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  sleepModeToggleTextEnabled: {
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  timePickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  timePickerGradient: {
    width: '100%',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#FFFFFF',
  },
  timePickerWrapper: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  timePickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333333',
  },
  timePickerCancel: {
    fontSize: 17,
    color: '#666666',
    paddingHorizontal: 8,
  },
  timePickerDone: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  iosTimePicker: {
    height: 200,
    backgroundColor: '#FFFFFF',
  },
}); 