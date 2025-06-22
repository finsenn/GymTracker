import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import Colors from '@/constants/Colors';
import { useWorkoutHistory, Workout, ExerciseLog } from '@/context/WorkoutContext';
import { FontAwesome } from '@expo/vector-icons';
import WorkoutHeatmap from '@/components/WorkoutHeatmap'; // We will use the heatmap component here

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Inner Accordion Item for a single exercise's details
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
                        <Text style={styles.headerText}>Reps</Text>
                        <Text style={styles.headerText}>RPE</Text>
                    </View>
                    {exercise.sets.map((set, setIndex) => (
                        <View key={setIndex} style={styles.logRow}>
                            <Text style={styles.rowText}>{setIndex + 1}</Text>
                            <Text style={styles.rowText}>{set.reps}</Text>
                            <Text style={styles.rowText}>{set.rpe}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    )
}

// Outer Accordion Item for a full workout day
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
                    <Text style={styles.cardDate}>{item.date}</Text>
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


export default function ActivitiesScreen() {
  const { history } = useWorkoutHistory();

  if (history.length === 0) {
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.title}>No Activity Yet</Text>
            <Text style={styles.subtitle}>Complete a workout to see your history.</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        renderItem={({ item }) => <WorkoutHistoryItem item={item} />}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.light.text, textAlign: 'center' },
  subtitle: { fontSize: 16, color: Colors.light.subtitle, textAlign: 'center', marginTop: 8 },
  card: { backgroundColor: Colors.light.card, padding: 20, borderRadius: 10, marginBottom: 15, overflow: 'hidden' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { color: Colors.light.subtitle, fontSize: 14, marginBottom: 5, textTransform: 'uppercase' },
  cardTitle: { color: Colors.light.text, fontSize: 22, fontWeight: 'bold', textTransform: 'capitalize' },
  detailsContainer: { marginTop: 10 },
  exerciseLog: { 
    backgroundColor: Colors.light.input,
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
  },
  exerciseSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: { color: Colors.light.text, fontSize: 18, fontWeight: 'bold' },
  exerciseSetCount: { color: Colors.light.subtitle, fontSize: 14 },
  setsContainer: {
      marginTop: 15,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: Colors.light.secondary,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  headerText: {
    color: Colors.light.subtitle,
    fontSize: 14,
    fontWeight: '600',
    width: '33%',
    textAlign: 'center',
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowText: {
    color: Colors.light.text,
    fontSize: 16,
    width: '33%',
    textAlign: 'center',
  },
});
