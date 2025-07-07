import AsyncStorage from "@react-native-async-storage/async-storage";

const BREATHING_SESSIONS_KEY = "mindful_breathing_sessions";

export const saveBreathingSession = async (breathCount = 5) => {
  try {
    const sessions = await getBreathingSessions();
    const newSession = {
      id: Date.now().toString(),
      breathCount: breathCount,
      date: new Date().toISOString(),
      dateString: new Date().toDateString(),
      completed: true,
      durationSeconds: breathCount * 14, // Approximate duration (4+4+6 seconds per breath)
    };

    sessions.unshift(newSession); // Add to beginning

    // Keep only last 200 sessions
    if (sessions.length > 200) {
      sessions.splice(200);
    }

    await AsyncStorage.setItem(
      BREATHING_SESSIONS_KEY,
      JSON.stringify(sessions)
    );
    return newSession;
  } catch (error) {
    console.error("Error saving breathing session:", error);
    throw error;
  }
};

export const getBreathingSessions = async () => {
  try {
    const stored = await AsyncStorage.getItem(BREATHING_SESSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting breathing sessions:", error);
    return [];
  }
};

export const getBreathingSessionsByDate = async (dateString) => {
  try {
    const sessions = await getBreathingSessions();
    return sessions.filter(
      (session) => session.dateString === dateString && session.completed
    );
  } catch (error) {
    console.error("Error getting breathing sessions by date:", error);
    return [];
  }
};

export const getTodaysBreathingSessions = async () => {
  const today = new Date().toDateString();
  return await getBreathingSessionsByDate(today);
};

export const getBreathingCalendarData = async (year, month) => {
  try {
    const sessions = await getBreathingSessions();
    const calendarData = {};

    // Filter sessions for the specific month/year
    sessions.forEach((session) => {
      const date = new Date(session.date);
      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        session.completed
      ) {
        const dayKey = date.getDate();
        if (!calendarData[dayKey]) {
          calendarData[dayKey] = [];
        }
        calendarData[dayKey].push(session);
      }
    });

    return calendarData;
  } catch (error) {
    console.error("Error getting breathing calendar data:", error);
    return {};
  }
};

export const getWeeklyBreathingData = async (weekStartDate) => {
  try {
    const sessions = await getBreathingSessions();
    const weekData = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = currentDate.toDateString();

      const daySessions = sessions.filter(
        (session) => session.dateString === dateString && session.completed
      );

      // Calculate total breaths and minutes for the day
      const totalBreaths = daySessions.reduce(
        (total, session) => total + session.breathCount,
        0
      );
      const totalMinutes = Math.round(
        daySessions.reduce(
          (total, session) => total + session.durationSeconds / 60,
          0
        )
      );

      weekData.push({
        date: currentDate,
        dateString: dateString,
        sessionCount: daySessions.length,
        totalBreaths: totalBreaths,
        totalMinutes: totalMinutes,
        sessions: daySessions,
      });
    }

    return weekData;
  } catch (error) {
    console.error("Error getting weekly breathing data:", error);
    return [];
  }
};

export const getBreathingSessionsByDateRange = async (startDate, endDate) => {
  try {
    const sessions = await getBreathingSessions();
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return (
        sessionDate >= startDate && sessionDate <= endDate && session.completed
      );
    });
  } catch (error) {
    console.error("Error getting breathing sessions by date range:", error);
    return [];
  }
};

export const getMonthlyBreathingStats = async (year, month) => {
  try {
    const calendarData = await getBreathingCalendarData(year, month);
    const daysWithSessions = Object.keys(calendarData).length;

    let totalSessions = 0;
    let totalBreaths = 0;
    let totalMinutes = 0;

    Object.values(calendarData).forEach((daySessions) => {
      totalSessions += daySessions.length;
      totalBreaths += daySessions.reduce(
        (total, session) => total + session.breathCount,
        0
      );
      totalMinutes += daySessions.reduce(
        (total, session) => total + session.durationSeconds / 60,
        0
      );
    });

    return {
      daysWithSessions,
      totalSessions,
      totalBreaths,
      totalMinutes: Math.round(totalMinutes),
      averageBreathsPerDay:
        daysWithSessions > 0 ? Math.round(totalBreaths / daysWithSessions) : 0,
      averageSessionsPerDay:
        daysWithSessions > 0
          ? (totalSessions / daysWithSessions).toFixed(1)
          : 0,
    };
  } catch (error) {
    console.error("Error getting monthly breathing stats:", error);
    return {
      daysWithSessions: 0,
      totalSessions: 0,
      totalBreaths: 0,
      totalMinutes: 0,
      averageBreathsPerDay: 0,
      averageSessionsPerDay: 0,
    };
  }
};

export const getBreathingStats = async () => {
  try {
    const sessions = await getBreathingSessions();
    const completedSessions = sessions.filter((session) => session.completed);
    const totalSessions = completedSessions.length;
    const totalBreaths = completedSessions.reduce(
      (total, session) => total + session.breathCount,
      0
    );
    const totalMinutes = Math.round(
      completedSessions.reduce(
        (total, session) => total + session.durationSeconds / 60,
        0
      )
    );

    // Count sessions by date for streak calculation
    const dateMap = {};
    completedSessions.forEach((session) => {
      dateMap[session.dateString] = true;
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
      totalSessions,
      totalBreaths,
      totalMinutes,
      uniqueDays,
      currentStreak: streak,
      lastSession: completedSessions[0] || null,
    };
  } catch (error) {
    console.error("Error getting breathing stats:", error);
    return {
      totalSessions: 0,
      totalBreaths: 0,
      totalMinutes: 0,
      uniqueDays: 0,
      currentStreak: 0,
      lastSession: null,
    };
  }
};

export const deleteBreathingSession = async (sessionId) => {
  try {
    const sessions = await getBreathingSessions();
    const filtered = sessions.filter((session) => session.id !== sessionId);
    await AsyncStorage.setItem(
      BREATHING_SESSIONS_KEY,
      JSON.stringify(filtered)
    );
    return true;
  } catch (error) {
    console.error("Error deleting breathing session:", error);
    return false;
  }
};
