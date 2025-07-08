import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getRandomNotification } from "../constants/notificationContent";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Set up notification channel for Android (no effect on iOS)
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("scroll-reminders", {
    name: "Scroll Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
}

// Constants for scroll reminder
const SCROLL_REMINDER_KEY = "scrollReminderFrequency";
const SCROLL_REMINDER_ID = "scroll_reminder";
const DEFAULT_SCROLL_FREQUENCY = 45; // 45 minutes

// Constants for notification toggle
const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";

// Sleep Mode AsyncStorage keys
const SLEEP_MODE_ENABLED = "sleepModeEnabled";
const SLEEP_START_TIME = "sleepStartTime";
const SLEEP_END_TIME = "sleepEndTime";

export const getScrollReminderFrequency = async () => {
  try {
    const frequency = await AsyncStorage.getItem(SCROLL_REMINDER_KEY);
    return frequency ? parseInt(frequency) : DEFAULT_SCROLL_FREQUENCY;
  } catch (error) {
    console.error("Error getting scroll reminder frequency:", error);
    return DEFAULT_SCROLL_FREQUENCY;
  }
};

export const setScrollReminderFrequency = async (minutes) => {
  try {
    console.log(`\n🔄 Updating notification frequency to ${minutes} minutes`);
    await AsyncStorage.setItem(SCROLL_REMINDER_KEY, minutes.toString());

    // Force reschedule to apply new frequency immediately
    console.log("🚀 Force rescheduling notifications with new frequency...");
    await scheduleScrollReminder(minutes, true);

    console.log(
      `✅ Successfully updated notification frequency to ${minutes} minutes`
    );
    return true;
  } catch (error) {
    console.error("Error setting scroll reminder frequency:", error);
    return false;
  }
};

// Schedules the repeating "mindful scrolling" reminder.
// If forceReschedule is false (default) and an identical reminder is already
// scheduled, we keep the existing one – this prevents the timer from resetting
// whenever the app restarts. If forceReschedule is true we always cancel and
// create a fresh schedule (used when the user selects a new interval).
export const scheduleScrollReminder = async (
  minutes = null,
  forceReschedule = false
) => {
  if (Platform.OS !== "ios") {
    console.log("❌ Notifications not supported on this platform");
    return false;
  }

  try {
    console.log("\n📱 Scheduling scroll reminder...");

    // Get the frequency if not provided
    if (!minutes) {
      minutes = await getScrollReminderFrequency();
    }
    if (!minutes) return;

    console.log("⏰ Reminder frequency:", minutes, "minutes");

    // Check for existing scheduled reminders
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    console.log("📋 Existing notifications:", existing.length);

    // Cancel any existing scroll reminders if force reschedule
    if (forceReschedule) {
      console.log(
        "🔄 Force reschedule requested - cancelling existing reminders"
      );
      await Promise.all(
        existing
          .filter((n) => n.identifier.startsWith(SCROLL_REMINDER_ID))
          .map((n) =>
            Notifications.cancelScheduledNotificationAsync(n.identifier)
          )
      );
    } else if (
      existing.some((n) => n.identifier.startsWith(SCROLL_REMINDER_ID))
    ) {
      console.log("⏳ Keeping existing schedule (not forced to reschedule)");
      return true;
    }

    // Check if notifications are enabled
    const notificationsEnabled = await getNotificationsEnabled();
    console.log("📱 Notifications enabled:", notificationsEnabled);
    if (!notificationsEnabled) {
      console.log("❌ Notifications are disabled");
      return false;
    }

    // Check if we're in sleep window
    const inSleepWindow = await isInSleepWindow();
    console.log("😴 In sleep window:", inSleepWindow);

    if (inSleepWindow) {
      console.log("💤 In sleep window - no notifications will be scheduled");
      return true;
    }

    console.log("🌞 Not in sleep window - scheduling notifications");

    // Schedule immediate notification
    const immediateContent = await getRandomNotification();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: immediateContent.title,
        body: immediateContent.body,
        sound: "default",
      },
      trigger: {
        type: "timeInterval",
        seconds: 1,
        repeats: false,
      },
      identifier: `${SCROLL_REMINDER_ID}_first`,
    });

    // Schedule multiple notifications with different content
    const NOTIFICATIONS_TO_SCHEDULE = 12; // Schedule 12 notifications ahead
    const scheduledNotifications = [];

    for (let i = 0; i < NOTIFICATIONS_TO_SCHEDULE; i++) {
      const content = await getRandomNotification();
      const notification = {
        content: {
          title: content.title,
          body: content.body,
          sound: "default",
        },
        trigger: {
          type: "timeInterval",
          seconds: (i + 1) * minutes * 60, // Stagger the notifications
          repeats: false,
        },
        identifier: `${SCROLL_REMINDER_ID}_${i}`,
      };
      scheduledNotifications.push(notification);
    }

    // Schedule all notifications
    await Promise.all(
      scheduledNotifications.map((notification) =>
        Notifications.scheduleNotificationAsync(notification)
      )
    );

    console.log(`\n✅ Successfully scheduled scroll reminders:
    • Interval: ${minutes} minutes
    • Sleep Mode: ${inSleepWindow ? "Active" : "Inactive"}
    • First notification: immediate (1 second)
    • Following notifications: ${NOTIFICATIONS_TO_SCHEDULE} unique reminders scheduled
    `);

    // Verify the schedule was set
    const afterSchedule =
      await Notifications.getAllScheduledNotificationsAsync();
    console.log(
      "📋 Scheduled notifications after setup:",
      afterSchedule.length
    );
    afterSchedule.forEach((notification) => {
      console.log("  •", {
        id: notification.identifier,
        trigger: notification.trigger,
      });
    });

    // Set up a background task to refresh notifications when they're running low
    const remainingNotifications = afterSchedule.filter(
      (n) =>
        n.identifier.startsWith(SCROLL_REMINDER_ID) &&
        n.identifier !== `${SCROLL_REMINDER_ID}_first`
    );

    if (remainingNotifications.length < NOTIFICATIONS_TO_SCHEDULE / 2) {
      console.log("📅 Scheduling refresh of notifications");
      // Force reschedule to generate new set of notifications
      scheduleScrollReminder(minutes, true);
    }

    return true;
  } catch (error) {
    console.error("❌ Error scheduling scroll reminder:", error);
    return false;
  }
};

