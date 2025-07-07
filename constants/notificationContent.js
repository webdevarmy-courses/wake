import AsyncStorage from "@react-native-async-storage/async-storage";

const notificationMessages = [
  {
    title: "Gentle Reminder",
    body: "🧘‍♀️ Just checking in — are you scrolling with purpose or out of habit?",
    category: "awareness",
  },
  {
    title: "Posture Check",
    body: "🧍‍♂️ How's your back? Maybe straighten up and roll those shoulders.",
    category: "physical",
  },
  {
    title: "Breath Break",
    body: "🌿 Inhale slowly… hold… and exhale gently. Repeat two more times.",
    category: "breathing",
  },
  {
    title: "Mindful Pause",
    body: "⏸️ Take a small pause. Look around. What's happening in the real world?",
    category: "awareness",
  },
  {
    title: "Emotional Check-In",
    body: "🌊 Are you feeling calm, tense, or numb right now? Just notice.",
    category: "emotional",
  },
  {
    title: "Time Check",
    body: "⏳ Has your short scroll turned into a long one?",
    category: "time",
  },
  {
    title: "Mental Refresh",
    body: "🌀 Step away for 2 minutes. Breathe. Move. Then choose your next step.",
    category: "breathing",
  },
  {
    title: "Kind Nudge",
    body: "📴 Maybe it's time to put the phone down and stretch your legs?",
    category: "physical",
  },
  {
    title: "Inner Compass",
    body: "🧭 Is this content guiding you or distracting you?",
    category: "purpose",
  },
  {
    title: "Soft Reset",
    body: "🔁 Take a quick break and reset your attention gently.",
    category: "awareness",
  },
  {
    title: "Gentle Inquiry",
    body: "❓Is scrolling helping your mood or just passing time?",
    category: "emotional",
  },
  {
    title: "Unplug Moment",
    body: "🔌 Just a thought — a short break might recharge more than the scroll.",
    category: "time",
  },
  {
    title: "Self-Check",
    body: "💡 Are you still in control of your scroll, or is it leading you?",
    category: "awareness",
  },
  {
    title: "Stretch Prompt",
    body: "🤸‍♀️ Quick stretch? Your body will thank you.",
    category: "physical",
  },
  {
    title: "Compassion Reminder",
    body: "🧡 Be kind to your mind. Take a few moments to just be.",
    category: "emotional",
  },
  {
    title: "Clear Space",
    body: "🌤️ Step away for a minute and let your mind clear.",
    category: "reflection",
  },
  {
    title: "Mindful Redirection",
    body: "🚶‍♂️ A short walk might feel better than another scroll.",
    category: "purpose",
  },
  {
    title: "Quiet Moment",
    body: "🔇 Silence the noise for a bit. Breathe. Reset.",
    category: "breathing",
  },
  {
    title: "Gentle Stretch",
    body: "🦶 Wiggle your toes. Roll your neck. Let go of that stiffness.",
    category: "physical",
  },
  {
    title: "Feeling Meter",
    body: "🌡️ What's your energy level like right now?",
    category: "emotional",
  },
  {
    title: "Check Intentions",
    body: "🎯 What brought you here to scroll? Are you still aligned with that?",
    category: "purpose",
  },
  {
    title: "Break Invitation",
    body: "🛋️ Consider a cozy 5-minute break — no screens, just you.",
    category: "awareness",
  },
  {
    title: "Light Pause",
    body: "💡 Take a pause. A breath. Then scroll on, mindfully.",
    category: "breathing",
  },
  {
    title: "Digital Reflection",
    body: "📱 Notice how your scrolling is affecting your mood.",
    category: "emotional",
  },
  {
    title: "Tiny Reset",
    body: "🔄 Pause. Blink slowly. Smile. Ready to continue with intention?",
    category: "reflection",
  },
  {
    title: "Soften the Scroll",
    body: "🍃 Scroll softer, slower. Be gentle with your mind.",
    category: "awareness",
  },
  {
    title: "Eye Break",
    body: "👁️ Look away for 20 seconds. Your eyes need it.",
    category: "physical",
  },
  {
    title: "Kind Reminder",
    body: "💬 Be mindful of what you consume — does it nurture or drain you?",
    category: "emotional",
  },
  {
    title: "Purpose Prompt",
    body: "📝 Is there something meaningful you'd rather do right now?",
    category: "purpose",
  },
  {
    title: "Just Noticing",
    body: "👣 Notice your breath. Notice your posture. That's all.",
    category: "awareness",
  },
  {
    title: "Ground Yourself",
    body: "🌱 Feel your feet. Notice your surroundings. You're here.",
    category: "reflection",
  },
  {
    title: "Soft Eyes",
    body: "👓 Close your eyes gently for 10 seconds. Let them rest.",
    category: "physical",
  },
  {
    title: "You Good?",
    body: "🤔 Just checking in. How's your heart feeling today?",
    category: "emotional",
  },
  {
    title: "Anchor Yourself",
    body: "⚓ Find your breath. Let it anchor you to the present.",
    category: "breathing",
  },
  {
    title: "Mini Reboot",
    body: "💻 You reboot devices — what about your mind?",
    category: "time",
  },
  {
    title: "Digital Balance",
    body: "📶 Balance your online time with a few offline moments.",
    category: "purpose",
  },
  {
    title: "Breath Reset",
    body: "🌬️ Inhale through your nose, exhale through your mouth. Repeat slowly.",
    category: "breathing",
  },
  {
    title: "Check the Clock",
    body: "🕒 Did you mean to be scrolling this long?",
    category: "time",
  },
  {
    title: "Gentle Step Back",
    body: "🔙 A little distance from the feed can bring clarity.",
    category: "reflection",
  },
  {
    title: "Scroll or Soul?",
    body: "💖 Is this feed feeding your soul or just your time?",
    category: "emotional",
  },
  {
    title: "Time for You",
    body: "🌸 You deserve a few quiet moments away from the screen.",
    category: "purpose",
  },
  {
    title: "Mindful Minute",
    body: "🕯️ Close your eyes for 60 seconds and just listen.",
    category: "reflection",
  },
  {
    title: "Breath Space",
    body: "🌬️ There's space in your breath. Find it. Rest there.",
    category: "breathing",
  },
  {
    title: "Shift Attention",
    body: "🔍 What's one thing around you right now that you're grateful for?",
    category: "awareness",
  },
  {
    title: "Calm Cue",
    body: "🌾 Even a 10-second pause can create calm. Try it?",
    category: "awareness",
  },
  {
    title: "Inner Whisper",
    body: "🕊️ What does your body need more — another scroll or a break?",
    category: "physical",
  },
  {
    title: "Be Present",
    body: "🎁 The present moment might be more fulfilling than your feed.",
    category: "purpose",
  },
  {
    title: "Soft Reminder",
    body: "🍂 Let go of the scroll for a minute. Come back to now.",
    category: "awareness",
  },
  {
    title: "Nourish You",
    body: "🥗 What's one nourishing thing you could do for yourself right now?",
    category: "purpose",
  },
  {
    title: "Still Scrolling?",
    body: "📉 You said you'd stop 10 minutes ago. What changed?",
    category: "guilt",
  },
  {
    title: "Time Slipped Again",
    body: "⏰ That 'quick scroll' turned into a long one — again.",
    category: "guilt",
  },
  {
    title: "What Did You Gain?",
    body: "🤷‍♂️ After all that scrolling… do you feel better or drained?",
    category: "guilt",
  },
  {
    title: "Avoiding Something?",
    body: "🕳️ Be honest — are you scrolling to escape something important?",
    category: "guilt",
  },
  {
    title: "The Day Won't Wait",
    body: "🗓️ While you scroll, life moves on. Don't let it pass you by.",
    category: "guilt",
  },
  {
    title: "You Promised Yourself",
    body: "📵 Remember when you said, 'just five minutes'? That was a while ago.",
    category: "guilt",
  },
  {
    title: "Energy Drain",
    body: "🪫 You came here for a break — but now you're more tired, right?",
    category: "guilt",
  },
  {
    title: "Same Feed, Same Feeling",
    body: "🔁 You've seen all this before. Why are you still here?",
    category: "guilt",
  },
  {
    title: "Another Hour Lost",
    body: "⏳ You could've done something joyful. Instead, you kept scrolling.",
    category: "guilt",
  },
  {
    title: "Digital Junk Food",
    body: "🍟 You wouldn't eat mindless snacks all day. Why feed your brain that way?",
    category: "guilt",
  },
  {
    title: "Is This Self-Care?",
    body: "💔 Would future you be proud of how you're spending this time?",
    category: "guilt",
  },
  {
    title: "You're Still Here?",
    body: "👀 Even your phone's wondering what you're looking for.",
    category: "guilt",
  },
  {
    title: "Endless Feed, Empty Feel",
    body: "🌀 How much is too much before it starts hurting more than helping?",
    category: "guilt",
  },
  {
    title: "Another 'Just One More'",
    body: "🙈 You've said 'one more post' 20 times now. Sound familiar?",
    category: "guilt",
  },
  {
    title: "Scrolling Through Regret?",
    body: "😞 Be honest — have you enjoyed any of what you just saw?",
    category: "guilt",
  },
  {
    title: "FOMO or Habit?",
    body: "📲 What are you afraid of missing? Or are you just avoiding real life?",
    category: "guilt",
  },
  {
    title: "Tomorrow's You is Watching",
    body: "🧍‍♀️ Will you be proud of how you spent your time today?",
    category: "guilt",
  },
  {
    title: "Was This the Plan?",
    body: "📝 Is this what you wanted to do with your free time?",
    category: "guilt",
  },
  {
    title: "You Deserve Better",
    body: "🥀 You deserve peace and joy — not another hour of doomscrolling.",
    category: "guilt",
  },
  {
    title: "One More Hour Gone",
    body: "🕔 And just like that… an hour you'll never get back.",
    category: "guilt",
  },
];

