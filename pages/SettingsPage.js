import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import MindfulBackground from "../components/MindfulBackground";

const SettingsPage = () => {
  return (
    <MindfulBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>⚙️ Settings Page</Text>
          <Text style={styles.subtitle}>Coming Soon</Text>
          <Text style={styles.description}>
            Customize your mindfulness experience and app preferences.
          </Text>
        </View>
      </SafeAreaView>
    </MindfulBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 24,
    opacity: 0.8,
  },
  description: {
    fontSize: 16,
    color: "#121111",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.7,
  },
});

export default SettingsPage;
