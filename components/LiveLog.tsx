import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import Colors from '@/constants/Colors';
import { ExerciseLog } from '@/context/WorkoutContext';
import { FontAwesome } from '@expo/vector-icons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface LiveLogProps {
  log: Record<string, ExerciseLog> | undefined;
}

// A single collapsible item for an exercise
const ExerciseLogItem: React.FC<{ exercise: ExerciseLog }> = ({ exercise }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    // This creates a smooth expand/collapse animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.exerciseBlock}>
        <TouchableOpacity onPress={toggleExpand} style={styles.summaryRow}>
            <View>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.setCount}>{exercise.sets.length} {exercise.sets.length === 1 ? 'Set' : 'Sets'}</Text>
            </View>
            <FontAwesome name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.light.subtitle} />
        </TouchableOpacity>

        {isExpanded && (
            <View style={styles.detailsContainer}>
                <View style={styles.logHeader}>
                    <Text style={styles.headerText}>Set</Text>
                    <Text style={styles.headerText}>Weight</Text>
                    <Text style={styles.headerText}>Reps</Text>
                    <Text style={styles.headerText}>RPE</Text>
                </View>
                {exercise.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.logRow}>
                        <Text style={styles.rowText}>{setIndex + 1}</Text>
                        <Text style={styles.rowText}>{set.weight}kg</Text>
                        <Text style={styles.rowText}>{set.reps}</Text>
                        <Text style={styles.rowText}>{set.rpe}</Text>
                    </View>
                ))}
            </View>
        )}
    </View>
  );
};


const LiveLog: React.FC<LiveLogProps> = ({ log }) => {
  const exercises = log ? Object.values(log) : [];

  if (!log || exercises.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No sets logged yet for this session.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Live Session Log</Text>
      {exercises.map((exercise, index) => (
          <ExerciseLogItem key={index} exercise={exercise} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.light.background,
    padding: 20,
  },
  title: {
    color: Colors.light.text,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    color: Colors.light.subtitle,
    fontSize: 18,
    textAlign: 'center',
    marginTop: '50%',
  },
  exerciseBlock: {
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    overflow: 'hidden', // Important for LayoutAnimation
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    color: Colors.light.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  setCount: {
      color: Colors.light.subtitle,
      fontSize: 14,
      marginTop: 4,
  },
  detailsContainer: {
    marginTop: 15,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.secondary,
    marginBottom: 10,
  },
  headerText: {
    color: Colors.light.subtitle,
    fontSize: 16,
    fontWeight: '600',
    width: '25%',
    textAlign: 'center',
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowText: {
    color: Colors.light.text,
    fontSize: 18,
    width: '25%',
    textAlign: 'center',
  },
});

export default LiveLog;
