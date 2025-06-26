import Colors from '@/constants/Colors';
import { ExerciseLog, useWorkoutHistory, Workout } from '@/context/WorkoutContext'; // Using the correct hook
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Reusable component for showing sets within a workout card
const ExerciseDetailItem: React.FC<{ exercise: ExerciseLog }> = ({ exercise }) => {
    // This component remains the same functionally but will look better with the new styles.
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.exerciseLog}>
            <TouchableOpacity onPress={toggleExpand} style={styles.exerciseSummaryRow}>
                <Text style={styles.exerciseName} numberOfLines={1}>{exercise.name}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.exerciseSetCount}>{exercise.sets.length} sets</Text>
                    <FontAwesome name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.light.subtitle} style={{marginLeft: 10}}/>
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.setsContainer}>
                    {exercise.sets.map((set, setIndex) => (
                        <View key={setIndex} style={styles.logRow}>
                            <Text style={styles.rowText}><Text style={styles.rowLabel}>Set {setIndex + 1}:</Text> {set.weight}kg</Text>
                            <Text style={styles.rowText}>{set.reps} reps</Text>
                            <Text style={styles.rowText}>RPE {set.rpe}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    )
}

// Reusable component for each workout card in the history list
const WorkoutHistoryItem: React.FC<{ item: Workout }> = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const title = item.title || 'Untitled Workout';

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={toggleExpand} style={styles.cardHeader}>
                <View>
                    <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                    <Text style={styles.cardTitle}>{title}</Text>
                </View>
                <FontAwesome name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.light.subtitle} />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.detailsContainer}>
                    {/* The WorkoutHeatmap component has been removed */}
                    {item.exercises.map((exercise, index) => (
                       <ExerciseDetailItem key={index} exercise={exercise} />
                    ))}
                </View>
            )}
        </View>
    );
};


// Main Activities Screen Component
export default function ActivitiesScreen() {
  const { history } = useWorkoutHistory();
  const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);

  useEffect(() => {
    const loadGoal = async () => {
      const storedGoal = await AsyncStorage.getItem('weeklyWorkoutGoal');
      if (storedGoal) setWeeklyGoal(parseInt(storedGoal, 10));
    };
    loadGoal();
  }, []);

  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const count = history.filter(workout => new Date(workout.date) >= startOfWeek).length;
    setWorkoutsThisWeek(count);
  }, [history]);

  const handleSetGoal = async (goal: number) => {
    await AsyncStorage.setItem('weeklyWorkoutGoal', goal.toString());
    setWeeklyGoal(goal);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const handleEditGoal = async () => {
    await AsyncStorage.removeItem('weeklyWorkoutGoal');
    setWeeklyGoal(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  
  const progress = weeklyGoal ? (workoutsThisWeek / weeklyGoal) * 100 : 0;

  const renderHeader = () => {
    if (weeklyGoal === null) {
        return (
            <View style={styles.commitmentContainer}>
                <View style={styles.commitmentCard}>
                    <Text style={styles.commitmentTitle}>Set Your Weekly Goal</Text>
                    <Text style={styles.commitmentSubtitle}>How many times will you train this week?</Text>
                    <View style={styles.goalButtonsRow}>
                        {[3, 4, 5, 6].map(num => (
                            <TouchableOpacity key={num} style={styles.goalButton} onPress={() => handleSetGoal(num)}>
                                <Text style={styles.goalButtonText}>{num}x</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        )
    }
    return (
        <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Weekly Progress</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.progressFraction}>{workoutsThisWeek} / {weeklyGoal}</Text>
                    <TouchableOpacity onPress={handleEditGoal} style={{marginLeft: 15}}>
                        <FontAwesome name="pencil" size={18} color={Colors.light.subtitle} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
        </View>
    );
  }

  return (
    <View style={styles.container}>
        <FlatList
            data={history}
            renderItem={({ item }) => <WorkoutHistoryItem item={item} />}
            keyExtractor={(item, index) => `${item.date}-${index}`}
            contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 10 }}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={() => (
                <View style={styles.emptyListContainer}>
                    <FontAwesome name="history" size={60} color={Colors.light.secondary} />
                    <Text style={styles.emptyTitle}>No Activity Yet</Text>
                    <Text style={styles.emptySubtitle}>Finish a workout to see it here.</Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/start-workout')}>
                        <Text style={styles.emptyButtonText}>Start First Workout</Text>
                    </TouchableOpacity>
                </View>
            )}
        />
    </View>
  );
}

// --- NEW, REFRESHED STYLES ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.light.background 
  },
  // Goal setting styles
  commitmentContainer: { 
    padding: 20, 
    marginBottom: 10,
  },
  commitmentCard: { 
    backgroundColor: Colors.light.card, 
    padding: 25, 
    borderRadius: 15, 
    width: '100%', 
    alignItems: 'center' 
  },
  commitmentTitle: { 
    color: Colors.light.text, 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  commitmentSubtitle: { 
    color: Colors.light.subtitle, 
    fontSize: 15, 
    marginTop: 8, 
    marginBottom: 25, 
    textAlign: 'center' 
  },
  goalButtonsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%' 
  },
  goalButton: { 
    backgroundColor: Colors.light.secondary, 
    width: 55, height: 55, 
    borderRadius: 27.5, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  goalButtonText: { 
    color: Colors.light.text, 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  // Progress bar styles
  progressSection: { 
    padding: 20, 
  },
  progressHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  progressTitle: { 
    color: Colors.light.text, 
    fontSize: 18, 
    fontWeight: '600' 
  },
  progressFraction: { 
    color: Colors.light.subtitle, 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  progressBarBackground: { 
    height: 10, 
    backgroundColor: Colors.light.secondary, 
    borderRadius: 5, 
    overflow: 'hidden' 
  },
  progressBarFill: { 
    height: '100%', 
    backgroundColor: Colors.light.primary, 
    borderRadius: 5 
  },
  // Empty list styles
  emptyListContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: '25%',
  },
  emptyTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: Colors.light.text, 
    marginTop: 20
  },
  emptySubtitle: { 
    fontSize: 16, 
    color: Colors.light.subtitle, 
    textAlign: 'center', 
    marginTop: 8,
    maxWidth: '70%'
  },
  emptyButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 20,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Workout history card styles
  card: { 
    backgroundColor: Colors.light.card, 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 15, 
    overflow: 'hidden' 
  },
  cardHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  cardDate: { 
    color: Colors.light.subtitle, 
    fontSize: 13, 
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4, 
  },
  cardTitle: { 
    color: Colors.light.text, 
    fontSize: 22, 
    fontWeight: 'bold', 
    textTransform: 'capitalize' 
  },
  detailsContainer: { 
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.secondary,
    paddingTop: 10,
  },
  // Exercise details within a card
  exerciseLog: { 
    backgroundColor: Colors.light.secondary, 
    borderRadius: 10, 
    padding: 15, 
    marginTop: 10,
  },
  exerciseSummaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  exerciseName: { 
    color: Colors.light.text, 
    fontSize: 16, 
    fontWeight: 'bold',
    flexShrink: 1, // Allows text to wrap if long
  },
  exerciseSetCount: { 
    color: Colors.light.subtitle, 
    fontSize: 14, 
    fontWeight: '500'
  },
  setsContainer: { 
    marginTop: 15, 
    paddingTop: 10, 
    borderTopWidth: 1, 
    borderTopColor: Colors.light.input 
  },
  logRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 6,
  },
  rowText: { 
    color: Colors.light.text, 
    fontSize: 15,
    flex: 1,
  },
  rowLabel: {
    color: Colors.light.subtitle,
  },
});