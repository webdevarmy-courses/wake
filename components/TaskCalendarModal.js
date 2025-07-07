import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getMonthlyTaskStats,
  getTaskCalendarData,
  getTaskCompletionsByDate,
  getWeeklyTaskData,
} from "../utils/taskManager";

const { width } = Dimensions.get("window");

const TaskCalendarModal = ({ visible, onClose, task }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [monthlyStats, setMonthlyStats] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCompletions, setSelectedCompletions] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  useEffect(() => {
    if (visible && task) {
      loadCalendarData();
      loadWeeklyData();
    }
  }, [visible, currentDate, currentWeekStart, task]);

  const loadCalendarData = async () => {
    if (!task) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const data = await getTaskCalendarData(task.id, year, month);
    const stats = await getMonthlyTaskStats(task.id, year, month);
    setCalendarData(data);
    setMonthlyStats(stats);
  };

  const loadWeeklyData = async () => {
    if (!task) return;

    const weekStart = getWeekStart(currentWeekStart);
    const data = await getWeeklyTaskData(task.id, weekStart);
    setWeeklyData(data);
  };

  const getWeekStart = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    return new Date(start.setDate(diff));
  };

  const handleDatePress = async (day) => {
    if (!task) return;

    const selectedDateObj = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dateString = selectedDateObj.toDateString();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const completions = await getTaskCompletionsByDate(task.id, dateString);
    setSelectedDate(selectedDateObj);
    setSelectedCompletions(completions);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedCompletions([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(newWeek.getDate() + direction * 7);
    setCurrentWeekStart(newWeek);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const weeks = [];
    const current = new Date(startDate);

    while (current <= lastDay || weeks.length < 6) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(current);
        const isCurrentMonth = day.getMonth() === month;
        const dayNum = day.getDate();
        const completionCount =
          isCurrentMonth && calendarData[dayNum]
            ? calendarData[dayNum].length
            : 0;
        const isToday = day.toDateString() === new Date().toDateString();
        const isSelected =
          selectedDate && day.toDateString() === selectedDate.toDateString();

        week.push({
          date: new Date(day),
          dayNum,
          isCurrentMonth,
          completionCount,
          isToday,
          isSelected,
        });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
      if (current.getMonth() !== month && weeks.length >= 4) break;
    }

    return weeks.map((week, weekIndex) => (
      <View key={weekIndex} style={styles.weekRow}>
        {week.map((day, dayIndex) => (
          <TouchableOpacity
            key={dayIndex}
            style={[
              styles.dayCell,
              !day.isCurrentMonth && styles.dayOutsideMonth,
              day.isToday && styles.dayToday,
              day.isSelected && styles.daySelected,
              day.completionCount > 0 && styles.dayWithCompletions,
            ]}
            onPress={() => day.isCurrentMonth && handleDatePress(day.dayNum)}
            disabled={!day.isCurrentMonth}
          >
            <Text
              style={[
                styles.dayText,
                !day.isCurrentMonth && styles.dayTextOutside,
                day.isToday && styles.dayTextToday,
                day.isSelected && styles.dayTextSelected,
              ]}
            >
              {day.dayNum}
            </Text>
            {day.completionCount > 0 && (
              <View style={styles.completionBadge}>
                <Text style={styles.completionBadgeText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    ));
  };

  const renderHeatMap = () => {
    const maxXp = Math.max(...weeklyData.map((day) => day.xpEarned), 1);

    return (
      <View style={styles.heatMapContainer}>
        <View style={styles.heatMapHeader}>
          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={() => navigateWeek(-1)}
          >
            <Text style={styles.weekNavText}>← Prev</Text>
          </TouchableOpacity>
          <Text style={styles.heatMapTitle}>
            Week of{" "}
            {currentWeekStart.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={() => navigateWeek(1)}
          >
            <Text style={styles.weekNavText}>Next →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heatMapGrid}>
          {weeklyData.map((day, index) => {
            const intensity = day.xpEarned / maxXp;
            const backgroundColor = day.completed
              ? `rgba(255, 227, 125, ${0.4 + intensity * 0.6})`
              : "rgba(18, 17, 17, 0.1)";

            return (
              <View key={index} style={styles.heatMapDay}>
                <Text style={styles.heatMapDayLabel}>
                  {day.date.toLocaleDateString("en-US", { weekday: "short" })}
                </Text>
                <View style={[styles.heatMapCell, { backgroundColor }]}>
                  {day.completed && (
                    <Text style={styles.heatMapXpText}>{day.xpEarned}</Text>
                  )}
                </View>
                <Text style={styles.heatMapDateText}>{day.date.getDate()}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderSelectedCompletions = () => {
    if (!selectedDate || selectedCompletions.length === 0) return null;

    return (
      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDateTitle}>
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
        {selectedCompletions.map((completion, index) => (
          <View key={index} style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTime}>
                Completed at{" "}
                {new Date(completion.date).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </Text>
              <View style={styles.xpBadge}>
                <Text style={styles.xpBadgeText}>
                  +{completion.xpAwarded} XP
                </Text>
              </View>
            </View>
            {completion.reflection && (
              <View style={styles.reflectionContainer}>
                <Text style={styles.reflectionLabel}>Reflection:</Text>
                <Text style={styles.reflectionText}>
                  {completion.reflection}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderMonthlyStats = () => {
    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>This Month</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{monthlyStats.completionDays}</Text>
            <Text style={styles.statLabel}>Days Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{monthlyStats.totalXpEarned}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {monthlyStats.completionRate}%
            </Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {monthlyStats.totalReflections}
            </Text>
            <Text style={styles.statLabel}>Reflections</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{task.name} Tracking</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Monthly Stats */}
          {renderMonthlyStats()}

          {/* Calendar Navigation */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth(-1)}
            >
              <Text style={styles.navButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth(1)}
            >
              <Text style={styles.navButtonText}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Day Labels */}
          <View style={styles.dayLabels}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={styles.dayLabel}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendar}>{renderCalendar()}</View>

          {/* Selected Date Details */}
          {renderSelectedCompletions()}

          {/* Heat Map */}
          {renderHeatMap()}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3FBCB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(18, 17, 17, 0.1)",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(18, 17, 17, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    textAlign: "center",
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(147, 213, 225, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#121111",
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#121111",
  },
  dayLabels: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.6,
  },
  calendar: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayCell: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderRadius: 8,
    marginHorizontal: 2,
  },
  dayOutsideMonth: {
    opacity: 0.3,
  },
  dayToday: {
    backgroundColor: "rgba(147, 213, 225, 0.5)",
  },
  daySelected: {
    backgroundColor: "#93D5E1",
  },
  dayWithCompletions: {
    backgroundColor: "rgba(255, 227, 125, 0.3)",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#121111",
  },
  dayTextOutside: {
    color: "rgba(18, 17, 17, 0.3)",
  },
  dayTextToday: {
    fontWeight: "700",
  },
  dayTextSelected: {
    fontWeight: "700",
    color: "#121111",
  },
  completionBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFE37D",
    justifyContent: "center",
    alignItems: "center",
  },
  completionBadgeText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#121111",
  },
  selectedDateContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 12,
  },
  completionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  completionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  completionTime: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.7,
  },
  xpBadge: {
    backgroundColor: "#FFE37D",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
  },
  reflectionContainer: {
    marginTop: 8,
  },
  reflectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 4,
  },
  reflectionText: {
    fontSize: 14,
    color: "#121111",
    lineHeight: 20,
    opacity: 0.8,
  },
  heatMapContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  heatMapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  weekNavButton: {
    backgroundColor: "rgba(147, 213, 225, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  weekNavText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
  },
  heatMapTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#121111",
  },
  heatMapGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heatMapDay: {
    alignItems: "center",
    flex: 1,
  },
  heatMapDayLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#121111",
    marginBottom: 4,
  },
  heatMapCell: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  heatMapXpText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#121111",
  },
  heatMapDateText: {
    fontSize: 10,
    color: "#121111",
    opacity: 0.6,
  },
  statsContainer: {
    marginHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.7,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 40,
  },
});

export default TaskCalendarModal;
