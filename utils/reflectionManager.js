import AsyncStorage from "@react-native-async-storage/async-storage";

const REFLECTIONS_KEY = "mindful_reflections";

export const saveReflection = async (reflection) => {
  try {
    const reflections = await getReflections();
    const newReflection = {
      id: Date.now().toString(),
      text: reflection,
      date: new Date().toISOString(),
      dateString: new Date().toDateString(),
    };

    reflections.unshift(newReflection); // Add to beginning

    // Keep only last 100 reflections
    if (reflections.length > 100) {
      reflections.splice(100);
    }

    await AsyncStorage.setItem(REFLECTIONS_KEY, JSON.stringify(reflections));
    return newReflection;
  } catch (error) {
    console.error("Error saving reflection:", error);
    throw error;
  }
};

export const getReflections = async () => {
  try {
    const stored = await AsyncStorage.getItem(REFLECTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting reflections:", error);
    return [];
  }
};

export const getReflectionsByDate = async (dateString) => {
  try {
    const reflections = await getReflections();
    return reflections.filter(
      (reflection) => reflection.dateString === dateString
    );
  } catch (error) {
    console.error("Error getting reflections by date:", error);
    return [];
  }
};

export const getTodaysReflections = async () => {
  const today = new Date().toDateString();
  return await getReflectionsByDate(today);
};

// New calendar-specific functions
export const getCalendarData = async (year, month) => {
  try {
    const reflections = await getReflections();
    const calendarData = {};

    // Filter reflections for the specific month/year
    reflections.forEach((reflection) => {
      const date = new Date(reflection.date);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const dayKey = date.getDate();
        if (!calendarData[dayKey]) {
          calendarData[dayKey] = [];
        }
        calendarData[dayKey].push(reflection);
      }
    });

    return calendarData;
  } catch (error) {
    console.error("Error getting calendar data:", error);
    return {};
  }
};

export const getWeeklyReflectionData = async (weekStartDate) => {
  try {
    const reflections = await getReflections();
    const weekData = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = currentDate.toDateString();

      const dayReflections = reflections.filter(
        (reflection) => reflection.dateString === dateString
      );

      weekData.push({
        date: currentDate,
        dateString: dateString,
        count: dayReflections.length,
        reflections: dayReflections,
      });
    }

    return weekData;
  } catch (error) {
    console.error("Error getting weekly reflection data:", error);
    return [];
  }
};

export const getReflectionsByDateRange = async (startDate, endDate) => {
  try {
    const reflections = await getReflections();
    return reflections.filter((reflection) => {
      const reflectionDate = new Date(reflection.date);
      return reflectionDate >= startDate && reflectionDate <= endDate;
    });
  } catch (error) {
    console.error("Error getting reflections by date range:", error);
    return [];
  }
};

export const getMonthlyStats = async (year, month) => {
  try {
    const calendarData = await getCalendarData(year, month);
    const daysWithReflections = Object.keys(calendarData).length;
    const totalReflections = Object.values(calendarData).reduce(
      (total, dayReflections) => total + dayReflections.length,
      0
    );

    return {
      daysWithReflections,
      totalReflections,
      averagePerDay:
        daysWithReflections > 0
          ? (totalReflections / daysWithReflections).toFixed(1)
          : 0,
    };
  } catch (error) {
    console.error("Error getting monthly stats:", error);
    return { daysWithReflections: 0, totalReflections: 0, averagePerDay: 0 };
  }
};

export const getReflectionStats = async () => {
  try {
    const reflections = await getReflections();
    const totalCount = reflections.length;

    // Count reflections by date for streak calculation
    const dateMap = {};
    reflections.forEach((reflection) => {
      dateMap[reflection.dateString] = true;
    });

    const uniqueDays = Object.keys(dateMap).length;

    // Calculate current streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateString = checkDate.toDateString();

      if (dateMap[dateString]) {
        streak++;
      } else {
        break;
      }
    }

    return {
      totalReflections: totalCount,
      uniqueDays,
      currentStreak: streak,
      lastReflection: reflections[0] || null,
    };
  } catch (error) {
    console.error("Error getting reflection stats:", error);
    return {
      totalReflections: 0,
      uniqueDays: 0,
      currentStreak: 0,
      lastReflection: null,
    };
  }
};

export const deleteReflection = async (reflectionId) => {
  try {
    const reflections = await getReflections();
    const filtered = reflections.filter((r) => r.id !== reflectionId);
    await AsyncStorage.setItem(REFLECTIONS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting reflection:", error);
    return false;
  }
};
