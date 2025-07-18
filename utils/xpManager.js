import AsyncStorage from "@react-native-async-storage/async-storage";

let xp = 0;
let streak = 0;
let lastInteractionDate = null;

const XP_KEY = "mindful_xp";
const STREAK_KEY = "mindful_streak";
const LAST_INTERACTION_KEY = "last_interaction_date";

export const getXP = async () => {
  try {
    const stored = await AsyncStorage.getItem(XP_KEY);
    xp = stored ? parseInt(stored) : 0;
    console.log("[XP Manager] getXP:", xp);
    return xp;
  } catch (error) {
    console.error("Error getting XP:", error);
    return 0;
  }
};

export const getTodaysXP = async () => {
  try {
    const history = await getXPHistory();
    const today = new Date().toDateString();

    console.log("[XP Manager] getTodaysXP - Today:", today);
    console.log("[XP Manager] XP History:", history);

    const todayEntry = history.find((entry) => entry.date === today);
    const result = todayEntry ? todayEntry.xp : 0;
    console.log("[XP Manager] Todays XP result:", result);
    return result;
  } catch (error) {
    console.error("Error getting today's XP:", error);
    return 0;
  }
};

export const addXP = async (amount) => {
  try {
    console.log("[XP Manager] Adding XP:", amount);

    // Get current total XP first
    const currentTotal = await getXP();
    xp = currentTotal + amount;

    await AsyncStorage.setItem(XP_KEY, xp.toString());
    console.log("[XP Manager] Updated total XP to:", xp);

    // Update streak logic
    const today = new Date().toDateString();
    const lastDate = await AsyncStorage.getItem(LAST_INTERACTION_KEY);

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      if (lastDate === yesterdayString) {
        // Consecutive day - increment streak
        const currentStreak = await getStreak();
        streak = currentStreak + 1;
        await AsyncStorage.setItem(STREAK_KEY, streak.toString());
        console.log("[XP Manager] Incremented streak to:", streak);
      } else if (!lastDate) {
        // First time ever - start streak at 1
        streak = 1;
        await AsyncStorage.setItem(STREAK_KEY, "1");
        console.log("[XP Manager] Started new streak at 1");
      } else {
        // Broken streak - reset to 1
        streak = 1;
        await AsyncStorage.setItem(STREAK_KEY, "1");
        console.log("[XP Manager] Broke streak, reset to 1");
      }

      await AsyncStorage.setItem(LAST_INTERACTION_KEY, today);
    } else {
      // Same day - just maintain current streak
      streak = await getStreak();
      console.log("[XP Manager] Same day, maintaining streak:", streak);
    }

    // Also save to XP history for daily tracking
    await saveXPHistory(today, amount);
    console.log(
      "[XP Manager] Saved to XP history - Date:",
      today,
      "Amount:",
      amount
    );

    return xp;
  } catch (error) {
    console.error("Error adding XP:", error);
    return xp;
  }
};

export const getStreak = async () => {
  try {
    const stored = await AsyncStorage.getItem(STREAK_KEY);
    streak = stored ? parseInt(stored) : 0;
    return streak;
  } catch (error) {
    console.error("Error getting streak:", error);
    return 0;
  }
};

export const resetXP = async () => {
  try {
    xp = 0;
    await AsyncStorage.setItem(XP_KEY, "0");
    return xp;
  } catch (error) {
    console.error("Error resetting XP:", error);
    return 0;
  }
};

export const getXPHistory = async () => {
  try {
    const history = await AsyncStorage.getItem("xp_history");
    const result = history ? JSON.parse(history) : [];
    console.log("[XP Manager] getXPHistory result:", result);
    return result;
  } catch (error) {
    console.error("Error getting XP history:", error);
    return [];
  }
};

export const saveXPHistory = async (date, xpGained) => {
  try {
    console.log(
      "[XP Manager] saveXPHistory - Date:",
      date,
      "XP Gained:",
      xpGained
    );
    const history = await getXPHistory();
    const today = new Date().toDateString();

    const existingEntry = history.find((entry) => entry.date === today);
    if (existingEntry) {
      console.log(
        "[XP Manager] Found existing entry, updating XP from",
        existingEntry.xp,
        "to",
        existingEntry.xp + xpGained
      );
      existingEntry.xp += xpGained;
    } else {
      console.log("[XP Manager] Creating new entry for today");
      history.push({ date: today, xp: xpGained });
    }

    // Keep only last 30 days
    if (history.length > 30) {
      history.sort((a, b) => new Date(b.date) - new Date(a.date));
      history.splice(30);
    }

    await AsyncStorage.setItem("xp_history", JSON.stringify(history));
    console.log("[XP Manager] Updated XP history:", history);
  } catch (error) {
    console.error("Error saving XP history:", error);
  }
};

