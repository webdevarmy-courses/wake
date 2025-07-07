Here is your updated `README.md` for **Page 1 (Mindful Page)** along with a **complete visual theme guide** based on the references you shared.

---

```md
# 🧘 Mindful Page — Page 1

The **Mindful Page** is the default landing screen of the app. It acts as the gentle intervention point to break doomscrolling patterns. Every element here is crafted to offer calmness, clarity, and meaningful redirection.

---

## 🎨 Visual Theme Guidelines (Inspired by Provided Design)

### 📐 Layout

- All major elements are **vertically stacked** with breathable margins.
- Use **rounded corners (24–32px)** for all cards and buttons.
- The screen feels like a **magazine poster** — bold, stylized fonts, dynamic contrast between soft colors and dark type.

---

### 🎨 Color Palette

| Usage        | Color         | Hex       |
| ------------ | ------------- | --------- |
| Background 1 | Lemon Chiffon | `#F3FBCB` |
| Background 2 | Lavender Pink | `#F4D8FE` |
| Accent Blue  | Ice Blue      | `#93D5E1` |
| Text Primary | Deep Charcoal | `#121111` |
| XP Sparkle   | Golden Yellow | `#FFE37D` |

- Gradient Ideas:
  - **Lavender → Lemon Chiffon** as background wash.
  - XP Jar: `#93D5E1` with shimmer.

---

### 🖋 Typography

**Primary Font**: [Silver Grown (or similar retro-futuristic condensed typeface)]

- **Headers**: Bold, uppercase, tracking-wide
- **Body**: Light, clean, spaced-out
- **Font Color**: Always use `#121111` or 90% black on pastel backgrounds.

Example usage:
```

ELEVATE YOUR MIND WITH US
"Take a breath. What are you really looking for right now?"

````

---

## 🧠 Page Goal

To gently nudge users away from doomscrolling by offering alternative calming actions and rewarding them with XP, all while making the experience feel visually modern, vibrant, and gamified — not preachy.

---

## 🧱 Components & Layout (JavaScript - Cursor AI)

### 1. 🧘 **Mindful Prompt (Top)**

| Prop     | Value               |
|----------|---------------------|
| Type     | Daily rotating prompt |
| Display  | Centered text (2 lines max) |
| Style    | Semi-bold, uppercase, 120% line-height |
| Example  | "Take a breath. What are you really looking for right now?" |

> Load from `constants/quotes.js` → rotate daily via date mod logic.

---

### 2. ✋ **Catch Me Scrolling Button**

| Attribute     | Details |
|---------------|---------|
| Size          | 180px x 180px circular |
| Placement     | Centered mid-page |
| Animation     | Glow ring and XP sparkle on press |
| Interaction   | On tap:
 - Adds `+1 XP`
 - Triggers haptic feedback
 - Animates XP Jar shine

> Call `addXP(1)` on tap and persist via AsyncStorage.

---

### 3. 🔄 **Replace Scrolling Section (Cards)**

#### 🔧 Scrollable Cards List

| Card | Title               | Icon | Navigation Target         |
|------|---------------------|------|---------------------------|
| 1    | 5-min Breathing     | 🧘   | `/replace/breathing`      |
| 2    | Screen-Free Timer   | 📵   | `/replace/timer`          |
| 3    | Quick Journal Prompt| 🧠   | `/replace/journal`        |
| 4    | Reflect Card        | 📓   | `/replace/reflect`        |

- Horizontal scroll with **snap-to-center** UX
- Card Style:
  - 140px width
  - Rounded corners
  - Gradient backgrounds (`#F3FBCB`, `#F4D8FE`, `#93D5E1`)
  - Bold headers + emoji icon

> Each card opens a full sub-page experience.

---

### 4. 💠 **XP Jar (Bottom Component)**

| Prop     | Value |
|----------|-------|
| Type     | Semi-circle liquid jar animation |
| Visual   | Animated fluid fill + sparkle on XP gain |
| Modal    | On tap:
 - Show XP Rules
 - 30-day XP bar chart
 - Streak info (e.g. "3 days in a row!")

---

## 🧮 Global XP State Setup

