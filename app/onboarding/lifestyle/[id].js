import Slider from '@react-native-community/slider';
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { lifestyleQuestions } from "../../../data/questions";

const { width } = Dimensions.get("window");

function ProgressBar({ current, total }) {
  const progress = current / total;
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress * width,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View style={[styles.progressBarFill, { width: animatedWidth }]} />
    </View>
  );
}

function TimePickerComponent({ value, onChange }) {
  const [selectedTime, setSelectedTime] = useState(value || "07:00");
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const timeOptions = [
    { time: "05:00", label: "5:00 AM", period: "Early Bird" },
    { time: "05:30", label: "5:30 AM", period: "Early Bird" },
    { time: "06:00", label: "6:00 AM", period: "Morning" },
    { time: "06:30", label: "6:30 AM", period: "Morning" },
    { time: "07:00", label: "7:00 AM", period: "Standard" },
    { time: "07:30", label: "7:30 AM", period: "Standard" },
    { time: "08:00", label: "8:00 AM", period: "Relaxed" },
    { time: "08:30", label: "8:30 AM", period: "Relaxed" },
    { time: "09:00", label: "9:00 AM", period: "Late" },
    { time: "09:30", label: "9:30 AM", period: "Late" },
    { time: "10:00", label: "10:00 AM", period: "Very Late" },
  ];

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    
    // Pulse animation for feedback
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Immediate callback, no auto-navigation
    onChange(time);
  };

  const getPeriodColor = (period) => {
    switch (period) {
      case "Early Bird": return "#4CAF50";
      case "Morning": return "#66BB6A";
      case "Standard": return "#9575CD";
      case "Relaxed": return "#FFB74D";
      case "Late": return "#FF8A65";
      case "Very Late": return "#FF6B6B";
      default: return "#9575CD";
    }
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.timeLabel}>When do you usually wake up? ⏰</Text>
      <Text style={styles.timeSubLabel}>Choose your typical wake-up time</Text>
      
      <ScrollView 
        style={styles.timeOptionsScrollView}
        contentContainerStyle={styles.timeOptionsContainer}
        showsVerticalScrollIndicator={false}
        snapToInterval={70}
        decelerationRate="fast"
      >
        {timeOptions.map((option, index) => (
          <Animated.View
            key={index}
            style={[
              { transform: [{ scale: selectedTime === option.time ? pulseAnim : 1 }] }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.timeOption,
                selectedTime === option.time && styles.selectedTimeOption,
              ]}
              onPress={() => handleTimeSelect(option.time)}
              activeOpacity={0.8}
            >
              <View style={styles.timeOptionContent}>
                <Text style={[
                  styles.timeOptionText,
                  selectedTime === option.time && styles.selectedTimeOptionText,
                ]}>
                  {option.label}
                </Text>
                <View style={[
                  styles.periodBadge,
                  { backgroundColor: `${getPeriodColor(option.period)}20` },
                  { borderColor: `${getPeriodColor(option.period)}60` }
                ]}>
                  <Text style={[
                    styles.periodText,
                    { color: getPeriodColor(option.period) }
                  ]}>
                    {option.period}
                  </Text>
                </View>
              </View>
              {selectedTime === option.time && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

function NumberSelectorComponent({ min, max, unit, step, value, onChange }) {
  const [selectedValue, setSelectedValue] = useState(value || min);

  const handleDecrease = () => {
    if (selectedValue > min) {
      const newValue = selectedValue - step;
      setSelectedValue(newValue);
      onChange(newValue);
    }
  };

  const handleIncrease = () => {
    if (selectedValue < max) {
      const newValue = selectedValue + step;
      setSelectedValue(newValue);
      onChange(newValue);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <View style={styles.numberSelectorContainer}>
        <TouchableOpacity
          style={[styles.numberButton, selectedValue <= min && styles.disabledButton]}
          onPress={handleDecrease}
          disabled={selectedValue <= min}
          activeOpacity={0.7}
        >
          <Text style={[styles.numberButtonText, selectedValue <= min && styles.disabledButtonText]}>−</Text>
        </TouchableOpacity>
        
        <View style={styles.numberDisplay}>
          <Text style={styles.numberValue}>{selectedValue}</Text>
          <Text style={styles.numberUnit}>{unit}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.numberButton, selectedValue >= max && styles.disabledButton]}
          onPress={handleIncrease}
          disabled={selectedValue >= max}
          activeOpacity={0.7}
        >
          <Text style={[styles.numberButtonText, selectedValue >= max && styles.disabledButtonText]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SliderComponent({ min, max, unit, step, value, onChange }) {
  const [sliderValue, setSliderValue] = useState(value || min);

  const handleSliderChange = (val) => {
    setSliderValue(val);
    onChange(val);
  };

  return (
    <View style={styles.inputContainer}>
      <View style={styles.sliderContainer}>
        <View style={styles.sliderLabelContainer}>
          <Text style={styles.sliderLabel}>{min} {unit}</Text>
          <Text style={styles.sliderLabel}>{max} {unit}</Text>
        </View>
        
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={sliderValue}
          onValueChange={handleSliderChange}
          minimumTrackTintColor="#9575CD"
          maximumTrackTintColor="rgba(255,255,255,0.3)"
          thumbTintColor="#9575CD"
        />
        
        <View style={styles.sliderValueContainer}>
          <Text style={styles.sliderValue}>{sliderValue} {unit}</Text>
        </View>
      </View>
    </View>
  );
}

// Global state to store answers (in real app, use AsyncStorage or Context)
if (!global.globalAnswers) {
  global.globalAnswers = {};
}

export default function LifestylePage() {
  const { id } = useLocalSearchParams();
  const questionId = parseInt(id);
  
  console.log("LifestylePage - ID:", id, "Parsed ID:", questionId);
  console.log("Available questions:", lifestyleQuestions?.length);
  
  const currentQuestion = lifestyleQuestions.find(q => q.id === questionId);
  
  const [answer, setAnswer] = useState(global.globalAnswers[questionId] || null);
  const [isAnswered, setIsAnswered] = useState(!!global.globalAnswers[questionId]);
  const totalQuestions = lifestyleQuestions.length;

  const handleBack = () => {
    if (questionId === 1) {
      router.back(); // Go back to GetProgram page
    } else {
      router.replace(`/onboarding/lifestyle/${questionId - 1}`);
    }
  };

  const handleAnswerChange = (value) => {
    setAnswer(value);
    setIsAnswered(true);
    
    // Store answer globally
    global.globalAnswers[questionId] = value;
    console.log(`Lifestyle Question ${questionId}: ${value}`, global.globalAnswers);
  };

  const handleNext = () => {
    if (questionId === totalQuestions) {
      router.replace("/onboarding/analyzing"); // Go to analyzing page
    } else {
      router.replace(`/onboarding/lifestyle/${questionId + 1}`);
    }
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={["#1a1a1a", "#2d2d2d", "#1a1a1a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.container}>
            <Text style={styles.errorText}>Question not found.</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const renderInput = () => {
    switch (currentQuestion.type) {
      case "time-picker":
        return <TimePickerComponent value={answer} onChange={handleAnswerChange} />;
      case "number-selector":
        return (
          <NumberSelectorComponent
            min={currentQuestion.min}
            max={currentQuestion.max}
            unit={currentQuestion.unit}
            step={currentQuestion.step}
            value={answer}
            onChange={handleAnswerChange}
          />
        );
      case "slider":
        return (
          <SliderComponent
            min={currentQuestion.min}
            max={currentQuestion.max}
            unit={currentQuestion.unit}
            step={currentQuestion.step}
            value={answer}
            onChange={handleAnswerChange}
          />
        );
      default:
        return null;
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
          <ProgressBar current={questionId} total={totalQuestions} />
        </View>
        
        <View style={styles.container}>
          <View style={styles.questionContent}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            {renderInput()}
          </View>
          
          <View style={styles.bottomArea}>
            <TouchableOpacity 
              style={[styles.nextButton, !isAnswered && styles.disabledButton]} 
              activeOpacity={0.8} 
              onPress={handleNext}
              disabled={!isAnswered}
            >
              <LinearGradient
                colors={isAnswered ? ["#9575CD", "#7B68EE"] : ["#666666", "#555555"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {questionId === totalQuestions ? "Analyze Results" : "Next"}
                </Text>
                <Text style={styles.nextButtonIcon}>→</Text>
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
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "300",
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#9575CD",
    borderRadius: 2,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingTop: 20,
  },
  questionText: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#ffffff",
    marginBottom: 40,
    lineHeight: 36,
    fontFamily: serifFamily,
  },
  inputContainer: {
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    padding: 20,
  },
  timeLabel: {
    fontSize: 20,
    color: "#ffffff",
    marginBottom: 8,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: undefined }),
  },
  timeSubLabel: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.7,
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  timeOptionsScrollView: {
    height: 250,
    width: "100%",
  },
  timeOptionsContainer: {
    alignItems: "center",
    paddingVertical: 15,
  },
  timeOption: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginVertical: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    width: 260,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTimeOption: {
    backgroundColor: "rgba(149, 117, 205, 0.25)",
    borderColor: "#9575CD",
    shadowColor: "#9575CD",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  timeOptionContent: {
    flex: 1,
  },
  timeOptionText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 4,
  },
  selectedTimeOptionText: {
    color: "#9575CD",
    fontWeight: "700",
  },
  periodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  periodText: {
    fontSize: 11,
    fontWeight: "600",
  },
  selectedIndicator: {
    backgroundColor: "#9575CD",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  numberSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  numberButton: {
    backgroundColor: "#9575CD",
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#9575CD",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#666666",
    shadowOpacity: 0,
  },
  numberButtonText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  disabledButtonText: {
    color: "#999999",
  },
  numberDisplay: {
    marginHorizontal: 30,
    alignItems: "center",
    minWidth: 80,
  },
  numberValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#9575CD",
    marginBottom: 4,
  },
  numberUnit: {
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.8,
  },
  sliderContainer: {
    width: "100%",
  },
  sliderLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.6,
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 15,
  },
  sliderValueContainer: {
    alignItems: "center",
    backgroundColor: "rgba(149, 117, 205, 0.2)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(149, 117, 205, 0.4)",
  },
  sliderValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#9575CD",
  },
  errorText: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
  },
  bottomArea: {
    paddingTop: 20,
    alignItems: "center",
  },
  nextButton: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 28,
    shadowColor: "#9575CD",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
  },
  nextButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 18,
    letterSpacing: 0.5,
    marginRight: 8,
  },
  nextButtonIcon: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
  },
});
