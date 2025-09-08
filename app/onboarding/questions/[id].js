import Slider from '@react-native-community/slider';
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { onboardingQuestions } from "../../../data/questions";

const { width } = Dimensions.get("window");

function ProgressBar({ current, total }) {
  const progress = current / total;
  
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <Animated.View 
          style={[
            styles.progressFill,
            { width: `${progress * 100}%` }
          ]} 
        />
      </View>
    </View>
  );
}

function MultipleChoiceQuestion({ question, onSelect }) {
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question.question}</Text>
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            activeOpacity={0.8}
            onPress={() => onSelect(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function SliderQuestion({ question, onSelect }) {
  const [value, setValue] = useState(question.min + (question.max - question.min) / 2);
  
  const handleComplete = () => {
    onSelect(`${value} ${question.unit}`);
  };

  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question.question}</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderValue}>{value} {question.unit}</Text>
        <Slider
          style={styles.slider}
          minimumValue={question.min}
          maximumValue={question.max}
          value={value}
          onValueChange={setValue}
          minimumTrackTintColor="#9575CD"
          maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
          thumbStyle={styles.sliderThumb}
          trackStyle={styles.sliderTrack}
          step={question.step || 1}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>{question.min} {question.unit}</Text>
          <Text style={styles.sliderLabel}>{question.max}+ {question.unit}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
        <LinearGradient
          colors={["#9575CD", "#7B68EE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.continueButtonGradient}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Text style={styles.continueButtonIcon}>→</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function NumberPickerQuestion({ question, onSelect }) {
  const [value, setValue] = useState(question.min + Math.floor((question.max - question.min) / 2));
  
  const handleComplete = () => {
    onSelect(`${question.unit}${value}`);
  };

  const increment = () => {
    setValue(prev => Math.min(prev + (question.step || 1), question.max));
  };

  const decrement = () => {
    setValue(prev => Math.max(prev - (question.step || 1), question.min));
  };

  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question.question}</Text>
      <View style={styles.numberPickerContainer}>
        <TouchableOpacity style={styles.numberPickerButton} onPress={decrement}>
          <Text style={styles.numberPickerButtonText}>−</Text>
        </TouchableOpacity>
        <View style={styles.numberPickerValue}>
          <Text style={styles.numberPickerText}>{question.unit}{value}</Text>
        </View>
        <TouchableOpacity style={styles.numberPickerButton} onPress={increment}>
          <Text style={styles.numberPickerButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
        <LinearGradient
          colors={["#9575CD", "#7B68EE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.continueButtonGradient}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Text style={styles.continueButtonIcon}>→</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function ProgressGlimpsePage({ onContinue }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for progress elements
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Fade in animation for content
    const fadeAnimation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    });

    pulseAnimation.start();
    fadeAnimation.start();

    return () => {
      pulseAnimation.stop();
      fadeAnimation.stop();
    };
  }, []);

  return (
    <View style={styles.progressContainer}>
      <Animated.View style={[styles.progressHeaderContainer, { opacity: fadeAnim }]}>
        <Text style={styles.progressGlimpseTitle}>Here's how we'll track</Text>
        <Text style={styles.progressGlimpseSubtitle}>your transformation ✨</Text>
      </Animated.View>
      
      <Animated.View style={[styles.progressGlimpseBox, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={["rgba(149, 117, 205, 0.2)", "rgba(123, 104, 238, 0.1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.progressBoxGradient}
        >
          <View style={styles.mockProgress}>
            <Text style={styles.mockProgressText}>📱 Your Daily Progress</Text>
            <View style={styles.mockStatsGrid}>
              <View style={styles.mockStatCard}>
                <Text style={styles.mockStatNumber}>15</Text>
                <Text style={styles.mockStatLabel}>Day Streak</Text>
              </View>
              <View style={styles.mockStatCard}>
                <Text style={styles.mockStatNumber}>2.5h</Text>
                <Text style={styles.mockStatLabel}>Time Saved</Text>
              </View>
              <View style={styles.mockStatCard}>
                <Text style={styles.mockStatNumber}>85%</Text>
                <Text style={styles.mockStatLabel}>Less Scrolling</Text>
              </View>
              <View style={styles.mockStatCard}>
                <Text style={styles.mockStatNumber}>12</Text>
                <Text style={styles.mockStatLabel}>Focus Sessions</Text>
              </View>
            </View>
            <View style={styles.progressChart}>
              <Text style={styles.chartTitle}>Weekly Progress</Text>
              <View style={styles.mockChart}>
                <Animated.View style={[styles.mockBar, { height: '60%' }, { opacity: fadeAnim }]} />
                <Animated.View style={[styles.mockBar, { height: '80%' }, { opacity: fadeAnim }]} />
                <Animated.View style={[styles.mockBar, { height: '40%' }, { opacity: fadeAnim }]} />
                <Animated.View style={[styles.mockBar, { height: '90%' }, { opacity: fadeAnim }]} />
                <Animated.View style={[styles.mockBar, { height: '70%' }, { opacity: fadeAnim }]} />
              </View>
              <View style={styles.chartLabels}>
                <Text style={styles.chartLabel}>M</Text>
                <Text style={styles.chartLabel}>T</Text>
                <Text style={styles.chartLabel}>W</Text>
                <Text style={styles.chartLabel}>T</Text>
                <Text style={styles.chartLabel}>F</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
      
      <Animated.View style={[styles.progressDescriptionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.researchTitle}>📊 Research Findings</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statCardNumber}>2h 31m</Text>
            <Text style={styles.statCardLabel}>Average phone</Text>
            <Text style={styles.statCardLabel}>waste per day</Text>
          </View>
          <View style={styles.improvementCard}>
            <Text style={styles.improvementCardNumber}>345%</Text>
            <Text style={styles.improvementCardLabel}>Better focus &</Text>
            <Text style={styles.improvementCardLabel}>productivity</Text>
          </View>
        </View>
        <Text style={styles.improvementSubtext}>Based on scientific research and habit formation studies</Text>
      </Animated.View>

      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <LinearGradient
          colors={["#9575CD", "#7B68EE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.continueButtonGradient}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Text style={styles.continueButtonIcon}>→</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export default function QuestionPage() {
  const { id } = useLocalSearchParams();
  const questionId = id === "progress" ? "progress" : parseInt(id);
  const isProgressGlimpse = questionId === "progress"; // After question 4
  
  const totalQuestions = onboardingQuestions.length;
  const currentQuestion = typeof questionId === "number" ? onboardingQuestions.find(q => q.id === questionId) : null;
  
  const handleBack = () => {
    if (questionId === 1) {
      router.back(); // Go back to Onboarding2
    } else if (questionId === "progress") {
      router.replace("/onboarding/questions/4"); // Go back to question 4
    } else if (questionId === 5) {
      router.replace("/onboarding/questions/progress"); // Go back to progress glimpse
    } else {
      router.replace(`/onboarding/questions/${questionId - 1}`);
    }
  };

  const handleSelect = (answer) => {
    // Store answer (you might want to implement storage logic here)
    console.log(`Question ${questionId}: ${answer}`);
    
    // Navigate to next question
    if (questionId === 4) {
      router.replace("/onboarding/questions/progress"); // Progress glimpse
    } else if (questionId === totalQuestions) {
      router.replace("/onboarding/motivation"); // Go to motivation page
    } else {
      const nextId = questionId + 1;
      router.replace(`/onboarding/questions/${nextId}`);
    }
  };

  const handleProgressGlimpseContinue = () => {
    router.replace("/onboarding/questions/5");
  };

  if (isProgressGlimpse) {
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
            <ProgressBar current={4} total={totalQuestions} />
          </View>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <ProgressGlimpsePage onContinue={handleProgressGlimpseContinue} />
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>Question not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case "multiple-choice":
        return <MultipleChoiceQuestion question={currentQuestion} onSelect={handleSelect} />;
      case "slider":
        return <SliderQuestion question={currentQuestion} onSelect={handleSelect} />;
      case "number-picker":
        return <NumberPickerQuestion question={currentQuestion} onSelect={handleSelect} />;
      default:
        return <MultipleChoiceQuestion question={currentQuestion} onSelect={handleSelect} />;
    }
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
          <ProgressBar current={typeof questionId === "number" ? questionId : 4} total={totalQuestions} />
        </View>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {renderQuestion()}
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
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "300",
  },
  progressContainer: {
    flex: 1,
    height: 4,
  },
  progressBackground: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#9575CD",
    borderRadius: 2,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  questionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  questionText: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 40,
    lineHeight: 36,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: undefined }),
  },
  optionsContainer: {
    width: "100%",
    maxWidth: 320,
  },
  optionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  optionText: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "500",
  },
  sliderContainer: {
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
  },
  sliderValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#9575CD",
    marginBottom: 20,
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 10,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 40,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.6,
  },
  sliderThumb: {
    backgroundColor: "#9575CD",
    width: 20,
    height: 20,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  numberPickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  numberPickerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  numberPickerButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "300",
  },
  numberPickerValue: {
    marginHorizontal: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  numberPickerText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#9575CD",
  },
  continueButton: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 28,
    shadowColor: "#9575CD",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  continueButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
  },
  continueButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
    marginRight: 8,
  },
  continueButtonIcon: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
  },
  progressContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  progressHeaderContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  progressGlimpseTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 6,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: undefined }),
  },
  progressGlimpseSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9575CD",
    textAlign: "center",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: undefined }),
  },
  progressGlimpseBox: {
    borderRadius: 20,
    marginBottom: 24,
    width: "100%",
    maxWidth: 300,
    shadowColor: "#9575CD",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  progressBoxGradient: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "rgba(149, 117, 205, 0.4)",
  },
  mockProgress: {
    alignItems: "center",
  },
  mockProgressText: {
    fontSize: 16,
    color: "#9575CD",
    marginBottom: 16,
    fontWeight: "700",
  },
  mockStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  mockStatCard: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    width: "48%",
    marginBottom: 8,
  },
  mockStatNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFE37D",
    marginBottom: 2,
  },
  mockStatLabel: {
    fontSize: 9,
    color: "#ffffff",
    opacity: 0.8,
    fontWeight: "500",
    textAlign: "center",
  },
  progressChart: {
    alignItems: "center",
    width: "100%",
  },
  chartTitle: {
    fontSize: 12,
    color: "#9575CD",
    marginBottom: 8,
    fontWeight: "600",
  },
  mockChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 30,
    width: 120,
    justifyContent: "space-between",
    marginBottom: 4,
  },
  mockBar: {
    width: 16,
    backgroundColor: "#9575CD",
    borderRadius: 4,
    marginHorizontal: 2,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 120,
  },
  chartLabel: {
    fontSize: 8,
    color: "#ffffff",
    opacity: 0.6,
    textAlign: "center",
    width: 16,
  },
  progressDescriptionContainer: {
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
  },
  researchTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 280,
    marginBottom: 16,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "rgba(255, 227, 125, 0.15)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 227, 125, 0.3)",
    flex: 1,
    marginRight: 8,
  },
  statCardNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFE37D",
    marginBottom: 2,
  },
  statCardLabel: {
    fontSize: 11,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "center",
  },
  improvementCard: {
    alignItems: "center",
    backgroundColor: "rgba(149, 117, 205, 0.15)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(149, 117, 205, 0.3)",
    flex: 1,
    marginLeft: 8,
  },
  improvementCardNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#9575CD",
    marginBottom: 2,
  },
  improvementCardLabel: {
    fontSize: 11,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "center",
  },
  improvementSubtext: {
    fontSize: 13,
    color: "#ffffff",
    opacity: 0.7,
    textAlign: "center",
    maxWidth: 260,
  },
  errorText: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
  },
});