Define a **global XP system**.

**In `/utils/xpManager.js`:**

```js
import AsyncStorage from '@react-native-async-storage/async-storage';

let xp = 0;

export const getXP = async () => {
  const stored = await AsyncStorage.getItem('xp');
  xp = stored ? parseInt(stored) : 0;
  return xp;
};

export const addXP = async (amount) => {
  xp += amount;
  await AsyncStorage.setItem('xp', xp.toString());
};

export const resetXP = async () => {
  xp = 0;
  await AsyncStorage.setItem('xp', '0');
};
````

---

## 📁 Suggested File Structure

```
/pages/MindfulPage.js         ← main screen
/pages/replace/breathing.js   ← sub-pages
/pages/replace/timer.js
/pages/replace/journal.js
/pages/replace/reflect.js

/components/MindfulPrompt.js
/components/CatchScrollButton.js
/components/ReplaceScrollCards.js
/components/XPJar.js
/components/XPRulesModal.js

/utils/xpManager.js
/constants/quotes.js
/assets/fonts/SilverGrown.ttf
```

---

## 📱 Motion & Interaction

| Element      | Motion                   |
| ------------ | ------------------------ |
| Catch Me Btn | Glow pulse + XP spark    |
| XP Jar       | Liquid fill + shimmer    |
| Cards        | Snap scroll, fade-in     |
| Modal        | Smooth rise + glass blur |

---

# 📘 Focus Page – Ritual Builder

This file defines the UI and UX design spec for the **Focus Page** of the app, aimed at helping users build mindful, energizing daily rituals while earning XP. This serves as a guide for Cursor AI to implement the structure.

---

## 🔹 1. Header Section

### Title:

```
Build a Focus Ritual
```

### Subtitle:

```
Pick small intentional habits to level up your day
```

### Notes:

- Fixed header
- Calm, inspiring font
- Background can remain translucent or adopt soft pastel

---

## 🔹 2. Goals Section (User-Created Tasks)

### Block Title:

```
Your Focus Goals
```

### Add Task Card:

- A rounded container with plus symbol and text:

  ```
  ➕ Add a Personal Focus Goal
  ```

- Tap → navigates to a form or full screen:

  - Enter goal name
  - Description (optional)
  - XP to assign
  - Frequency (daily/weekly/etc)

---

## 🔹 3. Pre-Built Tasks Section

### Title:

```
Try These Today
```

### General Notes:

- Stack landscape cards vertically with scroll
- Total: 10 pre-built cards

### ✨ Pre-Built Task Card – Layout Spec

( find images at /assets/preBuiltTasks)
| Element | Description |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Image** | Top 40% of card height. Rounded top corners. Illustrated, 9:6 landscape (preferred resolution: 900x600 or 1200x800) |
| **Task Name** | Bold and clean (e.g., "Read for 30 Minutes") |
| **Micro-description** | 1-liner benefit like "Sharpen focus with a mindful read" |
| **Recommended Frequency** | Small pastel pill: "3x/week" or "Daily" |
| **XP Tag** | 💫 "+5 XP" badge in top right corner |
| **Action Button** | CTA: "Do Now" → opens Dedicated Page |

#### Interaction:

- Card has tilt-on-hover animation
- Soft glow on XP badge if completed today

---

## 📄 Dedicated Task Page (After Tapping Card)

### Layout Structure:

1. **Hero Banner**

   - Uses task image
   - Soft backdrop

2. **Task Title** + short description

3. **How to Do This Task** (Tips/steps)
   Example: "Find a quiet spot. Set a 30-minute timer. Read with full attention."

4. **Mark Done** Button

   - ✅ Adds XP
   - Triggers "Well Done" modal

5. **Track Progress Button (Calendar icon)**

   - Top-right of the page, similar to other mindful actions (1-min breathing, etc.)

6. **Log Reflection (Optional)**

   - Small journaling box

---

## 🎨 Visual Styling Guidelines

- **Cards:**

  - Soft-glass container look
  - Slight shadow
  - Subtle lift or scale on press

- **XP Glow:**

  - Mild pulse/glow animation once task completed

- **Spacing:**

  - 24px between sections
  - Allow breathing room for readability

---

## 🔟 Final Pre-Built Task List (with New Names, Categories )

| Name                | Category    | Frequency | Description                             |     |     |
| ------------------- | ----------- | --------- | --------------------------------------- | --- | --- |
| Mindful Cold Shower | High Energy | 3x/week   | Wake up your senses with presence       |     |     |
| Flow Movement       | High Energy | Daily     | Move mindfully with yoga or stretching  |     |     |
| Read & Reflect      | Low Energy  | Daily     | Spend 30 focused minutes reading        |     |     |
| Stillness Break     | Low Energy  | 2x/week   | Sit in silence, let thoughts pass       |     |     |
| Deep Box Breathing  | Low Energy  | Daily     | Practice 4-4-4-4 box breathing          |     |     |
| Soulful Nature Walk | Spiritual   | Weekly    | Recharge in nature with intention       |     |     |
| Sunlight Ritual     | Wellness    | Daily     | Get 10 minutes of morning sunlight      |     |     |
| Mindful Push-ups    | Fitness     | 3x/week   | Strengthen with awareness               |     |     |
| Mini Digital Detox  | Wellness    | 2x/week   | Stay off-screen for 30+ mins            |     |     |
| Learn & Grow        | Cognitive)  | Weekly    | Spend 30 minutes learning something new |     |     |

---

**"Add a Personal Focus Goal" page**:

---

### 📄 Add a Personal Focus Goal Page (Form Layout & UX Spec)

This screen is where users can create their own custom XP-earning focus task to add to the **"Your Focus Goals"** section.

---

#### 🧱 Page Structure:

##### 1. **Header**

- Title: `Create Your Own Focus Goal`
- Subtitle (smaller): `Turn your habits into XP-powered rituals`
- Optional back button (⬅️) to return to main Focus page.

---

##### 2. **Form Fields**

| Field Label     | Type          | Description                                                               |
| --------------- | ------------- | ------------------------------------------------------------------------- |
| **Goal Name**   | Text Input    | Required. 1-line goal title (e.g., "Read 10 Pages")                       |
| **Description** | Multiline     | Optional. Short intention/benefit behind the task (e.g., "Sharpen focus") |
| **Frequency**   | Select Picker | Choose from: `Daily`, `2x/week`, `3x/week`, `Weekly`, `Custom`            |
| **XP Reward**   | Stepper/Input | User chooses XP amount to earn for completing (suggested range: 1–10 XP)  |

✨ _Pro Tip copy (below XP input):_
"Higher XP = bigger challenge! Be realistic and rewarding."

---

##### 3. **Optional Settings (Toggles)**

| Setting               | Type   | Description                                          |
| --------------------- | ------ | ---------------------------------------------------- |
| **Enable Streaks**    | Toggle | Turn on to track daily streaks (like habit chain 🔥) |
| **Reflection Prompt** | Toggle | Adds a journal input after marking complete          |
| **Notifications**     | Toggle | Remind me to do this (later config for time)         |

---

##### 4. **Preview Card (Live Update)**

- Shows a live preview of the card that will appear in the "Focus Goals" grid.
- Includes task name, XP, frequency pill, etc.
- Updates in real time as user fills the form.

---

##### 5. **Save Button**

- CTA: `➕ Add to Focus Goals`
- Disabled until goal name is filled and frequency is selected.
- On tap:

  - Save task to local/app state
  - Redirect back to Focus Page with success animation (or modal)
  - XP bar briefly glows to indicate new opportunity added

---

##### 6. **Design Notes**

- Keep layout vertically scrollable
- Soft beige or pastel background
- Form inside a centered, rounded white container
- Calm illustrations or icons to guide eyes
- Consistent spacing: 20–24px between sections
- Form fields should use soft shadow / neumorphic styling

---

### 🧠 Future-Proofing Notes

- Make this component modular so it can be reused in an "Edit Goal" flow later.
- Optional idea: auto-suggest icons based on title (e.g., typing "Pushups" suggests 🏋️).

---

## 🌱 XP Journey Journal – Vertical Progress Timeline (Redesigned)

## This section defines the full design specification for the **Progress Page** timeline — turning XP tracking into an **emotional, interactive journal** of daily growth.

### 🎯 Objective

Replace the rigid XP "graph" or timeline with a **stacked vertical journey of daily growth**, styled like calm journal entries. This approach creates a stronger emotional connection and encourages ongoing reflection and behavior reinforcement.

---

### 🧱 Layout Structure: "Daily XP Cards"

Each day is its own **soft-glass container block**, stacked vertically with scrolling.

```

