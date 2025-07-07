import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Reusable XP Badge Component
export const XPBadge = ({ xp, style }) => (
  <View style={[styles.xpBadge, style]}>
    <Text style={styles.xpBadgeText}>💫 +{xp} XP</Text>
  </View>
);

// Reusable Frequency Pill Component
export const FrequencyPill = ({ frequency, style }) => (
  <View style={[styles.frequencyPill, style]}>
    <Text style={styles.frequencyText}>{frequency}</Text>
  </View>
);

// Reusable Category Badge Component
export const CategoryBadge = ({ category, style }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case "High Energy":
        return "#FFE37D";
      case "Low Energy":
        return "#93D5E1";
      case "Spiritual":
        return "#F4D8FE";
      case "Wellness":
        return "#F3FBCB";
      case "Fitness":
        return "#FFE37D";
      case "Cognitive":
        return "#93D5E1";
      default:
        return "#F3FBCB";
    }
  };

  return (
    <View
      style={[
        styles.categoryBadge,
        { backgroundColor: getCategoryColor(category) },
        style,
      ]}
    >
      <Text style={styles.categoryText}>{category}</Text>
    </View>
  );
};

// Reusable Action Button Component
export const ActionButton = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  backgroundColor = "#93D5E1",
}) => (
  <TouchableOpacity
    style={[
      styles.actionButton,
      { backgroundColor: disabled ? "#ccc" : backgroundColor },
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.actionButtonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

// Reusable Section Title Component
export const SectionTitle = ({ title, style }) => (
  <Text style={[styles.sectionTitle, style]}>{title}</Text>
);

// Reusable Card Container Component
export const CardContainer = ({ children, style }) => (
  <View style={[styles.cardContainer, style]}>{children}</View>
);

const styles = StyleSheet.create({
  xpBadge: {
    backgroundColor: "#FFE37D",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
  },
  frequencyPill: {
    backgroundColor: "#93D5E1",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#121111",
  },
  categoryBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#121111",
  },
  actionButton: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#121111",
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#121111",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  cardContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 16,
  },
});
