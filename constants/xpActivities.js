// XP Activity Constants for the Mindful App

export const XP_ACTIVITIES = [
  {
    id: "catch_scrolling",
    emoji: "✋",
    title: "Catch Me Scrolling",
    xp: 1,
    color: "#FFE37D", // Golden yellow
    description: "Recognize mindless scrolling",
    route: null, // Already on the page
  },
  {
    id: "focus_goals",
    emoji: "🎯",
    title: "Focus Goals",
    xp: 5,
    color: "#B4E5B0", // Soft mint green
    description: "Complete focus tasks & goals",
    route: "/(tabs)/focus",
  },
  {
    id: "breathing",
    emoji: "🧘",
    title: "1-min Breathing",
    xp: 5,
    color: "#93D5E1", // Ice blue
    description: "5-breath mindful session",
    route: "/replace/breathing",
  },
  {
    id: "timer",
    emoji: "🕒",
    title: "Screen-Free Timer",
    xp: 4,
    color: "#F4D8FE", // Lavender
    description: "Mindful break from devices",
    route: "/replace/timer",
  },
  {
    id: "journal",
    emoji: "📝",
    title: "Quick Journal",
    xp: 3,
    color: "#F3FBCB", // Pale mint
    description: "Express your thoughts",
    route: "/replace/journal",
  },
  {
    id: "reflection",
    emoji: "💭",
    title: "Quick Reflection",
    xp: 3,
    color: "#FFE4E1", // Light coral
    description: "Mindful self-awareness",
    route: "/replace/reflect",
  },
];

// XP Milestones and Badges
export const XP_MILESTONES = [
  {
    id: "starter",
    name: "Mindful Starter",
    emoji: "🌱",
    requiredXP: 10,
    description: "You've begun your mindful journey!",
    color: "#90EE90",
  },
  {
    id: "aware",
    name: "Awareness Badge",
    emoji: "👁️",
    requiredXP: 25,
    description: "Growing awareness of your habits",
    color: "#87CEEB",
  },
  {
    id: "calm",
    name: "Calm Badge",
    emoji: "🌿",
    requiredXP: 50,
    description: "Finding moments of peace",
    color: "#98FB98",
  },
  {
    id: "mindful",
    name: "Mindful Explorer",
    emoji: "🧭",
    requiredXP: 100,
    description: "Exploring mindfulness deeply",
    color: "#DDA0DD",
  },
  {
    id: "wise",
    name: "Wisdom Keeper",
    emoji: "🦉",
    requiredXP: 200,
    description: "Wisdom through practice",
    color: "#F0E68C",
  },
  {
    id: "zen",
    name: "Zen Master",
    emoji: "☯️",
    requiredXP: 500,
    description: "Balance in all things",
    color: "#FFB6C1",
  },
];

// Motivational Quotes
export const MINDFUL_QUOTES = [
  "Small mindful moments create powerful change.",
  "Awareness is the first step to transformation.",
  "Every breath is a new beginning.",
  "Progress, not perfection, is the goal.",
  "Your journey of a thousand miles begins with a single step.",
  "Mindfulness is about being where you are.",
  "The present moment is the only time we have.",
  "Gentle awareness builds lasting habits.",
  "Each mindful choice matters.",
  "Your awareness is a gift to yourself.",
];

// Helper function to get next milestone
export const getNextMilestone = (currentXP) => {
  return (
    XP_MILESTONES.find((milestone) => milestone.requiredXP > currentXP) || null
  );
};

// Helper function to get earned badges
export const getEarnedBadges = (currentXP) => {
  return XP_MILESTONES.filter((milestone) => milestone.requiredXP <= currentXP);
};

// Helper function to get random quote
export const getRandomQuote = () => {
  return MINDFUL_QUOTES[Math.floor(Math.random() * MINDFUL_QUOTES.length)];
};
