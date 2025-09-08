export const onboardingQuestions = [
  {
    id: 1,
    type: "multiple-choice",
    question: "How old are you?",
    options: [
      "13 to 17",
      "18 to 24", 
      "25 to 34",
      "35 to 44",
      "45 to 54",
      "55 or above"
    ]
  },
  {
    id: 2,
    type: "multiple-choice",
    question: "What's your gender?",
    options: [
      "Male",
      "Female",
      "Other",
      "Prefer not to answer"
    ]
  },
  {
    id: 3,
    type: "multiple-choice",
    question: "How would you describe your current life?",
    options: [
      "I'm satisfied with my life now",
      "I'm alright and want to self-improve",
      "I'm doing okay, not good or bad",
      "I'm often sad and rarely happy",
      "I'm at the lowest and need help"
    ]
  },
  {
    id: 4,
    type: "multiple-choice",
    question: "What is the biggest reason you want to reset your life?",
    options: [
      "Lack motivation and discipline",
      "Improve my study and career",
      "Quit doomscrolling and improve life",
      "Build muscle and get fit",
      "Overcome major life setbacks",
      "Quit porn addictions"
    ]
  },
  {
    id: 5,
    type: "multiple-choice",
    question: "When was the last time you were proud of yourself?",
    options: [
      "Just today",
      "Few days ago",
      "Few weeks ago",
      "Few months ago",
      "Too long, I can't remember"
    ]
  },
  {
    id: 6,
    type: "slider",
    question: "How long do you use your phone daily?",
    min: 1,
    max: 12,
    unit: "hours",
    step: 0.5
  },
  {
    id: 7,
    type: "number-picker",
    question: "How much is 1 hour of your time worth?",
    min: 10,
    max: 100,
    unit: "$",
    step: 5
  },
  {
    id: 8,
    type: "multiple-choice",
    question: "What's your long-term goal in life?",
    options: [
      "Build better daily habits",
      "Improve focus and productivity", 
      "Strengthen relationships and social life",
      "Grow physically and mentally stronger",
      "Gain financial independence",
      "Find purpose and meaning in life"
    ]
  }
];

export const progressGlimpse = {
  title: "Your progress will be tracked here",
  description: "The average person wastes 2 hours 31 minutes daily on their phone.\nWith Wake Scroll, users report up to 345% improvements in focus, energy, and well-being."
};

export const motivationalPage = {
  title: "I'm proud of you for wanting to make changes.",
  subtitle: "Let's take control of your life.",
  emoji: "🔥"
};

// New lifestyle tracking questions
export const lifestyleQuestions = [
  {
    id: 1,
    type: "time-picker",
    question: "What time do you wake up right now?",
    title: "Wake Up Time"
  },
  {
    id: 2,
    type: "number-selector",
    question: "How much water do you drink a day?",
    min: 0,
    max: 10,
    unit: "L",
    step: 0.5,
    title: "Water Intake"
  },
  {
    id: 3,
    type: "slider",
    question: "How much do you usually run in a week?",
    min: 0,
    max: 100,
    unit: "km",
    step: 1,
    title: "Running"
  },
  {
    id: 4,
    type: "number-selector",
    question: "How many hours do you usually work out in a week?",
    min: 0,
    max: 20,
    unit: "hours",
    step: 1,
    title: "Workout"
  },
  {
    id: 5,
    type: "slider",
    question: "How much time do you spend meditating in a week?",
    min: 0,
    max: 20,
    unit: "hours",
    step: 0.5,
    title: "Meditation"
  },
  {
    id: 6,
    type: "slider",
    question: "How much time do you spend reading books in a week?",
    min: 0,
    max: 20,
    unit: "hours",
    step: 0.5,
    title: "Reading"
  },
  {
    id: 7,
    type: "slider",
    question: "How much time do you spend on social media in a week?",
    min: 0,
    max: 80,
    unit: "hours",
    step: 1,
    title: "Social Media"
  }
];

