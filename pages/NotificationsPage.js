import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AddCustomReminderModal from "../components/AddCustomReminderModal";
import MindfulBackground from "../components/MindfulBackground";
import { deleteCustomReminder } from "../utils/notificationManager";

const { width } = Dimensions.get("window");
const SECTION_WIDTH = width * 0.9;

const NotificationsPage = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [reminders, setReminders] = useState([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadReminders();
  }, []);

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

  const handleReminderCreated = (newReminder) => {
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

  const handleDeleteReminder = async (reminderId) => {
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

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderReminderCard = ({ item }) => (
    <Animated.View style={[styles.reminderCard, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 255, 255, 0.85)"]}
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
            {item.frequency === "Specific Days" && (
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

  return (
    <MindfulBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.pageTitle}>🔔 Notifications</Text>
              <Text style={styles.pageSubtitle}>
                Manage your mindful reminders
              </Text>
            </View>
          </View>

          {/* Custom Reminders Section */}
          <View style={styles.customRemindersSection}>
            <Text style={styles.sectionTitle}>📝 Your Custom Reminders</Text>
            <Text style={styles.sectionDescription}>
              Personal nudges to stay grounded throughout your day
            </Text>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addButtonText}>➕ Add Custom Reminder</Text>
            </TouchableOpacity>

            <View style={styles.remindersContainer}>
              <FlatList
                data={reminders}
                renderItem={renderReminderCard}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.remindersList}
                maxToRenderPerBatch={3}
                windowSize={3}
              />
            </View>
          </View>
        </View>

        <AddCustomReminderModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={handleReminderCreated}
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
  content: {
    flex: 1,
    paddingTop: 20,
    alignItems: "center",
    width: "100%",
  },
  header: {
    width: SECTION_WIDTH,
    marginBottom: 20,
  },
  headerTextContainer: {
    alignItems: "center",
    marginTop: 48, // Add space for back button
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
    color: "#121111",
    fontWeight: "600",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#121111",
    textAlign: "center",
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: "#121111",
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 24,
  },
  customRemindersSection: {
    width: SECTION_WIDTH,
    backgroundColor: "rgba(255, 253, 233, 0.85)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 253, 233, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 8,
    textAlign: "center",
  },
  sectionDescription: {
    fontSize: 15,
    color: "#121111",
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: "rgba(147, 213, 225, 0.8)",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#121111",
  },
  remindersContainer: {
    maxHeight: 400, // Limit height to enable scrolling
    width: "100%",
  },
  remindersList: {
    flexGrow: 1,
  },
  reminderCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGradient: {
    padding: 16,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reminderEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderMessage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 4,
  },
  reminderDetails: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.7,
    marginBottom: 2,
  },
  reminderDays: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.6,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 20,
    color: "#ff4444",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.6,
    textAlign: "center",
  },
});

export default NotificationsPage;
