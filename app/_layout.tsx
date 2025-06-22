import { Stack } from 'expo-router';
import React from 'react';
import { WorkoutProvider } from '@/context/WorkoutContext';

export default function RootLayout() {
  return (
    <WorkoutProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="start-workout" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="recap" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </WorkoutProvider>
  );
}
