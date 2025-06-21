import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { useWorkoutHistory } from '@/context/WorkoutContext';
import { router } from 'expo-router';

export default function ActivitiesScreen() {
  const { history } = useWorkoutHistory();

  if (history.length === 0) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>No Activity Yet</Text>
            <Text style={styles.subtitle}>Complete a workout to see your history.</Text>
        </View>
    );
  }

  const handlePressWorkout = (workoutData) => {
    // Navigate to the recap screen to show details
    router.push({ 
        pathname: '/recap', 
        params: { 
            log: JSON.stringify(workoutData.exercises),
            totalTime: workoutData.totalTime
        } 
    });
  }

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePressWorkout(item)}>
        <Text style={styles.cardDate}>{item.date}</Text>
        <Text style={styles.cardTitle}>{item.exercises.length} Exercises</Text>
        <Text style={styles.cardSubtitle}>Tap to see recap & heatmap</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={[...history].reverse()} // Show most recent workouts first
        renderItem={renderWorkoutItem}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: '50%',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.subtitle,
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
      backgroundColor: Colors.light.card,
      padding: 20,
      borderRadius: 10,
      marginBottom: 15,
  },
  cardDate: {
      color: Colors.light.subtitle,
      fontSize: 14,
      marginBottom: 5,
  },
  cardTitle: {
      color: Colors.light.text,
      fontSize: 20,
      fontWeight: 'bold',
  },
  cardSubtitle: {
      color: Colors.light.primary,
      fontSize: 14,
      marginTop: 5,
  }
});
