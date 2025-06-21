import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path, G } from 'react-native-svg';
import Colors from '@/constants/Colors';
import { MUSCLE_GROUPS } from '@/constants/MuscleGroups';
import { ExerciseLog } from '@/context/WorkoutContext';

interface HeatmapProps {
  exercises: ExerciseLog[];
}

// A more detailed, anatomically-inspired SVG body outline
const BodyOutline = () => (
    <Svg height="320" width="160" viewBox="0 0 160 320">
        <G stroke={Colors.light.secondary} strokeWidth="1.5" fill="none">
            {/* Head */}
            <Path d="M80 40 a 20 20 0 1 0 0.1 0 Z" />
            {/* Torso */}
            <Path d="M80 60 v 80" />
            <Path d="M60 65 h 40" />
            <Path d="M55 65 q 25 -10 50 0" />
            <Path d="M50 140 h 60" />
            {/* Arms */}
            <Path d="M60 65 l -25 50 l -5 50" />
            <Path d="M100 65 l 25 50 l 5 50" />
            {/* Legs */}
            <Path d="M65 140 l -10 80 l 0 70" />
            <Path d="M95 140 l 10 80 l 0 70" />
        </G>
    </Svg>
);

// Highlights a specific muscle with a red glow based on intensity
const MuscleHighlight = ({ muscle, intensity }) => {
    // More detailed SVG paths for each muscle group
    const musclePaths: Record<string, string> = {
        chest: "M 60,70 C 60,90 80,95 80,95 C 80,95 100,90 100,70 L 90,70 C 90,80 80,85 80,85 C 80,85 70,80 70,70 Z",
        back: "M 70,65 L 70,120 M 90,65 L 90,120", // Simplified trapezoid
        shoulders: "M 55,65 a 15 15 0 1 1 0.1 0 Z M 105,65 a 15 15 0 1 0 -0.1 0 Z",
        biceps: "M 35,115 a 10 10 0 1 0 0.1 0 Z M 125,115 a 10 10 0 1 0 -0.1 0 Z",
        triceps: "M 30,125 a 10 10 0 1 0 0.1 0 Z M 130,125 a 10 10 0 1 0 -0.1 0 Z",
        quads: "M 55,140 L 55,220 L 75,220 L 75,140 Z M 85,140 L 85,220 L 105,220 L 105,140 Z",
        hamstrings: "M 55,220 L 55,280 L 75,280 L 75,220 Z M 85,220 L 85,280 L 105,280 L 105,220 Z",
        glutes: "M 65,130 C 60,150 80,155 80,155 C 80,155 100,150 95,130 Z",
        calves: "M 55,290 a 10 10 0 1 0 0.1 0 Z M 105,290 a 10 10 0 1 0 -0.1 0 Z",
    };

    if (!musclePaths[muscle] || intensity === 0) return null;
    
    // Intensity Algorithm: Opacity scales with workout volume
    const opacity = Math.min(0.15 + (intensity / 400), 0.9); 

    return <Path d={musclePaths[muscle]} fill={Colors.light.primary} fillOpacity={opacity} />;
}


const WorkoutHeatmap: React.FC<HeatmapProps> = ({ exercises }) => {
  // Calculates the total work volume for each muscle group
  const intensityScores = exercises.reduce((acc, exercise) => {
    const muscle = MUSCLE_GROUPS[exercise.name];
    if (muscle) {
      // Intensity = Sum of (Reps * RPE) for every set
      const totalVolume = exercise.sets.reduce((sum, set) => sum + (set.reps * set.rpe), 0);
      acc[muscle] = (acc[muscle] || 0) + totalVolume;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Muscle Heatmap</Text>
      <View style={styles.heatmapContainer}>
        <BodyOutline />
        <View style={StyleSheet.absoluteFill}>
            {Object.entries(intensityScores).map(([muscle, intensity]) => (
                <MuscleHighlight key={muscle} muscle={muscle} intensity={intensity} />
            ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    paddingVertical: 20,
    marginTop: 20,
  },
  title: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  heatmapContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 320, // Set fixed height for consistency
  }
});

export default WorkoutHeatmap;
