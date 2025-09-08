import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { motivationalPage } from "../../data/questions";

export default function MotivationPage() {
  const glowAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.3,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Create scale animation
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    glowAnimation.start();
    scaleAnimation.start();

    return () => {
      glowAnimation.stop();
      scaleAnimation.stop();
    };
  }, []);

  const handleContinue = () => {
    router.push("/onboarding/results");
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
        
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.title}>{motivationalPage.title}</Text>
            
            <View style={styles.emojiContainer}>
              <Animated.View
                style={[
                  styles.emojiGlow,
                  {
                    transform: [{ scale: glowAnim }],
                    opacity: glowAnim.interpolate({
                      inputRange: [1, 1.3],
                      outputRange: [0.3, 0.1],
                    }),
                  },
                ]}
              />
              <Animated.Text
                style={[
                  styles.emoji,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                {motivationalPage.emoji}
              </Animated.Text>
            </View>
            
            <Text style={styles.subtitle}>{motivationalPage.subtitle}</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "300",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 60,
    lineHeight: 36,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: undefined }),
    maxWidth: 320,
  },
  emojiContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 60,
  },
  emojiGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FF6B35",
    shadowColor: "#FF6B35",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    elevation: 20,
  },
  emoji: {
    fontSize: 80,
    textAlign: "center",
    zIndex: 1,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    color: "#9575CD",
    lineHeight: 28,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: undefined }),
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
