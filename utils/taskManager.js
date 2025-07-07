import AsyncStorage from "@react-native-async-storage/async-storage";

const TASK_COMPLETIONS_KEY = "mindful_task_completions";

export const saveTaskCompletion = async (task, reflection = "") => {
  try {
    const completions = await getTaskCompletions();
    const today = new Date().toDateString();

    // Check if task already completed today
    const alreadyCompleted = completions.find(
      (completion) =>
        completion.taskId === task.id && completion.dateString === today
    );

    if (alreadyCompleted) {
      throw new Error("Task already completed today");
    }

    const newCompletion = {
      id: Date.now().toString(),
      taskId: task.id,
      taskName: task.name,
      taskCategory: task.category || "personal",
      xpAwarded: task.xp,
      reflection: reflection.trim(),
      date: new Date().toISOString(),
      dateString: today,
      completed: true,
      isPersonal: task.isPersonal || false,
      enableStreaks: task.enableStreaks || false,
    };

    completions.unshift(newCompletion); // Add to beginning

    // Keep only last 500 completions
    if (completions.length > 500) {
      completions.splice(500);
    }

    await AsyncStorage.setItem(
      TASK_COMPLETIONS_KEY,
      JSON.stringify(completions)
    );
    return newCompletion;
  } catch (error) {
    console.error("Error saving task completion:", error);
    throw error;
  }
};

export const getTaskCompletions = async () => {
  try {
    const stored = await AsyncStorage.getItem(TASK_COMPLETIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting task completions:", error);
    return [];
  }
};

export const getTaskCompletionsByDate = async (taskId, dateString) => {
  try {
    const completions = await getSpecificTaskCompletions(taskId);
    return completions.filter(
      (completion) => completion.dateString === dateString
    );
  } catch (error) {
    console.error("Error getting task completions by date:", error);
    return [];
  }
};

export const getTodaysTaskCompletions = async () => {
  const today = new Date().toDateString();
  return await getTaskCompletionsByDate(today);
};

export const isTaskCompletedToday = async (taskId) => {
  try {
    const today = new Date().toDateString();
    const completions = await getTaskCompletions();
    return completions.some(
      (completion) =>
        completion.taskId === taskId &&
        completion.dateString === today &&
        completion.completed
    );
  } catch (error) {
    console.error("Error checking if task completed today:", error);
    return false;
  }
};

export const getSpecificTaskCompletions = async (taskId) => {
  try {
    const completions = await getTaskCompletions();
    return completions.filter(
      (completion) => completion.taskId === taskId && completion.completed
    );
  } catch (error) {
    console.error("Error getting specific task completions:", error);
    return [];
  }
};

export const getTaskCalendarData = async (taskId, year, month) => {
  try {
    const completions = await getSpecificTaskCompletions(taskId);
    const calendarData = {};

    // Filter completions for the specific month/year
    completions.forEach((completion) => {
      const date = new Date(completion.date);
      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        completion.completed
      ) {
        const dayKey = date.getDate();
        if (!calendarData[dayKey]) {
          calendarData[dayKey] = [];
        }
        calendarData[dayKey].push(completion);
      }
    });

    return calendarData;
  } catch (error) {
    console.error("Error getting task calendar data:", error);
    return {};
  }
};

export const getWeeklyTaskData = async (taskId, weekStartDate) => {
  try {
    const completions = await getSpecificTaskCompletions(taskId);
    const weekData = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = currentDate.toDateString();

      const dayCompletions = completions.filter(
        (completion) => completion.dateString === dateString
      );

      weekData.push({
        date: currentDate,
        dateString: dateString,
        completed: dayCompletions.length > 0,
        completions: dayCompletions,
        xpEarned: dayCompletions.reduce(
          (total, comp) => total + comp.xpAwarded,
          0
        ),
      });
    }

    return weekData;
  } catch (error) {
    console.error("Error getting weekly task data:", error);
    return [];
  }
};

export const getTaskCompletionsByDateRange = async (
  taskId,
  startDate,
  endDate
) => {
  try {
    const completions = await getSpecificTaskCompletions(taskId);
    return completions.filter((completion) => {
      const completionDate = new Date(completion.date);
      return (
        completionDate >= startDate &&
        completionDate <= endDate &&
        completion.completed
      );
    });
  } catch (error) {
    console.error("Error getting task completions by date range:", error);
    return [];
  }
};