export const initializeNotifications = async () => {
  if (Platform.OS !== "ios") {
    console.log("❌ Notifications not supported on this platform");
    return false;
  }

  try {
    // Check current settings
    const settings = await Notifications.getPermissionsAsync();
    console.log(
      "\n📱 Current Notification Settings:",
      JSON.stringify(settings, null, 2)
    );

    if (settings.status !== "granted") {
      console.log("🔔 Requesting notification permissions...");
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        console.log("❌ Notification permissions denied");
        return false;
      }
      console.log("✅ Notification permissions granted");
    } else {
      console.log("✅ Notification permissions already granted");
    }

    // Set up notification handler if not already done
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Add notification received handler for debugging
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(
          "\n📬 Notification received:",
          JSON.stringify(notification, null, 2)
        );
      }
    );

    console.log("✅ Notifications initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing notifications:", error);
    return false;
  }
};

export const scheduleReminderNotification = async (reminderData) => {
  if (Platform.OS !== "ios") {
    console.log("Notifications are only supported on iOS");
    return false;
  }

  try {
    const [hours, minutes] = reminderData.time.split(":").map(Number);

    let trigger;
    const identifiers = [];

    switch (reminderData.frequency) {
      case "Once":
        const now = new Date();
        const triggerDate = new Date();
        triggerDate.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (triggerDate <= now) {
          triggerDate.setDate(triggerDate.getDate() + 1);
        }

        trigger = triggerDate;

        const onceId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Mindful Reminder",
            body: `${reminderData.emoji} ${reminderData.message}`,
            sound: "default",
          },
          trigger,
          identifier: reminderData.id,
        });

        identifiers.push(onceId);
        break;

      case "Daily":
        // For daily notifications, we need to schedule for the next occurrence
        const currentTime = new Date();
        const nextDailyTime = new Date();
        nextDailyTime.setHours(hours, minutes, 0, 0);

        // If the time has already passed today, schedule for tomorrow
        if (nextDailyTime <= currentTime) {
          nextDailyTime.setDate(nextDailyTime.getDate() + 1);
        }

        // Schedule the first notification for the next occurrence
        const firstDailyId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Mindful Reminder",
            body: `${reminderData.emoji} ${reminderData.message}`,
            sound: "default",
          },
          trigger: nextDailyTime,
          identifier: reminderData.id,
        });

        identifiers.push(firstDailyId);

        // Schedule a repeating daily notification starting from the day after the first one
        const nextDayTime = new Date(nextDailyTime);
        nextDayTime.setDate(nextDayTime.getDate() + 1);

        const repeatDailyId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Mindful Reminder",
            body: `${reminderData.emoji} ${reminderData.message}`,
            sound: "default",
          },
          trigger: {
            hour: hours,
            minute: minutes,
            repeats: true,
          },
          identifier: `${reminderData.id}_repeat`,
        });

        identifiers.push(repeatDailyId);
        break;

      case "Weekly":
        trigger = {
          weekday: 1, // Monday
          hour: hours,
          minute: minutes,
          repeats: true,
        };

        const weeklyId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Mindful Reminder",
            body: `${reminderData.emoji} ${reminderData.message}`,
            sound: "default",
          },
          trigger,
          identifier: reminderData.id,
        });

        identifiers.push(weeklyId);
        break;

      case "Specific Days":
        const daysOfWeek = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ];

        for (const day of reminderData.selectedDays) {
          const weekdayNumber = daysOfWeek.indexOf(day) + 1;

          const dayId = await Notifications.scheduleNotificationAsync({
            content: {
              title: "Mindful Reminder",
              body: `${reminderData.emoji} ${reminderData.message}`,
              sound: "default",
            },
            trigger: {
              weekday: weekdayNumber,
              hour: hours,
              minute: minutes,
              repeats: true,
            },
            identifier: `${reminderData.id}_${day}`,
          });

          identifiers.push(dayId);
        }
        break;
    }

    console.log("Scheduled notifications with identifiers:", identifiers);
    return identifiers;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return false;
  }
};

