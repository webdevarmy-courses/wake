import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ReplaceScrollCards = () => {
  const cards = [
    {
      id: 1,
      title: "1-min Breathing",
      description: "Calm your mind with guided breathing",
      emoji: "🧘",
      background: "#F3FBCB",
      route: "/replace/breathing",
    },
    {
      id: 2,
      title: "Screen-Free Timer",
      description: "Take a mindful break from screens",
      emoji: "📵",
      background: "#F4D8FE",
      route: "/replace/timer",
    },
    {
      id: 3,
      title: "Quick Journal",
      description: "Express your thoughts and feelings",
      emoji: "🧠",
      background: "#93D5E1",
      route: "/replace/journal",
    },
    {
      id: 4,
      title: "Reflect Card",
      description: "Pause and explore your inner world",
      emoji: "📓",
      background: "#FFE37D",
      route: "/replace/reflect",
    },
  ];

  const handleCardPress = (route) => {
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>REPLACE SCROLLING WITH</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        snapToInterval={160}
        decelerationRate="fast"
        snapToAlignment="center"
      >
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.card, { backgroundColor: card.background }]}
            onPress={() => handleCardPress(card.route)}
            activeOpacity={0.8}
          >
            <Text style={styles.emoji}>{card.emoji}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#121111",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 1.5,
    opacity: 0.8,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  card: {
    width: 140,
    height: 140,
    borderRadius: 24,
    marginRight: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingHorizontal: 12,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#121111",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 11,
    fontWeight: "500",
    color: "#121111",
    textAlign: "center",
    lineHeight: 15,
    opacity: 0.75,
    paddingHorizontal: 4,
  },
});

export default ReplaceScrollCards;
