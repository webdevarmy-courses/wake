import useRevenueCat from "@/hooks/useRevenueCat";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Purchases from "react-native-purchases";

const { width, height } = Dimensions.get("window");

// Feature preview content with app-like visuals
const featurePreviewData = {
  "Mindful Notifications": {
    visual: "notification",
    title: "Mindful Notifications",
    subtitle: "Gentle interruptions that bring you back to the present",
    benefits: [
      "40+ unique mindful messages",
      "Smart timing based on usage", 
      "Sleep mode - no nighttime disruptions",
      "Variety prevents notification fatigue"
    ],
    preview: {
      appName: "Wake Scroll",
      notificationTitle: "Gentle Reminder",
      notificationBody: "🧘‍♀️ Just checking in — are you scrolling with purpose or out of habit?",
      time: "2:34 PM",
      date: "now"
    }
  },
  "Anti-Doomscrolling Timer": {
    visual: "timer",
    title: "Screen-Free Timer",
    subtitle: "Set focused work sessions without digital distractions",
    benefits: [
      "10, 15, or 40 minute preset options",
      "Beautiful animated timer interface",
      "Floating leaves & encouraging messages",
      "Progress tracking & XP rewards"
    ],
    preview: {
      timeLeft: "12:45",
      totalTime: "15:00",
      progress: 0.15,
      selectedMinutes: 15,
      encouragementText: "Enjoy the world around you.\nWe'll see you soon.",
      todaysCount: 3
    }
  },
  "Progress Tracking": {
    visual: "chart",
    title: "XP Journey & Analytics",
    subtitle: "Track your progress with detailed stats and insights",
    benefits: [
      "Daily XP tracking with 7-day graphs",
      "Catch Me Scrolling analytics",
      "Weekly progress comparisons", 
      "Activity streak monitoring"
    ],
    preview: {
      todayXP: 45,
      weeklyTaps: [0, 3, 5, 2, 7, 4, 6],
      totalTaps: 127,
      weeklyImprovement: "+23%",
      currentStreak: 8
    }
  },
  "Prebuilt Growth Tasks": {
    visual: "tasks",
    title: "Science-Backed Growth Tasks",
    subtitle: "10 proven habits to transform your life",
    benefits: [
      "Mindful cold showers & flow movement",
      "Reading, reflection & stillness breaks",
      "Nature walks & breathing exercises",
      "XP rewards & streak tracking"
    ],
    preview: {
      taskName: "Mindful Cold Shower",
      taskDescription: "Wake up your senses with presence",
      category: "High Energy",
      frequency: "3x/week",
      xp: 8,
      isCompleted: false,
      streak: 3
    }
  },
  "Mood & Reflection Logs": {
    visual: "mood",
    title: "Quick Journal & Mood Tracking",
    subtitle: "Capture thoughts & emotions with simple logging",
    benefits: [
      "5 mood options: Calm, Confused, Frustrated, Grateful, Overwhelmed",
      "500-character quick journal entries",
      "Daily entry tracking & streaks",
      "Visual calendar & progress history"
    ],
    preview: {
      selectedMood: "😄",
      moodLabel: "Grateful",
      journalText: "Had a productive morning with mindful breathing. Feeling centered and ready for the day ahead...",
      todaysEntries: 2,
      characterCount: 89
    }
  },
  "Mindful Exercises": {
    visual: "breathing",
    title: "Guided Mindfulness",
    subtitle: "Breathing, meditation, and focus exercises",
    benefits: [
      "4-7-8 breathing technique",
      "Box breathing patterns",
      "Guided meditations",
      "Focus restoration drills"
    ],
    preview: {
      exercise: "Box Breathing",
      phase: "Inhale",
      count: 4,
      round: "3 of 5"
    }
  },
  "Calendar Heatmaps": {
    visual: "calendar",
    title: "Visual Habit Calendar",
    subtitle: "See your consistency at a glance",
    benefits: [
      "Color-coded activity",
      "Streak visualization",
      "Monthly overviews",
      "Pattern recognition"
    ],
    preview: {
      month: "September 2025",
      streakDays: 18,
      completionRate: "94%",
      bestWeek: "Week 2"
    }
  },
  "Streak XP System": {
    visual: "xp",
    title: "Gamified Progress",
    subtitle: "Level up your life with XP and rewards",
    benefits: [
      "Daily XP rewards",
      "Level progression",
      "Achievement badges",
      "Milestone celebrations"
    ],
    preview: {
      currentXP: 2847,
      nextLevel: 3000,
      level: 12,
      todayXP: "+120 XP"
    }
  },
  "Quick Journal": {
    visual: "journal",
    title: "Instant Thought Capture",
    subtitle: "Capture insights and reflections in moments of clarity",
      benefits: [
        "5 mood options: Calm, Confused, Frustrated, Grateful, Overwhelmed",
        "500-character quick entries",
        "Daily entry tracking & streaks",
        "Simple, distraction-free writing"
      ],
    preview: {
      entryTitle: "Morning Breakthrough",
      entryText: "Realized that my morning routine sets the tone for everything...",
      mood: "✨",
      moodLabel: "Inspired",
      timestamp: "Today, 7:23 AM",
      wordCount: 156
    }
  },
  "Reflect Card": {
    visual: "reflect",
    title: "Guided Self-Reflection",
    subtitle: "Deep prompts for meaningful self-awareness and growth",
    benefits: [
      "Daily reflection prompts",
      "Guided questions",
      "Progress insights",
      "Mindful journaling"
    ],
    preview: {
      promptTitle: "Evening Reflection",
      question: "What challenged you most today, and how did you overcome it?",
      category: "Growth",
      difficulty: "Medium",
      timeEstimate: "3-5 min",
      streak: 12
    }
  },
  "Catch Me Scrolling": {
    visual: "catchscroll",
    title: "Catch Me Scrolling",
    subtitle: "Instant awareness when you need it most",
    benefits: [
      "Smart detection",
      "Gentle interruptions",
      "Mindful moments",
      "Usage awareness"
    ],
    preview: {
      triggerText: "Caught in the scroll?",
      subText: "You've been scrolling for 8 minutes",
      options: ["Take a breath", "Set a timer", "Continue mindfully", "Exit app"],
      todayInterruptions: 7,
      timesSaved: "2h 15m"
    }
  },
  "Focus Goals": {
    visual: "focusgoals",
    title: "Personal Achievement Tracking",
    subtitle: "Set and track meaningful goals with accountability",
    benefits: [
      "Custom goal creation",
      "Progress tracking",
      "Milestone celebrations",
      "Accountability features"
    ],
    preview: {
      currentGoal: "Read 20 minutes daily",
      goalType: "Daily Habit",
      progress: 0.75,
      streak: 18,
      targetDays: 30,
      completedDays: 22,
      todayStatus: "Completed",
      nextMilestone: "25 days"
    }
  }
};

