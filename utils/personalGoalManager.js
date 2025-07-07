import AsyncStorage from "@react-native-async-storage/async-storage";

const PERSONAL_GOALS_STREAKS_KEY = "personal_goals_streaks";

// Structure of streaks data:
// {
//   goalId: {
//     currentStreak: number,
//     lastCompletedDate: string (ISO date),
//     highestStreak: number
//   }
// }

export const getGoalStreak = async (goalId) => {
  try {
    const streaksData = await AsyncStorage.getItem(PERSONAL_GOALS_STREAKS_KEY);
    const streaks = streaksData ? JSON.parse(streaksData) : {};
    return (
      streaks[goalId] || {
        currentStreak: 0,
        lastCompletedDate: null,
        highestStreak: 0,
      }
    );
  } catch (error) {
    console.error("Error getting goal streak:", error);
    return { currentStreak: 0, lastCompletedDate: null, highestStreak: 0 };
  }
};

export const updateGoalStreak = async (goalId) => {
  try {
    const streaksData = await AsyncStorage.getItem(PERSONAL_GOALS_STREAKS_KEY);
    const streaks = streaksData ? JSON.parse(streaksData) : {};
    const today = new Date().toISOString().split("T")[0];

    const goalStreak = streaks[goalId] || {
      currentStreak: 0,
      lastCompletedDate: null,
      highestStreak: 0,
    };

    // If this is the first completion or it's a new day
    if (
      !goalStreak.lastCompletedDate ||
      goalStreak.lastCompletedDate !== today
    ) {
      const lastDate = goalStreak.lastCompletedDate
        ? new Date(goalStreak.lastCompletedDate + "T00:00:00.000Z")
        : null;
      const currentDate = new Date(today + "T00:00:00.000Z");

      // Check if the last completion was yesterday
      if (lastDate) {
        // Calculate days between dates, accounting for timezone differences
        const diffTime = currentDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Completed yesterday, increment streak
          goalStreak.currentStreak += 1;
        } else if (diffDays > 1) {
          // Streak broken
          goalStreak.currentStreak = 1;
        } else if (diffDays === 0) {
          // Same day, don't update streak
          return goalStreak;
        }
      } else {
        // First time completing
        goalStreak.currentStreak = 1;
      }

      // Update highest streak if current streak is higher
      if (goalStreak.currentStreak > goalStreak.highestStreak) {
        goalStreak.highestStreak = goalStreak.currentStreak;
      }

      goalStreak.lastCompletedDate = today;
      streaks[goalId] = goalStreak;

      await AsyncStorage.setItem(
        PERSONAL_GOALS_STREAKS_KEY,
        JSON.stringify(streaks)
      );
    }

    return goalStreak;
  } catch (error) {
    console.error("Error updating goal streak:", error);
    return { currentStreak: 0, lastCompletedDate: null, highestStreak: 0 };
  }
};

export const resetGoalStreak = async (goalId) => {
  try {
    const streaksData = await AsyncStorage.getItem(PERSONAL_GOALS_STREAKS_KEY);
    const streaks = streaksData ? JSON.parse(streaksData) : {};

    if (streaks[goalId]) {
      delete streaks[goalId];
      await AsyncStorage.setItem(
        PERSONAL_GOALS_STREAKS_KEY,
        JSON.stringify(streaks)
      );
    }
  } catch (error) {
    console.error("Error resetting goal streak:", error);
  }
};
