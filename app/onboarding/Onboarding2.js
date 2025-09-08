import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Image, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

function MiniCalendar() {
  const { weeks, dayNames } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const generatedWeeks = [];
    const current = new Date(startDate);

    while (current <= lastDay || generatedWeeks.length < 6) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(current);
        const isCurrentMonth = day.getMonth() === month;
        const isToday = day.toDateString() === new Date().toDateString();
        const hasStreak = isCurrentMonth && Math.random() < 0.35;
        week.push({
          key: `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`,
          dayNum: day.getDate(),
          isCurrentMonth,
          isToday,
          hasStreak,
        });
        current.setDate(current.getDate() + 1);
      }
      generatedWeeks.push(week);
      if (current.getMonth() !== month && generatedWeeks.length >= 4) break;
    }

    return {
      weeks: generatedWeeks,
      dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    };
  }, []);

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.dayHeaderRow}>
        {dayNames.map((d) => (
          <Text key={d} style={styles.dayHeaderText}>{d}</Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day) => (
            <View
              key={day.key}
              style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.dayOutsideMonth,
                day.isToday && styles.dayToday,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  !day.isCurrentMonth && styles.dayTextOutside,
                  day.isToday && styles.dayTextToday,
                ]}
              >
                {day.dayNum}
              </Text>
              {day.hasStreak && <View style={styles.streakDot} />}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function Onboarding2() {
  const handleContinue = () => {
    router.push("/onboarding/Onboarding3");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text style={styles.topHeadline}>Ready to start your life reset journey?</Text>

          <View style={styles.card}>
            <Text style={styles.sixtySix}>66 days</Text>
            <Image
              source={require("@/assets/preBuiltTasks/soulfulNatureWalk.png")}
              resizeMode="cover"
              style={styles.heroImage}
            />
            <MiniCalendar />
          </View>

          <Text style={styles.subtitle}>
            Your next 66 days will be the most transformative period of your life.
          </Text>

          <View style={styles.bottomArea}>
            <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleContinue}>
              <LinearGradient
                colors={["#9575CD", "#7B68EE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Continue</Text>
                <Text style={styles.buttonIcon}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 12,
    justifyContent: "space-around",
  },
  topHeadline: {
    textAlign: "center",
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  sixtySix: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#9575CD",
    marginBottom: 10,
    fontFamily: serifFamily,
  },
  heroImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#2d2d2d",
  },
  calendarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  dayHeaderRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: "#ffffff",
    opacity: 0.6,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 1,
  },
  dayCell: {
    flex: 1,
    height: 26,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
  },
  dayOutsideMonth: {
    opacity: 0.3,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: "#9575CD",
    backgroundColor: "rgba(149, 117, 205, 0.2)",
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  dayTextOutside: {
    color: "rgba(255, 255, 255, 0.3)",
  },
  dayTextToday: {
    fontWeight: "800",
    color: "#9575CD",
  },
  streakDot: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFE37D",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
    color: "#ffffff",
    opacity: 0.9,
    fontStyle: "italic",
    fontFamily: serifFamily,
    lineHeight: 24,
    maxWidth: 300,
    alignSelf: "center",
    marginTop: 16,
  },
  bottomArea: {
    alignItems: "center",
  },
  button: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 28,
    shadowColor: "#9575CD",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
    marginRight: 8,
  },
  buttonIcon: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
  },
});


