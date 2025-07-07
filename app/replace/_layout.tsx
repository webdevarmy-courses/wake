import { Stack } from 'expo-router';
import React from 'react';

export default function ReplaceLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="breathing"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="timer"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="journal"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reflect"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 