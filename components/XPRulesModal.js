import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  XP_ACTIVITIES,
  getEarnedBadges,
  getNextMilestone,
  getRandomQuote,
} from "../constants/xpActivities";
import { getStreak, getXP, getXPHistory } from "../utils/xpManager";
import XpGraph from "./XpGraph";

const { width, height } = Dimensions.get("window");

const XPRulesModal = ({ visible, onClose }) => {
  const [xpHistory, setXPHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [todaysXP, setTodaysXP] = useState(0);
  const [quote, setQuote] = useState("");
  const [nextMilestone, setNextMilestone] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);

  // Animation refs
  const sparkleAnims = useRef([]).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      loadData();
      animateEntrance();
      initializeSparkles();
      setQuote(getRandomQuote());
    }
  }, [visible]);

  const initializeSparkles = () => {
    // Initialize sparkle animations
    for (let i = 0; i < 5; i++) {
      if (!sparkleAnims[i]) {
        sparkleAnims[i] = {
          opacity: new Animated.Value(0),
          translateY: new Animated.Value(0),
          scale: new Animated.Value(0),
        };
      }
    }
  };

  const animateEntrance = () => {
    // Modal entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Sparkle entrance animation
    setTimeout(() => {
      animateSparkles();
    }, 800);
  };

  const animateSparkles = () => {
    const sparkleAnimations = sparkleAnims.map((sparkle, index) =>
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.parallel([
          Animated.timing(sparkle.opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(sparkle.scale, {
            toValue: 1,
            tension: 150,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle.translateY, {
            toValue: -30,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(sparkle.opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.loop(
      Animated.sequence([
        Animated.parallel(sparkleAnimations),
        Animated.delay(2000),
      ])
    ).start();
  };

  const loadData = async () => {
    try {
      const history = await getXPHistory();
      const currentStreak = await getStreak();
      const currentXP = await getXP();

      // Calculate today's XP
      const today = new Date().toDateString();
      const todaysEntry = history.find((entry) => entry.date === today);
      const todaysXPValue = todaysEntry ? todaysEntry.xp : 0;

      setXPHistory(history);
      setStreak(currentStreak);
      setTotalXP(currentXP);
      setTodaysXP(todaysXPValue);

      // Get milestone data
      const next = getNextMilestone(currentXP);
      const badges = getEarnedBadges(currentXP);

      setNextMilestone(next);
      setEarnedBadges(badges);
    } catch (error) {
      console.error("Error loading modal data:", error);
    }
  };

  const handleActivityPress = (activity) => {
    if (activity.route) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onClose();
      router.push(activity.route);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      // Reset animations
      scaleAnim.setValue(0);
      slideAnim.setValue(50);
    });
  };

  const getMilestoneProgress = () => {
    if (!nextMilestone) return 100;

    // Calculate progress as current XP / next milestone XP
    const progress = (totalXP / nextMilestone.requiredXP) * 100;

    return Math.min(Math.max(progress, 0), 100);
  };

  const renderSparkles = () => {
    const sparklePositions = [
      { top: 60, left: 50 },
      { top: 40, right: 80 },
      { top: 80, left: width * 0.3 },
      { top: 50, right: 60 },
      { top: 70, left: width * 0.7 },
    ];

    return sparkleAnims.map((sparkle, index) => (
      <Animated.Text
        key={index}
        style={[
          styles.floatingSparkle,
          sparklePositions[index],
          {
            opacity: sparkle.opacity,
            transform: [
              { translateY: sparkle.translateY },
              { scale: sparkle.scale },
            ],
          },
        ]}
      >
        ✨
      </Animated.Text>
    ));
  };

  return (
    <Modal visible={visible} animationType="none" transparent>
      <BlurView intensity={40} style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* Floating Sparkles */}
          {renderSparkles()}

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Your Mindful Progress</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Progress Summary */}
            <View style={styles.progressSummary}>
              <View style={styles.todaysXPContainer}>
                <Text style={styles.todaysXPNumber}>+{todaysXP}</Text>
                <Text style={styles.todaysXPLabel}>XP today</Text>
              </View>

              <View style={styles.streakContainer}>
                {streak > 0 ? (
                  <>
                    <Text style={styles.streakEmoji}>🔥</Text>
                    <Text style={styles.streakNumber}>{streak}</Text>
                    <Text style={styles.streakLabel}>day streak!</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.streakEmoji}>🌱</Text>
                    <Text style={styles.streakText}>Start your</Text>
                    <Text style={styles.streakText}>streak today!</Text>
                  </>
                )}
              </View>
            </View>

            {/* XP Graph */}
            <XpGraph xpHistory={xpHistory} />

            {/* How to Earn XP - Activity Cards */}
            <View style={styles.activitiesContainer}>
              <Text style={styles.activitiesTitle}>How to Earn XP</Text>

              <View style={styles.activitiesGrid}>
                {XP_ACTIVITIES.map((activity, index) => (
                  <TouchableOpacity
                    key={activity.id}
                    style={[
                      styles.activityCard,
                      { backgroundColor: activity.color },
                    ]}
                    onPress={() => handleActivityPress(activity)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <View style={styles.xpBadge}>
                      <Text style={styles.xpBadgeText}>+{activity.xp} XP</Text>
                    </View>
                    <Text style={styles.activityDescription}>
                      {activity.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Milestone Progress */}
            {nextMilestone && (
              <View style={styles.milestoneContainer}>
                <Text style={styles.milestoneTitle}>Next Milestone</Text>
                <View style={styles.milestoneHeader}>
                  <Text style={styles.milestoneEmoji}>
                    {nextMilestone.emoji}
                  </Text>
                  <View style={styles.milestoneInfo}>
                    <Text style={styles.milestoneName}>
                      {nextMilestone.name}
                    </Text>
                    <Text style={styles.milestoneProgress}>
                      {totalXP} / {nextMilestone.requiredXP} XP
                    </Text>
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        { width: `${getMilestoneProgress()}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercentage}>
                    {Math.round(getMilestoneProgress())}%
                  </Text>
                </View>

                <Text style={styles.milestoneDescription}>
                  Earn {nextMilestone.requiredXP - totalXP} more XP to unlock{" "}
                  {nextMilestone.name} {nextMilestone.emoji}
                </Text>
              </View>
            )}

            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
              <View style={styles.badgesContainer}>
                <Text style={styles.badgesTitle}>Your Badges</Text>
                <View style={styles.badgesGrid}>
                  {earnedBadges.map((badge) => (
                    <View key={badge.id} style={styles.badgeItem}>
                      <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                      <Text style={styles.badgeName}>{badge.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Motivational Quote */}
            <View style={styles.quoteContainer}>
              <Text style={styles.quote}>"{quote}"</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.95,
    maxHeight: height * 0.9,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  content: {
    backgroundColor: "rgba(253, 252, 248, 0.95)",
    borderRadius: 32,
    maxHeight: height * 0.9,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#121111",
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(18, 17, 17, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#121111",
  },
  floatingSparkle: {
    position: "absolute",
    fontSize: 16,
    zIndex: 1000,
  },
  progressSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  todaysXPContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(147, 213, 225, 0.3)",
    borderRadius: 20,
    paddingVertical: 20,
    marginRight: 10,
  },
  todaysXPNumber: {
    fontSize: 48,
    fontWeight: "900",
    color: "#121111",
    textShadowColor: "rgba(147, 213, 225, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  todaysXPLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#121111",
    opacity: 0.8,
  },
  streakContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255, 227, 125, 0.3)",
    borderRadius: 20,
    paddingVertical: 20,
    marginLeft: 10,
    justifyContent: "center",
  },
  streakEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: "900",
    color: "#121111",
    textShadowColor: "rgba(255, 227, 125, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#121111",
    opacity: 0.8,
  },
  streakText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.8,
    textAlign: "center",
  },
  activitiesContainer: {
    padding: 20,
    paddingHorizontal: 16,
  },
  activitiesTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#121111",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  activityCard: {
    width: (width - 80) / 2,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 6,
    alignItems: "center",
    shadowColor: "#121111",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  activityEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#121111",
    textAlign: "center",
    marginBottom: 8,
  },
  xpBadge: {
    backgroundColor: "#121111",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  activityDescription: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 16,
  },
  milestoneContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    margin: 20,
    padding: 20,
    shadowColor: "#121111",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  milestoneTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#121111",
    textAlign: "center",
    marginBottom: 16,
  },
  milestoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  milestoneEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 4,
  },
  milestoneProgress: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.7,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(18, 17, 17, 0.1)",
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#93D5E1",
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "700",
    color: "#121111",
    minWidth: 40,
  },
  milestoneDescription: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.8,
    textAlign: "center",
    fontStyle: "italic",
  },
  badgesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  badgesTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#121111",
    textAlign: "center",
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  badgeItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 12,
    margin: 6,
    minWidth: 80,
    shadowColor: "#121111",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
    textAlign: "center",
  },
  quoteContainer: {
    backgroundColor: "rgba(244, 216, 254, 0.6)",
    borderRadius: 20,
    margin: 20,
    marginTop: 0,
    padding: 20,
    alignItems: "center",
  },
  quote: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 24,
    letterSpacing: 0.5,
  },
});

export default XPRulesModal;
