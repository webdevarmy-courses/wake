import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MindfulBackground from "../components/MindfulBackground";
import PaywallModal from "../components/PaywallModal";
import useRevenueCat from "../hooks/useRevenueCat";

const { width } = Dimensions.get("window");

const PERSONAL_GOALS_KEY = "personal_focus_goals";

const frequencyOptions = [
  { label: "Daily", value: "Daily" },
  { label: "2x/week", value: "2x/week" },
  { label: "3x/week", value: "3x/week" },
  { label: "Weekly", value: "Weekly" },
  // { label: "Custom", value: "Custom" },
];

const CreateFocusGoalPage = () => {
  const [goalName, setGoalName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [xpReward, setXpReward] = useState("5");
  const [enableStreaks, setEnableStreaks] = useState(false);
  const [reflectionPrompt, setReflectionPrompt] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Revenue Cat hook to check premium status
  const { isPremiumMember } = useRevenueCat();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const isFormValid = () => {
    return goalName.trim().length > 0 && xpReward && parseInt(xpReward) > 0;
  };

  const adjustXpReward = (direction) => {
    const currentXp = parseInt(xpReward) || 0;
    if (direction === "up") {
      setXpReward(Math.min(5, currentXp + 1).toString());
    } else {
      setXpReward(Math.max(1, currentXp - 1).toString());
    }
  };

  const handleEnableStreaksToggle = (value) => {
    if (value && !isPremiumMember) {
      setShowPaywall(true);
      return;
    }
    
    // Premium user or disabling streaks - allow the change
    setEnableStreaks(value);
  };

  const handleSaveGoal = async () => {
    if (!isFormValid()) {
      Alert.alert(
        "Incomplete Form",
        "Please fill in the goal name and XP reward."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const newGoal = {
        id: Date.now().toString(),
        name: goalName.trim(),
        description: description.trim(),
        frequency,
        xp: parseInt(xpReward),
        enableStreaks,
        reflectionPrompt,
        createdAt: new Date().toISOString(),
        isPersonal: true,
      };

      // Save to AsyncStorage
      const existingGoals = await getPersonalGoals();
      const updatedGoals = [...existingGoals, newGoal];
      await AsyncStorage.setItem(
        PERSONAL_GOALS_KEY,
        JSON.stringify(updatedGoals)
      );

      // Success feedback
      Alert.alert(
        "Goal Created! 🎯",
        `"${goalName}" has been added to your Focus Goals!\n\nStart building your mindful habit and earn ${xpReward} XP each time.`,
        [
          {
            text: "View My Goals",
            onPress: () => {
              router.back();
            },
            style: "default",
          },
        ]
      );
    } catch (error) {
      console.error("Error saving goal:", error);
      Alert.alert("Error", "Could not save your goal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPersonalGoals = async () => {
    try {
      const stored = await AsyncStorage.getItem(PERSONAL_GOALS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error getting personal goals:", error);
      return [];
    }
  };

  const renderFrequencyModal = () => (
    <Modal
      visible={showFrequencyModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFrequencyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Frequency</Text>
          {frequencyOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.frequencyOption,
                frequency === option.value && styles.selectedFrequencyOption,
              ]}
              onPress={() => {
                setFrequency(option.value);
                setShowFrequencyModal(false);
              }}
            >
              <Text
                style={[
                  styles.frequencyOptionText,
                  frequency === option.value &&
                    styles.selectedFrequencyOptionText,
                ]}
              >
                {option.label}
              </Text>
              {frequency === option.value && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowFrequencyModal(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderLivePreview = () => (
    <View style={styles.previewSection}>
      <Text style={styles.previewTitle}>Live Preview</Text>
      <View style={styles.previewCard}>
        {/* XP Badge */}
        <View style={styles.previewXpBadge}>
          <Text style={styles.previewXpText}>💫 +{xpReward || "0"} XP</Text>
        </View>

        {/* Goal Content */}
        <View style={styles.previewContent}>
          <Text style={styles.previewGoalName}>
            {goalName || "Your Goal Name"}
          </Text>
          <Text style={styles.previewDescription}>
            {description || "Add a description to help you stay motivated"}
          </Text>

          {/* Frequency Pill */}
          <View style={styles.previewFrequencyPill}>
            <Text style={styles.previewFrequencyText}>{frequency}</Text>
          </View>

          {/* Features */}
          {(enableStreaks || reflectionPrompt) && (
            <View style={styles.previewFeatures}>
              {enableStreaks && (
                <View style={styles.previewFeature}>
                  <Text style={styles.previewFeatureText}>🔥 Streaks</Text>
                </View>
              )}
              {reflectionPrompt && (
                <View style={styles.previewFeature}>
                  <Text style={styles.previewFeatureText}>📝 Reflection</Text>
                </View>
              )}
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity style={styles.previewButton}>
            <Text style={styles.previewButtonText}>Start Goal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <MindfulBackground>
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <Text style={styles.title}>Create Your Own Focus Goal</Text>
              <Text style={styles.subtitle}>
                Turn your habits into XP-powered rituals
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Form Fields */}
            <View style={styles.formSection}>
              {/* Goal Name */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  Goal Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Morning Meditation"
                  placeholderTextColor="rgba(18, 17, 17, 0.5)"
                  value={goalName}
                  onChangeText={setGoalName}
                  maxLength={50}
                />
              </View>

              {/* Description */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  placeholder="Describe what this habit means to you..."
                  placeholderTextColor="rgba(18, 17, 17, 0.5)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={200}
                />
              </View>

              {/* Frequency */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Frequency</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowFrequencyModal(true)}
                >
                  <Text style={styles.selectInputText}>{frequency}</Text>
                  <Text style={styles.selectArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* XP Reward */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  XP Reward <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.xpInputContainer}>
                  <TouchableOpacity
                    style={styles.xpButton}
                    onPress={() => adjustXpReward("down")}
                  >
                    <Text style={styles.xpButtonText}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.xpInput}
                    value={xpReward}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 1 && num <= 20) {
                        setXpReward(text);
                      }
                    }}
                    keyboardType="numeric"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={styles.xpButton}
                    onPress={() => adjustXpReward("up")}
                  >
                    <Text style={styles.xpButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.xpHint}>1-5XP recommended</Text>
              </View>

              {/* Toggles */}
              <View style={styles.togglesSection}>
                <Text style={styles.sectionTitle}>Features</Text>

                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleLabel}>🔥 Enable Streaks</Text>
                    <Text style={styles.toggleDescription}>
                      Track consecutive days{!isPremiumMember ? " (premium) 🔒" : ""}
                    </Text>
                  </View>
                  <Switch
                    value={enableStreaks}
                    onValueChange={handleEnableStreaksToggle}
                    trackColor={{ false: "#E0E0E0", true: "#93D5E1" }}
                    thumbColor={enableStreaks ? "#FFFFFF" : "#FFFFFF"}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleLabel}>📝 Reflection Prompt</Text>
                    <Text style={styles.toggleDescription}>
                      Add journaling after completion
                    </Text>
                  </View>
                  <Switch
                    value={reflectionPrompt}
                    onValueChange={setReflectionPrompt}
                    trackColor={{ false: "#E0E0E0", true: "#93D5E1" }}
                    thumbColor={reflectionPrompt ? "#FFFFFF" : "#FFFFFF"}
                  />
                </View>
              </View>
            </View>

            {/* Live Preview */}
            {renderLivePreview()}

            {/* Submit Button */}
            <View style={styles.submitSection}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !isFormValid() && styles.submitButtonDisabled,
                ]}
                onPress={handleSaveGoal}
                disabled={!isFormValid() || isSubmitting}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    !isFormValid() && styles.submitButtonTextDisabled,
                  ]}
                >
                  {isSubmitting ? "Creating..." : "➕ Add to Focus Goals"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </Animated.View>

        {/* Frequency Modal */}
        {renderFrequencyModal()}

        {/* Paywall Modal */}
        <PaywallModal
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
        />
      </SafeAreaView>
    </MindfulBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(18, 17, 17, 0.1)",
  },
  backButton: {
    backgroundColor: "rgba(147, 213, 225, 0.3)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  headerTitles: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#121111",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#121111",
    opacity: 0.7,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formSection: {
    marginBottom: 30,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 8,
  },
  required: {
    color: "#FF6B6B",
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#121111",
    borderWidth: 1,
    borderColor: "rgba(147, 213, 225, 0.3)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  multilineInput: {
    minHeight: 80,
  },
  selectInput: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(147, 213, 225, 0.3)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectInputText: {
    fontSize: 16,
    color: "#121111",
  },
  selectArrow: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.5,
  },
  xpInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(147, 213, 225, 0.3)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  xpButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#93D5E1",
  },
  xpButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#121111",
  },
  xpInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#121111",
    padding: 16,
  },
  xpHint: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.6,
    marginTop: 4,
  },
  togglesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.7,
  },
  previewSection: {
    marginBottom: 30,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 16,
    textAlign: "center",
  },
  previewCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: "relative",
  },
  previewXpBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FFE37D",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 1,
  },
  previewXpText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
  },
  previewContent: {
    padding: 20,
    paddingTop: 16,
  },
  previewGoalName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 6,
  },
  previewDescription: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 20,
  },
  previewFrequencyPill: {
    backgroundColor: "#93D5E1",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  previewFrequencyText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#121111",
  },
  previewFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  previewFeature: {
    backgroundColor: "rgba(244, 216, 254, 0.6)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  previewFeatureText: {
    fontSize: 12,
    color: "#121111",
    opacity: 0.8,
  },
  previewButton: {
    backgroundColor: "#93D5E1",
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  submitSection: {
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#93D5E1",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "rgba(147, 213, 225, 0.4)",
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    letterSpacing: 0.5,
  },
  submitButtonTextDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: width * 0.8,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121111",
    textAlign: "center",
    marginBottom: 20,
  },
  frequencyOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "rgba(243, 251, 203, 0.3)",
  },
  selectedFrequencyOption: {
    backgroundColor: "#93D5E1",
  },
  frequencyOptionText: {
    fontSize: 16,
    color: "#121111",
  },
  selectedFrequencyOptionText: {
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  modalCloseButton: {
    backgroundColor: "rgba(147, 213, 225, 0.3)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CreateFocusGoalPage;
