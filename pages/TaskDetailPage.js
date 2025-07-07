import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
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
import MindfulBackground from "../components/MindfulBackground";
import TaskCalendarModal from "../components/TaskCalendarModal";
import { getGoalStreak, updateGoalStreak } from "../utils/personalGoalManager";
import { getTaskStreak, updateTaskStreak } from "../utils/preBuiltTaskManager";
import { isTaskCompletedToday, saveTaskCompletion } from "../utils/taskManager";
import { addXP } from "../utils/xpManager";

const { width, height } = Dimensions.get("window");

const PERSONAL_GOALS_KEY = "personal_focus_goals";

const TaskDetailPage = () => {
  const params = useLocalSearchParams();
  const task = JSON.parse(params.task);
  const scrollViewRef = useRef(null);

  const [reflection, setReflection] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [streak, setStreak] = useState({ currentStreak: 0, highestStreak: 0 });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Check if task was already completed today
    checkTodayCompletion();

    // Load streak data for personal goals and pre-built tasks
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    if (task.isPersonal && task.enableStreaks) {
      const streakData = await getGoalStreak(task.id);
      setStreak(streakData);
    } else {
      // For pre-built tasks
      const streakData = await getTaskStreak(task.id);
      setStreak(streakData);
    }
  };

  const checkTodayCompletion = async () => {
    try {
      const completedToday = await isTaskCompletedToday(task.id);
      setIsCompleted(completedToday);
    } catch (error) {
      console.error("Error checking today's completion:", error);
    }
  };

  const handleComplete = async () => {
    try {
      // Save completion
      await saveTaskCompletion(task);

      // Add XP
      await addXP(task.xp);

      // Update streak for personal goals and pre-built tasks
      let updatedStreak;
      if (task.isPersonal && task.enableStreaks) {
        updatedStreak = await updateGoalStreak(task.id);
      } else {
        updatedStreak = await updateTaskStreak(task.id);
      }
      setStreak(updatedStreak);

      // Show reflection if enabled
      if (task.reflectionPrompt) {
        setShowReflection(true);
      } else {
        // If no reflection, show success and go back
        Alert.alert(
          "Task Completed! 🎉",
          `Great job! You earned ${task.xp} XP${
            updatedStreak.currentStreak > 0
              ? `\nCurrent Streak: ${updatedStreak.currentStreak} days 🔥`
              : ""
          }`,
          [
            {
              text: "View Progress",
              onPress: () => setShowCalendar(true),
              style: "default",
            },
            {
              text: "Done",
              onPress: () => router.back(),
              style: "cancel",
            },
          ]
        );
      }

      setIsCompleted(true);
    } catch (error) {
      console.error("Error completing task:", error);
      Alert.alert("Error", "Could not complete the task. Please try again.");
    }
  };

  const handleReflectionSubmit = async () => {
    if (reflection.trim().length === 0) {
      Alert.alert(
        "Add Reflection",
        "Please write a short reflection to continue."
      );
      return;
    }

    Alert.alert(
      "Task Completed! 🎉",
      `Great job! You earned ${task.xp} XP${
        streak.currentStreak > 0
          ? `\nCurrent Streak: ${streak.currentStreak} days 🔥`
          : ""
      }`,
      [
        {
          text: "View Progress",
          onPress: () => setShowCalendar(true),
          style: "default",
        },
        {
          text: "Done",
          onPress: () => router.back(),
          style: "cancel",
        },
      ]
    );
  };

  const handleReflectionFocus = () => {
    // Simple approach: scroll to bottom with a delay to ensure keyboard appears
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 300);
  };

  const handleReflectionToggle = () => {
    setShowReflection(!showReflection);

    // If opening reflection section, scroll to it after a brief delay
    if (!showReflection) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 200);
    }
  };

  const handleMarkDone = async () => {
    if (isCompleted) {
      Alert.alert(
        "Already Completed! ✅",
        "You've already completed this task today. Great job staying consistent!",
        [{ text: "OK", onPress: () => {} }]
      );
      return;
    }

    try {
      console.log(
        "[TaskDetail] Marking task as done:",
        task.name,
        "XP:",
        task.xp
      );

      // Save task completion with reflection
      await saveTaskCompletion(task);
      console.log("[TaskDetail] Task completion saved");

      // Also add XP to the global system
      await addXP(task.xp);
      console.log("[TaskDetail] XP added successfully");

      // Update streak for personal goals and pre-built tasks
      let updatedStreak;
      if (task.isPersonal && task.enableStreaks) {
        updatedStreak = await updateGoalStreak(task.id);
      } else {
        updatedStreak = await updateTaskStreak(task.id);
      }
      setStreak(updatedStreak);

      setIsCompleted(true);

      Alert.alert(
        "Well Done! 🎉",
        `You've earned ${task.xp} XP for completing "${task.name}"!${
          updatedStreak.currentStreak > 0
            ? `\nCurrent Streak: ${updatedStreak.currentStreak} days 🔥`
            : ""
        }\n\nYour mindful practice is building momentum.`,
        [
          {
            text: "Continue",
            onPress: () => {
              // Navigate back to refresh parent page
              router.back();
            },
            style: "default",
          },
        ]
      );

      // Clear reflection after successful completion
      setReflection("");
      setShowReflection(false);
    } catch (error) {
      console.error("[TaskDetail] Error completing task:", error);
      Alert.alert("Error", "Could not complete the task. Please try again.", [
        { text: "OK", onPress: () => {} },
      ]);
    }
  };

  const handleSaveReflection = () => {
    if (!reflection.trim()) {
      Alert.alert(
        "Empty Reflection",
        "Please write something about your experience."
      );
      return;
    }

    Alert.alert(
      "Reflection Saved 📝",
      "Your reflection will be saved when you complete the task.",
      [
        {
          text: "Got it",
          onPress: () => {},
        },
      ]
    );
  };

  const handleDeleteGoal = async () => {
    Alert.alert(
      "Delete Goal? ⚠️",
      `Are you sure you want to delete "${task.name}"?\n\nThis action cannot be undone and will remove all progress data for this goal.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Load current goals
              const stored = await AsyncStorage.getItem(PERSONAL_GOALS_KEY);
              const goals = stored ? JSON.parse(stored) : [];

              // Remove the goal with matching ID
              const updatedGoals = goals.filter((goal) => goal.id !== task.id);

              // Save back to storage
              await AsyncStorage.setItem(
                PERSONAL_GOALS_KEY,
                JSON.stringify(updatedGoals)
              );

              Alert.alert(
                "Goal Deleted",
                `"${task.name}" has been removed from your Focus Goals.`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      router.back();
                    },
                  },
                ]
              );
            } catch (error) {
              console.error("Error deleting goal:", error);
              Alert.alert(
                "Error",
                "Could not delete the goal. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "High Energy":
        return "#FFE37D";
      case "Low Energy":
        return "#93D5E1";
      case "Spiritual":
        return "#F4D8FE";
      case "Wellness":
        return "#F3FBCB";
      case "Fitness":
        return "#FFE37D";
      case "Cognitive":
        return "#93D5E1";
      default:
        return "#F3FBCB";
    }
  };

  return (
    <MindfulBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Hero Banner */}
            <View style={styles.heroSection}>
              {task.image ? (
                <Image source={task.image} style={styles.heroImage} />
              ) : (
                <View style={[styles.heroImage, styles.personalGoalHero]}>
                  <Text style={styles.personalGoalHeroIcon}>🎯</Text>
                  <Text style={styles.personalGoalHeroText}>Personal Goal</Text>
                </View>
              )}
              <View style={styles.heroOverlay}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={() => setShowCalendar(true)}
                >
                  <Text style={styles.calendarButtonText}>📅</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Task Info */}
              <View style={styles.taskHeader}>
                <View style={styles.titleRow}>
                  <Text style={styles.taskTitle}>{task.name}</Text>
                  {task.isPersonal ? (
                    <TouchableOpacity
                      style={styles.deleteIconButton}
                      onPress={handleDeleteGoal}
                    >
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: getCategoryColor(task.category) },
                      ]}
                    >
                      <Text style={styles.categoryText}>{task.category}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.taskDescription}>{task.description}</Text>

                <View style={styles.metaInfo}>
                  <View style={styles.frequencyContainer}>
                    <Text style={styles.frequencyLabel}>Frequency:</Text>
                    <Text style={styles.frequencyValue}>{task.frequency}</Text>
                  </View>
                  <View style={styles.xpContainer}>
                    <Text style={styles.xpText}>💫 +{task.xp} XP</Text>
                  </View>
                </View>
              </View>

              {/* How to Do This Task */}
              <View style={styles.tipsSection}>
                <Text style={styles.sectionTitle}>How to Do This Task</Text>
                <View style={styles.tipsCard}>
                  <Text style={styles.tipsText}>{task.tips}</Text>
                </View>
              </View>

              {/* Completion Status */}
              {isCompleted && (
                <View style={styles.completedBanner}>
                  <Text style={styles.completedBannerText}>
                    ✅ Completed today! Come back tomorrow to continue your
                    streak.
                  </Text>
                </View>
              )}

              {/* Reflection Section - Show even if completed for viewing */}
              <View style={styles.reflectionSection}>
                <TouchableOpacity
                  style={styles.reflectionToggle}
                  onPress={handleReflectionToggle}
                  disabled={isCompleted}
                >
                  <Text
                    style={[
                      styles.reflectionToggleText,
                      isCompleted && styles.disabledText,
                    ]}
                  >
                    📝 {showReflection ? "Hide" : "Add"} Reflection{" "}
                    {isCompleted ? "(View Only)" : "(Optional)"}
                  </Text>
                  <Text
                    style={[
                      styles.reflectionToggleIcon,
                      isCompleted && styles.disabledText,
                    ]}
                  >
                    {showReflection ? "▲" : "▼"}
                  </Text>
                </TouchableOpacity>

                {showReflection && (
                  <View style={styles.reflectionInput}>
                    <Text
                      style={[
                        styles.reflectionLabel,
                        isCompleted && styles.disabledText,
                      ]}
                    >
                      {isCompleted
                        ? "Add your reflection when completing the task:"
                        : "How will this task make you feel? Any insights?"}
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        isCompleted && styles.disabledTextInput,
                      ]}
                      multiline
                      numberOfLines={4}
                      placeholder={
                        isCompleted
                          ? "Complete the task to add reflection..."
                          : "Write your thoughts here..."
                      }
                      placeholderTextColor="rgba(18, 17, 17, 0.5)"
                      value={reflection}
                      onChangeText={setReflection}
                      textAlignVertical="top"
                      editable={!isCompleted}
                      onFocus={handleReflectionFocus}
                      blurOnSubmit={false}
                      returnKeyType="done"
                    />
                    {!isCompleted && (
                      <TouchableOpacity
                        style={styles.saveReflectionButton}
                        onPress={handleSaveReflection}
                      >
                        <Text style={styles.saveReflectionText}>
                          Save Draft
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Mark Done Button */}
              <View style={styles.actionSection}>
                <TouchableOpacity
                  style={[
                    styles.markDoneButton,
                    isCompleted && styles.completedButton,
                  ]}
                  onPress={handleMarkDone}
                >
                  <Text
                    style={[
                      styles.markDoneText,
                      isCompleted && styles.completedText,
                    ]}
                  >
                    {isCompleted ? "✅ Completed Today!" : "Mark as Done"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomSpacing} />
            </ScrollView>
          </Animated.View>

          {/* Task Calendar Modal */}
          <TaskCalendarModal
            visible={showCalendar}
            onClose={() => setShowCalendar(false)}
            task={task}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </MindfulBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    height: height * 0.35,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  personalGoalHero: {
    backgroundColor: "rgba(243, 251, 203, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  personalGoalHeroIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  personalGoalHeroText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.7,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  calendarButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 44,
    alignItems: "center",
  },
  calendarButtonText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Increased padding for keyboard space
  },
  taskHeader: {
    paddingTop: 24,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#121111",
    flex: 1,
    marginRight: 12,
    lineHeight: 30,
  },
  categoryBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
  },
  taskDescription: {
    fontSize: 16,
    color: "#121111",
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  frequencyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  frequencyLabel: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.7,
    marginRight: 8,
  },
  frequencyValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    backgroundColor: "#93D5E1",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpContainer: {
    backgroundColor: "#FFE37D",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  xpText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
  },
  tipsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  tipsCard: {
    backgroundColor: "rgba(243, 251, 203, 0.8)",
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#93D5E1",
  },
  tipsText: {
    fontSize: 16,
    color: "#121111",
    lineHeight: 24,
    opacity: 0.9,
  },
  completedBanner: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  completedBannerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    textAlign: "center",
  },
  actionSection: {
    marginBottom: 24,
  },
  markDoneButton: {
    backgroundColor: "#93D5E1",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  completedButton: {
    backgroundColor: "#4CAF50",
  },
  markDoneText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    letterSpacing: 0.5,
  },
  completedText: {
    color: "#FFFFFF",
  },
  reflectionSection: {
    marginBottom: 20,
  },
  reflectionToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(244, 216, 254, 0.6)",
    borderRadius: 16,
    padding: 16,
  },
  reflectionToggleText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#121111",
  },
  reflectionToggleIcon: {
    fontSize: 16,
    color: "#121111",
    opacity: 0.7,
  },
  disabledText: {
    opacity: 0.5,
  },
  reflectionInput: {
    marginTop: 16,
  },
  reflectionLabel: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.8,
    marginBottom: 12,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#121111",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "rgba(147, 213, 225, 0.3)",
    marginBottom: 16,
  },
  disabledTextInput: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    color: "rgba(18, 17, 17, 0.5)",
  },
  saveReflectionButton: {
    backgroundColor: "#F4D8FE",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveReflectionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  bottomSpacing: {
    height: 40,
  },
  deleteIconButton: {
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  deleteIcon: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.8,
    marginTop: 4,
  },
});

export default TaskDetailPage;
