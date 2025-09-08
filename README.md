

# Onboarding Instructions for Wake Scroll App

This document contains detailed step-by-step specifications to build the next onboarding pages for the **Wake Scroll app**.
Follow these instructions **exactly** when creating the components.

---

## General Guidelines

* **Framework**: Use `expo-router` for navigation.
* **Layout**:

  * Wrap screens with `SafeAreaView`.
  * Use `ScrollView` if vertical content exceeds screen height.
  * Keep background theme consistent with lavender → pale yellow gradient.
* **Typography**:

  * Headlines: Serif font, bold, large size.
  * Subtext and options: Sans-serif, medium size.
* **Buttons**:

  * Lavender background, bold white text, rounded corners.
  * Full width with padding.
* **Navigation**:

  * Forward navigation is **automatic** after option selection.
  * Provide a **Back button** (chevron icon) on question pages to go to previous step.

---

## Progress Bar

* Display at the **top** of each question page.
* Style: a thin line filled progressively.
* Should not display numbers, only a subtle brightness/fill effect.
* Example:

  * Grey background line.
  * Animated lavender foreground line showing completion percentage.

---

## Question Pages

Each question is **one page**.
Once the user taps an option, automatically navigate to the next question (no Continue button).

### Question 1

**Text:** "How old are you?"
**Options:**

1. 13 to 17
2. 18 to 24
3. 25 to 34
4. 35 to 44
5. 45 to 54
6. 55 or above

### Question 2

**Text:** "What’s your gender?"
**Options:**

1. Male
2. Female
3. Other
4. Prefer not to answer

### Question 3

**Text:** "How would you describe your current life?"
**Options:**

1. I'm satisfied with my life now
2. I'm alright and want to self-improve
3. I'm doing okay, not good or bad
4. I’m often sad and rarely happy
5. I’m at the lowest and need help

### Question 4

**Text:** "What is the biggest reason you want to reset your life?"
**Options:**

1. Lack motivation and discipline
2. Improve my study and career
3. Quit doomscrolling and improve life
4. Build muscle and get fit
5. Overcome major life setbacks
6. Quit porn addictions

---

## Progress Glimpse Page

* **Layout**:

  * A thick rounded box in the center.
  * Inside, show a **progress tracking preview** with placeholder graphics.
* **Text above box:** "Your progress will be tracked here."
* **Below box:**

  ```
  The average person wastes 2 hours 31 minutes daily on their phone.  
  With Wake Scroll, users report up to 345% improvements in focus, energy, and well-being.  
  ```
* **Button:** Continue → goes to next question.

---

## Additional Questions

### Question 5

**Text:** "When was the last time you were proud of yourself?"
**Options:**

1. Just today
2. Few days ago
3. Few weeks ago
4. Few months ago
5. Too long, I can’t remember

### Question 6

**Text:** "How long do you use your phone daily?"
**UI Element:**

* Modern **slider** or **circular dial** selector.
* Range: 1 hour → 12+ hours.
* Selected value shown dynamically.

### Question 7

**Text:** "How much is 1 hour of your time worth?"
**UI Element:**

* Scrollable number selector.
* Range: \$10 → \$100+.

### Question 8

**Text:** "What’s your long-term goal in life?"
**Options:**

* Cursor should generate **4-6 life goals** aligned with the anti-doomscrolling theme, e.g.:

  1. Build better daily habits
  2. Improve focus and productivity
  3. Strengthen relationships and social life
  4. Grow physically and mentally stronger
  5. Gain financial independence

---

## Motivational Page

* **Top text:** "I’m proud of you for wanting to make changes."
* **Center:** Large 🔥 fire emoji with glow animation.
* **Below:** Text: "Let’s take control of your life."
* **Button:** Continue → goes to result preview.

---

## Result Preview Page

* **Top:** Wake Scroll Logo.
* **Headline:**

  ```
  66 Days  
  to build lasting habits and quit doomscrolling
  ```
