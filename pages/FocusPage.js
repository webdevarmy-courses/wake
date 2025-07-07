import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MindfulBackground from "../components/MindfulBackground";
import XPRulesModal from "../components/XPRulesModal";
import { getGoalStreak } from "../utils/personalGoalManager";
import { getTaskStreak } from "../utils/preBuiltTaskManager";
import { isTaskCompletedToday } from "../utils/taskManager";
import { getTodaysXP } from "../utils/xpManager";

const { width } = Dimensions.get("window");

const PERSONAL_GOALS_KEY = "personal_focus_goals";

// Pre-built tasks data
const preBuiltTasks = [
  {
    id: "coldShower",
    name: "Mindful Cold Shower",
    category: "High Energy",
    frequency: "3x/week",
    description: "Wake up your senses with presence",
    xp: 8,
    image: require("../assets/preBuiltTasks/coldShower.png"),
    tips: "Start with 30 seconds of cold water at the end of your shower. Focus on your breath and embrace the sensation mindfully.",
  },
  {
    id: "flowMovement",
    name: "Flow Movement",
    category: "High Energy",
    frequency: "Daily",
    description: "Move mindfully with yoga or stretching",
    xp: 5,
    image: require("../assets/preBuiltTasks/flowMovement.png"),
    tips: "Spend 10-15 minutes moving your body with intention. Focus on the connection between breath and movement.",
  },
  {
    id: "readReflect",
    name: "Read & Reflect",
    category: "Low Energy",
    frequency: "Daily",
    description: "Spend 30 focused minutes reading",
    xp: 6,
    image: require("../assets/preBuiltTasks/readReflect.png"),
    tips: "Choose a book that inspires or educates you. Read without distractions and reflect on what you've learned.",
  },
  {
    id: "stillnessBreak",
    name: "Stillness Break",
    category: "Low Energy",
    frequency: "2x/week",
    description: "Sit in silence, let thoughts pass",
    xp: 7,
    image: require("../assets/preBuiltTasks/stillnessBreak.png"),
    tips: "Find a quiet space and sit comfortably for 10-15 minutes. Observe your thoughts without judgment.",
  },
  {
    id: "boxBreathing",
    name: "Deep Box Breathing",
    category: "Low Energy",
    frequency: "Daily",
    description: "Practice 4-4-4-4 box breathing",
    xp: 4,
    image: require("../assets/preBuiltTasks/boxBreathing.png"),
    tips: "Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat this cycle 10 times with full attention.",
  },
  {
    id: "natureWalk",
    name: "Soulful Nature Walk",
    category: "Spiritual",
    frequency: "Weekly",
    description: "Recharge in nature with intention",
    xp: 10,
    image: require("../assets/preBuiltTasks/soulfulNatureWalk.png"),
    tips: "Walk slowly in nature for 20-30 minutes. Notice the sounds, smells, and sights around you with full presence.",
  },
  {
    id: "sunlightRitual",
    name: "Sunlight Ritual",
    category: "Wellness",
    frequency: "Daily",
    description: "Get 10 minutes of morning sunlight",
    xp: 3,
    image: require("../assets/preBuiltTasks/sunlightRitual.png"),
    tips: "Step outside within the first hour of waking. Feel the warmth on your skin and set an intention for the day.",
  },
  {
    id: "mindfulPushups",
    name: "Mindful Push-ups",
    category: "Fitness",
    frequency: "3x/week",
    description: "Strengthen with awareness",
    xp: 5,
    image: require("../assets/preBuiltTasks/mindfulPushups.png"),
    tips: "Do 10-20 push-ups with complete focus on form and breath. Quality over quantity, presence over performance.",
  },
  {
    id: "digitalDetox",
    name: "Mini Digital Detox",
    category: "Wellness",
    frequency: "2x/week",
    description: "Stay off-screen for 30+ mins",
    xp: 6,
    image: require("../assets/preBuiltTasks/digitalDetox.png"),
    tips: "Turn off all devices for at least 30 minutes. Use this time for reflection, journaling, or being present.",
  },
  {
    id: "learnGrow",
    name: "Learn & Grow",
    category: "Cognitive",
    frequency: "Weekly",
    description: "Spend 30 minutes learning something new",
    xp: 8,
    image: require("../assets/preBuiltTasks/learnNgrow.png"),
    tips: "Choose a topic that genuinely interests you. Take notes and reflect on how this knowledge can enhance your life.",
  },
];

