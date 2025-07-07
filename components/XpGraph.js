import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const XpGraph = ({ xpHistory }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, day: null });
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = this week, -1 = last week, etc.
  const animatedValues = useRef([]).current;

  const getLast7Days = () => {
    const days = [];
    const today = new Date();

    // Calculate the start of the week we want to show
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - currentWeekOffset * 7 - 6);

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateString = date.toDateString();

      const historyEntry = xpHistory.find((entry) => entry.date === dateString);
      days.push({
        date: dateString,
        xp: historyEntry ? historyEntry.xp : 0,
        day: date.getDate(),
        month: date.getMonth() + 1,
        isToday: dateString === today.toDateString(),
      });
    }

    return days;
  };

  const days = getLast7Days();
  const maxXP = Math.max(...days.map((day) => day.xp), 1);

  // Initialize animation values
  useEffect(() => {
    if (animatedValues.length === 0) {
      for (let i = 0; i < 7; i++) {
        animatedValues.push(new Animated.Value(0));
      }
    }

    // Animate bars on mount
    const animations = days.map((day, index) => {
      const height = day.xp > 0 ? Math.max((day.xp / maxXP) * 100, 4) : 2;
      return Animated.timing(animatedValues[index], {
        toValue: height,
        duration: 800,
        delay: index * 50,
        useNativeDriver: false,
      });
    });

    Animated.stagger(40, animations).start();
  }, [xpHistory, currentWeekOffset]);

  const handleBarPress = (day, index, event) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Calculate position for tooltip
    const barWidth = (width - 80) / 7;
    const x = 40 + index * barWidth;

    setSelectedDay(selectedDay === index ? null : index);
    setTooltip({
      visible: selectedDay !== index,
      x: Math.min(Math.max(x, 60), width - 120),
      day: day,
    });
  };

  const navigateWeek = (direction) => {
    setCurrentWeekOffset(currentWeekOffset + direction);
    setSelectedDay(null);
    setTooltip({ visible: false, x: 0, day: null });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getWeekRange = () => {
    if (days.length === 0) return "";
    const firstDay = new Date(days[0].date);
    const lastDay = new Date(days[6].date);

    if (currentWeekOffset === 0) {
      return "This Week";
    } else if (currentWeekOffset === -1) {
      return "Last Week";
    } else {
      return `${firstDay.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${lastDay.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    }
  };

  const getTodaysXP = () => {
    const today = new Date().toDateString();
    const todaysEntry = xpHistory.find((entry) => entry.date === today);
    return todaysEntry ? todaysEntry.xp : 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.weekNavButton}
          onPress={() => navigateWeek(-1)}
        >
          <Text style={styles.weekNavText}>← Prev</Text>
        </TouchableOpacity>

        <View style={styles.weekInfo}>
          <Text style={styles.title}>{getWeekRange()}</Text>
          <View style={styles.todayXP}>
            <Text style={styles.todayXPText}>Today: +{getTodaysXP()} XP</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.weekNavButton,
            currentWeekOffset === 0 && styles.weekNavButtonDisabled,
          ]}
          onPress={() => navigateWeek(1)}
          disabled={currentWeekOffset === 0}
        >
          <Text
            style={[
              styles.weekNavText,
              currentWeekOffset === 0 && styles.weekNavTextDisabled,
            ]}
          >
            Next →
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.graphContainer}>
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>{maxXP}</Text>
          <Text style={styles.yAxisLabel}>{Math.round(maxXP / 2)}</Text>
          <Text style={styles.yAxisLabel}>0</Text>
        </View>

        <View style={styles.chart}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={styles.barContainer}
              onPress={(event) => handleBarPress(day, index, event)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.bar,
                  {
                    height: animatedValues[index] || 2,
                    backgroundColor: day.isToday
                      ? "#FFE37D"
                      : day.xp > 0
                      ? "#93D5E1"
                      : "rgba(18, 17, 17, 0.1)",
                    borderColor:
                      selectedDay === index ? "#121111" : "transparent",
                    borderWidth: selectedDay === index ? 2 : 0,
                    transform: [
                      {
                        scale: selectedDay === index ? 1.1 : 1,
                      },
                    ],
                  },
                ]}
              />

              {/* Day label */}
              <Text style={[styles.dayLabel, day.isToday && styles.todayLabel]}>
                {day.day}
              </Text>

              {/* Sparkle for days with XP */}
              {day.xp > 0 && <Text style={styles.sparkle}>✨</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tooltip */}
      {tooltip.visible && tooltip.day && (
        <Animated.View
          style={[
            styles.tooltip,
            {
              left: tooltip.x - 60,
              opacity: tooltip.visible ? 1 : 0,
            },
          ]}
        >
          <Text style={styles.tooltipDate}>{formatDate(tooltip.day.date)}</Text>
          <Text style={styles.tooltipXP}>+{tooltip.day.xp} XP</Text>
          <View style={styles.tooltipArrow} />
        </Animated.View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#93D5E1" }]} />
          <Text style={styles.legendText}>XP Earned</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#FFE37D" }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: "rgba(18, 17, 17, 0.1)" },
            ]}
          />
          <Text style={styles.legendText}>No Activity</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 20,
    padding: 20,
    margin: 20,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  weekNavButton: {
    backgroundColor: "rgba(147, 213, 225, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 70,
  },
  weekNavButtonDisabled: {
    backgroundColor: "rgba(18, 17, 17, 0.1)",
  },
  weekNavText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
    textAlign: "center",
  },
  weekNavTextDisabled: {
    opacity: 0.4,
  },
  weekInfo: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 6,
  },
  todayXP: {
    backgroundColor: "#FFE37D",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  todayXPText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
  },
  graphContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  yAxis: {
    width: 30,
    height: 120,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 10,
    color: "#121111",
    opacity: 0.6,
    fontWeight: "600",
  },
  chart: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    paddingHorizontal: 4,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 1,
    paddingBottom: 20,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    marginBottom: 8,
    shadowColor: "#121111",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dayLabel: {
    fontSize: 10,
    color: "#121111",
    opacity: 0.6,
    fontWeight: "600",
    marginTop: 4,
  },
  todayLabel: {
    opacity: 1,
    fontWeight: "700",
    color: "#121111",
  },
  sparkle: {
    fontSize: 8,
    position: "absolute",
    top: -12,
  },
  tooltip: {
    position: "absolute",
    top: 60,
    backgroundColor: "#121111",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#121111",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1000,
  },
  tooltipDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  tooltipXP: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFE37D",
    textAlign: "center",
  },
  tooltipArrow: {
    position: "absolute",
    bottom: -6,
    left: "50%",
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#121111",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.7,
    fontWeight: "600",
  },
});

export default XpGraph;
