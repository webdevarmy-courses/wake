import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { calculateRating } from "../../data/questions";

const { width } = Dimensions.get("window");

function RatingCard({ title, score, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
    }, delay);
  }, []);

  // Color based on score
  const getScoreColor = (score) => {
    if (score >= 60) return "#4ECDC4";
    if (score >= 40) return "#FFE37D";
    return "#FF6B6B";
  };

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
        colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <Text style={styles.ratingTitle}>{title}</Text>
        <Text style={[styles.ratingScore, { color: getScoreColor(score) }]}>
          {score}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}

export default function CurrentRatingPage() {
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
  const ratings = calculateRating(userAnswers);
  
  console.log("Current rating calculation:", ratings, "from answers:", userAnswers);
  const ratingData = [
    { title: "Overall", score: ratings.overall },
    { title: "Wisdom", score: ratings.wisdom },
    { title: "Strength", score: ratings.strength },
    { title: "Focus", score: ratings.focus },
    { title: "Confidence", score: ratings.confidence },
    { title: "Discipline", score: ratings.discipline },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push("/onboarding/potential-rating");
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
            <Text style={styles.headline}>Your Wake Scroll Rating</Text>
            <Text style={styles.description}>
              Based on your answers, this is your current rating, reflecting your lifestyle and habits now.
            </Text>
          </View>

          <View style={styles.ratingsGrid}>
            {ratingData.map((item, index) => (
              <RatingCard
                key={item.title}
                title={item.title}
                score={item.score}
                index={index}
              />
            ))}
          </View>

          <View style={styles.bottomArea}>
            <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleContinue}>
              <LinearGradient
                colors={["#9575CD", "#7B68EE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>See potential rating</Text>
                <Text style={styles.buttonIcon}>🚀</Text>
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
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 15,
    fontFamily: serifFamily,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#ffffff",
    opacity: 0.8,
    lineHeight: 22,
    maxWidth: 300,
  },
  ratingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  ratingCard: {
    width: (width - 56) / 2, // Account for padding and gap
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardGradient: {
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
  bottomArea: {
    alignItems: "center",
    paddingTop: 20,
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
  },
});