export const cancelReminderNotification = async (reminderId) => {
  if (Platform.OS !== "ios") {
    return;
  }

  try {
    // Get all scheduled notifications
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    // Find and cancel notifications that match this reminder
    const notificationsToCancel = scheduledNotifications.filter(
      (notification) =>
        notification.identifier === reminderId ||
        notification.identifier.startsWith(`${reminderId}_`)
    );

    for (const notification of notificationsToCancel) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      );
    }

    console.log(
      `Cancelled ${notificationsToCancel.length} notifications for reminder ${reminderId}`
    );
  } catch (error) {
    console.error("Error cancelling notification:", error);
  }
};

export const getAllCustomReminders = async () => {
  try {
    const reminders = await AsyncStorage.getItem("customReminders");
    return reminders ? JSON.parse(reminders) : [];
  } catch (error) {
    console.error("Error getting custom reminders:", error);
    return [];
  }
};

export const saveCustomReminder = async (reminderData) => {
  try {
    const existingReminders = await getAllCustomReminders();
    existingReminders.push(reminderData);

    await AsyncStorage.setItem(
      "customReminders",
      JSON.stringify(existingReminders)
    );
    console.log("Custom reminder saved:", reminderData);
    return true;
  } catch (error) {
    console.error("Error saving custom reminder:", error);
    return false;
  }
};

export const deleteCustomReminder = async (reminderId) => {
  try {
    const existingReminders = await getAllCustomReminders();
    const updatedReminders = existingReminders.filter(
      (r) => r.id !== reminderId
    );

    await AsyncStorage.setItem(
      "customReminders",
      JSON.stringify(updatedReminders)
    );

    // Also cancel the scheduled notification
    await cancelReminderNotification(reminderId);

    console.log("Custom reminder deleted:", reminderId);
    return updatedReminders;
  } catch (error) {
    console.error("Error deleting custom reminder:", error);
    return false;
  }
};

export const getNotificationsEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return enabled !== "false"; // Default to true if not set
  } catch (error) {
    console.error("Error getting notifications enabled state:", error);
    return true;
  }
};

export const setNotificationsEnabled = async (enabled) => {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled.toString());
    if (!enabled) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } else {
      await scheduleScrollReminder();
    }
  } catch (error) {
    console.error("Error setting notifications enabled state:", error);
  }
};

