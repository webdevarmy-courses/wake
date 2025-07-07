import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import notificationManager from "../utils/notificationManager";

const RemindersList = ({ refreshTrigger }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, [refreshTrigger]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const savedReminders = await notificationManager.getReminders();
      setReminders(savedReminders);
    } catch (error) {
      console.error("Error loading reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReminder = async (reminderId, currentStatus) => {
    try {
      const success = await notificationManager.toggleReminder(
        reminderId,
        !currentStatus
      );
      if (success) {
        setReminders((prev) =>
          prev.map((reminder) =>
            reminder.id === reminderId
              ? { ...reminder, isActive: !currentStatus }
              : reminder
          )
        );
      }
    } catch (error) {
      console.error("Error toggling reminder:", error);
      Alert.alert("Error", "Failed to update reminder status.");
    }
  };

  const handleDeleteReminder = (reminder) => {
    Alert.alert(
      "Delete Reminder",
      `Are you sure you want to delete "${reminder.message}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await notificationManager.deleteReminder(
                reminder.id
              );
              if (success) {
                setReminders((prev) =>
                  prev.filter((r) => r.id !== reminder.id)
                );
              }
            } catch (error) {
              console.error("Error deleting reminder:", error);
              Alert.alert("Error", "Failed to delete reminder.");
            }
          },
        },
      ]
    );
  };

  const formatTime = (timeString) => {
    return notificationManager.formatReminderTime(timeString);
  };

  const formatFrequency = (frequency, specificDays) => {
    return notificationManager.formatReminderFrequency(frequency, specificDays);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading reminders...</Text>
      </View>
    );
  }

  if (reminders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔕</Text>
        <Text style={styles.emptyTitle}>No Reminders Yet</Text>
        <Text style={styles.emptyDescription}>
          Tap "Add Custom Reminder" to create your first mindful reminder.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.listTitle}>Your Reminders ({reminders.length})</Text>

      {reminders.map((reminder) => (
        <View key={reminder.id} style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderEmoji}>{reminder.emoji}</Text>
              <View style={styles.reminderText}>
                <Text style={styles.reminderMessage} numberOfLines={2}>
                  {reminder.message}
                </Text>
                <Text style={styles.reminderDetails}>
                  {formatTime(reminder.time)} •{" "}
                  {formatFrequency(reminder.frequency, reminder.specificDays)}
                </Text>
              </View>
            </View>

            <Switch
              value={reminder.isActive}
              onValueChange={(value) =>
                handleToggleReminder(reminder.id, reminder.isActive)
              }
              trackColor={{ false: "#E5E7EB", true: "#DBEAFE" }}
              thumbColor={reminder.isActive ? "#3B82F6" : "#9CA3AF"}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteReminder(reminder)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 16,
  },
  reminderCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  reminderInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 12,
  },
  reminderEmoji: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  reminderText: {
    flex: 1,
  },
  reminderMessage: {
    fontSize: 16,
    fontWeight: "500",
    color: "#121111",
    marginBottom: 4,
    lineHeight: 22,
  },
  reminderDetails: {
    fontSize: 13,
    color: "#666",
    fontWeight: "400",
  },
  deleteButton: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },
});

export default RemindersList;
