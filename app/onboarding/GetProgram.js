import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GetProgram() {
  const handleGetProgram = () => {
    try {
      router.push("/onboarding/lifestyle/1");
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback navigation
      router.replace("/onboarding/lifestyle/1");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <View style={styles.centerContent}>
            <Text style={styles.heroText}>Ready to build your</Text>
            <Text style={styles.heroTextAccent}>personalized program?</Text>
            <View style={styles.underline} />
            
            <Text style={styles.description}>
              We'll analyze your lifestyle and habits to create a custom 66-day transformation plan.
            </Text>
          </View>

          <View style={styles.bottomArea}>
            <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleGetProgram}>
              <LinearGradient
                colors={["#9575CD", "#7B68EE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Get My Program</Text>
                <Text style={styles.buttonIcon}>✨</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 30 : 0,
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "300",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  heroText: {
    fontSize: 36,
    fontWeight: "300",
    textAlign: "center",
    color: "#ffffff",
    letterSpacing: -0.5,
    lineHeight: 42,
    fontFamily: serifFamily,
    marginBottom: 8,
  },
  heroTextAccent: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    color: "#9575CD",
    letterSpacing: -0.5,
    lineHeight: 42,
    fontFamily: serifFamily,
    marginBottom: 20,
  },
  underline: {
    width: 80,
    height: 3,
    backgroundColor: "#9575CD",
    borderRadius: 2,
    opacity: 0.7,
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#ffffff",
    opacity: 0.8,
    lineHeight: 24,
    maxWidth: 300,
    fontStyle: "italic",
  },
  bottomArea: {
    paddingTop: 16,
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