// Scoring logic for dynamic rating calculation
export const calculateRating = (answers) => {
  // Lower base scores to ensure current ratings are below 50
  let overall = 35;
  let wisdom = 30;
  let strength = 32;
  let focus = 28;
  let confidence = 33;
  let discipline = 30;

  // Adjust based on lifestyle answers (stricter scoring)
  if (answers.wakeTime) {
    const hour = parseInt(answers.wakeTime.split(':')[0]);
    if (hour <= 5) {
      discipline += 8;
      overall += 5;
    } else if (hour <= 6) {
      discipline += 4;
      overall += 2;
    } else if (hour >= 8) {
      discipline -= 8;
      overall -= 5;
    } else if (hour >= 7) {
      discipline -= 4;
      overall -= 2;
    }
  }

  if (answers.water) {
    if (answers.water >= 3) {
      strength += 8;
      discipline += 4;
    } else if (answers.water >= 2.5) {
      strength += 4;
      discipline += 2;
    } else if (answers.water < 1.5) {
      strength -= 8;
      discipline -= 4;
    }
  }

  if (answers.running) {
    if (answers.running >= 20) {
      strength += 12;
      discipline += 8;
      confidence += 8;
    } else if (answers.running >= 10) {
      strength += 6;
      discipline += 4;
      confidence += 4;
    } else if (answers.running === 0) {
      strength -= 12;
      discipline -= 8;
      confidence -= 6;
    } else if (answers.running < 5) {
      strength -= 6;
      discipline -= 4;
    }
  }

  if (answers.workout) {
    if (answers.workout >= 8) {
      strength += 15;
      confidence += 12;
      discipline += 8;
    } else if (answers.workout >= 5) {
      strength += 8;
      confidence += 6;
      discipline += 4;
    } else if (answers.workout === 0) {
      strength -= 15;
      confidence -= 12;
      discipline -= 8;
    } else if (answers.workout < 2) {
      strength -= 8;
      confidence -= 6;
    }
  }

  if (answers.meditation) {
    if (answers.meditation >= 5) {
      wisdom += 15;
      focus += 12;
      discipline += 8;
    } else if (answers.meditation >= 3) {
      wisdom += 8;
      focus += 6;
      discipline += 4;
    } else if (answers.meditation === 0) {
      wisdom -= 12;
      focus -= 15;
      discipline -= 6;
    } else if (answers.meditation < 1) {
      wisdom -= 6;
      focus -= 8;
    }
  }

  if (answers.reading) {
    if (answers.reading >= 8) {
      wisdom += 18;
      focus += 15;
    } else if (answers.reading >= 5) {
      wisdom += 10;
      focus += 8;
    } else if (answers.reading === 0) {
      wisdom -= 15;
      focus -= 12;
    } else if (answers.reading < 2) {
      wisdom -= 8;
      focus -= 6;
    }
  }

  if (answers.socialMedia) {
    if (answers.socialMedia >= 40) {
      focus -= 20;
      discipline -= 15;
      overall -= 12;
    } else if (answers.socialMedia >= 20) {
      focus -= 15;
      discipline -= 10;
      overall -= 8;
    } else if (answers.socialMedia >= 10) {
      focus -= 8;
      discipline -= 5;
      overall -= 4;
    } else if (answers.socialMedia <= 3) {
      focus += 8;
      discipline += 6;
      overall += 4;
    }
  }

  // Ensure scores stay within bounds (15-48 for current, so potential can show improvement)
  const clamp = (value) => Math.max(15, Math.min(48, Math.round(value)));

  return {
    overall: clamp(overall),
    wisdom: clamp(wisdom),
    strength: clamp(strength),
    focus: clamp(focus),
    confidence: clamp(confidence),
    discipline: clamp(discipline)
  };
};

// Calculate potential rating (higher scores in green)
export const calculatePotentialRating = (currentRating) => {
  return {
    overall: Math.min(92, currentRating.overall + 40),
    wisdom: Math.min(88, currentRating.wisdom + 45),
    strength: Math.min(85, currentRating.strength + 40),
    focus: Math.min(95, currentRating.focus + 50),
    confidence: Math.min(87, currentRating.confidence + 40),
    discipline: Math.min(90, currentRating.discipline + 45)
  };
};