// Comprehensive feature list for Wake Scroll
const features = [
  {
    emoji: "🔔",
    title: "Mindful Notifications",
    description: "Gentle nudges to stop doomscrolling and reset your mind",
    category: "Mindfulness"
  },
  {
    emoji: "📵",
    title: "Anti-Doomscrolling Timer",
    description: "Smart timers to control usage and build healthy habits",
    category: "Time Control"
  },
  {
    emoji: "📊", 
    title: "Progress Tracking",
    description: "Detailed analytics of your habits and behavior patterns",
    category: "Analytics"
  },
  {
    emoji: "🌱",
    title: "Prebuilt Growth Tasks", 
    description: "10 science-backed habits: Cold Showers, Digital Detox, and more",
    category: "Habits"
  },
  {
    emoji: "😊",
    title: "Mood & Reflection Logs",
    description: "Track your feelings daily and see what improves your wellbeing",
    category: "Wellness"
  },
  {
    emoji: "🧘",
    title: "Mindful Exercises",
    description: "Guided breathing, meditation, and calming focus drills",
    category: "Mindfulness"
  },
  {
    emoji: "🗓️",
    title: "Calendar Heatmaps",
    description: "Visual patterns of behavior, streaks, and activity over time",
    category: "Analytics"
  },
  {
    emoji: "💥",
    title: "Streak XP System",
    description: "Gamified progress tracking to make growth addictive",
    category: "Motivation"
  },
  {
    emoji: "📝",
    title: "Quick Journal",
    description: "Capture thoughts and insights in moments of clarity",
    category: "Reflection"
  },
  {
    emoji: "🔄",
    title: "Reflect Card",
    description: "Guided reflection prompts for deeper self-awareness",
    category: "Reflection"
  },
  {
    emoji: "🛑",
    title: "Catch Me Scrolling",
    description: "Instant mindful interruption when you need it most",
    category: "Intervention"
  },
  {
    emoji: "🎯",
    title: "Focus Goals",
    description: "Set and track personal goals with accountability features",
    category: "Goals"
  }
];

const categoryColors = {
  "Mindfulness": "#9575CD",
  "Time Control": "#FF6B6B", 
  "Analytics": "#4ECDC4",
  "Habits": "#45B7D1",
  "Wellness": "#96CEB4",
  "Motivation": "#FECA57",
  "Reflection": "#9575CD",
  "Intervention": "#FF6B6B",
  "Goals": "#45B7D1"
};

function FeatureCard({ feature, index, onPress }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 100;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
  }, []);

  const categoryColor = categoryColors[feature.category] || "#9575CD";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(feature)}
    >
      <Animated.View 
        style={[
          styles.featureCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: pulseAnim }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featureGradient}
        >
          <View style={styles.featureHeader}>
            <Text style={styles.featureEmoji}>{feature.emoji}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <Text style={styles.categoryText}>{feature.category}</Text>
            </View>
          </View>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureDescription}>{feature.description}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}