┌────────────────────────────────────┐
│ 📆 Wednesday, June 26 │ ← Date Tag (light pastel pill)
│ │
│ 💠 XP Earned: +42 XP │ ← Horizontal XP fill bar / badge
│ │
│ 🌬️ Breathing +5 XP │
│ 📓 Journal +3 XP │ ← Action list (same icons as other pages)
│ 👆 Caught Scrolling +1 XP │
│ 🧘 Cold Shower Task +10 XP │
│ │
│ 🎉 You reached 50 XP today! │ ← Milestone flag
└────────────────────────────────────┘

```

---

### 🖼️ Visual Styling

| Element              | Style                                                                     |
| -------------------- | ------------------------------------------------------------------------- |
| Container Background | Frosted-glass pastel block (white-tinted, soft shadow, blurred bg)        |
| Date Header          | Pill-shaped pastel tag (light lavender, sky blue, or warm beige)          |
| XP Indicator         | Either an XP number badge or a fluid bar that fills from left to right    |
| Activity List        | Icons + text (flat pastel style) with subtle XP tags on the right (+3 XP) |
| Padding/Margin       | Min 24px between blocks, inner padding 16px, rounded corners (xl)         |
| Divider Line         | Faint horizontal squiggle or dash between days                            |
| Scroll               | Natural vertical scroll, gentle snap-to-section behavior                  |

---

### 🎮 Interaction Behavior

- 🔼 **Expand on Tap**: Clicking/tapping a day expands or contracts its card.
- 🪄 **Animated XP Fill**: XP bar animates to fill based on total XP earned that day.
- 🎈 **Milestone Tags**:
  - Show sparkle emoji or badge for first 50, 100 XP days
  - "🔥 3-Day Streak!" pill if user hits 3+ days in a row
- 🧠 **Optional Echo Prompt**: "What helped you stay focused today?" in empty field at bottom (logs into journal system)

---

### 🔧 Toggle Filter

At the top of the section, add:

```

