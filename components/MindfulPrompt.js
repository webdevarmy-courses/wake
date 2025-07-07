import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getDailyPrompt } from "../constants/quotes";

const MindfulPrompt = () => {
  const prompt = getDailyPrompt();

  return (
    <View style={styles.container}>
      <Text style={styles.promptText}>💭 {prompt}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F4D8FE",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  promptText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "600",
    color: "#121111",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});

export default MindfulPrompt;