export default function OnboardingPaywall() {
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { currentOffering, isPremiumMember } = useRevenueCat();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  const openFeatureModal = (feature) => {
    setSelectedFeature(feature);
    setModalVisible(true);
  };

  const closeFeatureModal = () => {
    setModalVisible(false);
    setSelectedFeature(null);
  };

  // Visual preview components for different feature types
  const renderVisualPreview = (data) => {
    if (!data) return null;

    const { visual, preview } = data;

    switch (visual) {
      case "notification":
        return (
          <View style={styles.previewContainer}>
            <View style={styles.phoneFrame}>
              {/* iPhone Status Bar */}
              <View style={styles.statusBar}>
                <Text style={styles.statusTime}>2:34</Text>
                <View style={styles.statusRight}>
                  <Text style={styles.statusSignal}>📶</Text>
                  <Text style={styles.statusWifi}>📶</Text>
                  <Text style={styles.statusBattery}>🔋</Text>
                </View>
              </View>
              
              {/* Notification */}
              <View style={styles.notificationCard}>
                <View style={styles.notificationHeader}>
                  <View style={styles.appIconContainer}>
                    <Text style={styles.appIcon}>🧘</Text>
                  </View>
                  <View style={styles.notificationInfo}>
                    <View style={styles.notificationTopRow}>
                      <Text style={styles.appName}>{preview.appName}</Text>
                      <Text style={styles.notificationTime}>{preview.date}</Text>
                    </View>
                    <Text style={styles.notificationTitle}>{preview.notificationTitle}</Text>
                  </View>
                </View>
                <Text style={styles.notificationBody}>{preview.notificationBody}</Text>
                
                {/* iOS Notification Actions */}
                <View style={styles.notificationActions}>
                  <View style={styles.notificationAction}>
                    <Text style={styles.actionText}>Take a Break</Text>
                  </View>
                  <View style={styles.notificationAction}>
                    <Text style={styles.actionText}>Remind Later</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      
      case "timer":
        return (
          <View style={styles.previewContainer}>
            <View style={styles.phoneFrame}>
              <LinearGradient
                colors={["#F3FBCB", "#F4D8FE"]} // Light green-yellow to soft purple
                style={styles.timerCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Timer Options */}
                <View style={styles.timerOptions}>
                  <View style={[styles.timerOption, { backgroundColor: "rgba(147, 213, 225, 0.9)" }]}>
                    <Text style={styles.timerOptionText}>10 min</Text>
                  </View>
                  <View style={[styles.timerOption, styles.selectedOption, { backgroundColor: "rgba(244, 216, 254, 0.95)" }]}>
                    <Text style={[styles.timerOptionText, styles.selectedOptionText]}>{preview.selectedMinutes} min</Text>
                  </View>
                  <View style={[styles.timerOption, { backgroundColor: "rgba(255, 227, 125, 0.9)" }]}>
                    <Text style={styles.timerOptionText}>40 min</Text>
                  </View>
                </View>

                {/* Floating Leaves */}
                <View style={styles.leavesContainer}>
                  <Text style={styles.leafEmoji}>🍃</Text>
                  <Text style={[styles.leafEmoji, styles.leaf2]}>🌿</Text>
                  <Text style={[styles.leafEmoji, styles.leaf3]}>🍃</Text>
                </View>

                {/* Timer Display */}
                <View style={styles.timerDisplay}>
                  <Text style={styles.timerTime}>{preview.timeLeft}</Text>
                  <View style={styles.timerProgressContainer}>
                    <View style={styles.timerProgressTrack}>
                      <View style={[styles.timerProgressFill, { width: `${preview.progress * 100}%` }]} />
                    </View>
                  </View>
                </View>

                {/* Encouragement Text */}
                <Text style={styles.timerEncouragement}>{preview.encouragementText}</Text>

                {/* Action Button */}
                <View style={styles.timerAction}>
                  <Text style={styles.timerActionText}>End Early</Text>
                </View>

                {/* Progress Indicator */}
                <View style={styles.timerProgressIndicator}>
                  <Text style={styles.timerProgressText}>{preview.todaysCount} sessions today</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        );
      
      case "chart":
        return (
          <View style={styles.previewContainer}>
            <View style={styles.phoneFrame}>
              <View style={styles.progressCard}>
                {/* XP Jar */}
                <View style={styles.xpJarSection}>
                  <View style={styles.xpJar}>
                    <View style={styles.xpJarFill} />
                    <Text style={styles.xpJarText}>XP</Text>
                  </View>
                  <View style={styles.xpJarInfo}>
                    <Text style={styles.xpJarValue}>{preview.todayXP} XP</Text>
                    <Text style={styles.xpJarLabel}>Today's Progress</Text>
                    <Text style={styles.xpJarStreak}>🔥 {preview.currentStreak} day streak</Text>
                  </View>
                </View>

                {/* Weekly Chart */}
                <View style={styles.weeklyChart}>
                  <Text style={styles.chartTitle}>This Week's Activity</Text>
                  <View style={styles.chartBars}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <View key={index} style={styles.chartDay}>
                        <View style={styles.chartBarContainer}>
                          <View 
                            style={[
                              styles.chartBar, 
                              { 
                                height: `${Math.max((preview.weeklyTaps[index] / 7) * 100, 5)}%`,
                                backgroundColor: preview.weeklyTaps[index] > 0 ? "#9575CD" : "#E5E5E5"
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.chartDayLabel}>{day}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Stats Row */}
                <View style={styles.progressStatsRow}>
                  <View style={styles.progressStat}>
                    <Text style={styles.progressStatValue}>{preview.totalTaps}</Text>
                    <Text style={styles.progressStatLabel}>Total Taps</Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Text style={styles.progressStatValue}>{preview.weeklyImprovement}</Text>
                    <Text style={styles.progressStatLabel}>Weekly Growth</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      
      case "tasks":
        return (
          <View style={styles.previewContainer}>
            <View style={styles.phoneFrame}>
              <View style={styles.taskPreviewCard}>
                {/* XP Badge */}
                <View style={styles.taskXpBadge}>
                  <Text style={styles.taskXpBadgeText}>💫 +{preview.xp} XP</Text>
                </View>

                {/* Streak Badge */}
                {preview.streak > 0 && (
                  <View style={styles.taskStreakBadge}>
                    <Text style={styles.taskStreakBadgeText}>🔥 {preview.streak}</Text>
                  </View>
                )}

                {/* Task Image Placeholder */}
                <View style={styles.taskImageContainer}>
                  <View style={styles.taskImagePlaceholder}>
                    <Text style={styles.taskImageEmoji}>🧊</Text>
                  </View>
                </View>

                {/* Task Info */}
                <View style={styles.taskInfoSection}>
                  <Text style={styles.taskPreviewTitle}>{preview.taskName}</Text>
                  <Text style={styles.taskPreviewDescription}>{preview.taskDescription}</Text>

                  {/* Category & Frequency */}
                  <View style={styles.taskMetaRow}>
                    <View style={styles.taskCategoryPill}>
                      <Text style={styles.taskCategoryText}>{preview.category}</Text>
                    </View>
                    <View style={styles.taskFrequencyPill}>
                      <Text style={styles.taskFrequencyText}>{preview.frequency}</Text>
                    </View>
                  </View>

                  {/* Action Button */}
                  <View style={[styles.taskActionButton, preview.isCompleted && styles.taskCompletedButton]}>
                    <Text style={[styles.taskActionText, preview.isCompleted && styles.taskCompletedText]}>
                      {preview.isCompleted ? "✅ Done for today" : "Do Now"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      
      case "mood":
        return (
          <View style={styles.previewContainer}>
            <View style={styles.phoneFrame}>
              <LinearGradient
                colors={["#F3FBCB", "#F4D8FE"]} // Light green-yellow to soft purple (same as timer)
                style={styles.journalCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Header */}
                <Text style={styles.journalTitle}>📝 Quick Journal</Text>
                <Text style={styles.journalSubtitle}>Empty your mind. No prompt. Just you and your thoughts.</Text>

                {/* Progress Indicator */}
                <View style={styles.journalProgressContainer}>
                  <Text style={styles.journalProgressText}>{preview.todaysEntries} entries today 🔥</Text>
                </View>

                {/* Mood Selection */}
                <View style={styles.moodSelectionContainer}>
                  <Text style={styles.moodSelectionLabel}>How are you feeling?</Text>
                  <View style={styles.moodOptionsRow}>
                    {[
                      { emoji: "😌", label: "Calm", selected: false },
                      { emoji: "😕", label: "Confused", selected: false },
                      { emoji: "😄", label: "Grateful", selected: true },
                      { emoji: "🤯", label: "Overwhelmed", selected: false }
                    ].map((mood, index) => (
                      <View key={index} style={[styles.moodOptionBtn, mood.selected && styles.moodOptionSelected]}>
                        <Text style={styles.moodOptionEmoji}>{mood.emoji}</Text>
                        <Text style={[styles.moodOptionLabel, mood.selected && styles.moodOptionLabelSelected]}>
                          {mood.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Journal Input Preview */}
                <View style={styles.journalInputContainer}>
                  <Text style={styles.journalInputText}>{preview.journalText}</Text>
                  <View style={styles.journalInputFooter}>
                    <Text style={styles.journalCharCount}>{preview.characterCount}/500</Text>
                  </View>
                </View>

                {/* Submit Button */}
                <View style={styles.journalSubmitButton}>
                  <Text style={styles.journalSubmitText}>Save Entry</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        );
      
      case "breathing":
        return (
          <View style={styles.previewContainer}>
            <View style={styles.phoneFrame}>
              <LinearGradient
                colors={["#F3FBCB", "#F4D8FE"]} // Light green-yellow to soft purple (same as other modals)
                style={styles.breathingCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Header */}
                <Text style={styles.breathingTitle}>🧘 {preview.exercise}</Text>
                
                {/* Progress Info */}
                <View style={styles.breathingProgressContainer}>
                  <Text style={styles.breathingProgressText}>Breath {preview.round}</Text>
                  <View style={styles.breathingProgressBar}>
                    <View style={[styles.breathingProgressFill, { width: `${(parseInt(preview.round.split(' ')[0]) / 5) * 100}%` }]} />
                  </View>
                </View>

                {/* Main Breathing Circle */}
                <View style={styles.breathingMainContainer}>
                  <View style={styles.breathingCircle}>
                    <View style={styles.breathingInnerCircle}>
                      <Text style={styles.breathingPhase}>{preview.phase}</Text>
                      <Text style={styles.breathingCount}>{preview.count}</Text>
                    </View>
                  </View>
                </View>

                {/* Instruction */}
                <Text style={styles.breathingInstruction}>
                  {preview.phase === "Inhale" ? "Breathe in slowly and deeply" : 
                   preview.phase === "Hold" ? "Hold your breath gently" : 
                   "Breathe out slowly and completely"}
                </Text>

                {/* Session Info */}
                <View style={styles.breathingSessionInfo}>
                  <View style={styles.breathingSessionBadge}>
                    <Text style={styles.breathingSessionText}>✨ Mindful Session</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        );
      
      case "calendar":
        return (
          <View style={styles.previewContainer}>
            <View style={styles.phoneFrame}>
              <View style={styles.calendarCard}>
                <Text style={styles.calendarTitle}>{preview.month}</Text>
                
                {/* Calendar Header - Days of Week */}
                <View style={styles.calendarHeader}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <Text key={index} style={styles.calendarHeaderDay}>{day}</Text>
                  ))}
                </View>
                
                {/* Calendar Grid - Actual Calendar Layout */}
                <View style={styles.calendarGrid}>
                  {Array.from({ length: 35 }, (_, i) => {
                    const dayNumber = i - 2; // Start from day 1 (offset by 2 for September 2025)
                    const isValidDay = dayNumber >= 1 && dayNumber <= 30;
                    const isCompleted = isValidDay && (dayNumber <= 18 || Math.random() > 0.3); // 18 day streak + some additional days
                    const isToday = dayNumber === 10;
                    
                    return (
                      <View 
                        key={i} 
                        style={[
                          styles.calendarDay,
                          {
                            backgroundColor: isValidDay 
                              ? (isCompleted ? "#9575CD" : "rgba(255, 255, 255, 0.1)")
                              : "transparent",
                            borderWidth: isToday ? 2 : 0,
                            borderColor: isToday ? "#FFD700" : "transparent",
                          }
                        ]}
                      >
                        {isValidDay && (
                          <Text style={[
                            styles.calendarDayText,
                            { color: isCompleted ? "#ffffff" : "#666" }
                          ]}>
                            {dayNumber}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
                
                <View style={styles.calendarStats}>
                  <Text style={styles.calendarStat}>{preview.streakDays} day streak</Text>
                  <Text style={styles.calendarStat}>{preview.completionRate} complete</Text>
                </View>
              </View>
            </View>
          </View>
        );
      
      case "xp":
        return (
          <View style={styles.previewContainer}>
            <View style={styles.phoneFrame}>
              <LinearGradient
                colors={["#F3FBCB", "#F4D8FE"]} // Light green-yellow to soft purple (same as other modals)
                style={styles.xpCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Header */}
                <Text style={styles.xpTitle}>🏆 Your Progress</Text>
                
                {/* XP Jar */}
                <View style={styles.xpJarContainer}>
                  <View style={styles.xpJar}>
                    {/* Jar liquid fill */}
                    <View style={[styles.xpJarLiquid, { height: `${((preview.currentXP % 1000) / 1000) * 70}%` }]} />
                    
                    {/* Jar outline */}
                    <View style={styles.xpJarOutline} />
                    
                    {/* Sparkles */}
                    <View style={styles.xpSparkles}>
                      <Text style={[styles.xpSparkle, styles.xpSparkle1]}>✨</Text>
                      <Text style={[styles.xpSparkle, styles.xpSparkle2]}>⭐</Text>
                      <Text style={[styles.xpSparkle, styles.xpSparkle3]}>✨</Text>
                    </View>
                  </View>
                  
                  <View style={styles.xpJarTextContainer}>
                    <Text style={styles.xpJarText}>Level {preview.level}</Text>
                    <Text style={styles.xpStreakText}>{preview.currentXP} / {preview.nextLevel} XP</Text>
                    <Text style={styles.xpTodayText}>{preview.todayXP} today! 🎉</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.levelProgressContainer}>
                  <View style={styles.levelProgressBar}>
                    <View style={[styles.levelProgressFill, { width: `${((preview.currentXP % 1000) / 1000) * 100}%` }]} />
                  </View>
                  <Text style={styles.levelProgressText}>
                    {1000 - (preview.currentXP % 1000)} XP to Level {preview.level + 1}
                  </Text>
                </View>

                {/* Achievement Badge */}
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementEmoji}>🎖️</Text>
                  <Text style={styles.achievementText}>Consistency Master</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        );
      
      case "journal":
        return (
          <View style={styles.previewContainer}>
            <View style={styles.phoneFrame}>
              <View style={styles.journalCard}>
                <View style={styles.journalHeader}>
                  <View style={styles.journalTitleSection}>
                    <Text style={styles.journalEntryTitle}>{preview.entryTitle}</Text>
                    <Text style={styles.journalTimestamp}>{preview.timestamp}</Text>
                  </View>
                  <View style={styles.journalMoodBadge}>
                    <Text style={styles.journalMoodEmoji}>{preview.mood}</Text>
                    <Text style={styles.journalMoodLabel}>{preview.moodLabel}</Text>
                  </View>
                </View>
                
                <View style={styles.journalContent}>
                  <Text style={styles.journalText}>{preview.entryText}</Text>
                  <Text style={styles.journalContinue}>... continue writing</Text>
                </View>
                
                <View style={styles.journalFooter}>
                  <Text style={styles.journalWordCount}>{preview.wordCount} words</Text>
                  <View style={styles.journalActions}>
                    <Text style={styles.journalAction}>🎤</Text>
                    <Text style={styles.journalAction}>📸</Text>
                    <Text style={styles.journalAction}>💾</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      
      case "reflect":
        return (
          <View style={styles.previewContainer}>
            <View style={styles.phoneFrame}>
              <View style={styles.reflectCard}>
                <View style={styles.reflectHeader}>
                  <Text style={styles.reflectTitle}>{preview.promptTitle}</Text>
                  <View style={styles.reflectBadges}>
                    <View style={styles.reflectCategoryBadge}>
                      <Text style={styles.reflectCategoryText}>{preview.category}</Text>
                    </View>
                    <View style={styles.reflectDifficultyBadge}>
                      <Text style={styles.reflectDifficultyText}>{preview.difficulty}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.reflectQuestionCard}>
                  <Text style={styles.reflectQuestion}>{preview.question}</Text>
                </View>
                
                <View style={styles.reflectFooter}>
                  <View style={styles.reflectInfo}>
                    <Text style={styles.reflectTime}>⏱️ {preview.timeEstimate}</Text>
                    <Text style={styles.reflectStreak}>🔥 {preview.streak} day streak</Text>
                  </View>
                  <View style={styles.reflectActions}>
                    <View style={styles.reflectActionButton}>
                      <Text style={styles.reflectActionText}>Start Reflecting</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      
      case "catchscroll":
        return (
          <View style={styles.previewContainer}>
            <View style={styles.phoneFrame}>
              <View style={styles.catchScrollCard}>
                {/* Breathing Ring Background */}
                <View style={styles.catchScrollRing} />
                
                {/* Main Catch Scroll Button (Similar to actual app) */}
                <View style={styles.catchScrollButton}>
                  <View style={styles.catchScrollButtonInner}>
                    <View style={styles.catchScrollInnerLayer}>
                      <Text style={styles.catchScrollEmoji}>✋</Text>
                      <Text style={styles.catchScrollButtonText}>CATCH ME{"\n"}SCROLLING</Text>
                      <Text style={styles.catchScrollXpText}>+1 XP</Text>
                    </View>
                  </View>
                  
                  {/* Streak Indicator */}
                  <View style={styles.catchScrollStreak}>
                    <Text style={styles.catchScrollStreakEmoji}>🔥</Text>
                    <Text style={styles.catchScrollStreakText}>3 day streak</Text>
                  </View>
                </View>
                
                {/* Microcopy */}
                <Text style={styles.catchScrollMicrocopy}>
                  Tap this when you catch yourself scrolling
                </Text>
                
                {/* Stats Section */}
                <View style={styles.catchScrollStats}>
                  <View style={styles.catchScrollStat}>
                    <Text style={styles.catchScrollStatNumber}>{preview.todayInterruptions}</Text>
                    <Text style={styles.catchScrollStatLabel}>Mindful moments today</Text>
                  </View>
                  <View style={styles.catchScrollStat}>
                    <Text style={styles.catchScrollStatNumber}>{preview.timesSaved}</Text>
                    <Text style={styles.catchScrollStatLabel}>Time saved this week</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      
      case "focusgoals":
        return (
          <View style={styles.previewContainer}>
            <View style={styles.phoneFrame}>
              <View style={styles.focusGoalsCard}>
                <View style={styles.focusGoalsHeader}>
                  <Text style={styles.focusGoalsTitle}>{preview.currentGoal}</Text>
                  <View style={styles.focusGoalsTypeBadge}>
                    <Text style={styles.focusGoalsTypeText}>{preview.goalType}</Text>
                  </View>
                </View>
                
                <View style={styles.focusGoalsProgress}>
                  <View style={styles.focusGoalsProgressHeader}>
                    <Text style={styles.focusGoalsProgressTitle}>Progress</Text>
                    <Text style={styles.focusGoalsProgressPercent}>{Math.round(preview.progress * 100)}%</Text>
                  </View>
                  <View style={styles.focusGoalsProgressBar}>
                    <View style={[styles.focusGoalsProgressFill, { width: `${preview.progress * 100}%` }]} />
                  </View>
                  <Text style={styles.focusGoalsProgressText}>
                    {preview.completedDays} of {preview.targetDays} days completed
                  </Text>
                </View>
                
                <View style={styles.focusGoalsStats}>
                  <View style={styles.focusGoalsStat}>
                    <Text style={styles.focusGoalsStatNumber}>{preview.streak}</Text>
                    <Text style={styles.focusGoalsStatLabel}>Day Streak</Text>
                  </View>
                  <View style={styles.focusGoalsStatusBadge}>
                    <Text style={styles.focusGoalsStatusIcon}>✅</Text>
                    <Text style={styles.focusGoalsStatusText}>{preview.todayStatus}</Text>
                  </View>
                </View>
                
                <View style={styles.focusGoalsMilestone}>
                  <Text style={styles.focusGoalsMilestoneText}>
                    🎯 Next milestone: {preview.nextMilestone}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      
      default:
        return (
          <View style={styles.previewContainer}>
            <Text style={styles.previewPlaceholder}>Feature preview coming soon!</Text>
          </View>
        );
    }
  };

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handlePurchase = async () => {
    try {
      if (!currentOffering) {
        Alert.alert("Error", "No subscription plans available");
        return;
      }

      const packageToPurchase = selectedPlan === "yearly" 
        ? currentOffering.annual 
        : currentOffering.weekly;

      if (!packageToPurchase) {
        Alert.alert("Error", "Selected plan not available");
        return;
      }

      const purchaseResult = await Purchases.purchasePackage(packageToPurchase);
      
      if (purchaseResult.customerInfo.entitlements.active["Premium"]) {
        Alert.alert("Success!", "Welcome to Wake Scroll Premium!", [
          { text: "Continue", onPress: () => router.push("/(tabs)/") }
        ]);
      }
    } catch (error) {
      if (!error.userCancelled) {
        Alert.alert("Purchase Failed", error.message);
      }
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active["Premium"]) {
        Alert.alert("Success!", "Purchases restored successfully!", [
          { text: "Continue", onPress: () => router.push("/(tabs)/") }
        ]);
      } else {
        Alert.alert("No Purchases", "No active purchases found to restore.");
      }
    } catch (error) {
      Alert.alert("Restore Failed", error.message);
    }
  };

  const handleTerms = () => {
    Linking.openURL("https://www.wakescroll.com/terms");
  };

  const handlePrivacy = () => {
    Linking.openURL("https://www.wakescroll.com/privacy");
  };

  if (isPremiumMember) {
    router.push("/(tabs)/");
    return null;
  }

  const weeklyPrice = currentOffering?.weekly?.product?.priceString || "$4.99";
  const yearlyPrice = currentOffering?.annual?.product?.priceString || "$29.99";

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRestorePurchases} style={styles.restoreButton}>
            <Text style={styles.restoreText}>Restore</Text>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <Animated.View 
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Animated.View 
                style={[
                  styles.sparkleContainer,
                  { opacity: sparkleAnim }
                ]}
              >
                <Text style={styles.sparkle}>✨</Text>
                <Text style={[styles.sparkle, styles.sparkle2]}>✨</Text>
                <Text style={[styles.sparkle, styles.sparkle3]}>✨</Text>
              </Animated.View>
            </View>

            <Text style={styles.heroTitle}>
              Unlock Your Full{"\n"}
              <Text style={styles.heroTitleAccent}>Potential</Text>
            </Text>

            <Text style={styles.heroSubtitle}>
              Get access to all premium features and transform your relationship with technology
            </Text>
          </Animated.View>

          {/* Features Section */}
          <Animated.View 
            style={[
              styles.featuresSection,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={styles.sectionTitle}>Everything You Need to Succeed</Text>
            
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} onPress={openFeatureModal} />
              ))}
            </View>
          </Animated.View>

          {/* Legal Links - Above the plan selector */}
          <View style={styles.legalSection}>
            <View style={styles.legalLinks}>
              <Pressable onPress={handleTerms}>
                <Text style={styles.legalLink}>Terms & Conditions</Text>
              </Pressable>
              <Text style={styles.legalSeparator}> • </Text>
              <Pressable onPress={handlePrivacy}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </Pressable>
            </View>
          </View>

          {/* Bottom padding for fixed plan selector */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Fixed Bottom Plan Selector */}
        <Animated.View
          style={[
            styles.planSelectorContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.planSelector}>
            {/* Best Value Badge - Only show for yearly */}
            {selectedPlan === "yearly" && (
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>🎯 BEST VALUE 🎯</Text>
              </View>
            )}

            {/* Plans Container */}
            <View style={styles.plansContainer}>
              <TouchableOpacity
                onPress={() => setSelectedPlan("weekly")}
                style={[
                  styles.planCard,
                  selectedPlan === "weekly" && styles.selectedPlan,
                ]}
              >
                <View style={styles.planContent}>
                  <Text style={styles.planPrice}>{weeklyPrice}</Text>
                  <Text style={styles.planPeriod}>per week</Text>
                  <Text style={styles.planDescription}>
                    Start simple, stay grounded
                  </Text>
                  {selectedPlan === "weekly" && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedPlan("yearly")}
                style={[
                  styles.planCard,
                  styles.yearlyPlan,
                  selectedPlan === "yearly" && styles.selectedPlan,
                ]}
              >
                <View style={styles.planContent}>
                  <Text style={styles.planPrice}>{yearlyPrice}</Text>
                  <Text style={styles.planPeriod}>per year</Text>
                  <Text style={styles.planDescription}>
                    Save 85% • 7-day free trial
                  </Text>
                  {selectedPlan === "yearly" && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handlePurchase}
              activeOpacity={0.8}
            >
              <View style={styles.ctaGradient}>
                <Text style={styles.ctaButtonText}>
                  {selectedPlan === "weekly"
                    ? "Start Weekly Plan 🚀"
                    : "Start 7-Day Free Trial ✨"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Cancel Note */}
            <Text style={styles.cancelNote}>
              🛡️{" "}
              {selectedPlan === "weekly"
                ? "Cancel anytime. Billed weekly."
                : "Cancel anytime. No charges until trial ends."}
            </Text>
          </View>
        </Animated.View>

        {/* Feature Preview Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closeFeatureModal}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <LinearGradient
              colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
              style={styles.modalGradient}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity style={styles.modalCloseButton} onPress={closeFeatureModal}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedFeature && featurePreviewData[selectedFeature.title] && (
                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                  {/* Feature Title */}
                  <View style={styles.modalTitleSection}>
                    <Text style={styles.modalFeatureEmoji}>{selectedFeature.emoji}</Text>
                    <Text style={styles.modalFeatureTitle}>{featurePreviewData[selectedFeature.title].title}</Text>
                    <Text style={styles.modalFeatureSubtitle}>{featurePreviewData[selectedFeature.title].subtitle}</Text>
                  </View>

                  {/* Visual Preview */}
                  {renderVisualPreview(featurePreviewData[selectedFeature.title])}

                  {/* Benefits List */}
                  <View style={styles.benefitsSection}>
                    <Text style={styles.benefitsTitle}>What you'll get:</Text>
                    {featurePreviewData[selectedFeature.title].benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitItem}>
                        <Text style={styles.benefitCheck}>✓</Text>
                        <Text style={styles.benefitText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>

                  {/* CTA */}
                  <TouchableOpacity 
                    style={styles.modalCTA} 
                    onPress={closeFeatureModal}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#9575CD", "#7B68EE"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.modalCTAGradient}
                    >
                      <Text style={styles.modalCTAText}>Unlock This Feature</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Disclaimer */}
                  <View style={styles.modalDisclaimer}>
                    <Text style={styles.modalDisclaimerText}>
                      * Visual representation may vary slightly from the actual app. The real experience will be more interactive and feature-rich.
                    </Text>
                  </View>
                </ScrollView>
              )}
            </LinearGradient>
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const serifFamily = Platform.select({ ios: "Georgia", android: "serif", default: undefined });

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 30 : 0,
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "300",
  },
  restoreButton: {
    padding: 10,
  },
  restoreText: {
    fontSize: 16,
    color: "#9575CD",
    fontWeight: "600",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  sparkleContainer: {
    position: "absolute",
    top: -10,
    right: -10,
  },
  sparkle: {
    fontSize: 12,
    position: "absolute",
  },
  sparkle2: {
    top: 15,
    left: 20,
  },
  sparkle3: {
    top: -5,
    left: 35,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 15,
    fontFamily: serifFamily,
    lineHeight: 38,
  },
  heroTitleAccent: {
    color: "#9575CD",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  featuresSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 30,
    fontFamily: serifFamily,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: (width - 56) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  featureGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    minHeight: 140,
  },
  featureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  featureEmoji: {
    fontSize: 24,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 8,
    color: "#ffffff",
    fontWeight: "600",
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
    lineHeight: 18,
  },
  featureDescription: {
    fontSize: 11,
    color: "#ffffff",
    opacity: 0.8,
    lineHeight: 14,
  },
  bottomPadding: {
    height: 140, // Further reduced space for compact plan selector
  },
  planSelectorContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  planSelector: {
    backgroundColor: "rgba(29, 29, 29, 0.95)", // Much less transparent, darker
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(149, 117, 205, 0.3)",
  },
  bestValueBadge: {
    backgroundColor: "#9575CD",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: "center",
    marginBottom: 6,
    shadowColor: "#9575CD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  plansContainer: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 8,
    marginTop: 4,
  },
  planCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Less transparent
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    minHeight: 70, // Smaller height
  },
  yearlyPlan: {
    backgroundColor: "rgba(149, 117, 205, 0.15)", // Less transparent
    borderColor: "rgba(149, 117, 205, 0.4)",
  },
  selectedPlan: {
    backgroundColor: "rgba(149, 117, 205, 0.25)", // Less transparent
    borderColor: "#9575CD",
    borderWidth: 2,
  },
  planContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: "100%",
  },
  planPrice: {
    fontSize: 16, // Smaller font
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  planPeriod: {
    fontSize: 11, // Smaller font
    color: "#ffffff",
    opacity: 0.9,
    marginBottom: 3,
  },
  planDescription: {
    fontSize: 9, // Smaller font
    color: "#ffffff",
    opacity: 0.9,
    textAlign: "center",
    fontWeight: "600",
  },
  selectedIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#9575CD",
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedText: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "700",
  },
  ctaButton: {
    marginBottom: 8,
  },
  ctaGradient: {
    backgroundColor: "#9575CD",
    borderRadius: 14,
    paddingVertical: 12, // Smaller padding
    alignItems: "center",
    shadowColor: "#9575CD",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  ctaButtonText: {
    fontSize: 15, // Smaller font
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  cancelNote: {
    fontSize: 10, // Smaller font
    textAlign: "center",
    color: "#ffffff",
    opacity: 0.8,
  },
  legalSection: {
    alignItems: "center",
    marginBottom: 15,
    marginTop: 20,
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
  },
  legalLink: {
    fontSize: 12,
    color: "#9575CD",
    textDecorationLine: "underline",
  },
  legalSeparator: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.5,
  },
  
  // Modal styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalTitleSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  modalFeatureEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  modalFeatureTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  modalFeatureSubtitle: {
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 22,
  },
  
  // Preview container styles
  previewContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  phoneFrame: {
    width: width * 0.8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(149, 117, 205, 0.3)",
  },
  previewPlaceholder: {
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.6,
    textAlign: "center",
    paddingVertical: 40,
  },
  
  // iPhone Status Bar styles
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#000000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  statusTime: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },
  statusRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusSignal: {
    fontSize: 12,
    marginRight: 3,
  },
  statusWifi: {
    fontSize: 12,
    marginRight: 3,
  },
  statusBattery: {
    fontSize: 12,
  },
  
  // iOS Notification preview styles
  notificationCard: {
    backgroundColor: "rgba(28, 28, 30, 0.95)", // iOS dark notification background
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  appIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#9575CD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  appIcon: {
    fontSize: 16,
    color: "#ffffff",
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  appName: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },
  notificationTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  notificationTitle: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
    marginBottom: 12,
  },
  notificationActions: {
    flexDirection: "row",
    gap: 8,
  },
  notificationAction: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  actionText: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "500",
  },
  
  // Timer preview styles (Based on actual app design)
  timerCard: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  timerOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  timerOption: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 12,
    alignItems: "center",
    opacity: 0.7,
  },
  selectedOption: {
    opacity: 1,
    borderWidth: 2,
    borderColor: "#9575CD",
  },
  timerOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
  },
  selectedOptionText: {
    fontWeight: "700",
  },
  leavesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
    opacity: 0.6,
  },
  leafEmoji: {
    fontSize: 20,
  },
  leaf2: {
    fontSize: 24,
  },
  leaf3: {
    fontSize: 16,
  },
  timerDisplay: {
    alignItems: "center",
    marginBottom: 25,
  },
  timerTime: {
    fontSize: 52,
    color: "#121111",
    fontWeight: "300",
    fontFamily: "monospace",
    marginBottom: 15,
  },
  timerProgressContainer: {
    width: 150,
    alignItems: "center",
  },
  timerProgressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(18, 17, 17, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  timerProgressFill: {
    height: "100%",
    backgroundColor: "#93D5E1",
    borderRadius: 3,
  },
  timerEncouragement: {
    fontSize: 14,
    color: "#121111",
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.8,
    fontStyle: "italic",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  timerAction: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.7,
  },
  timerProgressIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timerProgressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
  },
  
  // Progress tracking preview styles (Based on actual app design)
  progressCard: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  xpJarSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  xpJar: {
    width: 60,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    marginRight: 20,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
    position: "relative",
    overflow: "hidden",
  },
  xpJarFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "65%",
    backgroundColor: "#FFE37D",
    borderRadius: 8,
    opacity: 0.8,
  },
  xpJarText: {
    fontSize: 10,
    color: "#121111",
    fontWeight: "700",
    zIndex: 1,
  },
  xpJarInfo: {
    flex: 1,
  },
  xpJarValue: {
    fontSize: 24,
    color: "#9575CD",
    fontWeight: "700",
    marginBottom: 2,
  },
  xpJarLabel: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
    marginBottom: 4,
  },
  xpJarStreak: {
    fontSize: 11,
    color: "#FFE37D",
    fontWeight: "600",
  },
  weeklyChart: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 80,
    paddingHorizontal: 10,
  },
  chartDay: {
    alignItems: "center",
    flex: 1,
  },
  chartBarContainer: {
    height: 60,
    width: 20,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  chartBar: {
    width: "100%",
    borderRadius: 3,
    minHeight: 3,
  },
  chartDayLabel: {
    fontSize: 10,
    color: "#ffffff",
    opacity: 0.7,
  },
  progressStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  progressStat: {
    alignItems: "center",
  },
  progressStatValue: {
    fontSize: 18,
    color: "#9575CD",
    fontWeight: "700",
    marginBottom: 3,
  },
  progressStatLabel: {
    fontSize: 11,
    color: "#ffffff",
    opacity: 0.7,
    textAlign: "center",
  },
  
  // Task preview styles
  taskCard: {
    alignItems: "center",
    paddingVertical: 20,
  },
  taskTitle: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 20,
  },
  currentTask: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  taskEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  taskName: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "600",
  },
  taskProgress: {
    alignItems: "center",
    marginBottom: 15,
  },
  progressText: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.8,
    marginBottom: 10,
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  nextTask: {
    fontSize: 14,
    color: "#9575CD",
    fontWeight: "500",
  },

  // New Task preview styles (Based on actual app design)
  taskPreviewCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    marginHorizontal: 10,
  },
  taskXpBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FFE37D",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 1,
  },
  taskXpBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#121111",
  },
  taskStreakBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  taskStreakBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  taskImageContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
  },
  taskImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#93D5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  taskImageEmoji: {
    fontSize: 28,
  },
  taskInfoSection: {
    padding: 15,
  },
  taskPreviewTitle: {
    fontSize: 16,
    color: "#121111",
    fontWeight: "700",
    marginBottom: 4,
  },
  taskPreviewDescription: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 16,
  },
  taskMetaRow: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 8,
  },
  taskCategoryPill: {
    backgroundColor: "#F4D8FE",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  taskCategoryText: {
    fontSize: 10,
    color: "#121111",
    fontWeight: "600",
  },
  taskFrequencyPill: {
    backgroundColor: "#F3FBCB",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  taskFrequencyText: {
    fontSize: 10,
    color: "#121111",
    fontWeight: "500",
  },
  taskActionButton: {
    backgroundColor: "#9575CD",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  taskCompletedButton: {
    backgroundColor: "#4CAF50",
  },
  taskActionText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  taskCompletedText: {
    color: "#ffffff",
  },
  
  // Mood preview styles
  moodCard: {
    alignItems: "center",
    paddingVertical: 20,
  },
  moodQuestion: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  moodDisplay: {
    alignItems: "center",
    marginBottom: 25,
  },
  moodEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  moodText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
  moodStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  moodStat: {
    alignItems: "center",
  },
  moodStatValue: {
    fontSize: 20,
    color: "#9575CD",
    fontWeight: "700",
    marginBottom: 5,
  },
  moodStatLabel: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.7,
  },

  // Journal preview styles (Based on actual app design)
  journalCard: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  journalTitle: {
    fontSize: 20,
    color: "#121111",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  journalSubtitle: {
    fontSize: 13,
    color: "#121111",
    opacity: 0.75,
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  journalProgressContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  journalProgressText: {
    fontSize: 13,
    color: "#121111",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  moodSelectionContainer: {
    marginBottom: 20,
  },
  moodSelectionLabel: {
    fontSize: 16,
    color: "#121111",
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  moodOptionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  moodOptionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  moodOptionSelected: {
    backgroundColor: "rgba(244, 216, 254, 0.95)",
    borderWidth: 2,
    borderColor: "#9575CD",
    shadowColor: "#9575CD",
    shadowOpacity: 0.25,
  },
  moodOptionEmoji: {
    fontSize: 18,
    marginBottom: 3,
  },
  moodOptionLabel: {
    fontSize: 10,
    color: "#121111",
    fontWeight: "500",
    opacity: 0.75,
    letterSpacing: 0.1,
  },
  moodOptionLabelSelected: {
    fontWeight: "700",
    opacity: 1,
  },
  journalInputContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    minHeight: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  journalInputText: {
    fontSize: 13,
    color: "#121111",
    lineHeight: 18,
    flex: 1,
    opacity: 0.9,
  },
  journalInputFooter: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  journalCharCount: {
    fontSize: 11,
    color: "#121111",
    opacity: 0.65,
    fontWeight: "500",
  },
  journalSubmitButton: {
    backgroundColor: "#9575CD",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#9575CD",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  journalSubmitText: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  
  // Breathing preview styles (Based on actual app design)
  breathingCard: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  breathingTitle: {
    fontSize: 20,
    color: "#121111",
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  breathingProgressContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  breathingProgressText: {
    fontSize: 12,
    color: "#121111",
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
  },
  breathingProgressBar: {
    width: 150,
    height: 4,
    backgroundColor: "rgba(18, 17, 17, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  breathingProgressFill: {
    height: "100%",
    backgroundColor: "#9575CD",
    borderRadius: 2,
  },
  breathingMainContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  breathingCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(18, 17, 17, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  breathingInnerCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  breathingPhase: {
    fontSize: 12,
    color: "#9575CD",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  breathingCount: {
    fontSize: 48,
    color: "#121111",
    fontWeight: "700",
  },
  breathingInstruction: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.7,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  breathingSessionInfo: {
    alignItems: "center",
  },
  breathingSessionBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  breathingSessionText: {
    fontSize: 12,
    color: "#121111",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  
  // Calendar preview styles
  calendarCard: {
    paddingVertical: 20,
  },
  calendarTitle: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  calendarHeaderDay: {
    fontSize: 12,
    color: "#9575CD",
    fontWeight: "600",
    width: "14.2%",
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  calendarDay: {
    width: "14.2%",
    aspectRatio: 1,
    borderRadius: 6,
    marginBottom: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  calendarStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  calendarStat: {
    fontSize: 14,
    color: "#9575CD",
    fontWeight: "500",
  },
  
  // XP preview styles (Based on actual app XP jar design)
  xpCard: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  xpTitle: {
    fontSize: 20,
    color: "#121111",
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  xpJarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  xpJar: {
    width: 100,
    height: 120,
    position: "relative",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  xpJarLiquid: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: "#FFE37D",
    borderRadius: 40,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  xpJarOutline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    borderWidth: 3,
    borderColor: "#121111",
    borderRadius: 50,
    borderTopWidth: 0,
    backgroundColor: "transparent",
  },
  xpSparkles: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  xpSparkle: {
    position: "absolute",
    fontSize: 12,
  },
  xpSparkle1: {
    top: 15,
    left: 15,
  },
  xpSparkle2: {
    top: 30,
    right: 12,
  },
  xpSparkle3: {
    top: 50,
    left: 25,
  },
  xpJarTextContainer: {
    alignItems: "center",
  },
  xpJarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 4,
  },
  xpStreakText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 6,
    opacity: 0.8,
  },
  xpTodayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9575CD",
  },
  levelProgressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  levelProgressBar: {
    width: "80%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  levelProgressFill: {
    height: "100%",
    backgroundColor: "#9575CD",
    borderRadius: 4,
  },
  levelProgressText: {
    fontSize: 11,
    color: "#121111",
    opacity: 0.7,
    fontWeight: "500",
  },
  achievementBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  achievementEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  achievementText: {
    fontSize: 12,
    color: "#121111",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  
  // Benefits section styles
  benefitsSection: {
    marginBottom: 30,
  },
  benefitsTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitCheck: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "700",
    marginRight: 15,
    width: 20,
  },
  benefitText: {
    fontSize: 16,
    color: "#ffffff",
    flex: 1,
    lineHeight: 22,
  },
  
  // Quick Journal preview styles
  journalCard: {
    paddingVertical: 20,
  },
  journalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  journalTitleSection: {
    flex: 1,
    marginRight: 15,
  },
  journalEntryTitle: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 3,
  },
  journalTimestamp: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.6,
  },
  journalMoodBadge: {
    backgroundColor: "rgba(149, 117, 205, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  journalMoodEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  journalMoodLabel: {
    fontSize: 10,
    color: "#9575CD",
    fontWeight: "600",
  },
  journalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  journalText: {
    fontSize: 14,
    color: "#ffffff",
    lineHeight: 20,
    marginBottom: 8,
  },
  journalContinue: {
    fontSize: 12,
    color: "#9575CD",
    fontStyle: "italic",
    opacity: 0.8,
  },
  journalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  journalWordCount: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.6,
  },
  journalActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  journalAction: {
    fontSize: 18,
    marginLeft: 12,
    opacity: 0.8,
  },
  
  // Reflect Card preview styles
  reflectCard: {
    paddingVertical: 20,
  },
  reflectHeader: {
    marginBottom: 20,
  },
  reflectTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  reflectBadges: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  reflectCategoryBadge: {
    backgroundColor: "#9575CD",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  reflectCategoryText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  reflectDifficultyBadge: {
    backgroundColor: "rgba(255, 193, 7, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#FFC107",
  },
  reflectDifficultyText: {
    fontSize: 12,
    color: "#FFC107",
    fontWeight: "600",
  },
  reflectQuestionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#9575CD",
  },
  reflectQuestion: {
    fontSize: 16,
    color: "#ffffff",
    lineHeight: 24,
    textAlign: "center",
    fontStyle: "italic",
  },
  reflectFooter: {
    alignItems: "center",
  },
  reflectInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  reflectTime: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.8,
  },
  reflectStreak: {
    fontSize: 14,
    color: "#9575CD",
    fontWeight: "600",
  },
  reflectActions: {
    width: "100%",
  },
  reflectActionButton: {
    backgroundColor: "#9575CD",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  reflectActionText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  
  // Catch Me Scrolling preview styles (Based on actual app design)
  catchScrollCard: {
    paddingVertical: 25,
    alignItems: "center",
    position: "relative",
  },
  catchScrollRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: "rgba(147, 213, 225, 0.3)",
    backgroundColor: "rgba(147, 213, 225, 0.1)",
    top: 40,
  },
  catchScrollButton: {
    position: "relative",
    marginBottom: 15,
  },
  catchScrollButtonInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#93D5E1",
    shadowColor: "#93D5E1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  catchScrollInnerLayer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  catchScrollEmoji: {
    fontSize: 28,
    marginBottom: 6,
    textShadowColor: "rgba(255, 255, 255, 0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  catchScrollButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#121111",
    textAlign: "center",
    letterSpacing: 0.5,
    lineHeight: 14,
    textShadowColor: "rgba(255, 255, 255, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  catchScrollXpText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#121111",
    marginTop: 4,
    opacity: 0.9,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  catchScrollStreak: {
    position: "absolute",
    top: -6,
    right: -6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 227, 125, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 227, 125, 1)",
    shadowColor: "#FFE37D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  catchScrollStreakEmoji: {
    fontSize: 10,
    marginRight: 3,
  },
  catchScrollStreakText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#121111",
    opacity: 0.9,
  },
  catchScrollMicrocopy: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.6,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  catchScrollStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  catchScrollStat: {
    alignItems: "center",
  },
  catchScrollStatNumber: {
    fontSize: 18,
    color: "#93D5E1",
    fontWeight: "700",
    marginBottom: 3,
  },
  catchScrollStatLabel: {
    fontSize: 11,
    color: "#ffffff",
    opacity: 0.7,
    textAlign: "center",
  },
  
  // Focus Goals preview styles
  focusGoalsCard: {
    paddingVertical: 20,
  },
  focusGoalsHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  focusGoalsTitle: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  focusGoalsTypeBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  focusGoalsTypeText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  focusGoalsProgress: {
    marginBottom: 20,
  },
  focusGoalsProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  focusGoalsProgressTitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  focusGoalsProgressPercent: {
    fontSize: 16,
    color: "#9575CD",
    fontWeight: "700",
  },
  focusGoalsProgressBar: {
    width: "100%",
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  focusGoalsProgressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 6,
  },
  focusGoalsProgressText: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "center",
  },
  focusGoalsStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  focusGoalsStat: {
    alignItems: "center",
  },
  focusGoalsStatNumber: {
    fontSize: 24,
    color: "#9575CD",
    fontWeight: "700",
    marginBottom: 3,
  },
  focusGoalsStatLabel: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.7,
  },
  focusGoalsStatusBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  focusGoalsStatusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  focusGoalsStatusText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  focusGoalsMilestone: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  focusGoalsMilestoneText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
    textAlign: "center",
  },
  
  // Modal CTA styles
  modalCTA: {
    marginBottom: 20,
  },
  modalCTAGradient: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#9575CD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalCTAText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  
  // Modal Disclaimer styles
  modalDisclaimer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  modalDisclaimerText: {
    fontSize: 11,
    color: "#ffffff",
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 15,
    fontStyle: "italic",
  },
});