* **Four small boxes:** Show benefits (generate realistic percentages). Examples:

  1. Boost energy +38%
  2. Reduce phone usage −60%
  3. Improve focus +42%
  4. Reduce fatigue −23%
* **Below:** Box titled “Scientific Research” with external links (example placeholders):

  * [https://www.sciencedirect.com/science/article/pii/S0747563220303051](https://www.sciencedirect.com/science/article/pii/S0747563220303051)
  * [https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8600169/](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8600169/)
* **Button:** Continue → leads to main app experience.

---

# Wake Scroll – Onboarding Flow (Next Pages Instructions)

This document defines how to implement the **next set of onboarding pages (after the existing ones)**. Cursor should follow this precisely.

---

## 1. Page: "Get My Program"

* **Background:** Same theme as earlier onboarding pages (soft gradients, calming, minimal).
* **UI Elements:**

  * A **centered button**: `"Get my Program"`
* **Behavior:**

  * On tap, navigate to the next onboarding question set.

---

## 2. More Questions Pages (Lifestyle Tracking)

We now ask **habit-related questions**.
Each question should follow these rules:

* **Progress bar** at the top (styled same as before).
* **Question text** in large bold font.
* **Answer input** depends on the question type (time picker, number selector, slider, etc.).
* **No continue button** → move immediately to next page once the answer is selected.
* **Back button** in top-left to go back to previous question.

### Questions to Implement:

1. **What time do you wake up right now?**

   * Input: iOS-style **time picker** (hours + minutes).

2. **How much water do you drink a day?**

   * Input: **number selector** in liters (0L–10L).

3. **How much do you usually run in a week?**

   * Input: **slider** (0 km – 100 km).

4. **How many hours do you usually work out in a week?**

   * Input: **number selector** (0–20 hours).

5. **How much time do you spend meditating in a week?**

   * Input: **slider** (0–20 hours).

6. **How much time do you spend reading books in a week?**

   * Input: **slider** (0–20 hours).

7. **How much time do you spend on social media in a week?**

   * Input: **slider** (0–80 hours).

---

## 3. Page: "Analyzing Your Habits"

* **Background:** Same theme, but darker overlay for suspense.
* **UI Elements:**

  * Animated loader (spinning shapes, waves, or breathing dots).
  * Text: `"Analyzing your habits..."`
* **Behavior:**

  * Wait **4 seconds**.
  * Then replace loader with result text:

    * Example:
      `"Based on your data, you showed 18% more signs of poor lifestyle and discipline than the average 18–24 year old."`
    * The **percentage must be dynamic** (calculated from answers).
    * Show **percentage in red** to indicate warning/danger.
  * Sympathy text below:
    `"It's normal. People in your age group often face harder challenges."`
  * Button: `"See lifestyle rating"` → next page.

---

## 4. Page: "Your Wake Scroll Rating"

* **Headline:** `"Your Wake Scroll Rating"`
* **Description:** `"Based on your answers, this is your current rating, reflecting your lifestyle and habits now."`
* **UI Elements:**

  * Display **rating boxes** (styled as cards with soft borders).
  * Each box shows **category + score**.
  * Example categories (keep aligned with doomscrolling theme):

    * Overall: 44
    * Wisdom: 40
    * Strength: 40
    * Focus: 45
    * Confidence: 50
    * Discipline: 46
  * **Numbers must be dynamic**, based on answers.
* **Button:** `"See potential rating"`

---

## 5. Page: "Your Potential Rating"

* **Headline:** `"Your Potential Rating"`
* **Background:** Bright + hopeful (gradient with green accents).
* **Text:** Motivational, e.g.
  `"This is where you could be in 66 days with Wake Scroll."`
* **UI Elements:**

  * Rating boxes similar to the last page, but in **green**, with higher values than current rating.
  * Example:

    * Overall: 78
    * Wisdom: 72
    * Strength: 70
    * Focus: 85
    * Confidence: 80
    * Discipline: 82
* **Button:** `"See how I will improve"` → goes to next onboarding flow page.

---

## Technical Notes for Cursor

1. Keep **page navigation sequential** (one page → next page).
2. Store all questions, answer options, and scoring logic in a separate file (`questions.js` or JSON).
3. Ensure **dynamic calculation** of percentages and ratings based on user answers.
4. Keep **UI animations smooth and subtle** (fade in/out between pages, sliding transitions).
5. Buttons: large, rounded, consistent with earlier onboarding theme.

--
# Onboarding Flow – Extended Instructions

This section describes the **post-Potential Rating onboarding pages** for the **Wake Scroll** app. Cursor must follow these instructions exactly to implement the following screens.

---

## Page 1 – Core Features Overview

**Purpose:** Show users the app’s **8 core features** so they understand the value proposition.

**Layout:**

* **Title/Header (centered, bold):**
  “What You Unlock with Wake Scroll”
* **Feature Boxes (grid layout, 2 columns):**
  Each box has:

  * An emoji or icon at the top
  * Feature title (bold)
  * Short description (1 line max)

**Features to show (pull from actual app functionality):**

1. 🔔 **Mindful Notifications** – Gentle nudges to stop doomscrolling.
2. 📵 **Anti-Doomscrolling Timer** – Smart timers to control usage.
3. 📊 **Progress Tracking** – See how your habits change over time.
4. 🌱 **Prebuilt Growth Tasks** – Habits like journaling & detox.
5. 😊 **Mood & Reflection Logs** – Track your feelings daily.
6. 🧘 **Mindful Exercises** – Breathing, calming focus drills.
7. 🗓️ **Calendar Heatmaps** – Visualize streaks and activity.
8. 💥 **Streak XP System** – Build consistency, make growth addictive.

**Continue Button:**

* Sticky at the bottom.
* Label: “Continue”
* Navigates to next onboarding page.

---

## Page 2 – Growth Web (Radar Chart Style)

**Purpose:** Show **projected growth across key lifestyle categories** over different weeks.

**Layout:**

* **Title/Header:**
  “Your Growth Journey”
* **Radar Chart / Web Visualization:**

  * Axes: **Overall, Wisdom, Discipline, Confidence, Strength, Focus**
  * Page shows **Week 1** baseline growth.
* **Interaction:**

  * On pressing **Continue**, animation should expand to **Week 5**, then **Week 10** (stronger growth in all areas).
  * Use smooth morphing animation between weeks.

**Continue Button:**

* Bottom sticky.
* Label: “Continue”
* Cycles through weeks → Week 1 → Week 5 → Week 10 → next page.

---

## Page 3 – Time Awareness Page

**Purpose:** Show users how much of the year has already passed dynamically.

**Layout:**

* **Dynamic Text (centered):**

  * “\${currentYear} is already \${percentage}% gone.”
  * Calculate percentage = `(daysElapsed / totalDays) * 100`.
* **Follow-up Text:**

  * “Here’s how Wake Scroll will help you make \${currentYear} your best year ever.”
* **Animation:**

  * Use a clock/calendar-like animation to reinforce the concept of time slipping away.

**Continue Button:**

* Label: “Continue”
* Takes user to the next onboarding page.

---

## Page 4 – Letter from the Future

**Purpose:** Create emotional connection & motivation.

**Layout:**

* **Header:**
  “A Letter From Your Future Self”
* **Box with Letter:** (styled card with soft background)
  Sample text (replace with actual paywall-like copy, dynamic tone):

  > “I’m proud of you. A few weeks ago, you decided to stop doomscrolling and reset your life. Now, I feel more focused, happier, and in control. This was the moment it all changed.”
* **Footer:**

  * Subtle animated glow / sparkle effect.

**Continue Button:**

* Label: “Continue”
* Navigates to next onboarding page (Paywall or main app depending on flow).

---

## General Notes

* **Consistency:** Follow the **design system** of earlier onboarding pages (fonts, backgrounds, button style, progress indicators).
* **Animations:** Keep them **subtle and meaningful**, not distracting.
* **Transitions:** Smooth slide/fade transitions between pages.
* **Progress Indicator:** Continue the same top progress bar style across these pages.

---