[ Last 7 Days ] [ 21 Days ] [ 66 Days ]

```

- Styled as segmented buttons or tabs
- Default: 7 Days
- If user hasn't used app that long, only show as many days as data exists
- Transitions smoothly on toggle; auto-scrolls to top

---

### 🔗 XP Source Mapping

| Action Source      | Icon | XP Range        |
| ------------------ | ---- | --------------- |
| Catch Me Scrolling | 👆   | +1 XP           |
| 1-min Breathing    | 🌬️   | +5 XP           |
| Screen-Free Timer  | ⏳   | +10 XP          |
| Quick Journal      | 📓   | +3 XP           |
| Reflect Card       | 💭   | +3 XP           |
| Pre-Built Task     | 💪   | +5–15 XP        |
| Custom Focus Goal  | ✅   | User-defined XP |

XP data pulled dynamically from backend log.

---

### 🧠 Refined UX Patterns

| Experience Detail  | Treatment                                                              |
| ------------------ | ---------------------------------------------------------------------- |
| Only one card open | Closing all other days when new one is tapped                          |
| Today's Highlight  | Soft green glow, pulsing badge "Today"                                 |
| Empty day          | Grayed-out container: "No mindful activities tracked this day"         |
| Tap-to-learn link  | If a task is repeatable, offer CTA: "Do this again now"                |
| Calendar harmony   | Dates match other page's journal tracking format (top-right calendars) |

---

### 📐 Placement

- This should be the **topmost module** on the **Progress Page**
- All other visualizations (e.g., streak rings, total XP counters, achievement cards) should follow

---

# 🌟 Floating Navigation Tab Bar – Design & Implementation

This section defines the structure, visuals, interactions, and implementation of the **Floating Navigation Tab Bar** that sits above the screen bottom and hosts the three core app pages: Mindful, Progress, and Focus.

---

## 🔹 Design Specifications

### Placement & Structure

- **Position**: Floating, 30–36px above bottom of screen
- **Width**: 70% of screen width (centered with 15% margins each side)
- **Height**: 68px fixed
- **Container Style**:
  - Fully rounded corners (34px radius for pill shape)
  - Background: soft glassmorphism with BlurView (intensity: 20)
  - Translucent white: `rgba(255, 255, 255, 0.85)` on iOS, `0.95` on Android
  - Shadow: 6px offset, 12px radius, 15% opacity, 8 elevation

---

## 🔹 Tab Configuration

**Only 3 tabs displayed** (Settings accessible via navigation but hidden from tab bar):

| Position | Icon | Label    | Route Name | Navigation Target            |
| -------- | ---- | -------- | ---------- | ---------------------------- |
| Left     | 🌱   | Mindful  | index      | Main XP-gathering screen     |
| Center   | 📈   | Progress | progress   | XP journey and timeline page |
| Right    | 🎯   | Focus    | focus      | Ritual tasks and goals page  |

### Tab Styling

- **Icon**: 24px emoji with text shadow when active
- **Label**: 11px font, 600 weight, 0.3 letter spacing
- **Spacing**: Evenly distributed with `space-evenly` flexbox
- **Touch Area**: Minimum 48x48px for accessibility

---

## 🔹 Animation & Interaction States

### Active Tab Animations

- **Scale**: 1.1x scale-up with spring animation (tension: 150, friction: 8)
- **Elevation**: Rises 4px (`translateY: -4`)
- **Glow Effect**: 56px circular background with ice blue (#93D5E1) at 40% opacity
- **Text Enhancement**:
  - Icon opacity: 1.0 with ice blue text shadow
  - Label: Bold (700 weight) with subtle text shadow

### Inactive Tab States

- **Scale**: 1.0 (normal)
- **Position**: Base level (translateY: 0)
- **Opacity**: Icons at 70%, labels at 60%
- **Colors**: Muted gray tones

### Transition Timing

- **Spring Animation**: 250ms duration for scale and position
- **Glow Animation**: 250ms linear timing for opacity fade
- **Native Driver**: Used for transform animations (performance optimized)

---

## 🔹 Implementation Architecture

### Component Structure

```javascript
FloatingTabBar
├── Container (Absolute positioned)
├── TabBarContainer (Rounded, shadowed)
├── BlurView (Glassmorphism background)
├── TabBarInner (Flex row, space-evenly)
└── TabButton × 3
    ├── Animated.View (Scale + translateY)
    ├── GlowBackground (Animated opacity)
    ├── TabIcon (Emoji with conditional styling)
    └── TabLabel (Text with conditional styling)