const FocusPage = () => {
  const [personalGoals, setPersonalGoals] = useState([]);
  const [taskCompletionStatus, setTaskCompletionStatus] = useState({});
  const [currentXP, setCurrentXP] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const isFocused = useIsFocused();

  const loadTodaysXP = async () => {
    try {
      console.log("[FocusPage] Loading todays XP...");
      const todaysXP = await getTodaysXP();
      console.log("[FocusPage] Loaded todays XP:", todaysXP);
      setCurrentXP(todaysXP);
    } catch (error) {
      console.error("Error loading today's XP:", error);
    }
  };

  const loadPersonalGoals = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PERSONAL_GOALS_KEY);
      const goals = stored ? JSON.parse(stored) : [];
      setPersonalGoals(goals);
    } catch (error) {
      console.error("Error loading personal goals:", error);
    }
  }, []);

  const loadCompletionStatuses = useCallback(async () => {
    try {
      const statuses = {};

      // Check pre-built tasks
      for (const task of preBuiltTasks) {
        statuses[task.id] = await isTaskCompletedToday(task.id);
      }

      // Check personal goals
      for (const goal of personalGoals) {
        statuses[goal.id] = await isTaskCompletedToday(goal.id);
      }

      setTaskCompletionStatus(statuses);
    } catch (error) {
      console.error("Error loading completion statuses:", error);
    }
  }, [personalGoals]);

  useFocusEffect(
    useCallback(() => {
      loadPersonalGoals();
    }, [loadPersonalGoals])
  );

  useFocusEffect(
    useCallback(() => {
      loadCompletionStatuses();
    }, [loadCompletionStatuses])
  );

  // Load XP whenever the page gains focus
  useFocusEffect(
    useCallback(() => {
      loadTodaysXP();
    }, [])
  );

  // Also refresh when the tab comes into focus
  useEffect(() => {
    if (isFocused) {
      console.log("[FocusPage] Tab focused, refreshing XP and statuses...");
      loadTodaysXP();
      loadCompletionStatuses();
    }
  }, [isFocused, loadCompletionStatuses]);

  const handleTaskPress = (task) => {
    router.push({
      pathname: "/TaskDetail",
      params: { task: JSON.stringify(task) },
    });
  };

  const handlePersonalGoalPress = (goal) => {
    // Convert personal goal to task format
    const taskData = {
      ...goal,
      isPersonal: true,
      image: null, // Personal goals don't have images
      tips: goal.description || "Complete this personal goal mindfully.",
    };
    router.push({
      pathname: "/TaskDetail",
      params: { task: JSON.stringify(taskData) },
    });
  };

  const handleJarPress = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <MindfulBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Build a Focus Ritual</Text>
            <Text style={styles.subtitle}>
              Pick small intentional habits to level up your day
            </Text>
          </View>

          {/* Goals Section */}
          <View style={styles.goalsSection}>
            <Text style={styles.sectionTitle}>Your Focus Goals</Text>

            {/* Personal Goals */}
            {personalGoals.map((goal) => (
              <PersonalGoalCard
                key={goal.id}
                goal={goal}
                isCompleted={taskCompletionStatus[goal.id] || false}
                onPress={() => handlePersonalGoalPress(goal)}
              />
            ))}

            {/* Add Goal Card */}
            <TouchableOpacity
              style={styles.addGoalCard}
              onPress={() => router.push("/CreateFocusGoal")}
            >
              <Text style={styles.addIcon}>➕</Text>
              <Text style={styles.addGoalText}>Add a Personal Focus Goal</Text>
            </TouchableOpacity>
          </View>

          {/* Pre-Built Tasks Section */}
          <View style={styles.preBuiltSection}>
            <Text style={styles.sectionTitle}>Try These Today</Text>
            <View style={styles.tasksGrid}>
              {preBuiltTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isCompleted={taskCompletionStatus[task.id] || false}
                  onPress={() => handleTaskPress(task)}
                />
              ))}
            </View>
          </View>

          {/* XP Jar */}
          {/* <XPJar currentXP={currentXP} onPress={handleJarPress} /> */}

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* XP Rules Modal */}
        <XPRulesModal visible={modalVisible} onClose={handleModalClose} />
      </SafeAreaView>
    </MindfulBackground>
  );
};

