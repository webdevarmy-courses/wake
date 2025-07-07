import AsyncStorage from "@react-native-async-storage/async-storage";

const JOURNAL_ENTRIES_KEY = "mindful_journal_entries";

export const saveJournalEntry = async (text, mood) => {
  try {
    const entries = await getJournalEntries();
    const newEntry = {
      id: Date.now().toString(),
      text: text.trim(),
      mood: mood,
      date: new Date().toISOString(),
      dateString: new Date().toDateString(),
    };

    entries.unshift(newEntry); // Add to beginning

    // Keep only last 100 entries
    if (entries.length > 100) {
      entries.splice(100);
    }

    await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
    return newEntry;
  } catch (error) {
    console.error("Error saving journal entry:", error);
    throw error;
  }
};

export const getJournalEntries = async () => {
  try {
    const stored = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting journal entries:", error);
    return [];
  }
};

export const getJournalEntriesByDate = async (dateString) => {
  try {
    const entries = await getJournalEntries();
    return entries.filter((entry) => entry.dateString === dateString);
  } catch (error) {
    console.error("Error getting journal entries by date:", error);
    return [];
  }
};

export const getTodaysJournalEntries = async () => {
  const today = new Date().toDateString();
  return await getJournalEntriesByDate(today);
};

export const getJournalStats = async () => {
  try {
    const entries = await getJournalEntries();
    const totalEntries = entries.length;

    // Count entries by date for streak calculation
    const dateMap = {};
    entries.forEach((entry) => {
      dateMap[entry.dateString] = true;
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

    // Count mood distribution
    const moodCounts = {
      "😌": 0, // Calm
      "😕": 0, // Confused
      "😠": 0, // Frustrated
      "😄": 0, // Grateful
      "🤯": 0, // Overwhelmed
    };

    entries.forEach((entry) => {
      if (entry.mood && moodCounts.hasOwnProperty(entry.mood)) {
        moodCounts[entry.mood]++;
      }
    });

    return {
      totalEntries,
      uniqueDays,
      currentStreak: streak,
      moodCounts,
      lastEntry: entries[0] || null,
    };
  } catch (error) {
    console.error("Error getting journal stats:", error);
    return {
      totalEntries: 0,
      uniqueDays: 0,
      currentStreak: 0,
      moodCounts: { "😌": 0, "😕": 0, "😠": 0, "😄": 0, "🤯": 0 },
      lastEntry: null,
    };
  }
};

export const deleteJournalEntry = async (entryId) => {
  try {
    const entries = await getJournalEntries();
    const filtered = entries.filter((entry) => entry.id !== entryId);
    await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return false;
  }
};

// Calendar-specific functions
export const getJournalCalendarData = async (year, month) => {
  try {
    const entries = await getJournalEntries();
    const calendarData = {};

    entries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
        const day = entryDate.getDate();
        if (!calendarData[day]) {
          calendarData[day] = [];
        }
        calendarData[day].push(entry);
      }
    });

    return calendarData;
  } catch (error) {
    console.error("Error getting journal calendar data:", error);
    return {};
  }
};

export const getJournalsByDate = async (dateString) => {
  try {
    const entries = await getJournalEntries();
    return entries.filter((entry) => entry.dateString === dateString);
  } catch (error) {
    console.error("Error getting journals by date:", error);
    return [];
  }
};

export const getJournalMonthlyStats = async (year, month) => {
  try {
    const entries = await getJournalEntries();
    const monthEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });

    const daysWithEntries = new Set();
    let totalWords = 0;
    const moodCounts = {
      "😌": 0, // Calm
      "😕": 0, // Confused
      "😠": 0, // Frustrated
      "😄": 0, // Grateful
      "🤯": 0, // Overwhelmed
    };

    monthEntries.forEach((entry) => {
      daysWithEntries.add(entry.dateString);
      totalWords += entry.text.split(" ").length;
      if (entry.mood && moodCounts.hasOwnProperty(entry.mood)) {
        moodCounts[entry.mood]++;
      }
    });

    const averagePerDay =
      daysWithEntries.size > 0
        ? Math.round((monthEntries.length / daysWithEntries.size) * 10) / 10
        : 0;

    const averageWords =
      monthEntries.length > 0
        ? Math.round(totalWords / monthEntries.length)
        : 0;

    return {
      totalEntries: monthEntries.length,
      daysWithEntries: daysWithEntries.size,
      averagePerDay,
      averageWords,
      moodCounts,
    };
  } catch (error) {
    console.error("Error getting journal monthly stats:", error);
    return {
      totalEntries: 0,
      daysWithEntries: 0,
      averagePerDay: 0,
      averageWords: 0,
      moodCounts: { "😌": 0, "😕": 0, "😠": 0, "😄": 0, "🤯": 0 },
    };
  }
};

export const getJournalWeeklyData = async (weekStart) => {
  try {
    const entries = await getJournalEntries();
    const weekData = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const dateString = day.toDateString();

      const dayEntries = entries.filter(
        (entry) => entry.dateString === dateString
      );

      const totalWords = dayEntries.reduce(
        (sum, entry) => sum + entry.text.split(" ").length,
        0
      );

      weekData.push({
        date: new Date(day),
        count: dayEntries.length,
        totalWords,
        dayLabel: day.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }

    return weekData;
  } catch (error) {
    console.error("Error getting journal weekly data:", error);
    return [];
  }
};