```

### Key Features

- **Platform Adaptation**: Different blur intensities and backgrounds for iOS/Android
- **Accessibility**: Full `accessibilityRole`, `accessibilityLabel`, and `accessibilityState`
- **Touch Handling**: Uses `Pressable` for better touch response
- **Animation Management**: Individual animated values per tab for smooth transitions
- **Z-Index**: Set to 1000 to float above all content

---

## 🔹 Integration Points

### Tab Layout Integration

```javascript
// app/(tabs)/_layout.tsx
<Tabs
  tabBar={(props) => <FloatingTabBar {...props} />}
  screenOptions={{
    headerShown: false,
    tabBarButton: HapticTab,
  }}>
```

### Route Configuration

- **Settings Screen**: Hidden via `href: null` but remains navigable
- **Navigation Events**: Proper `tabPress` event handling with `canPreventDefault`
- **State Management**: Integrated with Expo Router's tab state

---

## 🔹 Performance Optimizations

### Native Driver Usage

- Transform animations (scale, translateY) use `useNativeDriver: true`
- Color/opacity animations use native driver where possible
- Smooth 60fps animations on both platforms

### Memory Management

- `useRef` for persistent animated values across renders
- Proper cleanup of animation listeners
- Optimized re-render cycles

---

## 🧠 Accessibility Standards

### WCAG Compliance

- **Touch Targets**: 48x48px minimum (exceeds 44px requirement)
- **Color Contrast**: Maintains 4.5:1 ratio for text/background
- **Focus States**: Clear visual feedback for keyboard navigation
- **Screen Reader**: Descriptive labels and state announcements

### Interaction Patterns

- **Haptic Feedback**: Integrated with existing HapticTab component
- **Visual Feedback**: Immediate response to touch with scale animation
- **State Communication**: Clear active/inactive visual distinction

---

## 🧪 Testing Scenarios

| Test Case            | Expected Behavior                                  |
| -------------------- | -------------------------------------------------- |
| Tab Press            | Smooth navigation with 250ms scale/rise animation  |
| Active State         | Glowing background, raised position, enhanced text |
| Screen Rotation      | Maintains 70% width, proper positioning            |
| Keyboard Navigation  | Focus indicators and accessible state changes      |
| Background Content   | No overlap with main content, proper z-index       |
| Platform Differences | Appropriate blur/transparency per platform         |

---

## 💡 Future Enhancements

### Planned Features

- **Scroll Response**: Auto-hide on scroll down, show on scroll up
- **Haptic Patterns**: Custom vibration patterns per tab
- **Micro-interactions**: Subtle particle effects or breathing animation
- **Theme Adaptation**: Dynamic color adaptation based on app theme

### Performance Monitoring

- Animation frame rate tracking
- Touch response time measurement
- Memory usage optimization
- Battery impact assessment

---

This floating tab bar creates an intuitive, accessible, and visually appealing navigation experience that enhances the app's mindful, calming aesthetic while maintaining high performance standards.

---

# 🔔 Notifications Page – README Spec for Cursor

This spec outlines the complete design and behavior for the Notifications Page in our app. This should be implemented using **Expo Notifications**, supporting development and production modes.

---

### ✅ Add Custom Reminder – README Spec for Cursor (iOS-only)

This section describes the implementation of the **"Add Custom Reminder"** feature on the Notifications Page. The user can tap the ➕ button to create their own personalized reminder notification. This should be implemented only for **iOS using Expo Notifications**.

---

## 📲 Entry Point

- **Source**: Bell icon in top-right of Mindful Page → Notifications Page
- On the Notifications Page →
  **➕ Add Custom Reminder** button opens a full-screen modal or page

---

## 🧩 Layout – Add Custom Reminder Screen

Use a clean, soft card layout with ample padding. Modal should have iOS-style animation/transition.

### Form Fields:

| Field                | Type                         | Notes                                               |
| -------------------- | ---------------------------- | --------------------------------------------------- |
| Notification Message | Text input                   | Placeholder: _e.g. "Stay grounded."_                |
| Frequency            | Segmented selector or picker | Options: `Once`, `Daily`, `Weekly`, `Specific Days` |
| Time of Day          | Time picker                  | Preferably native iOS `UIDatePicker` style          |
| Emoji / Icon         | Horizontal scroll pills      | Choices: `🌱 🔔 ☀️ 💫` (optional selection)         |

---

## 🎯 Behavior Logic

1. **On Submit**:

   - Validate required fields (message + time).
   - Save all data to local storage (AsyncStorage).
   - Schedule the notification using:

     ```js
     Notifications.scheduleNotificationAsync();
     ```

   - Ensure notifications are properly configured for **iOS only**.

2. **Confirmation**:

   - Show a toast/alert saying:

     > _"Reminder saved. We'll nudge you at the right time."_

3. **Reminder Object Example (for local storage)**:

```js
{
  id: 'uuid',
  message: 'Stay grounded.',
  frequency: 'Daily',
  time: '08:00',
  emoji: '🌱'
}
```

---

## 💡 iOS-Only Notes

- Use `expo-notifications` with iOS scheduling APIs.
- Handle cases where notification permissions are not granted:
- Show alert modal with button: _"Go to Settings"_.

---

## 🖌️ Design

- iOS-like modal appearance with rounded corners and padding.
- Soft shadows, pastel backgrounds.
- Use large title: **“Create Your Reminder”**
- Segments and inputs should follow iOS native visual styles.

---

## ✅ Completion Criteria

- User can open the modal.
- Fill and submit the form.
- Reminder is saved and scheduled.
- UX feedback is shown on success.

---

### ✅ Notification Frequency Management

This section describes the implementation of the **Notification Frequency Management** block on the Notifications Page. This block should appear **above the “Your Custom Reminders” section** and follow similar layout, styling, and data handling logic already used for the Custom Reminders section.

---

## 🧭 Placement

- **Position**: Place this section **above** the “Your Custom Reminders” block.
- Keep both sections visually distinct but part of the same page layout.

---

## 📦 Section Details

- **Section Label:**
  `🔔 Notify me every:`

- **UI Component:**
  Use a **horizontal pill-style selector** (preferred) or dropdown if needed:

  ```
  [15 min] [30 min] [45 min] (default) [1 hr] [2 hrs]
  ```

- **Helper Note below selector:**

  > _"You’ll receive a gentle nudge if you’ve been mindlessly scrolling."_

- **UI Design Notes:**

  - Pills should be rounded, soft-colored (e.g. glassy pastel).
  - Selected pill has subtle glow or filled background.
  - Slight elevation/shadow on press.
  - Add smooth animation on selection.

---

## ⚙️ Behavior Logic

- Tapping on a new frequency:

  - Immediately cancels and resets scheduled notifications using `expo-notifications`.
  - Update the user's notification frequency in persistent storage (`AsyncStorage`).
  - Cursor should re-use the same local state/store approach as used in “Your Custom Reminders" making sure it does not affect the notifications in “Your Custom Reminders" section.

---

## 📝 Data Sample

```js
// Store selected frequency in local app storage
{
  notificationFrequency: "45 min";
}
```

---

## ✅ Completion Criteria

- Section appears above "Your Custom Reminders".
- Pills are styled, tappable, and reflect selected value.
- Helper text is visible and aligned with the rest of the UI.
- Frequency is saved to persistent storage.
- Notifications reschedule correctly when selection changes.

---

## ✅ Feature: **Global Notifications Toggle**

This toggle controls **both**:

- "Notify Me Every" (nudge frequency)
- "Your Custom Reminders"

---

### 📄 README-style Documentation for the Feature

**📌 Feature Name:** Global Notifications Toggle
**📍 Location:** Notifications screen (top or bottom, based on state)

---

### 🧩 Purpose

Let users globally enable or disable all mindful notifications without deleting or reconfiguring existing preferences.

---

### 🖼️ Design Instructions

**Toggle States:**

#### 1. **When notifications are disabled:**

- 🔘 Show toggle **at the top** of the Notifications screen (just below the page title).
- Show text:

  > 🔕 **Notifications are Off**
  > Enable reminders when you're ready for mindful nudges.

- Toggle label: `Enable Notifications`

#### 2. **When notifications are enabled:**

- 🔘 Show toggle **at the bottom** of the Notifications screen.
- Text (above the toggle):

  > ✅ **Notifications are On**
  > You’ll receive nudges and custom reminders as configured.

- Toggle label: `Disable Notifications`

**📱 Styling Consistency:**

- Use the same toggle switch style as in the rest of your app (rounded, animated, native feel).
- Add a soft shadow box or rounded background to make the toggle section feel deliberate (like other pages’ cards).
- Use emoji and subtle accent colors for each state.

---

### ⚙️ Logic Instructions

1. Use a boolean flag in local storage:

   ```ts
   notificationsEnabled = true | false;
   ```

2. If `notificationsEnabled === false`, hide:

   - "Notify Me Every" section
   - "Your Custom Reminders" section (including Add button)

3. When toggled:

   - If turning **off**, cancel all scheduled Expo notifications (`Notifications.cancelAllScheduledNotificationsAsync()`).
   - If turning **on**, reschedule according to:

     - Frequency selected
     - All saved custom reminders

4. Maintain layout:

   - Animate toggle’s position change (top <-> bottom)
   - Show/hide other sections with a fade or slide-in animation

---

# ✨ Notifications Page Redesign – Visual Only (No Logic Changes)

This section outlines visual and UX improvements to the **Notifications Page**. Maintain the existing notification logic and user behavior, but **enhance clarity, warmth, and emotional connection** in design.

---

## 🔹 1. Rebrand Section Heading

**Current Label:** “Notify Me Every”

**New Label:** `Mindful Nudges`

**Subtitle (smaller font, muted):**

> “Gentle reminders to pause, breathe, and check in with yourself.”

- Typography: Use semi-bold title font with rounded letter spacing
- Color: Soft charcoal for title, faded pastel blue or lavender for subtitle

---

## 🔹 2. Add Explainer Mini-Card (Above Frequency Selector)

### Text:

```plaintext
🧘 Why These Reminders?
We’ll gently nudge you to pause and take a mindful breath — especially when you might be scrolling without realizing.
```

### Style:

- Rounded corners (16px radius)
- Background: pastel beige, soft lavender, or white with blur (glassmorphism)
- Font size: Medium (readable)
- Emoji anchored left
- Animation: Fade + gentle scale-in on mount

**Optional Expansion Behavior:**

- Tapping the card could expand into a small visual (optional, future-ready)

---

## 🔹 3. Chip Selector Upgrade – Scrollable Frequency Selector

### Changes to Selector UI:

- Convert current dropdown or pill row into a **horizontal chip carousel**
- Each chip includes:

| Time   | Sub-Label        |
| ------ | ---------------- |
| 15 min | “Very Often”     |
| 30 min | “Often”          |
| 45 min | “Balanced”       |
| 1 hr   | “Gentle Cadence” |
| 2 hrs  | “Rarely”         |

### Style Enhancements:

- Chips have a soft shadow and glowing border when selected
- Light bounce or pop animation on tap
- Selected pill animates with subtle pulse (XP-style glow)

---

## 🔹 4. Add Top Hero Visual / Header Graphic

### Image Path:

`/assets/preBuiltTasks/notification-page.png`

### Placement:

- At the very top of Notifications Page, **above "Mindful Nudges"**
- Use a rounded rectangular container (width: 90% of screen)
- Add soft drop shadow
- Add margin below (at least 24px)

---

## 🧘 Summary of Spacing & Flow

- Start with hero image
- Then show “Mindful Nudges” title and subtitle
- Add explainer card next
- Add horizontal chip carousel
- Add any toggles or control features
- Ensure a **clean breathing layout** with:

  - Minimum 24px vertical space between blocks
  - Avoid color stacking — use whitespace or soft dividers

---

## 🚫 DO NOT:

- Change any logic
- Alter how notifications are scheduled or stored
- Affect the existing toggle behavior for enabling/disabling reminders

```

