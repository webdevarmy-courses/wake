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
  getMonthlyTimerStats,
  getTimerCalendarData,
  getTimerSessionsByDate,
  getWeeklyTimerData,
} from "../utils/timerManager";

const { width } = Dimensions.get("window");

const TimerCalendarModal = ({ visible, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [monthlyStats, setMonthlyStats] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  useEffect(() => {
    if (visible) {
      loadCalendarData();
      loadWeeklyData();
    }
  }, [visible, currentDate, currentWeekStart]);

  const loadCalendarData = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const data = await getTimerCalendarData(year, month);
    const stats = await getMonthlyTimerStats(year, month);
    setCalendarData(data);
    setMonthlyStats(stats);
  };

  const loadWeeklyData = async () => {
    const weekStart = getWeekStart(currentWeekStart);
    const data = await getWeeklyTimerData(weekStart);
    setWeeklyData(data);
  };

  const getWeekStart = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    return new Date(start.setDate(diff));
  };

  const handleDatePress = async (day) => {
    const selectedDateObj = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dateString = selectedDateObj.toDateString();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const sessions = await getTimerSessionsByDate(dateString);
    setSelectedDate(selectedDateObj);
    setSelectedSessions(sessions);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedSessions([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(newWeek.getDate() + direction * 7);
    setCurrentWeekStart(newWeek);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
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
        const sessionCount =
          isCurrentMonth && calendarData[dayNum]
            ? calendarData[dayNum].length
            : 0;
        const totalMinutes =
          isCurrentMonth && calendarData[dayNum]
            ? calendarData[dayNum].reduce(
                (total, session) => total + session.durationMinutes,
                0
              )
            : 0;
        const isToday = day.toDateString() === new Date().toDateString();
        const isSelected =
          selectedDate && day.toDateString() === selectedDate.toDateString();

        week.push({
          date: new Date(day),
          dayNum,
          isCurrentMonth,
          sessionCount,
          totalMinutes,
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
              day.sessionCount > 0 && styles.dayWithSessions,
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
            {day.sessionCount > 0 && (
              <View style={styles.sessionBadge}>
                <Text style={styles.sessionBadgeText}>
                  {formatDuration(day.totalMinutes)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    ));
  };

  const renderHeatMap = () => {
    const maxMinutes = Math.max(
      ...weeklyData.map((day) => day.totalMinutes),
      1
    );

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
            const intensity = day.totalMinutes / maxMinutes;
            const backgroundColor =
              day.totalMinutes === 0
                ? "rgba(18, 17, 17, 0.1)"
                : `rgba(255, 227, 125, ${0.3 + intensity * 0.7})`;

            return (
              <View key={index} style={styles.heatMapDay}>
                <Text style={styles.heatMapDayLabel}>
                  {day.date.toLocaleDateString("en-US", { weekday: "short" })}
                </Text>
                <View style={[styles.heatMapCell, { backgroundColor }]}>
                  <Text style={styles.heatMapTime}>
                    {formatDuration(day.totalMinutes)}
                  </Text>
                  <Text style={styles.heatMapCount}>{day.sessionCount}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.heatMapLegend}>
          <Text style={styles.legendText}>Less</Text>
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, index) => (
            <View
              key={index}
              style={[
                styles.legendCell,
                {
                  backgroundColor:
                    intensity === 0
                      ? "rgba(18, 17, 17, 0.1)"
                      : `rgba(255, 227, 125, ${0.3 + intensity * 0.7})`,
                },
              ]}
            />
          ))}
          <Text style={styles.legendText}>More</Text>
        </View>
      </View>
    );
  };

  const renderSelectedSessions = () => {
    if (!selectedDate || selectedSessions.length === 0) return null;

    const totalMinutes = selectedSessions.reduce(
      (total, session) => total + session.durationMinutes,
      0
    );

    return (
      <View style={styles.selectedSessionsContainer}>
        <Text style={styles.selectedDateTitle}>
          🌿{" "}
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.selectedDateSubtitle}>
          {selectedSessions.length} session
          {selectedSessions.length !== 1 ? "s" : ""} •{" "}
          {formatDuration(totalMinutes)} total
        </Text>

        <ScrollView
          style={styles.sessionsList}
          showsVerticalScrollIndicator={false}
        >
          {selectedSessions.map((session, index) => (
            <View key={session.id} style={styles.sessionItem}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTime}>
                  {new Date(session.date).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={styles.sessionDuration}>
                  {formatDuration(session.durationMinutes)}
                </Text>
              </View>
              <Text style={styles.sessionDescription}>
                Screen-free mindful break completed 🧘‍♀️
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⏰ Screen-Free History</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Monthly Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {monthlyStats.totalSessions || 0}
                </Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatDuration(monthlyStats.totalMinutes || 0)}
                </Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {monthlyStats.daysWithSessions || 0}
                </Text>
                <Text style={styles.statLabel}>Days</Text>
              </View>
            </View>
          </View>

          {/* Calendar Navigation */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth(-1)}
            >
              <Text style={styles.navButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth(1)}
            >
              <Text style={styles.navButtonText}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {dayNames.map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>{renderCalendar()}</View>

          {/* Selected Date Sessions */}
          {renderSelectedSessions()}

          {/* Heat Map */}
          {renderHeatMap()}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(18, 17, 17, 0.1)",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(18, 17, 17, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#121111",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#121111",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    textAlign: "center",
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFE37D",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.7,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 227, 125, 0.3)",
    alignItems: "center",
    justifyContent: "center",
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
  dayHeaders: {
    flexDirection: "row",
    marginBottom: 10,
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.7,
    paddingVertical: 8,
  },
  calendarGrid: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
  },
  weekRow: {
    flexDirection: "row",
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    position: "relative",
  },
  dayOutsideMonth: {
    backgroundColor: "transparent",
  },
  dayToday: {
    backgroundColor: "#93D5E1",
    borderWidth: 2,
    borderColor: "#121111",
  },
  daySelected: {
    backgroundColor: "#FFE37D",
    borderWidth: 2,
    borderColor: "#121111",
  },
  dayWithSessions: {
    backgroundColor: "rgba(255, 227, 125, 0.6)",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  dayTextOutside: {
    opacity: 0.3,
  },
  dayTextToday: {
    fontWeight: "700",
  },
  dayTextSelected: {
    fontWeight: "700",
    color: "#121111",
  },
  sessionBadge: {
    position: "absolute",
    bottom: 2,
    left: 2,
    right: 2,
    backgroundColor: "#121111",
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  sessionBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#F3FBCB",
    textAlign: "center",
  },
  selectedSessionsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 4,
  },
  selectedDateSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.7,
    marginBottom: 15,
  },
  sessionsList: {
    maxHeight: 200,
  },
  sessionItem: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sessionTime: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.6,
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFE37D",
    backgroundColor: "rgba(255, 227, 125, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sessionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#121111",
    fontStyle: "italic",
  },
  heatMapContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    padding: 20,
  },
  heatMapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  weekNavButton: {
    backgroundColor: "rgba(255, 227, 125, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
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
    marginBottom: 15,
  },
  heatMapDay: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  heatMapDayLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.7,
    marginBottom: 8,
  },
  heatMapCell: {
    width: 40,
    height: 60,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(18, 17, 17, 0.1)",
    paddingVertical: 4,
  },
  heatMapTime: {
    fontSize: 11,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 2,
  },
  heatMapCount: {
    fontSize: 9,
    fontWeight: "500",
    color: "#121111",
    opacity: 0.7,
    textAlign: "center",
  },
  heatMapLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  legendText: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.7,
    marginHorizontal: 8,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: "rgba(18, 17, 17, 0.1)",
  },
});

export default TimerCalendarModal;