const LAST_CATEGORIES_KEY = "@last_notification_categories";
const CATEGORIES_TO_TRACK = 5; // Keep track of last 5 categories to avoid repetition

export const getRandomNotification = async () => {
  try {
    // Get last used categories from storage
    const lastCategoriesStr = await AsyncStorage.getItem(LAST_CATEGORIES_KEY);
    let lastCategories = lastCategoriesStr ? JSON.parse(lastCategoriesStr) : [];

    // Filter out messages from recently used categories if possible
    let availableMessages = notificationMessages.filter(
      (msg) => !lastCategories.includes(msg.category)
    );

    // If all categories were recently used or no messages available, reset tracking
    if (availableMessages.length === 0) {
      availableMessages = notificationMessages;
      lastCategories = [];
    }

    // Get a random message
    const randomIndex = Math.floor(Math.random() * availableMessages.length);
    const selectedMessage = availableMessages[randomIndex];

    // Update the last used categories
    lastCategories.push(selectedMessage.category);
    if (lastCategories.length > CATEGORIES_TO_TRACK) {
      lastCategories.shift(); // Remove oldest category
    }

    // Save updated categories
    await AsyncStorage.setItem(
      LAST_CATEGORIES_KEY,
      JSON.stringify(lastCategories)
    );

    return {
      title: selectedMessage.title,
      body: selectedMessage.body,
    };
  } catch (error) {
    console.error("Error in getRandomNotification:", error);
    // Fallback to simple random selection if storage fails
    const randomIndex = Math.floor(Math.random() * notificationMessages.length);
    const selectedMessage = notificationMessages[randomIndex];
    return {
      title: selectedMessage.title,
      body: selectedMessage.body,
    };
  }
};
