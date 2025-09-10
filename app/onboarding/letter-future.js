import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LetterFuturePage() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const letterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Letter slide in animation
    Animated.timing(letterAnim, {
      toValue: 1,
      duration: 1200,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    // Navigate to onboarding paywall
    router.push("/onboarding/paywall");
  };

  const letterTranslateY = letterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

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

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
            <Text style={styles.headline}>A Letter From Your Future Self</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.letterContainer,
              {
                opacity: letterAnim,
                transform: [{ translateY: letterTranslateY }]
              }
            ]}
          >
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.letterCard}
            >
              <View style={styles.letterHeader}>
                <Text style={styles.letterDate}>3 Months from now</Text>
                <Text style={styles.letterFromText}>From: Future You</Text>
              </View>

              <View style={styles.letterContent}>
                <Text style={styles.letterText}>
                  I'm proud of you. A few weeks ago, you decided to stop doomscrolling and reset your life. 
                  Now, I feel more focused, happier, and in control.
                </Text>

                <Text style={styles.letterText}>
                  The morning routine we built has become second nature. Instead of reaching for our phone 
                  first thing, we meditate for 10 minutes and journal about our goals.
                </Text>

                <Text style={styles.letterText}>
                  Our focus at work has improved dramatically. Colleagues have noticed. That promotion 
                  we've been wanting? It's within reach now.
                </Text>

                <Text style={styles.letterTextHighlight}>
                  This was the moment it all changed. Thank you for taking the first step.
                </Text>

                <Text style={styles.letterSignature}>
                  With gratitude,{"\n"}Your Future Self ✨
                </Text>
              </View>

              {/* Sparkle effect */}
              <Animated.View 
                style={[
                  styles.sparkleContainer,
                  { opacity: glowAnim }
                ]}
              >
                <Text style={styles.sparkle}>✨</Text>
                <Text style={[styles.sparkle, styles.sparkle2]}>✨</Text>
                <Text style={[styles.sparkle, styles.sparkle3]}>✨</Text>
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.motivationalSection, { opacity: fadeAnim }]}>
            <Text style={styles.motivationalText}>
              Your transformation starts now
            </Text>
            <Text style={styles.motivationalSubtext}>
              Join thousands who've already changed their lives with Wake Scroll
            </Text>
          </Animated.View>
        </ScrollView>

        <View style={styles.bottomArea}>
          <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleContinue}>
            <LinearGradient
              colors={["#9575CD", "#7B68EE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Start My Journey</Text>
              <Text style={styles.buttonIcon}>🚀</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  headline: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#ffffff",
    fontFamily: serifFamily,
    lineHeight: 32,
  },
  letterContainer: {
    marginBottom: 30,
  },
  letterCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
    position: "relative",
  },
  letterHeader: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  letterDate: {
    fontSize: 12,
    color: "#9575CD",
    fontWeight: "600",
    marginBottom: 4,
  },
  letterFromText: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.8,
    fontStyle: "italic",
  },
  letterContent: {
    paddingBottom: 20,
  },
  letterText: {
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: serifFamily,
  },
  letterTextHighlight: {
    fontSize: 16,
    color: "#9575CD",
    fontWeight: "600",
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: serifFamily,
    fontStyle: "italic",
  },
  letterSignature: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "right",
    fontStyle: "italic",
  },
  sparkleContainer: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  sparkle: {
    fontSize: 12,
    position: "absolute",
  },
  sparkle2: {
    top: 15,
    left: 20,
  },
  sparkle3: {
    top: -5,
    left: 35,
  },
  motivationalSection: {
    alignItems: "center",
    backgroundColor: "rgba(149, 117, 205, 0.1)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(149, 117, 205, 0.3)",
  },
  motivationalText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#9575CD",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: serifFamily,
  },
  motivationalSubtext: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 18,
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  button: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 28,
    shadowColor: "#9575CD",
    shadowOpacity: 0.4,
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
  },
});