export const getMonthlyTaskStats = async (taskId, year, month) => {
  try {
    const calendarData = await getTaskCalendarData(taskId, year, month);
    const completionDays = Object.keys(calendarData).length;

    let totalCompletions = 0;
    let totalXpEarned = 0;
    let totalReflections = 0;

    Object.values(calendarData).forEach((dayCompletions) => {
      totalCompletions += dayCompletions.length;
      totalXpEarned += dayCompletions.reduce(
        (total, completion) => total + completion.xpAwarded,
        0
      );
      totalReflections += dayCompletions.filter(
        (completion) =>
          completion.reflection && completion.reflection.length > 0
      ).length;
    });

    // Calculate streak (consecutive days)
    const today = new Date();
    let currentStreak = 0;

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);

      if (checkDate.getFullYear() === year && checkDate.getMonth() === month) {
        const dayKey = checkDate.getDate();
        if (calendarData[dayKey] && calendarData[dayKey].length > 0) {
          currentStreak++;
        } else if (i === 0) {
          // If today has no completion, no streak
          break;
        } else {
          break;
        }
      }
    }

    return {
      completionDays,
      totalCompletions,
      totalXpEarned,
      totalReflections,
      currentStreak,
      completionRate:
        completionDays > 0
          ? (
              (completionDays / new Date(year, month + 1, 0).getDate()) *
              100
            ).toFixed(1)
          : 0,
    };
  } catch (error) {
    console.error("Error getting monthly task stats:", error);
    return {
      completionDays: 0,
      totalCompletions: 0,
      totalXpEarned: 0,
      totalReflections: 0,
      currentStreak: 0,
      completionRate: 0,
    };
  }
};

export const getTaskStats = async (taskId) => {
  try {
    const completions = await getSpecificTaskCompletions(taskId);
    const totalCompletions = completions.length;
    const totalXpEarned = completions.reduce(
      (total, completion) => total + completion.xpAwarded,
      0
    );

    // Count unique completion days
    const uniqueDays = new Set();
    completions.forEach((completion) => {
      uniqueDays.add(completion.dateString);
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateString = checkDate.toDateString();

      const hasCompletion = completions.some(
        (completion) => completion.dateString === dateString
      );

      if (hasCompletion) {
        currentStreak++;
      } else if (i === 0) {
        // If today has no completion, no streak
        break;
      } else {
        break;
      }
    }

    return {
      totalCompletions,
      uniqueDays: uniqueDays.size,
      totalXpEarned,
      currentStreak,
      lastCompletion: completions[0] || null,
    };
  } catch (error) {
    console.error("Error getting task stats:", error);
    return {
      totalCompletions: 0,
      uniqueDays: 0,
      totalXpEarned: 0,
      currentStreak: 0,
      lastCompletion: null,
    };
  }
};

export const deleteTaskCompletion = async (completionId) => {
  try {
    const completions = await getTaskCompletions();
    const filtered = completions.filter(
      (completion) => completion.id !== completionId
    );
    await AsyncStorage.setItem(TASK_COMPLETIONS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting task completion:", error);
    return false;
  }
};

export const getAllTasksStats = async () => {
  try {
    const completions = await getTaskCompletions();
    const taskStats = {};

    completions.forEach((completion) => {
      if (!taskStats[completion.taskId]) {
        taskStats[completion.taskId] = {
          taskName: completion.taskName,
          taskCategory: completion.taskCategory,
          completions: 0,
          totalXp: 0,
          lastCompleted: null,
        };
      }

      taskStats[completion.taskId].completions++;
      taskStats[completion.taskId].totalXp += completion.xpAwarded;

      if (
        !taskStats[completion.taskId].lastCompleted ||
        new Date(completion.date) >
          new Date(taskStats[completion.taskId].lastCompleted)
      ) {
        taskStats[completion.taskId].lastCompleted = completion.date;
      }
    });

    return taskStats;
  } catch (error) {
    console.error("Error getting all tasks stats:", error);
    return {};
  }
};
