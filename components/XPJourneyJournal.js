import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getBreathingSessions } from "../utils/breathingManager";
import { getJournalEntries } from "../utils/journalManager";
import { getReflections } from "../utils/reflectionManager";
import { getTaskCompletions } from "../utils/taskManager";
import { getTimerSessions } from "../utils/timerManager";
import { getXPHistory } from "../utils/xpManager";

const { width } = Dimensions.get("window");

const XPJourneyJournal = forwardRef((props, ref) => {
  const [journeyData, setJourneyData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(21);
  const [expandedCard, setExpandedCard] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayGlowAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef(null);

  // Expose refreshData method to parent component
  useImperativeHandle(ref, () => ({
    refreshData: () => {
      loadJourneyData();
    },
  }));

  useEffect(() => {
    loadJourneyData();
    startTodayGlowAnimation();
  }, [selectedPeriod]);

  const startTodayGlowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(todayGlowAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(todayGlowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadJourneyData = async () => {
    try {
      setLoading(true);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (selectedPeriod - 1));

      const [
        xpHistory,
        taskCompletions,
        breathingSessions,
        journalEntries,
        reflections,
        timerSessions,
      ] = await Promise.all([
        getXPHistory(),
        getTaskCompletions(),
        getBreathingSessions(),
        getJournalEntries(),
        getReflections(),
        getTimerSessions(),
      ]);

      const journey = [];

      for (let i = 0; i < selectedPeriod; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = currentDate.toDateString();
        const isToday = dateString === new Date().toDateString();

        const dayXPEntry = xpHistory.find((entry) => entry.date === dateString);
        const totalXP = dayXPEntry ? dayXPEntry.xp : 0;

        const activities = [];

        const dayTasks = taskCompletions.filter(
          (completion) =>
            completion.dateString === dateString && completion.completed
        );
        dayTasks.forEach((task) => {
          activities.push({
            type: "task",
            icon:
              task.taskCategory === "Personal"
                ? "🎯"
                : getTaskCategoryIcon(task.taskCategory),
            label: task.taskName,
            xp: task.xpAwarded,
            time: new Date(task.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        });

        const dayBreathing = breathingSessions.filter(
          (session) => session.dateString === dateString && session.completed
        );
        dayBreathing.forEach((session) => {
          activities.push({
            type: "breathing",
            icon: "🌬️",
            label: "1-min Breathing",
            xp: 5,
            time: new Date(session.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        });

        const dayTimer = timerSessions.filter(
          (session) => session.dateString === dateString
        );
        dayTimer.forEach((session) => {
          activities.push({
            type: "timer",
            icon: "⏳",
            label: "Screen-Free Timer",
            xp: 4,
            time: new Date(session.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        });

        const dayJournal = journalEntries.filter(
          (entry) => entry.dateString === dateString
        );
        dayJournal.forEach((entry) => {
          activities.push({
            type: "journal",
            icon: "📓",
            label: "Quick Journal",
            xp: 3,
            time: new Date(entry.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        });

        const dayReflections = reflections.filter(
          (reflection) => reflection.dateString === dateString
        );
        dayReflections.forEach((reflection) => {
          activities.push({
            type: "reflection",
            icon: "💭",
            label: "Reflect Card",
            xp: 3,
            time: new Date(reflection.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        });

        activities.sort((a, b) => a.time.localeCompare(b.time));

        journey.push({
          date: currentDate,
          dateString,
          isToday,
          totalXP,
          activities,
          isMilestone: totalXP >= 50,
          isHighMilestone: totalXP >= 100,
          hasActivities: activities.length > 0,
        });
      }

      setJourneyData(journey.reverse());
    } catch (error) {
      console.error("Error loading journey data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTaskCategoryIcon = (category) => {
    switch (category) {
      case "High Energy":
        return "💪";
      case "Low Energy":
        return "🧘";
      case "Spiritual":
        return "🙏";
      case "Wellness":
        return "🌿";
      case "Fitness":
        return "🏃";
      case "Cognitive":
        return "🧠";
      default:
        return "✅";
    }
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleCardPress = (dateString) => {
    if (expandedCard === dateString) {
      setExpandedCard(null);
    } else {
      setExpandedCard(dateString);
    }
  };

  const scrollToDay = (targetDateString) => {
    const targetIndex = journeyData.findIndex(
      (day) => day.dateString === targetDateString
    );
    if (targetIndex !== -1 && scrollViewRef.current) {
      // Calculate dynamic scroll position based on actual card content
      let scrollPosition = 0;

      for (let i = 0; i < targetIndex; i++) {
        const dayData = journeyData[i];
        // Base card height
        let cardHeight = 120;

        if (dayData.hasActivities) {
          // Add height for XP bar
          cardHeight += 24;

          // Add height for milestone badge if present
          if (dayData.isMilestone) {
            cardHeight += 36;
          }

          // Add height for activities (each activity row is ~40px)
          const visibleActivities = Math.min(dayData.activities.length, 3);
          cardHeight += visibleActivities * 40;

          // Add height for "more activities" text if there are more than 3
          if (dayData.activities.length > 3) {
            cardHeight += 24;
          }
        } else {
          // Empty day cards are shorter
          cardHeight = 100;
        }

        // Add margin between cards
        cardHeight += 16;

        // Add extra height for today's nudge card if it appears before this card
        if (i === 0 && journeyData[0].isToday) {
          cardHeight += 60; // Height of nudge card
        }

        scrollPosition += cardHeight;
      }

      scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
    }
  };

  const getLastWeekData = (currentDate) => {
    const lastWeek = new Date(currentDate);
    lastWeek.setDate(currentDate.getDate() - 7);
    const lastWeekString = lastWeek.toDateString();

    return journeyData.find((day) => day.dateString === lastWeekString);
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {[7, 21, 66].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodTab,
            selectedPeriod === period && styles.periodTabActive,
          ]}
          onPress={() => {
            setSelectedPeriod(period);
            setExpandedCard(null);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }}
        >
          <Text
            style={[
              styles.periodTabText,
              selectedPeriod === period && styles.periodTabTextActive,
            ]}
          >
            {period === 7 ? "Last 7 D" : period === 21 ? "21 D" : "66 D"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderXPBar = (totalXP, maxXP = 100) => {
    const fillPercentage = Math.min((totalXP / maxXP) * 100, 100);

    return (
      <View style={styles.xpBarContainer}>
        <View style={styles.xpBarBackground}>
          <Animated.View
            style={[styles.xpBarFill, { width: `${fillPercentage}%` }]}
          />
        </View>
        <Text style={styles.xpBarText}>+{totalXP} XP</Text>
      </View>
    );
  };

  const renderLastWeekNudge = (todayData) => {
    const lastWeekData = getLastWeekData(todayData.date);
    if (!lastWeekData) return null;

    const lastWeekDay = new Date(lastWeekData.date).toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    const isBeatingLastWeek = todayData.totalXP > lastWeekData.totalXP;
    const difference = todayData.totalXP - lastWeekData.totalXP;

    return (
      <TouchableOpacity
        style={styles.nudgeCard}
        onPress={() => scrollToDay(lastWeekData.dateString)}
        activeOpacity={0.7}
      >
        <View style={styles.nudgeContent}>
          <Text style={styles.nudgeTitle}>
            📅 Last {lastWeekDay.split(",")[0]}, You Earned{" "}
            {lastWeekData.totalXP} XP
          </Text>
          {isBeatingLastWeek ? (
            <Text style={styles.nudgeMessageSuccess}>
              🎉 You're beating it by {difference} XP! Keep going!
            </Text>
          ) : (
            <Text style={styles.nudgeMessage}>
              🎯 Let's beat it this time? Tap to see that day →
            </Text>
          )}
        </View>
        <View style={styles.nudgeArrow}>
          <Text style={styles.nudgeArrowText}>→</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderJourneyCard = (dayData) => {
    const isExpanded = expandedCard === dayData.dateString;

    return (
      <TouchableOpacity
        key={dayData.dateString}
        style={[
          styles.journeyCard,
          dayData.isToday && styles.todayCard,
          !dayData.hasActivities && styles.emptyCard,
        ]}
        onPress={() => handleCardPress(dayData.dateString)}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.cardContent,
            dayData.isToday && { transform: [{ scale: todayGlowAnim }] },
          ]}
        >
          <View style={styles.dateHeader}>
            <View
              style={[styles.datePill, dayData.isToday && styles.todayDatePill]}
            >
              <Text
                style={[
                  styles.dateText,
                  dayData.isToday && styles.todayDateText,
                ]}
              >
                📆 {formatDate(dayData.date)}
              </Text>
              {/* {dayData.isToday && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>Today</Text>
                </View>
              )} */}
            </View>
          </View>

          {dayData.hasActivities ? (
            <>
              {renderXPBar(dayData.totalXP)}

              {dayData.isMilestone && (
                <View style={styles.milestoneBadge}>
                  <Text style={styles.milestoneBadgeText}>
                    {dayData.isHighMilestone
                      ? "🎉 Epic Day - 100+ XP!"
                      : "✨ You reached 50+ XP!"}
                  </Text>
                </View>
              )}

              <View style={styles.activitiesPreview}>
                {dayData.activities
                  .slice(0, isExpanded ? dayData.activities.length : 3)
                  .map((activity, index) => (
                    <View key={index} style={styles.activityRow}>
                      <Text style={styles.activityIcon}>{activity.icon}</Text>
                      <Text style={styles.activityLabel}>{activity.label}</Text>
                      <Text style={styles.activityXP}>+{activity.xp} XP</Text>
                    </View>
                  ))}

                {!isExpanded && dayData.activities.length > 3 && (
                  <Text style={styles.moreActivitiesText}>
                    +{dayData.activities.length - 3} more activities...
                  </Text>
                )}
              </View>
            </>
          ) : (
            <View style={styles.emptyDayContent}>
              <Text style={styles.emptyDayText}>
                No mindful activities tracked this day
              </Text>
              <Text style={styles.emptyDaySubtext}>
                Start your journey today! 🌱
              </Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 Your Mindfulness Journey</Text>
      <Text style={styles.subtitle}>Daily progress cards and reflection</Text>

      {renderPeriodSelector()}

      <ScrollView
        ref={scrollViewRef}
        style={styles.journeyContainer}
        contentContainerStyle={styles.journeyContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your journey...</Text>
          </View>
        ) : journeyData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Start your mindfulness journey today! 🌱
            </Text>
          </View>
        ) : (
          journeyData.map((dayData, index) => (
            <React.Fragment key={dayData.dateString}>
              {dayData.isToday && renderLastWeekNudge(dayData)}
              {renderJourneyCard(dayData)}
            </React.Fragment>
          ))
        )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#121111",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "rgba(243, 251, 203, 0.3)",
    borderRadius: 20,
    padding: 6,
    marginBottom: 20,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  periodTabActive: {
    backgroundColor: "rgba(147, 213, 225, 0.8)",
  },
  periodTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.7,
  },
  periodTabTextActive: {
    opacity: 1,
  },
  journeyContainer: {
    maxHeight: 500,
  },
  journeyContent: {
    paddingVertical: 10,
  },
  journeyCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(147, 213, 225, 0.2)",
  },
  todayCard: {
    backgroundColor: "rgba(147, 213, 225, 0.15)",
    borderColor: "rgba(147, 213, 225, 0.4)",
    borderWidth: 2,
  },
  emptyCard: {
    backgroundColor: "rgba(243, 251, 203, 0.3)",
    borderColor: "rgba(243, 251, 203, 0.5)",
  },
  cardContent: {
    padding: 18,
  },
  dateHeader: {
    marginBottom: 14,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244, 216, 254, 0.6)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  todayDatePill: {
    backgroundColor: "rgba(147, 213, 225, 0.8)",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
  },
  todayDateText: {
    color: "#121111",
  },
  todayBadge: {
    backgroundColor: "rgba(147, 213, 225, 1)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#121111",
  },
  xpBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  xpBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(147, 213, 225, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 12,
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: "#93D5E1",
    borderRadius: 4,
  },
  xpBarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#121111",
    minWidth: 60,
    textAlign: "right",
  },
  milestoneBadge: {
    backgroundColor: "rgba(244, 216, 254, 0.8)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  milestoneBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
  },
  activitiesPreview: {
    marginTop: 4,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(18, 17, 17, 0.05)",
  },
  activityIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  activityLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#121111",
  },
  activityXP: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
    backgroundColor: "rgba(255, 227, 125, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  moreActivitiesText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#121111",
    opacity: 0.6,
    textAlign: "center",
    paddingVertical: 8,
  },
  emptyDayContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyDayText: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.6,
    marginBottom: 4,
  },
  emptyDaySubtext: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.5,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#121111",
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#121111",
    opacity: 0.7,
    textAlign: "center",
  },
  nudgeCard: {
    backgroundColor: "rgba(255, 227, 125, 0.15)",
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 227, 125, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nudgeContent: {
    flex: 1,
  },
  nudgeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 4,
  },
  nudgeMessage: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.8,
  },
  nudgeMessageSuccess: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.8,
    fontWeight: "600",
  },
  nudgeArrow: {
    marginLeft: 12,
    paddingHorizontal: 8,
  },
  nudgeArrowText: {
    fontSize: 18,
    color: "#121111",
    opacity: 0.6,
  },
});

export default XPJourneyJournal;