// Task Card Component
const TaskCard = ({ task, isCompleted, onPress }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [streak, setStreak] = useState({ currentStreak: 0, highestStreak: 0 });

  useEffect(() => {
    loadStreak();
  }, [isCompleted]);

  const loadStreak = async () => {
    const streakData = await getTaskStreak(task.id);
    setStreak(streakData);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.taskCard,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.taskCardTouch}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {/* XP Badge */}
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>💫 +{task.xp} XP</Text>
        </View>

        {/* Streak Badge */}
        {streak.currentStreak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>
              🔥 {streak.currentStreak}
            </Text>
          </View>
        )}

        {/* Task Image */}
        <View style={styles.imageContainer}>
          <Image source={task.image} style={styles.taskImage} />
        </View>

        {/* Task Info */}
        <View style={styles.taskInfo}>
          <Text style={styles.taskName}>{task.name}</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>

          {/* Frequency Pill */}
          <View style={styles.frequencyPill}>
            <Text style={styles.frequencyText}>{task.frequency}</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.doNowButton, isCompleted && styles.completedButton]}
            onPress={onPress}
          >
            <Text
              style={[
                styles.doNowButtonText,
                isCompleted && styles.completedButtonText,
              ]}
            >
              {isCompleted ? "✅ Done for today" : "Do Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Personal Goal Card Component
const PersonalGoalCard = ({ goal, isCompleted, onPress }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [streak, setStreak] = useState({ currentStreak: 0, highestStreak: 0 });

  useEffect(() => {
    if (goal.enableStreaks) {
      loadStreakData();
    }
  }, [goal.id, isCompleted]);

  const loadStreakData = async () => {
    const streakData = await getGoalStreak(goal.id);
    setStreak(streakData);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.personalGoalCard,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.personalGoalContent}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {/* XP Badge */}
        <View style={styles.personalGoalXpBadge}>
          <Text style={styles.personalGoalXpText}>💫 +{goal.xp} XP</Text>
        </View>

        <View style={styles.personalGoalInfo}>
          <Text style={styles.personalGoalName}>{goal.name}</Text>
          {goal.description ? (
            <Text style={styles.personalGoalDescription}>
              {goal.description}
            </Text>
          ) : null}

          <View style={styles.personalGoalMetaRow}>
            {/* Frequency Pill */}
            <View style={styles.personalGoalFrequencyPill}>
              <Text style={styles.personalGoalFrequencyText}>
                {goal.frequency}
              </Text>
            </View>

            {/* Features */}
            {(goal.enableStreaks || goal.reflectionPrompt) && (
              <View style={styles.personalGoalFeatures}>
                {goal.enableStreaks && (
                  <View style={styles.streakContainer}>
                    <Text style={styles.personalGoalFeature}>
                      🔥 {streak.currentStreak}
                    </Text>
                    {streak.highestStreak > streak.currentStreak && (
                      <Text style={styles.bestStreakText}>
                        Best: {streak.highestStreak}
                      </Text>
                    )}
                  </View>
                )}
                {goal.reflectionPrompt && (
                  <Text style={styles.personalGoalFeature}>📝</Text>
                )}
              </View>
            )}
          </View>

          {/* Action Button */}
          <View
            style={[
              styles.personalGoalButtonContainer,
              isCompleted && styles.completedPersonalGoalButton,
            ]}
          >
            <Text
              style={[
                styles.personalGoalButtonText,
                isCompleted && styles.completedPersonalGoalButtonText,
              ]}
            >
              {isCompleted ? "✅ Done for today" : "Start Goal"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerSection: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#121111",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#121111",
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  goalsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  addGoalCard: {
    backgroundColor: "rgba(244, 216, 254, 0.6)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(147, 213, 225, 0.3)",
    borderStyle: "dashed",
    marginBottom: 8,
  },
  addIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  addGoalText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#121111",
    opacity: 0.8,
  },
  preBuiltSection: {
    marginBottom: 20,
  },
  tasksGrid: {
    gap: 16,
  },
  taskCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 16,
  },
  taskCardTouch: {
    position: "relative",
  },
  xpBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FFE37D",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
  },
  imageContainer: {
    height: 160,
    overflow: "hidden",
  },
  taskImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  taskInfo: {
    padding: 20,
    paddingTop: 16,
  },
  taskName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 20,
  },
  frequencyPill: {
    backgroundColor: "#93D5E1",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#121111",
  },
  doNowButton: {
    backgroundColor: "#93D5E1",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  doNowButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
    letterSpacing: 0.3,
  },
  bottomSpacing: {
    height: 40,
  },
  personalGoalCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 16,
  },
  personalGoalContent: {
    position: "relative",
  },
  personalGoalXpBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FFE37D",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  personalGoalXpText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
  },
  personalGoalInfo: {
    padding: 20,
    paddingTop: 16,
  },
  personalGoalName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 6,
  },
  personalGoalDescription: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 20,
  },
  personalGoalMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  personalGoalFrequencyPill: {
    backgroundColor: "#93D5E1",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginRight: 16,
  },
  personalGoalFrequencyText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#121111",
  },
  personalGoalFeatures: {
    flexDirection: "row",
    alignItems: "center",
  },
  personalGoalFeature: {
    fontSize: 12,
    fontWeight: "500",
    color: "#121111",
    marginLeft: 4,
  },
  personalGoalButtonContainer: {
    backgroundColor: "#93D5E1",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  personalGoalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
    letterSpacing: 0.3,
  },
  completedButton: {
    backgroundColor: "#4CAF50",
  },
  completedButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  completedPersonalGoalButton: {
    backgroundColor: "#4CAF50",
  },
  completedPersonalGoalButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  bestStreakText: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.6,
    marginLeft: 4,
  },
  streakBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255, 69, 0, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  streakBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default FocusPage;
