import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MindfulBackground from "../components/MindfulBackground";
import PaywallModal from "../components/PaywallModal";

const SettingsPage = () => {
  const [paywallVisible, setPaywallVisible] = useState(false);

  return (
    <MindfulBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>⚙️ Settings Page</Text>
          <Text style={styles.subtitle}>Coming Soon</Text>
          <Text style={styles.description}>
            Customize your mindfulness experience and app preferences.
          </Text>

          {/* Test Paywall Modal Button */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => setPaywallVisible(true)}
          >
            <Text style={styles.testButtonText}>🎯 Test Paywall Modal</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Paywall Modal */}
      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
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
    marginBottom: 32,
  },
  testButton: {
    backgroundColor: "rgba(99, 102, 241, 0.9)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  testButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default SettingsPage;