```

😴 Sleep Mode — Feature Specification for Notifications Page
🧠 Purpose:
To allow users to set a sleep window (Start Time → End Time) during which no notifications will be delivered.

✅ Design & UX:
📍 Position:
Place the Sleep Mode section below the "Mindful Nudges" (Notify Me Every) section and above any toggle or footer.

🛏️ Section Title:
“Sleep Mode”

Subtitle: “Pause notifications during your rest hours.”

⏰ UI Elements:
Label: Start Time
→ iOS-style time picker (or 12hr/24hr dropdown selector)

Label: End Time
→ Same time picker

Toggle Switch:
🛏 Enable Sleep Mode

🌙 Visual Design:
Rounded glassy container with soft pastel background (beige / lavender fade)

Icon suggestion: 🛌 or 🌙 beside title

Light sleep-wave divider between this and other sections

💡 Behavior Logic:
If Sleep Mode is enabled, then:

Before sending any notification, check:

js
const now = new Date();
const sleepStart = new Date(); // set to selected start hour
const sleepEnd = new Date(); // set to selected end hour

If current time falls between those, suppress notification.

Persist sleep start/end and toggle status using AsyncStorage.

Optional: On sleep time overlap (e.g., 10 PM to 7 AM across midnight), handle wrap-around logic properly.
