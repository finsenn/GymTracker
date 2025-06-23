import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, LayoutAnimation, UIManager, Platform, Pressable } from 'react-native';
import Colors from '@/constants/Colors';
import { useWorkoutHistory, Workout, ExerciseLog } from '@/context/WorkoutContext';
import { FontAwesome } from '@expo/vector-icons';
import WorkoutHeatmap from '@/components/WorkoutHeatmap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Reusable Components for this screen ---

const ExerciseDetailItem: React.FC<{ exercise: ExerciseLog }> = ({ exercise }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.exerciseLog}>
             <TouchableOpacity onPress={toggleExpand} style={styles.exerciseSummaryRow}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.exerciseSetCount}>{exercise.sets.length} {exercise.sets.length === 1 ? 'Set' : 'Sets'}</Text>
                    <FontAwesome name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.light.subtitle} style={{marginLeft: 10}}/>
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.setsContainer}>
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
    )
}

const WorkoutHistoryItem: React.FC<{ item: Workout }> = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const title = item.title || 'Untitled Workout';

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={toggleExpand} style={styles.summaryRow}>
                <View>
                    <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                    <Text style={styles.cardTitle}>{title.toUpperCase()}</Text>
                </View>
                <FontAwesome name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.light.subtitle} />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.detailsContainer}>
                    <WorkoutHeatmap exercises={item.exercises} />
                    {item.exercises.map((exercise, index) => (
                       <ExerciseDetailItem key={index} exercise={exercise} />
                    ))}
                </View>
            )}
        </View>
    );
};

// --- Main Activities Screen Component ---

export default function ActivitiesScreen() {
  const { history } = useWorkoutHistory();
  const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);

  useEffect(() => {
    const loadGoal = async () => {
      const storedGoal = await AsyncStorage.getItem('weeklyWorkoutGoal');
      if (storedGoal) {
        setWeeklyGoal(parseInt(storedGoal, 10));
      }
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

  // *** THE FIX IS HERE: Function to handle editing the goal ***
  const handleEditGoal = async () => {
    await AsyncStorage.removeItem('weeklyWorkoutGoal');
    setWeeklyGoal(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  
  const progress = weeklyGoal ? (workoutsThisWeek / weeklyGoal) * 100 : 0;

  if (weeklyGoal === null) {
    return (
      <View style={styles.commitmentContainer}>
        <View style={styles.commitmentCard}>
            <Text style={styles.commitmentTitle}>Set Your Weekly Commitment</Text>
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
    <View style={styles.container}>
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Weekly Progress</Text>
          {/* *** THE FIX IS HERE: Added an edit button *** */}
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

      <FlatList
        data={history}
        renderItem={({ item }) => <WorkoutHistoryItem item={item} />}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ListEmptyComponent={() => (
            <View style={styles.emptyListContainer}>
                <Text style={styles.title}>No Activity Yet</Text>
                <Text style={styles.subtitle}>Complete a workout to see your history.</Text>
            </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  commitmentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background, padding: 20 },
  commitmentCard: { backgroundColor: Colors.light.card, padding: 25, borderRadius: 15, width: '100%', alignItems: 'center' },
  commitmentTitle: { color: Colors.light.text, fontSize: 22, fontWeight: 'bold' },
  commitmentSubtitle: { color: Colors.light.subtitle, fontSize: 16, marginTop: 8, marginBottom: 25, textAlign: 'center' },
  goalButtonsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  goalButton: { backgroundColor: Colors.light.secondary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  goalButtonText: { color: Colors.light.text, fontSize: 20, fontWeight: 'bold' },
  progressSection: { padding: 20, paddingTop: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressTitle: { color: Colors.light.text, fontSize: 18, fontWeight: '600' },
  progressFraction: { color: Colors.light.subtitle, fontSize: 16, fontWeight: 'bold' },
  progressBarBackground: { height: 12, backgroundColor: Colors.light.input, borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.light.primary, borderRadius: 6 },
  emptyListContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: '30%' },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.light.text, textAlign: 'center' },
  subtitle: { fontSize: 16, color: Colors.light.subtitle, textAlign: 'center', marginTop: 8 },
  card: { backgroundColor: Colors.light.card, padding: 20, borderRadius: 10, marginBottom: 15, overflow: 'hidden' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { color: Colors.light.subtitle, fontSize: 14, marginBottom: 5, textTransform: 'uppercase' },
  cardTitle: { color: Colors.light.text, fontSize: 22, fontWeight: 'bold', textTransform: 'capitalize' },
  detailsContainer: { marginTop: 10 },
  exerciseLog: { backgroundColor: Colors.light.input, borderRadius: 8, padding: 15, marginTop: 15 },
  exerciseSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exerciseName: { color: Colors.light.text, fontSize: 18, fontWeight: 'bold' },
  exerciseSetCount: { color: Colors.light.subtitle, fontSize: 14 },
  setsContainer: { marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.light.secondary },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  headerText: { color: Colors.light.subtitle, fontSize: 14, fontWeight: '600', width: '25%', textAlign: 'center' },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowText: { color: Colors.light.text, fontSize: 16, width: '25%', textAlign: 'center' },
});