export const isInSleepWindow = async () => {
  try {
    console.log("\n🔍 Checking sleep window...");

    const sleepEnabled = await AsyncStorage.getItem(SLEEP_MODE_ENABLED);
    console.log("Sleep Mode Enabled:", sleepEnabled);
    if (sleepEnabled !== "true") {
      console.log("❌ Sleep mode is disabled");
      return false;
    }

    const startTime = await AsyncStorage.getItem(SLEEP_START_TIME);
    const endTime = await AsyncStorage.getItem(SLEEP_END_TIME);
    console.log("Sleep Window Settings:", {
      startTime: startTime
        ? new Date(parseInt(startTime)).toLocaleTimeString()
        : "not set",
      endTime: endTime
        ? new Date(parseInt(endTime)).toLocaleTimeString()
        : "not set",
    });

    if (!startTime || !endTime) {
      console.log("❌ Sleep window times not set");
      return false;
    }

    const now = new Date();
    const start = new Date(parseInt(startTime));
    const end = new Date(parseInt(endTime));

    // Set the dates to today to compare only times
    const currentTime = new Date();
    currentTime.setHours(now.getHours(), now.getMinutes(), 0, 0);

    const sleepStart = new Date();
    sleepStart.setHours(start.getHours(), start.getMinutes(), 0, 0);

    const sleepEnd = new Date();
    sleepEnd.setHours(end.getHours(), end.getMinutes(), 0, 0);

    console.log("Time Comparison:", {
      currentTime: currentTime.toLocaleTimeString(),
      sleepStart: sleepStart.toLocaleTimeString(),
      sleepEnd: sleepEnd.toLocaleTimeString(),
    });

    // Handle cases where sleep window crosses midnight
    let isInWindow;
    if (sleepStart > sleepEnd) {
      // If current time is after sleep start OR before sleep end
      isInWindow = currentTime >= sleepStart || currentTime <= sleepEnd;
      console.log("📅 Sleep window crosses midnight");
    } else {
      // If current time is between sleep start and end
      isInWindow = currentTime >= sleepStart && currentTime <= sleepEnd;
      console.log("📅 Sleep window within same day");
    }

    console.log(
      isInWindow ? "😴 Currently in sleep window" : "🌞 Not in sleep window"
    );
    return isInWindow;
  } catch (error) {
    console.error("❌ Error checking sleep window:", error);
    return false;
  }
};

export const scheduleNotification = async (title, body, trigger) => {
  try {
    const notificationsEnabled = await getNotificationsEnabled();
    if (!notificationsEnabled) return null;

    // Check if we're in sleep window
    const inSleepWindow = await isInSleepWindow();
    if (inSleepWindow) return null;

    // Schedule the notification
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
};

// Add a function to handle sleep mode changes
export const handleSleepModeChange = async (enabled, startTime, endTime) => {
  try {
    console.log("\n🔄 Handling sleep mode change:", {
      enabled,
      startTime: new Date(startTime).toLocaleTimeString(),
      endTime: new Date(endTime).toLocaleTimeString(),
    });

    // Save sleep mode settings
    await AsyncStorage.setItem(SLEEP_MODE_ENABLED, enabled.toString());
    await AsyncStorage.setItem(SLEEP_START_TIME, startTime.toString());
    await AsyncStorage.setItem(SLEEP_END_TIME, endTime.toString());

    // Verify settings were saved
    const savedEnabled = await AsyncStorage.getItem(SLEEP_MODE_ENABLED);
    const savedStart = await AsyncStorage.getItem(SLEEP_START_TIME);
    const savedEnd = await AsyncStorage.getItem(SLEEP_END_TIME);

    console.log("✅ Saved sleep mode settings:", {
      enabled: savedEnabled,
      startTime: savedStart
        ? new Date(parseInt(savedStart)).toLocaleTimeString()
        : "not set",
      endTime: savedEnd
        ? new Date(parseInt(savedEnd)).toLocaleTimeString()
        : "not set",
    });

    // Reschedule notifications to respect new sleep window
    const frequency = await getScrollReminderFrequency();
    console.log("📱 Rescheduling notifications with frequency:", frequency);

    await scheduleScrollReminder(frequency, true);

    // Verify current notifications after rescheduling
    const currentNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    console.log(
      "📋 Current scheduled notifications:",
      currentNotifications.length
    );
    currentNotifications.forEach((notification) => {
      console.log("  •", {
        id: notification.identifier,
        trigger: notification.trigger,
      });
    });

    return true;
  } catch (error) {
    console.error("❌ Error handling sleep mode change:", error);
    return false;
  }
};
