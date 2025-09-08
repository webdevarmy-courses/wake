import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { calculatePotentialRating, calculateRating } from "../../data/questions";

const { width } = Dimensions.get("window");

function PotentialRatingCard({ title, score, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const delay = index * 200; // Stagger animation
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
    }, delay);
  }, []);

  return (
    <Animated.View 
      style={[
        styles.ratingCard, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={["rgba(76, 175, 80, 0.2)", "rgba(76, 175, 80, 0.1)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <Text style={styles.ratingTitle}>{title}</Text>
        <Animated.Text 
          style={[
            styles.ratingScore, 
            { 
              opacity: glowAnim,
              color: "#4CAF50" 
            }
          ]}
        >
          {score}
        </Animated.Text>
        <View style={styles.improvementIndicator}>
          <Text style={styles.improvementText}>↗</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export default function PotentialRatingPage() {
  // Get actual user answers from global state
  const getUserAnswers = () => {
    const answers = {};
    
    if (global.globalAnswers) {
      answers.wakeTime = global.globalAnswers[1] || "08:00";
      answers.water = global.globalAnswers[2] || 1.5;
      answers.running = global.globalAnswers[3] || 0;
      answers.workout = global.globalAnswers[4] || 1;
      answers.meditation = global.globalAnswers[5] || 0;
      answers.reading = global.globalAnswers[6] || 0.5;
      answers.socialMedia = global.globalAnswers[7] || 35;
    } else {
      // Fallback defaults
      answers.wakeTime = "08:30";
      answers.water = 1.5;
      answers.running = 0;
      answers.workout = 1;
      answers.meditation = 0;
      answers.reading = 0.5;
      answers.socialMedia = 35;
    }
    
    return answers;
  };

  const userAnswers = getUserAnswers();
  const currentRating = calculateRating(userAnswers);
  const potentialRating = calculatePotentialRating(currentRating);
  
  console.log("Potential rating calculation:", potentialRating, "from current:", currentRating);
  
  const ratingData = [
    { title: "Overall", score: potentialRating.overall },
    { title: "Wisdom", score: potentialRating.wisdom },
    { title: "Strength", score: potentialRating.strength },
    { title: "Focus", score: potentialRating.focus },
    { title: "Confidence", score: potentialRating.confidence },
    { title: "Discipline", score: potentialRating.discipline },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    // Navigate to Core Features page
    router.push("/onboarding/core-features");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#1a2a1a", "#2d3d2d", "#1a2a1a"]} // Green-tinted gradient for hope
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
            <Text style={styles.headline}>Your Potential Rating</Text>
            <Text style={styles.description}>
              This is where you could be in 66 days with Wake Scroll.
            </Text>
            <View style={styles.motivationalBadge}>
              <Text style={styles.badgeText}>✨ Your Future Self ✨</Text>
            </View>
          </View>

          <View style={styles.ratingsGrid}>
            {ratingData.map((item, index) => (
              <PotentialRatingCard
                key={item.title}
                title={item.title}
                score={item.score}
                index={index}
              />
            ))}
          </View>

          <View style={styles.motivationalSection}>
            <Text style={styles.motivationalText}>
              🌟 Ready to unlock your potential?
            </Text>
            <Text style={styles.subText}>
              Join thousands who've transformed their lives in just 66 days.
            </Text>
          </View>

          <View style={styles.bottomArea}>
            <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleContinue}>
              <LinearGradient
                colors={["#4CAF50", "#66BB6A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>See how I will improve</Text>
                <Text style={styles.buttonIcon}>🎯</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const serifFamily = Platform.select({ ios: "Georgia", android: "serif", default: undefined });

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1a2a1a",
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
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#4CAF50",
    marginBottom: 15,
    fontFamily: serifFamily,
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    color: "#ffffff",
    opacity: 0.9,
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: 15,
    fontStyle: "italic",
  },
  motivationalBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.4)",
  },
  badgeText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 14,
  },
  ratingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  ratingCard: {
    width: (width - 56) / 2, // Account for padding and gap
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  cardGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
    borderRadius: 16,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  ratingScore: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  improvementIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(76, 175, 80, 0.3)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  improvementText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "700",
  },
  motivationalSection: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.2)",
  },
  motivationalText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: serifFamily,
  },
  subText: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 18,
  },
  bottomArea: {
    alignItems: "center",
    paddingTop: 20,
  },
  button: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 28,
    shadowColor: "#4CAF50",
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
