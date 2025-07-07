export const mindfulPrompts = [
  "Take a breath. What are you really looking for right now?",
  "Notice the weight of your phone in your hand. What does your body need?",
  "Pause. What would bring you more peace in this moment?",
  "What are you avoiding by scrolling right now?",
  "Take three deep breaths. How do you want to spend the next 10 minutes?",
  "What would make you feel more connected to yourself today?",
  "Notice your posture. How can you care for your body right now?",
  "What small act of kindness could you show yourself today?",
  "Breathe in calm, breathe out tension. What do you truly need?",
  "What would happen if you put your phone down for just 5 minutes?",
  "Notice the sounds around you. What brings you to the present moment?",
  "What would your future self thank you for doing right now?",
  "Feel your feet on the ground. What grounds you today?",
  "What intention do you want to set for this moment?",
  "Notice your emotions without judgment. What do you feel right now?",
  "What would bring more joy to your day?",
  "Take a moment to appreciate something beautiful near you.",
  "What would help you feel more centered right now?",
  "Breathe deeply. What deserves your attention more than this screen?",
  "What small step toward your goals could you take today?",
  "Notice your thoughts like clouds passing. What matters most?",
  "What would make you feel more alive in this moment?",
  "How can you show yourself compassion right now?",
  "What brings you genuine happiness beyond the screen?",
  "Take a pause. What would nourish your soul today?",
  "What are you grateful for in this very moment?",
  "How can you connect with someone you care about today?",
  "What would help you feel more present right now?",
  "Notice your breathing. What calms your mind?",
  "What would your wisest self choose to do right now?",
  "How does your body feel right now? Just notice, without changing anything.",
  "Look away from your screen. What do you see around you?",
  "If your heart could speak, what would it whisper right now?",
  "Are you scrolling to escape or to connect?",
  "Notice your breath. Is it shallow or deep?",
  "Ask yourself: What am I hoping to find by scrolling?",
  "When did you last do something that made you smile?",
  "What could you do right now that feels nourishing?",
  "Breathe slowly. Is your mind racing or calm?",
  "What would happen if you simply sat in silence for a minute?",
  "Can you take 30 seconds to stretch or move your body?",
  "What’s a simple joy you haven’t made time for lately?",
  "If your inner child saw you now, what would they ask for?",
  "Are you seeking stimulation, or are you avoiding stillness?",
  "Put your hand on your heart. What does it need?",
  "What are you feeling under the surface right now?",
  "What would happen if you replaced scrolling with stillness?",
  "Close your eyes. Can you find a moment of peace inside?",
  "What would it feel like to choose rest over distraction?",
  "What’s one thing that could bring more light to your day?",
  "When did you last check in with your own needs?",
  "Is this habit serving your well-being or draining it?",
  "What might you discover if you sat with your feelings for a minute?",
  "Where in your life are you craving more intention?",
  "What are you putting off that your future self would be grateful for?",
  "Can you name one thing you’re proud of today?",
  "Notice any tension in your body. Can you soften it?",
  "What would be a loving choice for yourself in this moment?",
  "What’s a memory that always makes you smile?",
  "Can you replace one scroll with one deep breath?",
  "What does rest look like for you today?",
  "If your screen froze for a while, what would you do instead?",
  "What are three things you’re thankful for right now?",
  "Is your body asking for a walk, a stretch, or just stillness?",
  "Can you offer yourself kindness instead of distraction?",
  "What would feel like a tiny act of self-respect right now?",
  "What do you wish you had more of today—peace, focus, joy?",
  "Are you scrolling because you're bored or because you're tired?",
  "What’s something meaningful you can do in the next 5 minutes?",
  "How would it feel to choose presence over passivity?",
  "Can you feel the air entering and leaving your body?",
  "When was the last time you stepped outside without your phone?",
  "What does it mean to be truly awake in this moment?",
  "What’s waiting for you beyond this screen?",
  "What intention could replace this automatic scroll?",
  "How might you care for your inner world right now?",
  "What’s a book, a song, or a person that centers you?",
  "Can you pause for a moment of quiet gratitude?",
  "If this moment was a message, what would it be saying?",
  "How can you honor your time a little more tenderly today?",
  "Can you give your mind permission to rest?",
];

// Enhanced intervention prompts for different contexts
export const interventionCategories = {
  awareness: [
    "You just caught yourself scrolling. That's mindfulness in action! 🧘",
    "This moment of awareness is powerful. You're training your mind to be present.",
    "Notice: You just broke an unconscious pattern. How does this awareness feel?",
    "You paused the scroll. You chose presence over compulsion. That's growth.",
  ],

  reflection: [
    "What emotion were you trying to escape by scrolling?",
    "If you could use this time for anything, what would truly serve you?",
    "What's one thing you're grateful for in this exact moment?",
    "How are you feeling in your body right now? Tense? Relaxed?",
    "What would bring you more peace than this screen?",
  ],

  breathing: [
    "Take three slow breaths. Let each exhale release what no longer serves you.",
    "Breathe in for 4, hold for 4, breathe out for 6. You are present.",
    "Feel your breath moving through your body. This is your anchor to now.",
    "With each breath, come back to yourself. You are here, you are whole.",
  ],

  grounding: [
    "Feel your feet on the ground. Notice three things you can see around you.",
    "Place your hand on your heart. Feel it beating. You are alive, you are here.",
    "Look up from your screen. What's the furthest thing you can see?",
    "Notice the temperature of the air on your skin. You are in this moment.",
  ],

  intention: [
    "What intention do you want to set for the next hour?",
    "How do you want to feel when you go to bed tonight?",
    "What would make this day meaningful for you?",
    "What's one small action that would align with your deeper values?",
  ],
};

export const getDailyPrompt = () => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  );
  const index = dayOfYear % mindfulPrompts.length;
  return mindfulPrompts[index];
};

// Get a random prompt from a specific category
export const getCategoryPrompt = (category) => {
  const prompts = interventionCategories[category];
  if (!prompts) return getDailyPrompt();

  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
};

// Get a contextual intervention based on time and usage patterns
export const getContextualIntervention = () => {
  const hour = new Date().getHours();

  // Morning: intention setting
  if (hour >= 6 && hour < 12) {
    return {
      type: "intention",
      prompt: getCategoryPrompt("intention"),
      suggestion: "Start your day with purpose",
    };
  }

  // Afternoon: awareness and grounding
  if (hour >= 12 && hour < 18) {
    return {
      type: "grounding",
      prompt: getCategoryPrompt("grounding"),
      suggestion: "Ground yourself in the present",
    };
  }

  // Evening: reflection
  if (hour >= 18 && hour < 22) {
    return {
      type: "reflection",
      prompt: getCategoryPrompt("reflection"),
      suggestion: "Reflect on your day",
    };
  }

  // Night: breathing and calming
  return {
    type: "breathing",
    prompt: getCategoryPrompt("breathing"),
    suggestion: "Breathe and prepare for rest",
  };
};

// Progressive intervention system - gets stronger with repeated use
export const getProgressiveIntervention = (scrollCount = 1) => {
  if (scrollCount === 1) {
    return {
      intensity: "gentle",
      prompt: getCategoryPrompt("awareness"),
      duration: 3000, // 3 seconds pause
    };
  }

  if (scrollCount <= 3) {
    return {
      intensity: "moderate",
      prompt: getCategoryPrompt("reflection"),
      duration: 5000, // 5 seconds pause
    };
  }

  // Heavy usage - stronger intervention
  return {
    intensity: "strong",
    prompt: getCategoryPrompt("grounding"),
    duration: 8000, // 8 seconds pause
    forceBreath: true,
  };
};
