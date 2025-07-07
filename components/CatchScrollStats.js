import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getCatchScrollHistory,
  getTodaysCatchScrollTaps,
  getTotalCatchScrollTaps,
} from "../utils/xpManager";

const { width } = Dimensions.get("window");

const CatchScrollStats = forwardRef((props, ref) => {
  const [todayTaps, setTodayTaps] = useState(0);
  const [totalTaps, setTotalTaps] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [animatedHeight] = useState(new Animated.Value(0));
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week, 1 = last week, etc.
  const [currentWeekTotal, setCurrentWeekTotal] = useState(0);
  const [weeklyChange, setWeeklyChange] = useState(null); // {percentage: number, isDecrease: boolean}
  const [selectedDay, setSelectedDay] = useState(null); // {day: string, taps: number, date: string}

  // Expose refreshData method to parent component
  useImperativeHandle(ref, () => ({
    refreshData: () => {
      loadCatchScrollData();
    },
  }));

  useEffect(() => {
    loadCatchScrollData();
  }, [currentWeekOffset]);

  const loadCatchScrollData = async () => {
    try {
      const [today, total, history] = await Promise.all([
        getTodaysCatchScrollTaps(),
        getTotalCatchScrollTaps(),
        getCatchScrollHistory(),
      ]);

      setTodayTaps(today);
      setTotalTaps(total);

      // Calculate the start of the week we want to view
      const today_date = new Date();
      const startOfCurrentWeek = new Date(today_date);
      startOfCurrentWeek.setDate(today_date.getDate() - today_date.getDay()); // Start of current week (Sunday)

      // Apply week offset
      const targetWeekStart = new Date(startOfCurrentWeek);
      targetWeekStart.setDate(
        startOfCurrentWeek.getDate() - currentWeekOffset * 7
      );

      // Get 7 days data for the target week
      const weekData = [];
      let weekTotal = 0;

      for (let i = 0; i < 7; i++) {
        const date = new Date(targetWeekStart);
        date.setDate(targetWeekStart.getDate() + i);
        const dateString = date.toDateString();

        const dayEntry = history.find((entry) => entry.date === dateString);
        const dayTaps = dayEntry ? dayEntry.taps : 0;
        weekTotal += dayTaps;

        weekData.push({
          date: dateString,
          day: date.toLocaleDateString("en", { weekday: "short" }),
          taps: dayTaps,
          isToday: dateString === today_date.toDateString(),
        });
      }

      setWeeklyData(weekData);
      setCurrentWeekTotal(weekTotal);

      // Calculate percentage change from previous week
      const previousWeekStart = new Date(targetWeekStart);
      previousWeekStart.setDate(targetWeekStart.getDate() - 7);

      let previousWeekTotal = 0;
      for (let i = 0; i < 7; i++) {
        const date = new Date(previousWeekStart);
        date.setDate(previousWeekStart.getDate() + i);
        const dateString = date.toDateString();

        const dayEntry = history.find((entry) => entry.date === dateString);
        if (dayEntry) {
          previousWeekTotal += dayEntry.taps;
        }
      }

      // Calculate percentage change
      if (previousWeekTotal > 0) {
        const percentageChange =
          ((weekTotal - previousWeekTotal) / previousWeekTotal) * 100;
        setWeeklyChange({
          percentage: Math.abs(percentageChange),
          isDecrease: percentageChange < 0,
        });
      } else if (weekTotal > 0) {
        // If previous week was 0 but current week has data
        setWeeklyChange({
          percentage: 100,
          isDecrease: false,
        });
      } else {
        setWeeklyChange(null);
      }
    } catch (error) {
      console.error("Error loading catch scroll data:", error);
    }
  };

  const navigateWeek = (direction) => {
    setSelectedDay(null); // Clear selection when changing weeks
    if (direction === "next" && currentWeekOffset > 0) {
      setCurrentWeekOffset(currentWeekOffset - 1);
    } else if (direction === "prev") {
      setCurrentWeekOffset(currentWeekOffset + 1);
    }
  };

  const getWeekDisplayText = () => {
    if (currentWeekOffset === 0) {
      return "This Week";
    } else if (currentWeekOffset === 1) {
      return "Last Week";
    } else {
      return `${currentWeekOffset} Weeks Ago`;
    }
  };

  const getWeekDateRange = () => {
    if (weeklyData.length === 0) return "";

    const startDate = new Date(weeklyData[0].date);
    const endDate = new Date(weeklyData[6].date);

    return `${startDate.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    })} - ${endDate.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    })}`;
  };

  const handleDaySelect = (day) => {
    setSelectedDay({
      day: day.day,
      taps: day.taps,
      date: new Date(day.date).toLocaleDateString("en", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    });
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
    setSelectedDay(null); // Clear selection when collapsing/expanding
    Animated.timing(animatedHeight, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const maxTaps = Math.max(...weeklyData.map((day) => day.taps), 1);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>🎯</Text>
          <View style={styles.headerText}>
            <Text style={styles.title}>Mindful Catches</Text>
            <Text style={styles.subtitle}>Catch Me Scrolling button taps</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.todayCount}>{todayTaps}</Text>
          <Text style={styles.todayLabel}>today</Text>
          <Text style={styles.expandIcon}>{expanded ? "↑" : "↓"}</Text>
        </View>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.expandedContent,
          {
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 280], // Increased to accommodate selected day info
            }),
            opacity: animatedHeight.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0, 1],
            }),
          },
        ]}
      >
        {/* Simplified stats - current week total and change */}
        <View style={styles.simpleStats}>
          <View style={styles.weekStatsRow}>
            <Text style={styles.totalTapsNumber}>{currentWeekTotal}</Text>
            {weeklyChange && (
              <View
                style={[
                  styles.changeContainer,
                  {
                    backgroundColor: weeklyChange.isDecrease
                      ? "#E8F5E8"
                      : "#FFF0F0",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.changeText,
                    { color: weeklyChange.isDecrease ? "#4CAF50" : "#F44336" },
                  ]}
                >
                  {weeklyChange.isDecrease ? "↓" : "↑"}{" "}
                  {weeklyChange.percentage.toFixed(0)}
                  <Text style={styles.percentSign}>%</Text>
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Clean week navigation and chart */}
        <View style={styles.chartSection}>
          <View style={styles.cleanNavigation}>
            <TouchableOpacity
              style={styles.cleanNavButton}
              onPress={() => navigateWeek("prev")}
            >
              <Text style={styles.cleanNavText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.weekTitle}>{getWeekDisplayText()}</Text>

            <TouchableOpacity
              style={[
                styles.cleanNavButton,
                currentWeekOffset === 0 && styles.navDisabled,
              ]}
              onPress={() => navigateWeek("next")}
              disabled={currentWeekOffset === 0}
            >
              <Text
                style={[
                  styles.cleanNavText,
                  currentWeekOffset === 0 && styles.navTextDisabled,
                ]}
              >
                ›
              </Text>
            </TouchableOpacity>
          </View>

          {/* Simplified chart */}
          <View style={styles.miniChart}>
            {weeklyData.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={styles.miniDay}
                onPress={() => handleDaySelect(day)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.miniBar,
                    {
                      height: Math.max(
                        (day.taps /
                          Math.max(...weeklyData.map((d) => d.taps), 1)) *
                          30,
                        2
                      ),
                      backgroundColor: day.isToday
                        ? "#4ECDC4"
                        : day.taps > 0
                        ? "#93D5E1"
                        : "#E8E8E8",
                    },
                  ]}
                />
                <Text style={styles.miniDayLabel}>{day.day.charAt(0)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected day info */}
          {selectedDay && (
            <View style={styles.selectedDayInfo}>
              <Text style={styles.selectedDayDate}>{selectedDay.date}</Text>
              <Text style={styles.selectedDayTaps}>
                {selectedDay.taps} {selectedDay.taps === 1 ? "tap" : "taps"}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  headerRight: {
    alignItems: "center",
    marginRight: 8,
  },
  todayCount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4ECDC4",
  },
  todayLabel: {
    fontSize: 11,
    color: "#7F8C8D",
    fontWeight: "600",
  },
  expandIcon: {
    fontSize: 14,
    color: "#BDC3C7",
    marginTop: 4,
  },
  expandedContent: {
    overflow: "hidden",
  },
  simpleStats: {
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  weekStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  totalTapsNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4ECDC4",
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 16,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  percentSign: {
    fontSize: 11,
    fontWeight: "600",
  },
  totalTapsLabel: {
    fontSize: 13,
    color: "#7F8C8D",
    marginTop: 3,
    fontWeight: "500",
  },
  changeLabel: {
    fontSize: 11,
    color: "#BDC3C7",
    fontWeight: "400",
    marginTop: 2,
  },
  chartSection: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  cleanNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  cleanNavButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  cleanNavText: {
    fontSize: 20,
    fontWeight: "300",
    color: "#4ECDC4",
  },
  navDisabled: {
    opacity: 0.3,
  },
  navTextDisabled: {
    color: "#BDC3C7",
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E50",
  },
  miniChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 50,
    paddingHorizontal: 10,
  },
  miniDay: {
    alignItems: "center",
    flex: 1,
  },
  miniBar: {
    width: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  miniDayLabel: {
    fontSize: 10,
    color: "#BDC3C7",
    fontWeight: "500",
  },
  selectedDayInfo: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "rgba(78, 205, 196, 0.1)",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(78, 205, 196, 0.2)",
  },
  selectedDayDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 2,
  },
  selectedDayTaps: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4ECDC4",
  },
});

export default CatchScrollStats;
