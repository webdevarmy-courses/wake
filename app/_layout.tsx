import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeNotifications } from '@/utils/notificationManager';

// Conditional import for react-native-reanimated to prevent Expo Go crashes
try {
  require('react-native-reanimated');
} catch (e) {
  console.warn('react-native-reanimated not available in Expo Go. Animations may not work properly.');
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const initApp = async () => {
      const notificationsEnabled = await initializeNotifications();
      if (notificationsEnabled) {
        // We only initialize permissions here.  Scroll-reminder scheduling now
        // happens exclusively when the user explicitly chooses an interval in
        // the Notifications screen (via setScrollReminderFrequency).  This
        // prevents the timer from being reset every time the app launches.
        // No additional action needed on app start.
      }
    };
    initApp();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="TaskDetail" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }} 
        />
        <Stack.Screen 
          name="CreateFocusGoal" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }} 
        />
        <Stack.Screen 
          name="notifications" 
          options={{ 
            presentation: 'card',
            animation: 'slide_from_right'
          }} 
        />
        <Stack.Screen 
          name="replace" 
          options={{ 
            presentation: 'card',
            animation: 'slide_from_right'
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
