import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

function FeatureBox({ emoji, title, description, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const delay = index * 150; // Stagger animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, []);

  return (
    <Animated.View 
      style={[
        styles.featureBox, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featureGradient}
      >
        <Text style={styles.featureEmoji}>{emoji}</Text>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

export default function CoreFeaturesPage() {
  const features = [
    {
      emoji: "🔔",
      title: "Mindful Notifications",
      description: "Gentle nudges to stop doomscrolling."
    },
    {
      emoji: "📵",
      title: "Anti-Doomscrolling Timer",
      description: "Smart timers to control usage."
    },
    {
      emoji: "📊",
      title: "Progress Tracking",
      description: "See how your habits change over time."
    },
    {
      emoji: "🌱",
      title: "Prebuilt Growth Tasks",
      description: "Habits like journaling & detox."
    },
    {
      emoji: "😊",
      title: "Mood & Reflection Logs",
      description: "Track your feelings daily."
    },
    {
      emoji: "🧘",
      title: "Mindful Exercises",
      description: "Breathing, calming focus drills."
    },
    {
      emoji: "🗓️",
      title: "Calendar Heatmaps",
      description: "Visualize streaks and activity."
    },
    {
      emoji: "💥",
      title: "Streak XP System",
      description: "Build consistency, make growth addictive."
    }
  ];

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push("/onboarding/growth-web");
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
          <View style={styles.titleContainer}>
            <Text style={styles.headline}>What You Unlock with Wake Scroll</Text>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureBox
                key={index}
                emoji={feature.emoji}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </View>
        </ScrollView>

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
    marginBottom: 30,
    paddingTop: 20,
  },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 10,
    fontFamily: serifFamily,
    lineHeight: 34,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  featureBox: {
    width: (width - 56) / 2, // Account for padding and gap
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  featureGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    minHeight: 120,
    justifyContent: "center",
  },
  featureEmoji: {
    fontSize: 28,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9575CD",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 18,
  },
  featureDescription: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 16,
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
