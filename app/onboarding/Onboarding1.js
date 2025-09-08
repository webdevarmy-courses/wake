import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Dimensions, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

export default function Onboarding1() {
  const handleContinue = () => {
    router.push("/onboarding/Onboarding2");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
          <View style={styles.centerContent}>
            <View style={styles.heroContainer}>
              <Text style={styles.heroText}>Ready to start your</Text>
              <Text style={styles.heroTextAccent}>life reset journey?</Text>
              <View style={styles.underline} />
            </View>
          </View>

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
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
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
  heroContainer: {
    alignItems: "center",
  },
  heroText: {
    fontSize: 36,
    fontWeight: "300",
    textAlign: "center",
    color: "#ffffff",
    letterSpacing: -0.5,
    lineHeight: 42,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: undefined }),
    marginBottom: 8,
  },
  heroTextAccent: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    color: "#9575CD",
    letterSpacing: -0.5,
    lineHeight: 42,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: undefined }),
    marginBottom: 20,
  },
  underline: {
    width: 80,
    height: 3,
    backgroundColor: "#9575CD",
    borderRadius: 2,
    opacity: 0.7,
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


