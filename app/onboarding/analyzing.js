import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { calculatePoorLifestylePercentage } from "../../data/questions";

export default function AnalyzingPage() {
  const [showResults, setShowResults] = useState(false);
  const [percentage, setPercentage] = useState(0);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const resultsOpacity = useRef(new Animated.Value(0)).current;

  // Get actual user answers (in real app, get from AsyncStorage or context)
  const getUserAnswers = () => {
    // Import the global answers from lifestyle questions
    // In production, this would come from AsyncStorage or Context
    const answers = {};
    
    // Map question IDs to answer keys for calculation
    if (global.globalAnswers) {
      answers.wakeTime = global.globalAnswers[1] || "08:00";
      answers.water = global.globalAnswers[2] || 1.5;
      answers.running = global.globalAnswers[3] || 0;
      answers.workout = global.globalAnswers[4] || 1;
      answers.meditation = global.globalAnswers[5] || 0;
      answers.reading = global.globalAnswers[6] || 0.5;
      answers.socialMedia = global.globalAnswers[7] || 35;
    } else {
      // Fallback defaults for demo
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

  useEffect(() => {
    // Calculate the percentage using actual answers
    const calculatedPercentage = calculatePoorLifestylePercentage(userAnswers);
    setPercentage(calculatedPercentage);
    console.log("Calculated poor lifestyle percentage:", calculatedPercentage, "from answers:", userAnswers);

    // Start breathing animation for loader
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
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

    breathingAnimation.start();

    // Show results after 4 seconds
    const timer = setTimeout(() => {
      // Fade out loader
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowResults(true);
        // Fade in results
        Animated.timing(resultsOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);

    return () => {
      clearTimeout(timer);
      breathingAnimation.stop();
    };
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push("/onboarding/current-rating");
  };

  const getAgeGroup = () => {
    // In real app, get from stored answers
    return "18–24 year old";
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
          {!showResults ? (
            // Loading state
            <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
              <Animated.View style={[styles.loader, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.loaderDot} />
                <View style={[styles.loaderDot, styles.loaderDot2]} />
                <View style={[styles.loaderDot, styles.loaderDot3]} />
              </Animated.View>
              <Text style={styles.loadingText}>Analyzing your habits...</Text>
            </Animated.View>
          ) : (
            // Results state
            <Animated.View style={[styles.resultsContainer, { opacity: resultsOpacity }]}>
              <View style={styles.resultContent}>
                <Text style={styles.resultText}>
                  Based on your data, you showed{" "}
                  <Text style={styles.percentageText}>{percentage}% more</Text>{" "}
                  signs of poor lifestyle and discipline than the average {getAgeGroup()}.
                </Text>
                
                <Text style={styles.sympathyText}>
                  It's normal. People in your age group often face harder challenges.
                </Text>
              </View>

              <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleContinue}>
                <LinearGradient
                  colors={["#9575CD", "#7B68EE"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>See lifestyle rating</Text>
                  <Text style={styles.buttonIcon}>📊</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
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
    backgroundColor: "rgba(0,0,0,0.3)", // Darker overlay for suspense
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  loaderDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#9575CD",
    marginHorizontal: 4,
  },
  loaderDot2: {
    backgroundColor: "#7B68EE",
  },
  loaderDot3: {
    backgroundColor: "#B39DDB",
  },
  loadingText: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.9,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  resultContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  resultText: {
    fontSize: 24,
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 32,
    fontFamily: serifFamily,
    marginBottom: 30,
  },
  percentageText: {
    color: "#FF6B6B",
    fontWeight: "700",
  },
  sympathyText: {
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 24,
    fontStyle: "italic",
    maxWidth: 280,
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