// Calculate poor lifestyle percentage for analyzing page
export const calculatePoorLifestylePercentage = (answers) => {
  let negativePoints = 0;
  let totalPoints = 0;

  // Wake time (stricter standards - most times are now "poor")
  if (answers.wakeTime) {
    const hour = parseInt(answers.wakeTime.split(':')[0]);
    if (hour >= 8) negativePoints += 25; // 8 AM or later is poor
    else if (hour >= 7) negativePoints += 15; // 7-8 AM is mediocre
    else if (hour >= 6) negativePoints += 5; // 6-7 AM is okay
    totalPoints += 25;
  }

  // Water intake (stricter - need 2.5L+ to be good)
  if (answers.water !== undefined) {
    if (answers.water < 2) negativePoints += 20;
    else if (answers.water < 2.5) negativePoints += 12;
    else if (answers.water < 3) negativePoints += 5;
    totalPoints += 20;
  }

  // Running (very strict - need 10km+ weekly to be good)
  if (answers.running !== undefined) {
    if (answers.running === 0) negativePoints += 30;
    else if (answers.running < 5) negativePoints += 25;
    else if (answers.running < 10) negativePoints += 15;
    else if (answers.running < 20) negativePoints += 8;
    totalPoints += 30;
  }

  // Workout (strict - need 5+ hours weekly to be good)
  if (answers.workout !== undefined) {
    if (answers.workout === 0) negativePoints += 35;
    else if (answers.workout < 2) negativePoints += 25;
    else if (answers.workout < 5) negativePoints += 15;
    else if (answers.workout < 8) negativePoints += 8;
    totalPoints += 35;
  }

  // Meditation (strict - need 3+ hours weekly to be good)
  if (answers.meditation !== undefined) {
    if (answers.meditation === 0) negativePoints += 25;
    else if (answers.meditation < 1) negativePoints += 20;
    else if (answers.meditation < 3) negativePoints += 12;
    else if (answers.meditation < 5) negativePoints += 5;
    totalPoints += 25;
  }

  // Reading (strict - need 5+ hours weekly to be good)
  if (answers.reading !== undefined) {
    if (answers.reading === 0) negativePoints += 25;
    else if (answers.reading < 2) negativePoints += 20;
    else if (answers.reading < 5) negativePoints += 12;
    else if (answers.reading < 8) negativePoints += 5;
    totalPoints += 25;
  }

  // Social media (very strict - more than 10 hours weekly is poor)
  if (answers.socialMedia !== undefined) {
    if (answers.socialMedia >= 30) negativePoints += 40;
    else if (answers.socialMedia >= 20) negativePoints += 30;
    else if (answers.socialMedia >= 15) negativePoints += 20;
    else if (answers.socialMedia >= 10) negativePoints += 15;
    else if (answers.socialMedia >= 5) negativePoints += 8;
    totalPoints += 40;
  }

  const percentage = Math.round((negativePoints / totalPoints) * 100);
  
  // Ensure minimum 25% to show meaningful improvement opportunity
  return Math.max(25, percentage);
};

export const resultsPreview = {
  title: "66 Days",
  subtitle: "to build lasting habits and quit doomscrolling",
  benefits: [
    { title: "Boost energy", percentage: "+38%" },
    { title: "Reduce phone usage", percentage: "−60%" },
    { title: "Improve focus", percentage: "+42%" },
    { title: "Reduce fatigue", percentage: "−23%" }
  ],
  researchLinks: [
    {
      title: "Smartphone Addiction & Mental Health",
      url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6214874/"
    },
    {
      title: "Digital Detox Benefits Study", 
      url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7012622/"
    },
    {
      title: "Habit Formation in 66 Days",
      url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3505409/"
    },
    {
      title: "Screen Time & Well-being Research",
      url: "https://www.nature.com/articles/s41562-018-0506-1"
    }
  ]
};
