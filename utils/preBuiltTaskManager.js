import AsyncStorage from "@react-native-async-storage/async-storage";

const PREBUILT_TASKS_STREAKS_KEY = "prebuilt_tasks_streaks";

// Structure of streaks data:
// {
//   taskId: {
//     currentStreak: number,
//     lastCompletedDate: string (ISO date),
//     highestStreak: number
//   }
// }

export const getTaskStreak = async (taskId) => {
  try {
    const streaksData = await AsyncStorage.getItem(PREBUILT_TASKS_STREAKS_KEY);
    const streaks = streaksData ? JSON.parse(streaksData) : {};
    return (
      streaks[taskId] || {
        currentStreak: 0,
        lastCompletedDate: null,
        highestStreak: 0,
      }
    );
  } catch (error) {
    console.error("Error getting task streak:", error);
    return { currentStreak: 0, lastCompletedDate: null, highestStreak: 0 };
  }
};

export const updateTaskStreak = async (taskId) => {
  try {
    const streaksData = await AsyncStorage.getItem(PREBUILT_TASKS_STREAKS_KEY);
    const streaks = streaksData ? JSON.parse(streaksData) : {};
    const today = new Date().toISOString().split("T")[0];

    const taskStreak = streaks[taskId] || {
      currentStreak: 0,
      lastCompletedDate: null,
      highestStreak: 0,
    };

    // If this is the first completion or it's a new day
    if (
      !taskStreak.lastCompletedDate ||
      taskStreak.lastCompletedDate !== today
    ) {
      const lastDate = taskStreak.lastCompletedDate
        ? new Date(taskStreak.lastCompletedDate + "T00:00:00.000Z")
        : null;
      const currentDate = new Date(today + "T00:00:00.000Z");

      // Check if the last completion was yesterday
      if (lastDate) {
        // Calculate days between dates, accounting for timezone differences
        const diffTime = currentDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Completed yesterday, increment streak
          taskStreak.currentStreak += 1;
        } else if (diffDays > 1) {
          // Streak broken
          taskStreak.currentStreak = 1;
        } else if (diffDays === 0) {
          // Same day, don't update streak
          return taskStreak;
        }
      } else {
        // First time completing
        taskStreak.currentStreak = 1;
      }

      // Update highest streak if current streak is higher
      if (taskStreak.currentStreak > taskStreak.highestStreak) {
        taskStreak.highestStreak = taskStreak.currentStreak;
      }

      taskStreak.lastCompletedDate = today;
      streaks[taskId] = taskStreak;

      await AsyncStorage.setItem(
        PREBUILT_TASKS_STREAKS_KEY,
        JSON.stringify(streaks)
      );
    }

    return taskStreak;
  } catch (error) {
    console.error("Error updating task streak:", error);
    return { currentStreak: 0, lastCompletedDate: null, highestStreak: 0 };
  }
};

export const resetTaskStreak = async (taskId) => {
  try {
    const streaksData = await AsyncStorage.getItem(PREBUILT_TASKS_STREAKS_KEY);
    const streaks = streaksData ? JSON.parse(streaksData) : {};

    if (streaks[taskId]) {
      delete streaks[taskId];
      await AsyncStorage.setItem(
        PREBUILT_TASKS_STREAKS_KEY,
        JSON.stringify(streaks)
      );
    }
  } catch (error) {
    console.error("Error resetting task streak:", error);
  }
};
