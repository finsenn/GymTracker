import { Stack } from 'expo-router';
import React from 'react';
import { WorkoutProvider } from '@/context/WorkoutContext'; // Import the provider

export default function RootLayout() {
  return (
    // By wrapping the entire Stack here, all screens, including modals,
    // can access the workout history. This fixes the crash.
    <WorkoutProvider>
      <Stack>
        {/* Main app with tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Modal for starting a workout */}
        <Stack.Screen 
          name="start-workout" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
          }} 
        />

        {/* Modal for the workout recap */}
        <Stack.Screen
          name="recap"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </WorkoutProvider>
  );
}