export const validateAndFixStreak = async () => {
  try {
    console.log("[XP Manager] Validating streak...");
    
    // Get XP history to calculate actual streak
    const history = await getXPHistory();
    if (history.length === 0) {
      await AsyncStorage.setItem(STREAK_KEY, "0");
      await AsyncStorage.removeItem(LAST_INTERACTION_KEY);
      return 0;
    }

    // Sort history by date (newest first)
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    let actualStreak = 0;
    const today = new Date();
    
    // Check consecutive days starting from today
    for (let i = 0; i < history.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const checkDateString = checkDate.toDateString();
      
      // Find entry for this date
      const dayEntry = history.find(entry => entry.date === checkDateString);
      
      if (dayEntry && dayEntry.xp > 0) {
        actualStreak++;
      } else {
        // No XP for this day, break the streak
        break;
      }
    }

    // Update stored streak if different
    const storedStreak = await getStreak();
    if (storedStreak !== actualStreak) {
      console.log("[XP Manager] Fixing streak from", storedStreak, "to", actualStreak);
      await AsyncStorage.setItem(STREAK_KEY, actualStreak.toString());
      
      // Update last interaction date to today if we have XP today
      const todayEntry = history.find(entry => entry.date === today.toDateString());
      if (todayEntry && todayEntry.xp > 0) {
        await AsyncStorage.setItem(LAST_INTERACTION_KEY, today.toDateString());
      }
    }

    return actualStreak;
  } catch (error) {
    console.error("Error validating streak:", error);
    return 0;
  }
};

// Catch Me Scrolling specific tracking
const CATCH_SCROLL_KEY = "catch_scroll_taps";

export const addCatchScrollTap = async () => {
  try {
    const today = new Date().toDateString();
    const currentTime = new Date().toISOString();

    console.log("[XP Manager] Adding Catch Scroll tap:", today);

    const history = await getCatchScrollHistory();
    const todayEntry = history.find((entry) => entry.date === today);

    if (todayEntry) {
      todayEntry.taps += 1;
      todayEntry.times.push(currentTime);
      console.log("[XP Manager] Updated today's taps to:", todayEntry.taps);
    } else {
      history.push({
        date: today,
        taps: 1,
        times: [currentTime],
        xpEarned: 1,
      });
      console.log("[XP Manager] Created new entry for catch scroll taps");
    }

    // Keep only last 30 days
    if (history.length > 30) {
      history.sort((a, b) => new Date(b.date) - new Date(a.date));
      history.splice(30);
    }

    await AsyncStorage.setItem(CATCH_SCROLL_KEY, JSON.stringify(history));
    console.log("[XP Manager] Updated Catch Scroll history:", history);

    // Also add to regular XP
    await addXP(1);

    return todayEntry ? todayEntry.taps : 1;
  } catch (error) {
    console.error("Error adding catch scroll tap:", error);
    return 0;
  }
};

export const getCatchScrollHistory = async () => {
  try {
    const history = await AsyncStorage.getItem(CATCH_SCROLL_KEY);
    const result = history ? JSON.parse(history) : [];
    console.log("[XP Manager] getCatchScrollHistory result:", result);
    return result;
  } catch (error) {
    console.error("Error getting catch scroll history:", error);
    return [];
  }
};

export const getTodaysCatchScrollTaps = async () => {
  try {
    const history = await getCatchScrollHistory();
    const today = new Date().toDateString();

    const todayEntry = history.find((entry) => entry.date === today);
    const result = todayEntry ? todayEntry.taps : 0;
    console.log("[XP Manager] Today's catch scroll taps:", result);
    return result;
  } catch (error) {
    console.error("Error getting today's catch scroll taps:", error);
    return 0;
  }
};

export const getTotalCatchScrollTaps = async () => {
  try {
    const history = await getCatchScrollHistory();
    const total = history.reduce((sum, entry) => sum + entry.taps, 0);
    console.log("[XP Manager] Total catch scroll taps:", total);
    return total;
  } catch (error) {
    console.error("Error getting total catch scroll taps:", error);
    return 0;
  }
};
