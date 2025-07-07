import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MindfulHeader = ({ todaysXP = 0 }) => {
  const handleNotificationPress = () => {
    router.push("/notifications");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left side with text */}
        <View style={styles.leftContent}>
          <Text style={styles.title}>🧘 Mindful Space</Text>
          <Text style={styles.xpText}>✨ {todaysXP} XP today</Text>
        </View>

        {/* Right side with notification bell */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleNotificationPress}
          activeOpacity={0.7}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  leftContent: {
    flex: 1,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 23,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  xpText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#121111",
    opacity: 0.8,
    letterSpacing: 0.2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 4,
  },
  bellIcon: {
    fontSize: 20,
    color: "#121111",
    opacity: 0.7,
  },
});

export default MindfulHeader;
