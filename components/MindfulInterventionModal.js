import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getDailyPrompt } from "../constants/quotes";

const { width, height } = Dimensions.get("window");

const MindfulInterventionModal = ({
  visible,
  onClose,
  onNavigateToBreathing,
  onNavigateToReflect,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [breatheAnim] = useState(new Animated.Value(1));
  const [showActions, setShowActions] = useState(false);

  // Breathing dots animation
  const [dotAnim1] = useState(new Animated.Value(0.3));
  const [dotAnim2] = useState(new Animated.Value(0.3));
  const [dotAnim3] = useState(new Animated.Value(0.3));

  const prompt = getDailyPrompt();

  useEffect(() => {
    if (visible) {
      // Entry animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Start gentle breathing animation
      startBreathingAnimation();
      startDotsBreathingAnimation();

      // Show action buttons after a pause
      setTimeout(() => {
        setShowActions(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 1500);
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      setShowActions(false);
      // Reset dot animations
      dotAnim1.setValue(0.3);
      dotAnim2.setValue(0.3);
      dotAnim3.setValue(0.3);
    }
  }, [visible]);

  const startBreathingAnimation = () => {
    const breathe = () => {
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (visible) breathe(); // Continue if modal is still open
      });
    };
    breathe();
  };

  const startDotsBreathingAnimation = () => {
    const animateDots = () => {
      // Animate dots in sequence to show breathing rhythm
      Animated.stagger(500, [
        Animated.sequence([
          Animated.timing(dotAnim1, {
            toValue: 1,
            duration: 1500, // Inhale
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim1, {
            toValue: 0.3,
            duration: 1500, // Exhale
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(dotAnim2, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim2, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(dotAnim3, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim3, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (visible) {
          setTimeout(() => animateDots(), 1000); // Pause between cycles
        }
      });
    };

    // Start after a brief delay
    setTimeout(() => {
      if (visible) animateDots();
    }, 1000);
  };

  const handleContinueScrolling = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  const handlePauseAndBreathe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose(); // Close modal first
    if (onNavigateToBreathing) {
      onNavigateToBreathing();
    }
  };

  const handleReflect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose(); // Close modal first
    if (onNavigateToReflect) {
      onNavigateToReflect();
    }
  };

  return (
    <Modal visible={visible} animationType="none" transparent>
      <BlurView intensity={60} style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { scale: breatheAnim }],
            },
          ]}
        >
          {/* Header with gentle close option */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🧘‍♀️</Text>
            <TouchableOpacity
              style={styles.gentleCloseButton}
              onPress={handleContinueScrolling}
            >
              <Text style={styles.gentleCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Main prompt */}
          <View style={styles.promptContainer}>
            <Text style={styles.promptTitle}>Take a mindful moment</Text>
            <Text style={styles.promptText}>{prompt}</Text>
          </View>

          {/* Breathing indicator with animated dots */}
          <View style={styles.breathingIndicator}>
            <Text style={styles.breathingText}>Take three deep breaths...</Text>
            <View style={styles.breathingDots}>
              <Animated.View
                style={[styles.dotContainer, { opacity: dotAnim1 }]}
              >
                <Text style={styles.dot}>●</Text>
              </Animated.View>
              <Animated.View
                style={[styles.dotContainer, { opacity: dotAnim2 }]}
              >
                <Text style={styles.dot}>●</Text>
              </Animated.View>
              <Animated.View
                style={[styles.dotContainer, { opacity: dotAnim3 }]}
              >
                <Text style={styles.dot}>●</Text>
              </Animated.View>
            </View>
          </View>

          {/* Action buttons - appear after delay */}
          {showActions && (
            <Animated.View
              style={[
                styles.actionsContainer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryAction]}
                onPress={handlePauseAndBreathe}
              >
                <Text style={styles.actionText}>🫁 Pause & Breathe</Text>
                <Text style={styles.actionSubtext}>+5 XP</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={handleReflect}
              >
                <Text style={styles.actionText}>💭 Quick Reflect</Text>
                <Text style={styles.actionSubtext}>+3 XP</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinueScrolling}
              >
                <Text style={styles.continueText}>Continue mindfully</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: "#F3FBCB",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerEmoji: {
    fontSize: 32,
  },
  gentleCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F4D8FE",
    justifyContent: "center",
    alignItems: "center",
  },
  gentleCloseText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    opacity: 0.6,
  },
  promptContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#121111",
    marginBottom: 16,
    textAlign: "center",
  },
  promptText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "500",
    color: "#121111",
    textAlign: "center",
    paddingHorizontal: 8,
    fontStyle: "italic",
  },
  breathingIndicator: {
    alignItems: "center",
    marginBottom: 30,
  },
  breathingText: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.7,
    marginBottom: 12,
  },
  breathingDots: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  dotContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    fontSize: 16,
    color: "#93D5E1",
  },
  actionsContainer: {
    width: "100%",
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#93D5E1",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  primaryAction: {
    backgroundColor: "#93D5E1",
  },
  secondaryAction: {
    backgroundColor: "#F4D8FE",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
  },
  actionSubtext: {
    fontSize: 12,
    fontWeight: "700",
    color: "#121111",
    opacity: 0.7,
  },
  continueButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  continueText: {
    fontSize: 14,
    color: "#121111",
    opacity: 0.6,
    textDecorationLine: "underline",
  },
});

export default MindfulInterventionModal;
