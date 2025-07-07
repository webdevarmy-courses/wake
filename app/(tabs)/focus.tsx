import React, { useEffect, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FocusPage from '../../pages/FocusPage';
import { getTaskStreak } from "../../utils/preBuiltTaskManager";

export default function FocusTab() {
  return <FocusPage />;
}

const TaskCard = ({ task, isCompleted, onPress }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [streak, setStreak] = useState({ currentStreak: 0, highestStreak: 0 });

  useEffect(() => {
    loadStreak();
  }, [isCompleted]);

  const loadStreak = async () => {
    const streakData = await getTaskStreak(task.id);
    setStreak(streakData);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.taskCard,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.taskCardTouch}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {/* XP Badge */}
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>💫 +{task.xp} XP</Text>
        </View>

        {/* Streak Badge */}
        {streak.currentStreak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>
              🔥 {streak.currentStreak}
            </Text>
          </View>
        )}

        {/* Task Image */}
        <View style={styles.imageContainer}>
          <Image source={task.image} style={styles.taskImage} />
        </View>

        {/* Task Info */}
        <View style={styles.taskInfo}>
          <Text style={styles.taskName}>{task.name}</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>

          {/* Frequency Pill */}
          <View style={styles.frequencyPill}>
            <Text style={styles.frequencyText}>{task.frequency}</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.doNowButton, isCompleted && styles.completedButton]}
            onPress={onPress}
          >
            <Text
              style={[
                styles.doNowButtonText,
                isCompleted && styles.completedButtonText,
              ]}
            >
              {isCompleted ? "✅ Done for today" : "Do Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Add new styles
const styles = StyleSheet.create({
  streakBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 69, 0, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  streakBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 