import AsyncStorage from "@react-native-async-storage/async-storage";

const TIMER_SESSIONS_KEY = "mindful_timer_sessions";

export const saveTimerSession = async (durationMinutes) => {
  try {
    const sessions = await getTimerSessions();
    const newSession = {
      id: Date.now().toString(),
      durationMinutes: durationMinutes,
      date: new Date().toISOString(),
      dateString: new Date().toDateString(),
      completed: true,
    };

    sessions.unshift(newSession); // Add to beginning

    // Keep only last 200 sessions
    if (sessions.length > 200) {
      sessions.splice(200);
    }

    await AsyncStorage.setItem(TIMER_SESSIONS_KEY, JSON.stringify(sessions));
    return newSession;
  } catch (error) {
    console.error("Error saving timer session:", error);
    throw error;
  }
};

export const getTimerSessions = async () => {
  try {
    const stored = await AsyncStorage.getItem(TIMER_SESSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error getting timer sessions:", error);
    return [];
  }
};

export const getTimerSessionsByDate = async (dateString) => {
  try {
    const sessions = await getTimerSessions();
    return sessions.filter(
      (session) => session.dateString === dateString && session.completed
    );
  } catch (error) {
    console.error("Error getting timer sessions by date:", error);
    return [];
  }
};

export const getTodaysTimerSessions = async () => {
  const today = new Date().toDateString();
  return await getTimerSessionsByDate(today);
};

export const getTimerCalendarData = async (year, month) => {
  try {
    const sessions = await getTimerSessions();
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
    console.error("Error getting timer calendar data:", error);
    return {};
  }
};

export const getWeeklyTimerData = async (weekStartDate) => {
  try {
    const sessions = await getTimerSessions();
    const weekData = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = currentDate.toDateString();

      const daySessions = sessions.filter(
        (session) => session.dateString === dateString && session.completed
      );

      // Calculate total minutes for the day
      const totalMinutes = daySessions.reduce(
        (total, session) => total + session.durationMinutes,
        0
      );

      weekData.push({
        date: currentDate,
        dateString: dateString,
        sessionCount: daySessions.length,
        totalMinutes: totalMinutes,
        sessions: daySessions,
      });
    }

    return weekData;
  } catch (error) {
    console.error("Error getting weekly timer data:", error);
    return [];
  }
};

export const getTimerSessionsByDateRange = async (startDate, endDate) => {
  try {
    const sessions = await getTimerSessions();
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return (
        sessionDate >= startDate && sessionDate <= endDate && session.completed
      );
    });
  } catch (error) {
    console.error("Error getting timer sessions by date range:", error);
    return [];
  }
};

export const getMonthlyTimerStats = async (year, month) => {
  try {
    const calendarData = await getTimerCalendarData(year, month);
    const daysWithSessions = Object.keys(calendarData).length;

    let totalSessions = 0;
    let totalMinutes = 0;

    Object.values(calendarData).forEach((daySessions) => {
      totalSessions += daySessions.length;
      totalMinutes += daySessions.reduce(
        (total, session) => total + session.durationMinutes,
        0
      );
    });

    return {
      daysWithSessions,
      totalSessions,
      totalMinutes,
      averageMinutesPerDay:
        daysWithSessions > 0 ? Math.round(totalMinutes / daysWithSessions) : 0,
      averageSessionsPerDay:
        daysWithSessions > 0
          ? (totalSessions / daysWithSessions).toFixed(1)
          : 0,
    };
  } catch (error) {
    console.error("Error getting monthly timer stats:", error);
    return {
      daysWithSessions: 0,
      totalSessions: 0,
      totalMinutes: 0,
      averageMinutesPerDay: 0,
      averageSessionsPerDay: 0,
    };
  }
};

export const getTimerStats = async () => {
  try {
    const sessions = await getTimerSessions();
    const completedSessions = sessions.filter((session) => session.completed);
    const totalSessions = completedSessions.length;
    const totalMinutes = completedSessions.reduce(
      (total, session) => total + session.durationMinutes,
      0
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
      totalMinutes,
      uniqueDays,
      currentStreak: streak,
      averageSessionLength:
        totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
      lastSession: completedSessions[0] || null,
    };
  } catch (error) {
    console.error("Error getting timer stats:", error);
    return {
      totalSessions: 0,
      totalMinutes: 0,
      uniqueDays: 0,
      currentStreak: 0,
      averageSessionLength: 0,
      lastSession: null,
    };
  }
};

export const deleteTimerSession = async (sessionId) => {
  try {
    const sessions = await getTimerSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    await AsyncStorage.setItem(TIMER_SESSIONS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting timer session:", error);
    return false;
  }
};
